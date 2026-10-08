"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Trash2, Tractor, Plus, CheckCircle, XCircle, 
  Store, MapPin, Phone, Mail, RefreshCw, AlertCircle, ShieldCheck, Edit, Compass,
  Bell, Filter, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getAdminFarmersApi, 
  updateFarmerStatusApi, 
  deleteFarmerApi, 
  registerFarmerApi,
  updateFarmerProfileApi
} from '@/lib/api';
import { resolveCoordinatesFromAddress } from '@/lib/geoUtils';

interface AdminFarmerItem {
  id: string;
  farm_name: string;
  story?: string;
  address: string;
  specialty?: string;
  latitude?: number | string;
  longitude?: number | string;
  rating?: number;
  is_verified: boolean;
  user?: {
    id: string;
    name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
  };
  region?: {
    id: string | number;
    name: string;
    zone?: string;
  };
  products?: any[];
}

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<AdminFarmerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  
  // Modal State - Add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    specialty: 'Rau củ hữu cơ, trái cây chuẩn VietGAP',
    scale: '1 - 3 hecta',
    note: ''
  });

  // Modal State - Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<AdminFarmerItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    farm_name: '',
    address: '',
    specialty: '',
    story: '',
    latitude: '',
    longitude: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAdminFarmersApi();
      setFarmers(Array.isArray(data) ? (data as unknown as AdminFarmerItem[]) : []);
    } catch (error) {
      console.error('Failed to load farmers', error);
      toast.error('Không thể tải danh sách nông hộ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = farmers.length;
    const verified = farmers.filter(f => f.is_verified).length;
    const pending = total - verified;
    const totalProducts = farmers.reduce((sum, f) => sum + (f.products?.length || 0), 0);
    return { total, verified, pending, totalProducts };
  }, [farmers]);

  // Filtered List
  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const matchSearch = 
        f.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.user?.name || f.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.user?.phone || '').includes(searchTerm);
      
      if (filterStatus === 'verified') return matchSearch && f.is_verified;
      if (filterStatus === 'pending') return matchSearch && !f.is_verified;
      return matchSearch;
    });
  }, [farmers, searchTerm, filterStatus]);

  // Actions
  const handleToggleStatus = async (farmer: AdminFarmerItem) => {
    const nextStatus = !farmer.is_verified;
    const actionLabel = nextStatus ? 'Phê duyệt & kích hoạt' : 'Hủy kích hoạt';
    
    if (!confirm(`Bạn có chắc muốn ${actionLabel} cho nông hộ "${farmer.farm_name}"?`)) {
      return;
    }

    try {
      const res = await updateFarmerStatusApi(farmer.id, nextStatus);
      if (res.success) {
        toast.success(nextStatus ? 'Đã phê duyệt nông hộ!' : 'Đã tạm dừng nông hộ!');
        setFarmers(prev => prev.map(f => f.id === farmer.id ? { ...f, is_verified: nextStatus } : f));
      } else {
        toast.error(res.message || 'Thao tác thất bại');
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (farmer: AdminFarmerItem) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa nông hộ "${farmer.farm_name}"? Toàn bộ nông sản liên kết sẽ bị ảnh hưởng!`)) {
      return;
    }

    try {
      const res = await deleteFarmerApi(farmer.id);
      if (res.success) {
        toast.success(`Đã xóa nông hộ ${farmer.farm_name}`);
        setFarmers(prev => prev.filter(f => f.id !== farmer.id));
      } else {
        toast.error(res.message || 'Lỗi khi xóa nông hộ');
      }
    } catch (err) {
      toast.error('Không thể xóa nông hộ');
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      farm_name: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      specialty: 'Rau củ hữu cơ, trái cây chuẩn VietGAP',
      scale: '1 - 3 hecta',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.farm_name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('Vui lòng nhập đầy đủ Tên vườn, SĐT và Địa chỉ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerFarmerApi(formData);
      if (res.success) {
        toast.success('Đã thêm nông hộ đối tác mới thành công!');
        setIsModalOpen(false);
        loadData();
      } else {
        toast.error(res.message || 'Không thể tạo nông hộ');
      }
    } catch (error) {
      toast.error('Lỗi máy chủ khi tạo nông hộ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (farmer: AdminFarmerItem) => {
    setEditingFarmer(farmer);
    setEditFormData({
      farm_name: farmer.farm_name || '',
      address: farmer.address || '',
      specialty: farmer.specialty || '',
      story: farmer.story || '',
      latitude: farmer.latitude ? String(farmer.latitude) : '',
      longitude: farmer.longitude ? String(farmer.longitude) : ''
    });
    setIsEditModalOpen(true);
  };

  const handleAutoGeocodeInEdit = () => {
    if (!editFormData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ trước');
      return;
    }
    const geo = resolveCoordinatesFromAddress(editFormData.address);
    setEditFormData(prev => ({
      ...prev,
      latitude: String(geo.lat),
      longitude: String(geo.lng)
    }));
    toast.success(`Đã nhận diện tọa độ: ${geo.provinceName} (${geo.lat}, ${geo.lng})`);
  };

  const handleSubmitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer || isEditSubmitting) return;

    if (!editFormData.farm_name.trim() || !editFormData.address.trim()) {
      toast.error('Vui lòng nhập tên vườn và địa chỉ!');
      return;
    }

    setIsEditSubmitting(true);
    try {
      const lat = editFormData.latitude ? parseFloat(editFormData.latitude) : undefined;
      const lng = editFormData.longitude ? parseFloat(editFormData.longitude) : undefined;

      const res = await updateFarmerProfileApi(editingFarmer.id, {
        farm_name: editFormData.farm_name,
        address: editFormData.address,
        specialty: editFormData.specialty,
        story: editFormData.story,
        latitude: lat,
        longitude: lng
      });

      if (res.success) {
        toast.success('Đã cập nhật thông tin gian hàng nông hộ thành công!');
        setIsEditModalOpen(false);
        loadData();
      } else {
        toast.error(res.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi cập nhật nông hộ');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tractor className="text-emerald-600" size={28} />
            Quản lý Nông Hộ & HTX Đối Tác
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mô hình Sàn TMĐT đa nhà vườn: Quản lý hồ sơ đối tác, phê duyệt gian hàng và nông sản liên kết.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 text-gray-600 hover:text-emerald-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Thêm nông hộ mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            🌱
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tổng đối tác</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-xl">
            <ShieldCheck size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Đã xác minh (Hoạt động)</p>
            <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            <AlertCircle size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Chờ phê duyệt</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xl">
            🛒
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tổng nông sản trên sàn</p>
            <p className="text-2xl font-bold text-sky-600">{stats.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Real-time Notification Banner for Pending Approvals */}
      {stats.pending > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300/80 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-amber-200/60 animate-bounce">
              <Bell size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-amber-950 text-sm md:text-base flex items-center gap-1.5">
                  Thông báo: Đang có {stats.pending} hồ sơ Nông hộ gửi yêu cầu chờ duyệt!
                </h3>
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                  Cần xử lý
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1">
                Các nông hộ ({farmers.filter(f => !f.is_verified).map(f => f.farm_name).slice(0, 3).join(', ')}{stats.pending > 3 ? '...' : ''}) vừa nộp hồ sơ đối tác hoặc cập nhật thông tin vị trí GPS/chứng nhận VietGAP cần được kiểm định.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-amber-700 text-white ring-2 ring-amber-400'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <Filter size={14} />
              <span>{filterStatus === 'pending' ? 'Đang lọc xem hồ sơ chờ duyệt' : `Xem ${stats.pending} hồ sơ chờ duyệt`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên vườn, chủ hộ, SĐT, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'verified' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Đã duyệt ({stats.verified})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'pending' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Chờ duyệt ({stats.pending})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Tên Nông Trại / HTX</th>
                <th className="p-4 font-semibold">Chủ Hộ & Liên Hệ</th>
                <th className="p-4 font-semibold">Khu Vực & Địa Chỉ</th>
                <th className="p-4 font-semibold">Nông Sản</th>
                <th className="p-4 font-semibold">Trạng Thái</th>
                <th className="p-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin inline-block mr-2" size={20} />
                    Đang tải danh sách nông hộ từ máy chủ...
                  </td>
                </tr>
              ) : filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">🚜</div>
                    <p className="font-medium text-gray-700">Không tìm thấy đối tác nào</p>
                    <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới đối tác.</p>
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Tên & Đặc sản */}
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                          🌱
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 hover:text-emerald-600 transition-colors">
                            {farmer.farm_name}
                          </div>
                          <p className="text-xs text-emerald-700 font-medium mt-0.5">
                            {farmer.specialty || 'Nông sản sạch'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Chủ hộ & SĐT */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-800">
                          {farmer.user?.full_name || farmer.user?.name || 'Chủ vườn'}
                        </div>
                        {farmer.user?.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone size={12} className="text-gray-400" />
                            {farmer.user.phone}
                          </div>
                        )}
                        {farmer.user?.email && (
                          <div className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[160px]">
                            <Mail size={12} className="text-gray-400 shrink-0" />
                            {farmer.user.email}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Địa chỉ */}
                    <td className="p-4 max-w-xs">
                      <div className="flex items-start gap-1.5 text-xs text-gray-600">
                        <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{farmer.address}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {farmer.region && (
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {farmer.region.name}
                          </span>
                        )}
                        {farmer.latitude && farmer.longitude && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono border border-emerald-100">
                            GPS: {Number(farmer.latitude).toFixed(3)}, {Number(farmer.longitude).toFixed(3)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sản phẩm */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <span>{farmer.products?.length || 0}</span>
                        <span className="text-xs font-normal text-gray-500">mặt hàng</span>
                      </div>
                    </td>

                    {/* Trạng thái duyệt */}
                    <td className="p-4">
                      {farmer.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle size={13} /> Đã phê duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <AlertCircle size={13} /> Chờ duyệt
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Xem gian hàng */}
                        <Link
                          href={`/farmers/${farmer.id}`}
                          target="_blank"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                          title="Xem gian hàng nông hộ ngoài web"
                        >
                          <Store size={16} />
                        </Link>

                        {/* Sửa gian hàng */}
                        <button
                          onClick={() => handleOpenEditModal(farmer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg transition-colors"
                          title="Chỉnh sửa thông tin & tọa độ nông hộ"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Toggle Duyệt */}
                        <button
                          onClick={() => handleToggleStatus(farmer)}
                          className={`p-2 rounded-lg transition-colors border ${
                            farmer.is_verified
                              ? 'text-amber-600 hover:bg-amber-50 border-amber-200'
                              : 'text-green-600 hover:bg-green-50 border-green-200'
                          }`}
                          title={farmer.is_verified ? 'Tạm dừng hiển thị gian hàng' : 'Phê duyệt gian hàng nông hộ'}
                        >
                          {farmer.is_verified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>

                        {/* Xóa */}
                        <button
                          onClick={() => handleDelete(farmer)}
                          className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors"
                          title="Xóa đối tác"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Đăng ký Nông Hộ Đối Tác Mới</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tạo gian hàng và cấp tài khoản người bán cho nông dân</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tên Vườn / Nông Trại / Hợp Tác Xã *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ví dụ: Nông Trại Hữu Cơ Ba Tri"
                  value={formData.farm_name}
                  onChange={e => setFormData({ ...formData, farm_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Họ & Tên Chủ Hộ *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số Điện Thoại (Tài khoản) *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Liên Hệ
                </label>
                <input
                  type="email"
                  placeholder="nongtrai@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Địa Chỉ Khu Vườn / Cơ Sở Sản Xuất *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ấp Tân Lợi, Xã Tân Thới, Huyện Phong Điền, Cần Thơ"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Sản Phẩm Thế Mạnh
                  </label>
                  <input
                    type="text"
                    placeholder="Rau củ quả, chè búp..."
                    value={formData.specialty}
                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Quy Mô Canh Tác
                  </label>
                  <input
                    type="text"
                    placeholder="2 hecta, 5 nhà màng..."
                    value={formData.scale}
                    onChange={e => setFormData({ ...formData, scale: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Đang xử lý...
                    </>
                  ) : (
                    'Tạo đối tác nông hộ'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Farmer Modal */}
      {isEditModalOpen && editingFarmer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 bg-emerald-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit size={18} className="text-emerald-600" />
                  Chỉnh Sửa Gian Hàng Nông Hộ
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cập nhật tên vườn, địa chỉ thực tế và vị trí bản đồ GPS cho &ldquo;{editingFarmer.farm_name}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEditForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tên Vườn / Nông Trại / HTX *
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
                    onClick={handleAutoGeocodeInEdit}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200/60"
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
                <p className="text-[11px] text-gray-400 mt-1">
                  Nhập rõ Tỉnh / Thành phố để hệ thống ghim chính xác vị trí trên bản đồ toàn quốc.
                </p>
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
                  Sản Phẩm Nổi Bật / Đặc Sản
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nem chua Thanh Hóa, Cam bù Hương Sơn..."
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
                  placeholder="Giới thiệu về quy trình sản xuất sạch, chuẩn hữu cơ VietGAP..."
                  value={editFormData.story}
                  onChange={e => setEditFormData({ ...editFormData, story: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isEditSubmitting}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                >
                  {isEditSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu cập nhật gian hàng'
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
