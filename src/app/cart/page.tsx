'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import CheckoutModal from '@/components/checkout-modal';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  React.useEffect(() => {
    document.title = "Giỏ hàng | Điện Lạnh Minh Tâm";
  }, []);

  // Màn hình thành công
  if (isOrderSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">Gửi yêu cầu thành công!</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
          Cảm ơn bạn đã tin tưởng Điện Lạnh Minh Tâm. Chúng tôi đã nhận được thông tin đơn hàng và sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button className="h-14 px-10 rounded-2xl font-black italic uppercase gap-2 w-full sm:w-auto">
              Tiếp tục mua sắm
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="h-14 px-10 rounded-2xl font-bold border-slate-200 w-full sm:w-auto">
              Quay về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Màn hình giỏ hàng trống
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 uppercase italic">Giỏ hàng trống</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Bạn chưa chọn sản phẩm nào. Hãy quay lại cửa hàng để chọn sản phẩm ưng ý nhất nhé!</p>
        <Link href="/products">
          <Button className="h-14 px-10 rounded-2xl font-black italic uppercase gap-2">
            Quay lại cửa hàng <ArrowRight size={20} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-primary transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Giỏ hàng ({getTotalItems()})</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* List Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 md:p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4 md:gap-6">
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                </div>
                
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-slate-900 md:text-lg line-clamp-2 mb-1">{item.name}</h3>
                  <p className="text-primary font-black md:text-xl mb-4">{item.price.toLocaleString('vi-VN')}đ</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-slate-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-slate-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 sticky top-24">
              <h2 className="text-xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter border-b border-slate-100 pb-4">Tổng đơn hàng</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Tạm tính:</span>
                  <span>{getTotalPrice().toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Vận chuyển:</span>
                  <span className="text-green-600 italic">Miễn phí</span>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-black text-slate-900">TỔNG CỘNG:</span>
                    <span className="text-2xl font-black text-red-600">{getTotalPrice().toLocaleString('vi-VN')}đ</span>
                  </div>
                  <p className="text-[10px] text-right text-slate-400 font-medium italic">
                    * Giá trên web chỉ mang tính chất tham khảo
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full h-16 rounded-[20px] font-black italic uppercase text-lg gap-2 shadow-xl shadow-primary/20"
              >
                Đặt hàng ngay <ArrowRight size={20} />
              </Button>
              
              <p className="text-[10px] text-center text-slate-400 mt-6 font-medium uppercase tracking-widest leading-relaxed">
                Quý khách vui lòng kiểm tra kỹ đơn hàng trước khi xác nhận. Chúng tôi sẽ gọi lại để tư vấn thêm.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setIsOrderSuccess(true);
        }}
      />
    </div>
  );
}
