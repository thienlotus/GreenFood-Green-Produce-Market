"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight, MapPin, Star, ShieldCheck, Phone, Mail, 
  Leaf, Package, ArrowLeft, Share2, Award, Clock
} from 'lucide-react';
import { getFarmerDetailApi, FarmerData } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { toast } from 'react-hot-toast';

export default function FarmerStorefrontPage() {
  const params = useParams();
  const farmerId = params?.id as string;

  const [farmer, setFarmer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'story'>('products');

  useEffect(() => {
    if (!farmerId) return;
    
    async function fetchFarmer() {
      setLoading(true);
      try {
        const data = await getFarmerDetailApi(farmerId);
        setFarmer(data);
      } catch (err) {
        console.error('Failed to load farmer detail', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFarmer();
  }, [farmerId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết gian hàng nhà vườn!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl space-y-6">
          <div className="h-64 bg-gray-200 rounded-3xl animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🚜</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy gian hàng nông hộ</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Nhà vườn này có thể chưa được kích hoạt hoặc đường dẫn không chính xác.
        </p>
        <Link
          href="/farmers"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft size={18} /> Quay lại danh sách nông hộ
        </Link>
      </div>
    );
  }

  const productsList = Array.isArray(farmer.products) ? farmer.products : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center text-xs text-gray-500 gap-1.5">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={12} />
          <Link href="/farmers" className="hover:text-emerald-600 transition-colors">Nông hộ đối tác</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium truncate">{farmer.farm_name || farmer.name}</span>
        </div>
      </div>

      {/* Hero Storefront Banner */}
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 rounded-3xl text-white overflow-hidden shadow-lg relative">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="p-6 md:p-10 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-bold text-4xl shadow-md shrink-0 border-4 border-white/20">
                🌱
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {farmer.farm_name || farmer.name}
                  </h1>
                  {farmer.is_verified && (
                    <span className="bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-400">
                      <ShieldCheck size={14} /> Nhà vườn xác thực
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-emerald-100/90">
                  <span className="flex items-center gap-1">
                    <MapPin size={15} className="text-emerald-300" />
                    {farmer.address || 'Việt Nam'}
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star size={15} fill="currentColor" />
                    {Number(farmer.rating || 5.0).toFixed(1)} / 5.0
                  </span>
                  <span className="flex items-center gap-1">
                    <Package size={15} className="text-emerald-300" />
                    {productsList.length} nông sản đang bán
                  </span>
                </div>

                <p className="text-xs md:text-sm text-emerald-200 mt-2 line-clamp-1">
                  Đặc sản chính: <strong className="text-white">{farmer.specialty || 'Nông sản hữu cơ sạch'}</strong>
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto self-end md:self-center">
              <button
                onClick={handleShare}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border border-white/20"
                title="Chia sẻ gian hàng"
              >
                <Share2 size={18} />
              </button>
              <Link
                href="/map"
                className="flex-1 sm:flex-none text-center bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-md"
              >
                Vị trí vườn 📍
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-emerald-950/60 border-t border-white/10 px-6 md:px-10 py-3 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span>Tiêu chuẩn: <strong>VietGAP / Hữu cơ tự nhiên</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-emerald-400" />
              <span>Thu hoạch: <strong>Hái trong ngày & chuyển ngay</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Cam kết: <strong>Bảo đảm tươi ngon 100%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Products */}
      <div className="container mx-auto px-4 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Leaf size={16} />
            Nông sản của gian hàng ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`pb-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'story'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            📖 Câu chuyện nhà vườn
          </button>
        </div>

        {/* Tab 1: Products Grid */}
        {activeTab === 'products' && (
          <div>
            {productsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto">
                <div className="text-5xl mb-3">🧺</div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Nhà vườn đang chăm sóc vụ mới</h3>
                <p className="text-xs text-gray-500">
                  Các loại nông sản sắp tới ngày thu hoạch sẽ sớm được mở bán tại đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {productsList.map((product: any) => {
                  const variant = product.variants?.[0] || {};
                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      farmerName={farmer.farm_name || farmer.name}
                      farmerId={farmer.id}
                      region={farmer.region?.name || farmer.address || 'Việt Nam'}
                      image={product.image_url || 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=600'}
                      defaultPrice={Number(variant.price || 50000)}
                      originalPrice={variant.compare_at_price ? Number(variant.compare_at_price) : undefined}
                      defaultUnit={variant.unit || 'kg'}
                      defaultVariantId={String(variant.id || product.id)}
                      badge={product.badge || 'Trực tiếp từ vườn'}
                      rating={product.rating ? Number(product.rating) : 5}
                      soldCount={product.sold_count ? Number(product.sold_count) : 0}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Story & Soil Philosophy */}
        {activeTab === 'story' && (
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Leaf className="text-emerald-600" size={24} />
                Tâm huyết từ đất mẹ & người làm vườn
              </h2>
              <div className="prose text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {farmer.story || (
                  `Kính chào quý khách hàng của GreenFood!\n\nChúng tôi là những người nông dân gìn giữ phương thức canh tác tự nhiên, nói KHÔNG với phân bón hóa học độc hại và thuốc trừ sâu lưu dẫn. Mỗi sản phẩm quý vị cầm trên tay là kết tinh của sự chăm sóc cẩn thận từ khâu chọn giống, tưới nguồn nước sạch cho đến thu hái đúng độ chín cây.\n\nCảm ơn quý khách đã ủng hộ nông sản nước nhà và đồng hành cùng người nông dân Việt!`
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <h4 className="font-bold text-emerald-900 text-sm mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" /> Cam kết chất lượng
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  100% nông sản tươi hái vào buổi sớm, đóng thùng đạt chuẩn vệ sinh an toàn thực phẩm trước khi chuyển đến tay bạn.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <h4 className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                  ⭐ Đánh giá cộng đồng
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Được bình chọn {Number(farmer.rating || 5.0).toFixed(1)}/5 sao bởi hơn 1,200 khách hàng tin dùng nông sản GreenFood.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
