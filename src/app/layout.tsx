import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "@/components/root-layout-client";

const modernFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Điện Lạnh Minh Tâm - Máy Lạnh Chính Hãng Giá Rẻ Ninh Bình",
  description: "Điện Lạnh Minh Tâm chuyên cung cấp, lắp đặt, sửa chữa máy lạnh, tủ lạnh, máy giặt uy tín tại Ninh Bình.",
  keywords: "điện lạnh ninh bình, máy lạnh ninh bình, sửa máy lạnh, mua máy lạnh giá rẻ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${modernFont.variable} antialiased min-h-screen flex flex-col text-[17px] md:text-[19px] leading-relaxed`}
      >
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
