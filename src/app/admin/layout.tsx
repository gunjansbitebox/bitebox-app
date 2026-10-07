"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/menu", label: "Menu Items" },
    { href: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--cream)]">
      <header className="bg-[var(--ink)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2">
          <Link href="/admin" className="flex items-center gap-3 font-extrabold">
            <span className="relative w-[90px] h-[90px] rounded-lg overflow-hidden flex-shrink-0">
              <Image src="/assets/logo-dark.png" alt="Gunjan's BiteBox logo" fill className="object-contain" />
            </span>
            Gunjan&apos;s BiteBox · Admin
          </Link>
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold ${
                  pathname === link.href ? "text-[var(--gold)]" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button onClick={handleSignOut} className="text-sm font-semibold text-white/80 hover:text-white">
              Sign Out
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
