'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Snowfall from "@/components/snowfall";
import { SettingsProvider } from "@/hooks/use-settings";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin');

  return (
    <SettingsProvider>
      <ThemeProvider>
        {!isAdminPath && <Snowfall />}
        {!isAdminPath && <Navbar />}
        <main className={`${!isAdminPath ? 'flex-grow pt-[72px] md:pt-[88px]' : 'h-screen'}`}>
          {children}
        </main>
        {!isAdminPath && <Footer />}
      </ThemeProvider>
    </SettingsProvider>
  );
}
