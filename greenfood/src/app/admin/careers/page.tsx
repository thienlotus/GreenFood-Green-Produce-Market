"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, Search, Filter, Phone, Mail, FileText, CheckCircle2, 
  Clock, XCircle, UserCheck, Eye, Trash2, RefreshCw, X, Save, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getAdminJobApplicationsApi, 
  updateAdminJobApplicationStatusApi, 
  deleteAdminJobApplicationApi, 
  JobApplicationItem 
} from '@/lib/api';

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<JobApplicationItem | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('PENDING');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminJobApplicationsApi({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchTerm || undefined,
      });
      if (res && res.success) {
        setApplications(res.data || []);
      }
    } catch {
      toast.error('Không thể tải danh sách hồ sơ tuyển dụng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    interviewing: applications.filter(a => a.status === 'INTERVIEWING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case 'INTERVIEWING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            <MessageSquare size={12} /> Đang phỏng vấn
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
            <CheckCircle2 size={12} /> Đã nhận việc
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">
            <XCircle size={12} /> Không phù hợp
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

  const handleOpenModal = (app: JobApplicationItem) => {
    setSelectedApp(app);
    setEditingStatus(app.status);
    setAdminNotes(app.admin_notes || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedApp) return;
    setIsUpdating(true);
    try {
      const res = await updateAdminJobApplicationStatusApi(selectedApp.id, {
        status: editingStatus,
        admin_notes: adminNotes,
      });
      if (res && res.success) {
        toast.success('Cập nhật trạng thái hồ sơ thành công!');
        setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: editingStatus as any, admin_notes: adminNotes } : a));
        setSelectedApp(null);
      } else {
        toast.error('Cập nhật thất bại, vui lòng thử lại.');
      }
    } catch {
      toast.error('Lỗi kết nối khi cập nhật hồ sơ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ ứng viên "${name}"?`)) return;
    try {
      const res = await deleteAdminJobApplicationApi(id);
      if (res && res.success) {
        toast.success(`Đã xóa hồ sơ của ${name}`);
        setApplications(prev => prev.filter(a => a.id !== id));
      } else {
        toast.error('Không thể xóa hồ sơ');
      }
    } catch {
      toast.error('Lỗi khi xóa hồ sơ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Briefcase size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Tuyển Dụng & Nhân Sự</h1>
              <p className="text-sm text-gray-500">Tiếp nhận hồ sơ ứng tuyển từ website GreenFood</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => fetchApplications()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng hồ sơ</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Chờ xem xét</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Đang phỏng vấn</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{stats.interviewing}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Đã trúng tuyển</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{stats.accepted}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm theo họ tên, số điện thoại, vị trí hoặc email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'PENDING', label: 'Chờ duyệt' },
              { key: 'INTERVIEWING', label: 'Phỏng vấn' },
              { key: 'ACCEPTED', label: 'Trúng tuyển' },
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

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ứng Viên</th>
                <th className="py-3.5 px-4">Vị Trí Ứng Tuyển</th>
                <th className="py-3.5 px-4">Kinh Nghiệm / Giới Thiệu</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Nộp</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-emerald-600" size={18} />
                      Đang tải dữ liệu hồ sơ ứng tuyển...
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <Briefcase className="mx-auto text-gray-300 mb-2" size={36} />
                    <p className="font-medium">Chưa có hồ sơ ứng tuyển nào phù hợp với bộ lọc</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/60 transition group">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-gray-900">{app.candidate_name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <a href={`tel:${app.phone}`} className="hover:text-emerald-600 transition flex items-center gap-1 font-medium">
                            <Phone size={11} /> {app.phone}
                          </a>
                          <span>•</span>
                          <a href={`mailto:${app.email}`} className="hover:text-emerald-600 transition flex items-center gap-1">
                            <Mail size={11} /> {app.email}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800 text-xs bg-gray-100 px-2.5 py-1 rounded-md inline-block">
                        {app.job_title}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-gray-700 line-clamp-1 font-medium">
                        {app.experience || 'Chưa cập nhật kinh nghiệm'}
                      </p>
                      {app.intro && (
                        <p className="text-[11px] text-gray-500 line-clamp-1 italic mt-0.5">
                          &ldquo;{app.intro}&rdquo;
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString('vi-VN', {
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
                          onClick={() => handleOpenModal(app)}
                          title="Xem chi tiết & Cập nhật"
                          className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Eye size={17} />
                        </button>
                        <a
                          href={`tel:${app.phone}`}
                          title="Gọi ứng viên"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Phone size={17} />
                        </a>
                        <button
                          onClick={() => handleDelete(app.id, app.candidate_name)}
                          title="Xóa hồ sơ"
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

      {/* Detail / Update Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedApp.candidate_name}</h3>
                  <p className="text-xs text-gray-500">Ứng tuyển vị trí: <strong className="text-emerald-700">{selectedApp.job_title}</strong></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-gray-500">Số điện thoại:</span>
                  <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                    {selectedApp.phone}
                    <a href={`tel:${selectedApp.phone}`} className="text-emerald-600 hover:underline">Gọi điện</a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                    {selectedApp.email}
                    <a href={`mailto:${selectedApp.email}`} className="text-emerald-600 hover:underline">Gửi mail</a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Thời gian ứng tuyển:</span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {new Date(selectedApp.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Link hồ sơ / CV:</span>
                  <p className="font-medium text-emerald-700 mt-0.5 truncate">
                    {selectedApp.cv_url ? (
                      <a href={selectedApp.cv_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        <FileText size={12} /> Xem CV online
                      </a>
                    ) : (
                      'Nộp thông tin trực tiếp'
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kinh nghiệm làm việc</h4>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-800 leading-relaxed border border-gray-100">
                  {selectedApp.experience || 'Không cung cấp chi tiết'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Thư ngỏ / Giới thiệu bản thân</h4>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 leading-relaxed italic border border-gray-100">
                  &ldquo;{selectedApp.intro || 'Không có ghi chú thêm'}&rdquo;
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Trạng thái hồ sơ
                  </label>
                  <select 
                    value={editingStatus}
                    onChange={e => setEditingStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PENDING">Chờ xem xét (PENDING)</option>
                    <option value="INTERVIEWING">Mời phỏng vấn (INTERVIEWING)</option>
                    <option value="ACCEPTED">Đã nhận việc / Trúng tuyển (ACCEPTED)</option>
                    <option value="REJECTED">Không phù hợp / Từ chối (REJECTED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ghi chú nội bộ nhân sự
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Ghi lại lịch hẹn phỏng vấn, đánh giá kỹ năng chuyên môn..."
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
                onClick={() => setSelectedApp(null)}
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
                <Save size={14} /> {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
