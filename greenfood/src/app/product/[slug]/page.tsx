"use client";

import { useState } from 'react';
import { ShoppingCart, Star, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

// Mock data (trong thực tế sẽ fetch theo params.slug)
const productData = {
  id: "p1",
  name: "Sầu Riêng Ri6 Hạt Lép",
  slug: "sau-rieng-ri6",
  description: "Sầu riêng Ri6 trứ danh được trồng tại vùng phù sa màu mỡ Chợ Lách, Bến Tre. Cơm vàng óng, hạt lép, độ ngọt vừa phải và béo ngậy. Cam kết chín cây tự nhiên, không nhúng thuốc ép chín.",
  farmer: {
    name: "Vườn Trái Cây Chú Ba",
    region: "Bến Tre",
    rating: 4.8,
    story: "Hơn 20 năm gắn bó với cây sầu riêng, vườn chú Ba áp dụng chuẩn VietGAP mang lại những trái sầu riêng an toàn nhất."
  },
  images: [
    "https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=800&auto=format&fit=crop"
  ],
  variants: [
    { id: "v1", unit: "Tách vỏ (Hộp 500g)", price: 190000, comparePrice: 220000 },
    { id: "v2", unit: "Nguyên trái (2.5-3kg)", price: 350000, comparePrice: 400000 }
  ]
};

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const [selectedVariant, setSelectedVariant] = useState(productData.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      variantId: selectedVariant.id,
      unit: selectedVariant.unit,
      price: selectedVariant.price,
      quantity,
      image: productData.images[0]
    });
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-emerald-600">Trang chủ</a>
        <ChevronRight size={16} className="mx-1" />
        <a href="#" className="hover:text-emerald-600">Trái cây</a>
        <ChevronRight size={16} className="mx-1" />
        <span className="text-gray-800 font-medium">{productData.name}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="p-4 lg:p-8 bg-gray-50 flex items-center justify-center">
            <img 
              src={productData.images[0]} 
              alt={productData.name} 
              className="w-full max-w-md rounded-xl shadow-md object-cover aspect-square"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 lg:p-10 flex flex-col">
            <div className="mb-2">
              <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">Đặc sản mùa vụ</span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{productData.name}</h1>
              
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center text-amber-500">
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current text-gray-300" />
                  <span className="text-gray-600 ml-1">(128 đánh giá)</span>
                </div>
                <div className="text-gray-400">|</div>
                <div className="text-gray-600">Đã bán 500+</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-emerald-600">
                  {selectedVariant.price.toLocaleString('vi-VN')}đ
                </span>
                {selectedVariant.comparePrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {selectedVariant.comparePrice.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8 border-t border-b border-gray-100 py-6">
              <h3 className="font-semibold text-gray-900 mb-3">Chọn khối lượng:</h3>
              <div className="flex flex-wrap gap-3">
                {productData.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-5 py-2.5 rounded-lg border-2 transition-all font-medium ${
                      selectedVariant.id === v.id 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 text-gray-600 hover:border-emerald-200'
                    }`}
                  >
                    {v.unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border-2 border-gray-200 rounded-lg h-12">
                <button 
                  className="px-4 text-gray-500 hover:text-emerald-600 font-bold"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >-</button>
                <span className="w-10 text-center font-semibold text-gray-800">{quantity}</span>
                <button 
                  className="px-4 text-gray-500 hover:text-emerald-600 font-bold"
                  onClick={() => setQuantity(quantity + 1)}
                >+</button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ
              </button>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-2">Thông tin sản phẩm</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {productData.description}
              </p>
            </div>

            {/* Farmer Info */}
            <div className="mt-auto bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                  👨‍🌾
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{productData.farmer.name}</h4>
                  <div className="flex items-center text-xs text-emerald-700 gap-2">
                    <span className="flex items-center gap-1"><MapPin size={12}/> {productData.farmer.region}</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={12}/> Chuẩn VietGAP</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic">
                "{productData.farmer.story}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
