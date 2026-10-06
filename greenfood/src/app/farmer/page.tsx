"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tractor, Package, TrendingUp, DollarSign, Plus, Eye, 
  CheckCircle, AlertCircle, RefreshCw, Store, Settings, 
  MapPin, Phone, ShieldCheck, Leaf, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminFarmersApi } from '@/lib/api';

export default function FarmerPortalPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'profile'>('dashboard');

  // Load farmers to simulate vendor portal login / switch store
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAdminFarmersApi();
        if (Array.isArray(data) && data.length > 0) {
          setFarmers(data);
          setSelectedFarmerId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentFarmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];

  // Quick stats tính toán động chuẩn theo dữ liệu thực tế của từng nhà vườn
  const products = currentFarmer?.products || [];
  const totalProducts = products.length;

  // Tính tổng số lượt đặt hàng / bán ra và tổng doanh thu thực tế từ nông sản của nhà vườn
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

            {/* Select Farm for Demo / Multi-vendor testing */}
            <div className="flex items-center gap-2 bg-emerald-950/60 p-2 rounded-xl border border-emerald-800">
              <span className="text-xs text-emerald-300 font-medium whitespace-nowrap pl-2">Gian hàng:</span>
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
          </div>

          {/* Navigation Submenu */}
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
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-8 mt-6">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <RefreshCw className="animate-spin inline-block mr-2" size={24} />
            Đang tải dữ liệu kênh người bán...
          </div>
        ) : (
          <>
            {/* Tab 1: Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 4 Metrics Cards */}
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-colors shadow-2xs"
                    >
                      Xem gian hàng của tôi 🛒
                    </Link>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-950 text-sm">
                          Hồ sơ gian hàng {currentFarmer?.farm_name} đang chờ ban quản trị GreenFood xét duyệt!
                        </h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Đội ngũ kiểm định chất lượng sẽ liên hệ thẩm định tiêu chuẩn VietGAP/Hữu cơ trong 24h làm việc.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl">
                      Chờ duyệt ⏳
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Products Management */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Danh mục nông sản của nhà vườn</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Danh sách các mặt hàng nông sản đang niêm yết bán trực tiếp.</p>
                  </div>
                  <button
                    onClick={() => toast.success('Tính năng thêm nông sản đang mở cho quản trị viên')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus size={16} /> Đăng bán nông sản mới
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-100">
                        <th className="p-4 font-semibold">Tên Nông Sản</th>
                        <th className="p-4 font-semibold">Giá Bán</th>
                        <th className="p-4 font-semibold">Đã Bán</th>
                        <th className="p-4 font-semibold">Đánh Giá</th>
                        <th className="p-4 font-semibold">Trạng Thái</th>
                        <th className="p-4 font-semibold text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-gray-500">
                            Chưa có sản phẩm nào được đăng tải cho gian hàng này.
                          </td>
                        </tr>
                      ) : (
                        products.map((p: any) => {
                          const variant = p.variants?.[0] || {};
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.image_url || 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=200'}
                                    alt={p.name}
                                    className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                                  />
                                  <div>
                                    <div className="font-bold text-gray-900">{p.name}</div>
                                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                      {p.badge || 'Trái cây sạch'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-rose-600">
                                {Number(variant.price || 60000).toLocaleString('vi-VN')}đ / {variant.unit || 'kg'}
                              </td>
                              <td className="p-4 font-medium text-gray-700">
                                {Number(p.sold_count || 0)} lượt bán
                              </td>
                              <td className="p-4 text-amber-500 font-bold">
                                ⭐ {Number(p.rating || 5.0).toFixed(1)}
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                                  <CheckCircle size={12} /> Đang mở bán
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <Link
                                  href={`/product/${p.slug}`}
                                  target="_blank"
                                  className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs inline-flex items-center gap-1"
                                >
                                  <Eye size={14} /> Xem bài đăng
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Farm Profile */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-3xl mx-auto space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Thông tin nhà vườn & Cơ sở canh tác</h3>
                  <p className="text-xs text-gray-500">Thông tin này được hiển thị công khai trên sàn TMĐT GreenFood.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tên Nông Trại</label>
                    <input
                      type="text"
                      disabled
                      value={currentFarmer?.farm_name || ''}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Địa Chỉ Khu Vườn</label>
                    <input
                      type="text"
                      disabled
                      value={currentFarmer?.address || ''}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Câu Chuyện Canh Tác Sạch</label>
                    <textarea
                      rows={4}
                      disabled
                      value={currentFarmer?.story || 'Canh tác theo tiêu chuẩn hữu cơ tự nhiên, đảm bảo vệ sinh an toàn thực phẩm.'}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>
                    Để thay đổi thông tin giấy phép chứng nhận VietGAP hoặc đổi tài khoản ngân hàng nhận tiền quyết toán, vui lòng liên hệ Ban Quản Trị Sàn qua hotline <strong>1900 6868</strong>.
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
