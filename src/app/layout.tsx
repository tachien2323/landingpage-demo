import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cổng thông tin Bảo hiểm Khách hàng Demo — Bolttech Việt Nam",
  description:
    "Cổng thông tin dịch vụ khách hàng Demo của Bolttech Việt Nam: Tra cứu quyền lợi bảo hiểm sức khỏe & tai nạn, hướng dẫn bồi thường, tải biểu mẫu, hỏi đáp AI 24/7 và đăng ký bảo hiểm cho người thân.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7F8FC] text-[#180F50]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
