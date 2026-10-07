"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/lib/cart-context";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function placeOrder(paymentStatus: "pending" | "paid", razorpayIds?: { orderId: string; paymentId: string }) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        razorpay_order_id: razorpayIds?.orderId,
        razorpay_payment_id: razorpayIds?.paymentId,
        notes,
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to place order");

    clearCart();
    router.push(`/order-confirmation?orderId=${data.orderId}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "cod") {
        await placeOrder("pending");
      } else {
        // Online payment via Razorpay
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: subtotal }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Online payment is unavailable right now. Please choose Cash on Delivery.");
          setLoading(false);
          return;
        }

        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: "Gunjan's BiteBox",
          description: "Food order payment",
          order_id: data.orderId,
          handler: async function (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) {
            try {
              const verifyRes = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();

              if (verifyData.verified) {
                await placeOrder("paid", {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                });
              } else {
                setError("Payment verification failed. Please contact us.");
                setLoading(false);
              }
            } catch {
              setError("Something went wrong after payment. Please contact us.");
              setLoading(false);
            }
          },
          prefill: { name, contact: phone },
          theme: { color: "#ef5b2a" },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        });
        rzp.open();
        return; // don't setLoading(false) here; handled in callbacks
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      if (paymentMethod === "cod") setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <SiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-black text-[var(--ink)] mb-6">Checkout</h1>

        {items.length === 0 ? (
          <p className="text-[var(--muted)]">Your cart is empty.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--line)] bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--line)] bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Delivery Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--line)] bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--line)] bg-white"
                placeholder="E.g. less spicy, ring doorbell, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-2">Payment Method *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`py-3 rounded-xl border font-semibold ${
                    paymentMethod === "cod"
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-dark)]"
                      : "border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`py-3 rounded-xl border font-semibold ${
                    paymentMethod === "online"
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-dark)]"
                      : "border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  Pay Online
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-[var(--ink)] text-white rounded-2xl p-5">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-black text-2xl">₹{subtotal}</span>
            </div>

            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold text-lg hover:bg-[var(--accent-dark)] transition-colors disabled:opacity-60"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
