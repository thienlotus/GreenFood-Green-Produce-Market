"use client";

import { useEffect, useState } from 'react';
import { X, Sparkles, Copy, Check, ArrowRight, Heart, Gift, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WelcomeLetterModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function WelcomeLetterModal({ forceOpen = false, onClose }: WelcomeLetterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [dontShowAgainToday, setDontShowAgainToday] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const dismissedDate = localStorage.getItem('greenfood_welcome_letter_dismissed_date');
      const sessionSeen = sessionStorage.getItem('greenfood_welcome_letter_seen');

      if (dismissedDate === todayStr || sessionSeen === 'true') {
        return;
      }

      // Hiện sau 900ms để trải nghiệm mượt mà, không giật màn hình
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('greenfood_welcome_letter_seen', 'true');
      }, 900);

      return () => clearTimeout(timer);
    } catch {
      // Fallback nếu localStorage bị chặn
    }
  }, [forceOpen]);

  const handleClose = () => {
    if (dontShowAgainToday) {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem('greenfood_welcome_letter_dismissed_date', todayStr);
      } catch {}
    }
    setIsOpen(false);
    onClose?.();
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Đã lưu mã ưu đãi: ${code}`, {
        icon: '🎁',
        style: {
          borderRadius: '12px',
          background: '#064e3b',
          color: '#ffffff',
          fontWeight: 600,
        },
      });
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      toast(`Mã ưu đãi của bạn: ${code}`, { icon: '🎁' });
    }
  };

  const handleAcceptAndShop = () => {
    handleCopy('CHAOBANMOI');
    handleClose();
    // Cuộn mượt đến Flash Sale hoặc gian hàng
    const flashSaleEl = document.getElementById('flash-sale');
    if (flashSaleEl) {
      flashSaleEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-xl letter-paper-texture rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-[#d9c7a7] text-[#2c2013] overflow-hidden transform animate-in zoom-in-95 duration-400"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(44, 32, 19, 0.35), 0 0 0 1px rgba(180, 150, 100, 0.35)',
        }}
      >
        {/* Nút đóng phong cách cổ điển */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng thư chào mừng"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-[#f0e4cc] hover:bg-[#e6d3b3] text-[#5c4028] flex items-center justify-center transition-all hover:rotate-90 hover:scale-105 active:scale-95 shadow-sm"
        >
          <X size={18} />
        </button>

        {/* Họa tiết tem thư bưu điện nông trại & Dấu sáp đỏ (Wax Seal) */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#d9c7a7] pb-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Con dấu sáp đỏ Vintage */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-red-800 text-amber-200 flex flex-col items-center justify-center shadow-lg border-2 border-red-500/60 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-tighter">GREEN</span>
              <Heart size={12} className="fill-amber-300 text-amber-300 -my-0.5" />
              <span className="text-[8px] font-black uppercase tracking-tighter">FOOD</span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#85633e] font-bold">
                Tâm Thư Nông Sản Sạch
              </p>
              <h2 className="text-xl sm:text-2xl font-bold font-handwriting text-[#382613] tracking-wide">
                Lá Thư Gửi Từ Khu Vườn Xanh
              </h2>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[10px] font-mono text-[#8c6d48] uppercase tracking-wider bg-[#eddcc4] px-2 py-0.5 rounded border border-[#d6be9c]">
              Thu hoạch 2026
            </span>
            <span className="text-[11px] font-semibold text-[#664b2c] mt-0.5 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-700" /> Chuẩn VietGAP 100%
            </span>
          </div>
        </div>

        {/* Lời chào và nội dung chữ viết tay mộc mạc */}
        <div className="space-y-3.5 text-sm sm:text-base leading-relaxed text-[#3d2c1c]">
          <p className="font-handwriting text-2xl sm:text-3xl text-emerald-950 font-bold leading-tight">
            Kính chào Quý khách thân mến,
          </p>

          <p className="font-handwriting text-xl sm:text-2xl text-[#3d2c1c] leading-relaxed">
            Rạng sáng nay, những giỏ trái cây chín cây mọng nước và rau củ tươi non từ các nhà vườn hợp tác xã chuẩn VietGAP miền Tây, Đà Lạt và Tây Nguyên vừa cập bến GreenFood, giữ trọn hương vị tươi giòn tự nhiên của đất lành.
          </p>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f4ebd7]/80 border border-[#e0cda8] my-3">
            <p className="font-bold text-xs uppercase tracking-wider text-[#7a552b] flex items-center gap-1.5 mb-2.5">
              <Sparkles size={14} className="text-amber-600 fill-amber-500" />
              Đặc quyền ưu đãi độc quyền hôm nay dành tặng bạn:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
              {/* Voucher 1 */}
              <div 
                onClick={() => handleCopy('CHAOBANMOI')}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/80 border border-[#d6be9c] hover:border-emerald-600 hover:bg-emerald-50/50 cursor-pointer transition-all group"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Gift size={13} className="text-rose-600" />
                    <span>Giảm 20.000đ</span>
                  </div>
                  <p className="text-[11px] text-[#735532]">Đơn đầu tiên từ 50K</p>
                </div>
                <button 
                  type="button" 
                  aria-label="Sao chép mã CHAOBANMOI"
                  className="font-mono font-bold text-xs bg-emerald-800 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs group-hover:bg-emerald-700 transition-colors"
                >
                  {copiedCode === 'CHAOBANMOI' ? <Check size={12} /> : <Copy size={12} />}
                  <span>CHAOBANMOI</span>
                </button>
              </div>

              {/* Voucher 2 */}
              <div 
                onClick={() => handleCopy('FREESHIP')}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/80 border border-[#d6be9c] hover:border-sky-600 hover:bg-sky-50/50 cursor-pointer transition-all group"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sky-950">
                    <Sparkles size={13} className="text-sky-600" />
                    <span>Freeship 30.000đ</span>
                  </div>
                  <p className="text-[11px] text-[#735532]">Đơn hàng từ 150K</p>
                </div>
                <button 
                  type="button" 
                  aria-label="Sao chép mã FREESHIP"
                  className="font-mono font-bold text-xs bg-sky-800 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs group-hover:bg-sky-700 transition-colors"
                >
                  {copiedCode === 'FREESHIP' ? <Check size={12} /> : <Copy size={12} />}
                  <span>FREESHIP</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#8c6d48] mt-2 italic text-center">
              ⚡ Flash Sale hôm nay: Giảm đến 40% cho Sầu riêng Ri6, Bưởi da xanh và Cam sành mọng nước.
            </p>
          </div>

          <p className="font-handwriting text-xl sm:text-2xl text-[#3d2c1c]">
            Mời bạn thong thả dạo chợ và chọn những món nông sản tươi sạch, thơm ngọt và an lành nhất cho bữa cơm ấm cúng hôm nay!
          </p>
        </div>

        {/* Chữ ký mộc mạc cuối thư */}
        <div className="mt-4 pt-3 border-t border-[#dfcca9] flex items-center justify-between">
          <div>
            <p className="font-handwriting text-lg text-[#614526] italic">Thương mến từ,</p>
            <p className="font-handwriting text-2xl text-emerald-900 font-bold -mt-1">
              Đội ngũ Nông Dân & GreenFood
            </p>
          </div>

          {/* Dấu triện đỏ chữ Hán/Việt mộc mạc */}
          <div className="border-2 border-red-700/80 text-red-700 font-serif font-black text-[10px] px-2 py-1 rounded rotate-[-4deg] tracking-widest uppercase">
            Nông Sản Sạch Từ Tâm
          </div>
        </div>

        {/* Nút hành động chính */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#705230]">
            <input
              type="checkbox"
              checked={dontShowAgainToday}
              onChange={(e) => setDontShowAgainToday(e.target.checked)}
              className="rounded border-[#cbb391] text-emerald-700 focus:ring-emerald-500"
            />
            <span>Không hiện lại trong hôm nay</span>
          </label>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-[#d6be9c] text-[#5e4325] hover:bg-[#eddcc4] font-bold text-xs transition-colors"
            >
              Đóng thư
            </button>
            <button
              type="button"
              onClick={handleAcceptAndShop}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span>Nhận ưu đãi & Đi chợ ngay</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
