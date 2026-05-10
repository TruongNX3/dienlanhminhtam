'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, ArrowRight, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProductService } from '@/services/product-service';
import { cn } from '@/lib/utils';

const QuickSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsOpen(true);
      // We use the existing getAll but with limit and status filtering
      const response = await ProductService.getAll({
        search: searchQuery,
        limit: 6,
        all: false // Only show visible products to customers
      });
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Lỗi gợi ý tìm kiếm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleSelectProduct = (id: string) => {
    router.push(`/products/${id}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-[60]" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">
          <Search size={22} className="stroke-[3]" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Tìm sản phẩm (ví dụ: Daikin, Inverter...)"
          className="w-full h-14 md:h-16 pl-14 pr-12 rounded-[24px] bg-white border-2 border-transparent shadow-2xl focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="animate-spin text-primary" size={20} />
          ) : query && (
            <button 
              type="button" 
              onClick={() => { setQuery(''); setSuggestions([]); setIsOpen(false); }}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Suggestion Dropdown */}
      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full mt-3 w-full bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gợi ý sản phẩm</span>
            {suggestions.length > 0 && (
              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                Tìm thấy {suggestions.length}+
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {suggestions.length > 0 ? (
              <>
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-sky-50/50 transition-colors group text-left border-b border-slate-50 last:border-0"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 relative overflow-hidden border border-slate-100 shrink-0">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={16} /></div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h4>
                      <p className="text-xs font-black text-red-500">{(p.discount_price || p.price).toLocaleString()}đ</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
                <button 
                  onClick={handleSearchSubmit}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 text-center transition-colors"
                >
                  <span className="text-xs font-black text-primary uppercase italic tracking-tighter flex items-center justify-center gap-2">
                    Xem tất cả kết quả cho &quot;{query}&quot; <ArrowRight size={14} />
                  </span>
                </button>
              </>
            ) : !isLoading && (
              <div className="p-10 text-center">
                <SearchX size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">Không tìm thấy sản phẩm nào</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for empty search
const SearchX = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
  >
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m15 11-4-4"/><path d="m11 11 4 4"/>
  </svg>
);

export default QuickSearch;
