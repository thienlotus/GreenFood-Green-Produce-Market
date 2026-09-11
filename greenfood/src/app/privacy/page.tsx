"use client";

import Link from 'next/link';
import { ChevronRight, Lock, Eye, ShieldCheck, Database, UserCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Chính sách bảo mật</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-6 mb-8">
            <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Bảo Vệ Dữ Liệu Khách Hàng</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2 mb-3">Chính Sách Bảo Mật Thông Tin</h1>
            <p className="text-sm text-gray-500">Cam kết bảo mật tuyệt đối theo Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
              <Lock className="text-emerald-600 shrink-0" size={24} />
              <div>
                <b className="text-xs text-gray-900 block">Mã Hóa SSL 256-bit</b>
                <span className="text-[11px] text-gray-600">Bảo mật giao dịch trực tuyến</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center gap-3">
              <Eye className="text-blue-600 shrink-0" size={24} />
              <div>
                <b className="text-xs text-gray-900 block">Không Bán Dữ Liệu</b>
                <span className="text-[11px] text-gray-600">Tuyệt đối không chia sẻ bên thứ 3</span>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-center gap-3">
              <UserCheck className="text-amber-600 shrink-0" size={24} />
              <div>
                <b className="text-xs text-gray-900 block">Quyền Làm Chủ Dữ Liệu</b>
                <span className="text-[11px] text-gray-600">Yêu cầu xóa/sửa bất kỳ lúc nào</span>
              </div>
            </div>
          </div>

          <div className="prose prose-emerald max-w-none space-y-8 text-gray-700 leading-relaxed text-sm lg:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">1.</span> Mục đích thu thập thông tin
              </h2>
              <p>GreenFood thu thập thông tin khách hàng nhằm phục vụ các mục đích sau:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Xử lý và bàn giao đơn hàng nông sản đến địa chỉ yêu cầu.</li>
                <li>Thông báo về trạng thái đơn hàng, xác nhận thời gian giao rau củ tươi.</li>
                <li>Cung cấp dịch vụ chăm sóc khách hàng, hỗ trợ khiếu nại, bảo hành sản phẩm.</li>
                <li>Gửi các chương trình ưu đãi, giảm giá mùa vụ và tri ân thành viên (khi có sự đồng ý của quý khách).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">2.</span> Phạm vi thông tin thu thập
              </h2>
              <p>Các dữ liệu chúng tôi thu thập khi bạn tương tác với sàn GreenFood bao gồm:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Thông tin cá nhân: Họ tên, số điện thoại, email, địa chỉ nhận hàng.</li>
                <li>Thông tin tài khoản: Tên đăng nhập, mật khẩu được băm (hash) bảo mật.</li>
                <li>Lịch sử mua hàng: Các đơn hàng đã đặt, sở thích nông sản, phản hồi đánh giá chất lượng.</li>
                <li>Dữ liệu kỹ thuật: Địa chỉ IP, loại trình duyệt, cookie phiên đăng nhập để tối ưu trải nghiệm.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">3.</span> Thời gian lưu trữ thông tin
              </h2>
              <p>
                Dữ liệu cá nhân của khách hàng sẽ được lưu trữ an toàn trên máy chủ của GreenFood cho đến khi có yêu cầu hủy bỏ từ phía khách hàng hoặc khi tài khoản không hoạt động quá 24 tháng liên tục.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">4.</span> Đơn vị tiếp cận thông tin
              </h2>
              <p>GreenFood cam kết không bán, chia sẻ dữ liệu cho mục đích thương mại. Chỉ những đơn vị sau được tiếp cận trong giới hạn công việc:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Bộ phận kho vận & Đơn vị vận chuyển (AhaMove, Grab, hoặc tài xế nội bộ GreenFood) để thực hiện giao nhận hàng.</li>
                <li>Cổng thanh toán điện tử (VNPay, MoMo) để đối soát giao dịch an toàn.</li>
                <li>Cơ quan thẩm quyền nhà nước khi có yêu cầu theo luật định.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">5.</span> Quyền của quý khách đối với dữ liệu
              </h2>
              <p>
                Quý khách có toàn quyền kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình bằng cách đăng nhập vào tài khoản trên website hoặc yêu cầu Bộ phận hỗ trợ của GreenFood thực hiện qua email: <a href="mailto:privacy@greenfood.vn" className="text-emerald-600 font-bold hover:underline">privacy@greenfood.vn</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
