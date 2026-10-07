-- Gunjan's BiteBox - Database Schema
-- Run this in Supabase Dashboard > SQL Editor > New Query

-- =========================
-- MENU CATEGORIES
-- =========================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

-- =========================
-- MENU ITEMS
-- =========================
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_available boolean default true,
  is_veg boolean default true,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- ORDERS
-- =========================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  payment_method text not null check (payment_method in ('cod', 'online')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  order_status text not null default 'placed' check (order_status in ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- ORDER ITEMS (line items per order)
-- =========================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  item_name text not null, -- snapshot of name at order time
  item_price numeric(10,2) not null, -- snapshot of price at order time
  quantity int not null default 1,
  created_at timestamptz default now()
);

-- =========================
-- INDEXES
-- =========================
create index if not exists idx_menu_items_category on menu_items(category_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_orders_status on orders(order_status);
create index if not exists idx_orders_created on orders(created_at desc);

-- =========================
-- ROW LEVEL SECURITY
-- =========================
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public can VIEW categories & available menu items (for customer-facing menu)
create policy "Public can view categories" on categories
  for select using (true);

create policy "Public can view available menu items" on menu_items
  for select using (true);

-- Public can INSERT orders (placing an order) and their own order items
create policy "Public can create orders" on orders
  for insert with check (true);

create policy "Public can create order items" on order_items
  for insert with check (true);

-- Only authenticated users (admin) can view/manage orders
create policy "Admins can view all orders" on orders
  for select using (auth.role() = 'authenticated');

create policy "Admins can update orders" on orders
  for update using (auth.role() = 'authenticated');

create policy "Admins can view all order items" on order_items
  for select using (auth.role() = 'authenticated');

-- Only authenticated users (admin) can manage menu & categories
create policy "Admins can insert categories" on categories
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can update categories" on categories
  for update using (auth.role() = 'authenticated');

create policy "Admins can delete categories" on categories
  for delete using (auth.role() = 'authenticated');

create policy "Admins can insert menu items" on menu_items
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can update menu items" on menu_items
  for update using (auth.role() = 'authenticated');

create policy "Admins can delete menu items" on menu_items
  for delete using (auth.role() = 'authenticated');

-- =========================
-- SEED DATA (sample categories - edit/remove as needed)
-- =========================
insert into categories (name, display_order) values
  ('Starters', 1),
  ('Main Course', 2),
  ('Snacks', 3),
  ('Beverages', 4)
on conflict do nothing;
