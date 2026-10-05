"use client";

import Link from 'next/link';
import { ShoppingCart, Star, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

import { toast } from 'react-hot-toast';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  farmerName: string;
  region: string;
  image: string;
  defaultPrice: number;
  defaultUnit: string;
  defaultVariantId: string;
  originalPrice?: number;
  badge?: string;
  rating?: number;
  soldCount?: number;
  /** Hiển thị thanh tiến độ "Đã bán" (dùng cho Flash Sale) */
  showSoldProgress?: boolean;
}

export default function ProductCard({
  id,
  name,
  slug,
  farmerName,
  region,
  image,
  defaultPrice,
  defaultUnit,
  defaultVariantId,
  originalPrice,
  badge = "Đặc sản",
  rating = 5,
  soldCount = 0,
  showSoldProgress = false
}: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      slug,
      variantId: defaultVariantId,
      unit: defaultUnit,
      price: defaultPrice,
      quantity: 1,
      image
    });
    toast.success(`Đã thêm ${name} vào giỏ hàng!`);
  };

  const discountPercent = originalPrice && originalPrice > defaultPrice
    ? Math.round(((originalPrice - defaultPrice) / originalPrice) * 100)
    : 0;

  const roundedRating = Math.round(rating);
  // Thanh tiến độ flash sale: giả định mỗi đợt mở bán 200 suất
  const soldPercent = Math.min(100, Math.max(8, Math.round((soldCount / 200) * 100)));

  return (
    <Link
      href={`/product/${slug}`}
      id={`product-card-${id}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-200"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={image || FALLBACK_IMAGE}
          alt={name}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {badge && (
            <span className="bg-white/95 backdrop-blur text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm border border-emerald-100">
              {badge}
            </span>
          )}
        </div>

        {/* Nút thêm nhanh vào giỏ (hiện khi hover trên desktop) */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="hidden md:flex absolute bottom-3 left-3 right-3 items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          <ShoppingCart size={16} /> Thêm vào giỏ
        </button>
      </div>

      {/* Thông tin */}
      <div className="flex flex-col flex-1 p-3 md:p-3.5">
        <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1 min-w-0">
          <MapPin size={11} className="text-emerald-500 shrink-0" />
          <span className="truncate">{region}</span>
          <span className="text-gray-300">•</span>
          <span className="truncate">{farmerName}</span>
        </div>

        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                fill={i < roundedRating ? "currentColor" : "none"}
                strokeWidth={i < roundedRating ? 0 : 2}
                className={i >= roundedRating ? "text-gray-300" : ""}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">
            {soldCount > 0 ? `Đã bán ${soldCount.toLocaleString('vi-VN')}` : 'Mới'}
          </span>
        </div>

        {/* Giá + nút giỏ hàng */}
        <div className="flex items-end justify-between gap-2 mt-auto pt-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-rose-600 font-bold text-base md:text-lg leading-none">
                {defaultPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-[11px] text-gray-400 truncate">/{defaultUnit}</span>
            </div>
            {discountPercent > 0 && originalPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="md:hidden shrink-0 bg-emerald-50 active:bg-emerald-600 text-emerald-600 active:text-white p-2 rounded-full border border-emerald-100 transition-colors"
            title="Thêm vào giỏ"
            aria-label={`Thêm ${name} vào giỏ`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {showSoldProgress && (
          <div className="mt-3">
            <div className="relative h-4 rounded-full bg-rose-100 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-400 to-rose-500"
                style={{ width: `${soldPercent}%` }}
              />
              <span className="relative z-10 flex items-center justify-center h-full text-[10px] font-bold text-white uppercase tracking-wide drop-shadow">
                {soldPercent >= 85 ? 'Sắp cháy hàng' : `Đã bán ${soldCount}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
