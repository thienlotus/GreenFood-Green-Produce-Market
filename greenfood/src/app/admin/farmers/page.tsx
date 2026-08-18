"use client";

import { Search, Edit2, Trash2, Tractor, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const mockFarmers = [
  { id: 'NH001', name: 'Nông trại Bác Tư', region: 'Bến Tre', products: 5, rating: 4.8, status: 'Đã xác minh' },
  { id: 'NH002', name: 'Vườn dâu Đà Lạt', region: 'Lâm Đồng', products: 12, rating: 4.9, status: 'Đã xác minh' },
  { id: 'NH003', name: 'Hợp tác xã Mộc Châu', region: 'Sơn La', products: 3, rating: 4.5, status: 'Chờ duyệt' },
];

export default function AdminFarmers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [farmers, setFarmers] = useState(mockFarmers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', region: '', products: '', rating: '5.0', status: 'Đã xác minh' });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đối tác ${name}?`)) {
      setFarmers(farmers.filter(f => f.id !== id));
      toast.success(`Đã xóa đối tác: ${name}`);
    }
  };

  const handleEdit = (farmer: any) => {
    setEditingFarmer(farmer);
    setFormData({
      name: farmer.name,
      region: farmer.region,
      products: farmer.products.toString(),
      rating: farmer.rating.toString(),
      status: farmer.status
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingFarmer(null);
    setFormData({ name: '', region: '', products: '0', rating: '5.0', status: 'Chờ duyệt' });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFarmer) {
      setFarmers(farmers.map(f => f.id === editingFarmer.id ? { 
        ...f, 
        ...formData, 
        products: Number(formData.products),
        rating: Number(formData.rating)
      } : f));
      toast.success('Đã cập nhật đối tác!');
    } else {
      const newFarmer = {
        id: `NH00${farmers.length + 1}`,
        ...formData,
        products: Number(formData.products),
        rating: Number(formData.rating)
      };
      setFarmers([newFarmer, ...farmers]);
      toast.success('Đã thêm đối tác mới!');
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản lý Nông hộ</h2>
            <p className="text-sm text-gray-500 mt-1">Danh sách đối tác nông trại cung cấp sản phẩm.</p>
          </div>
          <button 
            onClick={handleAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus size={18} />
            Thêm đối tác mới
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm nông hộ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Tên nông trại</th>
                <th className="p-4 font-semibold">Khu vực</th>
                <th className="p-4 font-semibold">Số sản phẩm</th>
                <th className="p-4 font-semibold">Đánh giá</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {farmers.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((farmer) => (
                <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <Tractor size={20} />
                      </div>
                      <span className="font-medium text-gray-800">{farmer.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{farmer.region}</td>
                  <td className="p-4 text-sm font-medium text-gray-800">{farmer.products}</td>
                  <td className="p-4 text-sm font-bold text-amber-500">⭐ {farmer.rating}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      farmer.status === 'Đã xác minh' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {farmer.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(farmer)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(farmer.id, farmer.name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {farmers.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không tìm thấy đối tác nào!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{editingFarmer ? 'Sửa thông tin đối tác' : 'Thêm đối tác mới'}</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nông trại / HTX</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                <input required type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số sản phẩm cung cấp</label>
                  <input required type="number" value={formData.products} onChange={e => setFormData({...formData, products: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500">
                    <option>Đã xác minh</option>
                    <option>Chờ duyệt</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Lưu đối tác</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
