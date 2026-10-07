"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[var(--cream)]/90 backdrop-blur border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-[var(--ink)]">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] text-white grid place-items-center font-black">
            B
          </span>
          Gunjan&apos;s BiteBox
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--ink)] text-white font-semibold text-sm"
          >
            Cart
            {itemCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-[var(--accent)] text-xs font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
