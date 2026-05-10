'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/breadcrumb';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, Globe, Loader2, CheckCircle2, MessageCircle, Info } from 'lucide-react';
import { LeadService } from '@/services/lead-service';
import { useSettings } from '@/hooks/use-settings';
import { Toast, ToastType } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const { storeInfo, loading: settingsLoading } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  React.useEffect(() => {
    document.title = "Liên hệ | Điện Lạnh Minh Tâm";
  }, []);

  const [isSuccess, setIsSuccess] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: ''
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Vui lòng điền đầy đủ họ tên và số điện thoại', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Kiểm tra trùng số điện thoại
      const isDuplicateCheck = await LeadService.checkPhoneExists(formData.phone);
      if (isDuplicateCheck) {
        setIsDuplicate(true);
        setIsSubmitting(false);
        return;
      }

      await LeadService.create({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        note: `[Trang Liên Hệ] ${formData.note}`,
        status: 'new'
      });
      setIsSuccess(true);
      setFormData({ name: '', phone: '', address: '', note: '' });
    } catch (error: any) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      showToast('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb items={[{ label: 'Liên hệ' }]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black text-primary italic uppercase tracking-tighter mb-4">Liên hệ với {settingsLoading ? 'Minh Tâm' : storeInfo.name}</h1>
              <p className="text-slate-500 leading-relaxed font-medium">
                {settingsLoading ? '...' : storeInfo.about}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-wider">Hệ thống cửa hàng</h3>
                  <div className="space-y-4">
                    {settingsLoading ? (
                      <p className="text-slate-600 text-sm font-medium">...</p>
                    ) : (
                      storeInfo.addresses.map((addr, index) => (
                        <div key={index}>
                          <p className="text-sm font-bold text-primary italic">Cơ sở {index + 1}:</p>
                          <p className="text-slate-600 leading-relaxed text-sm font-medium">
                            {addr}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-wider">Mạng xã hội</h3>
                  <div className="flex flex-col gap-2">
                    {storeInfo.facebook && (
                      <Link href={storeInfo.facebook} target="_blank" className="text-sm font-bold text-blue-600 hover:underline">Facebook chính thức</Link>
                    )}
                    {storeInfo.zalo && (
                      <p className="text-sm font-bold text-teal-600">Zalo: {storeInfo.zalo}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-wider">Hotline hỗ trợ</h3>
                  <p className="text-xl font-black text-primary italic">{settingsLoading ? '...' : storeInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-wider">Email</h3>
                  <p className="text-sm font-bold text-slate-600">{settingsLoading ? '...' : storeInfo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-wider">Giờ làm việc</h3>
                  <p className="text-sm font-bold text-slate-600">{settingsLoading ? '...' : storeInfo.working_hours}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic font-bold uppercase tracking-widest">* Phục vụ cả ngày lễ và Chủ nhật</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {isSuccess || isDuplicate ? (
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {isSuccess ? <CheckCircle2 size={40} /> : <Info size={40} />}
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase italic">
                  {isSuccess ? 'Gửi yêu cầu thành công!' : 'Yêu cầu đã được gửi!'}
                </h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed font-medium">
                  {isSuccess 
                    ? 'Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được thông tin và sẽ phản hồi cho bạn trong thời gian sớm nhất.'
                    : 'Chúng tôi đã nhận được yêu cầu của bạn trước đó. Nhân viên sẽ sớm liên hệ tư vấn cho bạn nhé!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <Button size="lg" className="rounded-xl px-10 font-bold uppercase italic" onClick={() => { setIsSuccess(false); setIsDuplicate(false); }}>GỬI THÊM YÊU CẦU</Button>
                  <Button variant="outline" size="lg" className="rounded-xl px-10 font-bold border-slate-200 uppercase tracking-widest text-xs" onClick={() => window.location.href = '/'}>QUAY VỀ TRANG CHỦ</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-slate-700 uppercase ml-1">Họ và tên <span className="text-red-500">*</span></label>
                    <input required type="text" id="name" value={formData.name} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium" placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-bold text-slate-700 uppercase ml-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <input required type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium" placeholder="09xx xxx xxx" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-bold text-slate-700 uppercase ml-1">Địa chỉ (không bắt buộc)</label>
                  <input type="text" id="address" value={formData.address} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium" placeholder="Số nhà, tên đường, quận/huyện..." />
                </div>
                <div className="space-y-2">
                  <label htmlFor="note" className="text-sm font-bold text-slate-700 uppercase ml-1">Nội dung yêu cầu</label>
                  <textarea id="note" rows={5} value={formData.note} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none font-medium" placeholder="Tôi cần tư vấn về..." />
                </div>
                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-16 text-xl font-black italic uppercase rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">{isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Đang gửi...</> : 'Gửi yêu cầu ngay'}</Button>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest italic">* Chúng tôi sẽ phản hồi trong vòng 15-30 phút</p>
              </form>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="inline-block font-black text-primary uppercase italic text-sm border-b-4 border-primary pb-2 px-6 tracking-widest">
              Bản đồ hệ thống cửa hàng
            </h3>
          </div>
          
          <div className={cn(
            "grid gap-8",
            !settingsLoading && storeInfo.addresses.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-3xl mx-auto"
          )}>
            {settingsLoading ? (
              <div className="col-span-full h-[400px] bg-white rounded-[3rem] animate-pulse border border-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase italic">Đang tải bản đồ...</div>
            ) : (
              storeInfo.addresses.map((addr, index) => (
                <div key={index} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden h-[400px] relative group">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      title={`Bản đồ cơ sở ${index + 1}`}
                      className="rounded-[2rem] grayscale hover:grayscale-0 transition-all duration-700" 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(addr)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    />
                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-primary/10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-[10px] font-black text-primary uppercase mb-1 italic">Cơ sở {index + 1}</p>
                      <p className="text-[11px] text-slate-700 font-bold leading-tight">{addr}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  );
}
