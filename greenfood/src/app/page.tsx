"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Timer, ArrowRight, Truck, ShieldCheck, HeartHandshake, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  
  // Embla Carousel Hook
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Banners array
  const banners = [
    { id: 1, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop", title: "Trái Cây Sạch Hữu Cơ", desc: "Giảm đến 30% khi mua tại vườn" },
    { id: 2, image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=1920&auto=format&fit=crop", title: "Đặc Sản Trứ Danh", desc: "Giao hàng nhanh toàn quốc" },
    { id: 3, image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1920&auto=format&fit=crop", title: "Rau Củ Tươi Mới", desc: "Hái trực tiếp trong ngày" },
  ];

  const flashSaleProducts = [
    {
      id: "p1", name: "Sầu Riêng Ri6 Hạt Lép", slug: "sau-rieng-ri6", farmerName: "Vườn Trái Cây Chú Ba", region: "Bến Tre",
      image: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=600&auto=format&fit=crop",
      defaultPrice: 150000, originalPrice: 190000, defaultUnit: "Hộp 500g", defaultVariantId: "v1", badge: "Freeship", soldCount: 154
    },
    {
      id: "p2", name: "Bưởi Da Xanh Ruột Hồng", slug: "buoi-da-xanh", farmerName: "HTX Bưởi Da Xanh", region: "Vĩnh Long",
      image: "https://images.unsplash.com/photo-1557161189-ce564ad72591?q=80&w=600&auto=format&fit=crop",
      defaultPrice: 65000, originalPrice: 85000, defaultUnit: "Trái", defaultVariantId: "v2", badge: "VietGAP", soldCount: 42
    },
    {
      id: "p3", name: "Dưa Lưới Mật Hữu Cơ", slug: "dua-luoi-mat", farmerName: "Nông Trại Xanh", region: "Lâm Đồng",
      image: "https://images.unsplash.com/photo-1598468305048-fb2ce57bc6ff?q=80&w=600&auto=format&fit=crop",
      defaultPrice: 99000, originalPrice: 120000, defaultUnit: "Trái 1.5kg", defaultVariantId: "v3", badge: "Hữu cơ", soldCount: 89
    },
    {
      id: "p4", name: "Xoài Cát Hòa Lộc", slug: "xoai-cat-hoa-loc", farmerName: "Vườn Xoài Ông Năm", region: "Đồng Tháp",
      image: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=600&auto=format&fit=crop",
      defaultPrice: 120000, originalPrice: 150000, defaultUnit: "1kg", defaultVariantId: "v4", badge: "Mới về", soldCount: 20
    }
  ];

  const fruitProducts = [
    {
      id: "f1", name: "Dâu Tây Đà Lạt Cấp Đông", slug: "dau-tay", farmerName: "Đà Lạt Farm", region: "Đà Lạt",
      image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600&auto=format&fit=crop",
      defaultPrice: 220000, defaultUnit: "Hộp 1kg", defaultVariantId: "f1", soldCount: 200
    },
    {
      id: "f2", name: "Nho Mẫu Đơn Shine Muscat", slug: "nho-mau-don", farmerName: "Nhập khẩu Hàn Quốc", region: "Korea",
      image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=600&auto=format&fit=crop",
      defaultPrice: 450000, originalPrice: 500000, defaultUnit: "Chùm 600g", defaultVariantId: "f2", badge: "Cao cấp", soldCount: 15
    },
    {
      id: "f3", name: "Cam Sành Mọng Nước", slug: "cam-sanh", farmerName: "Miệt Vườn Miền Tây", region: "Vĩnh Long",
      image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=600&auto=format&fit=crop",
      defaultPrice: 35000, defaultUnit: "1kg", defaultVariantId: "f3", soldCount: 450
    },
    {
      id: "f4", name: "Chuối Laba Trứ Danh", slug: "chuoi-laba", farmerName: "Laba Farm", region: "Lâm Đồng",
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop",
      defaultPrice: 45000, defaultUnit: "Nải", defaultVariantId: "f4", soldCount: 120
    }
  ];

  const categories = [
    { name: "Đi chợ online", slug: "di-cho-online", icon: "🛒", bg: "bg-[#e8f5e9]" },
    { name: "Trái cây Việt", slug: "trai-cay", icon: "🍉", bg: "bg-[#fff3e0]" },
    { name: "Trà - Cà phê", slug: "tra-ca-phe", icon: "☕", bg: "bg-[#e0f2f1]" },
    { name: "Đặc sản", slug: "dac-san", icon: "🎁", bg: "bg-[#fdf3c6]" },
    { name: "Agrishow", slug: "agrishow", icon: "🌾", bg: "bg-[#f3e5f5]" },
    { name: "Rau củ hữu cơ", slug: "di-cho-online", icon: "🥬", bg: "bg-[#e8f5e9]" },
    { name: "Khuyến mãi", slug: "di-cho-online", icon: "🔥", bg: "bg-[#ffebee]" },
    { name: "Bản đồ Vườn", slug: "map", isMap: true, icon: "📍", bg: "bg-[#e1f5fe]" },
    { name: "Theo dõi đơn", slug: "tracking", isTracking: true, icon: "📦", bg: "bg-[#fce4ec]" },
    { name: "Nông hộ sạch", slug: "map", isMap: true, icon: "👨‍🌾", bg: "bg-[#e8eaf6]" },
  ];

  return (
    <div className="bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main Slider ( chiếm 2/3 ) */}
          <div className="lg:col-span-2 overflow-hidden rounded-2xl relative" ref={emblaRef}>
            <div className="flex h-[300px] md:h-[400px]">
              {banners.map((banner) => (
                <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{banner.title}</h2>
                    <p className="text-emerald-50 text-lg">{banner.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Banners ( chiếm 1/3 ) */}
          <div className="hidden lg:flex flex-col gap-4 h-[400px]">
            <Link href="/category/trai-cay" className="flex-1 rounded-2xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            </Link>
            <Link href="/category/dac-san" className="flex-1 rounded-2xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid (Foodmap Style) */}
      <section className="container mx-auto px-4 lg:px-8 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {categories.map((cat, idx) => (
              <Link 
                href={cat.isMap ? '/map' : cat.isTracking ? '/tracking' : `/category/${cat.slug}`} 
                key={idx} 
                className="flex flex-col items-center group cursor-pointer gap-2"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl ${cat.bg} group-hover:-translate-y-1 transition-transform duration-300 shadow-2xs`}>
                  {cat.icon}
                </div>
                <span className="text-[11px] md:text-xs font-medium text-gray-700 text-center leading-tight group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section id="flash-sale" className="container mx-auto px-4 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-[#d32f2f] to-[#f44336] rounded-t-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              Deal Chớp Nhoáng ⚡
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="bg-black/20 text-white font-bold px-2 py-1 rounded text-sm w-8 text-center backdrop-blur-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-white font-bold">:</span>
              <span className="bg-black/20 text-white font-bold px-2 py-1 rounded text-sm w-8 text-center backdrop-blur-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-white font-bold">:</span>
              <span className="bg-black/20 text-white font-bold px-2 py-1 rounded text-sm w-8 text-center backdrop-blur-sm">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <Link href="#" className="text-white font-medium hover:underline flex items-center gap-1 text-sm bg-white/10 px-4 py-2 rounded-full self-start md:self-auto transition-colors hover:bg-white/20">
            Xem tất cả <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-b-2xl shadow-sm border border-t-0 border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {flashSaleProducts.map((product) => (
              <ProductCard key={`flash-${product.id}`} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trái cây Việt Nam */}
      <section className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-500 inline-block rounded-full"></span>
            Trái Cây Việt Nam
          </h2>
          <Link href="/category/trai-cay" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center">
            Xem thêm <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {fruitProducts.map((product) => (
            <ProductCard key={`fruit-${product.id}`} {...product} />
          ))}
          {/* Duplicate to fill the row */}
          {flashSaleProducts.slice(0, 4).map((product) => (
            <ProductCard key={`fruit-dup-${product.id}`} {...product} />
          ))}
        </div>
      </section>

      {/* Quà tặng Đặc Sản */}
      <section className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 inline-block rounded-full"></span>
            Đặc Sản Quà Tặng
          </h2>
          <Link href="/category/dac-san" className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center">
            Xem thêm <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {fruitProducts.slice(2, 4).map((product) => (
            <ProductCard key={`gift-${product.id}`} {...product} badge="Combo" />
          ))}
          {flashSaleProducts.slice(1, 3).map((product) => (
            <ProductCard key={`gift-dup-${product.id}`} {...product} badge="Quà Biếu" />
          ))}
        </div>
      </section>
      
      {/* Brands / Partners Section */}
      <section className="container mx-auto px-4 lg:px-8 py-10 mt-8 border-t border-gray-200">
        <h3 className="text-center text-gray-400 font-semibold mb-6 uppercase tracking-widest text-sm">Đối tác đồng hành</h3>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="font-bold text-2xl">VietGAP</div>
          <div className="font-bold text-2xl">GlobalGAP</div>
          <div className="font-bold text-2xl">OCOP 4 Sao</div>
          <div className="font-bold text-2xl">HACCP</div>
          <div className="font-bold text-2xl">ISO 22000</div>
        </div>
      </section>
    </div>
  );
}
