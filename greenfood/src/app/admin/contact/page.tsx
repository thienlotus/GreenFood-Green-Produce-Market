"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquareQuote, Search, Phone, Mail, Clock, CheckCircle2, 
  HelpCircle, Eye, Trash2, RefreshCw, X, Save, Send, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getAdminContactInquiriesApi, 
  updateAdminContactInquiryStatusApi, 
  deleteAdminContactInquiryApi, 
  ContactInquiryItem 
} from '@/lib/api';

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState<ContactInquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiryItem | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('PENDING');
  const [replyContent, setReplyContent] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminContactInquiriesApi({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchTerm || undefined,
      });
      if (res && res.success) {
        setInquiries(res.data || []);
      }
    } catch {
      toast.error('Không thể tải danh sách liên hệ & góp ý');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchInquiries]);

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'PENDING').length,
    processing: inquiries.filter(i => i.status === 'PROCESSING').length,
    resolved: inquiries.filter(i => i.status === 'RESOLVED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
            <Clock size={12} /> Chờ giải đáp
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            <AlertCircle size={12} /> Đang xử lý
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
            <CheckCircle2 size={12} /> Đã phản hồi
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

  const handleOpenModal = (inquiry: ContactInquiryItem) => {
    setSelectedInquiry(inquiry);
    setEditingStatus(inquiry.status);
    setReplyContent(inquiry.reply_content || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      const res = await updateAdminContactInquiryStatusApi(selectedInquiry.id, {
        status: editingStatus,
        reply_content: replyContent,
      });
      if (res && res.success) {
        toast.success('Cập nhật xử lý ý kiến khách hàng thành công!');
        setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? { 
          ...i, 
          status: editingStatus as any, 
          reply_content: replyContent,
          responded_at: editingStatus === 'RESOLVED' ? new Date().toISOString() : i.responded_at
        } : i));
        setSelectedInquiry(null);
      } else {
        toast.error('Cập nhật thất bại, vui lòng thử lại.');
      }
    } catch {
      toast.error('Lỗi kết nối khi cập nhật thông tin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ý kiến của khách hàng "${name}"?`)) return;
    try {
      const res = await deleteAdminContactInquiryApi(id);
      if (res && res.success) {
        toast.success(`Đã xóa thông tin của ${name}`);
        setInquiries(prev => prev.filter(i => i.id !== id));
      } else {
        toast.error('Không thể xóa ý kiến');
      }
    } catch {
      toast.error('Lỗi khi xóa ý kiến');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <MessageSquareQuote size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Liên Hệ & Góp Ý Khách Hàng</h1>
            <p className="text-sm text-gray-500">Tiếp nhận yêu cầu hợp tác, tư vấn và phản hồi dịch vụ GreenFood</p>
          </div>
        </div>
        <button 
          onClick={() => fetchInquiries()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tin nhắn</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Chờ giải đáp</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Đang thụ lý</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{stats.processing}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Đã giải quyết</p>
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
              placeholder="Tìm theo tên khách hàng, số điện thoại, tiêu đề hoặc nội dung..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'PENDING', label: 'Chờ giải đáp' },
              { key: 'PROCESSING', label: 'Đang thụ lý' },
              { key: 'RESOLVED', label: 'Đã hoàn tất' },
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

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Chủ Đề & Tiêu Đề</th>
                <th className="py-3.5 px-4">Nội Dung Góp Ý</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Thời Gian</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-emerald-600" size={18} />
                      Đang tải danh sách góp ý khách hàng...
                    </div>
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <MessageSquareQuote className="mx-auto text-gray-300 mb-2" size={36} />
                    <p className="font-medium">Không có ý kiến đóng góp nào</p>
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-gray-50/60 transition group">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-gray-900">{inq.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <a href={`tel:${inq.phone}`} className="hover:text-emerald-600 transition flex items-center gap-1 font-medium">
                            <Phone size={11} /> {inq.phone}
                          </a>
                          {inq.email && (
                            <>
                              <span>•</span>
                              <a href={`mailto:${inq.email}`} className="hover:text-emerald-600 transition flex items-center gap-1">
                                <Mail size={11} /> {inq.email}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-900 text-xs line-clamp-1">
                        {inq.subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {inq.message}
                      </p>
                      {inq.reply_content && (
                        <p className="text-[11px] text-emerald-700 line-clamp-1 mt-1 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Đã phản hồi: {inq.reply_content}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(inq.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(inq.created_at).toLocaleDateString('vi-VN', {
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
                          onClick={() => handleOpenModal(inq)}
                          title="Xem chi tiết & Phản hồi"
                          className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Eye size={17} />
                        </button>
                        <a
                          href={`tel:${inq.phone}`}
                          title="Gọi cho khách hàng"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Phone size={17} />
                        </a>
                        <button
                          onClick={() => handleDelete(inq.id, inq.name)}
                          title="Xóa tin nhắn"
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

      {/* Detail / Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <MessageSquareQuote size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedInquiry.name}</h3>
                  <p className="text-xs text-gray-500">Tiêu đề: <strong className="text-gray-800">{selectedInquiry.subject}</strong></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-gray-500">Số điện thoại liên hệ:</span>
                  <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                    {selectedInquiry.phone}
                    <a href={`tel:${selectedInquiry.phone}`} className="text-emerald-600 hover:underline">Gọi điện</a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                    {selectedInquiry.email || 'Không có email'}
                    {selectedInquiry.email && (
                      <a href={`mailto:${selectedInquiry.email}`} className="text-emerald-600 hover:underline">Gửi mail</a>
                    )}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Thời gian tiếp nhận:</span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {new Date(selectedInquiry.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nội dung ý kiến đóng góp</h4>
                <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-800 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Trạng thái thụ lý
                  </label>
                  <select 
                    value={editingStatus}
                    onChange={e => setEditingStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PENDING">Chờ giải đáp (PENDING)</option>
                    <option value="PROCESSING">Đang thụ lý / Liên hệ khách (PROCESSING)</option>
                    <option value="RESOLVED">Đã giải quyết xong (RESOLVED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nội dung phản hồi / Ghi chú giải quyết
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Ghi lại kết quả gọi điện cho khách hoặc phản hồi đã gửi..."
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setSelectedInquiry(null)}
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
                <Save size={14} /> {isUpdating ? 'Đang lưu...' : 'Lưu Phản Hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
