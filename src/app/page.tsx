'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/safe-image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Zap, Clock, ShieldCheck, Truck, ShoppingCart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import FlashSaleCountdown from '@/components/flash-sale-countdown';
import { useCart } from '@/hooks/use-cart';
import CheckoutModal from '@/components/checkout-modal';
import { ProductService } from '@/services/product-service';
import QuickSearch from '@/components/quick-search';
import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';

export default function Home() {
  const { addItem } = useCart();
  const { storeInfo, loading: settingsLoading } = useSettings();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesData] = await Promise.all([
        ProductService.getAll({ featured: true, limit: 12 }),
        ProductService.getCategories()
      ]);
      setFeaturedProducts(productsResponse.data || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu trang chủ:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlider = () => {
    if (sliderIndex < featuredProducts.length - 4) {
      setSliderIndex(prev => prev + 1);
    } else {
      setSliderIndex(0);
    }
  };

  const prevSlider = () => {
    if (sliderIndex > 0) {
      setSliderIndex(prev => prev - 1);
    } else {
      setSliderIndex(Math.max(0, featuredProducts.length - 4));
    }
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

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Hero Banner Area */}
      <section className="container mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
          <div className="lg:col-span-2 relative rounded-[32px] overflow-hidden shadow-2xl group border border-primary/10 min-h-[350px]">
            <SafeImage
              src={settingsLoading ? "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=1200" : storeInfo.main_banner}
              alt="Main Banner"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent flex items-center p-8 md:p-16">
              <div className="text-white max-w-md space-y-6">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-tight">Máy Lạnh Giá Cực Sốc</h2>
                
                {/* Tìm kiếm nhanh */}
                <div className="w-full max-w-sm">
                  <QuickSearch />
                </div>

                <div className="pt-4">
                  <Link href="/products">
                    <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-black h-14 px-8 rounded-2xl shadow-xl transform hover:scale-[1.02] transition-all italic uppercase gap-2">
                      XEM TẤT CẢ SẢN PHẨM <ArrowRight size={20} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-6">
            <div className="relative flex-1 rounded-[32px] overflow-hidden shadow-lg border border-primary/10">
              <SafeImage 
                src={settingsLoading ? "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800" : storeInfo.sub_banner_1} 
                alt="Sub Banner 1" 
                fill 
                sizes="33vw" 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-primary/30 flex items-end p-6">
                <span className="text-white font-black bg-red-600 px-4 py-1.5 rounded-xl text-sm italic uppercase">GIẢM ĐẾN 30%</span>
              </div>
            </div>
            <div className="relative flex-1 rounded-[32px] overflow-hidden shadow-lg border border-primary/10">
              <SafeImage 
                src={settingsLoading ? "https://images.unsplash.com/photo-1581092921461-7d6570975896?auto=format&fit=crop&q=80&w=800" : storeInfo.sub_banner_2} 
                alt="Sub Banner 2" 
                fill 
                sizes="33vw" 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-primary/30 flex items-end p-6">
                <span className="text-white font-black bg-primary px-4 py-1.5 rounded-xl text-sm italic uppercase">Trả góp 0% lãi suất</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Danh mục sản phẩm</h2>
          <div className="w-24 h-1.5 bg-primary rounded-full mb-4" />
          <Link href="/products" className="text-primary font-black flex items-center gap-2 hover:translate-x-1 transition-all uppercase italic text-sm tracking-widest">
            Xem toàn bộ cửa hàng <ArrowRight size={18} />
          </Link>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/products?category=${cat.slug}`} 
              className="group flex flex-col items-center gap-4 p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all w-[160px] md:w-[180px]"
            >
              <div className="text-5xl bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 shadow-inner">
                {cat.icon || '📦'}
              </div>
              <span className="text-sm font-black text-slate-700 group-hover:text-primary transition-colors text-center uppercase tracking-tighter">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products (Slideshow) */}
      <section className="bg-sky-600 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400 p-3 rounded-2xl shadow-lg">
                <Zap className="text-slate-900 fill-current" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Sản phẩm nổi bật</h2>
                <div className="flex items-center gap-2 text-sky-100 mt-1">
                  <Clock size={16} />
                  <span className="text-sm font-bold uppercase tracking-widest">Ưu đãi kết thúc sau:</span>
                  <FlashSaleCountdown />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {featuredProducts.length > 4 && (
                <div className="flex gap-2 mr-4">
                  <button 
                    onClick={prevSlider}
                    className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white hover:text-sky-600 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextSlider}
                    className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white hover:text-sky-600 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              <Link href="/products">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-sky-600 font-bold px-8 h-12 rounded-xl italic uppercase">
                  XEM TẤT CẢ
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div 
              className={cn(
                "transition-transform duration-500 ease-in-out",
                featuredProducts.length > 4 ? "flex gap-6" : "grid grid-cols-2 md:grid-cols-4 gap-6"
              )}
              style={featuredProducts.length > 4 ? { transform: `translateX(-${sliderIndex * (100 / 4)}%)` } : {}}
            >
              {loading ? (
                <div className="col-span-full flex justify-center py-20 w-full"><Loader2 className="animate-spin text-white" size={32} /></div>
              ) : featuredProducts.map((p) => (
                <div 
                  key={p.id} 
                  className={cn(
                    "bg-white rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all group border border-white/20 flex flex-col h-full",
                    featuredProducts.length > 4 ? "min-w-[calc(50%-12px)] md:min-w-[calc(25%-18px)]" : ""
                  )}
                >
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-[20px] bg-slate-50">
                    <SafeImage src={p.images?.[0]} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-2 transition-transform group-hover:scale-110 duration-500" />
                    {p.discount_price && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black italic uppercase shadow-lg">
                        Giảm {Math.round((1 - p.discount_price / p.price) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-bold text-slate-800 text-sm mb-3 line-clamp-2 h-10">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-black text-primary italic">{(p.discount_price || p.price).toLocaleString('vi-VN')}đ</span>
                      {p.discount_price && <span className="text-[10px] text-slate-400 line-through font-bold">{p.price.toLocaleString('vi-VN')}đ</span>}
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-2">
                      <button 
                        onClick={() => handleBuyNow(p)}
                        className="w-full bg-slate-900 text-white hover:bg-primary font-black h-10 rounded-xl transition-all text-xs italic uppercase tracking-tighter flex items-center justify-center gap-2"
                      >
                        ĐẶT HÀNG NGAY <ArrowRight size={14} />
                      </button>
                      <button 
                        onClick={() => handleAddToCart(p)}
                        className="w-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary font-bold h-10 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} /> GIỎ HÀNG
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <ShieldCheck className="text-green-500" size={32} />, title: "Chất lượng chính hãng", desc: "Chúng tôi cam kết 100% sản phẩm chính hãng, đầy đủ giấy tờ." },
            { icon: <Truck className="text-blue-500" size={32} />, title: "Giao hàng siêu tốc", desc: "Hỗ trợ giao hàng và lắp đặt ngay trong ngày tại Ninh Bình." },
            { icon: <Star className="text-yellow-500" size={32} />, title: "Bảo hành tận nơi", desc: "Chăm sóc khách hàng tận tâm, bảo hành sửa chữa nhanh chóng." },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl transition-all duration-300">
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-all">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        product={selectedProduct}
      />
    </div>
  );
}
