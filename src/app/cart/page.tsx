"use client";

import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-black text-[var(--ink)] mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white/60 border border-[var(--line)] rounded-2xl">
            <p className="text-lg font-semibold text-[var(--ink)]">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-[var(--ink)] text-white font-bold"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="flex items-center gap-4 bg-white/80 border border-[var(--line)] rounded-2xl p-4"
                >
                  <div className="relative w-16 h-16 rounded-xl bg-[var(--line)] overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-2xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--ink)]">{item.name}</h3>
                    <p className="text-sm text-[var(--muted)]">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-[var(--line)] font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-[var(--line)] font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-20 text-right font-bold text-[var(--ink)]">
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    onClick={() => removeItem(item.menu_item_id)}
                    className="text-[var(--muted)] hover:text-red-600"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between bg-[var(--ink)] text-white rounded-2xl p-5">
              <span className="font-semibold text-lg">Subtotal</span>
              <span className="font-black text-2xl">₹{subtotal}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-5 block text-center w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold text-lg hover:bg-[var(--accent-dark)] transition-colors"
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </main>
    </>
  );
}
