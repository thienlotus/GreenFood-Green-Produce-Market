"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, RotateCcw } from 'lucide-react';
import { checkMomoPaymentStatus } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';

function MomoReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [transId, setTransId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const rawOrderId = searchParams.get('orderId') || '';
    const resultCode = searchParams.get('resultCode');
    const rawTransId = searchParams.get('transId') || '';
    const rawAmount = searchParams.get('amount');
    const rawMessage = searchParams.get('message') || '';

    setOrderId(rawOrderId);
    setTransId(rawTransId);
    if (rawAmount) setAmount(Number(rawAmount));

    const success = (resultCode === '0' || resultCode === '9000');
    setIsSuccess(success);
    setMessage(rawMessage || (success ? 'Giao dịch MoMo thành công!' : 'Thanh toán MoMo không thành công.'));

    if (success) {
      clearCart();
    }

    // Verify with backend
    if (rawOrderId) {
      checkMomoPaymentStatus(rawOrderId)
        .then((res) => {
          if (res && res.resultCode === 0) {
            setIsSuccess(true);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [searchParams, clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">Đang đối soát kết quả MoMo...</h2>
        <p className="text-gray-500 text-sm mt-1">Vui lòng không tắt hoặc tải lại trang.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden">
        {/* Decorative background circle */}
        <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10 ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
              <CheckCircle2 size={44} />
            </div>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full uppercase tracking-wider inline-block mb-3">
              Ví MoMo Xác Nhận
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              Thanh Toán Thành Công!
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Đơn hàng của bạn đã được xác nhận thanh toán trực tuyến qua Ví MoMo.
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-emerald-700">#{orderId || 'GF-MOMO'}</span>
              </div>
              {transId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mã giao dịch MoMo:</span>
                  <span className="font-mono text-gray-800">{transId}</span>
                </div>
              )}
              {amount !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số tiền thanh toán:</span>
                  <span className="font-bold text-pink-600 text-base">{amount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Trạng thái đơn:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đã xác nhận (CONFIRMED)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/tracking"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingBag size={18} /> Theo dõi đơn hàng
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 px-6 rounded-xl transition-all"
              >
                Tiếp tục mua hàng <ArrowRight size={18} />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <XCircle size={44} />
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full uppercase tracking-wider inline-block mb-3">
              Giao Dịch Bị Hủy / Thất Bại
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              Thanh Toán Chưa Hoàn Tất
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              {message || 'Giao dịch qua ví MoMo không thành công hoặc bạn đã hủy giao dịch.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all"
              >
                <RotateCcw size={18} /> Thử lại thanh toán
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 px-6 rounded-xl transition-all"
              >
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MomoReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <MomoReturnContent />
    </Suspense>
  );
}
