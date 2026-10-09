import { Pacifico, Be_Vietnam_Pro, Dancing_Script, Playfair_Display } from 'next/font/google';
import "./globals.css";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-pacifico',
  display: 'swap',
  fallback: ['cursive', 'sans-serif'],
});

const dancingScript = Dancing_Script({
  weight: ['400', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-dancing',
  display: 'swap',
  fallback: ['cursive', 'sans-serif'],
});

const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  fallback: ['Georgia', 'serif'],
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
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap&subset=vietnamese" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600;700&family=Caveat:wght@500;600;700&family=Playwrite+VN:wght@300;400&family=Alex+Brush&display=swap" rel="stylesheet" />
      </head>
      <body className={`antialiased bg-gray-50/60 font-sans flex flex-col min-h-screen ${pacifico.variable} ${dancingScript.variable} ${beVietnamPro.variable} ${playfair.variable}`}>
        <Toaster position="top-right" />
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
