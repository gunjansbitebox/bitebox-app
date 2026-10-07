"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compression";
import type { Category, MenuItem } from "@/lib/types";

export function MenuManager({
  categories,
  initialItems,
}: {
  categories: Category[];
  initialItems: MenuItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  function handleSaved(item: MenuItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [item, ...prev];
    });
    setShowForm(false);
    setEditingItem(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }

  async function toggleAvailability(item: MenuItem) {
    const supabase = createClient();
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);
    if (!error) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
      );
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-sm"
        >
          + Add Menu Item
        </button>
      </div>

      {showForm && (
        <ItemForm
          categories={categories}
          item={editingItem}
          onSaved={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden">
            <div className="relative w-full h-32 bg-[var(--line)]">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-3xl">🍽️</div>
              )}
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/50 grid place-items-center text-white text-xs font-bold">
                  UNAVAILABLE
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--ink)]">{item.name}</h3>
                <span className="font-bold text-sm">₹{item.price}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowForm(true);
                  }}
                  className="flex-1 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleAvailability(item)}
                  className="flex-1 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold"
                >
                  {item.is_available ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemForm({
  categories,
  item,
  onSaved,
  onCancel,
}: {
  categories: Category[];
  item: MenuItem | null;
  onSaved: (item: MenuItem) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(item?.category_id ?? categories[0]?.id ?? "");
  const [isVeg, setIsVeg] = useState(item?.is_veg ?? true);
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const optimizedFile = await compressImage(file);

      const supabase = createClient();
      // Compressed images are converted to JPEG for best size/quality balance
      const fileExt = optimizedFile.type === "image/jpeg" ? "jpg" : file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, optimizedFile, {
          contentType: optimizedFile.type,
        });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image processing failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !price) {
      setError("Name and price are required.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      category_id: categoryId || null,
      is_veg: isVeg,
      image_url: imageUrl || null,
      updated_at: new Date().toISOString(),
    };

    if (item) {
      const { data, error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", item.id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      onSaved(data as MenuItem);
    } else {
      const { data, error } = await supabase
        .from("menu_items")
        .insert({ ...payload, is_available: true })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      onSaved(data as MenuItem);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[var(--line)] rounded-2xl p-5 space-y-4"
    >
      <h2 className="font-bold text-[var(--ink)]">{item ? "Edit Item" : "New Item"}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--line)]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--line)]"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-[var(--line)]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--line)]"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Type</label>
          <div className="flex gap-3 pt-2">
            <label className="flex items-center gap-1.5 text-sm">
              <input type="radio" checked={isVeg} onChange={() => setIsVeg(true)} /> Veg
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="radio" checked={!isVeg} onChange={() => setIsVeg(false)} /> Non-Veg
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Image</label>
        {imageUrl && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden mb-2 bg-[var(--line)]">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-xs text-[var(--muted)] mt-1">Uploading...</p>}
      </div>

      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold text-sm disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-[var(--line)] font-bold text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
