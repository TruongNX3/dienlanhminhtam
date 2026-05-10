'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Breadcrumb from '@/components/breadcrumb';
import { Button } from '@/components/ui/button';
import { Phone, Star, ChevronRight, ArrowRight, ShoppingCart, Loader2 } from 'lucide-react';
import SafeImage from '@/components/safe-image';
import { useCart } from '@/hooks/use-cart';
import CheckoutModal from '@/components/checkout-modal';
import { ProductService } from '@/services/product-service';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Fetch by ID or Slug
      const data = await ProductService.getBySlug(productId);
      setProduct(data);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Sản phẩm không tồn tại</h1>
        <Link href="/products">
          <Button>Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image: product.images?.[0] || ''
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description?.replace(/<[^>]*>?/gm, '') || '',
    brand: {
      '@type': 'Brand',
      name: 'Điện Lạnh Minh Tâm',
    },
    offers: {
      '@type': 'Offer',
      url: `https://dienlanhminhtam.com/products/${product.slug}`,
      priceCurrency: 'VND',
      price: product.discount_price || product.price,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb 
          items={[
            { label: 'Sản phẩm', href: '/products' },
            { label: product.categories?.name, href: `/products?category=${product.categories?.slug}` },
            { label: product.name }
          ]} 
        />

        <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 md:p-10 shadow-2xl border border-primary/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Images */}
            <div className="space-y-6">
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-primary/5 border border-primary/10 group">
                <SafeImage 
                  src={product.images?.[0]} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-8 transition-transform group-hover:scale-105 duration-500"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images?.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white hover:border-primary cursor-pointer transition-all bg-white shadow-sm">
                    <SafeImage src={img} alt={`${product.name} ${i}`} fill className="object-cover p-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Info & CTA */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded italic uppercase">Chính hãng</span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center text-yellow-500">
                  <Star size={14} className="fill-current" />
                  <span className="text-sm font-bold ml-1 text-slate-700">4.5</span>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-6 italic uppercase leading-tight">{product.name}</h1>
              
              <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/10 shadow-inner">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-4xl font-black text-red-600">{(product.discount_price || product.price).toLocaleString('vi-VN')}đ</span>
                  {product.discount_price && (
                    <span className="text-lg text-slate-400 line-through">{product.price.toLocaleString('vi-VN')}đ</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded shadow-sm">Góp 0%</span>
                  <span className="italic uppercase">Giá rẻ nhất thị trường</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-red-600 text-white font-black h-20 px-10 rounded-[20px] shadow-xl transform hover:scale-[1.02] transition-all btn-buy-now text-xl italic uppercase flex items-center justify-center gap-3"
                  >
                    MUA NGAY <ArrowRight className="arrow-icon" />
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-white font-black h-20 px-10 rounded-[20px] shadow-xl transform hover:scale-[1.02] transition-all text-xl italic uppercase flex items-center justify-center gap-3"
                  >
                    THÊM GIỎ HÀNG <ShoppingCart />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-primary/10 pt-12">
            <h2 className="text-2xl font-black mb-8 italic uppercase border-l-8 border-primary pl-4 text-primary">Mô tả sản phẩm</h2>
            <div 
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-[17px]"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        product={{
          id: product.id,
          name: product.name,
          price: product.discount_price || product.price
        }}
      />
    </div>
  );
}
