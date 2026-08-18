import { MapPin, Phone, Mail, ChevronRight, Facebook, Youtube, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-emerald-900 text-emerald-50 pt-16 pb-8 border-t-[6px] border-emerald-600">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Newsletter & Social */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-10 border-b border-emerald-800 mb-10 gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Đăng ký nhận tin từ GreenFood</h3>
            <p className="text-emerald-200 text-sm">Nhận ngay mã giảm giá 50.000đ cho đơn hàng đầu tiên</p>
          </div>
          <div className="flex-1 flex max-w-md w-full">
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              className="px-4 py-3 rounded-l-lg w-full text-gray-800 focus:outline-none"
            />
            <button className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-r-lg font-bold text-white transition-colors whitespace-nowrap">
              Đăng ký
            </button>
          </div>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center hover:bg-blue-600 transition-colors"><Facebook size={20} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center hover:bg-red-600 transition-colors"><Youtube size={20} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center hover:bg-pink-600 transition-colors"><Instagram size={20} /></a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Cột 1 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">CÔNG TY CỔ PHẦN GREENFOOD</h4>
            <ul className="space-y-4 text-sm text-emerald-100">
              <li className="flex gap-3">
                <MapPin className="shrink-0 mt-0.5 text-emerald-400" size={18} />
                <span>Số 123 Đường Nông Nghiệp, Phường 14, Quận 10, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex gap-3">
                <Phone className="shrink-0 mt-0.5 text-emerald-400" size={18} />
                <div>
                  <a href="tel:02877702614" className="hover:text-amber-400 font-bold transition-colors">028 7770 2614</a>
                  <p className="text-xs text-emerald-300 mt-0.5">Thứ 2 - Thứ 6 (8:00 - 17:30)</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="shrink-0 mt-0.5 text-emerald-400" size={18} />
                <a href="mailto:info@greenfood.vn" className="hover:text-amber-400 transition-colors">info@greenfood.vn</a>
              </li>
              <li className="pt-2">
                Mã số thuế: 0123456789
              </li>
            </ul>
          </div>

          {/* Cột 2 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">VỀ GREENFOOD</h4>
            <ul className="space-y-3 text-sm">
              {[
                "Câu chuyện GreenFood",
                "Nông hộ & Hợp tác xã liên kết",
                "Tiêu chuẩn chất lượng VietGAP",
                "Điều khoản và Điều kiện sử dụng",
                "Chính sách bảo mật thông tin",
                "Dành cho Cộng tác viên",
                "Tuyển dụng"
              ].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="flex items-center gap-2 hover:text-amber-400 transition-colors group">
                    <ChevronRight size={14} className="text-emerald-500 group-hover:text-amber-400" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">HỖ TRỢ KHÁCH HÀNG</h4>
            <ul className="space-y-3 text-sm">
              {[
                "Chính sách giao hàng",
                "Chính sách đổi trả & hoàn tiền",
                "Hướng dẫn mua hàng online",
                "Câu hỏi thường gặp (FAQs)",
                "Quy định về thẻ quà tặng",
                "Xuất hóa đơn GTGT"
              ].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="flex items-center gap-2 hover:text-amber-400 transition-colors group">
                    <ChevronRight size={14} className="text-emerald-500 group-hover:text-amber-400" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">TẢI ỨNG DỤNG MUA SẮM</h4>
            <p className="text-sm mb-4 text-emerald-200">Mua sắm tiện lợi và nhận nhiều ưu đãi độc quyền trên App GreenFood.</p>
            <div className="flex gap-4 mb-8">
              <div className="w-24 h-24 bg-white rounded-lg p-2 shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <a href="#" className="h-10">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-full object-contain" />
                </a>
                <a href="#" className="h-10">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-full object-contain" />
                </a>
              </div>
            </div>

            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">PHƯƠNG THỨC THANH TOÁN</h4>
            <div className="flex gap-2 flex-wrap">
              {['VNPay', 'Momo', 'Visa', 'MasterCard', 'COD'].map(method => (
                <div key={method} className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded">
                  {method}
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-emerald-800 pt-8 text-center text-xs text-emerald-400/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Bản quyền thuộc về Công ty Cổ phần GreenFood.</p>
          <div className="flex items-center gap-4">
            <img src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=7d863f69-d48e-4a64-af08-7a544bebb148" alt="DMCA" className="h-6" />
            <img src="https://luatminhkhue.vn/nhan-dien-thuong-hieu/images/bocongthuong.png" alt="Bộ công thương" className="h-10 grayscale opacity-70" />
          </div>
        </div>
      </div>
    </footer>
  );
}
