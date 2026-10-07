import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type OrderItemInput = {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_address,
      payment_method,
      payment_status,
      razorpay_order_id,
      razorpay_payment_id,
      notes,
      items,
    }: {
      customer_name: string;
      customer_phone: string;
      customer_address: string;
      payment_method: "cod" | "online";
      payment_status?: "pending" | "paid";
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      notes?: string;
      items: OrderItemInput[];
    } = body;

    if (!customer_name?.trim() || !customer_phone?.trim() || !customer_address?.trim()) {
      return NextResponse.json({ error: "Missing required customer details" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (payment_method !== "cod" && payment_method !== "online") {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    if (payment_method === "online" && payment_status !== "paid") {
      return NextResponse.json({ error: "Online orders require a verified payment" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Re-fetch real prices from the database to prevent client-side price tampering
    const menuItemIds = items.map((i) => i.menu_item_id);
    const { data: dbItems, error: dbItemsError } = await supabase
      .from("menu_items")
      .select("id, name, price, is_available")
      .in("id", menuItemIds);

    if (dbItemsError || !dbItems) {
      return NextResponse.json({ error: "Failed to verify menu items" }, { status: 500 });
    }

    const dbItemsMap = new Map(dbItems.map((i) => [i.id, i]));

    const verifiedItems: { menu_item_id: string; name: string; price: number; quantity: number }[] = [];

    for (const item of items) {
      const dbItem = dbItemsMap.get(item.menu_item_id);
      if (!dbItem) {
        return NextResponse.json({ error: `Item not found: ${item.name}` }, { status: 400 });
      }
      if (!dbItem.is_available) {
        return NextResponse.json({ error: `${dbItem.name} is currently unavailable` }, { status: 400 });
      }
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      verifiedItems.push({
        menu_item_id: dbItem.id,
        name: dbItem.name,
        price: Number(dbItem.price),
        quantity,
      });
    }

    const subtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal; // extend here later for delivery fee/taxes if needed

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_address: customer_address.trim(),
        payment_method,
        payment_status: payment_status ?? "pending",
        razorpay_order_id: razorpay_order_id ?? null,
        razorpay_payment_id: razorpay_payment_id ?? null,
        subtotal,
        total,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderItemsPayload = verifiedItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name: item.name,
      item_price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json({ error: "Failed to save order items" }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
