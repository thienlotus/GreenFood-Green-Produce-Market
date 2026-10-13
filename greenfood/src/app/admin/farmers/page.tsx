"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Trash2, Tractor, Plus, CheckCircle, XCircle, 
  Store, MapPin, Phone, Mail, RefreshCw, AlertCircle, ShieldCheck, Edit, Compass,
  Bell, Filter, Sparkles, Eye, ExternalLink, Award, FileText, Check, Copy,
  Calendar, Building2, Layers, CheckSquare
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
  created_at?: string;
  updated_at?: string;
  ghn_shop_id?: number | string;
  ghn_province_id?: number | string;
  ghn_district_id?: number | string;
  ghn_ward_code?: string;
  ghn_address?: string;
  registration_details?: {
    certifications?: string[];
    cert_code?: string;
    tax_id?: string;
    farm_area?: string;
    farming_method?: string;
    experience_years?: string;
    scale?: string;
    note?: string;
    clean_story?: string;
  };
  user?: {
    id: string;
    name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  region?: {
    id: string | number;
    name: string;
    zone?: string;
  };
  products?: any[];
}

function parseFarmerRegistration(farmer: AdminFarmerItem) {
  if (farmer.registration_details && Object.keys(farmer.registration_details).length > 0) {
    return {
      certifications: Array.isArray(farmer.registration_details.certifications) ? farmer.registration_details.certifications : [],
      cert_code: farmer.registration_details.cert_code || '',
      tax_id: farmer.registration_details.tax_id || '',
      farm_area: farmer.registration_details.farm_area || '',
      farming_method: farmer.registration_details.farming_method || '',
      experience_years: farmer.registration_details.experience_years || '',
      scale: farmer.registration_details.scale || '',
      note: farmer.registration_details.note || '',
      clean_story: farmer.registration_details.clean_story || '',
    };
  }

  const story = farmer.story || '';
  const result = {
    certifications: [] as string[],
    cert_code: '',
    tax_id: '',
    farm_area: '',
    farming_method: '',
    experience_years: '',
    scale: '',
    note: '',
    clean_story: '',
  };

  if (!story) return result;

  const lines = story.split('\n');
  const remaining: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^Chứng nhận chất lượng:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Chứng nhận chất lượng:\s*(.+)$/i);
      if (match) {
        result.certifications = match[1].split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (/^Mã số chứng nhận\/Cơ quan cấp:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Mã số chứng nhận\/Cơ quan cấp:\s*(.+)$/i);
      if (match) result.cert_code = match[1].trim();
    } else if (/^Mã số thuế\/CCCD đại diện:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Mã số thuế\/CCCD đại diện:\s*(.+)$/i);
      if (match) result.tax_id = match[1].trim();
    } else if (/^Diện tích canh tác:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Diện tích canh tác:\s*(.+)$/i);
      if (match) result.farm_area = match[1].trim();
    } else if (/^Phương thức canh tác:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Phương thức canh tác:\s*(.+)$/i);
      if (match) result.farming_method = match[1].trim();
    } else if (/^Kinh nghiệm canh tác:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Kinh nghiệm canh tác:\s*(.+)$/i);
      if (match) result.experience_years = match[1].trim();
    } else if (/^Quy mô sản lượng:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Quy mô sản lượng:\s*(.+)$/i);
      if (match) result.scale = match[1].trim();
    } else if (/^Ghi chú:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Ghi chú:\s*(.+)$/i);
      if (match) result.note = match[1].trim();
    } else {
      remaining.push(trimmed);
    }
  }

  result.clean_story = remaining.join('\n');
  return result;
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
    note: '',
    tax_id: '',
    certifications: ['VietGAP'],
    cert_code: '',
    farm_area: '',
    farming_method: 'Hữu cơ tự nhiên & Sinh thái',
    experience_years: ''
  });

  // Modal State - Detail Inspection
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailFarmer, setSelectedDetailFarmer] = useState<AdminFarmerItem | null>(null);

  // Modal State - Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<AdminFarmerItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    farm_name: '',
    owner_name: '',
    phone: '',
    email: '',
    tax_id: '',
    address: '',
    specialty: '',
    story: '',
    latitude: '',
    longitude: '',
    certifications: [] as string[],
    cert_code: '',
    farm_area: '',
    farming_method: '',
    experience_years: '',
    scale: '',
    note: '',
    clean_story: '',
    ghn_shop_id: ''
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
        if (selectedDetailFarmer && selectedDetailFarmer.id === farmer.id) {
          setSelectedDetailFarmer(prev => prev ? { ...prev, is_verified: nextStatus } : null);
        }
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
        if (selectedDetailFarmer?.id === farmer.id) {
          setIsDetailModalOpen(false);
        }
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
      note: '',
      tax_id: '',
      certifications: ['VietGAP'],
      cert_code: '',
      farm_area: '2 Hecta',
      farming_method: 'Hữu cơ tự nhiên & Sinh thái',
      experience_years: '5 năm'
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
      const res = await registerFarmerApi({
        farm_name: formData.farm_name.trim(),
        name: formData.name.trim() || formData.farm_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        location: formData.address.trim(),
        specialty: formData.specialty.trim(),
        scale: formData.scale.trim(),
        tax_id: formData.tax_id.trim() || undefined,
        certifications: formData.certifications,
        cert_code: formData.cert_code.trim() || undefined,
        farm_area: formData.farm_area.trim() || undefined,
        farming_method: formData.farming_method,
        experience_years: formData.experience_years.trim() || undefined,
        note: formData.note.trim() || undefined
      });

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

  // Mở modal Chi tiết hồ sơ đầy đủ
  const handleOpenDetailModal = (farmer: AdminFarmerItem) => {
    setSelectedDetailFarmer(farmer);
    setIsDetailModalOpen(true);
  };

  // Mở modal Chỉnh sửa với toàn bộ trường tách biệt
  const handleOpenEditModal = (farmer: AdminFarmerItem) => {
    const details = parseFarmerRegistration(farmer);
    setEditingFarmer(farmer);
    setEditFormData({
      farm_name: farmer.farm_name || '',
      owner_name: farmer.user?.full_name || farmer.user?.name || '',
      phone: farmer.user?.phone || '',
      email: farmer.user?.email || '',
      tax_id: details.tax_id || '',
      address: farmer.address || '',
      specialty: farmer.specialty || '',
      story: farmer.story || '',
      latitude: farmer.latitude ? String(farmer.latitude) : '',
      longitude: farmer.longitude ? String(farmer.longitude) : '',
      certifications: details.certifications || [],
      cert_code: details.cert_code || '',
      farm_area: details.farm_area || '',
      farming_method: details.farming_method || '',
      experience_years: details.experience_years || '',
      scale: details.scale || '',
      note: details.note || '',
      clean_story: details.clean_story || '',
      ghn_shop_id: farmer.ghn_shop_id ? String(farmer.ghn_shop_id) : ''
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

  const toggleCertInEdit = (cert: string) => {
    setEditFormData(prev => {
      const exists = prev.certifications.includes(cert);
      return {
        ...prev,
        certifications: exists 
          ? prev.certifications.filter(c => c !== cert) 
          : [...prev.certifications, cert]
      };
    });
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
      const ghnShopId = editFormData.ghn_shop_id ? parseInt(editFormData.ghn_shop_id) : undefined;

      const payload = {
        farm_name: editFormData.farm_name.trim(),
        address: editFormData.address.trim(),
        specialty: editFormData.specialty.trim(),
        latitude: lat,
        longitude: lng,
        ghn_shop_id: ghnShopId,
        owner_name: editFormData.owner_name.trim() || undefined,
        phone: editFormData.phone.trim() || undefined,
        email: editFormData.email.trim() || undefined,
        tax_id: editFormData.tax_id.trim() || undefined,
        certifications: editFormData.certifications,
        cert_code: editFormData.cert_code.trim() || undefined,
        farm_area: editFormData.farm_area.trim() || undefined,
        farming_method: editFormData.farming_method.trim() || undefined,
        experience_years: editFormData.experience_years.trim() || undefined,
        scale: editFormData.scale.trim() || undefined,
        note: editFormData.note.trim() || undefined,
        clean_story: editFormData.clean_story.trim() || undefined,
      };

      const res = await updateFarmerProfileApi(editingFarmer.id, payload);

      if (res.success) {
        toast.success('Đã cập nhật toàn bộ hồ sơ gian hàng nông hộ thành công!');
        setIsEditModalOpen(false);
        loadData();
      } else {
        toast.error(res.message || 'Lỗi khi cập nhật gian hàng');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ khi lưu hồ sơ');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const STANDARD_CERTS = ['VietGAP', 'GlobalGAP', 'OCOP', 'Hữu Cơ (Organic)', 'ISO 22000'];

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <Tractor className="text-emerald-600" size={28} />
              Quản lý Nông hộ & Vườn trồng
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Mô hình Sàn TMĐT đa nhà vườn liên kết vùng miền, quản lý hồ sơ kiểm định chất lượng và kho vận GHN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 text-gray-600 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors border border-gray-200"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Thêm nông hộ mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            🌱
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng đối tác</p>
            <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đã phê duyệt</p>
            <p className="text-2xl font-extrabold text-green-600">{stats.verified}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chờ xét duyệt</p>
            <p className="text-2xl font-extrabold text-amber-600">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl">
            🛒
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng nông sản trên sàn</p>
            <p className="text-2xl font-extrabold text-teal-700">{stats.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Alert banner if there are pending verifications */}
      {stats.pending > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-amber-950 text-sm">
                  Có {stats.pending} hồ sơ nông hộ đang chờ Quản trị viên thẩm định & phê duyệt
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
                filteredFarmers.map((farmer) => {
                  const details = parseFarmerRegistration(farmer);
                  return (
                    <tr key={farmer.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Tên & Đặc sản */}
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleOpenDetailModal(farmer)}
                            className="w-10 h-10 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 font-bold transition-transform hover:scale-105 cursor-pointer"
                            title="Xem chi tiết hồ sơ nông hộ"
                          >
                            🌱
                          </button>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenDetailModal(farmer)}
                                className="font-bold text-gray-900 hover:text-emerald-600 transition-colors text-left cursor-pointer"
                                title="Xem chi tiết phiếu đăng ký nông hộ"
                              >
                                {farmer.farm_name}
                              </button>
                              <Link
                                href={`/farmers/${farmer.id}/?store=${farmer.id}`}
                                target="_blank"
                                className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded hover:bg-emerald-50 transition-colors inline-flex items-center"
                                title="Mở trực tiếp gian hàng ngoài website"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            </div>

                            <p className="text-xs text-emerald-700 font-medium mt-0.5">
                              {farmer.specialty || 'Nông sản sạch'}
                            </p>

                            {/* Badges chứng nhận thu gọn */}
                            {details.certifications.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {details.certifications.map((c, i) => (
                                  <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded border border-emerald-200/60">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Chủ hộ & SĐT */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-800 flex items-center gap-1.5">
                            <span>{farmer.user?.full_name || farmer.user?.name || 'Chủ vườn'}</span>
                          </div>
                          {farmer.user?.phone && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone size={12} className="text-gray-400" />
                              <span className="font-mono">{farmer.user.phone}</span>
                            </div>
                          )}
                          {farmer.user?.email && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[160px]">
                              <Mail size={12} className="text-gray-400 shrink-0" />
                              <span>{farmer.user.email}</span>
                            </div>
                          )}
                          {details.tax_id && (
                            <div className="text-[11px] text-slate-500 font-mono">
                              MST/CCCD: {details.tax_id}
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Xem Chi Tiết Toàn Bộ Phiếu Thông Tin */}
                          <button
                            onClick={() => handleOpenDetailModal(farmer)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100 bg-white"
                            title="Xem chi tiết toàn bộ hồ sơ năng lực & pháp lý nông hộ"
                          >
                            <Eye size={16} />
                          </button>

                          {/* 2. Xem Gian Hàng Nông Hộ Ngoài Web (Mở trực tiếp) */}
                          <Link
                            href={`/farmers/${farmer.id}/?store=${farmer.id}`}
                            target="_blank"
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100 bg-white"
                            title="Mở trực tiếp gian hàng nông hộ ngoài website"
                          >
                            <Store size={16} />
                          </Link>

                          {/* 3. Sửa gian hàng */}
                          <button
                            onClick={() => handleOpenEditModal(farmer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg transition-colors bg-white"
                            title="Chỉnh sửa đầy đủ thông tin & tọa độ nông hộ"
                          >
                            <Edit size={16} />
                          </button>

                          {/* 4. Toggle Duyệt */}
                          <button
                            onClick={() => handleToggleStatus(farmer)}
                            className={`p-2 rounded-lg transition-colors border ${
                              farmer.is_verified
                                ? 'text-amber-600 hover:bg-amber-50 border-amber-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200 bg-emerald-50/50'
                            }`}
                            title={farmer.is_verified ? 'Tạm ngưng gian hàng' : 'Phê duyệt kích hoạt gian hàng'}
                          >
                            {farmer.is_verified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>

                          {/* 5. Xóa */}
                          <button
                            onClick={() => handleDelete(farmer)}
                            className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors bg-white"
                            title="Xóa đối tác nông hộ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: XEM CHI TIẾT TOÀN BỘ HỒ SƠ ĐĂNG KÝ ĐỐI TÁC NÔNG HỘ */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isDetailModalOpen && selectedDetailFarmer && (() => {
        const farmer = selectedDetailFarmer;
        const details = parseFarmerRegistration(farmer);
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto backdrop-blur-xs">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto border border-gray-100">
              {/* Modal Top Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                    🌱
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {farmer.farm_name}
                      </h2>
                      {farmer.is_verified ? (
                        <span className="bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-400">
                          <CheckCircle size={13} /> Đã phê duyệt
                        </span>
                      ) : (
                        <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                          <AlertCircle size={13} /> Hồ sơ chờ duyệt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-100/90 mt-1 flex items-center gap-2">
                      <span>Mã đối tác: <strong className="font-mono text-white">{farmer.id.substring(0, 13)}...</strong></span>
                      {farmer.created_at && (
                        <span>• Ngày nộp: {new Date(farmer.created_at).toLocaleDateString('vi-VN')}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Nút Xem Gian Hàng Ngoài Web Trực Tiếp */}
                  <Link
                    href={`/farmers/${farmer.id}/?store=${farmer.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"
                  >
                    <Store size={15} className="text-emerald-600" />
                    <span>Xem Gian Hàng Ngoài Web</span>
                    <ExternalLink size={13} />
                  </Link>

                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenEditModal(farmer);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors border border-white/20"
                  >
                    <Edit size={14} />
                    <span>Chỉnh sửa</span>
                  </button>

                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body Container */}
              <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 bg-slate-50/50">
                {/* 1. THÔNG TIN CHỦ HỘ & PHÁP LÝ */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 text-emerald-800">
                    <Building2 size={16} />
                    1. Thông tin Chủ Hộ & Pháp Lý Đại Diện
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-xs text-gray-400 font-medium block">Họ & Tên Chủ Hộ / Đại diện</span>
                      <strong className="text-gray-900 text-base mt-0.5 block">
                        {farmer.user?.full_name || farmer.user?.name || 'Chưa cập nhật'}
                      </strong>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1 font-semibold">
                        Vai trò: {farmer.user?.role || 'VENDOR'}
                      </span>
                    </div>

                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-xs text-gray-400 font-medium block">Số Điện Thoại Liên Hệ</span>
                      <div className="flex items-center justify-between mt-1">
                        <strong className="text-gray-900 font-mono text-base">
                          {farmer.user?.phone || 'Chưa có SĐT'}
                        </strong>
                        {farmer.user?.phone && (
                          <button
                            onClick={() => copyToClipboard(farmer.user?.phone || '', 'SĐT')}
                            className="p-1 text-gray-400 hover:text-emerald-600 rounded"
                            title="Sao chép SĐT"
                          >
                            {copiedField === 'SĐT' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">Dùng đăng nhập & nhận đơn</span>
                    </div>

                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-xs text-gray-400 font-medium block">Mã Số Thuế / CCCD Đại Diện</span>
                      <div className="flex items-center justify-between mt-1">
                        <strong className="text-gray-900 font-mono text-base">
                          {details.tax_id || 'Chưa nộp MST/CCCD'}
                        </strong>
                        {details.tax_id && (
                          <button
                            onClick={() => copyToClipboard(details.tax_id, 'MST/CCCD')}
                            className="p-1 text-gray-400 hover:text-emerald-600 rounded"
                            title="Sao chép MST/CCCD"
                          >
                            {copiedField === 'MST/CCCD' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">Hồ sơ pháp lý hợp tác</span>
                    </div>

                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 md:col-span-2">
                      <span className="text-xs text-gray-400 font-medium block">Email Giao Dịch & Thông Báo</span>
                      <div className="flex items-center justify-between mt-1">
                        <strong className="text-gray-900 font-mono text-sm">
                          {farmer.user?.email || 'Chưa cung cấp email'}
                        </strong>
                        {farmer.user?.email && (
                          <button
                            onClick={() => copyToClipboard(farmer.user?.email || '', 'Email')}
                            className="p-1 text-gray-400 hover:text-emerald-600 rounded"
                            title="Sao chép Email"
                          >
                            {copiedField === 'Email' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-xs text-gray-400 font-medium block">Thời Điểm Gia Nhập Sàn</span>
                      <strong className="text-gray-800 text-sm mt-1 block">
                        {farmer.created_at ? new Date(farmer.created_at).toLocaleString('vi-VN') : 'Mặc định'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. TIÊU CHUẨN CHẤT LƯỢNG & NĂNG LỰC CANH TÁC */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 text-emerald-800">
                    <Award size={16} />
                    2. Tiêu Chuẩn Nông Nghiệp & Năng Lực Sản Xuất
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100/80">
                      <span className="text-xs text-emerald-800 font-semibold block">Diện Tích Đất Canh Tác</span>
                      <p className="text-lg font-black text-emerald-900 mt-1">
                        {details.farm_area || 'Chưa rõ'}
                      </p>
                    </div>

                    <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100/80">
                      <span className="text-xs text-blue-800 font-semibold block">Phương Thức Canh Tác</span>
                      <p className="text-sm font-bold text-blue-900 mt-1">
                        {details.farming_method || 'Truyền thống / Hữu cơ'}
                      </p>
                    </div>

                    <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100/80">
                      <span className="text-xs text-teal-800 font-semibold block">Kinh Nghiệm Canh Tác</span>
                      <p className="text-lg font-black text-teal-900 mt-1">
                        {details.experience_years || '5+ năm'}
                      </p>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100/80">
                      <span className="text-xs text-amber-800 font-semibold block">Quy Mô Sản Lượng</span>
                      <p className="text-sm font-bold text-amber-900 mt-1">
                        {details.scale || 'Nông sản cung ứng đều đặn'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                        Chứng Nhận Chất Lượng Đã Thẩm Định
                      </span>
                      {details.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {details.certifications.map((cert, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-2xs flex items-center gap-1"
                            >
                              <ShieldCheck size={13} />
                              {cert}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chưa khai báo chứng chỉ chính thức</span>
                      )}
                    </div>

                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                        Mã Số Chứng Nhận / Cơ Quan Cấp Kiểm Định
                      </span>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {details.cert_code || 'Chưa cung cấp mã chứng nhận kiểm định'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 text-xs">
                    <span className="text-gray-400 font-semibold block mb-0.5">Sản Phẩm Thế Mạnh / Đặc Sản Vùng:</span>
                    <strong className="text-gray-800 text-sm">{farmer.specialty || 'Nông sản an toàn tiêu chuẩn VietGAP'}</strong>
                  </div>
                </div>

                {/* 3. VỊ TRÍ ĐỊA LÝ & KHO VẬN GHN */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2 text-emerald-800">
                    <MapPin size={16} />
                    3. Vị Trí Gian Hàng & Cấu Hình Kho Vận (GHN)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block font-medium">Địa chỉ cơ sở / khu vườn thực tế:</span>
                        <p className="font-semibold text-gray-900 text-sm mt-0.5">{farmer.address}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 block font-medium">Khu vực phân vùng logistics:</span>
                          <p className="font-bold text-gray-900 mt-0.5">{farmer.region?.name || 'Toàn quốc'} ({farmer.region?.zone || 'central'})</p>
                        </div>
                        {farmer.latitude && farmer.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${farmer.latitude},${farmer.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                          >
                            <Compass size={13} />
                            Google Maps
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <div>
                        <span className="text-gray-400 block font-medium">Tọa độ GIS vệ tinh:</span>
                        <p className="font-mono text-emerald-800 font-bold text-sm mt-0.5">
                          Vĩ độ (Lat): {farmer.latitude || 'Chưa định vị'} | Kinh độ (Lng): {farmer.longitude || 'Chưa định vị'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-gray-400 block font-medium">Mã Kho Giao Hàng Nhanh (Shop ID GHN):</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {farmer.ghn_shop_id ? (
                            <span className="text-emerald-700 font-mono">Shop ID: #{farmer.ghn_shop_id}</span>
                          ) : (
                            <span className="text-amber-600 font-normal italic">Chưa liên kết kho GHN riêng</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. CÂU CHUYỆN CANH TÁC & GHI CHÚ */}
                {(details.note || details.clean_story || farmer.story) && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2 text-emerald-800">
                      <FileText size={16} />
                      4. Lời Cam Kết / Giới Thiệu Gian Hàng
                    </h3>
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/60 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                      {details.note ? (
                        <>
                          <strong className="text-emerald-900 block mb-1">Ghi chú cam kết:</strong>
                          {details.note}
                          {details.clean_story && (
                            <>
                              <div className="my-2 border-t border-emerald-200/50"></div>
                              <strong className="text-emerald-900 block mb-1">Câu chuyện canh tác:</strong>
                              {details.clean_story}
                            </>
                          )}
                        </>
                      ) : (
                        farmer.story
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Bottom Action Bar */}
              <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Nút Toggle Duyệt Nhanh */}
                  <button
                    onClick={() => handleToggleStatus(farmer)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
                      farmer.is_verified
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                    }`}
                  >
                    {farmer.is_verified ? (
                      <>
                        <XCircle size={15} />
                        <span>Tạm dừng hoạt động gian hàng</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        <span>Phê duyệt & Kích hoạt gian hàng này</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {/* Nút Xem Gian Hàng Ngoài Web */}
                  <Link
                    href={`/farmers/${farmer.id}/?store=${farmer.id}`}
                    target="_blank"
                    className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Store size={15} />
                    <span>Mở Gian Hàng Web</span>
                    <ExternalLink size={13} />
                  </Link>

                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenEditModal(farmer);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Edit size={14} />
                    <span>Chỉnh sửa hồ sơ</span>
                  </button>

                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: CHỈNH SỬA TOÀN DIỆN THÔNG TIN NÔNG HỘ & GIAN HÀNG   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isEditModalOpen && editingFarmer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto border border-gray-100">
            {/* Edit Header */}
            <div className="p-5 border-b border-gray-100 bg-emerald-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit size={18} className="text-emerald-600" />
                  Chỉnh Sửa Hồ Sơ Gian Hàng Nông Hộ
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cập nhật đầy đủ thông tin pháp lý, tiêu chuẩn canh tác và vị trí GPS cho &ldquo;{editingFarmer.farm_name}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Nút Xem Gian Hàng Trực Tiếp Trên Header Modal Sửa */}
                <Link
                  href={`/farmers/${editingFarmer.id}/?store=${editingFarmer.id}`}
                  target="_blank"
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                  title="Mở gian hàng ngoài web để đối chiếu"
                >
                  <Store size={13} />
                  <span>Xem gian hàng</span>
                  <ExternalLink size={12} />
                </Link>

                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Edit Form Body */}
            <form onSubmit={handleSubmitEditForm} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              {/* PHẦN 1: TÊN VƯỜN & CHỦ HỘ */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={14} />
                  1. Thông tin Vườn Trồng & Chủ Hộ Đại Diện
                </h4>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tên Vườn / Nông Trại / HTX *
                  </label>
                  <input
                    required
                    type="text"
                    value={editFormData.farm_name}
                    onChange={e => setEditFormData({ ...editFormData, farm_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Họ & Tên Chủ Hộ
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn Tuấn"
                      value={editFormData.owner_name}
                      onChange={e => setEditFormData({ ...editFormData, owner_name: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Số Điện Thoại Liên Hệ *
                    </label>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={editFormData.phone}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Giao Dịch
                    </label>
                    <input
                      type="email"
                      placeholder="farmer@greenfood.asia"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mã Số Thuế / CCCD Đại Diện
                    </label>
                    <input
                      type="text"
                      placeholder="2600123456"
                      value={editFormData.tax_id}
                      onChange={e => setEditFormData({ ...editFormData, tax_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 2: TIÊU CHUẨN NĂNG LỰC & CHỨNG NHẬN */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} />
                  2. Tiêu Chuẩn Nông Nghiệp & Năng Lực Sản Xuất
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Chứng Nhận Chất Lượng Đạt Chuẩn:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_CERTS.map((cert) => {
                      const isSelected = editFormData.certifications.includes(cert);
                      return (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => toggleCertInEdit(cert)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <CheckSquare size={13} className={isSelected ? 'text-white' : 'text-gray-400'} />
                          {cert}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mã Số Chứng Nhận / Cơ Quan Cấp
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 123/VietGAP-2024 do TT Kiểm Định cấp"
                      value={editFormData.cert_code}
                      onChange={e => setEditFormData({ ...editFormData, cert_code: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Diện Tích Canh Tác
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 5 Hecta"
                      value={editFormData.farm_area}
                      onChange={e => setEditFormData({ ...editFormData, farm_area: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phương Thức Canh Tác
                    </label>
                    <input
                      type="text"
                      placeholder="Hữu cơ tự nhiên"
                      value={editFormData.farming_method}
                      onChange={e => setEditFormData({ ...editFormData, farming_method: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Kinh Nghiệm Canh Tác
                    </label>
                    <input
                      type="text"
                      placeholder="7 năm"
                      value={editFormData.experience_years}
                      onChange={e => setEditFormData({ ...editFormData, experience_years: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Quy Mô Sản Lượng
                    </label>
                    <input
                      type="text"
                      placeholder="20 tấn/năm"
                      value={editFormData.scale}
                      onChange={e => setEditFormData({ ...editFormData, scale: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Sản Phẩm Nổi Bật / Đặc Sản Vùng Miền
                  </label>
                  <input
                    type="text"
                    placeholder="Chuẩn VietGAP, Mận hậu, Nem chua..."
                    value={editFormData.specialty}
                    onChange={e => setEditFormData({ ...editFormData, specialty: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* PHẦN 3: ĐỊA CHỈ & TỌA ĐỘ GPS & KHO GHN */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} />
                    3. Vị Trí Gian Hàng & Kho Vận Giao Hàng Nhanh (GHN)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAutoGeocodeInEdit}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors border border-emerald-300"
                  >
                    <Compass size={13} />
                    Tự động lấy GPS từ địa chỉ
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Địa Chỉ Thực Tế Của Gian Hàng *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ví dụ: Mộc Châu, Sơn La"
                    value={editFormData.address}
                    onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Vĩ Độ (Latitude)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="20.8332"
                      value={editFormData.latitude}
                      onChange={e => setEditFormData({ ...editFormData, latitude: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Kinh Độ (Longitude)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="104.6724"
                      value={editFormData.longitude}
                      onChange={e => setEditFormData({ ...editFormData, longitude: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Mã Shop GHN (Shop ID)
                    </label>
                    <input
                      type="number"
                      placeholder="217561"
                      value={editFormData.ghn_shop_id}
                      onChange={e => setEditFormData({ ...editFormData, ghn_shop_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 4: GHI CHÚ / LỜI CAM KẾT & CÂU CHUYỆN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Ghi Chú Cam Kết / Câu Chuyện Giới Thiệu Gian Hàng
                </label>
                <textarea
                  rows={3}
                  placeholder="Cam kết nông sản an toàn không thuốc cấm, quy trình canh tác sinh thái..."
                  value={editFormData.note || editFormData.clean_story}
                  onChange={e => setEditFormData({ ...editFormData, note: e.target.value, clean_story: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-gray-100">
                <Link
                  href={`/farmers/${editingFarmer.id}/?store=${editingFarmer.id}`}
                  target="_blank"
                  className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Store size={15} />
                  <span>Xem gian hàng ngoài web</span>
                  <ExternalLink size={13} />
                </Link>

                <div className="flex items-center gap-2">
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
                    className="px-5 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                  >
                    {isEditSubmitting ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu cập nhật toàn bộ hồ sơ'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD MỚI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 bg-emerald-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Plus size={18} className="text-emerald-600" />
                  Thêm Nông Hộ Đối Tác Mới
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tạo tài khoản và gian hàng liên kết cho đối tác nông nghiệp sạch
                </p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Mã Số Thuế / CCCD
                  </label>
                  <input
                    type="text"
                    placeholder="2600123456"
                    value={formData.tax_id}
                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
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
    </div>
  );
}
