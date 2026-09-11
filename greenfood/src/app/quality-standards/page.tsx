"use client";

import Link from 'next/link';
import { ChevronRight, ShieldCheck, Award, CheckCircle2, Leaf, ThermometerSnowflake, QrCode, FileText } from 'lucide-react';

export default function QualityStandardsPage() {
  const certifications = [
    {
      title: "Tiêu Chuẩn VietGAP",
      desc: "Thực hành sản xuất nông nghiệp tốt tại Việt Nam, kiểm soát dư lượng thuốc BVTV, kim loại nặng và vi sinh vật gây hại.",
      badge: "100% Nông Trại",
      color: "border-emerald-500 bg-emerald-50 text-emerald-800",
      icon: ShieldCheck,
      details: ["Không sử dụng hóa chất cấm", "Thời gian cách ly nghiêm ngặt", "Kiểm nghiệm định kỳ nguồn đất, nước", "Nhật ký canh tác minh bạch"]
    },
    {
      title: "Chứng Nhận GlobalGAP",
      desc: "Tiêu chuẩn quốc tế về an toàn thực phẩm, bảo vệ môi trường và phúc lợi cho người lao động tại các nông trường quy mô lớn.",
      badge: "Xuất Khẩu & Cao Cấp",
      color: "border-blue-500 bg-blue-50 text-blue-800",
      icon: Award,
      details: ["Đáp ứng chuẩn an toàn Châu Âu", "Quản lý dịch hại tổng hợp (IPM)", "Truy xuất nguồn gốc toàn cầu", "Bảo vệ đa dạng sinh học"]
    },
    {
      title: "Tiêu Chuẩn Hữu Cơ (Organic)",
      desc: "Quy trình canh tác hoàn toàn tự nhiên, nói không với phân bón hóa học, thuốc trừ sâu hóa học và giống biến đổi gen (Non-GMO).",
      badge: "Tự Nhiên 100%",
      color: "border-amber-500 bg-amber-50 text-amber-800",
      icon: Leaf,
      details: ["Không thuốc trừ sâu hóa học", "Không chất kích thích sinh trưởng", "Đất đai cách ly tối thiểu 3 năm", "Bảo toàn vị ngon nguyên bản"]
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Chọn Lọc Vùng Trồng",
      desc: "GreenFood chỉ hợp tác với các vùng chuyên canh có thổ nhưỡng phù hợp nhất (Đà Lạt, Tiền Giang, Bến Tre, Mộc Châu)."
    },
    {
      step: "02",
      title: "Thu Hoạch Lúc Bình Minh",
      desc: "Nông sản được thu hoạch vào khung giờ vàng (5h - 7h sáng) để giữ độ ẩm, vị ngọt tự nhiên và dưỡng chất cao nhất."
    },
    {
      step: "03",
      title: "Sơ Chế & Phân Loại Kép",
      desc: "Đội ngũ QC kiểm tra ngoại quan, đo độ ngọt (Brix), loại bỏ 100% trái dập nát, hỏng trước khi đóng gói bảo hộ sinh học."
    },
    {
      step: "04",
      title: "Chuỗi Cung Ứng Lạnh",
      desc: "Hệ thống kho và xe lạnh chuyên dụng duy trì nhiệt độ 2°C - 8°C từ lúc thu hái tại vườn đến khi giao tận tay khách hàng."
    },
    {
      step: "05",
      title: "QR Truy Xuất Nguồn Gốc",
      desc: "Mỗi sản phẩm đều dán tem QR chứa thông tin: ngày thu hoạch, nông trại trồng, kết quả kiểm định chất lượng."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Tiêu chuẩn chất lượng</span>
        </div>
      </div>

      {/* Hero */}
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white rounded-2xl p-8 lg:p-14 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs uppercase px-3 py-1 rounded-full font-bold tracking-wider inline-block mb-4">
              Cam Kết Từ Nông Trại Đến Bàn Ăn
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Tiêu Chuẩn Chất Lượng Tại GreenFood
            </h1>
            <p className="text-emerald-100 text-base lg:text-lg leading-relaxed mb-6">
              Mỗi sản phẩm bạn nhận được từ GreenFood đều trải qua quy trình kiểm soát khắt khe 5 bước, đạt chuẩn VietGAP & Organic, mang lại sự an tâm tuyệt đối cho sức khỏe gia đình bạn.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/farmers" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all inline-flex items-center gap-2">
                Xem nông trại đối tác <ChevronRight size={16} />
              </Link>
              <Link href="/category/di-cho-online" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg border border-white/20 transition-all">
                Khám phá nông sản chuẩn
              </Link>
            </div>
          </div>
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none hidden lg:block">
            <ShieldCheck size={360} />
          </div>
        </div>
      </div>

      {/* Certifications Grid */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Bộ Ba Tiêu Chuẩn Nền Tảng</h2>
          <p className="text-gray-600">Chúng tôi chỉ phân phối sản phẩm có chứng nhận rõ ràng từ các tổ chức kiểm nghiệm độc lập uy tín.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {certifications.map((cert, idx) => {
            const Icon = cert.icon;
            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Icon size={26} />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cert.color}`}>
                      {cert.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{cert.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{cert.desc}</p>
                  
                  <div className="border-t border-gray-100 pt-4 space-y-2.5">
                    {cert.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Step Process */}
      <div className="bg-white py-16 border-y border-gray-200 mb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Quy Trình Kiểm Soát 5 Bước Khép Kín</h2>
            <p className="text-gray-600">Đảm bảo rau củ và trái cây luôn tươi mới từ khi hái xuống cành đến mâm cơm nhà bạn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative bg-emerald-50/50 rounded-xl p-5 border border-emerald-100 flex flex-col">
                <span className="text-4xl font-extrabold text-emerald-300/80 mb-2">{step.step}</span>
                <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Pillars */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-900 text-white rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center text-emerald-300 mb-4">
                <ThermometerSnowflake size={26} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Chuỗi Cung Ứng Lạnh (Cold Chain)</h3>
              <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                Nhiệt độ là yếu tố sống còn quyết định độ tươi giòn của rau quả. GreenFood ứng dụng hệ thống giữ nhiệt đa tầng: xe tải lạnh chuyên dụng, kho trung chuyển kiểm soát ẩm, và túi cách nhiệt giao hàng trong 2h.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center border-t border-emerald-800/80 pt-4">
              <div>
                <b className="text-xl font-bold text-amber-400">2°C - 6°C</b>
                <p className="text-xs text-emerald-200">Kho bảo quản</p>
              </div>
              <div>
                <b className="text-xl font-bold text-amber-400">&lt; 2 Giờ</b>
                <p className="text-xs text-emerald-200">Giao hỏa tốc</p>
              </div>
              <div>
                <b className="text-xl font-bold text-amber-400">100%</b>
                <p className="text-xs text-emerald-200">Bảo hiểm độ tươi</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                <QrCode size={26} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Truy Xuất Nguồn Gốc Blockchain</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Khách hàng quét mã QR dán trên mỗi túi sản phẩm bằng camera điện thoại để xem trực tiếp nhật ký nông vụ: giống cây, nguồn nước tưới, ngày hái và chứng nhận VietGAP đã được kiểm định.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-700">Thử tra cứu mẫu sản phẩm:</span>
              <Link href="/tracking" className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1">
                Tra cứu ngay <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-emerald-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Cam Kết Đổi Trả 100% Nếu Không Hài Lòng</h3>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto mb-6">
            Nếu sản phẩm giao đến bạn bị hỏng, dập nát hoặc không đạt chất lượng cam kết, GreenFood đổi mới hoặc hoàn tiền ngay trong 24 giờ.
          </p>
          <Link href="/returns" className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-6 py-3 rounded-lg shadow transition-colors inline-block">
            Xem Chính Sách Đổi Trả
          </Link>
        </div>
      </div>
    </div>
  );
}
