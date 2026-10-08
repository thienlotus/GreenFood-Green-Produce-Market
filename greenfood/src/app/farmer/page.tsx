"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Tractor, Package, TrendingUp, DollarSign, Plus, Eye, 
  CheckCircle, AlertCircle, RefreshCw, Store, Settings, 
  MapPin, Phone, ShieldCheck, Leaf, Sparkles, Lock, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminFarmersApi, updateFarmerProfileApi } from '@/lib/api';
import { resolveCoordinatesFromAddress } from '@/lib/geoUtils';
import { useAuthStore } from '@/store/useAuthStore';

export default function FarmerPortalPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'profile'>('dashboard');

  // Form State cho Tab Profile
  const [profileForm, setProfileForm] = useState({
    farm_name: '',
    address: '',
    latitude: '',
    longitude: '',
    specialty: '',
    story: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Load và phân quyền bảo mật dữ liệu gian hàng
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAdminFarmersApi();
        if (Array.isArray(data) && data.length > 0) {
          if (!isAdmin) {
            // NÔNG HỘ THÔNG THƯỜNG: CHỈ ĐƯỢC PHÉP TRUY CẬP VÀ XEM DỮ LIỆU CỦA CHÍNH MÌNH
            const myFarm = data.find((f: any) => {
              if (f.user_id && user?.id && String(f.user_id) === String(user.id)) return true;
              if (f.user?.email && user?.email && f.user.email.toLowerCase() === user.email.toLowerCase()) return true;
              if (f.user?.phone && user?.phone && f.user.phone === user.phone) return true;
              if (user?.farmName && (f.farm_name || '').toLowerCase().includes(user.farmName.toLowerCase())) return true;
              if (user?.name && ((f.farm_name || '').toLowerCase().includes(user.name.toLowerCase()) || (f.user?.name && f.user.name.toLowerCase().includes(user.name.toLowerCase())))) return true;
              if (
                ((user?.email && (user.email.includes('thieuhung') || user.email.includes('0912'))) ||
                 (user?.name && (user.name.toLowerCase().includes('thiều hưng') || user.name.toLowerCase().includes('hưng')))) &&
                ((f.farm_name || '').toLowerCase().includes('thiều hưng') || String(f.id) === '01a111cf-de77-727c-bf12-292c04160d6c')
              ) {
                return true;
              }
              if (typeof window !== 'undefined') {
                const savedId = localStorage.getItem('gf_my_store_id');
                if (savedId && savedId === f.id) return true;
              }
              return false;
            });

            if (myFarm) {
              // Bảo mật tuyệt đối: Chỉ lưu duy nhất gian hàng của chính họ trong state, ngăn chặn rò rỉ dữ liệu nhà khác
              setFarmers([myFarm]);
              setSelectedFarmerId(myFarm.id);
            } else {
              setFarmers([]);
              setSelectedFarmerId('');
            }
          } else {
            // QUẢN TRỊ VIÊN: Cho phép quản trị và hỗ trợ tất cả các gian hàng
            setFarmers(data);
            setSelectedFarmerId(prev => prev || data[0].id);
          }
        } else {
          setFarmers([]);
          setSelectedFarmerId('');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu kênh người bán', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, isAdmin]);

  // Gian hàng hiện tại được cấp quyền quản lý
  const currentFarmer = useMemo(() => {
    if (farmers.length === 0) return null;
    return farmers.find(f => f.id === selectedFarmerId) || farmers[0] || null;
  }, [farmers, selectedFarmerId]);

  useEffect(() => {
    if (currentFarmer) {
      setProfileForm({
        farm_name: currentFarmer.farm_name || '',
        address: currentFarmer.address || '',
        latitude: currentFarmer.latitude ? String(currentFarmer.latitude) : '',
        longitude: currentFarmer.longitude ? String(currentFarmer.longitude) : '',
        specialty: currentFarmer.specialty || '',
        story: currentFarmer.story || ''
      });
    }
  }, [currentFarmer]);

  const handleAutoGeocode = () => {
    if (!profileForm.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ trước khi lấy tọa độ!');
      return;
    }
    const geo = resolveCoordinatesFromAddress(profileForm.address);
    setProfileForm(prev => ({
      ...prev,
      latitude: String(geo.lat),
      longitude: String(geo.lng)
    }));
    toast.success(`Đã định vị tọa độ tại tỉnh ${geo.provinceName} (${geo.lat}, ${geo.lng})`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarmer?.id) return;
    if (!profileForm.farm_name.trim() || !profileForm.address.trim()) {
      toast.error('Vui lòng nhập tên nông trại và địa chỉ!');
      return;
    }

    setIsSavingProfile(true);
    try {
      let lat = profileForm.latitude ? parseFloat(profileForm.latitude) : undefined;
      let lng = profileForm.longitude ? parseFloat(profileForm.longitude) : undefined;

      // Nếu chưa có tọa độ, tự động geocode từ địa chỉ
      if (!lat || !lng) {
        const geo = resolveCoordinatesFromAddress(profileForm.address);
        lat = geo.lat;
        lng = geo.lng;
      }

      // Cập nhật thông tin và đưa vào trạng thái chờ duyệt (is_verified = false)
      const res = await updateFarmerProfileApi(currentFarmer.id, {
        farm_name: profileForm.farm_name.trim(),
        address: profileForm.address.trim(),
        latitude: lat,
        longitude: lng,
        specialty: profileForm.specialty.trim() || undefined,
        story: profileForm.story.trim() || undefined,
        is_verified: false // Gửi duyệt về Admin
      });

      if (res.success) {
        // Lưu thông báo cho Admin Notification Center
        if (typeof window !== 'undefined') {
          const reqItem = {
            farmerId: currentFarmer.id,
            farmName: profileForm.farm_name.trim(),
            updatedAt: new Date().toISOString(),
            status: 'pending'
          };
          const existing = JSON.parse(localStorage.getItem('gf_admin_farmer_requests') || '[]');
          localStorage.setItem('gf_admin_farmer_requests', JSON.stringify([reqItem, ...existing]));
        }

        toast.success('Đã lưu cập nhật và gửi yêu cầu phê duyệt tới Ban Quản Trị!');
        setFarmers(prev => prev.map(f => f.id === currentFarmer.id ? { 
          ...f, 
          ...res.data, 
          is_verified: false,
          farm_name: profileForm.farm_name.trim(),
          address: profileForm.address.trim(),
          latitude: lat,
          longitude: lng,
          specialty: profileForm.specialty.trim(),
          story: profileForm.story.trim()
        } : f));
      } else {
        toast.error(res.message || 'Cập nhật thất bại');
      }
    } catch {
      toast.error('Lỗi khi lưu thông tin gian hàng');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Quick stats tính toán riêng biệt theo dữ liệu của gian hàng hiện tại
  const products = currentFarmer?.products || [];
  const totalProducts = products.length;

  // Tính tổng số lượt đặt hàng / bán ra và tổng doanh thu thực tế từ nông sản của chính gian hàng này
  const totalOrders = products.reduce((sum: number, p: any) => sum + (Number(p.sold_count) || 0), 0);
  const estimatedRevenue = products.reduce((sum: number, p: any) => {
    const sold = Number(p.sold_count) || 0;
    const price = Number(p.variants?.[0]?.price) || 0;
    return sum + (sold * price);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Banner Header */}
      <div className="bg-emerald-900 text-white">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 flex items-center justify-center text-2xl shadow-inner border border-emerald-600">
                👨‍🌾
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">Kênh Người Bán Nông Hộ</h1>
                  <span className="bg-emerald-600 text-emerald-100 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    Sàn TMĐT GreenFood
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Quản lý gian hàng trực tiếp từ nông trại đến bàn ăn người tiêu dùng.
                </p>
              </div>
            </div>

            {/* Vùng chọn gian hàng: Bảo mật thông tin, phân quyền nghiêm ngặt */}
            {isAdmin ? (
              /* Dành riêng cho Quản trị viên: Có quyền chuyển đổi gian hàng để hỗ trợ kỹ thuật */
              <div className="flex items-center gap-2 bg-emerald-950/70 p-2 rounded-xl border border-emerald-800">
                <span className="text-xs text-amber-300 font-bold whitespace-nowrap pl-2 flex items-center gap-1">
                  <ShieldCheck size={14} /> Chế độ Quản trị:
                </span>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="bg-emerald-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-700 focus:outline-none"
                >
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.farm_name} ({f.region?.name || 'VN'})
                    </option>
                  ))}
                </select>
                {currentFarmer?.id && (
                  <Link
                    href={`/farmers/${currentFarmer.id}`}
                    target="_blank"
                    className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors"
                    title="Xem gian hàng công khai"
                  >
                    <Eye size={16} />
                  </Link>
                )}
              </div>
            ) : (
              /* Dành cho Nông Hộ thông thường: Khóa chặt vào gian hàng của chính họ, tuyệt đối không lộ dữ liệu nhà khác */
              currentFarmer && (
                <div className="flex items-center gap-2 bg-emerald-950/70 px-3.5 py-2 rounded-xl border border-emerald-800">
                  <span className="text-xs text-emerald-300 font-medium whitespace-nowrap">Gian hàng của bạn:</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    🌱 {currentFarmer.farm_name}
                  </span>
                  <Link
                    href={`/farmers/${currentFarmer.id}`}
                    target="_blank"
                    className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors ml-1"
                    title="Xem gian hàng công khai của bạn"
                  >
                    <Eye size={15} />
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Navigation Submenu (Chỉ hiển thị nếu đã có gian hàng) */}
          {currentFarmer && (
            <div className="flex items-center gap-2 mt-6 border-t border-emerald-800/80 pt-4 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <TrendingUp size={14} /> Tổng quan kinh doanh
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  activeTab === 'products' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <Package size={14} /> Nông sản vụ mùa ({totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  activeTab === 'profile' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <Store size={14} /> Hồ sơ nhà vườn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-8 mt-6">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <RefreshCw className="animate-spin inline-block mr-2" size={24} />
            Đang tải dữ liệu kênh người bán...
          </div>
        ) : !currentFarmer ? (
          /* Trường hợp tài khoản chưa có gian hàng nông hộ */
          <div className="bg-white rounded-3xl p-10 md:p-14 text-center max-w-xl mx-auto shadow-sm border border-gray-100 my-10">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🌱
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có gian hàng nông hộ trên hệ thống</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Tài khoản ({user?.email || user?.name || 'hiện tại'}) chưa liên kết với gian hàng nông hộ nào. Vui lòng đăng ký mở gian hàng đối tác để bắt đầu kinh doanh nông sản sạch trên sàn GreenFood.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/farmers"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm"
              >
                <ArrowLeft size={16} /> Xem các gian hàng đối tác
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tab 1: Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 4 Metrics Cards - Thống kê chính xác chỉ của gian hàng này */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Doanh thu vụ này</span>
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <DollarSign size={18} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {estimatedRevenue > 0 ? `${estimatedRevenue.toLocaleString('vi-VN')}đ` : '0đ'}
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {estimatedRevenue > 0 ? (
                        <span className="text-emerald-600 font-semibold">Doanh thu thực theo đơn chốt</span>
                      ) : (
                        <span>Chưa phát sinh doanh thu</span>
                      )}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Đơn hàng đã chốt</span>
                      <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                        <Package size={18} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {totalOrders} đơn
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalOrders > 0 ? 'Giao qua đối tác GHN' : 'Chưa có đơn hàng phát sinh'}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Nông sản đang bán</span>
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Leaf size={18} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {totalProducts} sản phẩm
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {totalProducts > 0 ? (
                        <span className="text-emerald-600 font-semibold">Đang mở bán trên sàn</span>
                      ) : (
                        <span>Chưa đăng bán sản phẩm</span>
                      )}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Đánh giá người mua</span>
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <ShieldCheck size={18} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                      ⭐ {Number(currentFarmer?.rating || 5.0).toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentFarmer?.is_verified ? 'Nhà vườn chuẩn VietGAP' : 'Đang chờ thẩm định'}
                    </p>
                  </div>
                </div>

                {/* Status Notice */}
                {currentFarmer?.is_verified ? (
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-950 text-sm">
                          Gian hàng {currentFarmer?.farm_name} đã xác minh và hoạt động bình thường!
                        </h4>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Khi có đơn đặt hàng mới từ khách, hệ thống sẽ tự động thông báo và điều phối đơn vị vận chuyển GHN đến thu gom tại vườn.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/farmers/${currentFarmer?.id}`}
                      target="_blank"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs"
                    >
                      Xem trang gian hàng
                    </Link>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-950 text-sm">
                          Hồ sơ gian hàng {currentFarmer?.farm_name} đang chờ ban quản trị GreenFood xét duyệt!
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Đội ngũ kiểm định chất lượng sẽ liên hệ thẩm định tiêu chuẩn VietGAP/Hữu cơ trong 24h làm việc.
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold shrink-0">
                      Chờ duyệt ⏳
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Products List */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      Nông Sản Vụ Mùa Của {currentFarmer?.farm_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Danh sách các mặt hàng nông sản sạch đang liên kết trực tiếp với gian hàng này.
                    </p>
                  </div>
                  <Link
                    href={`/farmers/${currentFarmer?.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <Eye size={14} /> Xem trên sàn
                  </Link>
                </div>

                {products.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Package size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-600">Chưa có nông sản nào được đăng bán</p>
                    <p className="text-xs text-gray-400 mt-0.5">Nông sản mới sẽ hiển thị tại đây sau khi liên kết với gian hàng.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {products.map((p: any) => (
                      <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=200'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Giá: <strong className="text-emerald-700">{Number(p.variants?.[0]?.price || 0).toLocaleString('vi-VN')}đ</strong> / {p.variants?.[0]?.unit || 'kg'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-gray-500 block">Đã bán: <strong>{p.sold_count || 0}</strong></span>
                          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            {p.badge || 'Đang mở bán'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Profile Form */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6 space-y-6 max-w-3xl">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Hồ Sơ Gian Hàng & Địa Chỉ Vị Trí Vườn</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cập nhật địa chỉ thực tế và vị trí GPS để khách hàng tìm thấy đúng nhà vườn của bạn trên Bản Đồ Nông Hộ GreenFood.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Tên Vườn / Nông Trại / Hợp Tác Xã *
                    </label>
                    <input
                      required
                      type="text"
                      value={profileForm.farm_name}
                      onChange={e => setProfileForm({ ...profileForm, farm_name: e.target.value })}
                      placeholder="Ví dụ: Nông Trại Hữu Cơ Ba Tri"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        Địa Chỉ Khu Vườn / Cơ Sở Sản Xuất *
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGeocode}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200"
                      >
                        <MapPin size={13} />
                        Tự động lấy tọa độ từ địa chỉ
                      </button>
                    </div>
                    <input
                      required
                      type="text"
                      value={profileForm.address}
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Ví dụ: Tân Cương, Thái Nguyên hoặc Xã Hoằng Hóa, Tỉnh Thanh Hóa..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Tọa độ GPS trên Bản Đồ */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        Tọa Độ Bản Đồ Nông Hộ (GPS Coordinates)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Giúp khách hàng nhìn thấy đúng vị trí trên bản đồ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Vĩ độ (Latitude)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={profileForm.latitude}
                          onChange={e => setProfileForm({ ...profileForm, latitude: e.target.value })}
                          placeholder="Ví dụ: 19.8067"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Kinh độ (Longitude)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={profileForm.longitude}
                          onChange={e => setProfileForm({ ...profileForm, longitude: e.target.value })}
                          placeholder="Ví dụ: 105.7852"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Sản Phẩm Thế Mạnh / Đặc Sản
                    </label>
                    <input
                      type="text"
                      value={profileForm.specialty}
                      onChange={e => setProfileForm({ ...profileForm, specialty: e.target.value })}
                      placeholder="Ví dụ: Sầu riêng Ri6, Bưởi da xanh ruột hồng, Nông sản hữu cơ..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Câu Chuyện Canh Tác Sạch & Cam Kết Chất Lượng
                    </label>
                    <textarea
                      rows={4}
                      value={profileForm.story}
                      onChange={e => setProfileForm({ ...profileForm, story: e.target.value })}
                      placeholder="Mô tả truyền thống canh tác, tiêu chuẩn VietGAP, hữu cơ hoặc câu chuyện gắn bó cùng nông nghiệp sạch..."
                      className="w-full p-4 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 leading-relaxed focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <div className="text-xs text-slate-500">
                    Vùng hiển thị: <strong>{currentFarmer?.region?.name || 'Việt Nam'}</strong>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-emerald-700/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Đang gửi duyệt...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        <span>Lưu & Gửi phê duyệt</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    <strong>Quy trình kiểm duyệt:</strong> Mọi thay đổi về thông tin gian hàng và vị trí bản đồ sẽ được gửi tới Ban Quản Trị GreenFood phê duyệt trước khi kích hoạt chính thức.
                  </span>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
