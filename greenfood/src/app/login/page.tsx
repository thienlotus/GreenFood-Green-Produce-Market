"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ShieldAlert, User as UserIcon, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import EmailOtpModal from '@/components/EmailOtpModal';

import BrandLogo from '@/components/BrandLogo';

export default function LoginPage() {
  const { authenticate, register, verifyEmailApi, resendOtpApi } = useAuthStore();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email OTP state (Sprint 2)
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!fullName.trim()) {
        setError('Vui lòng nhập họ và tên!');
        return;
      }

      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!cleanPhone) {
        setError('Vui lòng nhập số điện thoại!');
        return;
      }

      const phoneRegex = /^(0|\+?84)[35789][0-9]{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setError('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số điện thoại di động (bắt đầu bằng 03, 05, 07, 08, 09).');
        return;
      }

      const cleanEmail = username.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        setError('Địa chỉ email không đúng định dạng! Vui lòng nhập đúng email có thật (VD: yourname@gmail.com).');
        return;
      }

      if (cleanEmail.endsWith('@gmial.com') || cleanEmail.endsWith('@gmai.com') || cleanEmail.endsWith('@gamil.com')) {
        setError('Địa chỉ email có dấu hiệu sai chính tả tên miền (@gmial / @gmai). Vui lòng kiểm tra lại đuôi @gmail.com!');
        return;
      }

      if (password !== confirmPassword) {
        setError('Mật khẩu nhập lại không khớp!');
        return;
      }

      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await register({
          name: fullName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          password: password,
        });

        if (res.success && res.requireOtp) {
          toast.success(res.message);
          setPendingEmail(cleanEmail);
          setShowOtpModal(true);
        } else if (res.success && res.user) {
          toast.success(res.message);
          router.push('/');
        } else {
          setError(res.message);
          toast.error(res.message);
        }
      } catch (err: any) {
        setError('Có lỗi xảy ra trong quá trình lưu dữ liệu!');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Login process
    setIsLoading(true);
    try {
      const res = await authenticate(username.trim(), password);
      if (res.success && res.user) {
        toast.success(`Đăng nhập thành công! Chào mừng ${res.user.name}.`);
        if (res.user.role?.toLowerCase() === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        return;
      }

      if (res.requireOtp) {
        setPendingEmail(res.email || username.trim());
        setShowOtpModal(true);
        setError(res.message || 'Tài khoản chưa được kích hoạt email! Vui lòng nhập mã OTP để tiếp tục.');
        toast.error(res.message || 'Tài khoản chưa kích hoạt email! Vui lòng xác thực OTP.');
        return;
      }

      setError(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      toast.error(res.message || 'Đăng nhập thất bại!');
    } catch (err: any) {
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    const res = await verifyEmailApi(pendingEmail, otpCode);
    if (res.success && res.user) {
      toast.success(res.message || 'Xác thực email thành công! Đang đăng nhập...');
      setTimeout(() => {
        router.push('/');
      }, 400);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Mã xác thực không hợp lệ!' };
  };

  const handleResendOtp = async () => {
    return await resendOtpApi(pendingEmail, isRegister ? fullName : undefined, isRegister ? phone : undefined);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-watermark-pattern px-4 py-12 relative">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-elevated-card border border-emerald-900/10 overflow-hidden">
        <div className="p-8 text-center bg-gradient-to-br from-emerald-800 to-teal-800 text-white shadow-inner flex flex-col items-center justify-center">
          <BrandLogo variant="dark" size="md" href="/" className="justify-center mb-3" />
          <p className="text-emerald-100/90 text-sm font-medium">
            {isRegister ? 'Đăng ký tài khoản GreenFood' : 'Đăng nhập vào tài khoản'}
          </p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm text-center border border-rose-200">
                {error}
              </div>
            )}

            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Nhập họ và tên..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="VD: 0901234567"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRegister ? 'Email đăng ký' : 'Tên đăng nhập / Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isRegister ? <Mail className="h-5 w-5 text-gray-400" /> : <UserIcon className="h-5 w-5 text-gray-400" />}
                </div>
                <input
                  type={isRegister ? "email" : "text"}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder={isRegister ? "VD: yourname@gmail.com" : "Nhập tài khoản hoặc email..."}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors shadow-md mt-2 cursor-pointer ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isRegister ? <Mail size={20} /> : <ShieldAlert size={20} />
              )}
              {isLoading ? 'Đang xử lý...' : (isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? (
              <p>
                Đã có tài khoản?{' '}
                <button 
                  type="button" 
                  onClick={() => { setIsRegister(false); setError(''); }} 
                  className="text-emerald-600 font-semibold hover:underline cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              </p>
            ) : (
              <p>
                Chưa có tài khoản?{' '}
                <button 
                  type="button" 
                  onClick={() => { setIsRegister(true); setError(''); }} 
                  className="text-emerald-600 font-semibold hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal nhập mã OTP xác thực Email (Sprint 2) */}
      <EmailOtpModal
        isOpen={showOtpModal}
        email={pendingEmail}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={() => setShowOtpModal(false)}
      />
    </div>
  );
}
