"use client";

import { useState } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { trackOrder } from '@/lib/api';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

const fallbackOrders: Record<string, any> = {
  GF284910: {
    id: 'GF284910',
    customer: 'Nguyễn Văn An',
    phone: '0909123456',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    date: '2026-08-19 09:30',
    total: 340000,
    shippingFee: 15000,
    paymentMethod: 'COD',
    status: 'shipping',
    shipperName: 'Trần Minh Đức',
    shipperPhone: '0912345678',
    shipperLat: 10.7769,
    shipperLng: 106.7009,
    destLat: 10.7766,
    destLng: 106.7019,
    items: [
      { name: 'Sầu Riêng Ri6 Hạt Lép', unit: 'Hộp 500g', quantity: 1, price: 150000 },
      { name: 'Bưởi Da Xanh Ruột Hồng', unit: 'Trái', quantity: 2, price: 65000 },
      { name: 'Cam Sành Mọng Nước', unit: '1kg', quantity: 1, price: 35000 },
    ],
    steps: [
      { title: 'Đặt hàng', desc: 'Đơn hàng đã được tạo thành công', time: '19/08 09:30', completed: true, current: false },
      { title: 'Xác nhận', desc: 'Nông hộ đã xác nhận và đóng gói', time: '19/08 10:00', completed: true, current: false },
      { title: 'Đang giao', desc: 'Shipper đang trên đường giao hàng', time: '19/08 11:15', completed: false, current: true },
      { title: 'Đã giao', desc: 'Giao hàng thành công', time: '', completed: false, current: false },
    ],
  },
  GF285020: {
    id: 'GF285020',
    customer: 'Trần Thị Bích',
    phone: '0918765432',
    address: '456 Lê Lợi, Quận 3, TP. Hồ Chí Minh',
    date: '2026-08-18 14:00',
    total: 1250000,
    shippingFee: 0,
    paymentMethod: 'Ví MoMo',
    status: 'delivered',
    shipperName: 'Lê Hoàng Nam',
    shipperPhone: '0923456789',
    items: [
      { name: 'Sầu Riêng Ri6 Hạt Lép', unit: 'Nguyên trái', quantity: 3, price: 350000 },
      { name: 'Dâu Tây Đà Lạt Cấp Đông', unit: 'Hộp 1kg', quantity: 1, price: 220000 },
    ],
    steps: [
      { title: 'Đặt hàng', desc: 'Đơn hàng đã được tạo thành công', time: '18/08 14:00', completed: true, current: false },
      { title: 'Xác nhận', desc: 'Nông hộ đã xác nhận và đóng gói', time: '18/08 14:30', completed: true, current: false },
      { title: 'Đang giao', desc: 'Shipper đã lấy hàng và đang giao', time: '18/08 15:45', completed: true, current: false },
      { title: 'Đã giao', desc: 'Giao hàng thành công đến tay người nhận', time: '18/08 16:30', completed: true, current: false },
    ],
  },
};

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
  shipping: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
  delivered: { label: 'Đã giao thành công', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: AlertCircle },
};

export default function TrackingPage() {
  const [orderCode, setOrderCode] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || orderCode).trim().toUpperCase();
    if (!code) return;

    setIsLoading(true);
    setHasSearched(true);

    const cleanCode = code.replace('#', '');
    const data = await trackOrder(cleanCode);

    if (data) {
      setCurrentOrder(data);
    } else {
      setCurrentOrder(fallbackOrders[cleanCode] || null);
    }
    setIsLoading(false);
  };

  const statusInfo = currentOrder ? (statusLabels[currentOrder.status] || statusLabels.pending) : null;
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white py-12">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-900/60 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border border-emerald-600">
            <Package size={14} /> Hệ Thống Tra Cứu Đơn Hàng
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Theo Dõi Đơn Hàng</h1>
          <p className="text-emerald-100 text-sm md:text-base mb-6">
            Nhập mã đơn hàng (VD: GF284910) để theo dõi lộ trình và trạng thái vận chuyển trong thời gian thực.
          </p>

          <div className="flex gap-2 max-w-lg mx-auto bg-white p-1.5 rounded-2xl shadow-xl">
            <input
              type="text"
              placeholder="Nhập mã đơn hàng..."
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 text-gray-800 text-sm focus:outline-none rounded-xl font-medium"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              {isLoading ? 'Đang tìm...' : 'Tra cứu'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-emerald-200">
            <span>Mã mẫu thử:</span>
            {['GF284910', 'GF285020', 'GF285130'].map((code) => (
              <button
                key={code}
                onClick={() => { setOrderCode(code); handleSearch(code); }}
                className="underline hover:text-white font-mono"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-6">
        {currentOrder ? (
          <div className="space-y-6">
            {/* Header info card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 font-mono">#{currentOrder.id}</h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo?.color}`}>
                      <StatusIcon size={14} />
                      {statusInfo?.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ngày đặt: {currentOrder.date}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-500">Tổng thanh toán</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {(currentOrder.total + currentOrder.shippingFee).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="pt-6">
                <h3 className="font-bold text-gray-800 text-sm mb-6">Hành trình giao hàng</h3>
                <div className="relative">
                  <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-gray-200 z-0" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                    {currentOrder.steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                          step.completed
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50'
                            : step.current
                            ? 'bg-indigo-600 text-white animate-pulse shadow-md shadow-indigo-600/30 ring-4 ring-indigo-50'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}>
                          {step.completed ? <CheckCircle2 size={20} /> : idx + 1}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${step.completed || step.current ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[160px]">{step.desc}</p>
                          {step.time && <p className="text-[11px] font-mono text-emerald-600 mt-1 font-medium">{step.time}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map & Shipper Info (if shipping) */}
            {currentOrder.status === 'shipping' && currentOrder.shipperLat && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Truck size={18} className="text-indigo-600" />
                    Vị trí Shipper đang giao
                  </h3>
                  <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full animate-pulse">
                    Đang cập nhật thời gian thực
                  </span>
                </div>

                <div className="h-64 rounded-xl overflow-hidden mb-4 border border-gray-200">
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                  <MapContainer
                    center={[currentOrder.shipperLat, currentOrder.shipperLng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[currentOrder.shipperLat, currentOrder.shipperLng]}>
                      <Popup>
                        <div className="text-xs font-bold">🛵 Shipper: {currentOrder.shipperName}</div>
                      </Popup>
                    </Marker>
                    {currentOrder.destLat && (
                      <Marker position={[currentOrder.destLat, currentOrder.destLng]}>
                        <Popup>
                          <div className="text-xs font-bold">📍 Điểm nhận hàng</div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>

                {currentOrder.shipperName && (
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        🛵
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Shipper phụ trách</p>
                        <p className="font-bold text-gray-800 text-sm">{currentOrder.shipperName}</p>
                      </div>
                    </div>
                    {currentOrder.shipperPhone && (
                      <a
                        href={`tel:${currentOrder.shipperPhone}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Phone size={14} /> Gọi điện
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer & Address */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Thông tin nhận hàng</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs block">Người nhận</span>
                    <span className="font-semibold text-gray-800">{currentOrder.customer} - {currentOrder.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Địa chỉ giao</span>
                    <span className="text-gray-700">{currentOrder.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Phương thức thanh toán</span>
                    <span className="text-gray-700 font-medium">{currentOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Sản phẩm trong đơn ({currentOrder.items.length})</h3>
                <div className="space-y-3 divide-y divide-gray-100">
                  {currentOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center pt-2 first:pt-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.unit} x {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between text-xs text-gray-500">
                    <span>Phí vận chuyển</span>
                    <span>{currentOrder.shippingFee === 0 ? 'Miễn phí' : `${currentOrder.shippingFee.toLocaleString('vi-VN')}đ`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Mã đơn hàng <strong>&quot;{orderCode}&quot;</strong> không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã trên hóa đơn hoặc tin nhắn.
            </p>
            <div className="flex gap-2 justify-center">
              {['GF284910', 'GF285020', 'GF285130'].map((code) => (
                <button
                  key={code}
                  onClick={() => { setOrderCode(code); handleSearch(code); }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 text-xs font-mono rounded-lg transition-colors"
                >
                  Thử {code}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
