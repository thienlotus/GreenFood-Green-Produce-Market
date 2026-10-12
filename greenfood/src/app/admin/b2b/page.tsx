"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Search, Filter, RefreshCw, Phone, Mail, FileText, 
  CheckCircle2, Clock, XCircle, AlertCircle, Eye, Trash2, Edit3, 
  ChevronRight, Calendar, MapPin, Package, ArrowUpRight, Check, X, Send, Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getAdminB2bInquiriesApi, 
  updateB2bInquiryStatusApi, 
  deleteB2bInquiryApi, 
  respondB2bInquiryApi,
  B2bInquiryItem 
} from '@/lib/api';

export default function AdminB2bPage() {
  const [inquiries, setInquiries] = useState<B2bInquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'CONTRACTED' | 'CANCELLED'>('ALL');
  
  // Modal states
  const [selectedInquiry, setSelectedInquiry] = useState<B2bInquiryItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingResponse, setIsSendingResponse] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [clientResponseInput, setClientResponseInput] = useState('');
  const [assignedStaffInput, setAssignedStaffInput] = useState('Chuyên viên B2B GreenFood');
  const [sendEmailCheckbox, setSendEmailCheckbox] = useState(true);

  const fetchInquiries = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getAdminB2bInquiriesApi({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchTerm.trim() || undefined,
      });

      if (res && res.success) {
        setInquiries(res.data);
      } else {
        toast.error('Không thể tải danh sách phiếu B2B từ máy chủ');
      }
    } catch (err) {
      console.error('Lỗi khi tải phiếu B2B:', err);
      toast.error('Lỗi mạng khi tải dữ liệu phiếu B2B');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Handle status update
  const handleUpdateStatus = async (
    id: string, 
    newStatus: 'PENDING' | 'CONTACTED' | 'CONTRACTED' | 'CANCELLED',
    customNotes?: string
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateB2bInquiryStatusApi(id, newStatus, customNotes ?? adminNoteInput);
      if (res && res.success && res.data) {
        toast.success(res.message || 'Cập nhật trạng thái phiếu thành công!');
        setInquiries(prev => prev.map(item => item.id === id ? res.data! : item));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry(res.data);
        }
      } else {
        toast.error(res?.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (err) {
      console.error('Lỗi cập nhật B2B:', err);
      toast.error('Lỗi khi cập nhật trạng thái phiếu');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle send response to client
  const handleSendClientResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedInquiry) return;
    if (!clientResponseInput.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi / báo giá gửi cho doanh nghiệp!');
      return;
    }

    setIsSendingResponse(true);
    try {
      const res = await respondB2bInquiryApi(selectedInquiry.id, {
        client_response: clientResponseInput.trim(),
        assigned_staff: assignedStaffInput.trim() || 'Chuyên viên B2B GreenFood',
        send_email: sendEmailCheckbox,
        status: selectedInquiry.status === 'PENDING' ? 'CONTACTED' : selectedInquiry.status,
        admin_notes: adminNoteInput,
      });

      if (res && res.success && res.data) {
        toast.success(res.message || 'Đã gửi phản hồi thành công!');
        setInquiries(prev => prev.map(item => item.id === selectedInquiry.id ? res.data! : item));
        setSelectedInquiry(res.data);
      } else {
        toast.error(res?.message || 'Gửi phản hồi thất bại');
      }
    } catch (err) {
      console.error('Lỗi khi gửi phản hồi B2B:', err);
      toast.error('Lỗi kết nối khi gửi phản hồi');
    } finally {
      setIsSendingResponse(false);
    }
  };

  // Handle delete inquiry
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phiếu [${code}] không? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await deleteB2bInquiryApi(id);
      if (res && res.success) {
        toast.success(res.message || 'Đã xóa phiếu thành công!');
        setInquiries(prev => prev.filter(item => item.id !== id));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
      } else {
        toast.error(res?.message || 'Xóa phiếu thất bại');
      }
    } catch (err) {
      console.error('Lỗi khi xóa phiếu B2B:', err);
      toast.error('Lỗi kết nối khi xóa phiếu');
    }
  };

  // Status badge helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ liên hệ
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Phone size={11} />
            Đã tư vấn
          </span>
        );
      case 'CONTRACTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} />
            Đã ký hợp đồng
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={11} />
            Đã hủy / Không hợp tác
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportCsv = () => {
    if (inquiries.length === 0) {
      toast.error('Không có dữ liệu phiếu B2B để xuất file');
      return;
    }

    const headers = [
      'Mã phiếu',
      'Ngày gửi',
      'Tên doanh nghiệp',
      'Người liên hệ',
      'Số điện thoại',
      'Email',
      'Mã số thuế',
      'Mô hình kinh doanh',
      'Sản lượng dự kiến',
      'Thời gian giao hàng',
      'Nhóm hàng quan tâm',
      'Trạng thái',
      'Chuyên viên phụ trách',
      'Thời gian phản hồi',
      'Nội dung phản hồi',
      'Ghi chú nội bộ admin'
    ];

    const rows = inquiries.map(item => [
      `"${item.inquiry_code}"`,
      `"${item.created_at_human || item.created_at}"`,
      `"${(item.company_name || '').replace(/"/g, '""')}"`,
      `"${(item.contact_name || '').replace(/"/g, '""')}"`,
      `"${item.phone}"`,
      `"${item.email || ''}"`,
      `"${item.tax_id || ''}"`,
      `"${(item.business_type || '').replace(/"/g, '""')}"`,
      `"${(item.estimated_volume || '').replace(/"/g, '""')}"`,
      `"${(item.delivery_time || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(item.categories) ? item.categories.join(', ') : '').replace(/"/g, '""')}"`,
      `"${item.status}"`,
      `"${(item.assigned_staff || '').replace(/"/g, '""')}"`,
      `"${item.responded_at_human || item.responded_at || ''}"`,
      `"${(item.client_response || '').replace(/"/g, '""')}"`,
      `"${(item.admin_notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_Sach_Doi_Tac_B2B_GreenFood_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất thành công ${inquiries.length} hồ sơ B2B ra file Excel/CSV!`);
  };

  // Stats computation
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter(i => i.status === 'PENDING').length;
  const contactedCount = inquiries.filter(i => i.status === 'CONTACTED').length;
  const contractedCount = inquiries.filter(i => i.status === 'CONTRACTED').length;

  return (
    <div className="space-y-6">
      
      {/* HEADER & TOP STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="text-emerald-700" size={28} />
            <span>Khách Sỉ & Doanh Nghiệp (B2B)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý và tiếp nhận các phiếu đăng ký tư vấn sỉ từ nhà hàng, khách sạn và bếp ăn công nghiệp.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download size={14} />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => fetchInquiries(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-600' : ''} />
            <span>{refreshing ? 'Đang đồng bộ...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Hồ Sơ B2B</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ghi nhận từ trang đối tác B2B</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm bg-gradient-to-br from-amber-50/40 to-white">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ Liên Hệ
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1.5">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Cần chuyên viên gọi lại trong 2H</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50/40 to-white">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={13} />
            Đã Tư Vấn & Gửi Mẫu
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1.5">{contactedCount}</div>
          <div className="text-[11px] text-blue-600 mt-1">Đang thử mẫu nông sản</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            Đã Ký Hợp Đồng Cung Ứng
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1.5">{contractedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Đang giao xe lạnh hằng ngày</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: `Chờ liên hệ (${pendingCount})` },
            { id: 'CONTACTED', label: 'Đã tư vấn' },
            { id: 'CONTRACTED', label: 'Đã ký HĐ' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên cty, SĐT, mã..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* INQUIRIES DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold">Đang tải danh sách phiếu đối tác B2B...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Building2 size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Chưa có phiếu đăng ký B2B nào phù hợp</p>
            <p className="text-xs text-slate-400">Các yêu cầu từ form /b2b sẽ xuất hiện ngay tại đây theo thời gian thực.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Mã Phiếu</th>
                  <th className="py-3.5 px-4">Doanh Nghiệp / Khách Hàng</th>
                  <th className="py-3.5 px-4">Liên Hệ & SĐT</th>
                  <th className="py-3.5 px-4">Loại Hình & Nhu Cầu</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Mã phiếu */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {item.inquiry_code}
                      </span>
                    </td>

                    {/* Doanh nghiệp & MST */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{item.company_name}</div>
                      {item.tax_id && (
                        <div className="text-[11px] text-slate-400 mt-0.5">MST: {item.tax_id}</div>
                      )}
                      {item.address && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs" title={item.address}>
                          📍 {item.address}
                        </div>
                      )}
                    </td>

                    {/* Người liên hệ & SĐT */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.contact_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <a 
                          href={`tel:${item.phone}`} 
                          className="font-mono text-emerald-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone size={11} />
                          {item.phone}
                        </a>
                        {item.email && (
                          <a 
                            href={`mailto:${item.email}`} 
                            title={item.email}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <Mail size={12} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Loại hình & Nhu cầu */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="inline-block text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 mb-1">
                        {item.business_type}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        {item.estimated_volume && <span>Khối lượng: <strong>{item.estimated_volume}</strong></span>}
                      </div>
                      {Array.isArray(item.categories) && item.categories.length > 0 && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5" title={item.categories.join(', ')}>
                          📦 {item.categories.join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Thời gian gửi */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {item.created_at_human || item.created_at.split('T')[0]}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInquiry(item);
                            setAdminNoteInput(item.admin_notes || '');
                            setClientResponseInput(item.client_response || '');
                            setAssignedStaffInput(item.assigned_staff || 'Chuyên viên B2B GreenFood');
                            setSendEmailCheckbox(Boolean(item.email));
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Chi tiết & Phản hồi</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.inquiry_code)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Xóa phiếu"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL & ACTION MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedInquiry.company_name}</h3>
                    {renderStatusBadge(selectedInquiry.status)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Mã phiếu: {selectedInquiry.inquiry_code}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block text-emerald-800">
                  Thông Tin Khách Hàng
                </span>
                <div>
                  <span className="text-slate-400">Người đại diện:</span>{' '}
                  <strong className="text-slate-900">{selectedInquiry.contact_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Số điện thoại:</span>{' '}
                  <a href={`tel:${selectedInquiry.phone}`} className="font-bold text-emerald-700 hover:underline">
                    {selectedInquiry.phone}
                  </a>
                </div>
                {selectedInquiry.email && (
                  <div>
                    <span className="text-slate-400">Email:</span>{' '}
                    <a href={`mailto:${selectedInquiry.email}`} className="text-slate-800 hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                )}
                {selectedInquiry.tax_id && (
                  <div>
                    <span className="text-slate-400">Mã số thuế:</span>{' '}
                    <strong className="text-slate-900 font-mono">{selectedInquiry.tax_id}</strong>
                  </div>
                )}
                {selectedInquiry.address && (
                  <div>
                    <span className="text-slate-400">Địa chỉ giao:</span>{' '}
                    <span className="text-slate-800">{selectedInquiry.address}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block text-teal-800">
                  Nhu Cầu Cung Ứng
                </span>
                <div>
                  <span className="text-slate-400">Mô hình:</span>{' '}
                  <strong className="text-slate-900">{selectedInquiry.business_type}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Khối lượng ước tính:</span>{' '}
                  <strong className="text-slate-900">{selectedInquiry.estimated_volume || 'Không rõ'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Khung giờ giao hàng:</span>{' '}
                  <strong className="text-slate-900">{selectedInquiry.delivery_time || 'Trước 6h sáng'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Thời gian tạo:</span>{' '}
                  <span className="text-slate-800">{selectedInquiry.created_at.replace('T', ' ').substring(0, 19)}</span>
                </div>
                {selectedInquiry.contacted_at && (
                  <div>
                    <span className="text-slate-400">Liên hệ lần đầu:</span>{' '}
                    <span className="text-emerald-700 font-semibold">{selectedInquiry.contacted_at.replace('T', ' ').substring(0, 19)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Categories wanted */}
            {Array.isArray(selectedInquiry.categories) && selectedInquiry.categories.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Danh Mục Nông Sản Quan Tâm:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInquiry.categories.map((cat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                      🌿 {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Client Note */}
            {selectedInquiry.note && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-amber-900 block">Ghi chú từ khách hàng:</span>
                <p className="text-amber-800 leading-relaxed">{selectedInquiry.note}</p>
              </div>
            )}

            {/* Client Response & Quotation Section */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Mail size={14} className="text-emerald-700" />
                  Phản Hồi & Báo Giá Chính Thức Gửi Khách Hàng (Client Feedback):
                </span>
                {selectedInquiry.responded_at && (
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Đã gửi: {selectedInquiry.responded_at_human || selectedInquiry.responded_at.split('T')[0]}
                  </span>
                )}
              </div>

              {selectedInquiry.client_response && (
                <div className="p-3 bg-white rounded-xl border border-emerald-200/80 text-emerald-900 leading-relaxed text-xs">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1">
                    Người phụ trách: {selectedInquiry.assigned_staff || 'Chuyên viên B2B GreenFood'}
                  </div>
                  <div className="whitespace-pre-line">{selectedInquiry.client_response}</div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Chuyên viên phụ trách đại diện
                  </label>
                  <input
                    type="text"
                    value={assignedStaffInput}
                    onChange={(e) => setAssignedStaffInput(e.target.value)}
                    placeholder="Ví dụ: Lê Thiều Hưng - Trưởng phòng Khách sỉ"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold text-xs">
                    <input
                      type="checkbox"
                      checked={sendEmailCheckbox}
                      disabled={!selectedInquiry.email}
                      onChange={(e) => setSendEmailCheckbox(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span>
                      Gửi Email thông báo tự động {selectedInquiry.email ? `(${selectedInquiry.email})` : '(Khách không để lại email)'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nội dung phản hồi / Báo giá sỉ gửi cho khách:
                </label>
                <textarea
                  rows={4}
                  value={clientResponseInput}
                  onChange={(e) => setClientResponseInput(e.target.value)}
                  placeholder="Ví dụ: Kính gửi quý công ty, GreenFood xin gửi mức chiết khấu 18% cho đơn hàng rau củ VietGAP. Xe lạnh giao trước 5h30 sáng tại địa chỉ..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isSendingResponse}
                  onClick={handleSendClientResponse}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{isSendingResponse ? 'Đang gửi...' : 'Lưu & Gửi Phản Hồi Cho Doanh Nghiệp'}</span>
                </button>
              </div>
            </div>

            {/* Admin Notes Section */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">
                Ghi Chú Nội Bộ Của Chuyên Viên B2B (Admin Notes - Chỉ nội bộ nhìn thấy):
              </label>
              <textarea
                rows={2}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Ví dụ: Khách này yêu cầu công nợ 20 ngày, sếp duyệt chiết khấu 18%..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Phone size={13} />
                  <span>Gọi {selectedInquiry.phone}</span>
                </a>

                {selectedInquiry.email && (
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=GreenFood - Báo giá sỉ cho ${encodeURIComponent(selectedInquiry.company_name)}`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5"
                  >
                    <Mail size={13} />
                    <span>Gửi Email Báo Giá</span>
                  </a>
                )}
              </div>

              {/* Status Update Quick Toggles */}
              <div className="flex items-center gap-2">
                {selectedInquiry.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'CONTACTED')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Phone size={13} />
                    <span>Đánh dấu Đã Tư Vấn</span>
                  </button>
                )}

                {selectedInquiry.status !== 'CONTRACTED' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'CONTRACTED')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} />
                    <span>Xác Nhận Ký Hợp Đồng</span>
                  </button>
                )}

                {selectedInquiry.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'CANCELLED')}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle size={13} />
                    <span>Từ chối</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedInquiry.id, selectedInquiry.status, adminNoteInput)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Edit3 size={13} />
                  <span>Lưu ghi chú</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
