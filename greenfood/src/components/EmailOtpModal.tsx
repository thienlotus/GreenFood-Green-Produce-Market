"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, RefreshCw, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailOtpModalProps {
  isOpen: boolean;
  email: string;
  onVerify: (otpCode: string) => Promise<{ success: boolean; message: string }>;
  onResend: () => Promise<{ success: boolean; message: string; remainingAttempts?: number }>;
  onClose: () => void;
}

export default function EmailOtpModal({
  isOpen,
  email,
  onVerify,
  onResend,
  onClose,
}: EmailOtpModalProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState<number>(60); // 60 seconds
  const [remainingAttempts, setRemainingAttempts] = useState<number>(2);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(600);
      setResendCooldown(60);
      setErrorMessage('');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 10-minute expiry countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // 60-second resend cooldown timer
  useEffect(() => {
    if (!isOpen || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  if (!isOpen) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const digit = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setErrorMessage('');

    // Auto-focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    setErrorMessage('');

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const fullCode = otp.join('').trim();
    if (fullCode.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực!');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMessage('Mã xác thực OTP đã hết hạn! Vui lòng nhấn gửi lại mã mới.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await onVerify(fullCode);
      if (res.success) {
        toast.success(res.message || 'Xác thực email thành công!');
        onClose();
      } else {
        setErrorMessage(res.message || 'Mã xác thực không hợp lệ! Vui lòng kiểm tra lại.');
        toast.error(res.message || 'Xác thực thất bại!');
      }
    } catch {
      setErrorMessage('Có lỗi xảy ra khi kết nối máy chủ xác thực!');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage('');

    try {
      const res = await onResend();
      if (res.success) {
        toast.success(res.message);
        setResendCooldown(60);
        setTimeLeft(600);
        setOtp(['', '', '', '', '', '']);
        if (typeof res.remainingAttempts === 'number') {
          setRemainingAttempts(res.remainingAttempts);
        }
        inputRefs.current[0]?.focus();
      } else {
        setErrorMessage(res.message);
        toast.error(res.message);
      }
    } catch {
      setErrorMessage('Không thể gửi lại mã OTP. Vui lòng thử lại sau!');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-center text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-md shadow-inner">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Xác Thực Email</h3>
          <p className="text-emerald-100 text-sm mt-1">
            Nhập mã gồm 6 chữ số để kích hoạt tài khoản GreenFood
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center text-sm text-gray-600">
            Mã xác nhận bảo mật đã được gửi đến:
            <div className="font-semibold text-gray-900 mt-0.5 break-all">{email}</div>
          </div>

          {/* Security guidance banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs px-3.5 py-3 rounded-xl flex items-start gap-2.5 shadow-sm leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              Vui lòng mở ứng dụng <strong>Gmail</strong> hoặc hòm thư của bạn để lấy mã OTP 6 chữ số (kiểm tra cả mục <strong>Hộp thư đến</strong> và <strong>Spam/Quảng cáo</strong>).
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 6 Digit OTP Inputs */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-150 focus:outline-none ${
                    digit
                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900 shadow-sm'
                      : 'border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white text-gray-800'
                  }`}
                />
              ))}
            </div>

            {/* Countdown timer */}
            <div className="flex items-center justify-center gap-1.5 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Mã có hiệu lực trong:</span>
              <span
                className={`font-semibold font-mono ${
                  timeLeft <= 60 ? 'text-rose-600 animate-pulse' : 'text-emerald-700'
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifying || otp.join('').length !== 6 || timeLeft <= 0}
              className={`w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer ${
                isVerifying || otp.join('').length !== 6 || timeLeft <= 0
                  ? 'opacity-60 cursor-not-allowed shadow-none'
                  : ''
              }`}
            >
              {isVerifying ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span>{isVerifying ? 'Đang xác thực...' : 'Xác Thực & Đăng Nhập'}</span>
            </button>
          </form>

          {/* Resend actions */}
          <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-2 text-sm text-gray-500">
            <div>
              Chưa nhận được mã OTP?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className={`font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                  resendCooldown > 0 || isResending
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-emerald-600 hover:text-emerald-700 hover:underline'
                }`}
              >
                {isResending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {resendCooldown > 0 ? `Gửi lại sau (${resendCooldown}s)` : 'Gửi lại mã mới'}
              </button>
            </div>
            {remainingAttempts !== undefined && (
              <div className="text-xs text-gray-400">
                (Còn {remainingAttempts} lượt gửi lại trong 15 phút)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
