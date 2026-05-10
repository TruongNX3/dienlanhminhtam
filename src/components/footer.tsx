'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Globe, Clock, MessageCircle } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

const Footer = () => {
  const { storeInfo, loading } = useSettings();

  return (
    <footer className="bg-sky-600 text-white pt-16 pb-8 border-t border-sky-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter">
              {loading ? '...' : storeInfo.name}
            </h3>
            <p className="text-sky-50 mb-6 leading-relaxed text-sm font-medium opacity-90">
              {loading ? '...' : storeInfo.about}
            </p>
            <div className="flex flex-wrap gap-4">
              {storeInfo.facebook && (
                <Link href={storeInfo.facebook} target="_blank" className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-sky-600 transition-all shadow-md">
                  <Globe size={22} />
                </Link>
              )}
              {storeInfo.zalo && (
                <Link href={`https://zalo.me/${storeInfo.zalo.replace(/\./g, '')}`} target="_blank" className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-sky-600 transition-all shadow-md font-black text-xs">
                  Zalo
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-black text-white mb-6 uppercase italic tracking-tight">Liên kết nhanh</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/" className="text-sky-50 hover:text-white transition-all flex items-center gap-2 hover:translate-x-2 italic uppercase">Trang chủ</Link></li>
              <li><Link href="/products" className="text-sky-50 hover:text-white transition-all flex items-center gap-2 hover:translate-x-2 italic uppercase">Sản phẩm</Link></li>
              <li><Link href="/contact" className="text-sky-50 hover:text-white transition-all flex items-center gap-2 hover:translate-x-2 italic uppercase">Liên hệ ngay</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-black text-white mb-6 uppercase italic tracking-tight">Danh mục</h4>
            <ul className="space-y-4 text-sm font-bold text-sky-50">
              <li><Link href="/products?category=may-lanh" className="hover:text-white transition-colors flex items-center gap-2">Máy lạnh chính hãng</Link></li>
              <li><Link href="/products?category=tu-lanh" className="hover:text-white transition-colors flex items-center gap-2">Tủ lạnh tiết kiệm điện</Link></li>
              <li><Link href="/products?category=may-giat" className="hover:text-white transition-colors flex items-center gap-2">Máy giặt lồng ngang</Link></li>
              <li><Link href="/products?category=gia-dung" className="hover:text-white transition-colors flex items-center gap-2">Đồ gia dụng cao cấp</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-black text-white mb-6 uppercase italic tracking-tight">Hệ thống cơ sở</h4>
            <ul className="space-y-6">
              {loading ? (
                <li className="text-sky-100 text-xs">Đang tải...</li>
              ) : (
                storeInfo.addresses.map((addr, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <MapPin className="text-white shrink-0 mt-1 opacity-80" size={18} />
                    <div className="text-xs font-bold leading-relaxed">
                      <p className="text-sky-100 uppercase mb-0.5 tracking-tighter italic font-black">Cơ sở {index + 1}:</p>
                      <p className="text-white">{addr}</p>
                    </div>
                  </li>
                ))
              )}
              <li className="pt-4 border-t border-sky-500/50 space-y-3">
                <div className="flex items-center gap-3 text-sm font-black text-white italic">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
                    <Phone size={16} />
                  </div>
                  <span className="tracking-wider">{storeInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-sky-50 italic">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock size={16} />
                  </div>
                  <span>{storeInfo.working_hours}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-sky-50 lowercase italic">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={16} />
                  </div>
                  <span className="truncate">{storeInfo.email}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sky-500/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-sky-100">
          <p>© {new Date().getFullYear()} {storeInfo.name}. Phục vụ bằng cả trái tim.</p>
          <div className="flex gap-6 italic">
            <Link href="/policy" className="hover:text-white transition-colors underline underline-offset-4">Chính sách bảo hành</Link>
            <Link href="/about" className="hover:text-white transition-colors underline underline-offset-4">Về chúng tôi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
