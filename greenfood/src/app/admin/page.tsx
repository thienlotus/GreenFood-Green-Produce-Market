"use client";

import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  PackageCheck,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getDashboardStats, getAdminOrders, DashboardStats, AdminOrder } from '@/lib/api';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';
import Link from 'next/link';

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalRev = statsData ? `${statsData.total_revenue.toLocaleString('vi-VN')}đ` : '2.275.000đ';
  const totalOrd = statsData ? statsData.total_orders.toString() : recentOrders.length.toString();
  const totalFarm = statsData ? statsData.total_farmers.toString() : '6';
  const totalProd = statsData ? statsData.total_products.toString() : '12';

  const stats = [
    { 
      name: 'Tổng Doanh Thu', 
      value: totalRev, 
      change: '+12.5%', 
      isUp: true, 
      icon: DollarSign, 
      color: 'from-emerald-500 to-teal-600', 
      shadow: 'shadow-emerald-500/10' 
    },
    { 
      name: 'Tổng Đơn Hàng', 
      value: totalOrd, 
      change: '+8.2%', 
      isUp: true, 
      icon: ShoppingBag, 
      color: 'from-blue-500 to-indigo-600', 
      shadow: 'shadow-blue-500/10' 
    },
    { 
      name: 'Nông Hộ & Vườn', 
      value: totalFarm, 
      change: '+4.5%', 
      isUp: true, 
      icon: Users, 
      color: 'from-amber-500 to-orange-600', 
      shadow: 'shadow-amber-500/10' 
    },
    { 
      name: 'Sản Phẩm Đang Bán', 
      value: totalProd, 
      change: '+100%', 
      isUp: true, 
      icon: TrendingUp, 
      color: 'from-purple-500 to-pink-600', 
      shadow: 'shadow-purple-500/10' 
    },
  ];

  const revenueData = (statsData?.daily_revenue && statsData.daily_revenue.length > 0)
    ? statsData.daily_revenue
    : [
        { name: 'T2', total: 450000 },
        { name: 'T3', total: 520000 },
        { name: 'T4', total: 480000 },
        { name: 'T5', total: 610000 },
        { name: 'T6', total: 590000 },
        { name: 'T7', total: 850000 },
        { name: 'CN', total: 720000 },
      ];

  const topProducts = (statsData?.top_products && statsData.top_products.length > 0)
    ? statsData.top_products
    : [
        { name: 'Sầu riêng Ri6 Hạt Lép', sales: 124, revenue: '18.500.000đ' },
        { name: 'Bưởi Da Xanh Ruột Hồng', sales: 98, revenue: '5.400.000đ' },
        { name: 'Dâu Tây Đà Lạt Cấp Đông', sales: 85, revenue: '8.500.000đ' },
        { name: 'Cam Sành Mọng Nước', sales: 62, revenue: '3.200.000đ' },
      ];

  const orderStatusCounts = statsData?.order_status || {
    pending: 0,
    confirmed: 1,
    shipping: 1,
    delivered: 2,
    cancelled: 0
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Chờ duyệt</span>;
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đã xác nhận</span>;
      case 'processing':
      case 'shipping':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Đang giao</span>;
      case 'completed':
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã giao</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Đã hủy</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bảng Điều Khiển Quản Trị</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Trực Tiếp
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu kinh doanh, đơn hàng nông sản VietGAP và lưu lượng thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          <Link
            href="/admin/orders/"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
          >
            <ShoppingBag size={14} />
            <span>Xử lý đơn hàng</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.name}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight font-sans">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="stroke-[2.2]" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className={`inline-flex items-center gap-0.5 font-bold ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </span>
                <span className="text-slate-400 text-[11px]">so với tháng trước</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tiến độ xử lý đơn hàng toàn hệ thống */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Tiến độ xử lý đơn hàng toàn hệ thống
            </h3>
          </div>
          <Link 
            href="/admin/orders/" 
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 group"
          >
            <span>Tất cả đơn hàng</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link 
            href="/admin/orders/?status=pending"
            className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 hover:bg-amber-100/70 transition-all text-center group"
          >
            <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-semibold">
              <Clock size={13} />
              <span>Chờ duyệt</span>
            </div>
            <p className="text-2xl font-black text-amber-900 mt-1">{orderStatusCounts.pending}</p>
          </Link>

          <Link 
            href="/admin/orders/?status=confirmed"
            className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 hover:bg-blue-100/70 transition-all text-center group"
          >
            <div className="flex items-center justify-center gap-1 text-blue-700 text-xs font-semibold">
              <CheckCircle2 size={13} />
              <span>Đã xác nhận</span>
            </div>
            <p className="text-2xl font-black text-blue-900 mt-1">{orderStatusCounts.confirmed}</p>
          </Link>

          <Link 
            href="/admin/orders/?status=shipping"
            className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/60 hover:bg-indigo-100/70 transition-all text-center group"
          >
            <div className="flex items-center justify-center gap-1 text-indigo-700 text-xs font-semibold">
              <Truck size={13} />
              <span>Đang giao (GHN)</span>
            </div>
            <p className="text-2xl font-black text-indigo-900 mt-1">{orderStatusCounts.shipping}</p>
          </Link>

          <Link 
            href="/admin/orders/?status=delivered"
            className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 hover:bg-emerald-100/70 transition-all text-center group"
          >
            <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold">
              <PackageCheck size={13} />
              <span>Đã hoàn thành</span>
            </div>
            <p className="text-2xl font-black text-emerald-900 mt-1">{orderStatusCounts.delivered}</p>
          </Link>

          <Link 
            href="/admin/orders/?status=cancelled"
            className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/60 hover:bg-rose-100/70 transition-all text-center group"
          >
            <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-semibold">
              <XCircle size={13} />
              <span>Đã hủy</span>
            </div>
            <p className="text-2xl font-black text-rose-900 mt-1">{orderStatusCounts.cancelled}</p>
          </Link>
        </div>
      </div>

      {/* Chart & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Biểu đồ Doanh Thu Tuần (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
              <p className="text-xs text-slate-400 mt-0.5">Doanh số thu về thực tế sau khi trừ chiết khấu voucher</p>
            </div>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <BarChart3 size={18} />
            </span>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(value) => `${value / 1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: any) => [`${Number(value || 0).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                />
                <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sản phẩm bán chạy (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">Top Nông Sản Nổi Bật</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sản phẩm có lượng đặt nhiều nhất tháng</p>
              </div>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Sparkles size={18} />
              </span>
            </div>

            <div className="space-y-3.5">
              {topProducts.map((product, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      index === 0 ? 'bg-amber-500 text-white' : index === 1 ? 'bg-slate-300 text-slate-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{cleanVietnameseMojibake(product.name)}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{product.sales} lượt mua</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 shrink-0">
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link 
              href="/admin/products/"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <span>Quản lý kho sản phẩm</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bảng đơn hàng gần đây */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Đơn Hàng Gần Đây Cần Xử Lý</h3>
            <p className="text-xs text-slate-400 mt-0.5">Danh sách các đơn hàng mới nhất phát sinh trên sàn</p>
          </div>
          <Link 
            href="/admin/orders/" 
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Xem toàn bộ</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Mã đơn hàng</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4 text-right">Tổng thanh toán</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    Chưa có đơn hàng nào cần xử lý
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-emerald-700">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 text-xs">{cleanVietnameseMojibake(order.customer)}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-xs">
                      {order.total}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link 
                        href={`/admin/orders`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
