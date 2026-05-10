import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Kiểm tra URL hợp lệ (phải bắt đầu bằng http)
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http');

if (!isValidUrl || !supabaseAnonKey) {
  console.warn('CẢNH BÁO: Cấu hình Supabase không hợp lệ hoặc bị thiếu.');
}

// Khởi tạo client với URL an toàn để không làm hỏng quá trình Build
export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder-project.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
