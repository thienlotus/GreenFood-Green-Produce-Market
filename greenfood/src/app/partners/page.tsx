"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Handshake, Sprout, TrendingUp, DollarSign, CheckCircle2, Send, PhoneCall, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PartnersPage() {
  const [partnerType, setPartnerType] = useState('farmer');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    scale: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Vui lòng nhập họ tên và số điện thoại liên hệ!');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Gửi thông tin hợp tác thành công! GreenFood sẽ liên hệ lại trong 24h.');
      setFormData({ name: '', phone: '', email: '', location: '', scale: '', note: '' });
    }, 1000);
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
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-2xl p-8 lg:p-14 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="bg-amber-400 text-emerald-950 text-xs uppercase px-3 py-1 rounded-full font-bold tracking-wider inline-block mb-3">
              Cùng Phát Triển Nông Nghiệp Sạch
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Đồng Hành Cùng GreenFood
            </h1>
            <p className="text-emerald-100 text-base lg:text-lg leading-relaxed mb-6">
              Dành cho Nông Hộ, Hợp Tác Xã canh tác sạch, Doanh nghiệp cung ứng thực phẩm và Cộng tác viên bán hàng trên toàn quốc.
            </p>
            <a href="#partner-form" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all inline-flex items-center gap-2">
              Đăng ký hợp tác ngay <ChevronRight size={16} />
            </a>
          </div>
          <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20">
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
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
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
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng Ký Thông Tin Hợp Tác</h2>
            <p className="text-sm text-gray-600">Điền thông tin bên dưới, chuyên viên thu mua của GreenFood sẽ liên hệ trong 24 giờ làm việc.</p>
          </div>

          {/* Type selector */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-8 max-w-md mx-auto">
            <button 
              type="button"
              onClick={() => setPartnerType('farmer')}
              className={`flex-1 py-2.5 text-xs lg:text-sm font-bold rounded-lg transition-all ${partnerType === 'farmer' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Nông hộ / HTX
            </button>
            <button 
              type="button"
              onClick={() => setPartnerType('supplier')}
              className={`flex-1 py-2.5 text-xs lg:text-sm font-bold rounded-lg transition-all ${partnerType === 'supplier' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Nhà cung cấp
            </button>
            <button 
              type="button"
              onClick={() => setPartnerType('affiliate')}
              className={`flex-1 py-2.5 text-xs lg:text-sm font-bold rounded-lg transition-all ${partnerType === 'affiliate' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Cộng tác viên (CTV)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Họ và tên / Tên đại diện HTX <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="Ví dụ: 0912 345 678"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email liên hệ</label>
                <input 
                  type="email"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ nông trại / Khu vực hoạt động</label>
                <input 
                  type="text"
                  placeholder="Ví dụ: Huyện Cái Bè, Tiền Giang"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {partnerType === 'affiliate' ? 'Kênh bán hàng chính (Facebook/Tiktok/Zalo)' : 'Sản phẩm chủ lực & Quy mô sản lượng ước tính'}
              </label>
              <input 
                type="text"
                placeholder={partnerType === 'affiliate' ? 'Kênh tiktok/facebook cá nhân của bạn' : 'Ví dụ: Sầu riêng Ri6 - 10 tấn/năm, Rau ăn lá VietGAP - 500kg/ngày'}
                value={formData.scale}
                onChange={e => setFormData({...formData, scale: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú hoặc lời nhắn thêm</label>
              <textarea 
                rows={3}
                placeholder="Mô tả tiêu chuẩn canh tác (VietGAP, GlobalGAP, Organic...) hoặc mong muốn hợp tác cụ thể"
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? 'Đang gửi thông tin...' : (
                <>
                  <Send size={18} /> Gửi Hồ Sơ Hợp Tác
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
