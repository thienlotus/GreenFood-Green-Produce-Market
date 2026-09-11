"use client";

import Link from 'next/link';
import { ChevronRight, FileText, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Điều khoản sử dụng</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-6 mb-8">
            <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Pháp lý & Quy định</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2 mb-3">Điều Khoản Và Điều Kiện Sử Dụng</h1>
            <p className="text-sm text-gray-500">Cập nhật lần cuối: Ngày 01 tháng 01 năm 2026</p>
          </div>

          <div className="prose prose-emerald max-w-none space-y-8 text-gray-700 leading-relaxed text-sm lg:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">1.</span> Giới thiệu chung
              </h2>
              <p>
                Chào mừng quý khách đến với sàn thương mại điện tử nông sản <strong>GreenFood</strong> (sau đây gọi tắt là "GreenFood", "chúng tôi"). Việc quý khách truy cập, đăng ký tài khoản và thực hiện đặt hàng trên website đồng nghĩa với việc quý khách chấp thuận và tuân thủ toàn bộ các điều khoản được quy định dưới đây.
              </p>
              <p className="mt-2">
                GreenFood có quyền điều chỉnh, bổ sung nội dung các điều khoản bất cứ lúc nào. Các thay đổi có hiệu lực ngay khi được công bố chính thức trên website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">2.</span> Tài khoản người dùng & Bảo mật
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Người dùng phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký tài khoản (Họ tên, Số điện thoại nhận hàng, Địa chỉ giao hàng).</li>
                <li>Quý khách có trách nhiệm bảo mật mật khẩu và các thông tin truy cập cá nhân. GreenFood không chịu trách nhiệm đối với bất kỳ thiệt hại nào phát sinh do quý khách để lộ thông tin đăng nhập.</li>
                <li>Không sử dụng tài khoản vào các mục đích gian lận, phá hoại hoặc can thiệp trái phép vào hệ thống của GreenFood.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">3.</span> Đặt hàng và Xác nhận đơn hàng
              </h2>
              <p>
                Nông sản là mặt hàng thực phẩm tươi sống có đặc thù về mùa vụ và nguồn cung theo ngày từ các nhà vườn. Khi quý khách đặt hàng trực tuyến:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Đơn hàng chỉ được xem là xác nhận khi nhân viên GreenFood liên hệ qua điện thoại/tin nhắn hoặc hệ thống gửi email xác nhận thành công.</li>
                <li>Trong trường hợp sản phẩm hết mùa vụ hoặc chất lượng thu hoạch trong ngày không đạt chuẩn kiểm định, nhân viên tư vấn sẽ liên hệ để đề xuất sản phẩm thay thế tương đương hoặc hoàn tiền cho quý khách.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">4.</span> Giá cả và Phương thức thanh toán
              </h2>
              <p>
                Tất cả giá niêm yết trên website đã bao gồm thuế giá trị gia tăng (VAT) theo quy định của pháp luật Việt Nam. Chi phí vận chuyển sẽ được tính toán minh bạch tại bước thanh toán tùy thuộc vào khoảng cách và phương thức giao hàng.
              </p>
              <p className="mt-2">
                Chúng tôi hỗ trợ các hình thức thanh toán an toàn: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng qua mã QR VNPay, ví điện tử MoMo, hoặc thẻ thanh toán quốc tế Visa/MasterCard.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">5.</span> Chính sách kiểm hàng & Đổi trả
              </h2>
              <p>
                Quý khách được quyền đồng kiểm cùng tài xế giao hàng khi nhận sản phẩm. Do đặc tính của rau củ quả tươi:
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-3 text-amber-900 text-sm">
                Quý khách vui lòng kiểm tra ngay khi nhận hàng và phản hồi trong vòng <strong>24 giờ</strong> nếu có phát sinh vấn đề dập hỏng, thiếu hàng kèm hình ảnh hoặc video mở hộp để được hỗ trợ bù hàng hoặc hoàn tiền 100%.
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">6.</span> Quyền sở hữu trí tuệ
              </h2>
              <p>
                Mọi hình ảnh, logo, bài viết, dữ liệu nông trại, mã nguồn website GreenFood đều thuộc quyền sở hữu của Công ty Cổ phần GreenFood và được bảo hộ bởi luật sở hữu trí tuệ Việt Nam. Nghiêm cấm sao chép, phân phối hoặc khai thác thương mại mà không có sự đồng ý bằng văn bản.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">7.</span> Liên hệ giải quyết tranh chấp
              </h2>
              <p>
                Mọi tranh chấp phát sinh từ hoặc liên quan đến các điều khoản này trước hết sẽ được ưu tiên giải quyết thông qua thương lượng và hòa giải vì quyền lợi tối thượng của người tiêu dùng.
              </p>
              <p className="mt-2 font-medium">
                Hotline hỗ trợ: <a href="tel:02877702614" className="text-emerald-600 hover:underline">028 7770 2614</a> | Email: <a href="mailto:phaply@greenfood.vn" className="text-emerald-600 hover:underline">phaply@greenfood.vn</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
