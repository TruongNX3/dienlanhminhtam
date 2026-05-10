
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const categoryTemplates = {
  'may-lanh': {
    names: ['Daikin Inverter', 'Panasonic Nanoe-G', 'LG Dual Inverter', 'Toshiba Hybrid', 'Samsung Wind-Free', 'Sharp J-Tech', 'Mitsubishi Heavy', 'Casper Eco', 'Gree Inverter', 'Aqua Smart'],
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=800',
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=800'
    ],
    specs: { công_suất: '1.5 HP', tiết_kiệm_điện: 'Inverter', xuất_xứ: 'Thái Lan' }
  },
  'tu-lanh': {
    names: ['Hitachi Multi Door', 'Samsung Side-by-Side', 'Mitsubishi Electric', 'Panasonic Prime Fresh', 'Sharp J-Tech Inverter', 'Toshiba Inverter', 'LG Linear Cooling', 'Electrolux NutriFresh', 'Aqua Inverter', 'Beko Inverter'],
    images: [
      'https://images.unsplash.com/photo-1571175432230-01c288a69984?q=80&w=800',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800'
    ],
    specs: { dung_tích: '350 Lít', kiểu_tủ: 'Ngăn đá trên', tính_năng: 'Lấy nước ngoài' }
  },
  'may-giat': {
    names: ['LG AI DD', 'Samsung AddWash', 'Panasonic TD Inverter', 'Toshiba GreatWaves', 'Electrolux UltimateCare', 'Aqua Inverter', 'Sharp J-Tech', 'Beko Inverter', 'Candy Smart', 'TCL Inverter'],
    images: [
      'https://images.unsplash.com/photo-1545173153-93625751b32a?q=80&w=800',
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=800'
    ],
    specs: { khối_lượng: '9 Kg', lồng_giặt: 'Lồng ngang', tính_năng: 'Giặt hơi nước' }
  },
  'gia-dung': {
    names: ['Nồi cơm điện Cuckoo', 'Lò vi sóng Sharp', 'Máy xay sinh tố Philips', 'Nồi chiên không dầu Lock&Lock', 'Bình đun nước Sunhouse', 'Bếp hồng ngoại Sanaky', 'Quạt trần Panasonic', 'Máy lọc không khí Xiaomi', 'Bàn ủi hơi nước Tefal', 'Máy hút bụi Dyson'],
    images: [
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=800'
    ],
    specs: { chất_liệu: 'Inox 304', bảo_hành: '12 tháng', điện_áp: '220V' }
  },
  'tivi-loa': {
    names: ['Sony Bravia 4K', 'Samsung QLED', 'LG OLED', 'TCL Android TV', 'Casper Smart TV', 'Loa Marshall Stanmore', 'Dàn âm thanh Sony', 'Loa kéo Sansui', 'Loa Bluetooth JBL', 'Soundbar Samsung'],
    images: [
      'https://images.unsplash.com/photo-1593359677759-543733fbd9c3?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ],
    specs: { độ_phân_giải: '4K Ultra HD', hệ_điều_hành: 'Google TV', kết_nối: 'Wifi, Bluetooth' }
  },
  'may-loc-nuoc': {
    names: ['Kangaroo Hydrogen', 'Karofi Optimus', 'Mutosi Enrolas', 'Sunhouse RO', 'Korihome WPK', 'Panasonic Alkaline', 'A.O. Smith Z7', 'Pureit Delano', 'Geyser Ecotar', 'Coway Harry'],
    images: [
      'https://images.unsplash.com/photo-1589139011550-41fd2113b942?q=80&w=800',
      'https://images.unsplash.com/photo-1610413336685-397b75294360?q=80&w=800'
    ],
    specs: { số_lõi: '9 lõi', màng_lọc: 'RO USA', tính_năng: 'Lạnh - Nóng' }
  },
  'may-say': {
    names: ['LG Dual Inverter Dryer', 'Samsung Heatpump', 'Electrolux UltimateCare 700', 'Beko Inverter Dryer', 'Candy Smart Dryer', 'Whirlpool AirDry', 'Toshiba Inverter Dryer', 'Aqua Heatpump', 'Panasonic Dryer', 'Sharp Dryer'],
    images: [
      'https://images.unsplash.com/photo-1545173153-93625751b32a?q=80&w=800',
      'https://images.unsplash.com/photo-1626806819282-2c1dc61a5e0c?q=80&w=800'
    ],
    specs: { công_nghệ: 'Bơm nhiệt Heatpump', khối_lượng: '8 Kg', tiết_kiệm: '5 sao' }
  },
  'may-nuoc-nong': {
    names: ['Ariston Blue DR', 'Ferroli Amore', 'Casper Enito', 'Panasonic Jet Pump', 'Electrolux ComfortFlow', 'Centon Presto', 'Beko Direct Heating', 'AO Smith Solar', ' Kangaroo Hot', 'Sunhouse Gold'],
    images: [
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800',
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=800'
    ],
    specs: { loại_máy: 'Trực tiếp', bơm_trợ_lực: 'Có', chống_giật: 'ELCB' }
  },
  'tu-dong': {
    names: ['Sanaky Inverter', 'Sanden Intercool', 'Alaska Inverter', 'Kangaroo Inverter', 'Hòa Phát Funiki', 'Aqua Inverter Freezer', 'Panasonic Freezer', 'Darling Smart', 'Nagakawa Inverter', 'Midea Freezer'],
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800',
      'https://images.unsplash.com/photo-1571175432230-01c288a69984?q=80&w=800'
    ],
    specs: { dàn_lạnh: 'Ống đồng', số_ngăn: '1 ngăn đông', gas: 'R600a' }
  },
  'linh-kien': {
    names: ['Remote Máy Lạnh Đa Năng', 'Bo Mạch Máy Giặt LG', 'Block Tủ Lạnh 1/4HP', 'Tụ Ngậm Điều Hòa 35uF', 'Van Tiết Lưu Danfoss', 'Motor Quạt Dàn Lạnh', 'Cảm Biến Nhiệt Tủ Lạnh', 'Ống Đồng Thái Lan', 'Gas R32 Honeywell', 'Vệ Sinh Máy Lạnh Set'],
    images: [
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800'
    ],
    specs: { ứng_dụng: 'Thay thế & Sửa chữa', độ_bền: 'Cao', tương_thích: 'Nhiều dòng' }
  }
};

async function seedProducts() {
  console.log('🚀 Bắt đầu quá trình nạp 200 sản phẩm...');

  try {
    // 1. Lấy danh sách Categories từ DB
    const { data: categories, error: catError } = await supabase.from('categories').select('id, slug, name');
    if (catError) throw catError;

    console.log(`Đã tìm thấy ${categories.length} danh mục.`);

    const productsToInsert = [];

    for (const category of categories) {
      const template = categoryTemplates[category.slug] || categoryTemplates['gia-dung'];
      console.log(`- Đang tạo 20 sản phẩm cho: ${category.name}`);

      for (let i = 1; i <= 20; i++) {
        const baseName = template.names[Math.floor(Math.random() * template.names.length)];
        const modelSuffix = Math.random().toString(36).substring(7).toUpperCase();
        const productName = `${baseName} Model ${modelSuffix} - ${i}`;
        const price = Math.floor(Math.random() * 20 + 2) * 500000; // 1tr - 11tr
        const discountPrice = Math.random() > 0.3 ? price * 0.9 : null;
        
        productsToInsert.push({
          name: productName,
          slug: `${category.slug}-${productName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}-${Date.now()}-${i}`,
          price: price,
          discount_price: discountPrice,
          images: template.images,
          description: `Sản phẩm ${productName} chính hãng, bảo hành dài hạn. Công nghệ tiên tiến từ ${category.name} mang lại trải nghiệm tuyệt vời cho gia đình bạn.`,
          specs: template.specs,
          status: true,
          is_featured: i <= 5,
          category_id: category.id
        });
      }
    }

    // Insert theo lô 50 sp để tránh lỗi quá tải
    const batchSize = 50;
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      const { error: insError } = await supabase.from('products').insert(batch);
      if (insError) {
        console.error(`Lỗi tại lô ${i / batchSize + 1}:`, insError.message);
      } else {
        console.log(`✅ Đã nạp xong lô ${i / batchSize + 1}/${Math.ceil(productsToInsert.length / batchSize)}`);
      }
    }

    console.log('\n✨ HOÀN TẤT! 200 sản phẩm đã sẵn sàng trên hệ thống.');
  } catch (err) {
    console.error('❌ Lỗi hệ thống:', err.message);
  }
}

seedProducts();
