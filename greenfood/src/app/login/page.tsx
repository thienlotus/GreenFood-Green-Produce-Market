"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ShieldAlert, User as UserIcon, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const { authenticate, register } = useAuthStore();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
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

      if (password !== confirmPassword) {
        setError('Mật khẩu nhập lại không khớp!');
        return;
      }

      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
      }
      
      const cleanEmail = username.includes('@') ? username : `${username}@greenfood.vn`;
      const res = register({
        name: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: password,
      });

      if (res.success && res.user) {
        toast.success(res.message);
        router.push('/');
      } else {
        setError(res.message);
        toast.error(res.message);
      }
      return;
    }

    // Login process
    const res = authenticate(username, password);
    if (res.success && res.user) {
      toast.success(`Đăng nhập thành công! Chào mừng ${res.user.name}.`);
      if (res.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      return;
    }

    setError(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
    toast.error('Đăng nhập thất bại!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-emerald-600">
          <Link href="/">
            <h1 className="text-4xl text-white font-medium mb-2 font-pacifico cursor-pointer">GreenFood</h1>
          </Link>
          <p className="text-emerald-100">
            {isRegister ? 'Đăng ký tài khoản hệ thống' : 'Đăng nhập vào hệ thống'}
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors shadow-md mt-2 cursor-pointer"
            >
              {isRegister ? <Mail size={20} /> : <ShieldAlert size={20} />}
              {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
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
              <div>
                <p className="mb-4">
                  Chưa có tài khoản?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setIsRegister(true); setError(''); }} 
                    className="text-emerald-600 font-semibold hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </p>

                <div className="pt-4 border-t border-gray-100 text-left">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
                    Tài khoản demo thử nghiệm (Click để điền nhanh)
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('admin@greenfood.vn');
                        setPassword('admin123');
                        setError('');
                      }}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-between border border-emerald-200 transition-colors text-left"
                    >
                      <span className="font-semibold">👑 Quản trị viên (Admin)</span>
                      <span className="text-gray-500 text-[11px]">admin@greenfood.vn / admin123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('khachhang@greenfood.vn');
                        setPassword('123456');
                        setError('');
                      }}
                      className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg flex items-center justify-between border border-gray-200 transition-colors text-left"
                    >
                      <span className="font-semibold">👤 Khách hàng (Customer)</span>
                      <span className="text-gray-500 text-[11px]">khachhang@greenfood.vn / 123456</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('nongdan@greenfood.vn');
                        setPassword('123456');
                        setError('');
                      }}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg flex items-center justify-between border border-amber-200 transition-colors text-left"
                    >
                      <span className="font-semibold">🌾 Nông dân (Vendor)</span>
                      <span className="text-gray-500 text-[11px]">nongdan@greenfood.vn / 123456</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
