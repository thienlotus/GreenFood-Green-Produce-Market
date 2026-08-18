"use client";

import Link from 'next/link';
import { ShoppingCart, Star, Clock } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

import { toast } from 'react-hot-toast';

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
  soldCount = 0
}: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
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

  // Mock auto calculate discount
  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - defaultPrice) / originalPrice) * 100) 
    : 0;

  return (
    <Link href={`/product/${slug}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden relative">
      
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {discountPercent > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            -{discountPercent}%
          </span>
        )}
        {badge && (
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            {badge}
          </span>
        )}
      </div>

      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={image} 
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Fast Delivery Badge */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2">
          <div className="flex items-center gap-1 text-white text-[10px] font-medium">
            <Clock size={12} className="text-amber-400" />
            <span>Giao 2H</span>
            <span className="mx-1">•</span>
            <span>{region}</span>
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider">{farmerName}</p>
        <h3 className="font-semibold text-gray-800 text-sm mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors h-10">
          {name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < rating ? "currentColor" : "none"} strokeWidth={i < rating ? 0 : 2} className={i >= rating ? "text-gray-300" : ""} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({soldCount > 0 ? `Đã bán ${soldCount}` : 'Mới'})</span>
        </div>
        
        <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-[11px] text-gray-400 line-through mb-0.5">
                {originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-emerald-600 font-bold text-base">
                {defaultPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-[10px] text-gray-400">/{defaultUnit}</span>
            </div>
          </div>
          <button 
            onClick={handleAddToCart}
            className="bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white p-2 rounded-full shadow-sm transition-colors border border-emerald-100"
            title="Thêm vào giỏ"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
