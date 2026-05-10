'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  MessageSquare, 
  Clock, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  User,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { ProductService } from '@/services/product-service';
import { LeadService } from '@/services/lead-service';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    newLeads: 0,
    contactedLeads: 0,
    completedLeads: 0
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [topProducts, setTopLeadsProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, leadsResponse] = await Promise.all([
        ProductService.getAll({ all: true }),
        LeadService.getAll()
      ]);

      const productList = productsResponse.data || [];
      const leadList = leadsResponse.data || [];

      // 1. Tính toán thống kê
      setStats({
        totalProducts: productList.length,
        newLeads: leadList.filter(l => l.status === 'new').length,
        contactedLeads: leadList.filter(l => l.status === 'contacted').length,
        completedLeads: leadList.filter(l => l.status === 'completed').length
      });

      // 2. Top 10 yêu cầu mới nhất
      setRecentLeads(leadList.slice(0, 10));

      // 3. Top 10 sản phẩm được quan tâm (Dựa trên số lượng Lead liên kết)
      const productInterests: Record<string, { name: string, count: number, id: string }> = {};
      leadList.forEach(l => {
        if (l.product_id && l.products) {
          if (!productInterests[l.product_id]) {
            productInterests[l.product_id] = { id: l.product_id, name: l.products.name, count: 0 };
          }
          productInterests[l.product_id].count += 1;
        }
      });

      const top10Products = Object.values(productInterests)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      setTopLeadsProducts(top10Products);

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    { label: 'Tổng sản phẩm', value: stats.totalProducts, icon: <Package size={24} />, color: 'bg-blue-500', link: '/admin/products' },
    { label: 'Yêu cầu MỚI', value: stats.newLeads, icon: <Clock size={24} />, color: 'bg-amber-500', link: '/admin/leads' },
    { label: 'Đã liên hệ', value: stats.contactedLeads, icon: <Phone size={24} />, color: 'bg-orange-500', link: '/admin/leads' },
    { label: 'Đã hoàn tất', value: stats.completedLeads, icon: <CheckCircle2 size={24} />, color: 'bg-green-500', link: '/admin/leads' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Tổng quan hệ thống</h1>
        <p className="text-slate-500 font-medium">Chào mừng bạn trở lại, Admin!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Link href={card.link} key={i}>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group overflow-hidden relative">
              <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform", card.color)} />
              <div className="flex items-center gap-4">
                <div className={cn("p-4 rounded-2xl text-white shadow-lg shadow-current/20", card.color)}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-3xl font-black text-slate-900 leading-tight">{card.value}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top 10 Recent Leads */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 italic uppercase">
              <MessageSquare className="text-primary" size={24} /> 10 Yêu cầu mới nhất
            </h2>
            <Link href="/admin/leads" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 flex-grow">
            {recentLeads.length > 0 ? recentLeads.map((lead) => (
              <div key={lead.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Phone size={10} /> {lead.phone} • {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                    lead.status === 'new' ? 'bg-amber-100 text-amber-600' : 
                    lead.status === 'contacted' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                  )}>
                    {lead.status === 'new' ? 'Mới' : lead.status === 'contacted' ? 'Đã gọi' : 'Xong'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-400 font-bold italic">Chưa có yêu cầu nào</div>
            )}
          </div>
        </div>

        {/* Top 10 Interested Products */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 italic uppercase">
              <TrendingUp className="text-green-500" size={24} /> 10 SP quan tâm nhiều nhất
            </h2>
          </div>
          <div className="divide-y divide-slate-50 flex-grow text-sm">
            {topProducts.length > 0 ? topProducts.map((item, idx) => (
              <div key={item.id} className="p-5 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 font-black text-[10px]">
                    {item.count} YÊU CẦU
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-400 font-bold italic">Chưa có dữ liệu thống kê</div>
            )}
          </div>
          <div className="p-6 bg-slate-50/50 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 text-center font-medium italic">
              * Dữ liệu được tính dựa trên số lượng khách hàng gửi yêu cầu mua/tư vấn sản phẩm này
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
