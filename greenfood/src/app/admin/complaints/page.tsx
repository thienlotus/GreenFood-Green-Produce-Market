"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, Search, Phone, Clock, CheckCircle2, 
  XCircle, Eye, Trash2, RefreshCw, X, Save, ShieldAlert,
  RotateCcw, RefreshCw as ExchangeIcon, Gift, FileText, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getAdminCustomerComplaintsApi, 
  updateAdminCustomerComplaintStatusApi, 
  deleteAdminCustomerComplaintApi, 
  CustomerComplaintItem 
} from '@/lib/api';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<CustomerComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<CustomerComplaintItem | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('PENDING');
  const [editingResolution, setEditingResolution] = useState<string>('refund');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminCustomerComplaintsApi({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchTerm || undefined,
      });
      if (res && res.success) {
        setComplaints(res.data || []);
      }
    } catch {
      toast.error('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'PENDING').length,
    investigating: complaints.filter(c => c.status === 'INVESTIGATING').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
            <Clock size={12} /> Chờ xác minh
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            <ShieldAlert size={12} /> Đang điều tra
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
            <CheckCircle2 size={12} /> Đã giải quyết
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">
            <XCircle size={12} /> Bác bỏ / Sai quy định
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  const getResolutionBadge = (type: string) => {
    switch (type) {
      case 'refund':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-medium">
            <RotateCcw size={11} /> Hoàn tiền 100%
          </span>
        );
      case 'exchange':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-[11px] font-medium">
            <ExchangeIcon size={11} /> Giao bù hàng mới
          </span>
        );
      case 'compensation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px] font-medium">
            <Gift size={11} /> Tặng Voucher / Bồi thường
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 rounded text-[11px] font-medium">
            {type}
          </span>
        );
    }
  };

  const handleOpenModal = (complaint: CustomerComplaintItem) => {
    setSelectedComplaint(complaint);
    setEditingStatus(complaint.status);
    setEditingResolution(complaint.resolution_type || 'refund');
    setAdminNotes(complaint.admin_notes || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    try {
      const res = await updateAdminCustomerComplaintStatusApi(selectedComplaint.id, {
        status: editingStatus,
        resolution_type: editingResolution,
        admin_notes: adminNotes,
      });
      if (res && res.success) {
        toast.success(`Đã cập nhật xử lý khiếu nại #${selectedComplaint.complaint_code}!`);
        setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { 
          ...c, 
          status: editingStatus as any, 
          resolution_type: editingResolution as any,
          admin_notes: adminNotes,
          resolved_at: editingStatus === 'RESOLVED' ? new Date().toISOString() : c.resolved_at
        } : c));
        setSelectedComplaint(null);
      } else {
        toast.error('Cập nhật khiếu nại thất bại, vui lòng thử lại.');
      }
    } catch {
      toast.error('Lỗi kết nối khi cập nhật khiếu nại');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bản ghi khiếu nại #${code}?`)) return;
    try {
      const res = await deleteAdminCustomerComplaintApi(id);
      if (res && res.success) {
        toast.success(`Đã xóa khiếu nại #${code}`);
        setComplaints(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error('Không thể xóa khiếu nại');
      }
    } catch {
      toast.error('Lỗi khi xóa khiếu nại');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tiếp Nhận & Xử Lý Khiếu Nại Dịch Vụ</h1>
            <p className="text-sm text-gray-500">Giám sát xử lý sự cố chất lượng nông sản, giao trễ và sai sót đơn hàng</p>
          </div>
        </div>
        <button 
          onClick={() => fetchComplaints()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng khiếu nại</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Chờ xác minh</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Đang điều tra</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{stats.investigating}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Đã khắc phục</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{stats.resolved}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm theo mã khiếu nại (KN-...), mã đơn hàng (#GF-...), tên khách, SĐT..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'PENDING', label: 'Chờ xác minh' },
              { key: 'INVESTIGATING', label: 'Đang điều tra' },
              { key: 'RESOLVED', label: 'Đã giải quyết' },
              { key: 'REJECTED', label: 'Từ chối' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === tab.key 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã Khiếu Nại / Đơn Hàng</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Lý Do Khiếu Nại</th>
                <th className="py-3.5 px-4">Phương Án Đề Xuất</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Thời Gian</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-emerald-600" size={18} />
                      Đang tải danh sách khiếu nại khách hàng...
                    </div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <AlertTriangle className="mx-auto text-gray-300 mb-2" size={36} />
                    <p className="font-medium">Không có khiếu nại nào trong danh sách</p>
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition group">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-xs">
                        #{item.complaint_code}
                      </span>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        Đơn: <strong className="text-gray-800">{item.order_code}</strong>
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-gray-900">{item.customer_name}</p>
                        <a href={`tel:${item.phone}`} className="hover:text-emerald-600 transition flex items-center gap-1 text-xs text-gray-500 font-medium mt-0.5">
                          <Phone size={11} /> {item.phone}
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-gray-800 text-xs line-clamp-1">
                        {item.reason}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-1 italic mt-0.5">
                        &ldquo;{item.description}&rdquo;
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getResolutionBadge(item.resolution_type)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(item)}
                          title="Xem chi tiết & Xử lý"
                          className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Eye size={17} />
                        </button>
                        <a
                          href={`tel:${item.phone}`}
                          title="Gọi cho khách hàng"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Phone size={17} />
                        </a>
                        <button
                          onClick={() => handleDelete(item.id, item.complaint_code)}
                          title="Xóa bản ghi khiếu nại"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 size={17} />
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

      {/* Detail / Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Khiếu Nại #{selectedComplaint.complaint_code}</h3>
                  <p className="text-xs text-gray-500">Mã đơn hàng liên quan: <strong className="text-gray-900">{selectedComplaint.order_code}</strong></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-gray-500">Khách hàng khiếu nại:</span>
                  <p className="font-bold text-gray-900 mt-0.5">{selectedComplaint.customer_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Số điện thoại:</span>
                  <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                    {selectedComplaint.phone}
                    <a href={`tel:${selectedComplaint.phone}`} className="text-emerald-600 hover:underline">Gọi ngay</a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Lý do chính:</span>
                  <p className="font-bold text-rose-700 mt-0.5">{selectedComplaint.reason}</p>
                </div>
                <div>
                  <span className="text-gray-500">Thời gian tiếp nhận:</span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {new Date(selectedComplaint.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mô tả sự cố từ khách hàng</h4>
                <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-800 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                  {selectedComplaint.description}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Trạng thái xử lý
                    </label>
                    <select 
                      value={editingStatus}
                      onChange={e => setEditingStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PENDING">Chờ xác minh (PENDING)</option>
                      <option value="INVESTIGATING">Đang điều tra / Kiểm tra kho (INVESTIGATING)</option>
                      <option value="RESOLVED">Đã giải quyết xong (RESOLVED)</option>
                      <option value="REJECTED">Từ chối giải quyết (REJECTED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Phương án bồi thường / khắc phục
                    </label>
                    <select 
                      value={editingResolution}
                      onChange={e => setEditingResolution(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="refund">Hoàn tiền 100% tài khoản</option>
                      <option value="exchange">Giao bù hàng mới trong 60 phút</option>
                      <option value="compensation">Tặng voucher đền bù 50.000đ - 100.000đ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ghi chú điều tra & Kết quả giải quyết (Nội bộ)
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Ghi lại nguyên nhân lỗi đóng gói, hình ảnh xác minh hoặc số tiền đã hoàn..."
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Đóng
              </button>
              <button 
                type="button"
                disabled={isUpdating}
                onClick={handleSaveStatus}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                <Save size={14} /> {isUpdating ? 'Đang lưu...' : 'Lưu Kết Quả Xử Lý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
