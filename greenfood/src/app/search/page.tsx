"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  ChevronRight, 
  SlidersHorizontal, 
  Sparkles, 
  PackageX, 
  TrendingUp, 
  RotateCcw,
  ArrowUpDown,
  MapPin,
  Tag
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/api';
import { ProductItem } from '@/data/products';

const POPULAR_SUGGESTIONS = [
  'Cam sành',
  'Sầu riêng',
  'Dâu tây',
  'Nho mẫu đơn',
  'Dưa lưới',
  'Chuối Laba',
  'Rau củ',
  'Bưởi'
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default');
  const [filterRegion, setFilterRegion] = useState<string>('all');

  // Sync input when queryParam changes (e.g. from header)
  useEffect(() => {
    setInputQuery(queryParam);
  }, [queryParam]);

  // Fetch products based on queryParam
  useEffect(() => {
    let isMounted = true;

    async function fetchSearchResults() {
      setIsLoading(true);
      try {
        const data = await getProducts({ search: queryParam.trim() });
        if (isMounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Lỗi khi tải kết quả tìm kiếm:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSearchResults();

    return () => {
      isMounted = false;
    };
  }, [queryParam]);

  // Handle local search submit
  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputQuery.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleQuickTagClick = (tag: string) => {
    setInputQuery(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  // Regions list extracted from products
  const regions = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.farmer.region).filter(Boolean)));
    return ['all', ...list];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Region
    if (filterRegion !== 'all') {
      result = result.filter(p => p.farmer.region === filterRegion);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.variants[0].price - b.variants[0].price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.variants[0].price - a.variants[0].price);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return result;
  }, [products, filterRegion, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header Banner & Search Box */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white py-10 md:py-14 shadow-md relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center text-xs md:text-sm text-emerald-200 mb-4 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="mx-1.5 text-emerald-300" />
            <span className="text-white">Tìm kiếm</span>
            {queryParam && (
              <>
                <ChevronRight size={14} className="mx-1.5 text-emerald-300" />
                <span className="text-emerald-100 italic truncate max-w-xs">&quot;{queryParam}&quot;</span>
              </>
            )}
          </nav>

          {/* Heading */}
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {queryParam ? (
                <>Kết quả tìm kiếm cho: <span className="text-amber-300">&quot;{queryParam}&quot;</span></>
              ) : (
                'Tìm Kiếm Nông Sản Xanh'
              )}
            </h1>
            <p className="text-emerald-100 text-sm md:text-base mt-2 font-normal">
              Khám phá nông sản sạch, trái cây nhiệt đới và đặc sản trực tiếp từ các nhà vườn chuẩn VietGAP.
            </p>

            {/* In-page Search Form */}
            <form onSubmit={handleSubmitSearch} className="mt-6 flex items-center gap-2 max-w-2xl bg-white p-1.5 rounded-2xl shadow-xl">
              <div className="flex-1 flex items-center pl-3">
                <Search size={20} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Gõ tên nông sản, nhà vườn hoặc vùng miền..."
                  className="w-full text-gray-800 text-sm md:text-base focus:outline-none placeholder-gray-400 bg-transparent py-2"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>Tìm ngay</span>
              </button>
            </form>

            {/* Quick tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-emerald-100">
              <span className="flex items-center gap-1 font-semibold text-white/90">
                <Sparkles size={13} className="text-amber-300" /> Gợi ý:
              </span>
              {POPULAR_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    queryParam.toLowerCase() === tag.toLowerCase()
                      ? 'bg-amber-400 text-emerald-950 font-bold shadow'
                      : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="container mx-auto px-4 lg:px-8 mt-8">
        {/* Controls Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span>Tìm thấy</span>
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {filteredProducts.length}
            </span>
            <span>sản phẩm phù hợp</span>
          </div>

          {/* Filter & Sort controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Region Filter */}
            {regions.length > 2 && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
                <MapPin size={14} className="text-emerald-600" />
                <span className="text-gray-500">Vùng:</span>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả vùng</option>
                  {regions.filter(r => r !== 'all').map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <ArrowUpDown size={14} className="text-emerald-600" />
              <span className="text-gray-500">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="default">Mặc định</option>
                <option value="popular">Bán chạy nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Product List / Skeleton / Empty State */}
        {isLoading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3 animate-pulse">
                <div className="w-full h-44 bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                farmerName={product.farmer.name}
                region={product.farmer.region}
                image={product.images[0]}
                defaultPrice={product.variants[0]?.price || 0}
                originalPrice={product.variants[0]?.comparePrice}
                defaultUnit={product.variants[0]?.unit || 'kg'}
                defaultVariantId={product.variants[0]?.id || 'v1'}
                badge={product.badge}
                rating={product.rating}
                soldCount={product.soldCount}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-10 md:p-16 text-center border border-gray-100 shadow-xs max-w-xl mx-auto my-6">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <PackageX size={44} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Không tìm thấy sản phẩm nào
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Rất tiếc, GreenFood chưa tìm thấy nông sản nào khớp với từ khóa{' '}
              <strong className="text-emerald-700 font-semibold">&quot;{queryParam}&quot;</strong>.
              Bạn hãy thử kiểm tra lại chính tả hoặc tìm theo từ khóa phổ biến dưới đây nhé!
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {POPULAR_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-full text-xs font-semibold transition-colors cursor-pointer border border-emerald-200/60"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setInputQuery('');
                  router.push('/search?q=');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                <span>Xem tất cả nông sản</span>
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors text-center"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Đang tải kết quả tìm kiếm...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
