const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhtimloefjvvdsfejyce.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGltbG9lZmp2dmRzZmVqeWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4NjA1MSwiZXhwIjoyMDkzOTYyMDUxfQ.UbqzlVRe57uPPwhlZWKeGzmeIZFOQiSDkxW2suAqboU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifySettingsTable() {
  console.log('--- Kiểm tra bảng settings ---');
  
  // 1. Thử lấy dữ liệu từ bảng settings
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ LỖI TRUY VẤN BẢNG SETTINGS:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('👉 KẾT LUẬN: Bảng "settings" CHƯA TỒN TẠI.');
    }
  } else {
    console.log('✅ Bảng "settings" đã tồn tại.');
    console.log('Dữ liệu hiện tại:', data);
  }

  // 2. Thử insert mẫu một bản ghi (sử dụng service_role để bypass RLS)
  console.log('\n--- Thử ghi dữ liệu mẫu ---');
  const { error: upsertError } = await supabase
    .from('settings')
    .upsert({ 
        id: 'store_info', 
        value: { test: true }, 
        updated_by: 'system_verify' 
    });

  if (upsertError) {
    console.error('❌ LỖI KHI GHI (UPSERT):', upsertError.message);
  } else {
    console.log('🚀 GHI DỮ LIỆU THÀNH CÔNG!');
  }
}

verifySettingsTable();
