"use client";

import Link from 'next/link';
import { ChevronRight, Search, ShoppingCart, CreditCard, Truck, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export default function HowToBuyPage() {
  const steps = [
    {
      step: "01",
      title: "Tìm Kiếm & Lựa Chọn Nông Sản",
      desc: "Duyệt danh mục 'Đi chợ online', 'Trái cây tươi', hoặc sử dụng thanh tìm kiếm để chọn sản phẩm tươi theo mùa vụ. Bạn có thể xem trực tiếp thông tin vườn trồng và chứng nhận VietGAP.",
      icon: Search
    },
    {
      step: "02",
      title: "Thêm Vào Giỏ & Điều Chỉnh Trọng Lượng",
      desc: "Chọn số lượng hoặc khối lượng (ví dụ: 1kg, 2kg, thùng 5kg). Nhấn 'Thêm vào giỏ hàng'. Bạn có thể tiếp tục mua sắm các loại rau gia vị, củ quả khác trước khi thanh toán.",
      icon: ShoppingCart
    },
    {
      step: "03",
      title: "Điền Địa Chỉ & Hẹn Giờ Giao",
      desc: "Kiểm tra giỏ hàng, điền địa chỉ nhận hàng và số điện thoại. Chọn chế độ 'Giao hỏa tốc 2 giờ' hoặc hẹn khung giờ nhận thuận tiện nhất cho bạn.",
      icon: MapPin
    },
    {
      step: "04",
      title: "Lựa Chọn Phương Thức Thanh Toán",
      desc: "GreenFood hỗ trợ: Tiền mặt khi nhận hàng (COD), Chuyển khoản QR VNPay tự động khớp lệnh, Ví MoMo, hoặc thẻ tín dụng/ghi nợ quốc tế.",
      icon: CreditCard
    },
    {
      step: "05",
      title: "Nhận Hàng Tươi & Đồng Kiểm",
      desc: "Tài xế giao thùng nông sản đóng gói lạnh đến cửa nhà. Quý khách đồng kiểm tra sản phẩm trước khi thanh toán và nhận biên nhận điện tử.",
      icon: Truck
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Hướng dẫn mua hàng</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 mb-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Tiện Lợi - An Toàn - Nhanh Chóng</span>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 mb-3">5 Bước Mua Sắm Tại GreenFood</h1>
            <p className="text-sm lg:text-base text-gray-600">
              Đi chợ nông sản chuẩn sạch chỉ mất chưa đầy 3 phút trên điện thoại hoặc máy tính.
            </p>
          </div>

          {/* Vertical Steps */}
          <div className="space-y-8 relative before:absolute before:inset-0 before:left-6 lg:before:left-8 before:w-0.5 before:bg-emerald-100 before:z-0">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative z-10 flex items-start gap-4 lg:gap-6">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md font-extrabold text-lg lg:text-xl">
                    {item.step}
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 flex-1 border border-gray-100 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={18} className="text-emerald-600" />
                      <h3 className="font-bold text-gray-900 text-base lg:text-lg">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Useful Tips */}
          <div className="mt-14 bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <h4 className="font-bold text-amber-900 text-base mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-amber-600" /> Mẹo Nhỏ Khi Mua Hàng:
            </h4>
            <ul className="text-sm text-amber-800 space-y-2 list-disc pl-5">
              <li>Nên đặt trước 10h sáng để nông sản được tuyển chọn từ các chuyến hàng bình minh vừa cập bến.</li>
              <li>Nhập mã giảm giá (nếu có) tại trang giỏ hàng trước khi bấm thanh toán.</li>
              <li>Sử dụng chức năng <strong>"Theo Dõi Đơn"</strong> để biết chính xác vị trí shipper đang di chuyển.</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <Link href="/category/di-cho-online" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-lg shadow transition-colors inline-flex items-center gap-2">
              Bắt Đầu Mua Sắm Ngay <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
