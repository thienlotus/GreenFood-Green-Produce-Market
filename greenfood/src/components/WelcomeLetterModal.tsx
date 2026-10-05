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
  const [isShrinking, setIsShrinking] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // Tự động hiện thư sau 600ms mỗi khi khách vào trang
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [forceOpen]);

  const handleClose = () => {
    setIsShrinking(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsShrinking(false);
      onClose?.();
    }, 280);
  };

  const handleReadAndCollapse = () => {
    toast.success('Đã thu gọn lá thư! Bạn có thể mở lại ở icon góc trái màn hình.', {
      icon: '✉️',
      duration: 3000,
      style: {
        borderRadius: '12px',
        background: '#064e3b',
        color: '#ffffff',
        fontWeight: 600,
        fontSize: '13px',
      },
    });
    handleClose();
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
    const flashSaleEl = document.getElementById('flash-sale');
    if (flashSaleEl) {
      flashSaleEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) {
    return null;
  }

  const handwritingStyle: React.CSSProperties = {
    fontFamily: "'Dancing Script', 'Caveat', 'Playwrite VN', 'Alex Brush', cursive, sans-serif",
    fontStyle: 'italic',
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm transition-opacity duration-300 ${
        isShrinking ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleReadAndCollapse}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`relative w-full max-w-[480px] letter-paper-texture rounded-3xl p-5 sm:p-6 border-2 border-[#d9c7a7] text-[#2c2013] overflow-hidden my-auto shadow-2xl transition-all duration-300 ${
          isShrinking 
            ? 'scale-0 opacity-0 -translate-x-44 translate-y-64 pointer-events-none' 
            : 'scale-100 opacity-100 transform animate-in zoom-in-95'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 50px -10px rgba(44, 32, 19, 0.4), 0 0 0 1px rgba(180, 150, 100, 0.35)',
        }}
      >
        {/* Nút đóng / thu gọn phong cách cổ điển */}
        <button
          type="button"
          onClick={handleReadAndCollapse}
          aria-label="Thu gọn lá thư"
          title="Đã đọc và thu gọn"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-[#ede0c7] hover:bg-[#e2cead] text-[#5c4028] flex items-center justify-center transition-all hover:rotate-90 hover:scale-105 active:scale-95 shadow-xs z-10 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header lá thư: Dấu sáp đỏ & Tiêu đề thư */}
        <div className="flex items-center gap-3 border-b border-dashed border-[#d9c7a7] pb-3 mb-3">
          {/* Con dấu sáp đỏ Vintage dập nổi */}
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-red-800 text-amber-200 flex flex-col items-center justify-center shadow-md border-2 border-red-500/60 shrink-0">
            <span className="text-[8px] font-black uppercase tracking-tighter">GREEN</span>
            <Heart size={11} className="fill-amber-300 text-amber-300 -my-0.5" />
            <span className="text-[7px] font-black uppercase tracking-tighter">FOOD</span>
          </div>
          <div className="min-w-0 pr-6">
            <p className="text-[10px] uppercase tracking-widest text-[#85633e] font-bold">
              Tâm Thư Nông Sản Sạch
            </p>
            <h2 
              className="text-xl sm:text-2xl font-bold text-[#382613] tracking-wide leading-tight"
              style={handwritingStyle}
            >
              Lá Thư Gửi Từ Khu Vườn Xanh
            </h2>
          </div>
        </div>

        {/* Nội dung thư viết tay nét thanh nét đậm nghiêng đẹp */}
        <div className="space-y-2.5 text-[#3d2c1c]">
          <p 
            className="text-2xl sm:text-2xl text-emerald-950 font-bold leading-tight"
            style={handwritingStyle}
          >
            Kính chào Quý khách thân mến,
          </p>

          <p 
            className="text-lg sm:text-[19px] text-[#3d2c1c] leading-relaxed"
            style={handwritingStyle}
          >
            Rạng sáng nay, những giỏ trái cây chín cây mọng nước và rau củ tươi non từ các nhà vườn hợp tác xã VietGAP miền Tây, Đà Lạt và Đắk Lắk vừa cập bến, giữ trọn hương vị tươi giòn tự nhiên.
          </p>

          {/* Hộp ưu đãi hôm nay */}
          <div className="p-3 rounded-2xl bg-[#f4ebd7]/90 border border-[#dfcca8] my-2">
            <p className="font-bold text-[11px] uppercase tracking-wider text-[#7a552b] flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-amber-600 fill-amber-500" />
              Đặc quyền ưu đãi hôm nay dành riêng tặng bạn:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Voucher 1 */}
              <div 
                onClick={() => handleCopy('CHAOBANMOI')}
                className="flex flex-col justify-between p-2 rounded-xl bg-white/90 border border-[#d6be9c] hover:border-emerald-600 hover:bg-emerald-50/60 cursor-pointer transition-all group"
              >
                <div>
                  <div className="flex items-center gap-1 font-bold text-emerald-900 text-[11px]">
                    <Gift size={12} className="text-rose-600 shrink-0" />
                    <span>Giảm 20.000đ</span>
                  </div>
                  <p className="text-[10px] text-[#735532]">Đơn đầu từ 50K</p>
                </div>
                <button 
                  type="button" 
                  aria-label="Sao chép mã CHAOBANMOI"
                  className="mt-1.5 font-mono font-bold text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded flex items-center justify-center gap-1 group-hover:bg-emerald-700 transition-colors w-full"
                >
                  {copiedCode === 'CHAOBANMOI' ? <Check size={11} /> : <Copy size={11} />}
                  <span>CHAOBANMOI</span>
                </button>
              </div>

              {/* Voucher 2 */}
              <div 
                onClick={() => handleCopy('FREESHIP')}
                className="flex flex-col justify-between p-2 rounded-xl bg-white/90 border border-[#d6be9c] hover:border-sky-600 hover:bg-sky-50/60 cursor-pointer transition-all group"
              >
                <div>
                  <div className="flex items-center gap-1 font-bold text-sky-950 text-[11px]">
                    <Sparkles size={12} className="text-sky-600 shrink-0" />
                    <span>Freeship 30K</span>
                  </div>
                  <p className="text-[10px] text-[#735532]">Đơn hàng từ 150K</p>
                </div>
                <button 
                  type="button" 
                  aria-label="Sao chép mã FREESHIP"
                  className="mt-1.5 font-mono font-bold text-[10px] bg-sky-800 text-white px-2 py-0.5 rounded flex items-center justify-center gap-1 group-hover:bg-sky-700 transition-colors w-full"
                >
                  {copiedCode === 'FREESHIP' ? <Check size={11} /> : <Copy size={11} />}
                  <span>FREESHIP</span>
                </button>
              </div>
            </div>
          </div>

          <p 
            className="text-lg sm:text-[19px] text-[#3d2c1c] leading-snug"
            style={handwritingStyle}
          >
            Mời bạn thong thả dạo chợ và chọn những món nông sản tươi ngon, an lành nhất cho bữa cơm ấm cúng gia đình hôm nay!
          </p>
        </div>

        {/* Chữ ký mộc mạc cuối thư */}
        <div className="mt-3 pt-2.5 border-t border-[#dfcca9] flex items-center justify-between">
          <div>
            <p className="text-sm text-[#614526] italic" style={handwritingStyle}>Thương mến từ,</p>
            <p className="text-xl text-emerald-900 font-bold -mt-0.5" style={handwritingStyle}>
              Đội ngũ Nông Dân & GreenFood
            </p>
          </div>

          {/* Dấu triện đỏ mộc mạc */}
          <div className="border border-red-700/80 text-red-700 font-serif font-black text-[9px] px-2 py-0.5 rounded rotate-[-3deg] tracking-widest uppercase">
            Nông Sản Sạch Từ Tâm
          </div>
        </div>

        {/* Nút hành động: Nổi bật nút ĐÃ ĐỌC (Thu gọn) */}
        <div className="mt-4 pt-3 border-t border-[#dfcca9] flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleReadAndCollapse}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#ebdcc4] hover:bg-[#dfcca8] text-[#3d2712] border-2 border-[#bfa278] font-black text-xs transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Check size={15} className="text-emerald-800 stroke-[3]" />
            <span>Đã đọc (Thu gọn)</span>
          </button>

          <button
            type="button"
            onClick={handleAcceptAndShop}
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 hover:from-emerald-700 hover:to-teal-800 text-amber-200 font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-600/40"
          >
            <span>Nhận mã & Đi chợ</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
