import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/admin/orders-table";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-black text-[var(--ink)] mb-6">Orders</h1>
      <OrdersTable initialOrders={orders ?? []} />
    </div>
  );
}
