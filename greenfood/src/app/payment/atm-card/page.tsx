"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowLeft, CreditCard, Lock, CheckCircle2, 
  AlertCircle, Building2, Smartphone, Timer, Sparkles, ChevronRight
} from 'lucide-react';
import { processCardPayment } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';

const BANKS = [
  { code: 'NCB', name: 'Ngân hàng Quốc Dân (NCB)', short: 'NCB', color: 'bg-blue-600' },
  { code: 'VCB', name: 'Vietcombank', short: 'VCB', color: 'bg-emerald-700' },
  { code: 'TCB', name: 'Techcombank', short: 'TCB', color: 'bg-rose-600' },
  { code: 'MB', name: 'MBBank', short: 'MB', color: 'bg-blue-700' },
  { code: 'BIDV', name: 'BIDV', short: 'BIDV', color: 'bg-cyan-700' },
  { code: 'AGR', name: 'Agribank', short: 'AGR', color: 'bg-red-700' },
  { code: 'ACB', name: 'ACB Bank', short: 'ACB', color: 'bg-sky-600' },
  { code: 'VPB', name: 'VPBank', short: 'VPB', color: 'bg-green-600' },
];

function CardPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const rawOrderId = searchParams.get('orderId') || '';
  const rawAmount = searchParams.get('amount') || '';

  const [orderId, setOrderId] = useState(rawOrderId);
  const [amount, setAmount] = useState<number>(Number(rawAmount) || 50000);

  // Form states
  const [selectedBank, setSelectedBank] = useState('NCB');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [otp, setOtp] = useState('');

  // UI Flow states: 1 = Nhập thẻ, 2 = Xác thực OTP, 3 = Đang xử lý
  const [step, setStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Đếm ngược 15 phút
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (rawOrderId) setOrderId(rawOrderId);
    if (rawAmount) setAmount(Number(rawAmount));
  }, [rawOrderId, rawAmount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format số thẻ cách 4 chữ số
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 19);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format ngày phát hành MM/YY
  const handleDateChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setIssueDate(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setIssueDate(raw);
    }
  };

  // Nút điền thẻ mẫu Napas test cực kỳ tiện lợi
  const fillSampleCard = () => {
    setSelectedBank('NCB');
    setCardNumber('9704 1985 2619 1432');
    setCardHolder('NGUYEN VAN A');
    setIssueDate('07/15');
    setOtp('123456');
    setErrorMessage('');
  };

  // Chuyển sang bước OTP
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const rawNum = cardNumber.replace(/\s+/g, '');
    if (rawNum.length < 12) {
      setErrorMessage('Vui lòng nhập số thẻ ATM hợp lệ (ít nhất 12 chữ số).');
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMessage('Vui lòng nhập tên chủ thẻ in trên thẻ.');
      return;
    }
    if (!issueDate.trim() || issueDate.length < 4) {
      setErrorMessage('Vui lòng nhập tháng/năm phát hành (MM/YY).');
      return;
    }

    setStep(2);
    if (!otp) setOtp('123456');
  };

  // Xác nhận thanh toán cuối cùng
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const res = await processCardPayment({
        order_id: orderId,
        card_number: cardNumber.replace(/\s+/g, ''),
        card_holder: cardHolder.trim(),
        issue_date: issueDate.trim(),
        bank_code: selectedBank,
        otp: otp.trim() || '123456',
      });

      if (res && res.success) {
        clearCart();
        const finalTracking = res.data?.tracking_number || orderId;
        const ghnCode = res.data?.ghn_order_code || '';
        const transId = res.data?.trans_id || '';
        router.push(
          `/payment/atm-card/success/?orderId=${encodeURIComponent(finalTracking)}&ghnCode=${encodeURIComponent(ghnCode)}&transId=${encodeURIComponent(transId)}&amount=${amount}`
        );
      } else {
        setErrorMessage(res?.message || 'Giao dịch thanh toán không thành công. Vui lòng kiểm tra lại thông tin.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Có lỗi xảy ra khi kết nối máy chủ thanh toán.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation Bar: Nút Quay Về Web Chuẩn */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Quay về giỏ hàng
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-full">
            <Lock size={13} className="text-emerald-700" />
            Cổng thanh toán thẻ Napas Bảo mật SSL 256-bit
          </div>
        </div>

        {/* Main Grid: Form Thanh toán + Tóm tắt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI: FORM THANH TOÁN THẺ */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              {/* Tiêu đề & Logo Napas */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    Cổng thẻ nội địa Napas 247
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
                    {step === 1 ? 'Thông tin thẻ ATM ngân hàng' : 'Xác thực OTP ngân hàng'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {step === 1 
                      ? 'Thanh toán trực tiếp bằng thẻ ATM của tất cả ngân hàng Việt Nam'
                      : 'Nhập mã xác thực Smart OTP được gửi đến số điện thoại'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <CreditCard size={24} />
                </div>
              </div>

              {/* Thông báo lỗi nếu có */}
              {errorMessage && (
                <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* BƯỚC 1: NHẬP THÔNG TIN THẺ */}
              {step === 1 && (
                <form onSubmit={handleProceedToOtp} className="space-y-5">
                  {/* Chọn nhanh Ngân hàng */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Chọn Ngân hàng phát hành
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {BANKS.map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => setSelectedBank(b.code)}
                          className={`p-2.5 text-center rounded-xl border transition-all text-xs font-bold ${
                            selectedBank === b.code
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                          }`}
                        >
                          <span className="block font-mono text-sm">{b.short}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nhập số thẻ ATM */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Số thẻ ATM (in trên mặt trước)
                      </label>
                      <button
                        type="button"
                        onClick={fillSampleCard}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Sparkles size={13} /> Dùng thẻ mẫu Napas
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="9704 •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="w-full px-4 py-3.5 text-base font-mono font-bold tracking-wider rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-sm text-slate-800"
                      />
                      <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Tên chủ thẻ & Ngày phát hành */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tên in trên thẻ (không dấu)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="NGUYEN VAN A"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 text-sm font-bold uppercase rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:font-normal text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Ngày phát hành (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY (VD: 07/15)"
                        value={issueDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full px-4 py-3 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:font-normal text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Tiến hành xác thực thanh toán <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              )}

              {/* BƯỚC 2: XÁC THỰC SMART OTP */}
              {step === 2 && (
                <form onSubmit={handleConfirmPayment} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Smartphone size={15} /> Mã OTP xác thực giao dịch
                    </p>
                    <p className="text-amber-700">
                      Ngân hàng đã gửi mã OTP 6 số đến số điện thoại của bạn. (Mã thử nghiệm Sandbox: <strong>123456</strong>)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Nhập mã OTP (6 số)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full text-center py-4 px-4 text-2xl font-mono font-black tracking-[0.5em] rounded-2xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-emerald-800"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={isProcessing}
                      className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all"
                    >
                      ← Đổi thẻ khác
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang tạo đơn & vận đơn GHN...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} /> Xác nhận thanh toán {amount.toLocaleString('vi-VN')}đ
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & BẢO MẬT */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chi tiết giao dịch
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                  <Timer size={13} /> {formatTime(timeLeft)}
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã đơn hàng:</span>
                  <strong className="font-mono text-slate-800 font-bold">#{orderId || 'GF-DEMO'}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Đơn vị thụ hưởng:</span>
                  <strong className="text-slate-800 font-semibold">GREENFOOD MARKET</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Kênh thanh toán:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    Napas Domestic Card
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3.5 flex justify-between items-baseline">
                  <span className="text-slate-600 font-medium">Số tiền thanh toán:</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Thông tin thẻ đã nhập preview */}
              {cardNumber && (
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md space-y-2">
                  <div className="flex justify-between items-center text-xs opacity-80">
                    <span>{BANKS.find(b => b.code === selectedBank)?.name}</span>
                    <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Napas</span>
                  </div>
                  <div className="font-mono tracking-wider font-bold text-base py-1">
                    {cardNumber}
                  </div>
                  <div className="flex justify-between items-end text-xs opacity-90 pt-1">
                    <span className="font-bold uppercase tracking-wider">{cardHolder || 'CHỦ THẺ'}</span>
                    <span className="font-mono text-[11px]">{issueDate || 'MM/YY'}</span>
                  </div>
                </div>
              )}

              {/* Badges cam kết an toàn */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Mã hóa đường truyền an toàn chuẩn PCI-DSS Level 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600 shrink-0" />
                  <span>Tự động tạo mã vận đơn Giao Hàng Nhanh (GHN) sau thanh toán</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CardPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CardPaymentContent />
    </Suspense>
  );
}
