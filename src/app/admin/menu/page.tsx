import { createClient } from "@/lib/supabase/server";
import { MenuManager } from "@/components/admin/menu-manager";

export const revalidate = 0;

export default async function AdminMenuPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-black text-[var(--ink)] mb-6">Menu Items</h1>
      <MenuManager categories={categories ?? []} initialItems={menuItems ?? []} />
    </div>
  );
}
