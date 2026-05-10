const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhtimloefjvvdsfejyce.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGltbG9lZmp2dmRzZmVqeWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4NjA1MSwiZXhwIjoyMDkzOTYyMDUxfQ.UbqzlVRe57uPPwhlZWKeGzmeIZFOQiSDkxW2suAqboU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createSettingsTable() {
  console.log('--- Đang tạo bảng settings và thiết lập dữ liệu mặc định ---');

  const sql = `
    -- 1. Tạo bảng settings
    CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_by TEXT DEFAULT 'admin' NOT NULL
    );

    -- 2. Bật RLS
    ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

    -- 3. Chính sách bảo mật
    DROP POLICY IF EXISTS "Cho phép xem cấu hình công khai" ON settings;
    CREATE POLICY "Cho phép xem cấu hình công khai" ON settings
        FOR SELECT TO public USING (true);

    DROP POLICY IF EXISTS "Admin quản lý cấu hình" ON settings;
    CREATE POLICY "Admin quản lý cấu hình" ON settings
        FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 4. Thêm dữ liệu mặc định
    INSERT INTO settings (id, value)
    VALUES ('store_info', '{
        "name": "Điện Lạnh Minh Tâm",
        "address": "Lô 18-19, KĐT Dệt May, Nam Định, Ninh Bình",
        "phone": "0817.751.946",
        "email": "contact@dienlanhminhtam.com",
        "facebook": "https://www.facebook.com/profile.php?id=100070786704917",
        "about": "Chuyên mua bán, sửa chữa máy lạnh, tủ lạnh, máy giặt uy tín tại Ninh Bình.",
        "warranty_policy": "Bảo hành chính hãng 12-24 tháng tùy dòng sản phẩm.",
        "zalo": "0817.751.946",
        "working_hours": "7h00 - 20h00 hàng ngày"
    }')
    ON CONFLICT (id) DO NOTHING;

    -- 5. Trigger cập nhật thời gian
    DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
    CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  `;

  console.log('HÃY COPY ĐOẠN MÃ DƯỚI ĐÂY VÀ DÁN VÀO SQL EDITOR TRÊN SUPABASE DASHBOARD:');
  console.log('-------------------------------------------------------------------------');
  console.log(sql);
  console.log('-------------------------------------------------------------------------');
}

createSettingsTable();
