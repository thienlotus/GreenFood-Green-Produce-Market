import { Pacifico, Be_Vietnam_Pro } from 'next/font/google';
import "./globals.css";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-pacifico',
  display: 'swap',
  fallback: ['cursive', 'sans-serif'],
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import type { Metadata } from "next";
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
      <body className={`antialiased bg-gray-50/60 font-sans flex flex-col min-h-screen ${pacifico.variable} ${beVietnamPro.variable}`}>
        <Toaster position="top-right" />
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
