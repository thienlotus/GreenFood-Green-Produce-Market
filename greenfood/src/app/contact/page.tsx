"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Góp ý chất lượng dịch vụ',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Cảm ơn bạn! GreenFood đã tiếp nhận thông tin và sẽ phản hồi sớm nhất.');
      setFormData({ name: '', phone: '', email: '', subject: 'Góp ý chất lượng dịch vụ', message: '' });
    }, 1000);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Liên hệ</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Hỗ Trợ & Đồng Hành</span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 mb-3">Liên Hệ Với GreenFood</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Chúng tôi luôn lắng nghe mọi ý kiến đóng góp từ khách hàng để ngày càng hoàn thiện chất lượng phục vụ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Info cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Trụ Sở Chính & Kho Lạnh</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Số 123 Đường Nông Nghiệp, Phường 14, Quận 10, TP. Hồ Chí Minh
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Hotline Chăm Sóc Khách Hàng</h3>
                <p className="text-sm text-gray-600 mb-1">Tư vấn đặt hàng & Đổi trả miễn phí:</p>
                <a href="tel:02877702614" className="text-lg font-extrabold text-emerald-600 hover:underline">
                  028 7770 2614
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Email Liên Hệ</h3>
                <p className="text-sm text-gray-600 mb-0.5">Hỗ trợ khách hàng: <a href="mailto:info@greenfood.vn" className="text-emerald-600 font-medium hover:underline">info@greenfood.vn</a></p>
                <p className="text-sm text-gray-600">Hợp tác nông trại: <a href="mailto:nongtrai@greenfood.vn" className="text-emerald-600 font-medium hover:underline">nongtrai@greenfood.vn</a></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Thời Gian Làm Việc</h3>
                <p className="text-sm text-gray-600">Thứ 2 - Chủ Nhật: 07:00 - 21:00</p>
                <p className="text-xs text-gray-500 mt-1">Đơn hỏa tốc phục vụ liên tục xuyên tuần</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 lg:p-10 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gửi Tin Nhắn Cho Chúng Tôi</h2>
            <p className="text-sm text-gray-600 mb-6">Mọi thắc mắc, phản ánh hoặc yêu cầu hợp tác sẽ được phản hồi trong vòng 2 giờ.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
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
                    placeholder="0912 345 678"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email của bạn</label>
                  <input 
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Chủ đề cần hỗ trợ</label>
                  <select 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  >
                    <option>Góp ý chất lượng dịch vụ</option>
                    <option>Hỏi thông tin đơn hàng</option>
                    <option>Hợp tác nhà vườn / cung ứng</option>
                    <option>Hóa đơn VAT doanh nghiệp</option>
                    <option>Vấn đề khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nội dung lời nhắn <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Vui lòng nhập chi tiết nội dung bạn cần hỗ trợ..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-lg transition-colors inline-flex items-center gap-2 shadow"
              >
                {isSubmitting ? 'Đang gửi...' : (
                  <>
                    <Send size={18} /> Gửi Tin Nhắn
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Google Map Mock */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="w-full h-80 rounded-xl bg-gray-200 overflow-hidden relative flex items-center justify-center">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602372551405!2d106.66440537480572!3d10.776019989372488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752edb71d9d93f%3A0xe5a201c180eb0b9a!2zUXXhuq1uIDEwLCBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
