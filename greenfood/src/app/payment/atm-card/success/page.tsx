"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, ShoppingBag, ArrowRight, Truck, 
  CreditCard, ExternalLink, ShieldCheck, Home
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

function CardPaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();

  const orderId = searchParams.get('orderId') || '';
  const ghnCode = searchParams.get('ghnCode') || '';
  const transId = searchParams.get('transId') || '';
  const amount = searchParams.get('amount') || '';

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[85vh] bg-slate-50/70 py-12 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 text-center relative overflow-hidden">
        {/* Vòng tròn trang trí nền */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-emerald-100/50 pointer-events-none"></div>

        {/* Icon thành công */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner animate-bounce">
          <CheckCircle2 size={46} />
        </div>

        <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase tracking-wider inline-block mb-3">
          Napas 247 • Giao dịch hoàn tất
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Thanh Toán Thành Công!
        </h1>
        <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
          Cảm ơn bạn đã mua sắm tại <strong>GreenFood Market</strong>. Đơn hàng của bạn đã được thanh toán và chuyển trực tiếp tới hệ thống giao vận.
        </p>

        {/* Box Chi tiết đơn hàng & Vận đơn GHN */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left space-y-3.5 border border-slate-200/70">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Mã đơn hàng:</span>
            <strong className="font-mono text-emerald-700 text-base font-bold">
              #{orderId || 'GF-ATM'}
            </strong>
          </div>

          {transId && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Mã giao dịch Napas:</span>
              <span className="font-mono text-slate-700 text-xs">{transId}</span>
            </div>
          )}

          {amount && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Số tiền đã thanh toán:</span>
              <strong className="text-emerald-600 text-base font-extrabold">
                {Number(amount).toLocaleString('vi-VN')}đ
              </strong>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Hình thức:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <CreditCard size={14} className="text-emerald-600" /> Thẻ ATM Nội địa (Napas)
            </span>
          </div>

          {/* VẬN ĐƠN GHN */}
          {ghnCode && (
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <Truck size={16} className="text-blue-600" /> Vận đơn GHN:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {ghnCode}
                </span>
                <Link
                  href={`/tracking?order_code=${encodeURIComponent(ghnCode)}`}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 hover:underline"
                >
                  Theo dõi <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Nút hành động chuẩn web */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/tracking?order_code=${encodeURIComponent(ghnCode || orderId)}`}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all text-sm"
          >
            <ShoppingBag size={18} /> Theo dõi đơn hàng
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-2xl transition-all text-sm"
          >
            <Home size={16} /> Về trang chủ
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          Giao dịch được bảo mật và lưu trữ an toàn bởi GreenFood
        </div>
      </div>
    </div>
  );
}

export default function CardPaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CardPaymentSuccessContent />
    </Suspense>
  );
}
