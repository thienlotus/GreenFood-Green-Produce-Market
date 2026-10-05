"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  ArrowRight, Truck, ShieldCheck, RefreshCw, CreditCard, ChevronRight, ChevronLeft,
  Zap, Flame, Sparkles, Tag, Copy, Check, Leaf, Award, MapPin, Package, Heart, Star,
  ShoppingBag, Apple, Coffee, Store, Users, Ticket, Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import WelcomeLetterModal from '@/components/WelcomeLetterModal';
import { getProducts, type ProductItem } from '@/lib/api';
import { ALL_PRODUCTS } from '@/data/products';

/* ----------------------------- Dữ liệu tĩnh ----------------------------- */

const BANNERS = [
  {
    id: 1,
    image: '/banners/hero-fresh-produce.jpg',
    tag: 'Mùa vụ thu hoạch 2026',
    title: 'Nông sản sạch\ntừ vườn đến bếp',
    desc: 'Thu hoạch tươi ngon rạng sáng, bảo quản lạnh tự nhiên và giao hỏa tốc 2H nội thành.',
    cta: 'Đi chợ online ngay',
    href: '/category/di-cho-online/',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop',
    tag: 'Đặc sản trứ danh 3 miền',
    title: 'Đặc sản tinh hoa\nquà biếu sang trọng',
    desc: 'Sầu riêng Ri6, bưởi da xanh Bến Tre, mật ong rừng Tràm — tuyển chọn từ hợp tác xã đạt chuẩn OCOP.',
    cta: 'Khám phá đặc sản',
    href: '/category/dac-san/',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1600&auto=format&fit=crop',
    tag: 'Chuẩn VietGAP & Bản đồ GIS',
    title: 'Rau củ hữu cơ\ntươi mới mỗi ngày',
    desc: 'Truy xuất nguồn gốc từng liếp vườn, minh bạch 100% tọa độ nhà vườn trên bản đồ vệ tinh.',
    cta: 'Xem bản đồ vùng trồng',
    href: '/map/',
  },
];

const SIDEBAR_CATEGORIES = [
  { name: 'Đi chợ online', href: '/category/di-cho-online/', icon: ShoppingBag, color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Trái cây tươi ngon', href: '/category/trai-cay/', icon: Apple, color: 'text-rose-600 bg-rose-500/10 border-rose-500/20' },
  { name: 'Đặc sản vùng miền', href: '/category/dac-san/', icon: Sparkles, color: 'text-purple-600 bg-purple-500/10 border-purple-500/20' },
  { name: 'Trà - Cà phê - Socola', href: '/category/tra-ca-phe/', icon: Coffee, color: 'text-amber-700 bg-amber-500/10 border-amber-500/20' },
  { name: 'Agrishow Triển lãm', href: '/category/agrishow/', icon: Store, color: 'text-teal-600 bg-teal-500/10 border-teal-500/20' },
  { name: 'Bản đồ vùng trồng', href: '/map/', icon: MapPin, color: 'text-sky-600 bg-sky-500/10 border-sky-500/20' },
  { name: 'Nông hộ đối tác', href: '/farmers/', icon: Users, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Theo dõi đơn hàng', href: '/tracking/', icon: Package, color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20' },
];

const QUICK_LINKS = [
  { name: 'Đi chợ online', href: '/category/di-cho-online/', icon: ShoppingBag, color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/25 group-hover:bg-emerald-600 group-hover:text-white' },
  { name: 'Trái cây Việt', href: '/category/trai-cay/', icon: Apple, color: 'text-rose-600 bg-rose-500/10 border-rose-500/25 group-hover:bg-rose-600 group-hover:text-white' },
  { name: 'Trà - Cà phê', href: '/category/tra-ca-phe/', icon: Coffee, color: 'text-amber-700 bg-amber-500/10 border-amber-500/25 group-hover:bg-amber-700 group-hover:text-white' },
  { name: 'Đặc sản', href: '/category/dac-san/', icon: Sparkles, color: 'text-purple-600 bg-purple-500/10 border-purple-500/25 group-hover:bg-purple-600 group-hover:text-white' },
  { name: 'Agrishow', href: '/category/agrishow/', icon: Store, color: 'text-teal-600 bg-teal-500/10 border-teal-500/25 group-hover:bg-teal-600 group-hover:text-white' },
  { name: 'Deal sốc', href: '#flash-sale', icon: Flame, color: 'text-red-600 bg-red-500/10 border-red-500/25 group-hover:bg-red-600 group-hover:text-white' },
  { name: 'Mã giảm giá', href: '#vouchers', icon: Ticket, color: 'text-pink-600 bg-pink-500/10 border-pink-500/25 group-hover:bg-pink-600 group-hover:text-white' },
  { name: 'Bản đồ vườn', href: '/map/', icon: MapPin, color: 'text-sky-600 bg-sky-500/10 border-sky-500/25 group-hover:bg-sky-600 group-hover:text-white' },
  { name: 'Theo dõi đơn', href: '/tracking/', icon: Package, color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/25 group-hover:bg-indigo-600 group-hover:text-white' },
  { name: 'Nông hộ sạch', href: '/farmers/', icon: Users, color: 'text-lime-700 bg-lime-500/10 border-lime-500/25 group-hover:bg-lime-700 group-hover:text-white' },
];

const USPS = [
  { icon: Truck, title: 'Giao nhanh 2H', desc: 'Nội thành TP.HCM & Hà Nội', color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
  { icon: ShieldCheck, title: 'Chuẩn VietGAP', desc: 'Truy xuất nguồn gốc 100%', color: 'bg-teal-500/10 text-teal-600 border border-teal-500/20' },
  { icon: RefreshCw, title: 'Đổi trả 24H', desc: 'Bảo hành tươi ngon tận bàn', color: 'bg-amber-500/10 text-amber-600 border border-amber-500/20' },
  { icon: CreditCard, title: 'Thanh toán linh hoạt', desc: 'COD • MoMo • VNPay', color: 'bg-sky-500/10 text-sky-600 border border-sky-500/20' },
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

  const [showWelcomeLetter, setShowWelcomeLetter] = useState(false);
  const [scrollDir, setScrollDir] = useState<'down' | 'up'>('down');
  const flashSaleScrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = useCallback(() => {
    const el = flashSaleScrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scrollFlashSale = (direction: 'left' | 'right') => {
    const el = flashSaleScrollerRef.current;
    if (!el) return;
    const scrollStep = 320;
    el.scrollBy({
      left: direction === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth',
    });
    setTimeout(checkScrollPosition, 320);
  };

  // Cuộn ngang êm ái khi dùng con lăn chuột trên dải Flash Sale
  useEffect(() => {
    const el = flashSaleScrollerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY * 1.3, behavior: 'smooth' });
        checkScrollPosition();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [checkScrollPosition]);

  // Hiệu ứng cuộn chuột: theo dõi hướng cuộn và reveal các mục sản phẩm / icon mượt mà
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 6) {
        setScrollDir(currentScrollY > lastScrollY ? 'down' : 'up');
        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [products]);

  const flashSale = useMemo(() => {
    const discounted = products.filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a));
    const nonDiscounted = products.filter((p) => discountOf(p) === 0);
    const combined = [...discounted, ...nonDiscounted];
    // Đảm bảo tối thiểu 16 sản phẩm để hàng cuộn luôn dài tràn màn hình và lướt mượt mà không bao giờ đứng yên
    return (combined.length >= 16 ? combined : [...combined, ...combined, ...combined]).slice(0, 18);
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
    <div className={`min-h-screen bg-tech-grid pb-20 relative overflow-hidden scroll-direction-${scrollDir}`}>
      <h1 className="sr-only">GreenFood - Chợ Nông Sản Sạch Việt Nam</h1>

      {/* Vùng hào quang quang hợp & công nghệ chìm tinh tế phong cách SaaS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-emerald-500/[0.08] via-teal-500/[0.03] to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-60 right-[-100px] w-96 h-96 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-[-100px] w-96 h-96 bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Họa tiết chìm Lũy Tre Xanh Việt Nam đung đưa trong gió nhẹ (Bamboo Grove Gentle Sway) */}
      {/* Vị trí 1: Góc trên phải khu vực Hero */}
      <div className="absolute top-6 -right-6 md:right-0 w-80 md:w-[460px] h-[640px] opacity-[0.11] md:opacity-[0.14] pointer-events-none select-none -z-10 animate-bamboo-sway">
        <img src="/watermark-bamboo.svg" alt="" className="w-full h-full object-contain origin-bottom" />
      </div>
      {/* Vị trí 2: Phía bên trái khu vực Flash Sale & Vouchers */}
      <div className="absolute top-[760px] -left-10 md:-left-4 w-72 md:w-[430px] h-[620px] opacity-[0.10] md:opacity-[0.13] pointer-events-none select-none -z-10 animate-bamboo-sway-delayed -scale-x-100">
        <img src="/watermark-bamboo.svg" alt="" className="w-full h-full object-contain origin-bottom" />
      </div>
      {/* Vị trí 3: Phía bên phải khu vực Gợi ý hôm nay */}
      <div className="absolute top-[1650px] -right-8 md:right-2 w-80 md:w-[460px] h-[640px] opacity-[0.10] md:opacity-[0.13] pointer-events-none select-none -z-10 animate-bamboo-sway">
        <img src="/watermark-bamboo.svg" alt="" className="w-full h-full object-contain origin-bottom" />
      </div>
      {/* Vị trí 4: Phía bên trái khu vực Nông sản miệt vườn */}
      <div className="absolute top-[2550px] -left-10 md:left-0 w-72 md:w-[420px] h-[600px] opacity-[0.09] md:opacity-[0.12] pointer-events-none select-none -z-10 animate-bamboo-sway-delayed -scale-x-100">
        <img src="/watermark-bamboo.svg" alt="" className="w-full h-full object-contain origin-bottom" />
      </div>

      {/* ============================ HERO ============================ */}
      <section className="container mx-auto px-4 lg:px-8 pt-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Sidebar danh mục sản phẩm (Desktop) - Modern Glassmorphic Elevation */}
          <aside className="hidden xl:flex xl:col-span-3 flex-col justify-between bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden h-[500px]">
            <div>
              <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 text-white font-bold text-sm flex items-center justify-between shadow-xs">
                <span className="flex items-center gap-2">
                  <Leaf size={16} className="text-emerald-300" /> Danh mục nông sản
                </span>
                <span className="text-[10px] bg-white/15 border border-white/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-emerald-200">VietGAP</span>
              </div>
              <ul className="divide-y divide-slate-100/70 text-sm py-1">
                {SIDEBAR_CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <li key={c.name}>
                      <Link
                        href={c.href}
                        className="flex items-center justify-between px-3.5 py-1.5 mx-2 my-0.5 rounded-2xl text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/90 transition-all duration-200 group font-semibold text-xs"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-xl ${c.color} flex items-center justify-center border shadow-xs group-hover:scale-110 transition-transform`}>
                            <Icon size={14} />
                          </span>
                          <span>{c.name}</span>
                        </span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Thẻ cam kết chất lượng lấp đầy đáy sidebar không bao giờ bị cắt chữ */}
            <div className="p-2.5 mx-2.5 mb-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                <span>Bảo hành tươi ngon 24H</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-snug">
                Đổi trả 100% miễn phí nếu nông sản không đạt độ tươi giòn.
              </p>
            </div>
          </aside>

          {/* Carousel Banner chính - Modern Cinematic Presentation */}
          <div className="lg:col-span-8 xl:col-span-6 relative rounded-3xl overflow-hidden shadow-elevated-card border border-slate-200/90 group h-[320px] sm:h-[420px] lg:h-[500px]">
            <div ref={emblaRef} className="overflow-hidden h-full">
              <div className="flex h-full">
                {BANNERS.map((b) => (
                  <div key={b.id} className="relative flex-[0_0_100%] min-w-0 h-full">
                    <img
                      src={b.image}
                      alt={b.title.replace('\n', ' ')}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                    
                    {/* Floating Quality Status Badge (Top-Right of Banner) */}
                    <div className="hidden sm:flex absolute top-5 right-5 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-1.5 items-center gap-2 text-white shadow-xl z-20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold tracking-wide">100% Tươi rạng sáng</span>
                    </div>

                    {/* Floating Fast Delivery Badge (Bottom-Right of Banner) */}
                    <div className="hidden sm:flex absolute bottom-12 right-5 bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-1.5 items-center gap-2 text-white shadow-xl z-20">
                      <Truck size={14} className="text-amber-300" />
                      <span className="text-xs font-semibold">Giao hỏa tốc 2H</span>
                    </div>

                    <div className="relative h-full flex flex-col justify-end p-6 sm:p-9 text-white max-w-xl z-10">
                      <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full text-xs font-bold text-amber-300 mb-2.5 self-start shadow-sm">
                        <Sparkles size={13} className="text-amber-400 fill-amber-400" />
                        <span>{b.tag}</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.12] whitespace-pre-line tracking-tight drop-shadow-xl text-white">
                        {b.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-100/90 mt-2.5 max-w-lg line-clamp-2 drop-shadow font-medium leading-relaxed">
                        {b.desc}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2.5 mt-5">
                        <Link
                          href={b.href}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                          {b.cta} <ArrowRight size={15} />
                        </Link>
                        <Link
                          href="/map/"
                          className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all duration-300"
                        >
                          <MapPin size={14} className="text-amber-300" /> Bản đồ GIS
                        </Link>
                      </div>
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
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-20"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Banner tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-20"
            >
              <ChevronRight size={20} />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {BANNERS.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Chuyển tới banner ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${selectedSlide === i ? 'w-8 bg-emerald-400' : 'w-2 bg-white/60 hover:bg-white'}`}
                />
              ))}
            </div>
          </div>

          {/* 2 Banner phụ (Desktop) - Modern Frosted Bento Cards */}
          <div className="hidden lg:grid lg:col-span-4 xl:col-span-3 grid-rows-2 gap-4 h-[500px]">
            <Link href="/category/trai-cay/" className="relative rounded-3xl overflow-hidden group shadow-elevated-card hover:shadow-elevated-hover hover:-translate-y-1 transition-all duration-300 border border-slate-200/90 block h-[242px]">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop"
                alt="Trái cây tươi"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white bg-gradient-to-r from-rose-500 to-amber-500 px-2.5 py-1 rounded-full shadow-lg">
                  <Zap size={12} className="fill-white" /> Giảm 25%
                </span>
              </div>
              <div className="absolute bottom-0 p-5 text-white z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">Trái cây nhiệt đới</span>
                <p className="text-xl font-black mt-1.5 drop-shadow">Chín Cây Tự Nhiên</p>
                <span className="text-xs inline-flex items-center gap-1 mt-1 font-semibold text-amber-200 group-hover:gap-2 transition-all">Mua ngay <ArrowRight size={13} /></span>
              </div>
            </Link>

            <Link href="/category/tra-ca-phe/" className="relative rounded-3xl overflow-hidden group shadow-elevated-card hover:shadow-elevated-hover hover:-translate-y-1 transition-all duration-300 border border-slate-200/90 block h-[242px]">
              <img
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop"
                alt="Trà và cà phê"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-2.5 py-1 rounded-full shadow-lg">
                  <Award size={12} /> Thượng Hạng
                </span>
              </div>
              <div className="absolute bottom-0 p-5 text-white z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">Trà & Cà phê Mộc</span>
                <p className="text-xl font-black mt-1.5 drop-shadow">Rang Mộc 100%</p>
                <span className="text-xs inline-flex items-center gap-1 mt-1 font-semibold text-emerald-200 group-hover:gap-2 transition-all">Khám phá <ArrowRight size={13} /></span>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* ============================ USPS (LỢI ÍCH DỊCH VỤ) ============================ */}
      <section className="container mx-auto px-4 lg:px-8 mt-7 relative z-10 reveal-on-scroll scroll-reactive-item">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/80 p-3.5 md:p-5 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {USPS.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={title} className={`flex items-center gap-3.5 p-3 lg:px-6 group hover:-translate-y-0.5 transition-transform ${i % 2 === 1 ? 'border-l lg:border-l-0 border-slate-100' : ''}`}>
              <div className={`w-12 h-12 shrink-0 rounded-2xl ${color || 'bg-emerald-50 text-emerald-700'} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">{title}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= QUICK LINKS (DANH MỤC TRUY CẬP NHANH) ========================= */}
      <section className="container mx-auto px-4 lg:px-8 mt-7 relative z-10 reveal-on-scroll scroll-reactive-item">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600" /> Danh mục truy cập nhanh
            </h3>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Trực tiếp từ vùng trồng VietGAP</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
            {QUICK_LINKS.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.name} href={c.href} className="flex flex-col items-center gap-2 group p-2 rounded-2xl hover:bg-slate-50 transition-colors scroll-reactive-item">
                  <div className={`w-13 h-13 md:w-14 md:h-14 rounded-2xl ${c.color} flex items-center justify-center border shadow-xs group-hover:-translate-y-1.5 group-hover:shadow-md transition-all duration-300`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight group-hover:text-emerald-800 transition-colors">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================== FLASH SALE ========================== */}
      <section id="flash-sale" className="container mx-auto px-4 lg:px-8 mt-10 scroll-mt-28 relative z-10 reveal-on-scroll scroll-reactive-item">
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
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Nút điều hướng cuộn ngang mượt mà trên thanh tiêu đề */}
              <div className="flex items-center gap-1 bg-black/25 backdrop-blur-sm p-1 rounded-full border border-white/20">
                <button
                  type="button"
                  onClick={() => scrollFlashSale('left')}
                  disabled={!canScrollLeft}
                  aria-label="Cuộn sang trái"
                  title="Cuộn sang trái"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    canScrollLeft 
                      ? 'bg-white text-rose-950 hover:scale-105 active:scale-95 shadow-sm' 
                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollFlashSale('right')}
                  disabled={!canScrollRight}
                  aria-label="Cuộn sang phải"
                  title="Cuộn sang phải"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    canScrollRight 
                      ? 'bg-white text-rose-950 hover:scale-105 active:scale-95 shadow-sm' 
                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <Link 
                href="/category/di-cho-online/" 
                className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-rose-950 bg-white hover:bg-amber-100 px-4 py-2 rounded-full transition-all shadow-sm"
              >
                Xem tất cả deal <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* Vùng sản phẩm cuộn ngang nhẹ nhàng & siêu mượt */}
          <div className="relative group/flash-scroller">
            {/* Nút cuộn trái nổi hai bên mép container (không đè lên quả) */}
            <button
              type="button"
              onClick={() => scrollFlashSale('left')}
              aria-label="Cuộn nông sản sang trái"
              className={`hidden md:flex absolute -left-2 sm:-left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-rose-950 shadow-2xl border-2 border-rose-200 items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                canScrollLeft ? 'opacity-90 hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronLeft size={22} />
            </button>

            <div
              ref={flashSaleScrollerRef}
              onScroll={checkScrollPosition}
              className="flex gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto scroll-smooth scrollbar-none p-4 md:p-6 snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loading ? (
                <ProductGridSkeleton count={5} />
              ) : (
                flashSale.map((p, idx) => (
                  <div 
                    key={`flash-${p.id}-${idx}`} 
                    className="shrink-0 w-[230px] sm:w-[250px] md:w-[270px] snap-start scroll-reactive-item transition-transform hover:-translate-y-1.5 duration-300"
                  >
                    <ProductCard {...toCardProps(p)} showSoldProgress />
                  </div>
                ))
              )}
            </div>

            {/* Nút cuộn phải nổi hai bên mép container (không đè lên quả) */}
            <button
              type="button"
              onClick={() => scrollFlashSale('right')}
              aria-label="Cuộn nông sản sang phải"
              className={`hidden md:flex absolute -right-2 sm:-right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-rose-950 shadow-2xl border-2 border-rose-200 items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                canScrollRight ? 'opacity-90 hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Dải hướng dẫn cuộn ngang tinh tế */}
          <div className="px-4 md:px-6 py-2.5 flex items-center justify-between text-xs text-rose-950/70 border-t border-rose-100/60 bg-rose-50/40">
            <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
              <Sparkles size={13} className="text-amber-500 fill-amber-500" />
              Cuộn ngang nhẹ nhàng hoặc bấm mũi tên để khám phá tất cả nông sản Flash Sale
            </span>
            <span className="hidden sm:inline font-mono font-bold text-[11px] text-rose-800 bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-200/60">
              {flashSale.length} Sản phẩm giá sốc
            </span>
          </div>
        </div>
      </section>

      {/* =========================== VOUCHERS =========================== */}
      <section id="vouchers" className="container mx-auto px-4 lg:px-8 mt-10 scroll-mt-28 relative z-10 reveal-on-scroll scroll-reactive-item">
        <SectionHeader 
          title="Mã giảm giá hôm nay" 
          subtitle="Áp dụng ngay khi thanh toán đơn hàng nông sản"
          accent="bg-pink-500" 
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VOUCHERS.map((v) => (
            <div 
              key={v.code} 
              className="relative flex bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-900/10 overflow-hidden shadow-elevated-card hover:shadow-elevated-hover hover:-translate-y-1 transition-all duration-300 scroll-reactive-item"
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
      <section className="container mx-auto px-4 lg:px-8 mt-12 relative z-10 reveal-on-scroll scroll-reactive-item">
        <SectionHeader 
          title="Gợi ý hôm nay" 
          subtitle="Sản phẩm tươi thu hoạch trực tiếp từ các nhà vườn chuẩn VietGAP"
          href="/category/di-cho-online/"
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
            <div key={`tab-${activeTab}-${p.id}`} className="scroll-reactive-item">
              <ProductCard {...toCardProps(p)} />
            </div>
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
          href: '/category/trai-cay/',
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
          href: '/category/dac-san/',
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
          <section key={section.key} className="container mx-auto px-4 lg:px-8 mt-12 relative z-10 reveal-on-scroll scroll-reactive-item">
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

      {/* ==================== NÚT NỔI MỞ LẠI THƯ ƯU ĐÃI (NHỎ NHẮN & SANG TRỌNG) ==================== */}
      <button
        type="button"
        onClick={() => setShowWelcomeLetter(true)}
        aria-label="Mở Thư Ưu Đãi Hôm Nay"
        className="fixed bottom-5 left-5 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-amber-200 border-2 border-emerald-500/40 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group cursor-pointer"
        title="Xem Thư Chào & Mã Giảm Giá Hôm Nay"
      >
        {/* Chấm đỏ thông báo nhỏ xinh */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-xs">
          1
        </span>
        {/* Icon phong thư kim loại thanh lịch */}
        <Mail size={19} className="text-amber-300 group-hover:scale-110 transition-transform" />

        {/* Tooltip nhỏ gọn hiện khi hover chuột */}
        <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold rounded-lg shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Thư ưu đãi
        </span>
      </button>

      {/* ================= BẢNG THÔNG BÁO TÂM THƯ GIẤY ================= */}
      <WelcomeLetterModal 
        forceOpen={showWelcomeLetter} 
        onClose={() => setShowWelcomeLetter(false)} 
      />
    </div>
  );
}
