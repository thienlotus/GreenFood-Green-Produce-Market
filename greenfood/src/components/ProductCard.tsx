"use client";

import Link from 'next/link';
import { ShoppingCart, Star, MapPin, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';
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
  name: rawName,
  slug,
  farmerName: rawFarmerName,
  region: rawRegion,
  image,
  defaultPrice,
  defaultUnit: rawDefaultUnit,
  defaultVariantId,
  originalPrice,
  badge: rawBadge = "Đặc sản",
  rating = 5,
  soldCount = 0,
  showSoldProgress = false
}: ProductCardProps) {
  const { addItem } = useCartStore();

  const name = cleanVietnameseMojibake(rawName);
  const farmerName = cleanVietnameseMojibake(rawFarmerName);
  const region = cleanVietnameseMojibake(rawRegion);
  const defaultUnit = cleanVietnameseMojibake(rawDefaultUnit);
  const badge = rawBadge ? cleanVietnameseMojibake(rawBadge) : "Đặc sản";

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
    toast.success(`Đã thêm "${name}" vào giỏ hàng!`, {
      icon: '🌿',
      style: {
        borderRadius: '12px',
        background: '#064e3b',
        color: '#fff',
        fontSize: '13px',
        fontWeight: '500',
      }
    });
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
      className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100/90 overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-200"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative aspect-square overflow-hidden bg-gray-50/80">
        <img
          src={image || FALLBACK_IMAGE}
          alt={name}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
          className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Lớp bóng đổ mờ nghệ thuật tạo chiều sâu ảnh */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Huy hiệu đặc sản & Giảm giá (Frosted Glass Badge) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
              -{discountPercent}%
            </span>
          )}
          {badge && (
            <span className="glass-pill text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {badge}
            </span>
          )}
        </div>

        {/* Nút thêm nhanh vào giỏ desktop (trượt nhẹ từ dưới lên với gradient mượt) */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="hidden md:flex absolute bottom-3 left-3 right-3 items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-950/20 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 active:scale-95"
        >
          <ShoppingCart size={15} /> Thêm nhanh vào giỏ
        </button>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex flex-col flex-1 p-3.5 md:p-4">
        {/* Nguồn gốc & Nông hộ */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-800/80 mb-1.5 min-w-0 bg-emerald-50/70 self-start px-2 py-0.5 rounded-md border border-emerald-100/60">
          <MapPin size={11} className="text-emerald-600 shrink-0" />
          <span className="truncate max-w-[90px]">{region}</span>
          <span className="text-emerald-300">•</span>
          <span className="truncate max-w-[100px] text-emerald-900 font-semibold">{farmerName}</span>
        </div>

        {/* Tên sản phẩm */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-emerald-700 transition-colors">
          {name}
        </h3>

        {/* Đánh giá sao & Số lượng đã bán */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < roundedRating ? "currentColor" : "none"}
                strokeWidth={i < roundedRating ? 0 : 2}
                className={i >= roundedRating ? "text-gray-200" : ""}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            {soldCount > 0 ? `Đã bán ${soldCount.toLocaleString('vi-VN')}` : 'Mới về'}
          </span>
        </div>

        {/* Giá & Nút giỏ hàng mobile */}
        <div className="flex items-end justify-between gap-2 mt-auto pt-3 border-t border-gray-100/80">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-rose-600 font-extrabold text-base md:text-lg leading-none tracking-tight">
                {defaultPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-[11px] text-gray-400 font-normal">/{defaultUnit}</span>
            </div>
            {discountPercent > 0 && originalPrice && (
              <span className="text-[11px] text-gray-400 line-through block mt-0.5">
                {originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="md:hidden shrink-0 bg-emerald-600 active:bg-emerald-700 text-white p-2.5 rounded-xl shadow-md active:scale-95 transition-all"
            title="Thêm vào giỏ"
            aria-label={`Thêm ${name} vào giỏ`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Thanh tiến độ Flash Sale */}
        {showSoldProgress && (
          <div className="mt-3">
            <div className="relative h-4 rounded-full bg-rose-100/80 overflow-hidden shadow-inner">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 transition-all duration-500"
                style={{ width: `${soldPercent}%` }}
              />
              <span className="relative z-10 flex items-center justify-center h-full text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-xs">
                {soldPercent >= 85 ? 'Sắp cháy hàng 🔥' : `Đã bán ${soldCount}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
