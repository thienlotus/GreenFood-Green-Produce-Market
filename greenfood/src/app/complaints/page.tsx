"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, AlertTriangle, ShieldCheck, Clock, CheckCircle2, Send, PhoneCall, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ComplaintsPage() {
  const [formData, setFormData] = useState({
    orderCode: '',
    customerName: '',
    phone: '',
    reason: 'Sản phẩm dập nát / hư hỏng',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderCode || !formData.phone || !formData.description) {
      toast.error('Vui lòng điền mã đơn hàng, số điện thoại và mô tả lỗi!');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Đã tiếp nhận khiếu nại! Mã số giải quyết: #KN-' + Math.floor(100000 + Math.random() * 900000) + '. GreenFood sẽ gọi lại trong 30 phút.');
      setFormData({ orderCode: '', customerName: '', phone: '', reason: 'Sản phẩm dập nát / hư hỏng', description: '' });
    }, 1200);
  };

  const resolutions = [
    {
      time: "15 - 30 Phút",
      title: "Tiếp nhận & Xác minh",
      desc: "Chuyên viên CSKH kiểm tra hình ảnh lỗi và liên hệ ngay với bạn qua điện thoại để xác nhận hướng xử lý."
    },
    {
      time: "Trong 60 Phút",
      title: "Giao bù sản phẩm mới",
      desc: "Nếu quý khách chọn nhận bù hàng, shipper sẽ mang sản phẩm tươi ngon mới đến tận cửa hoàn toàn miễn phí."
    },
    {
      time: "Tối đa 24 Giờ",
      title: "Hoàn tiền sòng phẳng",
      desc: "Nếu quý khách chọn hoàn tiền, tài chính GreenFood chuyển khoản 100% về tài khoản hoặc ví của bạn ngay trong ngày."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Tiếp nhận khiếu nại</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-rose-700 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-rose-200">
            <AlertTriangle size={15} /> Xử Lý Nhanh - Bảo Vệ Người Mua
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">Tiếp Nhận & Xử Lý Khiếu Nại</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Nếu bạn không hài lòng về chất lượng nông sản hoặc dịch vụ giao hàng, xin hãy cho chúng tôi cơ hội để khắc phục ngay lập tức!
          </p>
        </div>

        {/* Timeline cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {resolutions.map((r, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md inline-block mb-2">
                ⏱ {r.time}
              </span>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{r.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Phiếu Gửi Yêu Cầu Khiếu Nại</h2>
          <p className="text-sm text-gray-600 mb-6">Vui lòng điền thông tin đơn hàng để chúng tôi tra cứu lịch sử đóng gói và giao hàng.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Mã đơn hàng <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: #GF-1082"
                  value={formData.orderCode}
                  onChange={e => setFormData({...formData, orderCode: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Họ tên người nhận <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Số điện thoại đặt hàng <span className="text-rose-500">*</span>
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lý do khiếu nại</label>
              <select 
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option>Sản phẩm dập nát / hư hỏng</option>
                <option>Sản phẩm không đạt chuẩn chất lượng cam kết</option>
                <option>Giao thiếu hoặc sai món so với đơn đặt</option>
                <option>Giao trễ giờ hẹn hơn 45 phút</option>
                <option>Thái độ tài xế giao hàng chưa tốt</option>
                <option>Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Mô tả chi tiết sự cố <span className="text-rose-500">*</span>
              </label>
              <textarea 
                rows={3}
                required
                placeholder="Ví dụ: Hộp dâu tây 500g bị dập 3 quả do vận chuyển, mong muốn được bù hàng..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50 hover:bg-gray-100/60 cursor-pointer transition-colors">
              <UploadCloud className="mx-auto text-gray-400 mb-2" size={28} />
              <p className="text-xs font-semibold text-gray-700">Đính kèm hình ảnh hoặc video sản phẩm lỗi</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Hỗ trợ định dạng JPG, PNG, MP4 (tối đa 25MB)</p>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
            >
              {isSubmitting ? 'Đang gửi thông tin tiếp nhận...' : (
                <>
                  <Send size={18} /> Gửi Khiếu Nại Cho Giám Sát GreenFood
                </>
              )}
            </button>
          </form>
        </div>

        {/* Urgent hotline box */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <PhoneCall size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Cần xử lý khẩn cấp ngay bây giờ?</h4>
              <p className="text-xs text-amber-800">Gọi trực tiếp cho Trưởng ban CSKH GreenFood</p>
            </div>
          </div>
          <a href="tel:02877702614" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors shrink-0 whitespace-nowrap">
            Gọi Hotline 028 7770 2614
          </a>
        </div>
      </div>
    </div>
  );
}
