"use client";

import { useState, useEffect, useMemo } from 'react';
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
  const slug = rawSlug.replace(/_/g, '-');

  const defaultCategory = getMockCategoryBySlug(slug) || null;
  const defaultProducts = getMockProductsByCategory(slug);

  const [category, setCategory] = useState<CategoryInfo | null>(defaultCategory);
  const [products, setProducts] = useState<ProductItem[]>(defaultProducts);
  const [allCategories, setAllCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [isLoading, setIsLoading] = useState(!defaultCategory && defaultProducts.length === 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default');
  const [filterRegion, setFilterRegion] = useState<string>('all');

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
  const bannerImg = category?.bannerImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop';

  const CategoryIcon = useMemo(() => {
    if (slug === 'di-cho-online') return ShoppingBag;
    if (slug === 'trai-cay') return Apple;
    if (slug === 'tra-ca-phe') return Coffee;
    if (slug === 'dac-san') return Sparkles;
    if (slug === 'agrishow') return Store;
    return Leaf;
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
      {/* 1. Category Hero Banner - Modern Cinematic Presentation */}
      <div className="relative bg-emerald-950 text-white overflow-hidden py-12 md:py-16 border-b border-emerald-900/50">
        <div 
          className="absolute inset-0 opacity-35 bg-cover bg-center scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url(${bannerImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/85 to-transparent" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-xs md:text-sm text-emerald-200/90 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="mx-1.5 text-emerald-400" />
            <span className="text-emerald-300">Danh mục nông sản</span>
            <ChevronRight size={14} className="mx-1.5 text-emerald-400" />
            <span className="text-white font-semibold">{categoryName}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 mb-3.5 border border-white/15 shadow-sm">
                <Leaf size={14} className="text-emerald-400" /> Nông sản chọn lọc GreenFood
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-white flex items-center gap-3.5">
                <span className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                  <CategoryIcon size={26} />
                </span>
                <span>{categoryName}</span>
              </h1>
              <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
                {categoryDesc}
              </p>
            </div>

            {/* Floating Glass Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl shadow-sm">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-bold text-white">100% Chuẩn VietGAP & OCOP</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl shadow-sm">
                <Truck size={18} className="text-amber-400" />
                <span className="text-xs font-bold text-white">Giao hỏa tốc 2H</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
