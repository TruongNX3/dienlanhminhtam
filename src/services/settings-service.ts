import { supabase } from '@/lib/supabase';

export interface StoreInfo {
  name: string;
  addresses: string[];
  phone: string;
  email: string;
  facebook: string;
  about: string;
  warranty_policy: string;
  zalo: string;
  working_hours: string;
  // Bổ sung cấu hình banner
  main_banner: string;
  sub_banner_1: string;
  sub_banner_2: string;
}

export const SettingsService = {
  async getStoreInfo(): Promise<StoreInfo> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'store_info')
      .single();
    
    const defaultData: StoreInfo = {
      name: "Điện Lạnh Minh Tâm",
      addresses: ["Lô 18-19, KĐT Dệt May, Nam Định, Ninh Bình"],
      phone: "0817.751.946",
      email: "contact@dienlanhminhtam.com",
      facebook: "https://www.facebook.com/dienlanhminhtam",
      about: "Chuyên mua bán, sửa chữa máy lạnh, tủ lạnh, máy giặt uy tín.",
      warranty_policy: "Bảo hành chính hãng từ 12-24 tháng.",
      zalo: "0817.751.946",
      working_hours: "7h00 - 20h00 hàng ngày",
      main_banner: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=1200",
      sub_banner_1: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
      sub_banner_2: "https://images.unsplash.com/photo-1581092921461-7d6570975896?auto=format&fit=crop&q=80&w=800"
    };

    if (error) {
      console.warn('Lỗi lấy cấu hình, dùng dữ liệu mặc định:', error.message);
      return defaultData;
    }
    
    const value = data.value;
    
    // Đảm bảo dữ liệu cũ tương thích với cấu trúc mới
    if (value.address && !value.addresses) {
      value.addresses = [value.address];
    }
    
    return {
      ...defaultData,
      ...value
    } as StoreInfo;
  },

  async updateStoreInfo(info: StoreInfo, updatedBy: string) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ 
        id: 'store_info', 
        value: info, 
        updated_by: updatedBy 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
