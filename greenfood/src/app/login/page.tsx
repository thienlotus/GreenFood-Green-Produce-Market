"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ShieldAlert, User as UserIcon, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuthStore();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Mật khẩu nhập lại không khớp!');
        return;
      }
      
      // Mock successful registration
      login({
        id: `user-${Date.now()}`,
        name: username.split('@')[0],
        email: username.includes('@') ? username : `${username}@greenfood.vn`,
        role: 'customer' // Default role for new users
      });
      toast.success('Đăng ký tài khoản thành công! Tự động đăng nhập.');
      router.push('/');
      return;
    }

    // Hardcoded logic for admin
    if (username === 'admin' && password === '123456') {
      login({
        id: 'admin-1',
        name: 'Quản trị viên',
        email: 'admin@greenfood.vn',
        role: 'admin'
      });
      toast.success('Đăng nhập thành công! Chào mừng Quản trị viên.');
      router.push('/admin');
      return;
    }

    // Hardcoded logic for customer
    if (username === 'khachhang' && password === '123456') {
      login({
        id: 'cust-123',
        name: 'Nguyễn Văn Khách',
        email: 'khach@greenfood.vn',
        role: 'customer'
      });
      toast.success('Đăng nhập thành công! Chào mừng Khách hàng.');
      router.push('/');
      return;
    }

    setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    toast.error('Đăng nhập thất bại!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-emerald-600">
          <Link href="/">
            <h1 className="text-4xl text-white font-medium mb-2 font-[family-name:var(--font-pacifico)] cursor-pointer">GreenFood</h1>
          </Link>
          <p className="text-emerald-100">Đăng nhập vào hệ thống</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Chào mừng trở lại</h2>
          
          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm text-center border border-rose-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập / Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Nhập tài khoản hoặc email..."
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
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
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors shadow-md mt-2"
            >
              {isRegister ? <Mail size={20} /> : <ShieldAlert size={20} />}
              {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? (
              <p>
                Đã có tài khoản?{' '}
                <button onClick={() => setIsRegister(false)} className="text-emerald-600 font-semibold hover:underline">
                  Đăng nhập ngay
                </button>
              </p>
            ) : (
              <p>
                Chưa có tài khoản?{' '}
                <button onClick={() => setIsRegister(true)} className="text-emerald-600 font-semibold hover:underline">
                  Đăng ký ngay
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
