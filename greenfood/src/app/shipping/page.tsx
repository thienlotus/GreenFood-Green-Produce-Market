"use client";

import Link from 'next/link';
import { ChevronRight, Truck, Clock, ShieldCheck, MapPin, Zap, CheckCircle2 } from 'lucide-react';

export default function ShippingPolicyPage() {
  const deliveryOptions = [
    {
      title: "Giao Hỏa Tốc (2 Giờ)",
      time: "Trong vòng 120 phút",
      price: "35.000đ (Miễn phí từ 500k)",
      tag: "Phổ biến nhất",
      color: "border-emerald-500 bg-emerald-50 text-emerald-800",
      desc: "Áp dụng cho các quận nội thành TP. Hồ Chí Minh. Nông sản được đóng thùng xốp cách nhiệt đá khô giữ độ tươi sống tối đa."
    },
    {
      title: "Giao Theo Khung Giờ Chọn Trước",
      time: "Sáng: 8h-11h | Chiều: 14h-17h",
      price: "25.000đ (Miễn phí từ 300k)",
      tag: "Tiết kiệm",
      color: "border-blue-500 bg-blue-50 text-blue-800",
      desc: "Quý khách chủ động hẹn giờ nhận hàng khi có mặt tại nhà, bảo đảm thực phẩm không bị phơi nắng ngoài sảnh chung cư."
    },
    {
      title: "Giao Ngoại Thành & Tỉnh Lân Cận",
      time: "Trong ngày hoặc sáng hôm sau",
      price: "Tùy cước xe lạnh",
      tag: "Xe lạnh chuyên dụng",
      color: "border-amber-500 bg-amber-50 text-amber-800",
      desc: "Phục vụ khách sỉ và lẻ tại Bình Dương, Đồng Nai, Long An bằng xe tải lạnh nhiệt độ ổn định 5°C."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Chính sách giao hàng</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-100 pb-6 mb-8">
            <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Vận Chuyển An Tâm</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2 mb-3">Chính Sách Vận Chuyển & Giao Hàng</h1>
            <p className="text-sm text-gray-500">Quy chuẩn bảo quản lạnh chuyên biệt cho rau củ quả tươi sống</p>
          </div>

          {/* 3 Delivery modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {deliveryOptions.map((opt, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:border-emerald-500 transition-colors flex flex-col justify-between">
                <div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-3 border ${opt.color}`}>
                    {opt.tag}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{opt.title}</h3>
                  <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                    <Clock size={12} /> {opt.time}
                  </p>
                  <p className="text-xs font-bold text-amber-600 mb-3">{opt.price}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="prose prose-emerald max-w-none space-y-8 text-gray-700 leading-relaxed text-sm lg:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="text-emerald-600" size={22} />
                1. Quy trình đóng gói chống dập nát
              </h2>
              <p>
                Khác biệt với hàng tiêu dùng thông thường, nông sản tươi của GreenFood được đóng gói theo quy chuẩn bảo hộ sinh học:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Rau ăn lá:</strong> Được xếp trong túi màng thoáng khí MAP, giữ độ ẩm tự nhiên, ngăn ngừa úng lá.</li>
                <li><strong>Trái cây mọng (Dâu tây, Nho, Cà chua bi):</strong> Hộp nhựa định hình có vách ngăn giảm ma sát và xóc nảy khi di chuyển.</li>
                <li><strong>Thực phẩm trữ lạnh (Nấm, Sữa hạt tươi):</strong> Kèm túi gel đá giữ lạnh đảm bảo nhiệt độ dưới 10°C suốt lộ trình.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={22} />
                2. Chính sách đồng kiểm khi nhận hàng
              </h2>
              <p>
                GreenFood <strong>khuyến khích 100% khách hàng đồng kiểm</strong> tình trạng đơn hàng ngay cùng nhân viên giao hàng:
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-3 text-emerald-900 text-sm">
                Quý khách có quyền từ chối nhận nếu phát hiện sản phẩm bị dập nát do va đập hoặc không đúng loại đã đặt. Tài xế sẽ hoàn trả về kho và GreenFood gửi lại đơn thay thế miễn phí trong 60 phút.
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="text-emerald-600" size={22} />
                3. Cam kết thời gian giao hàng
              </h2>
              <p>
                Nếu đơn hàng hỏa tốc bị giao trễ hơn 30 phút so với thời gian cam kết vì nguyên nhân chủ quan từ GreenFood, quý khách sẽ được <strong>tặng voucher 30.000đ</strong> cho đơn hàng tiếp theo kèm lời xin lỗi chân thành từ đội ngũ điều phối.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
