const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhtimloefjvvdsfejyce.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGltbG9lZmp2dmRzZmVqeWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4NjA1MSwiZXhwIjoyMDkzOTYyMDUxfQ.UbqzlVRe57uPPwhlZWKeGzmeIZFOQiSDkxW2suAqboU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixStoragePolicies() {
  console.log('--- Đang cập nhật chính sách bảo mật cho STORAGE ---');

  const sql = `
    -- 1. Cho phép người dùng đã đăng nhập (authenticated) tải ảnh lên bucket 'products'
    CREATE POLICY "Cho phép Admin tải lên ảnh" 
    ON storage.objects 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'products');

    -- 2. Cho phép người dùng đã đăng nhập cập nhật ảnh
    CREATE POLICY "Cho phép Admin cập nhật ảnh" 
    ON storage.objects 
    FOR UPDATE 
    TO authenticated 
    USING (bucket_id = 'products');

    -- 3. Cho phép người dùng đã đăng nhập xóa ảnh
    CREATE POLICY "Cho phép Admin xóa ảnh" 
    ON storage.objects 
    FOR DELETE 
    TO authenticated 
    USING (bucket_id = 'products');

    -- 4. Cho phép mọi người xem ảnh (SELECT)
    CREATE POLICY "Cho phép mọi người xem ảnh" 
    ON storage.objects 
    FOR SELECT 
    TO public 
    USING (bucket_id = 'products');
  `;

  console.log('HÃY COPY ĐOẠN MÃ DƯỚI ĐÂY VÀ DÁN VÀO SQL EDITOR TRÊN SUPABASE DASHBOARD:');
  console.log('-------------------------------------------------------------------------');
  console.log(sql);
  console.log('-------------------------------------------------------------------------');
}

fixStoragePolicies();
