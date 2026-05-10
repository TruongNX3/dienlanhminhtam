'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Phone, User, LogOut, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/hooks/use-settings';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const { storeInfo, loading: settingsLoading } = useSettings();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Liên hệ', href: '/contact' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 w-full z-[100] bg-sky-600 shadow-lg py-3 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col group">
            <span className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:scale-105 transition-transform origin-left">
              {settingsLoading ? '...' : storeInfo.name.split(' ').slice(0, 2).join(' ')}
            </span>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-90 text-sky-100">
              {settingsLoading ? '...' : storeInfo.name.split(' ').slice(2).join(' ')}
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-black uppercase italic tracking-wider transition-all hover:text-white relative group ${
                    pathname === link.href ? 'text-white underline underline-offset-8 decoration-2' : 'text-sky-50 opacity-80 hover:opacity-100'
                  }`}
                >
                  {link.name}
                  {pathname !== link.href && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              ))}
            </div>

            <div className="h-8 w-px bg-sky-500/50 mx-2" />

            <div className="flex items-center gap-5">
              <Link href={`tel:${storeInfo.phone.replace(/\./g, '')}`} className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-sky-600 transition-all shadow-md">
                  <Phone size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-sky-100 uppercase tracking-widest leading-none mb-0.5">Hotline 24/7</span>
                  <span className="text-sm font-black text-white group-hover:text-sky-100 transition-colors">{settingsLoading ? '...' : storeInfo.phone}</span>
                </div>
              </Link>

              <Link href="/cart" className="relative group">
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-sky-600 transition-all shadow-xl group-hover:-translate-y-1">
                  <ShoppingCart size={22} />
                </div>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-sky-600 shadow-lg animate-bounce">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {user && (
                <div className="relative">
                  <button 
                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                    className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-sky-600 transition-all border border-white/30"
                  >
                    <User size={22} />
                  </button>
                  
                  {showAdminMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-50 mb-2 text-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đã đăng nhập</p>
                        <p className="text-xs font-black truncate">{user.email}</p>
                      </div>
                      <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors">
                        <LayoutDashboard size={18} className="text-sky-600" /> Quản trị
                      </Link>
                      <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors">
                        <SettingsIcon size={18} className="text-orange-500" /> Cài đặt
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-600 transition-colors mt-2"
                      >
                        <LogOut size={18} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart size={24} className="text-white" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-sky-600 shadow-md">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl transition-all bg-white/20 text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[64px] bg-sky-600 z-50 p-6 animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="space-y-6 flex-grow">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block text-2xl font-black uppercase italic tracking-tighter ${
                  pathname === link.href ? 'text-white border-l-4 border-white pl-4' : 'text-sky-100 opacity-80'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="h-px bg-white/20 w-full" />
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-sky-100 uppercase tracking-widest leading-none mb-1">Hotline hỗ trợ</p>
                  <p className="text-xl font-black text-white italic">{settingsLoading ? '...' : storeInfo.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full h-14 rounded-2xl bg-white text-sky-600 font-black uppercase italic shadow-xl">
                    <LayoutDashboard className="mr-2" size={20} /> Quản trị
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="w-full h-14 rounded-2xl text-white border-white/30 font-bold uppercase italic">
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-14 rounded-2xl bg-white text-sky-600 font-black uppercase italic shadow-xl">
                  Đăng nhập Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
