"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderWithItems, OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export function OrdersTable({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o))
      );
    }
  }

  if (orders.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div>
              <p className="font-bold text-[var(--ink)]">{order.customer_name}</p>
              <p className="text-sm text-[var(--muted)]">
                {order.customer_phone} · {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-[var(--ink)]">₹{order.total}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100">
                {order.payment_method === "cod" ? "COD" : "Online"} · {order.payment_status}
              </span>
            </div>
          </button>

          {expandedId === order.id && (
            <div className="border-t border-[var(--line)] p-4 bg-[var(--cream)]/50">
              <p className="text-sm text-[var(--muted)] mb-3">{order.customer_address}</p>
              {order.notes && (
                <p className="text-sm text-[var(--muted)] mb-3 italic">Note: {order.notes}</p>
              )}
              <div className="space-y-1 mb-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.item_name} × {item.quantity}
                    </span>
                    <span className="font-semibold">₹{item.item_price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Order Status
                </label>
                <select
                  value={order.order_status}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="px-3 py-2 rounded-lg border border-[var(--line)] text-sm font-semibold"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
