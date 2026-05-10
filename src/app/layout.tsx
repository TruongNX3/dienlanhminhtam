'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Snowfall from "@/components/snowfall";
import { SettingsProvider } from "@/hooks/use-settings";

const modernFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin');

  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${modernFont.variable} antialiased min-h-screen flex flex-col text-[17px] md:text-[19px] leading-relaxed`}
      >
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
      </body>
    </html>
  );
}
