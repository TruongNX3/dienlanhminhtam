
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Lỗi: Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong file .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newCategories = [
  { name: 'Máy lọc nước', slug: 'may-loc-nuoc', icon: '💧' },
  { name: 'Máy sấy quần áo', slug: 'may-say', icon: '👕' },
  { name: 'Máy nước nóng', slug: 'may-nuoc-nong', icon: '🔥' },
  { name: 'Tủ đông', slug: 'tu-dong', icon: '🧊' },
  { name: 'Linh kiện', slug: 'linh-kien', icon: '🔧' }
];

async function seedCategories() {
  console.log('Đang thêm danh mục mới vào Supabase Cloud...');
  
  for (const category of newCategories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(category, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`Lỗi khi thêm ${category.name}:`, error.message);
    } else {
      console.log(`✅ Đã thêm/cập nhật: ${category.name}`);
    }
  }

  console.log('\nHoàn tất cập nhật dữ liệu!');
}

seedCategories();
