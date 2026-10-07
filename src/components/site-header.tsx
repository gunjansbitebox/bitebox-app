"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[var(--cream)]/90 backdrop-blur border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-lg text-[var(--ink)]">
          <span className="relative w-40 h-40 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/assets/logo.png" alt="Gunjan's BiteBox logo" fill className="object-contain" priority />
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
