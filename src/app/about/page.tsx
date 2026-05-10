'use client';

import React from 'react';
import { ShieldCheck, Truck, Clock, Headphones, Award } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export default function AboutPage() {
  const { storeInfo, loading } = useSettings();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6">
            Về {loading ? 'Minh Tâm' : storeInfo.name}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            {loading ? '...' : storeInfo.about}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-20 pb-20">
        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: <Award className="text-primary" size={32} />, title: "Chất lượng hàng đầu", desc: "Cam kết cung cấp sản phẩm chính hãng với tiêu chuẩn kỹ thuật cao nhất." },
            { icon: <Clock className="text-blue-500" size={32} />, title: "Hỗ trợ 24/7", desc: `Đội ngũ kỹ thuật trực Hotline ${storeInfo.phone} sẵn sàng phục vụ mọi lúc.` },
            { icon: <ShieldCheck className="text-green-500" size={32} />, title: "Bảo hành uy tín", desc: storeInfo.warranty_policy }
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 transform transition-all hover:-translate-y-2">
              <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed Content */}
        <div className="bg-white rounded-[4rem] p-8 md:p-20 shadow-2xl border border-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32" />
          
          <div className="max-w-3xl mx-auto space-y-12 relative z-10">
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 uppercase italic border-l-8 border-primary pl-6">Sứ mệnh của chúng tôi</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Tại <b>{storeInfo.name}</b>, chúng tôi không chỉ bán thiết bị điện lạnh, chúng tôi mang đến sự an tâm và thoải mái cho ngôi nhà của bạn. Với hơn 10 năm kinh nghiệm tại Ninh Bình, chúng tôi hiểu rõ từng nhu cầu của khách hàng.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 uppercase italic border-l-8 border-primary pl-6">Chính sách bảo hành</h2>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <p className="text-lg text-slate-700 leading-relaxed font-bold italic">
                  &quot;{storeInfo.warranty_policy}&quot;
                </p>
              </div>
            </section>

            <section className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900 uppercase italic border-l-8 border-primary pl-6">Liên hệ trực tiếp</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Hệ thống cửa hàng</p>
                  <div className="space-y-2">
                    {loading ? (
                      <p className="font-bold text-slate-800">...</p>
                    ) : (
                      storeInfo.addresses.map((addr, index) => (
                        <p key={index} className="font-bold text-slate-800 text-sm">{addr}</p>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Hotline</p>
                  <p className="text-xl font-black text-slate-800">{storeInfo.phone}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
