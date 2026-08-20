"use client";

import { Search, Eye, CheckCircle2, XCircle, Clock, X, Save, Package, RefreshCw, MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getAdminOrders, updateOrderStatus, AdminOrder } from '@/lib/api';

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders({ status: filterStatus, search: searchTerm });
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách đơn hàng!');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium w-fit"><Clock size={14} /> Chờ duyệt</span>;
      case 'processing':
      case 'shipping':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium w-fit"><Clock size={14} /> Đang giao</span>;
      case 'completed':
      case 'delivered':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium w-fit"><CheckCircle2 size={14} /> Hoàn thành</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium w-fit"><XCircle size={14} /> Đã hủy</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium w-fit">{status}</span>;
    }
  };

  const handleOpenDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder || isSubmitting) return;
    setIsSubmitting(true);

    const res = await updateOrderStatus(selectedOrder.tracking_number, editingStatus);

    if (res.success) {
      toast.success(`Đã cập nhật trạng thái đơn ${selectedOrder.id}`);
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: editingStatus } : o));
      setSelectedOrder(null);
    } else {
      toast.error(res.message || 'Cập nhật trạng thái thất bại');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản lý Đơn hàng</h2>
            <p className="text-sm text-gray-500 mt-1">Theo dõi và xử lý các đơn đặt hàng trực tiếp từ hệ thống.</p>
          </div>
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Tìm mã đơn hàng, tên khách hoặc SĐT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="processing">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
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
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={18} className="animate-spin text-emerald-600" />
                      Đang tải danh sách đơn hàng...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Không tìm thấy đơn hàng nào phù hợp!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-emerald-700 font-mono">{order.id}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{order.customer}</div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{order.date}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                        <Package size={12} /> {order.items} món
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">{order.total}</td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDetails(order)}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 flex items-center gap-1.5"
                          title="Xem chi tiết & Sản phẩm"
                        >
                          <Eye size={14} /> Xem & Cập nhật
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

      {/* Order Details Modal with Product List */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng {selectedOrder.id}</h3>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Thông tin khách hàng & Giao hàng */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Thông tin giao nhận</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-[90px]">Khách hàng:</span>
                    <span className="font-semibold text-gray-800">{selectedOrder.customer}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone size={16} className="text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{selectedOrder.phone}</span>
                  </div>
                  {selectedOrder.email && (
                    <div className="flex items-start gap-2">
                      <Mail size={16} className="text-gray-400 mt-0.5" />
                      <span className="text-gray-700">{selectedOrder.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <CreditCard size={16} className="text-gray-400 mt-0.5" />
                    <span className="text-gray-700 font-medium">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{selectedOrder.address}</span>
                  </div>
                  {selectedOrder.note && (
                    <div className="md:col-span-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      <strong>Ghi chú:</strong> {selectedOrder.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Danh sách sản phẩm đã đặt */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Sản phẩm đã đặt ({selectedOrder.item_details?.length || 0} mục)</span>
                  <span className="text-xs font-normal text-gray-500">Mã đơn: {selectedOrder.tracking_number}</span>
                </h4>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                        <th className="p-3 font-semibold">Tên sản phẩm</th>
                        <th className="p-3 font-semibold">Quy cách / Đơn vị</th>
                        <th className="p-3 font-semibold text-right">Đơn giá</th>
                        <th className="p-3 font-semibold text-center">Số lượng</th>
                        <th className="p-3 font-semibold text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.item_details && selectedOrder.item_details.length > 0 ? (
                        selectedOrder.item_details.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <div>
                                  <p className="font-semibold text-gray-900">{item.product_name}</p>
                                  {item.product_id && (
                                    <p className="text-[11px] text-gray-400 font-mono">Mã SP: {item.product_id}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-gray-600">{item.unit}</td>
                            <td className="p-3 text-right text-gray-700">{item.price.toLocaleString('vi-VN')}đ</td>
                            <td className="p-3 text-center font-bold text-gray-800">x{item.quantity}</td>
                            <td className="p-3 text-right font-bold text-emerald-700">
                              {item.subtotal ? item.subtotal.toLocaleString('vi-VN') : (item.price * item.quantity).toLocaleString('vi-VN')}đ
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-gray-500">
                            Không có chi tiết sản phẩm
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={4} className="p-3 text-right text-gray-600 font-medium">Phí vận chuyển:</td>
                        <td className="p-3 text-right font-medium text-gray-800">
                          {selectedOrder.shipping_fee ? `${selectedOrder.shipping_fee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="p-3 text-right font-bold text-gray-900 text-base">Tổng giá trị đơn hàng:</td>
                        <td className="p-3 text-right font-bold text-emerald-600 text-lg">{selectedOrder.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Cập nhật trạng thái */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Cập nhật trạng thái đơn hàng</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${editingStatus === 'pending' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="status" value="pending" checked={editingStatus === 'pending'} onChange={(e) => setEditingStatus(e.target.value)} className="w-4 h-4 text-amber-600 focus:ring-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">Chờ duyệt</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${editingStatus === 'processing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="status" value="processing" checked={editingStatus === 'processing'} onChange={(e) => setEditingStatus(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">Đang giao</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${editingStatus === 'completed' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="status" value="completed" checked={editingStatus === 'completed'} onChange={(e) => setEditingStatus(e.target.value)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-700">Hoàn thành</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${editingStatus === 'cancelled' ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="status" value="cancelled" checked={editingStatus === 'cancelled'} onChange={(e) => setEditingStatus(e.target.value)} className="w-4 h-4 text-rose-600 focus:ring-rose-500" />
                    <span className="text-xs font-semibold text-rose-700">Đã hủy</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Đóng
              </button>
              <button 
                onClick={handleSaveStatus}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {isSubmitting ? 'Đang lưu...' : 'Lưu trạng thái'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

