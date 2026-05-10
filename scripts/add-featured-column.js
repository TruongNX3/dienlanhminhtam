const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhtimloefjvvdsfejyce.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGltbG9lZmp2dmRzZmVqeWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4NjA1MSwiZXhwIjoyMDkzOTYyMDUxfQ.UbqzlVRe57uPPwhlZWKeGzmeIZFOQiSDkxW2suAqboU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addMissingColumns() {
  console.log('--- Đang chuẩn bị SQL thêm các cột còn thiếu cho bảng products và categories ---');

  const sql = `
    -- 1. Thêm cột cho bảng products
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false NOT NULL;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'admin';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT 'admin';

    -- 2. Thêm cột cho bảng categories
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true NOT NULL;
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'admin';
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT 'admin';

    -- 3. Làm mới cache schema
    NOTIFY pgrst, 'reload schema';
  `;

  console.log('HÃY COPY ĐOẠN MÃ DƯỚI ĐÂY VÀ DÁN VÀO SQL EDITOR TRÊN SUPABASE DASHBOARD:');
  console.log('-------------------------------------------------------------------------');
  console.log(sql);
  console.log('-------------------------------------------------------------------------');
  console.log('\nSau khi chạy SQL xong, hãy thử deploy lại trên Vercel.');
}

addMissingColumns();
