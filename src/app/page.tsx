import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { MenuList } from "@/components/menu-list";
import type { Category, MenuItem } from "@/lib/types";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("display_order", { ascending: true });

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
            Serving Indore
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-[var(--ink)]">
            Our Menu
          </h1>
          <p className="mt-2 text-[var(--muted)] max-w-xl mx-auto">
            Fresh, delicious food made with care. Order online for delivery across Indore.
          </p>
        </div>

        <MenuList
          categories={(categories as Category[]) ?? []}
          menuItems={(menuItems as MenuItem[]) ?? []}
        />
      </main>
      <footer className="text-center text-sm text-[var(--muted)] py-8">
        © 2026 Gunjan&apos;s BiteBox · Serving Indore
      </footer>
    </>
  );
}
