"use client";

import { Search, Edit2, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const mockCustomers = [
  { id: 'KH001', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', totalOrders: 12, status: 'Hoạt động' },
  { id: 'KH002', name: 'Trần Thị B', email: 'tranthib@yahoo.com', phone: '0912345678', totalOrders: 5, status: 'Hoạt động' },
  { id: 'KH003', name: 'Lê Hoàng C', email: 'lehoangc@hotmail.com', phone: '0987654321', totalOrders: 0, status: 'Khóa' },
];

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState(mockCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'Hoạt động' });

  const handleToggleLock = (id: string, name: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Hoạt động' ? 'Khóa' : 'Hoạt động';
    if (confirm(`Bạn có chắc chắn muốn ${newStatus.toLowerCase()} tài khoản ${name}?`)) {
      setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success(`Đã ${newStatus.toLowerCase()} tài khoản: ${name}`);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      toast.error('Họ và tên không được để trống!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Định dạng email không hợp lệ!');
      return;
    }

    const phoneRegex = /^(0|\+84)[0-9]{8,10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ (10-11 số)!');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { 
        ...c, 
        ...formData,
        name: trimmedName 
      } : c));
      toast.success('Đã cập nhật thông tin khách hàng!');
    }
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản lý Khách hàng</h2>
            <p className="text-sm text-gray-500 mt-1">Quản lý danh sách người dùng mua hàng trên hệ thống.</p>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email, SĐT..." 
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
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Số điện thoại</th>
                <th className="p-4 font-semibold">Số đơn hàng</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.filter(c => 
                c.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) || 
                c.email.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
                c.phone.includes(searchTerm.trim())
              ).map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{customer.phone}</td>
                  <td className="p-4 text-sm font-medium text-gray-800">{customer.totalOrders} đơn</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'Hoạt động' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(customer)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleLock(customer.id, customer.name, customer.status)}
                        className={`p-1.5 rounded transition-colors ${
                          customer.status === 'Hoạt động' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={customer.status === 'Hoạt động' ? 'Khóa' : 'Mở khóa'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Sửa thông tin khách hàng</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500">
                  <option>Hoạt động</option>
                  <option>Khóa</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
