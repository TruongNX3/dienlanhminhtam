'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  User,
  Settings,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/use-settings';

const sidebarItems = [
  { label: 'Tổng quan', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Sản phẩm', href: '/admin/products', icon: <Package size={20} /> },
  { label: 'Yêu cầu liên hệ', href: '/admin/leads', icon: <MessageSquare size={20} /> },
  { label: 'Cài đặt', href: '/admin/settings', icon: <Settings size={20} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { storeInfo } = useSettings();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (session) {
        setAdminEmail(session.user.email ?? null);
        if (pathname === '/admin/login') {
          router.push('/admin/dashboard');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <div className="h-screen w-full bg-slate-50">{children}</div>;
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-sky-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
      {/* Sidebar Desktop - FIXED */}
      <aside className="hidden lg:flex flex-col w-64 bg-sky-600 text-white shrink-0 shadow-2xl h-full relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-400/20 rounded-full -ml-16 -mb-16 blur-2xl" />

        <div className="p-6 h-20 flex flex-col justify-center border-b border-white/10 relative z-10 shrink-0">
          <span className="text-xl font-black italic tracking-tighter uppercase leading-none">
            {storeInfo.name.split(' ').slice(0, 2).join(' ')}
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 mt-1">
            Admin Portal
          </span>
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-4 relative z-10 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-white text-sky-600 shadow-xl shadow-sky-700/20 font-black" 
                    : "text-sky-50 hover:bg-white/10 hover:translate-x-1 font-bold"
                )}
              >
                <div className={cn(
                  "transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}>
                  {item.icon}
                </div>
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-0 h-full w-1.5 bg-sky-600 rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 relative z-10 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-4 rounded-2xl text-sky-100 hover:bg-red-500 hover:text-white transition-all duration-200 font-bold group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm">Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - SCROLLABLE */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header - FIXED inside content area */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100" 
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Trang quản trị</h2>
              <p className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">
                {sidebarItems.find(item => item.href === pathname)?.label || 'Bảng điều khiển'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none mb-1">{adminEmail?.split('@')[0] || 'Administrator'}</p>
              <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{adminEmail || 'admin@minhtam.com'}</p>
            </div>
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 border border-sky-100 shadow-inner group cursor-pointer hover:bg-white hover:shadow-md transition-all">
              <User size={24} className="group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-grow overflow-y-auto p-6 md:p-10 scroll-smooth bg-slate-50">
          <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          <aside className="absolute inset-y-0 left-0 w-[300px] bg-sky-600 text-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-8 h-24 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex flex-col">
                <span className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                  {storeInfo.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-xs font-bold tracking-widest uppercase opacity-70 mt-1">Admin Portal</span>
              </div>
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-white/10 text-white" onClick={() => setIsMobileOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            
            <nav className="flex-grow p-6 space-y-3 mt-4 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all",
                      isActive 
                        ? "bg-white text-sky-600 font-black shadow-xl" 
                        : "text-sky-50 hover:bg-white/10 font-bold"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.icon}
                    <span className="text-base uppercase italic tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-6 border-t border-white/10 shrink-0">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-6 py-5 rounded-[2rem] text-sky-100 hover:bg-red-500 hover:text-white transition-all font-black uppercase italic tracking-widest text-xs"
              >
                <LogOut size={20} /> Đăng xuất
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
