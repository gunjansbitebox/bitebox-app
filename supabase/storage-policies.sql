-- Storage policies for menu-images bucket
-- Run this in Supabase Dashboard > SQL Editor > New Query

-- Allow public read access to menu images (so customers can see photos)
create policy "Public can view menu images"
on storage.objects for select
using (bucket_id = 'menu-images');

-- Allow authenticated users (admin) to upload menu images
create policy "Admins can upload menu images"
on storage.objects for insert
with check (bucket_id = 'menu-images' and auth.role() = 'authenticated');

-- Allow authenticated users (admin) to update menu images
create policy "Admins can update menu images"
on storage.objects for update
using (bucket_id = 'menu-images' and auth.role() = 'authenticated');

-- Allow authenticated users (admin) to delete menu images
create policy "Admins can delete menu images"
on storage.objects for delete
using (bucket_id = 'menu-images' and auth.role() = 'authenticated');
