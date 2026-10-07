"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import type { Category, MenuItem } from "@/lib/types";

export function MenuList({
  categories,
  menuItems,
}: {
  categories: Category[];
  menuItems: MenuItem[];
}) {
  const { addItem } = useCart();

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--muted)]">
        <p className="text-lg font-semibold">Menu coming soon!</p>
        <p className="mt-1">We&apos;re getting things ready. Please check back shortly.</p>
      </div>
    );
  }

  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: menuItems.filter((item) => item.category_id === cat.id),
    }))
    .filter((group) => group.items.length > 0);

  const uncategorized = menuItems.filter((item) => !item.category_id);

  return (
    <div className="space-y-12">
      {grouped.map(({ category, items }) => (
        <section key={category.id}>
          <h2 className="text-2xl font-extrabold text-[var(--ink)] mb-4">{category.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={addItem} />
            ))}
          </div>
        </section>
      ))}

      {uncategorized.length > 0 && (
        <section>
          <h2 className="text-2xl font-extrabold text-[var(--ink)] mb-4">Other Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {uncategorized.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={addItem} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MenuCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: (item: { menu_item_id: string; name: string; price: number; image_url: string | null }) => void;
}) {
  return (
    <div className="bg-white/80 border border-[var(--line)] rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="relative w-full h-40 bg-[var(--line)]">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-4xl">🍽️</div>
        )}
        <span
          className={`absolute top-2 left-2 w-5 h-5 rounded border-2 grid place-items-center ${
            item.is_veg ? "border-green-600" : "border-red-600"
          } bg-white`}
          title={item.is_veg ? "Veg" : "Non-Veg"}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`}
          />
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-[var(--ink)]">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-[var(--muted)] line-clamp-2">{item.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-extrabold text-[var(--ink)]">₹{item.price}</span>
          <button
            onClick={() =>
              onAdd({
                menu_item_id: item.id,
                name: item.name,
                price: item.price,
                image_url: item.image_url,
              })
            }
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:bg-[var(--accent-dark)] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
