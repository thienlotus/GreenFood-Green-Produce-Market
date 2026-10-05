"use client";

import { useState } from 'react';
import { MapPin, Phone, Mail, ChevronRight, Facebook, Youtube, Instagram, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email của bạn!');
      return;
    }
    toast.success('Đăng ký nhận ưu đãi thành công! Mã giảm giá 50.000đ đã được gửi tới ' + email, {
      icon: '🎁',
      style: {
        borderRadius: '12px',
        background: '#064e3b',
        color: '#fff',
      }
    });
    setEmail('');
  };

  const aboutLinks = [
    { title: "Câu chuyện GreenFood", href: "/about" },
    { title: "Nông hộ & Hợp tác xã liên kết", href: "/farmers" },
    { title: "Tiêu chuẩn chất lượng VietGAP", href: "/quality-standards" },
    { title: "Điều khoản & Điều kiện sử dụng", href: "/terms" },
    { title: "Chính sách bảo mật thông tin", href: "/privacy" },
    { title: "Dành cho Đối tác & CTV", href: "/partners" },
    { title: "Tuyển dụng nhân sự", href: "/careers" }
  ];

  const supportLinks = [
    { title: "Chính sách giao hàng 2H", href: "/shipping" },
    { title: "Chính sách đổi trả & hoàn tiền", href: "/returns" },
    { title: "Hướng dẫn mua hàng online", href: "/how-to-buy" },
    { title: "Câu hỏi thường gặp (FAQs)", href: "/faqs" },
    { title: "Liên hệ & Góp ý", href: "/contact" },
    { title: "Tiếp nhận khiếu nại dịch vụ", href: "/complaints" }
  ];

  return (
    <footer 
      className="relative text-emerald-100 pt-16 pb-10 border-t-4 border-emerald-600 overflow-hidden" 
      style={{ backgroundColor: '#052e16' }}
    >
      {/* Họa tiết mầm lá chìm thanh lịch góc phải nền (vừa phải, không rối mắt) */}
      <div className="absolute -right-10 -bottom-10 w-96 h-96 opacity-[0.06] pointer-events-none select-none">
        <img src="/watermark-leaf.svg" alt="" className="w-full h-full object-contain filter invert" />
      </div>

      {/* Lớp hào quang ánh sáng quang hợp tự nhiên */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Newsletter & Social Header Card (Frosted Glassmorphism) */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 mb-12 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-300/20 mb-2">
                <ShieldCheck size={14} /> Ưu đãi thành viên mới
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Đăng ký nhận thông tin nông sản tươi & mã giảm giá</h3>
              <p className="text-emerald-200/80 text-xs md:text-sm mt-1">Tặng ngay voucher giảm giá 50.000đ áp dụng cho đơn hàng đầu tiên của bạn.</p>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full lg:max-w-md">
              <input 
                type="email" 
                placeholder="Nhập email của bạn (vd: ban@gmail.com)..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/10 border border-emerald-400/30 text-white placeholder-emerald-300/50 focus:outline-none focus:bg-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm w-full"
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-6 py-3 rounded-xl font-bold text-emerald-950 transition-all duration-300 whitespace-nowrap text-sm shadow-lg shadow-amber-950/20 hover:scale-102 active:scale-98"
              >
                Nhận quà ngay
              </button>
            </form>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Facebook"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-blue-600 border border-white/10 hover:border-blue-400 flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 shadow-sm"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Youtube"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-600 border border-white/10 hover:border-red-400 flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 shadow-sm"
              >
                <Youtube size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-pink-600 border border-white/10 hover:border-pink-400 flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 shadow-sm"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* 4 Cột Nội dung Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
          
          {/* Cột 1: Thông tin thương hiệu & Trụ sở (4 cols) */}
          <div className="lg:col-span-4">
            {/* Logo đồng bộ chuẩn - Không có khung trắng vuông lỗi thời */}
            <BrandLogo variant="dark" size="md" className="mb-4" />
            
            <p className="text-xs md:text-sm text-emerald-200/90 leading-relaxed mb-5 font-normal">
              Sàn thương mại điện tử kết nối trực tiếp các Hợp tác xã, Nông hộ canh tác tự nhiên đạt tiêu chuẩn VietGAP đến bàn ăn của mọi gia đình Việt.
            </p>

            <ul className="space-y-3.5 text-xs md:text-sm text-emerald-100/90">
              <li className="flex items-start gap-3">
                <MapPin className="shrink-0 mt-0.5 text-emerald-400" size={17} />
                <span>Số 123 Đường Nông Nghiệp, Phường 14, Quận 10, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="shrink-0 text-amber-400" size={17} />
                <div className="flex items-center gap-2">
                  <a href="tel:02877702614" className="hover:text-amber-300 font-bold transition-colors">028 7770 2614</a>
                  <span className="text-[11px] text-emerald-300/80 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">7:00 - 21:00</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="shrink-0 text-emerald-400" size={17} />
                <a href="mailto:info@greenfood.vn" className="hover:text-amber-300 transition-colors">info@greenfood.vn</a>
              </li>
              <li className="pt-2 text-xs text-emerald-300/70">
                Mã số thuế: 0123456789 do Sở KH&ĐT TP.HCM cấp
              </li>
            </ul>
          </div>

          {/* Cột 2: Về GreenFood (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-400 rounded-full" /> Về GreenFood
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm">
              {aboutLinks.map((item, idx) => (
                <li key={idx}>
                  <Link 
                    href={item.href} 
                    className="inline-flex items-center gap-1.5 text-emerald-200/80 hover:text-amber-300 hover:translate-x-1 transition-all duration-200 group"
                  >
                    <ChevronRight size={13} className="text-emerald-500 group-hover:text-amber-300 transition-colors" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-400 rounded-full" /> Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm">
              {supportLinks.map((item, idx) => (
                <li key={idx}>
                  <Link 
                    href={item.href} 
                    className="inline-flex items-center gap-1.5 text-emerald-200/80 hover:text-amber-300 hover:translate-x-1 transition-all duration-200 group"
                  >
                    <ChevronRight size={13} className="text-emerald-500 group-hover:text-amber-300 transition-colors" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Ứng dụng & Thanh toán (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-400 rounded-full" /> Tải ứng dụng mua sắm
            </h4>
            <p className="text-xs text-emerald-200/80 mb-4">
              Mua sắm tiện lợi và nhận nhiều ưu đãi độc quyền trên App GreenFood.
            </p>

            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 mb-6">
              <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-sm">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=https://greenfood.asia" 
                  alt="QR Tải App GreenFood" 
                  className="w-16 h-16 rounded" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <a 
                  href="#" 
                  className="bg-black/60 hover:bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <span>App Store</span>
                </a>
                <a 
                  href="#" 
                  className="bg-black/60 hover:bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <span>Google Play</span>
                </a>
              </div>
            </div>

            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Phương thức thanh toán</h4>
            <div className="flex flex-wrap gap-2">
              {['VNPay', 'MoMo', 'Visa', 'MasterCard', 'COD'].map((method) => (
                <span 
                  key={method} 
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-[11px] font-semibold text-white transition-colors"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bản quyền & Cam kết cuối trang */}
        <div className="pt-6 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-3">
          <p>© 2026 Bản quyền thuộc về Công ty Cổ phần GreenFood - Nông Sản Chuẩn Sạch Cho Mọi Nhà.</p>
          <div className="flex items-center gap-1 text-emerald-300/80">
            <span>Canh tác bằng cả trái tim</span>
            <Heart size={13} className="text-rose-400 fill-rose-400" />
            <span>vì sức khỏe cộng đồng</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
