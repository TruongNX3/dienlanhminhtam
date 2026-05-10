const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhtimloefjvvdsfejyce.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGltbG9lZmp2dmRzZmVqeWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4NjA1MSwiZXhwIjoyMDkzOTYyMDUxfQ.UbqzlVRe57uPPwhlZWKeGzmeIZFOQiSDkxW2suAqboU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addFeaturedColumn() {
  console.log('--- Đang chuẩn bị SQL thêm cột is_featured cho bảng products ---');

  const sql = `
    -- 1. Thêm cột is_featured vào bảng products nếu chưa có
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false NOT NULL;

    -- 2. Cập nhật chính sách RLS cho Products (nếu cần)
    -- Thường thì SELECT đã cho phép xem mọi cột, nên không cần đổi chính sách SELECT công khai
  `;

  console.log('HÃY COPY ĐOẠN MÃ DƯỚI ĐÂY VÀ DÁN VÀO SQL EDITOR TRÊN SUPABASE DASHBOARD:');
  console.log('-------------------------------------------------------------------------');
  console.log(sql);
  console.log('-------------------------------------------------------------------------');
  console.log('\nSau khi chạy SQL xong, bạn có thể vào Admin > Sản phẩm để đánh dấu các sản phẩm nổi bật.');
}

addFeaturedColumn();
