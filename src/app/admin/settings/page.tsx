'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Info, 
  ShieldCheck, 
  Clock, 
  Save, 
  Loader2,
  MessageCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsService, StoreInfo } from '@/services/settings-service';
import { ProductService } from '@/services/product-service'; // Dùng để upload ảnh
import { supabase } from '@/lib/supabase';
import { Toast, ToastType } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('admin');
  const [formData, setFormData] = useState<StoreInfo>({
    name: '',
    addresses: [''],
    phone: '',
    email: '',
    facebook: '',
    about: '',
    warranty_policy: '',
    zalo: '',
    working_hours: '',
    main_banner: '',
    sub_banner_1: '',
    sub_banner_2: ''
  });

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'admin');

      const data = await SettingsService.getStoreInfo();
      setFormData(data);
    } catch (error) {
      console.error('Lỗi tải cài đặt:', error);
      showToast('Không thể tải cấu hình hệ thống', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = value;
    setFormData(prev => ({ ...prev, addresses: newAddresses }));
  };

  const addAddress = () => {
    setFormData(prev => ({ ...prev, addresses: [...prev.addresses, ''] }));
  };

  const removeAddress = (index: number) => {
    if (formData.addresses.length <= 1) return;
    setFormData(prev => ({ ...prev, addresses: prev.addresses.filter((_, i) => i !== index) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof StoreInfo) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(field);
      showToast(`Đang tải ảnh lên...`, 'info');
      const publicUrl = await ProductService.uploadImage(file);
      setFormData(prev => ({ ...prev, [field]: publicUrl }));
      showToast('Tải ảnh thành công');
    } catch (error: any) {
      showToast(`Lỗi upload: ${error.message}`, 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const finalData = {
        ...formData,
        addresses: formData.addresses.filter(addr => addr.trim() !== '')
      };
      await SettingsService.updateStoreInfo(finalData, userEmail);
      showToast('Đã lưu toàn bộ cấu hình hệ thống thành công');
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu cấu hình', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-sky-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
            <Store size={32} className="text-sky-600" /> Cài đặt hệ thống
          </h1>
          <p className="text-slate-500 font-medium">Cấu hình thông tin cửa hàng và giao diện trang chủ</p>
        </div>
        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting} 
          className="h-14 px-8 rounded-2xl font-black text-sm shadow-xl shadow-sky-600/20 gap-3 bg-sky-600 hover:bg-sky-700"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> LƯU THAY ĐỔI</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Thông tin cơ bản */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight italic">
              <Info size={20} className="text-blue-500" /> Thông tin cửa hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tên cửa hàng</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 h-14 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Hotline</label>
                <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 h-14 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-black text-sky-600" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase italic">Danh sách địa chỉ cơ sở</label>
                <Button type="button" variant="outline" size="sm" onClick={addAddress} className="rounded-xl gap-1 text-[10px] font-black h-8 px-3 border-slate-200">
                  <Plus size={14} /> THÊM CƠ SỞ
                </Button>
              </div>
              <div className="space-y-3">
                {formData.addresses.map((addr, index) => (
                  <div key={index} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                    <div className="relative flex-grow">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required value={addr} onChange={(e) => handleAddressChange(index, e.target.value)} placeholder={`Địa chỉ cơ sở ${index + 1}...`} className="w-full pl-12 pr-5 h-14 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-medium" />
                    </div>
                    {formData.addresses.length > 1 && (
                      <Button type="button" variant="ghost" className="h-14 w-14 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => removeAddress(index)}>
                        <Trash2 size={20} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Banner Configuration */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight italic">
              <ImageIcon size={20} className="text-purple-500" /> Cấu hình Banner trang chủ
            </h2>
            
            <div className="space-y-8">
              {/* Main Banner */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest italic">1. Banner Chính (Banner lớn)</label>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'main_banner')} />
                    <div className="flex items-center gap-2 text-[10px] font-black bg-sky-50 text-sky-600 px-4 py-2 rounded-xl hover:bg-sky-100 transition-all">
                      {uploadingField === 'main_banner' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      TẢI ẢNH MỚI
                    </div>
                  </label>
                </div>
                <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 group">
                  {formData.main_banner ? (
                    <Image src={formData.main_banner} alt="Main" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold uppercase italic text-xs">Chưa có ảnh</div>
                  )}
                </div>
              </div>

              {/* Sub Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">2. Sub Banner 1 (Phải - Trên)</label>
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sub_banner_1')} />
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-sky-100 hover:text-sky-600 transition-all">
                        {uploadingField === 'sub_banner_1' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      </div>
                    </label>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    {formData.sub_banner_1 ? (
                      <Image src={formData.sub_banner_1} alt="Sub 1" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px] font-bold">TRỐNG</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">3. Sub Banner 2 (Phải - Dưới)</label>
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sub_banner_2')} />
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-sky-100 hover:text-sky-600 transition-all">
                        {uploadingField === 'sub_banner_2' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      </div>
                    </label>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    {formData.sub_banner_2 ? (
                      <Image src={formData.sub_banner_2} alt="Sub 2" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px] font-bold">TRỐNG</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight italic">
              <Phone size={20} className="text-green-500" /> Liên hệ & Mạng xã hội
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 h-12 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zalo</label>
                <input name="zalo" value={formData.zalo} onChange={handleInputChange} className="w-full px-4 h-12 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 transition-all text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facebook</label>
                <input name="facebook" value={formData.facebook} onChange={handleInputChange} className="w-full px-4 h-12 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giờ làm việc</label>
                <input name="working_hours" value={formData.working_hours} onChange={handleInputChange} className="w-full px-4 h-12 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 transition-all text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight italic">
              <ShieldCheck size={20} className="text-orange-500" /> Nội dung & Chính sách
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giới thiệu ngắn</label>
                <textarea name="about" value={formData.about} onChange={handleInputChange} rows={3} className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 transition-all text-sm leading-relaxed" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chính sách bảo hành</label>
                <textarea name="warranty_policy" value={formData.warranty_policy} onChange={handleInputChange} rows={4} className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 transition-all text-sm leading-relaxed" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
}
