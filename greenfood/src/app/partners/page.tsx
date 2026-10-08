"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Handshake, Sprout, TrendingUp, DollarSign, CheckCircle2, 
  Send, ShieldCheck, Award, FileText, CheckSquare, Sparkles, Building2,
  Tractor, Scale, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { registerFarmerApi } from '@/lib/api';

export default function PartnersPage() {
  const [partnerType, setPartnerType] = useState<'farmer' | 'supplier'>('farmer');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    tax_id: '',
    certifications: ['VietGAP'] as string[],
    cert_code: '',
    farm_area: '',
    farming_method: 'Hữu cơ tự nhiên & Sinh thái',
    experience_years: '',
    scale: '',
    proof_document: '',
    note: '',
    is_committed: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCerts = [
    { id: 'VietGAP', label: 'Tiêu chuẩn VietGAP' },
    { id: 'GlobalGAP', label: 'Tiêu chuẩn GlobalGAP' },
    { id: 'Organic', label: 'Hữu cơ Organic / Sinh học' },
    { id: 'OCOP', label: 'OCOP 3 - 5 Sao' },
    { id: 'ATTP', label: 'Chứng nhận An Toàn Thực Phẩm' },
    { id: 'ISO22000', label: 'Chuẩn ISO 22000 / HACCP' }
  ];

  const handleToggleCert = (certId: string) => {
    setFormData(prev => {
      const exists = prev.certifications.includes(certId);
      if (exists) {
        return { ...prev, certifications: prev.certifications.filter(c => c !== certId) };
      } else {
        return { ...prev, certifications: [...prev.certifications, certId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng nhập họ tên / tên nông trại và số điện thoại liên hệ!');
      return;
    }
    if (!formData.is_committed) {
      toast.error('Vui lòng tích cam kết chất lượng nông sản an toàn trước khi gửi hồ sơ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerFarmerApi({
        farm_name: formData.name.trim(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.location.trim() || undefined,
        location: formData.location.trim() || undefined,
        scale: formData.scale.trim() || undefined,
        specialty: formData.certifications.length > 0 ? `Chuẩn ${formData.certifications.join(', ')}` : 'Nông sản hữu cơ',
        note: formData.note.trim() || undefined,
        tax_id: formData.tax_id.trim() || undefined,
        certifications: formData.certifications,
        cert_code: formData.cert_code.trim() || undefined,
        farm_area: formData.farm_area.trim() || undefined,
        farming_method: formData.farming_method,
        experience_years: formData.experience_years.trim() || undefined,
        proof_document: formData.proof_document.trim() || undefined
      });

      if (res && res.success) {
        // Lưu thông báo cho Admin Notification Center kiểm duyệt
        if (typeof window !== 'undefined') {
          const reqItem = {
            farmerId: res.data?.id || `req_${Date.now()}`,
            farmName: formData.name.trim(),
            ownerPhone: formData.phone.trim(),
            certifications: formData.certifications,
            certCode: formData.cert_code.trim(),
            farmArea: formData.farm_area.trim(),
            taxId: formData.tax_id.trim(),
            updatedAt: new Date().toISOString(),
            status: 'pending'
          };
          const existing = JSON.parse(localStorage.getItem('gf_admin_farmer_requests') || '[]');
          localStorage.setItem('gf_admin_farmer_requests', JSON.stringify([reqItem, ...existing]));
        }

        toast.success(res.message || 'Đăng ký đối tác nông hộ thành công! Hồ sơ đã gửi đến ban quản trị thẩm định.');
        setFormData({
          name: '',
          phone: '',
          email: '',
          location: '',
          tax_id: '',
          certifications: ['VietGAP'],
          cert_code: '',
          farm_area: '',
          farming_method: 'Hữu cơ tự nhiên & Sinh thái',
          experience_years: '',
          scale: '',
          proof_document: '',
          note: '',
          is_committed: true
        });
      } else {
        toast.error(res?.message || 'Có lỗi xảy ra khi gửi đăng ký');
      }
    } catch {
      toast.error('Lỗi mạng khi gửi thông tin đối tác');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Đầu Ra Ổn Định & Dài Hạn",
      desc: "Ký kết hợp đồng bao tiêu nông sản theo mùa vụ, giá cả minh bạch và ổn định, không lo 'được mùa mất giá'."
    },
    {
      icon: DollarSign,
      title: "Thanh Toán Nhanh Chóng",
      desc: "Quy trình đối soát linh hoạt, thanh toán sòng phẳng qua tài khoản ngân hàng trong vòng 3 - 5 ngày làm việc."
    },
    {
      icon: Sprout,
      title: "Hỗ Trợ Kỹ Thuật Nông Nghiệp",
      desc: "Đội ngũ kỹ sư nông nghiệp GreenFood đồng hành tư vấn quy trình VietGAP, cung ứng vật tư đạt chuẩn chất lượng cao."
    },
    {
      icon: ShieldCheck,
      title: "Xây Dựng Thương Hiệu Nông Hộ",
      desc: "Sản phẩm được dán tem định danh nguồn gốc, xuất hiện trên bản đồ số nhà vườn tiếp cận hàng vạn khách hàng cả nước."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Hợp tác cùng GreenFood</span>
        </div>
      </div>

      {/* Hero */}
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 text-white rounded-3xl p-8 lg:p-14 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="bg-amber-400 text-emerald-950 text-xs uppercase px-3 py-1 rounded-full font-extrabold tracking-wider inline-block mb-3 shadow-xs">
              Mạng Lưới Nông Nghiệp Sạch & Minh Bạch
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Đồng Hành Cùng GreenFood
            </h1>
            <p className="text-emerald-100 text-base lg:text-lg leading-relaxed mb-6">
              Dành cho Nông Hộ, Hợp Tác Xã canh tác an toàn và Doanh nghiệp cung ứng nông sản sạch trên toàn quốc.
            </p>
            <a 
              href="#partner-form" 
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2 text-sm"
            >
              Đăng ký mở gian hàng đối tác <ChevronRight size={16} />
            </a>
          </div>
          <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white/10 rounded-3xl flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-md">
            <Handshake size={80} className="text-amber-300" />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Lợi Ích Khi Hợp Tác Cùng GreenFood</h2>
          <p className="text-gray-600">Chúng tôi cam kết mối quan hệ hợp tác cùng có lợi, bền vững và tôn trọng công sức người nông dân.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Section */}
      <div id="partner-form" className="container mx-auto px-4 lg:px-8 max-w-4xl mb-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-gray-200">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-2 border border-emerald-200">
              <Sparkles size={14} /> Thẩm định & Xác minh năng lực
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Đăng Ký Hồ Sơ Đối Tác Nông Hộ</h2>
            <p className="text-sm text-gray-600">
              Cung cấp thông tin năng lực canh tác để chuyên viên thu mua và kỹ sư GreenFood liên hệ thẩm định thực địa trong 24 giờ làm việc.
            </p>
          </div>

          {/* Type selector: Chỉ giữ Nông hộ/HTX và Nhà cung cấp, xóa bỏ Cộng tác viên (CTV) */}
          <div className="flex rounded-2xl bg-gray-100 p-1.5 mb-8 max-w-md mx-auto border border-gray-200">
            <button 
              type="button"
              onClick={() => setPartnerType('farmer')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                partnerType === 'farmer' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Tractor size={16} /> Nông Hộ / Hợp Tác Xã
            </button>
            <button 
              type="button"
              onClick={() => setPartnerType('supplier')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                partnerType === 'supplier' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 size={16} /> Nhà Cung Cấp
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NHÓM 1: THÔNG TIN PHÁP LÝ & ĐẠI DIỆN */}
            <div className="bg-gray-50/70 p-5 sm:p-6 rounded-2xl border border-gray-200/80 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={17} className="text-emerald-700" />
                1. Thông tin pháp lý & Liên hệ đại diện
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tên Nông Trại / Tên Hợp Tác Xã <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ví dụ: Nông Trại Hữu Cơ An Nhiên / HTX Bưởi Da Xanh"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Số điện thoại liên hệ chính thức <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912 345 678"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email liên hệ / Trao đổi hợp đồng
                  </label>
                  <input 
                    type="email"
                    placeholder="nongtrai@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mã số thuế HTX / Mã Hộ kinh doanh / CCCD người đại diện <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ví dụ: 0315891234 hoặc CCCD 038096001234"
                    value={formData.tax_id}
                    onChange={e => setFormData({...formData, tax_id: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Dùng để xác minh tư cách pháp nhân và đối soát thanh toán định kỳ.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Địa chỉ nông trại / Khu vực canh tác thực tế <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Thôn 3, Xã Lạc Dương, Huyện Lạc Dương, Tỉnh Lâm Đồng"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                />
              </div>
            </div>

            {/* NHÓM 2: CHỨNG MINH ĐỘ UY TÍN & TIÊU CHUẨN NÔNG SẢN */}
            <div className="bg-emerald-50/50 p-5 sm:p-6 rounded-2xl border border-emerald-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Award size={18} className="text-emerald-700" />
                  2. Tiêu chuẩn chất lượng & Chứng nhận uy tín
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Hồ sơ ưu tiên duyệt
                </span>
              </div>

              {/* Checkboxes tiêu chuẩn chứng nhận */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Các tiêu chuẩn canh tác nông hộ hiện đang đạt được (Chọn các tiêu chuẩn áp dụng):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableCerts.map((cert) => {
                    const isChecked = formData.certifications.includes(cert.id);
                    return (
                      <button
                        type="button"
                        key={cert.id}
                        onClick={() => handleToggleCert(cert.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                          isChecked 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <span>{cert.label}</span>
                        {isChecked ? (
                          <CheckCircle2 size={15} className="text-white shrink-0 ml-1" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded border border-gray-300 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Số hiệu giấy chứng nhận & Tổ chức kiểm định cấp
                  </label>
                  <input 
                    type="text"
                    placeholder="Ví dụ: Giấy số 142/VietGAP-NN do TT Kiểm Định cấp ngày 10/2023"
                    value={formData.cert_code}
                    onChange={e => setFormData({...formData, cert_code: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Đường dẫn tài liệu kiểm định / Giấy phép (Link Drive / Ảnh)
                  </label>
                  <input 
                    type="url"
                    placeholder="https://drive.google.com/... (link hồ sơ kiểm định hoặc ảnh chứng nhận)"
                    value={formData.proof_document}
                    onChange={e => setFormData({...formData, proof_document: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* NHÓM 3: NĂNG LỰC SẢN XUẤT & QUY MÔ SẢN LƯỢNG */}
            <div className="bg-gray-50/70 p-5 sm:p-6 rounded-2xl border border-gray-200/80 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Scale size={17} className="text-emerald-700" />
                3. Quy mô nông trại & Năng lực cung ứng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Diện tích vùng trồng canh tác
                  </label>
                  <input 
                    type="text"
                    placeholder="Ví dụ: 3 Hecta / 15.000 m²"
                    value={formData.farm_area}
                    onChange={e => setFormData({...formData, farm_area: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phương thức canh tác chính
                  </label>
                  <select
                    value={formData.farming_method}
                    onChange={e => setFormData({...formData, farming_method: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white font-medium"
                  >
                    <option value="Hữu cơ tự nhiên & Sinh thái">Hữu cơ tự nhiên & Sinh thái</option>
                    <option value="Nhà màng / Nhà kính công nghệ cao">Nhà màng / Nhà kính công nghệ cao</option>
                    <option value="Thủy canh / Khí canh thông minh">Thủy canh / Khí canh thông minh</option>
                    <option value="Quy trình VietGAP có kiểm soát">Quy trình VietGAP có kiểm soát</option>
                    <option value="Truyền thống theo hướng an toàn">Truyền thống theo hướng an toàn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kinh nghiệm / Năm thành lập
                  </label>
                  <input 
                    type="text"
                    placeholder="Ví dụ: 6 năm kinh nghiệm / Thành lập 2018"
                    value={formData.experience_years}
                    onChange={e => setFormData({...formData, experience_years: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nông sản chủ lực & Sản lượng mùa vụ dự kiến <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Bưởi da xanh ruột hồng (30 tấn/năm), Sầu riêng Ri6 (15 tấn/vụ), Cam sành VietGAP (500kg/ngày)"
                  value={formData.scale}
                  onChange={e => setFormData({...formData, scale: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ghi chú hoặc mong muốn hợp tác cụ thể
                </label>
                <textarea 
                  rows={3}
                  placeholder="Mô tả thêm về lịch thu hoạch, thời gian cung ứng tốt nhất hoặc cam kết riêng của nhà vườn..."
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                />
              </div>
            </div>

            {/* NHÓM 4: CAM KẾT CHẤT LƯỢNG */}
            <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200/90 flex items-start gap-3">
              <input 
                type="checkbox"
                id="commit_checkbox"
                checked={formData.is_committed}
                onChange={e => setFormData({...formData, is_committed: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 mt-0.5 shrink-0"
              />
              <label htmlFor="commit_checkbox" className="text-xs text-amber-950 font-medium leading-relaxed cursor-pointer">
                <strong>Cam kết trung thực & An toàn sinh học:</strong> Tôi cam kết các thông tin năng lực và tiêu chuẩn trên là đúng sự thật. Toàn bộ nông sản cung ứng qua sàn GreenFood tuân thủ nghiêm ngặt thời gian cách ly thuốc BVTV, không dùng hóa chất cấm và sẵn sàng đón tiếp đoàn kỹ sư GreenFood kiểm tra thẩm định thực địa định kỳ.
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-xl transition-colors flex items-center justify-center gap-2.5 shadow-md text-sm sm:text-base cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi hồ sơ thẩm định...
                </>
              ) : (
                <>
                  <Send size={18} /> Gửi Hồ Sơ Đối Tác Nông Hộ & Nhận Thẩm Định
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
