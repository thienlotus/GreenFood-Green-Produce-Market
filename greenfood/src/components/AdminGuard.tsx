"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      const role = user?.role?.toLowerCase();
      if (!isAuthenticated || role !== 'admin') {
        toast.error('Truy cập bị từ chối! Bạn không có quyền quản trị.');
        router.push('/login');
      }
    }
  }, [hydrated, isAuthenticated, user, router]);

  // Tránh chớp trắng toàn màn hình khi chuyển tab quản lý
  return <>{children}</>;
}
