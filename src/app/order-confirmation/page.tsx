import { createAdminClient } from "@/lib/supabase/admin";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import type { OrderItem } from "@/lib/types";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const supabase = createAdminClient();

  let orderItems: OrderItem[] = [];
  let total = 0;

  if (orderId) {
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    orderItems = (items as OrderItem[]) ?? [];
    total = orderItems.reduce((sum, i) => sum + i.item_price * i.quantity, 0);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-black text-[var(--ink)] mb-2">Order Placed!</h1>
        <p className="text-[var(--muted)] mb-8">
          Thank you! We&apos;ve received your order and will start preparing it shortly.
        </p>

        {orderId && (
          <div className="bg-white/80 border border-[var(--line)] rounded-2xl p-5 text-left mb-6">
            <p className="text-sm text-[var(--muted)] mb-3">
              Order ID: <span className="font-mono font-semibold">{orderId.slice(0, 8)}</span>
            </p>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.item_name} × {item.quantity}
                  </span>
                  <span className="font-semibold">₹{item.item_price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-[var(--line)] font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-[var(--ink)] text-white font-bold"
        >
          Back to Menu
        </Link>
      </main>
    </>
  );
}
