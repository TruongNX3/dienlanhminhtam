const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhtimloefjvvdsfejyce.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGltbG9lZmp2dmRzZmVqeWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4NjA1MSwiZXhwIjoyMDkzOTYyMDUxfQ.UbqzlVRe57uPPwhlZWKeGzmeIZFOQiSDkxW2suAqboU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addStatusColumn() {
  console.log('--- Đang thêm cột status cho bảng categories ---');

  const sql = `
    -- 1. Thêm cột status vào bảng categories nếu chưa có
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true NOT NULL;

    -- 2. Cập nhật các chính sách RLS để hỗ trợ lọc theo status ở trang chủ
    
    -- Cho phép mọi người chỉ xem những danh mục có status = true
    DROP POLICY IF EXISTS "Cho phép xem danh mục công khai" ON categories;
    CREATE POLICY "Cho phép xem danh mục công khai" ON categories
        FOR SELECT TO public USING (status = true);

    -- Admin vẫn xem được tất cả
    DROP POLICY IF EXISTS "Admin có toàn quyền với danh mục" ON categories;
    CREATE POLICY "Admin có toàn quyền với danh mục" ON categories
        FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Cập nhật chính sách cho Products để lọc theo status (nếu chưa có)
    DROP POLICY IF EXISTS "Cho phép xem sản phẩm công khai" ON products;
    CREATE POLICY "Cho phép xem sản phẩm công khai" ON products
        FOR SELECT TO public USING (status = true);
  `;

  console.log('HÃY COPY ĐOẠN MÃ DƯỚI ĐÂY VÀ DÁN VÀO SQL EDITOR TRÊN SUPABASE DASHBOARD:');
  console.log('-------------------------------------------------------------------------');
  console.log(sql);
  console.log('-------------------------------------------------------------------------');
}

addStatusColumn();
