"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight, 
  Leaf, 
  Search, 
  ShoppingBag
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getCategoryBySlug, getProducts, getCategories } from '@/lib/api';
import { ProductItem, CategoryInfo } from '@/data/products';

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default');
  const [filterRegion, setFilterRegion] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [catData, prodData, allCats] = await Promise.all([
        getCategoryBySlug(slug),
        getProducts({ category: slug }),
        getCategories()
      ]);

      setCategory(catData || null);
      setProducts(prodData);
      setAllCategories(allCats);
      setIsLoading(false);
    }
    if (slug) {
      loadData();
    }
  }, [slug]);

  // Extract regions for filter
  const regions = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.farmer.region).filter(Boolean)));
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
        p.farmer.name.toLowerCase().includes(term) ||
        p.farmer.region.toLowerCase().includes(term)
      );
    }

    // Region filter
    if (filterRegion !== 'all') {
      result = result.filter(p => p.farmer.region === filterRegion);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.variants[0].price - b.variants[0].price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.variants[0].price - a.variants[0].price);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return result;
  }, [products, searchTerm, filterRegion, sortBy]);

  if (!isLoading && !category && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Danh mục không tồn tại</h1>
        <p className="text-gray-500 mb-6">Không tìm thấy danh mục bạn yêu cầu.</p>
        <Link href="/" className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:bg-emerald-700 transition-colors">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const categoryName = category?.name || (slug === 'di-cho-online' ? 'Đi chợ online' : 'Nông sản chọn lọc');
  const categoryDesc = category?.description || 'Nông sản sạch từ các nông hộ đối tác khắp Việt Nam.';
  const bannerImg = category?.bannerImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Category Hero Banner */}
      <div className="relative bg-emerald-900 text-white overflow-hidden py-12 md:py-16">
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900/80 to-transparent" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-xs md:text-sm text-emerald-200 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="mx-1 text-emerald-400" />
            <span>Danh mục</span>
            <ChevronRight size={14} className="mx-1 text-emerald-400" />
            <span className="text-white font-semibold">{categoryName}</span>
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-800/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-3 border border-emerald-700">
              <Leaf size={14} /> Nông sản chọn lọc GreenFood
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {category?.icon} {categoryName}
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
              {categoryDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search within category */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder={`Tìm trong ${categoryName}...`}
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
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Tất cả vùng</option>
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
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="default">Mặc định</option>
                <option value="popular">Bán chạy nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Count Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600 font-medium">
            Hiển thị <strong className="text-emerald-700">{filteredProducts.length}</strong> sản phẩm
          </p>

          {/* Quick other category pills */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-gray-400">Danh mục khác:</span>
            {allCategories.filter(c => c.slug !== slug).slice(0, 4).map(cat => (
              <Link 
                key={cat.slug} 
                href={`/category/${cat.slug}`}
                className="text-xs bg-white border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-700 px-3 py-1 rounded-full transition-colors"
              >
                {cat.name}
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
                farmerName={product.farmer.name}
                region={product.farmer.region}
                image={product.images[0]}
                defaultPrice={product.variants[0].price}
                originalPrice={product.variants[0].comparePrice}
                defaultUnit={product.variants[0].unit}
                defaultVariantId={product.variants[0].id}
                badge={product.badge}
                soldCount={product.soldCount}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 text-sm mb-6">
              Không có sản phẩm nào phù hợp với điều kiện tìm kiếm và bộ lọc của bạn.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setFilterRegion('all'); setSortBy('default'); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
