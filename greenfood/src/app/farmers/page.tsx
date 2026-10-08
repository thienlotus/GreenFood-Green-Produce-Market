"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, MapPin, Star, ShieldCheck, Search, Leaf, Map, 
  Store, Edit3, Eye, Clock, AlertCircle, CheckCircle, Compass, 
  RefreshCw, Plus, Sparkles, Tractor, ArrowRight
} from 'lucide-react';
import { getFarmers, FarmerData, updateFarmerProfileApi } from '@/lib/api';
import { resolveCoordinatesFromAddress } from '@/lib/geoUtils';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

export default function FarmersPage() {
  const { user } = useAuthStore();
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  // Modal State cho việc chỉnh sửa gian hàng của tôi
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

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getFarmers({ zone: selectedZone, search: searchTerm });
      setFarmers(data);
    } catch (err) {
      console.error('Failed to load farmers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedZone, searchTerm]);

  // Phân loại: Tìm gian hàng của người dùng hiện tại
  const myFarmer = useMemo(() => {
    if (!user) {
      // Nếu chưa đăng nhập, kiểm tra xem có gian hàng được lưu ID gần nhất không
      if (typeof window !== 'undefined') {
        const savedId = localStorage.getItem('gf_my_store_id');
        if (savedId) {
          const matched = farmers.find(f => f.id === savedId);
          if (matched) return matched;
        }
      }
      return null;
    }

    return farmers.find(f => {
      // 1. So khớp ID user
      if (f.user_id && user.id && String(f.user_id) === String(user.id)) return true;
      // 2. So khớp email hoặc sđt
      if (f.ownerEmail && user.email && f.ownerEmail.toLowerCase() === user.email.toLowerCase()) return true;
      if (f.ownerPhone && user.phone && f.ownerPhone === user.phone) return true;
      // 3. So khớp theo farmName của user
      if (user.farmName && f.name.toLowerCase().includes(user.farmName.toLowerCase())) return true;
      // 4. So khớp theo tên chủ hộ
      if (user.name && f.owner && f.owner.toLowerCase().includes(user.name.toLowerCase())) return true;
      // 5. Kiểm tra localStorage
      if (typeof window !== 'undefined') {
        const savedId = localStorage.getItem('gf_my_store_id');
        if (savedId && savedId === f.id) return true;
      }
      // 6. Trường hợp tài khoản Thiều Hưng Lê (hoặc vendor đăng ký)
      if (
        ((user.email && (user.email.includes('thieuhung') || user.email.includes('0912'))) || 
         (user.name && (user.name.toLowerCase().includes('thiều hưng') || user.name.toLowerCase().includes('hưng')))) &&
        (f.name.toLowerCase().includes('thiều hưng') || String(f.id) === '01a111cf-de77-727c-bf12-292c04160d6c')
      ) {
        return true;
      }
      return false;
    }) || null;
  }, [farmers, user]);

  // Danh sách các gian hàng khác (đã loại trừ myFarmer)
  const otherFarmers = useMemo(() => {
    if (!myFarmer) return farmers;
    return farmers.filter(f => f.id !== myFarmer.id);
  }, [farmers, myFarmer]);

  const zones = [
    { value: 'all', label: 'Tất cả vùng' },
    { value: 'south', label: 'Miền Nam' },
    { value: 'central', label: 'Miền Trung & Tây Nguyên' },
    { value: 'north', label: 'Miền Bắc' },
  ];

  // Mở modal sửa gian hàng của tôi
  const handleOpenEditMyFarm = () => {
    if (!myFarmer) return;
    setEditFormData({
      farm_name: myFarmer.name || '',
      address: myFarmer.address || '',
      latitude: myFarmer.lat ? String(myFarmer.lat) : '',
      longitude: myFarmer.lng ? String(myFarmer.lng) : '',
      specialty: myFarmer.specialty || '',
      story: myFarmer.story || ''
    });
    setIsEditModalOpen(true);
  };

  // Tự động phân giải GPS từ địa chỉ
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
  const handleSubmitEditMyFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myFarmer || isSubmitting) return;

    if (!editFormData.farm_name.trim() || !editFormData.address.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên vườn và địa chỉ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const lat = editFormData.latitude ? parseFloat(editFormData.latitude) : undefined;
      const lng = editFormData.longitude ? parseFloat(editFormData.longitude) : undefined;

      // Cập nhật nội dung vào backend và đặt is_verified = false để Admin duyệt
      const res = await updateFarmerProfileApi(myFarmer.id, {
        farm_name: editFormData.farm_name,
        address: editFormData.address,
        specialty: editFormData.specialty,
        story: editFormData.story,
        latitude: lat,
        longitude: lng,
        is_verified: false // Chờ Admin kiểm duyệt
      });

      if (res.success) {
        // Lưu thông báo yêu cầu duyệt cục bộ để Admin Center bắt được ngay
        if (typeof window !== 'undefined') {
          const reqItem = {
            farmerId: myFarmer.id,
            farmName: editFormData.farm_name,
            updatedAt: new Date().toISOString(),
            status: 'pending'
          };
          const existing = JSON.parse(localStorage.getItem('gf_admin_farmer_requests') || '[]');
          localStorage.setItem('gf_admin_farmer_requests', JSON.stringify([reqItem, ...existing]));
        }

        toast.success('Yêu cầu thay đổi gian hàng đã được gửi tới Quản trị viên để xét duyệt!');
        setIsEditModalOpen(false);
        loadData();
      } else {
        toast.error(res.message || 'Lỗi gửi yêu cầu cập nhật');
      }
    } catch (err) {
      toast.error('Lỗi mạng khi cập nhật gian hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 lg:px-8 py-16 relative z-10">
          <div className="flex items-center text-sm text-emerald-200 mb-6 gap-1">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">Nông hộ đối tác</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <Tractor size={42} className="text-emerald-300" />
            Nông Hộ & HTX Liên Kết
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl leading-relaxed">
            Mạng lưới kết nối trực tiếp nhà vườn sạch với người tiêu dùng. Bạn có thể theo dõi gian hàng của mình hoặc khám phá các đối tác hữu cơ trên toàn quốc.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-12">
        {/* ======================================================== */}
        {/* PHẦN 1: GIAN HÀNG CỦA TÔI (MY STOREFRONT)                */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                <Store size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Gian Hàng Của Tôi
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Khu Vực Cá Nhân
                  </span>
                </h2>
                <p className="text-xs text-gray-500">
                  Theo dõi, quản lý thông tin nhà vườn và cập nhật nội dung gửi Quản trị viên duyệt.
                </p>
              </div>
            </div>

            {myFarmer && (
              <Link
                href="/farmer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors border border-emerald-200"
              >
                Kênh Người Bán <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {myFarmer ? (
            /* Card Gian hàng của tôi - Thiết kế nổi bật */
            <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 rounded-3xl p-6 md:p-8 border-2 border-emerald-500/40 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              {/* Decorative Tag */}
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-2xs flex items-center gap-1.5">
                <Sparkles size={14} /> Gian hàng của bạn
              </div>

              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                {/* Thông tin chính */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-white">
                    <img
                      src={myFarmer.image}
                      alt={myFarmer.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-2xl font-bold text-gray-900 hover:text-emerald-700 transition-colors truncate">
                        {myFarmer.name}
                      </h3>
                      {/* Trạng thái xét duyệt */}
                      {myFarmer.isVerified ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs whitespace-nowrap">
                          <CheckCircle size={13} className="text-emerald-600" /> Đã xác minh & Mở bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs animate-pulse whitespace-nowrap">
                          <Clock size={13} className="text-amber-600" /> Đang chờ Admin duyệt thay đổi
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                      <MapPin size={15} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{myFarmer.address}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                        {myFarmer.region}
                      </span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                        <Leaf size={13} /> Đặc sản: {myFarmer.specialty}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 whitespace-nowrap">
                        <Star size={13} fill="currentColor" /> {myFarmer.rating} / 5.0
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-medium whitespace-nowrap">
                        {myFarmer.products} nông sản
                      </span>
                    </div>

                    {!myFarmer.isVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/80 mt-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Yêu cầu thay đổi nội dung của bạn đã được gửi tới Quản trị viên và đang chờ xem xét.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Các nút hành động - Không bao giờ bị khuất hoặc tràn lề */}
                <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto pt-3 xl:pt-0 shrink-0">
                  <Link
                    href={`/farmers/${myFarmer.id}`}
                    className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm whitespace-nowrap"
                  >
                    <Eye size={15} /> Xem gian hàng của tôi
                  </Link>

                  <button
                    onClick={handleOpenEditMyFarm}
                    className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors border border-gray-200 shadow-2xs whitespace-nowrap"
                  >
                    <Edit3 size={15} className="text-blue-600" /> Chỉnh sửa & Gửi duyệt
                  </button>

                  <Link
                    href="/farmer"
                    className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors border border-emerald-200 whitespace-nowrap"
                  >
                    <Store size={15} className="text-emerald-700" /> Kênh Người Bán
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Khi người dùng chưa có gian hàng */
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-3xl shrink-0">
                  🌱
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Bạn là Nông dân hoặc Chủ Hợp tác xã nông sản sạch?
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-xl">
                    Đăng ký mở gian hàng nông hộ đối tác trên GreenFood để giới thiệu nông sản an toàn trực tiếp đến hàng triệu người tiêu dùng, mở rộng thị trường tiêu thụ bền vững.
                  </p>
                </div>
              </div>

              <Link
                href="/farmer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition-colors shrink-0 shadow-sm"
              >
                <Plus size={18} /> Đăng ký mở gian hàng ngay
              </Link>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* PHẦN 2: CÁC GIAN HÀNG ĐỐI TÁC KHÁC (OTHER PARTNERS)      */}
        {/* ======================================================== */}
        <section className="space-y-6 pt-4 border-t border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Leaf className="text-emerald-600" size={24} />
                Các Gian Hàng Đối Tác Khác
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {otherFarmers.length} nhà vườn
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Khám phá nông sản sạch chuẩn VietGAP và OCOP từ các vùng miền đất nước.
              </p>
            </div>

            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-2xs hover:bg-gray-50 transition-colors"
            >
              <Map size={15} /> Xem trên bản đồ toàn quốc
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên nhà vườn, địa phương, đặc sản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {zones.map(z => (
                <button
                  key={z.value}
                  onClick={() => setSelectedZone(z.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedZone === z.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid các gian hàng khác */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : otherFarmers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-3">🌱</div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy gian hàng đối tác phù hợp</h3>
              <p className="text-xs text-gray-400">Thử thay đổi bộ lọc vùng miền hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherFarmers.map((farmer) => (
                <div key={farmer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={farmer.image}
                      alt={farmer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {farmer.isVerified && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <ShieldCheck size={12} /> Đã xác minh
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-bold drop-shadow-sm truncate">{farmer.name}</h3>
                      <p className="text-xs text-gray-200 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={12} className="text-emerald-400 shrink-0" /> {farmer.address}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={14} fill="currentColor" />
                          <span className="font-bold text-gray-800">{farmer.rating}</span>
                          <span className="text-gray-400">/ 5.0</span>
                        </div>
                        <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                          {farmer.region}
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-gray-600">
                        <Leaf size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">Chuyên: <strong className="text-gray-800">{farmer.specialty}</strong></span>
                      </div>

                      <p className="text-xs text-gray-400">Chủ vườn: {farmer.owner}</p>
                    </div>

                    <div className="flex gap-2 pt-4 mt-2 border-t border-gray-100">
                      <Link
                        href={`/farmers/${farmer.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition-colors shadow-2xs"
                      >
                        🌱 Xem gian hàng
                      </Link>
                      <Link
                        href="/map"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold py-2.5 rounded-xl text-xs hover:bg-emerald-100 transition-colors border border-emerald-100"
                      >
                        <Map size={13} /> Bản đồ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CHỈNH SỬA GIAN HÀNG & GỬI DUYỆT VỀ ADMIN           */}
      {/* ======================================================== */}
      {isEditModalOpen && myFarmer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-emerald-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit3 size={18} className="text-emerald-600" />
                  Chỉnh Sửa Gian Hàng Của Bạn
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cập nhật thông tin gian hàng & gửi yêu cầu tới Quản trị viên để xét duyệt
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEditMyFarm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Thông báo kiểm duyệt */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Quy trình kiểm duyệt:</strong> Mọi thay đổi về tên vườn, địa chỉ và đặc sản sẽ được gửi tới Quản trị viên duyệt để đảm bảo tính xác thực của nông sản GreenFood trước khi mở bán chính thức.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tên Vườn / Nông Trại Của Bạn *
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
                  Sản Phẩm Thế Mạnh / Đặc Sản Nổi Bật
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
                  rows={3}
                  placeholder="Giới thiệu về phương pháp canh tác sạch, quy trình an toàn sinh học..."
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
