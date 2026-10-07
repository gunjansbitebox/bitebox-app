import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("order_status", ["placed", "confirmed", "preparing"]);

  const { count: menuCount } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true });

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-black text-[var(--ink)] mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Orders" value={totalOrders ?? 0} />
        <StatCard label="Active Orders" value={pendingOrders ?? 0} />
        <StatCard label="Menu Items" value={menuCount ?? 0} />
      </div>

      <div className="bg-white border border-[var(--line)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[var(--ink)]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-[var(--accent-dark)]">
            View All →
          </Link>
        </div>
        {!recentOrders || recentOrders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b border-[var(--line)] last:border-0 text-sm"
              >
                <span className="font-medium">{order.customer_name}</span>
                <span className="text-[var(--muted)]">₹{order.total}</span>
                <StatusBadge status={order.order_status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="text-3xl font-black text-[var(--ink)] mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    placed: "bg-blue-100 text-blue-700",
    confirmed: "bg-indigo-100 text-indigo-700",
    preparing: "bg-amber-100 text-amber-700",
    out_for_delivery: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${colors[status] ?? "bg-gray-100"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
