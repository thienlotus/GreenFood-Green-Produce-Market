import type { Metadata } from "next";
import { Pacifico } from 'next/font/google';
import "./globals.css";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-pacifico',
});
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "GreenFood - Chợ Nông Sản Sạch Việt Nam",
  description: "Trái cây tươi, đặc sản vùng miền sạch từ nông hộ đến tay bạn.",
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
        <Navbar />
        <CartDrawer />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
