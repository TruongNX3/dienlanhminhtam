const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhtimloefjvvdsfejyce.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGltbG9lZmp2dmRzZmVqeWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4NjA1MSwiZXhwIjoyMDkzOTYyMDUxfQ.UbqzlVRe57uPPwhlZWKeGzmeIZFOQiSDkxW2suAqboU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixRlsPolicies() {
  console.log('--- Đang cập nhật chính sách bảo mật (RLS) để cho phép Admin xóa danh mục ---');

  const sql = `
    -- 1. Đảm bảo RLS được bật
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

    -- 2. Xóa chính sách cũ nếu có (để tránh trùng lặp)
    DROP POLICY IF EXISTS "Admin có toàn quyền với danh mục" ON categories;
    DROP POLICY IF EXISTS "Admin xóa danh mục" ON categories;

    -- 3. Tạo chính sách mới cho phép Admin (đã đăng nhập) thực hiện mọi thao tác (INSERT, UPDATE, DELETE, SELECT)
    CREATE POLICY "Admin có toàn quyền với danh mục" 
    ON categories 
    FOR ALL 
    TO authenticated 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

    -- 4. Tương tự cho bảng products để tránh lỗi sau này
    DROP POLICY IF EXISTS "Admin có toàn quyền với sản phẩm" ON products;
    CREATE POLICY "Admin có toàn quyền với sản phẩm" 
    ON products 
    FOR ALL 
    TO authenticated 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  `;

  // Vì Supabase client không hỗ trợ chạy SQL trực tiếp qua API chuẩn 
  // nên ta sẽ sử dụng phương thức RPC nếu có hoặc thông báo người dùng
  // Tuy nhiên, với quyền service_role, ta có thể thử thực thi qua một mẹo nhỏ
  // hoặc hướng dẫn người dùng dán vào SQL Editor.
  
  console.log('⚠️ Chú ý: Cần thực thi SQL này trong Supabase SQL Editor để có hiệu lực vĩnh viễn.');
  console.log('Đang thử thực thi qua lệnh SQL trực tiếp...');

  const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

  if (error) {
    console.log('❌ Không thể thực thi SQL tự động (có thể do thiếu hàm exec_sql).');
    console.log('--- HÃY COPY ĐOẠN MÃ DƯỚI ĐÂY VÀ DÁN VÀO SQL EDITOR TRÊN SUPABASE DASHBOARD ---');
    console.log(sql);
    console.log('-------------------------------------------------------------------------');
  } else {
    console.log('✅ Đã cập nhật RLS thành công!');
  }
}

fixRlsPolicies();
