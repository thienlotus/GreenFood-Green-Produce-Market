"use client";

import { Search, Eye, CheckCircle2, XCircle, Clock, X, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  customer: string;
  date: string;
  total: string;
  status: string;
  items: number;
}

const initialOrders: Order[] = [
  { id: '#DH-2849', customer: 'Nguyễn Văn A', date: '2026-08-18 10:30', total: '340.000đ', status: 'pending', items: 3 },
  { id: '#DH-2850', customer: 'Trần Thị B', date: '2026-08-18 09:15', total: '1.250.000đ', status: 'processing', items: 5 },
  { id: '#DH-2851', customer: 'Lê Hoàng C', date: '2026-08-17 16:45', total: '85.000đ', status: 'completed', items: 1 },
  { id: '#DH-2852', customer: 'Phạm Văn D', date: '2026-08-17 14:20', total: '560.000đ', status: 'cancelled', items: 2 },
];

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium w-fit"><Clock size={14} /> Chờ duyệt</span>;
      case 'processing':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium w-fit"><Clock size={14} /> Đang giao</span>;
      case 'completed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium w-fit"><CheckCircle2 size={14} /> Hoàn thành</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium w-fit"><XCircle size={14} /> Đã hủy</span>;
      default:
        return null;
    }
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
  };

  const handleSaveStatus = () => {
    if (selectedOrder) {
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: editingStatus } : o));
      toast.success(`Đã cập nhật trạng thái đơn ${selectedOrder.id}`);
      setSelectedOrder(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Quản lý Đơn hàng</h2>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và xử lý các đơn đặt hàng từ khách hàng.</p>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Tìm mã đơn hàng hoặc tên khách..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="processing">Đang giao</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Mã đơn</th>
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Ngày đặt</th>
                <th className="p-4 font-semibold">Số lượng</th>
                <th className="p-4 font-semibold">Tổng tiền</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase())).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-emerald-700">{order.id}</td>
                  <td className="p-4 font-medium text-gray-800">{order.customer}</td>
                  <td className="p-4 text-sm text-gray-600">{order.date}</td>
                  <td className="p-4 text-sm text-gray-600">{order.items} sản phẩm</td>
                  <td className="p-4 text-sm font-bold text-gray-900">{order.total}</td>
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenDetails(order)}
                        className="p-1.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded transition-colors border border-gray-200"
                        title="Xem & Cập nhật"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng {selectedOrder.id}</h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Khách hàng</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Ngày đặt</p>
                    <p className="font-medium text-gray-800">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Số lượng sản phẩm</p>
                    <p className="font-medium text-gray-800">{selectedOrder.items}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Tổng tiền</p>
                    <p className="font-bold text-emerald-600 text-base">{selectedOrder.total}</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Cập nhật trạng thái</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${editingStatus === 'pending' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="status" value="pending" checked={editingStatus === 'pending'} onChange={(e) => setEditingStatus(e.target.value)} className="w-4 h-4 text-amber-600 focus:ring-amber-500" />
                      {getStatusBadge('pending')}
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${editingStatus === 'processing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="status" value="processing" checked={editingStatus === 'processing'} onChange={(e) => setEditingStatus(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      {getStatusBadge('processing')}
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${editingStatus === 'completed' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="status" value="completed" checked={editingStatus === 'completed'} onChange={(e) => setEditingStatus(e.target.value)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                      {getStatusBadge('completed')}
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${editingStatus === 'cancelled' ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="status" value="cancelled" checked={editingStatus === 'cancelled'} onChange={(e) => setEditingStatus(e.target.value)} className="w-4 h-4 text-rose-600 focus:ring-rose-500" />
                      {getStatusBadge('cancelled')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveStatus}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Save size={16} />
                Lưu trạng thái
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
