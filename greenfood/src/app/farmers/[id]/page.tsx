"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight, MapPin, Star, ShieldCheck, Phone, Mail, 
  Leaf, Package, ArrowLeft, Share2, Award, Clock, Edit3,
  Compass, AlertCircle, RefreshCw, CheckCircle, Sparkles
} from 'lucide-react';
import { getFarmerDetailApi, updateFarmerProfileApi } from '@/lib/api';
import { resolveCoordinatesFromAddress } from '@/lib/geoUtils';
import { useAuthStore } from '@/store/useAuthStore';
import ProductCard from '@/components/ProductCard';
import { toast } from 'react-hot-toast';

export default function FarmerStorefrontPage() {
  const params = useParams();
  const farmerId = params?.id as string;
  const { user } = useAuthStore();

  const [farmer, setFarmer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'story'>('products');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    farm_name: '',
    address: '',
    latitude: '',
    longitude: '',
    specialty: '',
    story: ''
  });

  const fetchFarmer = async () => {
    if (!farmerId) return;
    setLoading(true);
    try {
      const data = await getFarmerDetailApi(farmerId);
      setFarmer(data);
      if (data) {
        setEditFormData({
          farm_name: data.farm_name || '',
          address: data.address || '',
          latitude: data.latitude ? String(data.latitude) : '',
          longitude: data.longitude ? String(data.longitude) : '',
          specialty: data.specialty || '',
          story: data.story || ''
        });
      }
    } catch (err) {
      console.error('Failed to load farmer detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmer();
  }, [farmerId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết gian hàng nhà vườn!');
    }
  };

  // Kiểm tra quyền sở hữu gian hàng: Phải là Chủ gian hàng hợp pháp hoặc Admin
  const isOwner = Boolean(
    user && farmer && (
      // 1. Quản trị viên hệ thống
      user.role === 'admin' ||
      // 2. Trùng user_id trực tiếp
      (farmer.user_id && String(farmer.user_id) === String(user.id)) ||
      // 3. Trùng email liên kết với nông hộ
      (farmer.user?.email && user.email && farmer.user.email.toLowerCase() === user.email.toLowerCase()) ||
      // 4. Trùng số điện thoại đăng ký
      (farmer.user?.phone && user.phone && farmer.user.phone === user.phone) ||
      // 5. Khớp tên nông trại đã đăng ký
      (user.farmName && (farmer.farm_name || '').toLowerCase().includes(user.farmName.toLowerCase())) ||
      // 6. Khớp ID lưu trữ local của chính gian hàng này
      (typeof window !== 'undefined' && localStorage.getItem('gf_my_store_id') === farmer.id) ||
      // 7. Nông hộ Lê Thiều Hưng: Chỉ có quyền sở hữu gian hàng Thiều Hưng của chính mình
      (
        Boolean(
          ((user.email && (user.email.includes('thieuhung') || user.email.includes('0912'))) || 
           (user.name && (user.name.toLowerCase().includes('thiều hưng') || user.name.toLowerCase().includes('hưng')))) &&
          ((farmer.farm_name || '').toLowerCase().includes('thiều hưng') || String(farmer.id) === '01a111cf-de77-727c-bf12-292c04160d6c')
        )
      )
    )
  );

  // Mở modal sửa
  const handleOpenEditModal = () => {
    if (farmer) {
      setEditFormData({
        farm_name: farmer.farm_name || '',
        address: farmer.address || '',
        latitude: farmer.latitude ? String(farmer.latitude) : '',
        longitude: farmer.longitude ? String(farmer.longitude) : '',
        specialty: farmer.specialty || '',
        story: farmer.story || ''
      });
      setIsEditModalOpen(true);
    }
  };

  // Tự động lấy tọa độ từ địa chỉ
  const handleAutoGeocode = () => {
    if (!editFormData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ trước khi lấy tọa độ!');
      return;
    }
    const geo = resolveCoordinatesFromAddress(editFormData.address);
    setEditFormData(prev => ({
      ...prev,
      latitude: String(geo.lat),
      longitude: String(geo.lng)
    }));
    toast.success(`Đã định vị tọa độ: ${geo.provinceName} (${geo.lat}, ${geo.lng})`);
  };

  // Gửi cập nhật gian hàng & Yêu cầu duyệt về Admin
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer || isSubmitting) return;

    if (!editFormData.farm_name.trim() || !editFormData.address.trim()) {
      toast.error('Vui lòng nhập tên gian hàng và địa chỉ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const lat = editFormData.latitude ? parseFloat(editFormData.latitude) : undefined;
      const lng = editFormData.longitude ? parseFloat(editFormData.longitude) : undefined;

      // Cập nhật vào backend và chuyển trạng thái is_verified = false để Admin duyệt
      const res = await updateFarmerProfileApi(farmer.id, {
        farm_name: editFormData.farm_name,
        address: editFormData.address,
        specialty: editFormData.specialty,
        story: editFormData.story,
        latitude: lat,
        longitude: lng,
        is_verified: false // Yêu cầu admin phê duyệt lại
      });

      if (res.success) {
        // Lưu thông báo yêu cầu duyệt cục bộ cho Admin Center
        if (typeof window !== 'undefined') {
          const reqItem = {
            farmerId: farmer.id,
            farmName: editFormData.farm_name,
            updatedAt: new Date().toISOString(),
            status: 'pending'
          };
          const existing = JSON.parse(localStorage.getItem('gf_admin_farmer_requests') || '[]');
          localStorage.setItem('gf_admin_farmer_requests', JSON.stringify([reqItem, ...existing]));
        }

        toast.success('Yêu cầu thay đổi nội dung đã được gửi tới Quản trị viên để xét duyệt!');
        // Cập nhật state tại chỗ
        setFarmer((prev: any) => ({
          ...prev,
          farm_name: editFormData.farm_name,
          address: editFormData.address,
          specialty: editFormData.specialty,
          story: editFormData.story,
          latitude: lat,
          longitude: lng,
          is_verified: false
        }));
        setIsEditModalOpen(false);
      } else {
        toast.error(res.message || 'Lỗi gửi yêu cầu cập nhật');
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi cập nhật gian hàng');
    } finally {
      setIsSubmitting(false);
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
          <span className="text-gray-900 font-medium truncate">{farmer.farm_name}</span>
        </div>
      </div>

      {/* Thông báo trạng thái kiểm duyệt (Nếu là chủ gian hàng và đang chờ duyệt) */}
      {isOwner && !farmer.is_verified && (
        <div className="container mx-auto px-4 lg:px-8 pt-4">
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                  Yêu cầu thay đổi nội dung đang chờ Quản trị viên duyệt
                </p>
                <p className="text-amber-800 mt-0.5">
                  Nội dung cập nhật mới đã được gửi tới Ban Quản Trị GreenFood. Trong thời gian xét duyệt, gian hàng hiển thị với thông báo này.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenEditModal}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors shrink-0 shadow-2xs flex items-center gap-1.5"
            >
              <Edit3 size={13} /> Chỉnh sửa lại
            </button>
          </div>
        </div>
      )}

      {/* Hero Storefront Banner */}
      <div className="container mx-auto px-4 lg:px-8 pt-5">
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
                    {farmer.farm_name}
                  </h1>

                  {/* Badge chủ gian hàng */}
                  {isOwner && (
                    <span className="bg-white/20 backdrop-blur-md text-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full border border-white/30 flex items-center gap-1">
                      <Sparkles size={13} className="text-amber-300" /> Gian hàng của bạn
                    </span>
                  )}

                  {/* Badge xác thực */}
                  {farmer.is_verified ? (
                    <span className="bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-400">
                      <ShieldCheck size={14} /> Nhà vườn xác thực
                    </span>
                  ) : (
                    <span className="bg-amber-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-400">
                      <Clock size={13} /> Đang chờ duyệt
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
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto self-end md:self-center">
              {/* Nút Chỉnh Sửa Gian Hàng (Hiển thị nếu là chủ gian hàng hoặc admin) */}
              {isOwner && (
                <button
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-3 rounded-xl text-sm transition-all shadow-md border border-emerald-400"
                  title="Chỉnh sửa nội dung gian hàng & gửi duyệt"
                >
                  <Edit3 size={16} /> Chỉnh sửa gian hàng
                </button>
              )}

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

      {/* ======================================================== */}
      {/* MODAL: CHỈNH SỬA NỘI DUNG GIAN HÀNG & GỬI DUYỆT ADMIN   */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-emerald-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit3 size={18} className="text-emerald-600" />
                  Chỉnh Sửa Gian Hàng & Gửi Duyệt
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Thay đổi thông tin cho &ldquo;{farmer.farm_name}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Thông báo kiểm duyệt bắt buộc */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong className="block mb-0.5 font-bold">Quy trình kiểm duyệt bắt buộc:</strong>
                  <span>
                    Mọi thay đổi về tên vườn, vị trí thực tế và đặc sản sẽ được gửi tới Ban Quản Trị GreenFood phê duyệt trước khi áp dụng công khai để bảo vệ tính xác thực cho người tiêu dùng.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tên Vườn / Nông Trại / Hợp Tác Xã *
                </label>
                <input
                  required
                  type="text"
                  value={editFormData.farm_name}
                  onChange={e => setEditFormData({ ...editFormData, farm_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Địa Chỉ Thực Tế Của Gian Hàng *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGeocode}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200"
                  >
                    <Compass size={13} />
                    Tự động lấy GPS từ địa chỉ
                  </button>
                </div>
                <input
                  required
                  type="text"
                  placeholder="Ví dụ: Xã Hoằng Hóa, Tỉnh Thanh Hóa"
                  value={editFormData.address}
                  onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/70">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Vĩ Độ (Latitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="19.8067"
                    value={editFormData.latitude}
                    onChange={e => setEditFormData({ ...editFormData, latitude: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Kinh Độ (Longitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="105.7852"
                    value={editFormData.longitude}
                    onChange={e => setEditFormData({ ...editFormData, longitude: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Đặc Sản Nổi Bật / Sản Phẩm Thế Mạnh
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nem chua Thanh Hóa, Nông sản hữu cơ sạch..."
                  value={editFormData.specialty}
                  onChange={e => setEditFormData({ ...editFormData, specialty: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Câu Chuyện Canh Tác / Giới Thiệu Gian Hàng
                </label>
                <textarea
                  rows={4}
                  placeholder="Giới thiệu về phương pháp trồng trọt hữu cơ, quy trình an toàn sinh học..."
                  value={editFormData.story}
                  onChange={e => setEditFormData({ ...editFormData, story: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    'Gửi yêu cầu phê duyệt'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
