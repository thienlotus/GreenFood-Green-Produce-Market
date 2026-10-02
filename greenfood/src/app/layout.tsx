import type { Metadata } from "next";
import { Pacifico } from 'next/font/google';
import "./globals.css";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-pacifico',
  display: 'swap',
  fallback: ['cursive', 'sans-serif'],
});
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "GreenFood - Chợ Nông Sản Sạch Việt Nam",
  description: "Trái cây tươi, đặc sản vùng miền sạch từ nông hộ đến tay bạn.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`antialiased bg-gray-50 flex flex-col min-h-screen ${pacifico.variable}`}>
        <Toaster position="top-right" />
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
