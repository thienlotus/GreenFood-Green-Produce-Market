"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingCart, Star, MapPin, ShieldCheck, ChevronRight, Truck, Leaf, Check } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { getProductBySlug, getProducts } from '@/lib/api';
import { ALL_PRODUCTS, ProductItem } from '@/data/products';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [product, setProduct] = useState<ProductItem>(ALL_PRODUCTS[0]);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, setIsOpen } = useCartStore();

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      const prod = await getProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        setSelectedVariant(prod.variants[0]);
        setSelectedImage(prod.images[0]);

        // Load related
        const related = await getProducts({ category: prod.categorySlug, limit: 4 });
        setRelatedProducts(related.filter(p => p.slug !== prod.slug));
      }
      setIsLoading(false);
    }
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      variantId: selectedVariant.id,
      unit: selectedVariant.unit,
      price: selectedVariant.price,
      quantity,
      image: product.images[0]
    });
    setIsAdded(true);
    toast.success(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap text-xs md:text-sm text-gray-500 mb-6 gap-1">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link href={`/category/${product.categorySlug}`} className="hover:text-emerald-600 transition-colors">
            {product.categoryName}
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-800 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10">
            
            {/* Left: Product Images (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square border border-gray-100 flex items-center justify-center">
                <img 
                  src={selectedImage || product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all hover:scale-105 duration-300"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails if multiple images */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImage === img ? 'border-emerald-600 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-emerald-800 text-xs">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <span>Chuẩn VietGAP an toàn</span>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-emerald-800 text-xs">
                  <Truck size={18} className="text-emerald-600 shrink-0" />
                  <span>Giao nhanh 1-2h TP.HCM</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  {product.categoryName}
                </span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {product.name}
                </h1>
                
                {/* Rating & Sold count */}
                <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b border-gray-100">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star size={16} className="fill-current" />
                    <span className="ml-1 text-gray-800">{product.rating || 4.8}</span>
                    <span className="text-xs text-gray-400 font-normal ml-1">/ 5.0</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span>Đã bán <strong className="text-gray-800">{product.soldCount || 120}+</strong></span>
                  <span className="text-gray-300">|</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <MapPin size={13} /> {product.farmer.region}
                  </span>
                </div>
              </div>

              {/* Price Box */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-black text-emerald-600">
                    {selectedVariant.price.toLocaleString('vi-VN')}đ
                  </span>
                  {selectedVariant.comparePrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {selectedVariant.comparePrice.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                  {selectedVariant.comparePrice && (
                    <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      -{Math.round((1 - selectedVariant.price / selectedVariant.comparePrice) * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Đơn vị: <strong>{selectedVariant.unit}</strong> (Đã bao gồm VAT)</p>
              </div>

              {/* Variants Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Chọn phân loại / Khối lượng:</h3>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-2 ${
                          isSelected 
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm' 
                            : 'border-gray-200 text-gray-700 hover:border-emerald-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check size={14} className="text-emerald-600" />}
                        {v.unit} - <span className="text-emerald-700">{v.price.toLocaleString('vi-VN')}đ</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-800">Số lượng:</span>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white overflow-hidden">
                    <button 
                      className="px-4 py-2 text-gray-500 hover:text-emerald-600 font-bold transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >-</button>
                    <span className="w-12 text-center font-bold text-gray-800 text-sm">{quantity}</span>
                    <button 
                      className="px-4 py-2 text-gray-500 hover:text-emerald-600 font-bold transition-colors"
                      onClick={() => setQuantity(quantity + 1)}
                    >+</button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={handleAddToCart}
                    className={`flex-1 font-bold h-13 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm ${
                      isAdded 
                        ? 'bg-emerald-700 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
                    }`}
                  >
                    <ShoppingCart size={20} />
                    {isAdded ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}
                  </button>

                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold h-13 py-3.5 px-6 rounded-2xl transition-all shadow-sm hover:shadow-md text-center"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 text-base flex items-center gap-2">
                  <Leaf size={18} className="text-emerald-600" /> Mô tả sản phẩm
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Farmer Profile Card */}
              <div className="mt-auto bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-emerald-200">
                      👨‍🌾
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{product.farmer.name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-600" /> {product.farmer.address || product.farmer.region}
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/map"
                    className="text-xs font-bold text-emerald-700 hover:underline bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs"
                  >
                    Xem vị trí vườn 📍
                  </Link>
                </div>
                <p className="text-xs text-gray-600 italic bg-white/70 p-3 rounded-xl border border-emerald-100/60 mt-3">
                  &ldquo;{product.farmer.story}&rdquo;
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sản phẩm cùng danh mục</h2>
              <Link 
                href={`/category/${product.categorySlug}`}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1"
              >
                Xem tất cả <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  farmerName={p.farmer.name}
                  region={p.farmer.region}
                  image={p.images[0]}
                  defaultPrice={p.variants[0].price}
                  originalPrice={p.variants[0].comparePrice}
                  defaultUnit={p.variants[0].unit}
                  defaultVariantId={p.variants[0].id}
                  badge={p.badge}
                  soldCount={p.soldCount}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
