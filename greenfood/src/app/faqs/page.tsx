"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, HelpCircle, Search, MessageSquare, PhoneCall } from 'lucide-react';

export default function FaqsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'product',
      q: "Làm thế nào để tôi biết rau củ tại GreenFood thực sự sạch và an toàn?",
      a: "Tất cả sản phẩm trên GreenFood đều liên kết trực tiếp với các HTX, nhà vườn có chứng nhận VietGAP, GlobalGAP hoặc canh tác hữu cơ đã qua thẩm định. Trên mỗi bao bì đều có mã QR định danh, bạn có thể quét để xem chi tiết nhật ký thu hoạch và giấy xét nghiệm dư lượng hóa chất."
    },
    {
      category: 'product',
      q: "Rau củ được bảo quản tươi như thế nào trong quá trình giao hàng?",
      a: "GreenFood sử dụng quy trình đóng gói chuỗi lạnh: rau ăn lá đựng trong túi màng thở MAP chống dập úng, trái cây đóng hộp định hình và luôn được lót túi gel giữ nhiệt chuyên dụng trong thùng cách nhiệt khi shipper vận chuyển."
    },
    {
      category: 'shipping',
      q: "Thời gian giao hàng hỏa tốc mất bao lâu?",
      a: "Dịch vụ giao hỏa tốc áp dụng tại khu vực TP. Hồ Chí Minh cam kết giao tận tay bạn trong vòng 120 phút kể từ lúc đặt hàng. Ngoài ra, bạn cũng có thể chọn các khung giờ giao hàng định sẵn vào sáng (8h-11h) hoặc chiều (14h-17h)."
    },
    {
      category: 'shipping',
      q: "Phí vận chuyển được tính như thế nào? Có miễn phí ship không?",
      a: "Phí giao hàng thông thường từ 25.000đ - 35.000đ tùy khoảng cách. GreenFood miễn phí vận chuyển toàn bộ cho đơn hàng từ 300.000đ (khung giờ thường) và từ 500.000đ (đối với giao hỏa tốc 2 giờ)."
    },
    {
      category: 'returns',
      q: "Nếu tôi nhận phải rau củ bị dập nát hoặc hỏng thì làm thế nào?",
      a: "GreenFood áp dụng chính sách 'Cam kết 100% hài lòng'. Quý khách chỉ cần chụp ảnh sản phẩm lỗi gửi qua hotline/Zalo 028 7770 2614 hoặc trang Khiếu nại trong vòng 24 giờ. Chúng tôi sẽ giao bù hàng mới miễn phí hoặc hoàn tiền 100% trong vòng 15-30 phút."
    },
    {
      category: 'payment',
      q: "GreenFood hỗ trợ những hình thức thanh toán nào?",
      a: "Chúng tôi hỗ trợ đa dạng phương thức: Trả tiền mặt khi nhận hàng (COD), Quét mã QR thanh toán qua VNPay, Ví điện tử MoMo, hoặc thẻ quốc tế Visa / MasterCard. Tất cả giao dịch điện tử đều được mã hóa bảo mật SSL 256-bit."
    },
    {
      category: 'farmer',
      q: "Tôi là nông dân muốn đưa nông sản lên GreenFood thì cần điều kiện gì?",
      a: "Chúng tôi rất hoan nghênh các nông hộ có tâm! Bạn chỉ cần có vườn trồng thực tế, cam kết canh tác theo hướng an toàn/VietGAP và không sử dụng thuốc cấm. Đội ngũ kỹ sư GreenFood sẽ đến tận nơi kiểm định mẫu đất, nước và hỗ trợ kết nối đầu ra bao tiêu dài hạn."
    }
  ];

  const filteredFaqs = faqs.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Câu hỏi thường gặp</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <HelpCircle size={15} /> Trung Tâm Trợ Giúp
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">Câu Hỏi Thường Gặp (FAQs)</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Tìm câu trả lời nhanh chóng cho các thắc mắc về sản phẩm, vận chuyển và đổi trả tại GreenFood.
          </p>

          {/* Search box */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <input 
              type="text"
              placeholder="Tìm câu hỏi (vd: đổi trả, phí ship, vietgap...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-3.5 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: 'all', label: 'Tất cả câu hỏi' },
            { id: 'product', label: 'Chất lượng & Nguồn gốc' },
            { id: 'shipping', label: 'Giao hàng' },
            { id: 'returns', label: 'Đổi trả & Khiếu nại' },
            { id: 'payment', label: 'Thanh toán' },
            { id: 'farmer', label: 'Dành cho nhà vườn' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-xs lg:text-sm font-semibold transition-all ${
                activeCategory === tab.id 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-14">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-4.5 flex justify-between items-center gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-gray-900 text-sm lg:text-base">{faq.q}</span>
                    <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500 text-sm">Không tìm thấy câu hỏi phù hợp với từ khóa "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Still need help */}
        <div className="bg-emerald-900 text-white rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Bạn Vẫn Còn Thắc Mắc Khác?</h3>
          <p className="text-emerald-200 text-sm max-w-md mx-auto mb-6">
            Đội ngũ tư vấn viên của GreenFood luôn túc trực từ 8:00 - 21:00 hàng ngày để sẵn sàng hỗ trợ bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:02877702614" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2">
              <PhoneCall size={16} /> Gọi 028 7770 2614
            </a>
            <Link href="/contact" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-lg text-sm border border-white/20 transition-colors inline-flex items-center gap-2">
              <MessageSquare size={16} /> Gửi tin nhắn liên hệ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
