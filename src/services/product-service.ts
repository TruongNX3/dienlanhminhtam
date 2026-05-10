import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import imageCompression from 'browser-image-compression';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

/**
 * Dịch vụ quản lý sản phẩm
 * Cung cấp các phương thức CRUD để tương tác với bảng 'products' và 'categories'
 */
export const ProductService = {
  // --- QUẢN LÝ ẢNH ---
  async uploadImage(file: File) {
    // Cấu hình nén ảnh
    const options = {
      maxSizeMB: 1,           // Dung lượng tối đa 1MB
      maxWidthOrHeight: 1200, // Kích thước tối đa 1200px
      useWebWorker: true,
      initialQuality: 0.8     // Chất lượng ban đầu 80%
    };

    let fileToUpload = file;

    try {
      console.log(`Đang nén ảnh: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Nén thành công: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      fileToUpload = compressedFile;
    } catch (error) {
      console.error('Lỗi khi nén ảnh, sẽ tải lên ảnh gốc:', error);
    }

    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, fileToUpload);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // --- QUẢN LÝ DANH MỤC ---
  async getCategories(options: { all?: boolean } = {}) {
    let query = supabase
      .from('categories')
      .select('*');
    
    // Nếu không phải admin (all=true), chỉ lấy danh mục đang HIỆN
    if (!options.all) {
      query = query.eq('status', true);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createCategory(category: CategoryInsert) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, category: Partial<CategoryInsert>) {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- QUẢN LÝ SẢN PHẨM ---
  async getAll(options: { 
    featured?: boolean, 
    limit?: number, 
    category?: string, 
    all?: boolean,
    status?: boolean,
    search?: string, // Thêm tùy chọn tìm kiếm
    page?: number,
    pageSize?: number
  } = {}) {
    let query = supabase
      .from('products')
      .select('*, categories(name, slug, status)', { count: 'exact' });

    // Tìm kiếm theo tên sản phẩm nếu có
    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    // Ưu tiên lọc theo status cụ thể nếu có truyền vào
    if (typeof options.status === 'boolean') {
      query = query.eq('status', options.status);
    } else if (!options.all) {
      // Nếu không truyền status và không phải admin (all=true), chỉ lấy sản phẩm đang HIỆN
      query = query.eq('status', true);
    }

    if (options.category && options.category !== 'Tất cả') {
      // Đầu tiên lấy ID của category từ name hoặc slug
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .or(`name.eq."${options.category}",slug.eq."${options.category}"`)
        .single();
      
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (options.featured) {
      query = query.eq('status', true).eq('is_featured', true);
      if (options.limit) query = query.limit(options.limit);
      else query = query.limit(8);
    }

    // Phân trang
    if (options.page && options.pageSize) {
      const from = (options.page - 1) * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);
    } else if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;

    let resultData = data || [];

    // Lọc thêm: Nếu danh mục cha bị ẩn, sản phẩm cũng phải ẩn (dành cho client)
    if (!options.all) {
      resultData = resultData.filter(p => (p.categories as any)?.status !== false);
    }

    return {
      data: resultData,
      count: count || 0
    };
  },

  async getBySlug(slugOrId: string, options: { all?: boolean } = {}) {
    let query = supabase
      .from('products')
      .select('*, categories(*)')
      .or(`slug.eq."${slugOrId}",id.eq."${slugOrId}"`); // Tìm kiếm cả theo slug hoặc id

    if (!options.all) {
      query = query.eq('status', true);
    }

    const { data, error } = await query.maybeSingle();
    
    if (error) throw error;
    if (!data) return null;

    // Kiểm tra thêm status của danh mục cha
    if (!options.all && (data.categories as any)?.status === false) {
      return null;
    }

    return data;
  },

  async create(product: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, product: Partial<ProductInsert>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
