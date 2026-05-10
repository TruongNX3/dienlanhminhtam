'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Phone, 
  MapPin, 
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  CheckCircle,
  X,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadService } from '@/services/lead-service';
import { cn } from '@/lib/utils';

const statusConfig = {
  new: { label: 'Mới', class: 'bg-blue-50 text-blue-600', icon: <Clock size={14} /> },
  contacted: { label: 'Đã gọi', class: 'bg-orange-50 text-orange-600', icon: <Phone size={14} /> },
  completed: { label: 'Hoàn tất', class: 'bg-green-50 text-green-600', icon: <CheckCircle2 size={14} /> },
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allLeadsForCounts, setAllLeadsForCounts] = useState<any[]>([]); // For button counts
  const pageSize = 10;

  const fetchLeads = async (page = currentPage) => {
    try {
      setLoading(true);
      // Fetch paginated data
      const response = await LeadService.getAll({ 
        page, 
        pageSize, 
        status: activeStatus 
      });
      setLeads(response.data || []);
      setTotalCount(response.count || 0);

      // Fetch all for counts (only once or when needed)
      const allResponse = await LeadService.getAll();
      setAllLeadsForCounts(allResponse.data || []);
    } catch (error) {
      console.error('Lỗi khi tải yêu cầu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
    setCurrentPage(1);
  }, [activeStatus]);

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      // Optimistic UI
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status } : lead));
      setAllLeadsForCounts(prev => prev.map(lead => lead.id === id ? { ...lead, status } : lead));
      
      await LeadService.updateStatus(id, status);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      fetchLeads(currentPage);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm)
  );

  const statuses = [
    { id: 'all', label: 'Tất cả', count: allLeadsForCounts.length },
    { id: 'new', label: 'Mới', count: allLeadsForCounts.filter(l => l.status === 'new').length, class: 'text-blue-600 bg-blue-50' },
    { id: 'contacted', label: 'Đã gọi', count: allLeadsForCounts.filter(l => l.status === 'contacted').length, class: 'text-orange-600 bg-orange-50' },
    { id: 'completed', label: 'Hoàn tất', count: allLeadsForCounts.filter(l => l.status === 'completed').length, class: 'text-green-600 bg-green-50' },
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-160px)]">
      {/* --- Fixed Filter Section --- */}
      <div className="flex-shrink-0 space-y-6 pb-6 border-b border-slate-100 mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Yêu cầu liên hệ</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200" onClick={() => fetchLeads(currentPage)}>
              Làm mới
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStatus(s.id)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2 shadow-sm",
                  activeStatus === s.id 
                    ? "bg-sky-600 text-white border-sky-600 scale-105 shadow-md" 
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:shadow-md"
                )}
              >
                {s.label}
                <span className={cn(
                  "px-2 py-0.5 rounded-lg text-[10px]",
                  activeStatus === s.id ? "bg-white/20 text-white" : (s.class || "bg-slate-100 text-slate-600")
                )}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative max-w-sm flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all text-sm font-medium shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- Scrollable Data Section --- */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-20 flex justify-center items-center">
                <Loader2 className="animate-spin text-sky-600" size={32} />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <Filter size={32} />
                </div>
                <p className="text-slate-400 font-bold italic uppercase tracking-widest text-sm">Không tìm thấy yêu cầu nào</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-4 flex-grow">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-900">{lead.name}</h3>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusConfig[lead.status as keyof typeof statusConfig]?.class || 'bg-slate-100'}`}>
                          {statusConfig[lead.status as keyof typeof statusConfig]?.icon}
                          {statusConfig[lead.status as keyof typeof statusConfig]?.label || lead.status}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <Phone size={14} />
                          </div>
                          <span className="font-bold">{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <MapPin size={14} />
                          </div>
                          <span className="line-clamp-1 font-medium">{lead.address || 'Không có địa chỉ'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <Clock size={14} />
                          </div>
                          <span className="font-medium">{new Date(lead.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>

                      {lead.products?.name && (
                        <div className="bg-sky-50 p-3 px-4 rounded-xl inline-flex items-center gap-2 text-xs font-bold text-sky-700 border border-sky-100 italic">
                          <ExternalLink size={12} />
                          Sản phẩm quan tâm: {lead.products.name}
                        </div>
                      )}

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
                        <p className="text-sm text-slate-600 italic leading-relaxed font-medium pl-2">&quot;{lead.note}&quot;</p>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Link href={`tel:${lead.phone.replace(/\./g, '')}`} className="w-full">
                        <Button className="w-full lg:w-44 justify-center gap-2 h-12 rounded-xl font-black italic uppercase shadow-lg shadow-sky-600/20 bg-sky-600 hover:bg-sky-700">
                          <Phone size={16} /> Gọi tư vấn
                        </Button>
                      </Link>
                      
                      <div className="flex gap-2">
                        {lead.status !== 'contacted' && (
                          <Button 
                            variant="outline" 
                            className="flex-1 lg:w-auto justify-center h-11 rounded-xl text-orange-600 border-orange-200 hover:bg-orange-50 font-bold text-xs uppercase tracking-tight"
                            onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                          >
                            Đã gọi
                          </Button>
                        )}
                        {lead.status !== 'completed' && (
                          <Button 
                            variant="outline" 
                            className="flex-1 lg:w-auto justify-center h-11 rounded-xl text-green-600 border-green-200 hover:bg-green-50 font-bold text-xs uppercase tracking-tight"
                            onClick={() => handleUpdateStatus(lead.id, 'completed')}
                          >
                            Xong
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- Fixed Pagination Section --- */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 p-6 border-t border-slate-100 bg-white mt-4 rounded-[2rem] shadow-sm flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Hiển thị {leads.length} / {totalCount} yêu cầu
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border-slate-200 h-9 font-bold text-[10px] uppercase tracking-tighter"
            >
              <ChevronLeft size={14} /> Trước
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-xs font-black transition-all",
                    page === currentPage 
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20 scale-105" 
                      : "bg-white text-slate-400 border border-slate-100 hover:border-sky-600 hover:text-sky-600"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border-slate-200 h-9 font-bold text-[10px] uppercase tracking-tighter"
            >
              Sau <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
