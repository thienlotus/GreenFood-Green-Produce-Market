"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight, 
  Leaf, 
  Search, 
  ShoppingBag,
  Sparkles,
  Filter,
  Apple,
  Coffee,
  Store,
  ShieldCheck,
  Truck,
  Tag
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getCategoryBySlug, getProducts, getCategories } from '@/lib/api';
import { 
  ProductItem, 
  CategoryInfo, 
  CATEGORIES, 
  getCategoryBySlug as getMockCategoryBySlug, 
  getProductsByCategory as getMockProductsByCategory 
} from '@/data/products';

interface CategoryClientProps {
  initialSlug?: string;
}

export default function CategoryClient({ initialSlug }: CategoryClientProps) {
  const params = useParams();
  const rawSlug = initialSlug || (typeof params?.slug === 'string' ? params.slug : '');
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim().toLowerCase().replace(/[\s_]+/g, '-') : '';

  const defaultCategory = getMockCategoryBySlug(slug) || null;
  const defaultProducts = getMockProductsByCategory(slug);

  const [category, setCategory] = useState<CategoryInfo | null>(defaultCategory);
  const [products, setProducts] = useState<ProductItem[]>(defaultProducts);
  const [allCategories, setAllCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [isLoading, setIsLoading] = useState(!defaultCategory && defaultProducts.length === 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  
  // Hiệu ứng tương tác 3D góc nhìn chuyển động như soopi.site
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, lx: 0, ly: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -y * 8,
      ry: x * 10,
      lx: x * 35,
      ly: y * 35,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, lx: 0, ly: 0 });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [catData, prodData, allCats] = await Promise.all([
          getCategoryBySlug(slug),
          getProducts({ category: slug }),
          getCategories()
        ]);

        if (catData) setCategory(catData);
        if (prodData && prodData.length > 0) setProducts(prodData);
        if (allCats && allCats.length > 0) setAllCategories(allCats);
      } catch (err) {
        console.warn('Error loading dynamic category data, using static fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      loadData();
    }
  }, [slug]);

  // Extract regions for filter
  const regions = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.farmer?.region).filter(Boolean)));
    return ['all', ...list];
  }, [products]);

  // Filter and sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.farmer?.name.toLowerCase().includes(term) ||
        p.farmer?.region.toLowerCase().includes(term)
      );
    }

    // Region filter
    if (filterRegion !== 'all') {
      result = result.filter(p => p.farmer?.region === filterRegion);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return result;
  }, [products, searchTerm, filterRegion, sortBy]);

  const categoryName = category?.name || (slug === 'di-cho-online' ? 'Đi chợ online' : 'Nông sản chọn lọc');
  const categoryDesc = category?.description || 'Nông sản sạch từ các nông hộ đối tác khắp Việt Nam.';
  
  // Dedicated sharp AI produce banner per category (soopi.site inspired)
  const categoryBannerMap: Record<string, string> = {
    'dac-san': '/banners/banner-dac-san.jpg',
    'trai-cay': '/banners/banner-trai-cay.jpg',
    'di-cho-online': '/banners/banner-di-cho.jpg',
    'tra-ca-phe': '/banners/banner-tra-cafe.jpg',
    'agrishow': '/banners/banner-agrishow.jpg',
  };
  const bannerImg = categoryBannerMap[slug] || (category?.bannerImage && !category.bannerImage.includes('unsplash') ? category.bannerImage : '/banners/banner-dac-san.jpg');

  const categoryHeadline = useMemo(() => {
    switch (slug) {
      case 'dac-san':
        return {
          main: 'Đặc sản ba miền.',
          sub: 'Hương vị đượm tình quê.',
          accent: 'text-emerald-800',
          kicker: 'GREENFOOD · TINH HOA NÔNG SẢN VIỆT',
          edition: '01 / ĐẶC SẢN VÙNG MIỀN',
          desc: 'Sầu riêng Ri6 Chợ Lách, bưởi da xanh Bến Tre, mật ong rừng Tràm U Minh — tuyển chọn từ các hợp tác xã đạt chuẩn OCOP 4-5 sao.',
        };
      case 'trai-cay':
        return {
          main: 'Trái cây chín cây.',
          sub: 'Vị ngọt lành thanh khiết.',
          accent: 'text-rose-800',
          kicker: 'GREENFOOD · MIỆT VƯỜN TRĨU CÀNH',
          edition: '02 / TRÁI CÂY MIỆT VƯỜN',
          desc: 'Xoài cát Hòa Lộc, dâu tây New Zealand Đơn Dương, dưa lưới hoàng kim — hái chín tự nhiên rạng sáng, an toàn cho cả gia đình.',
        };
      case 'di-cho-online':
        return {
          main: 'Đi chợ mỗi sớm.',
          sub: 'Trọn vẹn vị tươi non.',
          accent: 'text-emerald-800',
          kicker: 'GREENFOOD · NÔNG SẢN TƯƠI MỖI SÁNG',
          edition: '03 / NÔNG SẢN TƯƠI SÁNG',
          desc: 'Rau củ hữu cơ thu hoạch trong ngày từ các nhà vườn đối tác, bảo quản lạnh tự nhiên và giao hỏa tốc 2H tận cửa.',
        };
      case 'tra-ca-phe':
        return {
          main: 'Dấu ấn cao nguyên.',
          sub: 'Đậm đà hương vị mộc.',
          accent: 'text-amber-900',
          kicker: 'GREENFOOD · TINH HOA TRÀ & CÀ PHÊ',
          edition: '04 / CAO NGUYÊN & ĐỒI CHÈ',
          desc: 'Trà nõn tôm Tân Cương tiền chát hậu ngọt, cà phê Robusta Mộc Châu rang mộc sánh mịn đượm hương truyền thống.',
        };
      case 'agrishow':
        return {
          main: 'Agrishow 2026.',
          sub: 'Nông trại thông minh 4.0.',
          accent: 'text-teal-800',
          kicker: 'GREENFOOD · TRIỂN LÃM NÔNG NGHIỆP',
          edition: '05 / CÔNG NGHỆ NHÀ MÀNG',
          desc: 'Kết nối trực tiếp người tiêu dùng và các trang trại hữu cơ ứng dụng công nghệ cao, minh bạch nguồn gốc bản đồ GIS.',
        };
      default:
        return {
          main: 'Nông sản chọn lọc.',
          sub: 'Thực phẩm sạch từ tâm.',
          accent: 'text-emerald-800',
          kicker: 'GREENFOOD · NÔNG SẢN CHUẨN SẠCH',
          edition: '01 / TINH HOA VỤ MÙA',
          desc: 'Thực phẩm sạch từ các nông hộ đạt chuẩn VietGAP & OCOP, an tâm cho mọi bữa ăn gia đình.',
        };
    }
  }, [slug]);

  if (!isLoading && !category && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Danh mục không tồn tại</h1>
        <p className="text-gray-500 mb-6">Không tìm thấy danh mục bạn yêu cầu.</p>
        <Link href="/" className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:bg-emerald-700 transition-colors shadow-sm">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Category Hero Banner - Phong cách Editorial Atelier / soopi.site */}
      <section className="relative bg-[#faf8f5] text-[#142e23] border-b border-[#e8dfd5] overflow-hidden py-12 lg:py-16">
        {/* Soft Organic Ambient Backdrops */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[540px] h-[540px] bg-emerald-300/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#142e23_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb - Clean, subtle */}
          <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#718579] mb-6 font-medium tracking-wide">
            <Link href="/" className="hover:text-emerald-900 transition-colors">Trang chủ</Link>
            <ChevronRight size={13} className="mx-1.5 text-gray-400" />
            <span className="text-[#718579]">Danh mục nông sản</span>
            <ChevronRight size={13} className="mx-1.5 text-gray-400" />
            <span className="text-[#064e3b] font-semibold">{categoryName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column (5/12): Editorial Typography (style soopi.site bloom-copy) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              {/* Kicker tag with refined horizontal hairline */}
              <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#064e3b] mb-4">
                <span className="w-8 h-[1.5px] bg-[#064e3b]" />
                <span>{categoryHeadline.kicker}</span>
              </div>

              {/* Editorial Large Heading - 100% Playfair Display (font-editorial) */}
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[50px] font-normal tracking-[-0.02em] text-[#142e23] leading-[1.14] mb-4">
                {categoryHeadline.main}<br />
                <em className={`italic font-normal ${categoryHeadline.accent} block mt-1`}>
                  {categoryHeadline.sub}
                </em>
              </h1>

              {/* Subtitle / Description */}
              <p className="text-[#55695e] text-xs sm:text-sm leading-[1.8] font-normal max-w-md mb-6">
                {categoryHeadline.desc}
              </p>

              {/* Action Buttons & Trust Highlights in a neat, professional layout */}
              <div className="flex flex-wrap items-center gap-3.5 mb-7">
                <a 
                  href="#products-grid" 
                  className="inline-flex items-center gap-2 bg-[#064e3b] hover:bg-[#0c3c2e] text-[#fffcf9] font-medium text-xs sm:text-sm px-6 py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5"
                >
                  <span>Khám phá vụ mùa</span>
                  <span className="text-xs">↓</span>
                </a>

                <div className="inline-flex items-center gap-3 bg-white border border-[#e5dcd0] text-[#142e23] text-xs font-medium px-4 py-2.5 rounded-full shadow-2xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Chuẩn VietGAP</span>
                  </div>
                  <span className="text-[#d8cdbf]">|</span>
                  <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                    <Truck size={14} className="text-amber-600" />
                    <span>Giao 2H</span>
                  </div>
                </div>
              </div>

              {/* Edition Indicator (Style soopi.site bloom-edition) */}
              <div className="pt-5 border-t border-[#e8dfd5] flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#788a80] font-semibold">
                <span className="font-editorial text-sm normal-case tracking-normal text-[#142e23] font-medium">
                  {categoryHeadline.edition}
                </span>
                <span className="w-10 h-[1px] bg-[#064e3b]/35" />
                <span>NÔNG SẢN CHỌN LỌC</span>
              </div>
            </div>

            {/* Right Column (7/12): Living Botanical Stage (Phong cách soopi.site bloom-art) */}
            <div className="lg:col-span-7 relative flex items-center justify-center">
              {/* Outer stage with perspective & 3D mouse interaction */}
              <div 
                ref={stageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full max-w-[620px] aspect-[16/10] select-none cursor-default"
                style={{ perspective: 1100 }}
              >
                {/* 1. Behind Glow Halo (Dịch chuyển mềm mại theo hướng chuột) */}
                <div 
                  className="absolute inset-4 bg-gradient-to-tr from-emerald-400/25 via-amber-200/30 to-emerald-200/25 rounded-full blur-3xl pointer-events-none"
                  style={{
                    transform: `translate3d(${tilt.lx}px, ${tilt.ly}px, -30px)`,
                    transition: 'transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1)',
                  }}
                />

                {/* 2. Central Produce Sculpture Card (Khối tác phẩm nông sản nổi bật) */}
                <div 
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_24px_50px_-12px_rgba(20,46,35,0.18)] border border-[#e4dcd0] bg-white group animate-fruit-float"
                  style={{
                    transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                    transition: 'transform 0.22s ease-out',
                  }}
                >
                  {/* Real Sharp AI Produce Artwork */}
                  <img 
                    src={bannerImg} 
                    alt={categoryName}
                    className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-1000 ease-out group-hover:scale-105"
                  />

                  {/* Soft Light Shimmer Sweep */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-60 h-[200%] bg-gradient-to-r from-transparent via-white/35 to-transparent transform -rotate-12 animate-shimmer-sweep" />
                  </div>

                  {/* Floating Caption Tag (như soopi.site bloom-art-caption) */}
                  <div className="absolute bottom-3.5 right-3.5 z-20 bg-white/95 backdrop-blur-md border border-[#e0d6c8] px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-950 shadow-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Thu hoạch hôm nay</span>
                    <span className="text-gray-300 font-normal">|</span>
                    <span className="text-emerald-800 font-bold">Chuẩn VietGAP ↗</span>
                  </div>
                </div>

                {/* 3. CÀNH LÁ VÀ CHÙM QUẢ THẬT ĐUNG ĐƯA CHUYỂN ĐỘNG (Phong cách botanical soopi.site) */}
                {/* Cành cây trên cùng với lá xanh & chùm quả treo lơ lửng đung đưa trong gió */}
                <div className="absolute -top-7 -left-7 z-30 pointer-events-none w-60 sm:w-72 h-52 sm:h-64 animate-branch-top drop-shadow-[0_12px_24px_rgba(20,83,45,0.22)]">
                  <svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="leafGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="50%" stopColor="#16a34a" />
                        <stop offset="100%" stopColor="#14532d" />
                      </linearGradient>
                      <linearGradient id="leafGradB" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#86efac" />
                        <stop offset="60%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#15803d" />
                      </linearGradient>
                      <linearGradient id="woodyStem" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#5c3d24" />
                        <stop offset="100%" stopColor="#2e1d0f" />
                      </linearGradient>
                      <radialGradient id="fruitTomato" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fca5a5" />
                        <stop offset="25%" stopColor="#ef4444" />
                        <stop offset="70%" stopColor="#b91c1c" />
                        <stop offset="100%" stopColor="#7f1d1d" />
                      </radialGradient>
                      <radialGradient id="fruitOrange" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="25%" stopColor="#f59e0b" />
                        <stop offset="75%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#b45309" />
                      </radialGradient>
                      <radialGradient id="specularGlow" cx="30%" cy="25%" r="40%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Thân cành cây gỗ uốn cong tự nhiên */}
                    <path 
                      d="M -15 -15 C 30 18, 75 35, 135 50 C 180 62, 218 85, 248 118" 
                      stroke="url(#woodyStem)" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 68 32 C 85 52, 102 78, 108 98" 
                      stroke="url(#woodyStem)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />

                    {/* Lá số 1 (Góc trên) */}
                    <g className="animate-leaf-flutter-1">
                      <path 
                        d="M 50 25 C 35 5, 45 -18, 78 -8 C 72 15, 60 28, 50 25 Z" 
                        fill="url(#leafGradA)" 
                      />
                      <path d="M 50 25 Q 62 5 78 -8" stroke="#bbf7d0" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
                    </g>

                    {/* Lá số 2 (Đung đưa theo nhịp 2) */}
                    <g className="animate-leaf-flutter-2">
                      <path 
                        d="M 105 42 C 122 22, 155 28, 168 50 C 145 62, 118 55, 105 42 Z" 
                        fill="url(#leafGradB)" 
                      />
                      <path d="M 105 42 Q 135 38 168 50" stroke="#bbf7d0" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
                      {/* Giọt sương lấp lánh */}
                      <circle cx="166" cy="50" r="2.8" fill="#ffffff" className="animate-dew-glimmer" />
                    </g>

                    {/* Lá số 3 (Lá bản to mướt mát) */}
                    <g className="animate-leaf-flutter-3">
                      <path 
                        d="M 155 55 C 182 38, 215 48, 226 75 C 198 86, 172 76, 155 55 Z" 
                        fill="url(#leafGradA)" 
                      />
                      <path d="M 155 55 Q 188 60 226 75" stroke="#bbf7d0" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
                      <circle cx="225" cy="75" r="3.2" fill="#ffffff" className="animate-dew-glimmer" />
                    </g>

                    {/* Lá số 4 (Đầu ngọn cành) */}
                    <g className="animate-leaf-flutter-1">
                      <path 
                        d="M 226 100 C 242 95, 258 106, 264 128 C 246 134, 230 122, 226 100 Z" 
                        fill="url(#leafGradB)" 
                      />
                      <path d="M 226 100 Q 245 112 264 128" stroke="#bbf7d0" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                    </g>

                    {/* Chùm hoa quả đung đưa trĩu cành theo trọng lực con lắc */}
                    <g className="animate-fruit-cluster" style={{ transformOrigin: '108px 98px' }}>
                      {/* Cuống quả rủ xuống */}
                      <path d="M 108 98 C 109 116, 105 132, 102 148" stroke="#3f6212" strokeWidth="2.8" strokeLinecap="round" />
                      <path d="M 105 128 C 92 136, 86 144, 82 155" stroke="#3f6212" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M 105 132 C 120 142, 128 150, 131 160" stroke="#3f6212" strokeWidth="2.2" strokeLinecap="round" />

                      {/* Quả trái 1 (Trái quả căng mọng) */}
                      <g transform="translate(78, 155)">
                        <path d="M 0 0 L -4 -6 L 0 -2 L 4 -6 L 2 -1 L 6 2 L 1 1 L 0 5 L -2 1 L -6 2 Z" fill="#15803d" />
                        <circle cx="0" cy="13" r="15" fill={slug === 'trai-cay' || slug === 'dac-san' ? "url(#fruitOrange)" : "url(#fruitTomato)"} filter="drop-shadow(0 4px 8px rgba(0,0,0,0.18))" />
                        <ellipse cx="-4.5" cy="7.5" rx="5.5" ry="3.5" fill="url(#specularGlow)" transform="rotate(-30 -4.5 7.5)" />
                      </g>

                      {/* Quả phải 2 */}
                      <g transform="translate(131, 160)">
                        <path d="M 0 0 L -4 -5 L 0 -2 L 4 -5 L 2 -1 L 5 2 L 1 1 L 0 5 L -2 1 L -5 2 Z" fill="#15803d" />
                        <circle cx="0" cy="12" r="14" fill={slug === 'trai-cay' || slug === 'dac-san' ? "url(#fruitOrange)" : "url(#fruitTomato)"} filter="drop-shadow(0 4px 8px rgba(0,0,0,0.18))" />
                        <ellipse cx="-3.5" cy="6.5" rx="4.5" ry="3" fill="url(#specularGlow)" transform="rotate(-30 -3.5 6.5)" />
                      </g>

                      {/* Quả trung tâm 3 (Quả mọng lớn nhất chín ngọt) */}
                      <g transform="translate(100, 150)">
                        <path d="M 0 0 L -5 -7 L 0 -2 L 5 -7 L 3 -1 L 7 2 L 2 1 L 0 6 L -3 1 L -7 2 Z" fill="#15803d" />
                        <circle cx="0" cy="15" r="18" fill={slug === 'trai-cay' || slug === 'dac-san' ? "url(#fruitOrange)" : "url(#fruitTomato)"} filter="drop-shadow(0 6px 12px rgba(0,0,0,0.22))" />
                        <ellipse cx="-5.5" cy="9" rx="6.5" ry="4" fill="url(#specularGlow)" transform="rotate(-30 -5.5 9)" />
                        <circle cx="4.5" cy="20" r="2" fill="#ffffff" className="animate-dew-glimmer" />
                      </g>
                    </g>
                  </svg>
                </div>

                {/* Dây leo & cành lá dưới đung đưa nhịp nhàng ở góc dưới bên phải */}
                <div className="absolute -bottom-8 -right-8 z-30 pointer-events-none w-52 sm:w-60 h-44 sm:h-52 animate-branch-bottom drop-shadow-[0_10px_20px_rgba(20,83,45,0.18)]">
                  <svg viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
                    {/* Dây leo vươn lên */}
                    <path 
                      d="M 230 210 C 195 165, 150 130, 95 105 C 62 88, 30 72, 8 55" 
                      stroke="url(#woodyStem)" 
                      strokeWidth="4.5" 
                      strokeLinecap="round" 
                    />

                    {/* Lá dưới 1 */}
                    <g className="animate-leaf-flutter-2">
                      <path 
                        d="M 152 132 C 140 105, 108 105, 92 122 C 114 138, 136 142, 152 132 Z" 
                        fill="url(#leafGradB)" 
                      />
                      <path d="M 152 132 Q 125 120 92 122" stroke="#bbf7d0" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                      <circle cx="92" cy="122" r="2.8" fill="#ffffff" className="animate-dew-glimmer" />
                    </g>

                    {/* Lá dưới 2 */}
                    <g className="animate-leaf-flutter-1">
                      <path 
                        d="M 98 105 C 88 78, 55 78, 38 95 C 60 110, 82 116, 98 105 Z" 
                        fill="url(#leafGradA)" 
                      />
                      <path d="M 98 105 Q 70 94 38 95" stroke="#bbf7d0" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />
                    </g>

                    {/* Lá non đầu cành */}
                    <g className="animate-leaf-flutter-3">
                      <path 
                        d="M 32 72 C 20 50, 5 50, -6 62 C 10 78, 22 80, 32 72 Z" 
                        fill="url(#leafGradB)" 
                      />
                      <circle cx="-6" cy="62" r="2.2" fill="#ffffff" className="animate-dew-glimmer" />
                    </g>
                  </svg>
                </div>

                {/* Cánh lá xanh 1 bay lơ lửng trong gió */}
                <div className="absolute top-3 right-16 z-25 pointer-events-none w-9 h-9 animate-leaf-drift-1 drop-shadow-sm">
                  <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                    <path d="M 6 34 C 12 19, 27 9, 39 4 C 33 19, 21 31, 6 34 Z" fill="url(#leafGradA)" />
                    <path d="M 6 34 Q 21 20 39 4" stroke="#bbf7d0" strokeWidth="1" opacity="0.8" />
                  </svg>
                </div>

                {/* Cánh lá xanh 2 bay lơ lửng theo hướng ngược lại */}
                <div className="absolute bottom-12 left-12 z-25 pointer-events-none w-8 h-8 animate-leaf-drift-2 drop-shadow-sm">
                  <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                    <path d="M 5 35 C 9 21, 23 11, 37 5 C 31 17, 19 27, 5 35 Z" fill="url(#leafGradB)" />
                    <path d="M 5 35 Q 19 19 37 5" stroke="#bbf7d0" strokeWidth="0.8" opacity="0.8" />
                  </svg>
                </div>

                {/* Ánh nắng mai lấp lánh nhẹ */}
                <div className="absolute top-1/4 left-1/3 text-amber-400 z-20 pointer-events-none animate-pulse">
                  <Sparkles size={18} className="drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]" />
                </div>
                <div className="absolute bottom-1/3 right-1/4 text-emerald-300 z-20 pointer-events-none animate-pulse">
                  <Sparkles size={16} className="drop-shadow-[0_0_6px_rgba(110,231,183,0.85)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search within category */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder={`Tìm sản phẩm trong ${categoryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Region Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">Vùng miền:</span>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                <option value="all">Tất cả vùng miền</option>
                {regions.filter(r => r !== 'all').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                <option value="default">Mặc định</option>
                <option value="popular">Bán chạy nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Count Header & Category Switcher */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-sm text-gray-600 font-medium">
            Hiển thị <strong className="text-emerald-700 text-base">{filteredProducts.length}</strong> sản phẩm {categoryName}
          </p>

          {/* Quick other category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Danh mục khác:</span>
            {allCategories.filter(c => c.slug !== slug).map(cat => (
              <Link 
                key={cat.slug} 
                href={`/category/${cat.slug}/`}
                className="text-xs bg-white border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-700 px-3 py-1.5 rounded-full transition-colors font-medium shadow-xs"
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 3. Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                farmerName={product.farmer?.name || 'Nông Hộ GreenFood'}
                farmerId={product.farmer?.id || product.farmerId}
                region={product.farmer?.region || 'Việt Nam'}
                image={product.images[0]}
                defaultPrice={product.variants[0]?.price || 0}
                originalPrice={product.variants[0]?.comparePrice}
                defaultUnit={product.variants[0]?.unit || '1kg'}
                defaultVariantId={product.variants[0]?.id || 'v1'}
                badge={product.badge}
                soldCount={product.soldCount}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 text-sm mb-6">
              Không có sản phẩm nào phù hợp với điều kiện tìm kiếm và bộ lọc của bạn.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setFilterRegion('all'); setSortBy('default'); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
