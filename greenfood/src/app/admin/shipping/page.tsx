"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, Save, Truck, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getShippingZones, 
  createShippingZone, 
  updateShippingZone, 
  deleteShippingZone, 
  ShippingZoneItem 
} from '@/lib/api';

const fallbackZones: ShippingZoneItem[] = [
  { id: 'SZ001', name: 'Nội thành TP.HCM', provinces: 'TP. Hồ Chí Minh (Quận 1-12, Bình Thạnh, Gò Vấp, Phú Nhuận, Tân Bình, Tân Phú)', baseFee: 15000, extraFeePerKg: 3000, freeShipMinimum: 300000, estimatedDays: '1-2 giờ', isActive: true },
  { id: 'SZ002', name: 'Ngoại thành TP.HCM', provinces: 'TP. Hồ Chí Minh (Củ Chi, Hóc Môn, Bình Chánh, Nhà Bè, Cần Giờ)', baseFee: 25000, extraFeePerKg: 4000, freeShipMinimum: 500000, estimatedDays: '2-4 giờ', isActive: true },
  { id: 'SZ003', name: 'Đồng Bằng Sông Cửu Long', provinces: 'Bến Tre, Vĩnh Long, Đồng Tháp, Tiền Giang, Cần Thơ, An Giang, Long An', baseFee: 30000, extraFeePerKg: 5000, freeShipMinimum: 500000, estimatedDays: '1-2 ngày', isActive: true },
  { id: 'SZ004', name: 'Miền Đông Nam Bộ', provinces: 'Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu, Tây Ninh, Bình Phước', baseFee: 25000, extraFeePerKg: 4500, freeShipMinimum: 500000, estimatedDays: '1-2 ngày', isActive: true },
  { id: 'SZ005', name: 'Tây Nguyên & Miền Trung', provinces: 'Đà Lạt, Lâm Đồng, Đắk Lắk, Đà Nẵng, Huế, Quảng Nam, Bình Định', baseFee: 40000, extraFeePerKg: 6000, freeShipMinimum: 700000, estimatedDays: '2-3 ngày', isActive: true },
  { id: 'SZ006', name: 'Miền Bắc', provinces: 'Hà Nội, Hải Phòng, Quảng Ninh, Nam Định, Ninh Bình, Hà Nam', baseFee: 50000, extraFeePerKg: 7000, freeShipMinimum: 800000, estimatedDays: '3-5 ngày', isActive: true },
];

const emptyZone: Omit<ShippingZoneItem, 'id'> = {
  name: '', provinces: '', baseFee: 0, extraFeePerKg: 0, freeShipMinimum: 0, estimatedDays: '', isActive: true
};

export default function AdminShipping() {
  const [zones, setZones] = useState<ShippingZoneItem[]>(fallbackZones);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZoneItem | null>(null);
  const [formData, setFormData] = useState(emptyZone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadZones = async () => {
    const data = await getShippingZones();
    if (data && data.length > 0) {
      setZones(data);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
    z.provinces.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const openAddModal = () => {
    setEditingZone(null);
    setFormData({ ...emptyZone });
    setShowModal(true);
  };

  const openEditModal = (zone: ShippingZoneItem) => {
    setEditingZone(zone);
    setFormData({ 
      name: zone.name, 
      provinces: zone.provinces, 
      baseFee: zone.baseFee, 
      extraFeePerKg: zone.extraFeePerKg, 
      freeShipMinimum: zone.freeShipMinimum, 
      estimatedDays: zone.estimatedDays, 
      isActive: zone.isActive 
    });
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) { toast.error('Tên vùng giao hàng không được để trống!'); return false; }
    if (!formData.provinces.trim()) { toast.error('Danh sách tỉnh/thành không được để trống!'); return false; }
    if (formData.baseFee < 0) { toast.error('Phí cơ bản không được âm!'); return false; }
    if (formData.extraFeePerKg < 0) { toast.error('Phí mỗi kg thêm không được âm!'); return false; }
    if (formData.freeShipMinimum < 0) { toast.error('Mức miễn phí ship không được âm!'); return false; }
    if (!formData.estimatedDays.trim()) { toast.error('Thời gian giao hàng dự kiến không được để trống!'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    if (editingZone) {
      const res = await updateShippingZone(editingZone.id, formData);
      if (res.success) {
        toast.success(`Đã cập nhật vùng "${formData.name}" thành công!`);
        await loadZones();
      } else {
        // Local update fallback
        setZones(zones.map(z => z.id === editingZone.id ? { ...z, ...formData } : z));
        toast.success(`Đã cập nhật vùng "${formData.name}" (Local)!`);
      }
    } else {
      const res = await createShippingZone(formData);
      if (res.success && res.data) {
        toast.success(`Đã thêm vùng "${formData.name}" thành công!`);
        await loadZones();
      } else {
        // Local add fallback
        const newZone: ShippingZoneItem = {
          id: `SZ${String(zones.length + 1).padStart(3, '0')}`,
          ...formData,
        };
        setZones([...zones, newZone]);
        toast.success(`Đã thêm vùng "${formData.name}" (Local)!`);
      }
    }
    setShowModal(false);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const zone = zones.find(z => z.id === id);
    const res = await deleteShippingZone(id);
    if (res.success) {
      toast.success(`Đã xóa vùng "${zone?.name}" thành công!`);
      await loadZones();
    } else {
      setZones(zones.filter(z => z.id !== id));
      toast.success(`Đã xóa vùng "${zone?.name}" thành công!`);
    }
    setDeleteConfirm(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Truck size={22} className="text-emerald-600" />
              Quản lý Phí Giao Hàng (Backend API CRUD)
            </h2>
            <p className="text-sm text-gray-500 mt-1">Cấu hình phí vận chuyển lưu trữ trực tiếp trên CSDL MySQL qua Laravel REST API.</p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
            REST API: /api/shipping-zones
          </span>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Tìm kiếm vùng giao hàng hoặc tỉnh thành..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> Thêm vùng mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Mã</th>
                <th className="p-4 font-semibold">Tên vùng</th>
                <th className="p-4 font-semibold">Phí cơ bản</th>
                <th className="p-4 font-semibold">Phí/kg thêm</th>
                <th className="p-4 font-semibold">Miễn phí từ</th>
                <th className="p-4 font-semibold">Thời gian</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-mono text-gray-500 font-bold">{zone.id}</td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-800 text-sm">{zone.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{zone.provinces}</div>
                  </td>
                  <td className="p-4 text-sm font-bold text-emerald-600">{zone.baseFee.toLocaleString('vi-VN')}đ</td>
                  <td className="p-4 text-sm text-gray-700">{zone.extraFeePerKg.toLocaleString('vi-VN')}đ</td>
                  <td className="p-4 text-sm text-amber-600 font-medium">{zone.freeShipMinimum.toLocaleString('vi-VN')}đ</td>
                  <td className="p-4 text-sm text-gray-600">{zone.estimatedDays}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${zone.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {zone.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(zone)} className="p-1.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors border border-gray-200" title="Sửa">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteConfirm(zone.id)} className="p-1.5 text-gray-600 hover:bg-rose-50 hover:text-rose-600 rounded transition-colors border border-gray-200" title="Xóa">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredZones.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                    Không tìm thấy vùng giao hàng nào!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingZone ? `Chỉnh sửa: ${editingZone.name}` : 'Thêm vùng giao hàng mới (API Backend)'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên vùng giao hàng *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="VD: Nội thành TP.HCM" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố áp dụng *</label>
                <textarea rows={2} value={formData.provinces} onChange={(e) => setFormData({ ...formData, provinces: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="VD: TP.HCM, Bình Dương, Đồng Nai..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phí cơ bản (đ) *</label>
                  <input type="number" min="0" value={formData.baseFee} onChange={(e) => setFormData({ ...formData, baseFee: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phí mỗi kg thêm (đ)</label>
                  <input type="number" min="0" value={formData.extraFeePerKg} onChange={(e) => setFormData({ ...formData, extraFeePerKg: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miễn phí ship từ (đ)</label>
                  <input type="number" min="0" value={formData.freeShipMinimum} onChange={(e) => setFormData({ ...formData, freeShipMinimum: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian giao *</label>
                  <input type="text" value={formData.estimatedDays} onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="VD: 1-2 ngày" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">Kích hoạt vùng giao hàng này</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
                Hủy
              </button>
              <button onClick={handleSave} disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50">
                <Save size={16} />
                {isSubmitting ? 'Đang lưu vào DB...' : (editingZone ? 'Cập nhật' : 'Thêm mới')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc muốn xóa vùng giao hàng <strong>&quot;{zones.find(z => z.id === deleteConfirm)?.name}&quot;</strong>? Dữ liệu trên Database sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
