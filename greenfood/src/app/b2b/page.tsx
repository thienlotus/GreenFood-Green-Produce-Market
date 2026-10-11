"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, ChevronRight, CheckCircle2, ShieldCheck, FileSpreadsheet, 
  Truck, Receipt, PhoneCall, Send, ArrowRight, Award, Users, Clock, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function B2BPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    contactName: '',
    phone: '',
    email: '',
    businessType: 'Nhà hàng / Quán ăn',
    dailyVolume: '50kg - 200kg / ngày',
    categories: ['Rau lá & Củ quả VietGAP'] as string[],
    deliveryTime: 'Trước 06:00 sáng',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.phone.trim() || !formData.contactName.trim()) {
      toast.error('Vui lòng điền đầy đủ tên doanh nghiệp, người liên hệ và số điện thoại!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Đã gửi thông tin đăng ký đối tác B2B thành công! Chuyên viên GreenFood sẽ liên hệ lại trong vòng 2 giờ.');
    }, 800);
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

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-12">
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

        {/* 2-COLUMNS: REGISTRATION FORM & COOPERATION PROCESS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FORM ĐĂNG KÝ B2B */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
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
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">Gửi Hồ Sơ B2B Thành Công!</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Cảm ơn <strong>{formData.companyName}</strong> đã tin tưởng GreenFood. Đội ngũ phụ trách khối Doanh nghiệp sẽ chuẩn bị mẫu thử và liên hệ với anh/chị qua số điện thoại <strong>{formData.phone}</strong> trong vòng 2 giờ làm việc.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Gửi thêm yêu cầu khác
                </button>
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
