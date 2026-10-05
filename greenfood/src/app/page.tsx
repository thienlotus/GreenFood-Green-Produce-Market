"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  ArrowRight, Truck, ShieldCheck, RefreshCw, CreditCard, ChevronRight, ChevronLeft,
  Zap, Flame, Sparkles, Tag, Copy, Check, Leaf, Award, MapPin, Package, Heart, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import { getProducts, type ProductItem } from '@/lib/api';
import { ALL_PRODUCTS } from '@/data/products';

/* ----------------------------- Dữ liệu tĩnh ----------------------------- */

const BANNERS = [
  {
    id: 1,
    image: '/banners/hero-fresh-produce.jpg',
    tag: 'Mùa vụ mới 2026',
    title: 'Nông sản sạch\ntừ vườn đến bếp',
    desc: 'Thu hoạch trong ngày, giao nhanh 2H nội thành. Giảm đến 30% cho đơn đầu tiên.',
    cta: 'Mua sắm ngay',
    href: '/category/di-cho-online',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=1600&auto=format&fit=crop',
    tag: 'Đặc sản 3 miền',
    title: 'Đặc sản trứ danh\nquà biếu sang trọng',
    desc: 'Sầu riêng Ri6, bưởi da xanh, mật ong rừng tràm — đóng hộp quà tinh tế.',
    cta: 'Khám phá đặc sản',
    href: '/category/dac-san',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1600&auto=format&fit=crop',
    tag: 'Chuẩn VietGAP',
    title: 'Rau củ hữu cơ\ntươi mới mỗi ngày',
    desc: 'Truy xuất nguồn gốc từng nông hộ, minh bạch trên bản đồ vùng trồng.',
    cta: 'Xem vùng trồng',
    href: '/map',
  },
];

const SIDEBAR_CATEGORIES = [
  { name: 'Đi chợ online', href: '/category/di-cho-online', icon: '🛒' },
  { name: 'Trái cây tươi ngon', href: '/category/trai-cay', icon: '🍉' },
  { name: 'Đặc sản vùng miền', href: '/category/dac-san', icon: '🎁' },
  { name: 'Trà - Cà phê - Socola', href: '/category/tra-ca-phe', icon: '☕' },
  { name: 'Agrishow Triển lãm', href: '/category/agrishow', icon: '🌾' },
  { name: 'Bản đồ vùng trồng', href: '/map', icon: '📍' },
  { name: 'Nông hộ đối tác', href: '/farmers', icon: '👨‍🌾' },
  { name: 'Theo dõi đơn hàng', href: '/tracking', icon: '📦' },
];

const QUICK_LINKS = [
  { name: 'Đi chợ online', href: '/category/di-cho-online', icon: '🛒', bg: 'bg-emerald-50/80 border-emerald-100 text-emerald-800' },
  { name: 'Trái cây Việt', href: '/category/trai-cay', icon: '🍉', bg: 'bg-orange-50/80 border-orange-100 text-orange-800' },
  { name: 'Trà - Cà phê', href: '/category/tra-ca-phe', icon: '☕', bg: 'bg-teal-50/80 border-teal-100 text-teal-800' },
  { name: 'Đặc sản', href: '/category/dac-san', icon: '🎁', bg: 'bg-amber-50/80 border-amber-100 text-amber-800' },
  { name: 'Agrishow', href: '/category/agrishow', icon: '🌾', bg: 'bg-purple-50/80 border-purple-100 text-purple-800' },
  { name: 'Deal sốc', href: '#flash-sale', icon: '🔥', bg: 'bg-rose-50/80 border-rose-100 text-rose-800' },
  { name: 'Mã giảm giá', href: '#vouchers', icon: '🎟️', bg: 'bg-pink-50/80 border-pink-100 text-pink-800' },
  { name: 'Bản đồ vườn', href: '/map', icon: '📍', bg: 'bg-sky-50/80 border-sky-100 text-sky-800' },
  { name: 'Theo dõi đơn', href: '/tracking', icon: '📦', bg: 'bg-indigo-50/80 border-indigo-100 text-indigo-800' },
  { name: 'Nông hộ sạch', href: '/farmers', icon: '👨‍🌾', bg: 'bg-lime-50/80 border-lime-100 text-lime-800' },
];

const USPS = [
  { icon: Truck, title: 'Giao nhanh 2H', desc: 'Nội thành TP.HCM & Hà Nội' },
  { icon: ShieldCheck, title: 'Chuẩn VietGAP', desc: 'Truy xuất nguồn gốc 100%' },
  { icon: RefreshCw, title: 'Đổi trả 24H', desc: 'Bảo hành tươi ngon tận bàn' },
  { icon: CreditCard, title: 'Thanh toán linh hoạt', desc: 'COD • MoMo • VNPay' },
];

const VOUCHERS = [
  { code: 'GREEN10', title: 'Giảm 10%', desc: 'Tối đa 50K cho đơn từ 100K', color: 'from-emerald-600 to-teal-600' },
  { code: 'FREESHIP', title: 'Miễn phí ship', desc: 'Giảm đến 30K cho đơn từ 150K', color: 'from-sky-600 to-indigo-600' },
  { code: 'CHAOBANMOI', title: 'Giảm 20K', desc: 'Cho đơn đầu tiên từ 50K', color: 'from-amber-500 to-rose-500' },
];

const CERTIFICATIONS = ['VietGAP', 'GlobalGAP', 'OCOP 4 Sao', 'HACCP', 'ISO 22000'];

type TabKey = 'popular' | 'newest' | 'deal';
const TABS: { key: TabKey; label: string; icon: typeof Flame }[] = [
  { key: 'popular', label: 'Bán chạy nhất', icon: Flame },
  { key: 'newest', label: 'Mới thu hoạch', icon: Sparkles },
  { key: 'deal', label: 'Giá ưu đãi', icon: Tag },
];

/* ------------------------------ Tiện ích ------------------------------ */

function toCardProps(p: ProductItem) {
  const v = p.variants?.[0];
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    farmerName: p.farmer?.name || 'Nông hộ GreenFood',
    region: p.farmer?.region || 'Việt Nam',
    image: p.images?.[0] || '',
    defaultPrice: v?.price ?? 0,
    originalPrice: v?.comparePrice,
    defaultUnit: v?.unit || '1kg',
    defaultVariantId: String(v?.id ?? p.id),
    badge: p.badge,
    rating: p.rating,
    soldCount: p.soldCount,
  };
}

function discountOf(p: ProductItem) {
  const v = p.variants?.[0];
  if (!v?.comparePrice || v.comparePrice <= v.price) return 0;
  return (v.comparePrice - v.price) / v.comparePrice;
}

function getTimeUntilMidnight() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const diff = Math.max(0, end.getTime() - now.getTime());
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

/* ------------------------------ Component ------------------------------ */

function SectionHeader({ 
  title, 
  subtitle,
  accent = 'bg-emerald-500', 
  href, 
  linkLabel = 'Xem tất cả', 
  children 
}: {
  title: string; 
  subtitle?: string;
  accent?: string; 
  href?: string; 
  linkLabel?: string; 
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className={`w-2 h-6 md:h-7 ${accent} rounded-full shadow-xs`} />
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs md:text-sm text-gray-500 ml-4 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {href && (
          <Link 
            href={href} 
            className="hidden sm:inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50/80 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full transition-all border border-emerald-200/60 shadow-xs"
          >
            {linkLabel} <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/80 rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-sm">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3.5 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

const GRID = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4';

export default function Home() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('popular');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [selectedSlide, setSelectedSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedSlide(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeUntilMidnight());
    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getProducts({ limit: 50 })
      .then((data) => { if (!cancelled) setProducts(data.length ? data : ALL_PRODUCTS); })
      .catch(() => { if (!cancelled) setProducts(ALL_PRODUCTS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const flashSale = useMemo(() => {
    const discounted = products.filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a));
    return (discounted.length >= 5 ? discounted : [...discounted, ...products.filter((p) => discountOf(p) === 0)]).slice(0, 5);
  }, [products]);

  const tabProducts = useMemo(() => {
    const list = [...products];
    if (activeTab === 'popular') list.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    if (activeTab === 'deal') list.sort((a, b) => (a.variants?.[0]?.price ?? 0) - (b.variants?.[0]?.price ?? 0));
    return list.slice(0, 10);
  }, [products, activeTab]);

  const byCategory = useCallback(
    (slug: string) => products.filter((p) => p.categorySlug === slug).slice(0, 4),
    [products]
  );
  const fruits = byCategory('trai-cay');
  const specialties = byCategory('dac-san');

  const handleCopyVoucher = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Đã sao chép mã ưu đãi ${code}!`, {
        icon: '🎟️',
        style: {
          borderRadius: '12px',
          background: '#064e3b',
          color: '#fff',
        }
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast(`Mã của bạn: ${code}`, { icon: '🎟️' });
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen bg-watermark-pattern pb-20 relative overflow-hidden">
      <h1 className="sr-only">GreenFood - Chợ Nông Sản Sạch Việt Nam</h1>

      {/* Vùng hào quang ánh sáng tự nhiên dịu mắt */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 left-0 w-[450px] h-[450px] bg-amber-500/[0.015] rounded-full blur-3xl pointer-events-none" />

      {/* ============================ HERO ============================ */}
      <section className="container mx-auto px-4 lg:px-8 pt-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Sidebar danh mục sản phẩm (Desktop) */}
          <aside className="hidden xl:flex xl:col-span-3 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[410px]">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white font-bold text-sm flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-2">
                <Leaf size={16} className="text-emerald-300" /> Danh mục nông sản
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">VietGAP</span>
            </div>
            <ul className="flex-1 divide-y divide-gray-50 text-sm overflow-y-auto">
              {SIDEBAR_CATEGORIES.map((c) => (
                <li key={c.name}>
                  <Link
                    href={c.href}
                    className="flex items-center justify-between px-5 py-2.5 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/70 hover:pl-6 transition-all duration-200 group font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">{c.icon}</span>
                      <span>{c.name}</span>
                    </span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-600 transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Carousel Banner chính */}
          <div className="lg:col-span-8 xl:col-span-6 relative rounded-3xl overflow-hidden shadow-elevated-card border border-emerald-950/10 group h-[280px] sm:h-[350px] lg:h-[410px]">
            <div ref={emblaRef} className="overflow-hidden h-full">
              <div className="flex h-full">
                {BANNERS.map((b) => (
                  <div key={b.id} className="relative flex-[0_0_100%] min-w-0 h-full">
                    <img
                      src={b.image}
                      alt={b.title.replace('\n', ' ')}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white max-w-lg">
                      <span className="glass-pill text-[11px] font-bold text-emerald-900 px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-flex items-center gap-1.5 self-start shadow-sm">
                        <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                        {b.tag}
                      </span>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight whitespace-pre-line drop-shadow-md">
                        {b.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-200 mt-2 line-clamp-2 drop-shadow">
                        {b.desc}
                      </p>
                      <Link
                        href={b.href}
                        className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full self-start shadow-lg shadow-emerald-950/30 hover:gap-3 transition-all duration-300"
                      >
                        {b.cta} <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Banner trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Banner tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight size={20} />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {BANNERS.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Chuyển tới banner ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${selectedSlide === i ? 'w-7 bg-amber-400' : 'w-2 bg-white/60 hover:bg-white'}`}
                />
              ))}
            </div>
          </div>

          {/* 2 Banner phụ (Desktop) */}
          <div className="hidden lg:grid lg:col-span-4 xl:col-span-3 grid-rows-2 gap-4 h-[410px]">
            <Link href="/category/trai-cay" className="relative rounded-3xl overflow-hidden group shadow-elevated-card border border-emerald-950/10">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop"
                alt="Trái cây tươi"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-950/85 via-orange-950/30 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/40 px-2 py-0.5 rounded-md">Trái cây chín cây</span>
                <p className="text-xl font-extrabold mt-1">Giảm đến 25%</p>
                <span className="text-xs inline-flex items-center gap-1 mt-1 font-medium text-orange-200 group-hover:gap-2 transition-all">Mua ngay <ArrowRight size={13} /></span>
              </div>
            </Link>

            <Link href="/category/tra-ca-phe" className="relative rounded-3xl overflow-hidden group shadow-elevated-card border border-emerald-950/10">
              <img
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop"
                alt="Trà và cà phê"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-black/40 px-2 py-0.5 rounded-md">Trà & Cà phê Mộc</span>
                <p className="text-xl font-extrabold mt-1">Rang mộc 100%</p>
                <span className="text-xs inline-flex items-center gap-1 mt-1 font-medium text-amber-200 group-hover:gap-2 transition-all">Khám phá <ArrowRight size={13} /></span>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* ============================ USPS (LỢI ÍCH DỊCH VỤ) ============================ */}
      <section className="container mx-auto px-4 lg:px-8 mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {USPS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className={`flex items-center gap-3.5 p-3 lg:px-6 ${i % 2 === 1 ? 'border-l lg:border-l-0 border-gray-100' : ''}`}>
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= QUICK LINKS (DANH MỤC TRUY CẬP NHANH) ========================= */}
      <section className="container mx-auto px-4 lg:px-8 mt-6 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-y-5 gap-x-2">
            {QUICK_LINKS.map((c) => (
              <Link key={c.name} href={c.href} className="flex flex-col items-center gap-2 group">
                <div className={`w-13 h-13 md:w-15 md:h-15 rounded-2xl ${c.bg} flex items-center justify-center text-2xl md:text-3xl border shadow-xs group-hover:-translate-y-1.5 group-hover:shadow-md transition-all duration-300`}>
                  {c.icon}
                </div>
                <span className="text-[11px] md:text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-emerald-700 transition-colors">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== FLASH SALE ========================== */}
      <section id="flash-sale" className="container mx-auto px-4 lg:px-8 mt-10 scroll-mt-28 relative z-10">
        <div className="rounded-3xl overflow-hidden border border-rose-200/80 bg-white/95 backdrop-blur-md shadow-elevated-card">
          <div className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 px-5 md:px-8 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tight flex items-center gap-2">
                <Zap size={24} className="fill-yellow-300 text-yellow-300 animate-bounce" /> FLASH SALE NÔNG SẢN
              </h2>
              <div className="flex items-center gap-2 text-white">
                <span className="text-xs md:text-sm font-medium text-white/90">Kết thúc trong:</span>
                <div className="flex items-center gap-1.5 font-mono" suppressHydrationWarning>
                  {[
                    mounted ? timeLeft.hours : 0,
                    mounted ? timeLeft.minutes : 0,
                    mounted ? timeLeft.seconds : 0,
                  ].map((n, i) => (
                    <span key={i} className="flex items-center gap-1.5" suppressHydrationWarning>
                      <span
                        className="bg-black/60 text-white font-extrabold text-sm min-w-[2.2rem] text-center px-1.5 py-1 rounded-lg border border-white/20 shadow-inner"
                        suppressHydrationWarning
                      >
                        {mounted ? pad(n) : '00'}
                      </span>
                      {i < 2 && <span className="font-bold text-amber-300">:</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link 
              href="/category/di-cho-online" 
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-rose-950 bg-white hover:bg-amber-100 px-4 py-2 rounded-full transition-all shadow-sm"
            >
              Xem tất cả deal <ChevronRight size={16} />
            </Link>
          </div>
          <div className={`p-4 md:p-6 ${GRID}`}>
            {loading ? <ProductGridSkeleton /> : flashSale.map((p) => (
              <ProductCard key={`flash-${p.id}`} {...toCardProps(p)} showSoldProgress />
            ))}
          </div>
        </div>
      </section>

      {/* =========================== VOUCHERS =========================== */}
      <section id="vouchers" className="container mx-auto px-4 lg:px-8 mt-10 scroll-mt-28 relative z-10">
        <SectionHeader 
          title="Mã giảm giá hôm nay" 
          subtitle="Áp dụng ngay khi thanh toán đơn hàng nông sản"
          accent="bg-pink-500" 
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VOUCHERS.map((v) => (
            <div 
              key={v.code} 
              className="relative flex bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-900/10 overflow-hidden shadow-elevated-card hover:shadow-elevated-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-24 shrink-0 bg-gradient-to-br ${v.color} text-white flex flex-col items-center justify-center p-3 shadow-inner`}>
                <Tag size={24} className="text-white/90" />
                <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">Voucher</span>
              </div>
              
              {/* Răng cưa vé giảm giá */}
              <span className="absolute left-[5.5rem] -top-2 w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200/50" />
              <span className="absolute left-[5.5rem] -bottom-2 w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200/50" />
              
              <div className="flex-1 flex items-center justify-between gap-3 p-4 pl-6 border-l-2 border-dashed border-gray-200">
                <div className="min-w-0">
                  <p className="font-extrabold text-gray-900 text-sm md:text-base">{v.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
                  <span className="inline-block text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 mt-1.5">
                    {v.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyVoucher(v.code)}
                  className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs ${
                    copiedCode === v.code 
                      ? 'bg-emerald-700 text-white' 
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 active:scale-95'
                  }`}
                >
                  {copiedCode === v.code ? <><Check size={14} /> Đã chép</> : <><Copy size={14} /> Sao chép</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= GỢI Ý HÔM NAY (TABS) ======================= */}
      <section className="container mx-auto px-4 lg:px-8 mt-12 relative z-10">
        <SectionHeader 
          title="Gợi ý hôm nay" 
          subtitle="Sản phẩm tươi thu hoạch trực tiếp từ các nhà vườn chuẩn VietGAP"
          href="/category/di-cho-online"
        >
          <div className="flex bg-white/90 backdrop-blur border border-emerald-200/60 rounded-full p-1 shadow-xs">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                id={`home-tab-${key}`}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3.5 md:px-4 py-1.5 rounded-full transition-all duration-300 ${
                  activeTab === key 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </SectionHeader>
        <div className={GRID}>
          {loading ? <ProductGridSkeleton count={10} /> : tabProducts.map((p) => (
            <ProductCard key={`tab-${activeTab}-${p.id}`} {...toCardProps(p)} />
          ))}
        </div>
      </section>

      {/* ===================== DANH MỤC NỔI BẬT (Trái cây + Đặc sản) ===================== */}
      {[
        {
          key: 'fruits',
          title: 'Trái cây Việt Nam',
          subtitle: 'Đặc sản nhiệt đới chín cây tự nhiên, mọng nước ngọt thanh',
          accent: 'bg-orange-500',
          href: '/category/trai-cay',
          items: fruits,
          banner: {
            image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800&auto=format&fit=crop',
            overlay: 'from-orange-950/90 via-orange-900/40 to-transparent',
            kicker: 'Chín cây tự nhiên',
            title: 'Trái cây\nmiệt vườn',
          },
        },
        {
          key: 'specialties',
          title: 'Đặc sản quà tặng 3 miền',
          subtitle: 'Hương vị truyền thống trứ danh từ các hợp tác xã làng nghề',
          accent: 'bg-amber-500',
          href: '/category/dac-san',
          items: specialties,
          banner: {
            image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
            overlay: 'from-emerald-950/90 via-emerald-900/40 to-transparent',
            kicker: 'Hộp quà sang trọng',
            title: 'Đặc sản\nba miền',
          },
        },
      ].map((section) =>
        !loading && section.items.length === 0 ? null : (
          <section key={section.key} className="container mx-auto px-4 lg:px-8 mt-12 relative z-10">
            <SectionHeader 
              title={section.title} 
              subtitle={section.subtitle}
              accent={section.accent} 
              href={section.href} 
              linkLabel="Xem thêm" 
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              <Link
                href={section.href}
                className="hidden xl:flex relative rounded-2xl overflow-hidden group min-h-[360px] shadow-elevated-card border border-emerald-950/10"
              >
                <img 
                  src={section.banner.image} 
                  alt={section.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${section.banner.overlay}`} />
                <div className="relative mt-auto p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{section.banner.kicker}</p>
                  <p className="text-2xl font-extrabold leading-tight mt-1 whitespace-pre-line drop-shadow-md">{section.banner.title}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full group-hover:gap-2.5 transition-all shadow-md">
                    Xem thêm <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
              {loading ? <ProductGridSkeleton count={4} /> : section.items.map((p) => (
                <ProductCard key={`${section.key}-${p.id}`} {...toCardProps(p)} />
              ))}
            </div>
            <Link 
              href={section.href} 
              className="sm:hidden mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-emerald-800 bg-white border border-emerald-200 rounded-full py-2.5 shadow-xs"
            >
              Xem thêm {section.title.toLowerCase()} <ChevronRight size={16} />
            </Link>
          </section>
        )
      )}

      {/* ========================= VÌ SAO CHỌN GREENFOOD ========================= */}
      <section className="container mx-auto px-4 lg:px-8 mt-14 relative z-10">
        <div 
          className="relative overflow-hidden rounded-3xl text-white p-6 md:p-12 shadow-xl border border-emerald-500/30"
          style={{ backgroundColor: '#064e3b' }}
        >
          {/* Họa tiết lá chìm vừa phải, tinh tế góc phải dưới */}
          <div className="absolute -right-8 -bottom-8 w-72 h-72 opacity-[0.07] pointer-events-none select-none">
            <img src="/watermark-leaf.svg" alt="" className="w-full h-full object-contain filter invert" />
          </div>
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-20 w-80 h-80 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          
          <div className="relative grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/15 mb-3">
                <Leaf size={14} /> Giá trị cốt lõi
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight drop-shadow-sm">
                Kết nối trực tiếp nông hộ với bữa cơm gia đình Việt
              </h2>
              <p className="text-emerald-100/90 text-xs md:text-sm mt-3.5 leading-relaxed font-normal">
                Không qua trung gian thương lái, mỗi trái cây và mớ rau đều được truy xuất nguồn gốc minh bạch trên bản đồ vùng trồng GIS — giữ trọn giá trị tươi nguyên và sự công bằng cho người nông dân.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link 
                  href="/map" 
                  className="inline-flex items-center gap-2 bg-white text-emerald-950 font-bold text-xs md:text-sm px-5 py-2.5 rounded-full hover:bg-emerald-50 transition-all shadow-md"
                >
                  <MapPin size={16} className="text-emerald-600" /> Xem bản đồ vùng trồng
                </Link>
                <Link 
                  href="/partners" 
                  className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold text-xs md:text-sm px-5 py-2.5 rounded-full hover:bg-white/10 transition-all"
                >
                  Trở thành nông hộ đối tác
                </Link>
              </div>
            </div>

            <div className="lg:col-span-3 grid grid-cols-2 gap-3.5 md:gap-4">
              {[
                { icon: Leaf, value: '500+', label: 'Nông hộ đạt chuẩn VietGAP' },
                { icon: Package, value: '120K+', label: 'Đơn hàng giao thành công' },
                { icon: Award, value: '63', label: 'Tỉnh thành phủ sóng liên kết' },
                { icon: ShieldCheck, value: '4.9/5', label: 'Khách hàng đánh giá hài lòng' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 md:p-6 hover:bg-white/15 transition-all shadow-sm">
                  <Icon size={24} className="text-amber-300" />
                  <p className="text-2xl md:text-3xl font-black mt-2 text-white">{value}</p>
                  <p className="text-xs md:text-sm text-emerald-100/80 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CHỨNG NHẬN ĐỒNG HÀNH ======================== */}
      <section className="container mx-auto px-4 lg:px-8 mt-12 relative z-10">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-emerald-800/80 mb-5">
          Tiêu chuẩn chất lượng kiểm định nông sản
        </p>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {CERTIFICATIONS.map((c) => (
            <div 
              key={c} 
              className="flex items-center gap-2 bg-white/90 backdrop-blur border border-emerald-200/60 rounded-full px-5 py-2.5 text-gray-700 hover:text-emerald-800 hover:border-emerald-400 hover:shadow-md transition-all duration-300 shadow-xs"
            >
              <Award size={17} className="text-emerald-600" />
              <span className="font-extrabold text-sm md:text-base tracking-tight">{c}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
