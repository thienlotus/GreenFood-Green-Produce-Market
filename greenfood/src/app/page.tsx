"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  ArrowRight, Truck, ShieldCheck, RefreshCw, CreditCard, ChevronRight, ChevronLeft,
  Zap, Flame, Sparkles, Tag, Copy, Check, Leaf, Award, MapPin, Package
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
  { name: 'Đi chợ online', href: '/category/di-cho-online', icon: '🛒', bg: 'bg-emerald-50' },
  { name: 'Trái cây Việt', href: '/category/trai-cay', icon: '🍉', bg: 'bg-orange-50' },
  { name: 'Trà - Cà phê', href: '/category/tra-ca-phe', icon: '☕', bg: 'bg-teal-50' },
  { name: 'Đặc sản', href: '/category/dac-san', icon: '🎁', bg: 'bg-amber-50' },
  { name: 'Agrishow', href: '/category/agrishow', icon: '🌾', bg: 'bg-purple-50' },
  { name: 'Deal sốc', href: '#flash-sale', icon: '🔥', bg: 'bg-rose-50' },
  { name: 'Mã giảm giá', href: '#vouchers', icon: '🎟️', bg: 'bg-pink-50' },
  { name: 'Bản đồ vườn', href: '/map', icon: '📍', bg: 'bg-sky-50' },
  { name: 'Theo dõi đơn', href: '/tracking', icon: '📦', bg: 'bg-indigo-50' },
  { name: 'Nông hộ sạch', href: '/farmers', icon: '👨‍🌾', bg: 'bg-lime-50' },
];

const USPS = [
  { icon: Truck, title: 'Giao nhanh 2H', desc: 'Nội thành HN & HCM' },
  { icon: ShieldCheck, title: 'Chuẩn VietGAP', desc: 'Truy xuất nguồn gốc' },
  { icon: RefreshCw, title: 'Đổi trả 24H', desc: 'Hoàn tiền nếu không tươi' },
  { icon: CreditCard, title: 'Thanh toán an toàn', desc: 'COD • MoMo • VNPay' },
];

// Khớp với mã voucher thật ở backend (PromotionService::validateVoucher)
const VOUCHERS = [
  { code: 'GREEN10', title: 'Giảm 10%', desc: 'Tối đa 50K cho đơn từ 100K', color: 'from-emerald-500 to-teal-500' },
  { code: 'FREESHIP', title: 'Miễn phí ship', desc: 'Giảm đến 30K cho đơn từ 150K', color: 'from-sky-500 to-indigo-500' },
  { code: 'CHAOBANMOI', title: 'Giảm 20K', desc: 'Cho đơn đầu tiên từ 50K', color: 'from-orange-500 to-rose-500' },
];

const CERTIFICATIONS = ['VietGAP', 'GlobalGAP', 'OCOP 4 Sao', 'HACCP', 'ISO 22000'];

type TabKey = 'popular' | 'newest' | 'deal';
const TABS: { key: TabKey; label: string; icon: typeof Flame }[] = [
  { key: 'popular', label: 'Bán chạy', icon: Flame },
  { key: 'newest', label: 'Mới về', icon: Sparkles },
  { key: 'deal', label: 'Giá tốt', icon: Tag },
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

function SectionHeader({ title, accent = 'bg-emerald-500', href, linkLabel = 'Xem tất cả', children }: {
  title: string; accent?: string; href?: string; linkLabel?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <h2 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        <span className={`w-1.5 h-6 md:h-7 ${accent} rounded-full`} />
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {children}
        {href && (
          <Link href={href} className="hidden sm:flex items-center gap-0.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 whitespace-nowrap">
            {linkLabel} <ChevronRight size={16} />
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
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
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

  // Đếm ngược Flash Sale tới 0h hôm nay (chỉ chạy trên client để tránh lỗi hydration mismatch)
  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeUntilMidnight());
    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lấy sản phẩm từ API (tự fallback sang dữ liệu mẫu nếu backend tắt)
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
    // 'newest': giữ nguyên thứ tự API (đã sắp xếp mới nhất)
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
      toast.success(`Đã sao chép mã ${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast(`Mã của bạn: ${code}`, { icon: '🎟️' });
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-gray-50 pb-16">
      <h1 className="sr-only">GreenFood - Chợ nông sản sạch trực tuyến Việt Nam</h1>

      {/* ============================ HERO ============================ */}
      <section className="container mx-auto px-4 lg:px-8 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar danh mục (desktop lớn) */}
          <aside className="hidden xl:flex xl:col-span-3 flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden h-[400px]">
            <div className="px-5 py-3.5 bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2">
              <Leaf size={16} /> Danh mục sản phẩm
            </div>
            <nav className="flex-1 py-1.5 overflow-y-auto">
              {SIDEBAR_CATEGORIES.map((c) => (
                <Link
                  key={c.name}
                  href={c.href}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
                >
                  <span className="text-lg w-6 text-center">{c.icon}</span>
                  <span className="flex-1 font-medium">{c.name}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </nav>
          </aside>

          {/* Carousel chính */}
          <div className="lg:col-span-8 xl:col-span-6 relative rounded-2xl overflow-hidden group h-[260px] sm:h-[340px] lg:h-[400px]">
            <div className="h-full" ref={emblaRef}>
              <div className="flex h-full">
                {BANNERS.map((b, idx) => (
                  <div key={b.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                    <img
                      src={b.image}
                      alt={b.title.replace('\n', ' ')}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
                    <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 max-w-md">
                      <span className="inline-flex w-fit items-center gap-1.5 bg-amber-400 text-amber-950 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3">
                        <Sparkles size={12} /> {b.tag}
                      </span>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight whitespace-pre-line drop-shadow">
                        {b.title}
                      </p>
                      <p className="hidden sm:block text-sm text-white/85 mt-3 leading-relaxed">{b.desc}</p>
                      <Link
                        href={b.href}
                        className="mt-5 inline-flex w-fit items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg transition-colors"
                      >
                        {b.cta} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Banner trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Banner tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {BANNERS.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Chuyển tới banner ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all ${selectedSlide === i ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>

          {/* Banner phụ */}
          <div className="hidden lg:grid lg:col-span-4 xl:col-span-3 grid-rows-2 gap-4 h-[400px]">
            <Link href="/category/trai-cay" className="relative rounded-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop"
                alt="Trái cây tươi"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-orange-900/20 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-200">Trái cây chín cây</p>
                <p className="text-lg font-bold mt-0.5">Giảm đến 25%</p>
                <span className="text-xs inline-flex items-center gap-1 mt-1 opacity-90 group-hover:gap-2 transition-all">Mua ngay <ArrowRight size={12} /></span>
              </div>
            </Link>
            <Link href="/category/tra-ca-phe" className="relative rounded-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop"
                alt="Trà và cà phê"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/25 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Trà - Cà phê đặc sản</p>
                <p className="text-lg font-bold mt-0.5">Rang mộc 100%</p>
                <span className="text-xs inline-flex items-center gap-1 mt-1 opacity-90 group-hover:gap-2 transition-all">Khám phá <ArrowRight size={12} /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================ USP ============================ */}
      <section className="container mx-auto px-4 lg:px-8 mt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-gray-100 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {USPS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className={`flex items-center gap-3 p-4 lg:px-6 ${i % 2 === 1 ? 'border-l lg:border-l-0 border-gray-100' : ''}`}>
              <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= QUICK LINKS ========================= */}
      <section className="container mx-auto px-4 lg:px-8 mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-y-5 gap-x-2">
            {QUICK_LINKS.map((c) => (
              <Link key={c.name} href={c.href} className="flex flex-col items-center gap-2 group">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${c.bg} flex items-center justify-center text-2xl group-hover:-translate-y-1 group-hover:shadow-md transition-all duration-300`}>
                  {c.icon}
                </div>
                <span className="text-[11px] md:text-xs font-medium text-gray-700 text-center leading-tight group-hover:text-emerald-700 transition-colors">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== FLASH SALE ========================== */}
      <section id="flash-sale" className="container mx-auto px-4 lg:px-8 mt-8 scroll-mt-28">
        <div className="rounded-2xl overflow-hidden border border-rose-100 bg-white">
          <div className="bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 md:gap-5">
              <h2 className="text-xl md:text-2xl font-extrabold text-white italic tracking-tight flex items-center gap-2">
                <Zap size={24} className="fill-yellow-300 text-yellow-300" /> FLASH SALE
              </h2>
              <div className="flex items-center gap-2 text-white">
                <span className="text-xs md:text-sm text-white/90">Kết thúc sau</span>
                <div className="flex items-center gap-1 font-mono" suppressHydrationWarning>
                  {[
                    mounted ? timeLeft.hours : 0,
                    mounted ? timeLeft.minutes : 0,
                    mounted ? timeLeft.seconds : 0,
                  ].map((n, i) => (
                    <span key={i} className="flex items-center gap-1" suppressHydrationWarning>
                      <span
                        className="bg-gray-900 text-white font-bold text-sm min-w-[2rem] text-center px-1.5 py-1 rounded-md"
                        suppressHydrationWarning
                      >
                        {mounted ? pad(n) : '00'}
                      </span>
                      {i < 2 && <span className="font-bold">:</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/category/di-cho-online" className="self-start sm:self-auto inline-flex items-center gap-1 text-sm font-medium text-white bg-white/15 hover:bg-white/25 px-4 py-1.5 rounded-full transition-colors">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>
          <div className={`p-3 md:p-5 ${GRID}`}>
            {loading ? <ProductGridSkeleton /> : flashSale.map((p) => (
              <ProductCard key={`flash-${p.id}`} {...toCardProps(p)} showSoldProgress />
            ))}
          </div>
        </div>
      </section>

      {/* =========================== VOUCHERS =========================== */}
      <section id="vouchers" className="container mx-auto px-4 lg:px-8 mt-8 scroll-mt-28">
        <SectionHeader title="Mã giảm giá hôm nay" accent="bg-pink-500" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {VOUCHERS.map((v) => (
            <div key={v.code} className="relative flex bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`w-24 shrink-0 bg-gradient-to-br ${v.color} text-white flex flex-col items-center justify-center p-3`}>
                <Tag size={22} />
                <span className="text-[10px] font-semibold uppercase mt-1 tracking-wide">Voucher</span>
              </div>
              {/* răng cưa vé */}
              <span className="absolute left-[5.5rem] -top-2 w-4 h-4 rounded-full bg-gray-50 border border-gray-100" />
              <span className="absolute left-[5.5rem] -bottom-2 w-4 h-4 rounded-full bg-gray-50 border border-gray-100" />
              <div className="flex-1 flex items-center justify-between gap-3 p-4 pl-5 border-l-2 border-dashed border-gray-200">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">{v.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
                  <p className="text-xs font-mono font-semibold text-emerald-700 mt-1.5">{v.code}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyVoucher(v.code)}
                  className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                    copiedCode === v.code ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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
      <section className="container mx-auto px-4 lg:px-8 mt-10">
        <SectionHeader title="Gợi ý hôm nay" href="/category/di-cho-online">
          <div className="flex bg-white border border-gray-200 rounded-full p-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                id={`home-tab-${key}`}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 rounded-full transition-colors ${
                  activeTab === key ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-emerald-700'
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

      {/* ===================== DANH MỤC NỔI BẬT (banner + 4 SP) ===================== */}
      {[
        {
          key: 'fruits',
          title: 'Trái cây Việt Nam',
          accent: 'bg-orange-500',
          href: '/category/trai-cay',
          items: fruits,
          banner: {
            image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800&auto=format&fit=crop',
            overlay: 'from-orange-600/90 to-orange-500/40',
            kicker: 'Chín cây tự nhiên',
            title: 'Trái cây\nmiệt vườn',
          },
        },
        {
          key: 'specialties',
          title: 'Đặc sản quà tặng',
          accent: 'bg-amber-500',
          href: '/category/dac-san',
          items: specialties,
          banner: {
            image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
            overlay: 'from-emerald-900/90 to-emerald-700/40',
            kicker: 'Hộp quà sang trọng',
            title: 'Đặc sản\nba miền',
          },
        },
      ].map((section) =>
        !loading && section.items.length === 0 ? null : (
          <section key={section.key} className="container mx-auto px-4 lg:px-8 mt-10">
            <SectionHeader title={section.title} accent={section.accent} href={section.href} linkLabel="Xem thêm" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              <Link
                href={section.href}
                className="hidden xl:flex relative rounded-2xl overflow-hidden group min-h-[360px]"
              >
                <img src={section.banner.image} alt={section.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className={`absolute inset-0 bg-gradient-to-t ${section.banner.overlay}`} />
                <div className="relative mt-auto p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-90">{section.banner.kicker}</p>
                  <p className="text-2xl font-extrabold leading-tight mt-1 whitespace-pre-line">{section.banner.title}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-full group-hover:gap-2.5 transition-all">
                    Xem thêm <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
              {loading ? <ProductGridSkeleton count={4} /> : section.items.map((p) => (
                <ProductCard key={`${section.key}-${p.id}`} {...toCardProps(p)} />
              ))}
            </div>
            <Link href={section.href} className="sm:hidden mt-4 flex items-center justify-center gap-1 text-sm font-medium text-emerald-700 bg-white border border-gray-200 rounded-full py-2.5">
              Xem thêm {section.title.toLowerCase()} <ChevronRight size={16} />
            </Link>
          </section>
        )
      )}

      {/* ========================= VÌ SAO CHỌN ========================= */}
      <section className="container mx-auto px-4 lg:px-8 mt-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white p-6 md:p-10">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -left-10 -bottom-20 w-56 h-56 rounded-full bg-white/5" />
          <div className="relative grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2">
              <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wider">Vì sao chọn GreenFood?</p>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 leading-tight">Kết nối trực tiếp nông hộ với bữa cơm gia đình Việt</h2>
              <p className="text-emerald-100/90 text-sm mt-3 leading-relaxed">
                Không qua trung gian, mỗi sản phẩm đều có nguồn gốc rõ ràng trên bản đồ vùng trồng — giá tốt cho người mua, công bằng cho người trồng.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/map" className="inline-flex items-center gap-2 bg-white text-emerald-800 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-emerald-50 transition-colors">
                  <MapPin size={16} /> Xem bản đồ vùng trồng
                </Link>
                <Link href="/partners" className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors">
                  Trở thành nông hộ đối tác
                </Link>
              </div>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 gap-3 md:gap-4">
              {[
                { icon: Leaf, value: '500+', label: 'Nông hộ đạt chuẩn' },
                { icon: Package, value: '120K+', label: 'Đơn hàng đã giao' },
                { icon: Award, value: '63', label: 'Tỉnh thành phủ sóng' },
                { icon: ShieldCheck, value: '4.9/5', label: 'Đánh giá hài lòng' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5">
                  <Icon size={22} className="text-emerald-200" />
                  <p className="text-2xl md:text-3xl font-extrabold mt-2">{value}</p>
                  <p className="text-xs md:text-sm text-emerald-100/90">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CHỨNG NHẬN ======================== */}
      <section className="container mx-auto px-4 lg:px-8 mt-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-5">Tiêu chuẩn chất lượng đồng hành</p>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {CERTIFICATIONS.map((c) => (
            <div key={c} className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-5 py-2.5 text-gray-600 hover:text-emerald-700 hover:border-emerald-200 transition-colors">
              <Award size={16} className="text-emerald-500" />
              <span className="font-bold text-sm md:text-base">{c}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
