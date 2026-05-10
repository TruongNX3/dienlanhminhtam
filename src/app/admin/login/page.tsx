'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 md:p-10">
          <div className="flex justify-center mb-8">
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <ShieldAlert size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Admin Login</h1>
          <p className="text-slate-500 text-center mb-8">Đăng nhập để quản lý hệ thống Minh Tâm</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
              <ShieldAlert size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="admin@dienlanhminhtam.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-bold text-slate-700">Mật khẩu</label>
                <button type="button" className="text-xs text-primary hover:underline font-medium">Quên mật khẩu?</button>
              </div>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Đăng nhập'}
            </Button>
          </form>
        </div>
        <div className="bg-slate-50 p-6 border-t text-center">
          <p className="text-sm text-slate-500 italic">
            Truy cập bị hạn chế. Vui lòng liên hệ IT nếu bạn mất quyền truy cập.
          </p>
        </div>
      </div>
    </div>
  );
}
