'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/breadcrumb';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown, ArrowRight, ShoppingCart, SearchX, Loader2, X, ChevronLeft } from 'lucide-react';
import SafeImage from '@/components/safe-image';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import CheckoutModal from '@/components/checkout-modal';
import { ProductService } from '@/services/product-service';

const priceRanges = [
  { id: 'under-5', label: 'Dưới 5 triệu', min: 0, max: 5000000 },
  { id: '5-10', label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { id: '10-20', label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { id: 'above-20', label: 'Trên 20 triệu', min: 20000000, max: Infinity },
];

const ITEMS_PER_PAGE = 12;

function ProductsContent() {
  const router = useRouter();
  
  useEffect(() => {
    document.title = "Sản phẩm | Điện Lạnh Minh Tâm";
  }, []);

  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'Tất cả';
  const priceParam = searchParams.get('price') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');
  
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const categoriesData = await ProductService.getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchKeyword, categoryParam, priceParam, pageParam]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Gọi API với tham số phân trang server-side
      const response = await ProductService.getAll({
        category: categoryParam,
        page: pageParam,
        pageSize: ITEMS_PER_PAGE,
        featured: false // Không giới hạn kiểu featured khi xem list
      });
      
      let data = response.data || [];
      let count = response.count || 0;

      // Filter theo giá (Client-side vì range query phức tạp)
      if (priceParam) {
        const selectedRange = priceRanges.find(r => r.id === priceParam);
        if (selectedRange) {
          data = data.filter(p => {
            const price = p.discount_price || p.price;
            return price >= selectedRange.min && price < selectedRange.max;
          });
        }
      }

      // Filter theo search keyword (Client-side nếu không dùng search API)
      if (searchKeyword) {
        data = data.filter(p => 
          p.name.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }

      setAllProducts(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'Tất cả') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    router.push('/products');
  };

  const handleBuyNow = (product: any) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price
    });
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image: product.images?.[0] || ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-primary/10">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2 uppercase italic text-primary">
              <Filter size={16} /> Danh mục
            </h3>
            <div className="flex flex-wrap lg:flex-col gap-1">
              <Button 
                variant={categoryParam === 'Tất cả' ? 'default' : 'ghost'} 
                onClick={() => updateFilters('category', 'Tất cả')}
                className={cn(
                  "justify-start h-9 text-xs font-bold rounded-lg",
                  categoryParam === 'Tất cả' ? "bg-primary text-white" : "text-slate-600"
                )}
              >
                Tất cả
              </Button>
              {categories.map((cat) => (
                <Button 
                  key={cat.id} 
                  variant={cat.slug === categoryParam ? 'default' : 'ghost'} 
                  onClick={() => updateFilters('category', cat.slug)}
                  className={cn(
                    "justify-start h-9 text-xs font-bold rounded-lg transition-all",
                    cat.slug === categoryParam ? "bg-primary text-white" : "text-slate-600 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-primary/10">
            <h3 className="text-sm font-black mb-4 uppercase italic text-primary">Khoảng giá</h3>
            <div className="space-y-1">
              {priceRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => updateFilters('price', range.id === priceParam ? '' : range.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between group",
                    range.id === priceParam ? "bg-secondary text-secondary-foreground" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {range.label}
                  {range.id === priceParam && <X size={12} />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-grow">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-primary/5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-black text-primary italic uppercase">
                {searchKeyword ? `Kết quả cho: "${searchKeyword}"` : (categoryParam !== 'Tất cả' ? categoryParam : "Tất cả sản phẩm")} 
                <span className="ml-2 text-slate-400 normal-case font-bold">({totalCount} sản phẩm)</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              Sắp xếp: 
              <Button variant="outline" size="sm" className="gap-2 h-8 text-[10px] font-black rounded-lg border-slate-200">
                MỚI NHẤT <ChevronDown size={12} />
              </Button>
            </div>
          </div>

          {totalCount === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
              <SearchX size={64} className="mx-auto text-slate-200 mb-6" />
              <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Không tìm thấy sản phẩm</h2>
              <p className="text-slate-500 mb-8">Rất tiếc, chúng tôi không tìm thấy sản phẩm nào khớp với điều kiện lọc của bạn.</p>
              <Button variant="outline" onClick={clearAllFilters} className="rounded-xl font-bold uppercase">Xóa bộ lọc và xem tất cả</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {allProducts.map((p) => (
                  <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col group h-full">
                    <Link href={`/products/${p.id}`} className="relative aspect-square overflow-hidden p-4 bg-primary/5">
                      <SafeImage 
                        src={p.images?.[0]} 
                        alt={p.name} 
                        fill 
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-contain p-2 transition-transform group-hover:scale-110 duration-500"
                      />
                    </Link>
                    <div className="p-4 flex flex-col flex-grow border-t border-primary/5">
                      <Link href={`/products/${p.id}`}>
                        <h3 className="font-bold text-slate-800 text-xs mb-2 line-clamp-2 h-8 group-hover:text-primary transition-colors">{p.name}</h3>
                      </Link>
                      <div className="flex flex-col mb-3">
                        <span className="text-sm font-black text-primary">{(p.discount_price || p.price).toLocaleString('vi-VN')}đ</span>
                        {p.discount_price && (
                          <span className="text-[10px] text-slate-400 line-through">{p.price.toLocaleString('vi-VN')}đ</span>
                        )}
                      </div>
                      <div className="mt-auto pt-3 border-t border-primary/5 flex flex-col gap-2">
                        <button 
                          onClick={() => handleBuyNow(p)}
                          className="w-full bg-red-600 text-white hover:bg-red-700 font-black h-8 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          MUA NGAY <ArrowRight size={12} />
                        </button>
                        <button 
                          onClick={() => handleAddToCart(p)}
                          className="w-full border border-primary text-primary hover:bg-primary hover:text-white font-black h-8 rounded-lg transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          GIỎ HÀNG <ShoppingCart size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(pageParam - 1)}
                    disabled={pageParam === 1}
                    className="w-10 h-10 rounded-xl border-slate-200"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={cn(
                          "w-10 h-10 rounded-xl text-sm font-black transition-all",
                          page === pageParam 
                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                            : "bg-white text-slate-400 border border-slate-100 hover:border-primary hover:text-primary"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(pageParam + 1)}
                    disabled={pageParam === totalPages}
                    className="w-10 h-10 rounded-xl border-slate-200"
                  >
                    <ArrowRight size={20} />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        product={selectedProduct}
      />
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb items={[{ label: 'Sản phẩm' }]} />
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  );
}
