-- 1. Tạo bảng Danh mục (Categories)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT, -- Thêm cột icon (VD: 📺, ❄️, hoặc link ảnh)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tạo bảng Sản phẩm (Products)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price NUMERIC NOT NULL DEFAULT 0,
    discount_price NUMERIC,
    images TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    description TEXT,
    specs JSONB DEFAULT '{}'::JSONB NOT NULL,
    status BOOLEAN DEFAULT true NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tạo bảng Yêu cầu liên hệ (Leads)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    note TEXT,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bật Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 4. Chính sách cho bảng Categories
-- Cho phép mọi người xem danh mục
CREATE POLICY "Cho phép xem danh mục công khai" ON categories
    FOR SELECT USING (true);

-- Chỉ Admin mới được thay đổi (Yêu cầu đăng nhập)
CREATE POLICY "Admin có toàn quyền với danh mục" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Chính sách cho bảng Products
-- Cho phép mọi người xem sản phẩm đang hiện (status = true)
CREATE POLICY "Cho phép xem sản phẩm công khai" ON products
    FOR SELECT USING (status = true);

-- Admin được xem tất cả bao gồm sản phẩm ẩn
CREATE POLICY "Admin xem được tất cả sản phẩm" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin có toàn quyền CRUD
CREATE POLICY "Admin có toàn quyền với sản phẩm" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Chính sách cho bảng Leads
-- Cho phép khách hàng gửi yêu cầu (Insert)
CREATE POLICY "Khách hàng gửi yêu cầu liên hệ" ON leads
    FOR INSERT WITH CHECK (true);

-- Chỉ Admin mới được xem và quản lý Leads
CREATE POLICY "Admin quản lý yêu cầu liên hệ" ON leads
    FOR ALL USING (auth.role() = 'authenticated');

-- 7. Thêm dữ liệu mẫu
INSERT INTO categories (name, slug, icon) VALUES 
('Máy lạnh', 'may-lanh', '🌬️'),
('Tủ lạnh', 'tu-lanh', '❄️'),
('Máy giặt', 'may-giat', '🧺'),
('Gia dụng', 'gia-dung', '🍳'),
('Tivi, Loa', 'tivi-loa', '📺'),
('Máy lọc nước', 'may-loc-nuoc', '💧'),
('Máy sấy quần áo', 'may-say', '👕'),
('Máy nước nóng', 'may-nuoc-nong', '🔥'),
('Tủ đông', 'tu-dong', '🧊'),
('Linh kiện', 'linh-kien', '🔧');
