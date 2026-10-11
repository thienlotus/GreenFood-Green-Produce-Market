"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, ChevronRight, CheckCircle2, ShieldCheck, FileSpreadsheet, 
  Truck, Receipt, PhoneCall, Send, Award, Clock, Sparkles, Copy, Check,
  Search, MessageSquare, AlertCircle, RefreshCw, Mail, Calendar, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createB2bInquiryApi, trackB2bInquiriesApi, B2bInquiryItem } from '@/lib/api';

export default function B2BPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'track'>('register');

  // Form Đăng ký
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    contactName: '',
    phone: '',
    email: '',
    businessType: 'Nhà hàng / Quán ăn cao cấp',
    dailyVolume: '50kg - 200kg / ngày',
    categories: ['Rau lá & Củ quả VietGAP'] as string[],
    deliveryTime: 'Trước 06:00 sáng',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Tra cứu hồ sơ
  const [trackKeyword, setTrackKeyword] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  const [trackedResults, setTrackedResults] = useState<B2bInquiryItem[]>([]);

  const businessTypes = [
    'Nhà hàng / Quán ăn cao cấp',
    'Khách sạn / Khu nghỉ dưỡng (Resort)',
    'Bếp ăn trường học / Bệnh viện',
    'Bếp ăn công nghiệp / Nhà máy',
    'Chuỗi siêu thị / Cửa hàng thực phẩm sạch',
    'Đại lý / Nhà phân phối cấp 1'
  ];

  const categoryOptions = [
    'Rau lá & Củ quả VietGAP',
    'Trái cây tươi theo mùa vụ',
    'Nấm tươi & Nấm dược liệu hữu cơ',
    'Trà, Cà phê & Hạt dinh dưỡng mộc',
    'Gia vị tươi & Thảo mộc miệt vườn',
    'Đặc sản OCOP 4-5 sao các vùng miền'
  ];

  const handleToggleCategory = (cat: string) => {
    setFormData(prev => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        return { ...prev, categories: prev.categories.filter(c => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.phone.trim() || !formData.contactName.trim()) {
      toast.error('Vui lòng điền đầy đủ tên doanh nghiệp, người liên hệ và số điện thoại!');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!/^(0|\+?84)[35789][0-9]{8}$/.test(cleanPhone)) {
      toast.error('Số điện thoại không hợp lệ (cần 10 chữ số di động Việt Nam)!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createB2bInquiryApi({
        company_name: formData.companyName.trim(),
        contact_name: formData.contactName.trim(),
        phone: cleanPhone,
        email: formData.email.trim() || undefined,
        tax_id: formData.taxId.trim() || undefined,
        business_type: formData.businessType,
        categories: formData.categories,
        estimated_volume: formData.dailyVolume,
        delivery_time: formData.deliveryTime,
        note: formData.notes.trim() || undefined,
      });

      if (res && res.success) {
        const code = res.data?.inquiry_code || 'B2B-RECEIVED';
        setIsSubmitted(true);
        setSubmittedCode(code);
        toast.success(res.message || 'Đã gửi hồ sơ đăng ký B2B thành công tới Ban Quản Trị!');
      } else {
        toast.error(res?.message || 'Có lỗi xảy ra khi gửi hồ sơ B2B, vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Lỗi khi gửi hồ sơ B2B:', err);
      toast.error('Lỗi kết nối máy chủ khi gửi hồ sơ B2B!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (keywordToTrack?: string) => {
    const kw = (keywordToTrack !== undefined ? keywordToTrack : trackKeyword).trim();
    if (!kw) {
      toast.error('Vui lòng nhập Mã phiếu (B2B-...) hoặc Số điện thoại để tra cứu!');
      return;
    }

    setIsTracking(true);
    try {
      const res = await trackB2bInquiriesApi(kw);
      setHasTracked(true);
      if (res && res.success) {
        setTrackedResults(res.data || []);
        if (res.data && res.data.length > 0) {
          toast.success(`Tìm thấy ${res.data.length} hồ sơ liên quan!`);
        } else {
          toast.error('Không tìm thấy hồ sơ nào khớp với thông tin đã nhập.');
        }
      } else {
        setTrackedResults([]);
        toast.error(res?.message || 'Không tìm thấy hồ sơ phù hợp.');
      }
    } catch (err) {
      console.error('Lỗi tra cứu hồ sơ B2B:', err);
      toast.error('Lỗi kết nối khi tra cứu hồ sơ!');
    } finally {
      setIsTracking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={12} /> Đang Tiếp Nhận
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <PhoneCall size={12} /> Đang Thẩm Định & Khảo Sát
          </span>
        );
      case 'CONTRACTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={12} /> Đã Báo Giá & Ký Hợp Đồng
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            Đã Đóng Hồ Sơ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Khách Hàng Doanh Nghiệp & Mua Sỉ B2B</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-10">
        {/* HERO BANNER B2B */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white p-8 sm:p-12 shadow-xl border border-emerald-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Building2 size={14} /> Giải Pháp Chuỗi Cung Ứng Nông Sản Sạch
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Cung Cấp Nông Sản VietGAP Số Lượng Lớn Cho Doanh Nghiệp & Nhà Hàng
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Giải pháp toàn diện từ vườn đến bếp ăn doanh nghiệp: Báo giá sỉ ổn định theo kỳ, nguồn hàng dồi dào thu hoạch trong ngày, đầy đủ hóa đơn VAT điện tử và kiểm định an toàn vệ sinh thực phẩm.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-amber-400" /> Chiết khấu lên đến 25%
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-amber-400" /> Hóa đơn VAT điện tử
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-amber-400" /> Xe lạnh giao trước 6h sáng
              </span>
            </div>
          </div>
        </div>

        {/* 4 CORE BENEFITS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Receipt size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Hóa Đơn VAT Điện Tử</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Xuất hóa đơn GTGT điện tử nhanh chóng, hợp lệ 100% giúp kế toán doanh nghiệp dễ dàng kê khai và quyết toán chi phí.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Chuẩn VietGAP & ATVSTP</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cung cấp trọn bộ hồ sơ kiểm định an toàn thực phẩm, giấy xét nghiệm dư lượng thuốc BVTV định kỳ cho từng lô hàng.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Truck size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Giao Xe Lạnh Chuyên Dụng</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vận chuyển bằng xe tải lạnh thùng kín chuyên dụng, duy trì độ tươi ngon 100% và giao đúng khung giờ hẹn trước mỗi sáng.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Chính Sách Công Nợ Linh Hoạt</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hỗ trợ kỳ hạn thanh toán linh hoạt 15 - 30 ngày cho đối tác doanh nghiệp ký hợp đồng cung ứng nông sản dài hạn.
            </p>
          </div>
        </div>

        {/* 2-COLUMNS: MAIN INTERACTION & COOPERATION PROCESS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT CHÍNH: TAB ĐĂNG KÝ VÀ TAB TRA CỨU TIẾN ĐỘ / PHẢN HỒI */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            
            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Send size={15} />
                <span>Đăng Ký Tư Vấn & Báo Giá Sỉ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'track'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search size={15} />
                <span>Tra Cứu Hồ Sơ & Xem Phản Hồi</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950">24/7</span>
              </button>
            </div>

            {/* TAB 1: FORM ĐĂNG KÝ */}
            {activeTab === 'register' && (
              <div>
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Nhận Báo Giá Sỉ & Mẫu Thử
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">Đăng Ký Tư Vấn Doanh Nghiệp</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Điền thông tin bên dưới để chuyên viên B2B của GreenFood gửi bảng giá chiết khấu mới nhất trong ngày.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="p-8 text-center bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-950">Tiếp Nhận Hồ Sơ B2B Thành Công!</h3>

                    {submittedCode && (
                      <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-sm">
                        <span className="text-xs text-slate-500 font-medium">Mã phiếu đối soát:</span>
                        <span className="font-mono font-bold text-emerald-800 text-sm">{submittedCode}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(submittedCode);
                              setHasCopiedCode(true);
                              toast.success('Đã sao chép mã phiếu B2B!');
                              setTimeout(() => setHasCopiedCode(false), 2000);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                          title="Sao chép mã"
                        >
                          {hasCopiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-emerald-900 max-w-md mx-auto leading-relaxed">
                      Cảm ơn <strong>{formData.companyName}</strong> đã gửi yêu cầu. Thông tin phiếu đã được chuyển trực tiếp tới <strong>Ban Quản Trị Viên (Admin)</strong>. Quý đối tác có thể bấm nút bên dưới để theo dõi trạng thái xử lý và xem phản hồi của admin bất cứ lúc nào.
                    </p>

                    <div className="pt-2 flex flex-wrap gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setTrackKeyword(submittedCode);
                          setActiveTab('track');
                          handleTrack(submittedCode);
                        }}
                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Search size={14} />
                        <span>Xem Tiến Độ & Phản Hồi Ngay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            companyName: '',
                            taxId: '',
                            contactName: '',
                            phone: '',
                            email: '',
                            businessType: 'Nhà hàng / Quán ăn cao cấp',
                            dailyVolume: '50kg - 200kg / ngày',
                            categories: ['Rau lá & Củ quả VietGAP'],
                            deliveryTime: 'Trước 06:00 sáng',
                            notes: '',
                          });
                        }}
                        className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                      >
                        Gửi thêm hồ sơ khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Tên Doanh Nghiệp / Nhà Hàng <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="Ví dụ: Công ty CP Bếp Ăn Hoa Sen"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Mã số thuế (nếu có)</label>
                        <input
                          type="text"
                          value={formData.taxId}
                          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                          placeholder="0101234567"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Người liên hệ <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          placeholder="Nguyễn Văn A"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Số điện thoại <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                          placeholder="0912345678"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Email nhận báo giá</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="muahang@congty.com"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Mô hình hoạt động</label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs cursor-pointer"
                        >
                          {businessTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Sản lượng dự kiến</label>
                        <select
                          value={formData.dailyVolume}
                          onChange={(e) => setFormData({ ...formData, dailyVolume: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs cursor-pointer"
                        >
                          <option value="Dưới 50kg / ngày">Dưới 50kg / ngày</option>
                          <option value="50kg - 200kg / ngày">50kg - 200kg / ngày</option>
                          <option value="200kg - 500kg / ngày">200kg - 500kg / ngày</option>
                          <option value="Trên 500kg / ngày (Khối lượng lớn)">Trên 500kg / ngày (Khối lượng lớn)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Nhóm mặt hàng nông sản quan tâm (chọn nhiều mục)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categoryOptions.map((cat) => {
                          const isChecked = formData.categories.includes(cat);
                          return (
                            <label
                              key={cat}
                              onClick={() => handleToggleCategory(cat)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-[11px]">{cat}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ghi chú yêu cầu đặc biệt</label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Ví dụ: Cần rau củ sơ chế sẵn gọt vỏ, giao hàng trước 05:30 sáng hằng ngày tại Quận 1..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      <span>{isSubmitting ? 'Đang gửi thông tin...' : 'Gửi Đăng Ký Nhận Báo Giá Sỉ Ngay'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: TRA CỨU HỒ SƠ & PHẢN HỒI ADMIN */}
            {activeTab === 'track' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    Cổng Tra Cứu Trực Tuyến 24/7
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">Tra Cứu Tiến Độ & Phản Hồi B2B</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Nhập <strong>Mã phiếu đối soát</strong> (ví dụ: <code className="text-emerald-700 font-mono">B2B-20261011-9721</code>) hoặc <strong>Số điện thoại</strong> đã đăng ký để xem trực tiếp phản hồi, báo giá từ chuyên viên GreenFood.
                  </p>
                </div>

                {/* THANH TÌM KIẾM */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTrack();
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={trackKeyword}
                      onChange={(e) => setTrackKeyword(e.target.value)}
                      placeholder="Nhập mã phiếu (B2B-...) hoặc số điện thoại..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-medium"
                    />
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <button
                    type="submit"
                    disabled={isTracking}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    {isTracking ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                    <span>Tra Cứu</span>
                  </button>
                </form>

                {/* DANH SÁCH KẾT QUẢ TRA CỨU */}
                {isTracking && (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                    <span>Đang tìm kiếm hồ sơ từ hệ thống quản trị GreenFood...</span>
                  </div>
                )}

                {!isTracking && hasTracked && trackedResults.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <AlertCircle size={32} className="mx-auto text-amber-500" />
                    <h4 className="font-bold text-slate-800 text-sm">Không Tìm Thấy Hồ Sơ Nào</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Không tìm thấy phiếu đăng ký nào khớp với từ khóa <strong>"{trackKeyword}"</strong>. Vui lòng kiểm tra lại chính xác mã phiếu hoặc số điện thoại người liên hệ.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      Đăng ký hồ sơ mới ngay <ArrowRight size={12} />
                    </button>
                  </div>
                )}

                {!isTracking && trackedResults.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold border-b pb-2">
                      <span>Tìm thấy <strong>{trackedResults.length}</strong> hồ sơ:</span>
                      <span className="text-[11px] text-slate-400">Cập nhật theo thời gian thực</span>
                    </div>

                    {trackedResults.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 transition-all hover:border-emerald-300"
                      >
                        {/* HEADER PHIẾU */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-900 text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                {item.inquiry_code}
                              </span>
                              <span className="text-xs text-slate-400">• {item.created_at_human || item.created_at}</span>
                            </div>
                            <h3 className="font-black text-slate-900 text-base mt-1.5">{item.company_name}</h3>
                          </div>
                          <div>
                            {getStatusBadge(item.status)}
                          </div>
                        </div>

                        {/* TIẾN TRÌNH XỬ LÝ (STEPPER) */}
                        <div className="py-2">
                          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                            <div className="space-y-1.5">
                              <div className="w-7 h-7 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                1
                              </div>
                              <span className="font-bold text-emerald-900 block">Đã Tiếp Nhận</span>
                              <span className="text-[10px] text-slate-400">Hệ thống đã lưu</span>
                            </div>

                            <div className="space-y-1.5">
                              <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                                item.client_response || item.status === 'CONTACTED' || item.status === 'CONTRACTED'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                2
                              </div>
                              <span className={`font-bold block ${
                                item.client_response || item.status === 'CONTACTED' || item.status === 'CONTRACTED'
                                  ? 'text-emerald-900'
                                  : 'text-slate-400'
                              }`}>
                                Thẩm Định & Báo Giá
                              </span>
                              <span className="text-[10px] text-slate-400">Khảo sát & chiết khấu</span>
                            </div>

                            <div className="space-y-1.5">
                              <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                                item.status === 'CONTRACTED'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                3
                              </div>
                              <span className={`font-bold block ${
                                item.status === 'CONTRACTED' ? 'text-emerald-900' : 'text-slate-400'
                              }`}>
                                Ký Hợp Đồng & Cung Ứng
                              </span>
                              <span className="text-[10px] text-slate-400">Giao hàng hằng ngày</span>
                            </div>
                          </div>
                        </div>

                        {/* KHỐI PHẢN HỒI CHÍNH THỨC CỦA ADMIN (TRỌNG TÂM) */}
                        {item.client_response ? (
                          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-400/90 rounded-2xl p-5 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                                  <MessageSquare size={16} />
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-emerald-950 text-sm">
                                    Thông Điệp & Báo Giá Chính Thức Từ GreenFood
                                  </h4>
                                  <p className="text-[11px] text-emerald-700">
                                    Chuyên viên phụ trách: <strong>{item.assigned_staff || 'Ban Chuyên Trách B2B GreenFood'}</strong>
                                  </p>
                                </div>
                              </div>
                              {item.responded_at_human && (
                                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300">
                                  {item.responded_at_human}
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/95 p-4 rounded-xl border border-emerald-200 shadow-inner">
                              {item.client_response}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                              <span className="text-slate-600 text-[11px] font-medium">
                                Quý đối tác cần chốt nhanh danh mục hoặc mẫu thử?
                              </span>
                              <div className="flex gap-2">
                                <a
                                  href="tel:02877702614"
                                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <PhoneCall size={12} /> Gọi Hotline 24/7
                                </a>
                                <a
                                  href={`mailto:b2b@greenfood.vn?subject=Phan hoi bao gia ${item.inquiry_code} - ${item.company_name}`}
                                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-emerald-800 font-bold text-[11px] border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
                                >
                                  <Mail size={12} /> Gửi Email Lại
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-950">
                            <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-1">
                              <p className="font-bold">Đang Lập Báo Giá Chiết Khấu Ưu Đãi</p>
                              <p className="text-[11px] text-amber-800 leading-relaxed">
                                Hồ sơ đã được ghi nhận vào hệ thống. Chuyên viên khối Khách sỉ & Doanh nghiệp đang tổng hợp báo giá sỉ tốt nhất. Quý doanh nghiệp sẽ nhận được email báo giá và phản hồi chi tiết tại đây trong tối đa 2 giờ làm việc.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* THÔNG TIN CHI TIẾT NHU CẦU ĐÃ GỬI */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Người liên hệ:</span>
                            <span className="font-semibold text-slate-800">{item.contact_name} ({item.phone})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Mô hình & Sản lượng:</span>
                            <span className="font-semibold text-slate-800">{item.business_type} • {item.estimated_volume}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400 block text-[11px] mb-1">Nhóm hàng nông sản:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.categories.map((c, idx) => (
                                <span key={idx} className="bg-white px-2 py-0.5 rounded-md border text-[11px] text-slate-700">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                          {item.note && (
                            <div className="sm:col-span-2">
                              <span className="text-slate-400 block text-[11px]">Ghi chú yêu cầu:</span>
                              <span className="italic text-slate-700">{item.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QUY TRÌNH HỢP TÁC 4 BƯỚC & LIÊN HỆ TRỰC TIẾP */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock size={20} className="text-emerald-700" />
                <span>Quy Trình Hợp Tác B2B Trong 24H</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 block text-xs">Tiếp nhận nhu cầu & Khảo sát thực tế</strong>
                    <p className="text-slate-500 mt-0.5">Chuyên viên liên hệ lấy danh mục sản phẩm, sản lượng và tiêu chuẩn đóng gói yêu cầu.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 block text-xs">Gửi mẫu thử miễn phí & Bảng giá sỉ</strong>
                    <p className="text-slate-500 mt-0.5">Cung cấp mẫu thử nông sản tận bếp để đầu bếp kiểm định chất lượng độ tươi giòn.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900 block text-xs">Ký hợp đồng & Thiết lập hạn mức công nợ</strong>
                    <p className="text-slate-500 mt-0.5">Thống nhất khung giờ giao hàng hằng ngày và cơ chế xuất hóa đơn VAT điện tử.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">4</span>
                  <div>
                    <strong className="text-slate-900 block text-xs">Vận hành giao xe lạnh hằng ngày</strong>
                    <p className="text-slate-500 mt-0.5">Đơn hàng được sơ chế, bảo quản lạnh và bàn giao đúng giờ hẹn trước mỗi ca nấu.</p>
                  </div>
                </div>
              </div>

              {/* HOTLINE HỖ TRỢ TRỰC TIẾP */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">Hotline Khối B2B 24/7</span>
                  <div className="text-base font-extrabold text-amber-950 mt-0.5">028 7770 2614</div>
                  <span className="text-[11px] text-amber-800">Email: b2b@greenfood.vn</span>
                </div>
                <a
                  href="tel:02877702614"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <PhoneCall size={14} />
                  <span>Gọi Ngay</span>
                </a>
              </div>
            </div>

            {/* BOX CAM KẾT CHẤT LƯỢNG */}
            <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-md border border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles size={16} />
                <span>Cam Kết Bảo Hành Tươi Ngon B2B</span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Nếu bất kỳ món nông sản nào giao đến không đạt chuẩn tươi giòn như mẫu thẩm định ban đầu, GreenFood đổi mới ngay lập tức trong vòng 45 phút hoặc giảm trừ 100% chi phí vào hóa đơn.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
