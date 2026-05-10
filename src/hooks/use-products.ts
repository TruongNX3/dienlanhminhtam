import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Wait, I put supabase in src/lib/supabase.ts
import { Database } from '@/types/database';

type Product = Database['public']['Tables']['products']['Row'];

/**
 * Hook tùy chỉnh để lấy danh sách sản phẩm
 * @param categoryId ID của danh mục để lọc (không bắt buộc)
 */
export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        // Khởi tạo truy vấn từ bảng 'products'
        let query = supabase.from('products').select('*');
        
        // Nếu có truyền categoryId, thêm điều kiện lọc vào truy vấn
        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        setProducts(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryId]);

  return { products, loading, error };
}
