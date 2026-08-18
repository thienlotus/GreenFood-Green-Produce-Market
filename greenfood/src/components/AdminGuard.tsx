"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || user?.role !== 'admin') {
        toast.error('Truy cập bị từ chối! Bạn không có quyền quản trị.');
        router.push('/');
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Đang kiểm tra quyền truy cập...</div>;
  }

  return <>{children}</>;
}
