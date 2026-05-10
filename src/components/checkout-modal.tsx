'use client';

import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadService } from '@/services/lead-service';
import { useCart } from '@/hooks/use-cart';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

export default function CheckoutModal({ isOpen, onClose, onSuccess, product }: CheckoutModalProps) {
  const { items, clearCart, getTotalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Kiểm tra trùng số điện thoại
      const isDuplicateCheck = await LeadService.checkPhoneExists(formData.phone);
      if (isDuplicateCheck) {
        setIsDuplicate(true);
        setIsSubmitting(false);
        return;
      }

      const cartItemsSnapshot = [...items]; // Lưu lại bản sao giỏ hàng trước khi xóa

      if (product) {
        await LeadService.create({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          note: `Mua ngay: ${product.name}. ${formData.note}`,
          product_id: product.id,
          status: 'new'
        });
      } else {
        const cartDetails = cartItemsSnapshot.map(item => `${item.name} (x${item.quantity})`).join(', ');
        await LeadService.create({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          note: `Giỏ hàng: ${cartDetails}. ${formData.note}`,
          status: 'new'
        });
      }
      
      // Quan trọng: Thông báo cho component cha (nếu có) trước khi clear cart
      if (onSuccess) {
        onSuccess();
      } else {
        setIsSuccess(true);
      }
      
      // Nếu là đặt hàng từ giỏ hàng, xóa giỏ hàng
      if (!product) {
        clearCart();
      }
    } catch (error: any) {
      console.error('Lỗi chi tiết khi gửi yêu cầu:', error);
      const errorMsg = error.message || error.details || JSON.stringify(error);
      alert(`Có lỗi xảy ra: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isSuccess || isDuplicate) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-[32px] p-8 text-center animate-in zoom-in-95 duration-200">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {isSuccess ? <CheckCircle2 size={40} /> : <Info size={40} />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">
            {isSuccess ? 'GỬI YÊU CẦU THÀNH CÔNG!' : 'YÊU CẦU ĐÃ ĐƯỢC GỬI!'}
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed font-medium">
            {isSuccess 
              ? 'Chúng tôi sẽ liên hệ với bạn ngay khi nhận được thông tin. Cảm ơn bạn đã tin tưởng Điện Lạnh Minh Tâm.'
              : 'Chúng tôi đã nhận được yêu cầu của bạn trước đó. Nhân viên sẽ sớm liên hệ tư vấn cho bạn nhé!'}
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 italic uppercase" 
              onClick={() => {
                setIsSuccess(false);
                setIsDuplicate(false);
                onClose();
              }}
            >
              TIẾP TỤC XEM SẢN PHẨM
            </Button>
            <Button 
              variant="outline"
              className="w-full h-14 rounded-2xl font-bold border-slate-200 uppercase tracking-widest text-xs" 
              onClick={() => {
                window.location.href = '/';
              }}
            >
              QUAY VỀ TRANG CHỦ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = product ? product.price : getTotalPrice();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-primary uppercase italic tracking-tighter">Xác nhận đặt hàng</h2>
            <p className="text-xs text-slate-500 font-bold">Vui lòng để lại thông tin, chúng tôi sẽ gọi lại ngay</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border border-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <h3 className="text-xs font-black text-primary uppercase mb-2">Đơn hàng của bạn:</h3>
            
            {product ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800 line-clamp-1">{product.name}</span>
                  <span className="text-sm font-black text-primary ml-4 whitespace-nowrap">{product.price.toLocaleString('vi-VN')}đ</span>
                </div>
                <p className="text-[9px] text-right text-slate-400 font-medium italic">
                  * Giá trên web chỉ mang tính chất tham khảo
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700 font-medium line-clamp-1">{item.name} <b className="text-primary">x{item.quantity}</b></span>
                    <span className="font-bold text-slate-900 ml-4">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-primary/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-black text-slate-900">TỔNG CỘNG:</span>
                    <span className="text-lg font-black text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <p className="text-[9px] text-right text-slate-400 font-medium italic">
                    * Giá trên web chỉ mang tính chất tham khảo
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase ml-1">Họ và tên <span className="text-red-500">*</span></label>
              <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 h-12 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-medium transition-all" placeholder="VD: Nguyễn Văn A" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase ml-1">Số điện thoại <span className="text-red-500">*</span></label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 h-12 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-medium transition-all" placeholder="VD: 0817xxxxxx" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase ml-1">Địa chỉ nhận hàng</label>
              <input name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 h-12 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-medium transition-all" placeholder="Số nhà, tên đường, phường/xã..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase ml-1">Ghi chú thêm</label>
              <textarea name="note" value={formData.note} onChange={handleInputChange} className="w-full p-4 h-24 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-medium transition-all resize-none" placeholder="Yêu cầu về thời gian giao hàng, lắp đặt..." />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-2xl gap-3 text-lg font-black italic uppercase shadow-xl shadow-primary/20">
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'ĐẶT HÀNG NGAY'}
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
              Cam kết bảo mật thông tin khách hàng tuyệt đối
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
