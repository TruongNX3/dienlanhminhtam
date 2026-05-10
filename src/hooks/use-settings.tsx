'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsService, StoreInfo } from '@/services/settings-service';

interface SettingsContextType {
  storeInfo: StoreInfo;
  loading: boolean;
}

const defaultStoreInfo: StoreInfo = {
  name: "Điện Lạnh Minh Tâm",
  addresses: ["Lô 18-19, KĐT Dệt May, Nam Định, Ninh Bình"],
  phone: "0817.751.946",
  email: "contact@dienlanhminhtam.com",
  facebook: "https://www.facebook.com/dienlanhminhtam",
  about: "Chuyên mua bán, sửa chữa máy lạnh, tủ lạnh, máy giặt uy tín tại Ninh Bình.",
  warranty_policy: "Bảo hành chính hãng 12-24 tháng tùy dòng sản phẩm.",
  zalo: "0817.751.946",
  working_hours: "7h00 - 20h00 hàng ngày"
};

const SettingsContext = createContext<SettingsContextType>({
  storeInfo: defaultStoreInfo,
  loading: true,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(defaultStoreInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await SettingsService.getStoreInfo();
        setStoreInfo(data);
      } catch (error) {
        console.error('Lỗi lấy cấu hình từ Provider:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ storeInfo, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
