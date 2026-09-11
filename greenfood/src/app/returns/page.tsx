"use client";

import Link from 'next/link';
import { ChevronRight, RefreshCw, CheckCircle2, Clock, DollarSign, AlertCircle, PhoneCall } from 'lucide-react';

export default function ReturnPolicyPage() {
  const steps = [
    {
      num: "1",
      title: "Chụp ảnh / Quay video lỗi",
      desc: "Quý khách chụp ảnh cận cảnh tem mác sản phẩm và vị trí trái dập, rau héo hoặc lỗi ngoại quan."
    },
    {
      num: "2",
      title: "Gửi yêu cầu qua Zalo/Hotline",
      desc: "Nhắn tin qua Zalo CSKH GreenFood hoặc gọi hotline 028 7770 2614 trong vòng 24 giờ kể từ khi nhận hàng."
    },
    {
      num: "3",
      title: "Xác nhận & Bù hàng siêu tốc",
      desc: "GreenFood xác nhận bồi hoàn trong 15 phút. Bạn chọn giao bù sản phẩm tươi mới ngay trong ngày hoặc hoàn tiền."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Chính sách đổi trả & Hoàn tiền</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-100 pb-6 mb-8">
            <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Cam Kết 100% Hài Lòng</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2 mb-3">Chính Sách Đổi Trả & Hoàn Tiền</h1>
            <p className="text-sm text-gray-500">Bảo vệ quyền lợi tối đa cho bữa cơm tươi lành của gia đình bạn</p>
          </div>

          {/* Guarantee banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Cam Kết "Đổi Mới Hoặc Hoàn Tiền 100%"</h3>
              <p className="text-sm text-emerald-100">
                Nếu nông sản giao đến không tươi ngon như cam kết, quý khách không cần phải trả thêm bất kỳ chi phí nào.
              </p>
            </div>
            <Link href="/complaints" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Gửi Yêu Cầu Bồi Hoàn
            </Link>
          </div>

          {/* 3 Step Process */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Quy Trình 3 Bước Đơn Giản</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s, idx) => (
                <div key={idx} className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5 text-center">
                  <span className="w-9 h-9 bg-emerald-600 text-white font-bold rounded-full inline-flex items-center justify-center mb-3">
                    {s.num}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">{s.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="prose prose-emerald max-w-none space-y-8 text-gray-700 leading-relaxed text-sm lg:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="text-emerald-600" size={20} />
                1. Thời hạn tiếp nhận yêu cầu
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Rau củ quả tươi sống, trái cây hái trong ngày:</strong> Trong vòng <strong>24 giờ</strong> kể từ thời điểm nhận hàng.</li>
                <li><strong>Hàng khô, trà, cà phê, thực phẩm đóng gói:</strong> Trong vòng <strong>07 ngày</strong> kể từ khi nhận hàng (bao bì còn nguyên tem nhãn, chưa mở nắp).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={20} />
                2. Các trường hợp được hỗ trợ đổi trả
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Sản phẩm bị dập nát, thâm đen, úng hỏng hoặc biến chất do quá trình vận chuyển.</li>
                <li>Sản phẩm không đúng chủng loại, trọng lượng thiếu so với đơn đặt hàng.</li>
                <li>Hàng hóa đã quá hạn sử dụng hoặc bao bì đóng kín bị rách hở tem kiểm định.</li>
                <li>Sản phẩm bên trong bị sượng, đắng hoặc hư ruột (đối với sầu riêng, mít, bưởi...).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="text-emerald-600" size={20} />
                3. Phương thức hoàn tiền
              </h2>
              <p>Sau khi yêu cầu được phê duyệt, quý khách có thể lựa chọn 1 trong các hình thức:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Giao bù sản phẩm mới:</strong> Miễn phí vận chuyển tận nhà trong 2 - 4 giờ.</li>
                <li><strong>Hoàn tiền vào Ví GreenFood:</strong> Nhận ngay mã giảm giá tương đương 110% giá trị sản phẩm lỗi để mua sắm lần sau.</li>
                <li><strong>Hoàn tiền về tài khoản ngân hàng / MoMo / Thẻ:</strong> Xử lý trong vòng 24 giờ làm việc.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
