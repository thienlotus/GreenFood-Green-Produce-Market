"use client";

import { TrendingUp, Users, ShoppingBag, DollarSign, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getDashboardStats, getAdminOrders, DashboardStats, AdminOrder } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [stats, orders] = await Promise.all([
          getDashboardStats(),
          getAdminOrders()
        ]);
        if (stats) setStatsData(stats);
        if (orders) setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRev = statsData ? `${statsData.total_revenue.toLocaleString('vi-VN')}đ` : '1.675.000đ';
  const totalOrd = statsData ? statsData.total_orders.toString() : recentOrders.length.toString();
  const totalFarm = statsData ? statsData.total_farmers.toString() : '4';
  const totalProd = statsData ? statsData.total_products.toString() : '12';

  const stats = [
    { name: 'Tổng Doanh Thu', value: totalRev, change: '+12.5%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Tổng Đơn Hàng', value: totalOrd, change: '+8.2%', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Nông Hộ & Vườn', value: totalFarm, change: '+4.5%', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Sản Phẩm', value: totalProd, change: '+100%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const revenueData = [
    { name: 'T2', total: 450000 },
    { name: 'T3', total: 520000 },
    { name: 'T4', total: 480000 },
    { name: 'T5', total: 610000 },
    { name: 'T6', total: 590000 },
    { name: 'T7', total: 850000 },
    { name: 'CN', total: 720000 },
  ];

  const topProducts = [
    { name: 'Sầu riêng Ri6 Hạt Lép', sales: 124, revenue: '18.500.000đ' },
    { name: 'Bưởi Da Xanh Ruột Hồng', sales: 98, revenue: '5.400.000đ' },
    { name: 'Dâu Tây Đà Lạt Cấp Đông', sales: 85, revenue: '8.500.000đ' },
    { name: 'Cam Sành Mọng Nước', sales: 62, revenue: '3.200.000đ' },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'processing':
      case 'shipping':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
      case 'delivered':
        return 'text-emerald-600 bg-emerald-100';
      case 'cancelled':
        return 'text-rose-600 bg-rose-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ duyệt';
      case 'processing':
      case 'shipping':
        return 'Đang giao';
      case 'completed':
      case 'delivered':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-medium">{stat.change}</span>
              <span className="text-gray-500 ml-2">so với tháng trước</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ Doanh Thu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Tổng quan Doanh thu tuần</h3>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6b7280', fontSize: 12}} 
                  tickFormatter={(value) => `${value / 1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: any) => [`${Number(value || 0).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                />
                <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          {/* Đơn hàng gần đây */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h3>
              <Link href="/admin/orders" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Xem tất cả</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Mã đơn</th>
                    <th className="pb-3 font-medium">Khách hàng</th>
                    <th className="pb-3 font-medium text-right">Tổng tiền</th>
                    <th className="pb-3 font-medium text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                        Chưa có đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="py-3 text-sm font-semibold text-gray-800 font-mono">{order.id}</td>
                        <td className="py-3 text-sm text-gray-600">{order.customer}</td>
                        <td className="py-3 text-sm font-medium text-gray-900 text-right">{order.total}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sản phẩm bán chạy */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm nổi bật</h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} đã bán</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

