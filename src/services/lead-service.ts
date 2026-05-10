import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type LeadInsert = Database['public']['Tables']['leads']['Insert'];

export const LeadService = {
  async create(lead: LeadInsert) {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(options: { page?: number, pageSize?: number, status?: string } = {}) {
    let query = supabase
      .from('leads')
      .select('*, products(name)', { count: 'exact' });

    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options.page && options.pageSize) {
      const from = (options.page - 1) * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return {
      data: data || [],
      count: count || 0
    };
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async checkPhoneExists(phone: string) {
    // Gọi thông qua RPC để đảm bảo bảo mật và không bị chặn bởi RLS SELECT
    const { data, error } = await supabase
      .rpc('check_lead_exists', { p_phone: phone });
    
    if (error) {
      console.error('Lỗi khi kiểm tra số điện thoại:', error.message);
      return false; // Nếu lỗi, cho phép gửi tiếp để không chặn khách hàng
    }
    return !!data;
  }
};
