"use client";

import { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Phone, User, ChevronRight, Box, CalendarDays } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface TrackingStep {
  title: string;
  desc: string;
  time: string;
  completed: boolean;
  current: boolean;
}

interface OrderTracking {
  id: string;
  customer: string;
  phone: string;
  address: string;
  date: string;
  total: number;
  shippingFee: number;
  paymentMethod: string;
  status: string;
  items: OrderItem[];
  steps: TrackingStep[];
  shipperName: string;
  shipperPhone: string;
  shipperLat: number;
  shipperLng: number;
  destLat: number;
  destLng: number;
}

const mockOrders: OrderTracking[] = [
  {
    id: 'GF284910',
    customer: 'Nguyễn Văn An', phone: '0909123456', address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    date: '2026-08-18 10:30', total: 340000, shippingFee: 15000, paymentMethod: 'COD',
    status: 'shipping',
    items: [
      { name: 'Sầu riêng Ri6', quantity: 1, price: 180000, unit: '1kg' },
      { name: 'Bưởi Da Xanh', quantity: 2, price: 55000, unit: '1 trái' },
      { name: 'Mật ong rừng Tràm', quantity: 1, price: 50000, unit: '500ml' },
    ],
    steps: [
      { title: 'Đặt hàng', desc: 'Đơn hàng đã được tạo thành công', time: '18/08 10:30', completed: true, current: false },
      { title: 'Xác nhận', desc: 'Nông hộ đã xác nhận và đóng gói', time: '18/08 11:15', completed: true, current: false },
      { title: 'Đang giao', desc: 'Shipper đang trên đường giao hàng', time: '18/08 14:00', completed: false, current: true },
      { title: 'Đã giao', desc: 'Giao hàng thành công', time: '', completed: false, current: false },
    ],
    shipperName: 'Trần Minh Đức', shipperPhone: '0912345678',
    shipperLat: 10.7769, shipperLng: 106.7009, destLat: 10.7766, destLng: 106.7019,
  },
  {
    id: 'GF285020',
    customer: 'Trần Thị Bích', phone: '0918765432', address: '456 Lê Lợi, Q.3, TP.HCM',
    date: '2026-08-17 09:15', total: 1250000, shippingFee: 0, paymentMethod: 'MoMo',
    status: 'delivered',
    items: [
      { name: 'Sầu riêng Ri6', quantity: 3, price: 180000, unit: '1kg' },
      { name: 'Cà phê Robusta', quantity: 2, price: 100000, unit: '500g' },
      { name: 'Mật ong rừng Tràm', quantity: 3, price: 50000, unit: '500ml' },
      { name: 'Dâu tây Đà Lạt', quantity: 2, price: 85000, unit: '500g' },
      { name: 'Chè Thái Nguyên', quantity: 1, price: 60000, unit: '200g' },
    ],
    steps: [
      { title: 'Đặt hàng', desc: 'Đơn hàng đã được tạo thành công', time: '17/08 09:15', completed: true, current: false },
      { title: 'Xác nhận', desc: 'Nông hộ đã xác nhận và đóng gói', time: '17/08 10:00', completed: true, current: false },
      { title: 'Đang giao', desc: 'Shipper đã lấy hàng và giao', time: '17/08 14:30', completed: true, current: false },
      { title: 'Đã giao', desc: 'Khách đã nhận hàng thành công', time: '17/08 16:45', completed: true, current: false },
    ],
    shipperName: 'Lê Hoàng Nam', shipperPhone: '0923456789',
    shipperLat: 10.7814, shipperLng: 106.6827, destLat: 10.7814, destLng: 106.6827,
  },
  {
    id: 'GF285130',
    customer: 'Lê Hoàng Cường', phone: '0933456789', address: '789 Phan Đăng Lưu, Q. Bình Thạnh, TP.HCM',
    date: '2026-08-19 08:00', total: 85000, shippingFee: 15000, paymentMethod: 'Chuyển khoản',
    status: 'confirmed',
    items: [
      { name: 'Bưởi Da Xanh', quantity: 1, price: 55000, unit: '1 trái' },
      { name: 'Chanh leo Đà Lạt', quantity: 1, price: 30000, unit: '500g' },
    ],
    steps: [
      { title: 'Đặt hàng', desc: 'Đơn hàng đã được tạo thành công', time: '19/08 08:00', completed: true, current: false },
      { title: 'Xác nhận', desc: 'Nông hộ đang chuẩn bị đóng gói', time: '19/08 09:30', completed: false, current: true },
      { title: 'Đang giao', desc: 'Chờ giao cho đơn vị vận chuyển', time: '', completed: false, current: false },
      { title: 'Đã giao', desc: 'Chờ giao hàng', time: '', completed: false, current: false },
    ],
    shipperName: '', shipperPhone: '',
    shipperLat: 10.8020, shipperLng: 106.7149, destLat: 10.8020, destLng: 106.7149,
  },
];

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Đã giao thành công', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-700' },
};

export default function TrackingPage() {
  const [searchCode, setSearchCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<OrderTracking | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchCode.trim().toUpperCase().replace('#', '');
    if (!code) { setSearchError('Vui lòng nhập mã đơn hàng'); setFoundOrder(null); return; }
    const order = mockOrders.find(o => o.id === code || o.id.includes(code));
    if (order) { setFoundOrder(order); setSearchError(''); }
    else { setSearchError(`Không tìm thấy đơn hàng "${code}". Thử: GF284910, GF285020, GF285130`); setFoundOrder(null); }
  };

  const getStepIcon = (index: number, completed: boolean, current: boolean) => {
    const icons = [Package, CheckCircle2, Truck, Box];
    const Icon = icons[index];
    if (completed) return <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center"><Icon size={18} className="text-white" /></div>;
    if (current) return <div className="w-10 h-10 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center animate-pulse"><Icon size={18} className="text-emerald-600" /></div>;
    return <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Icon size={18} className="text-gray-400" /></div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero search */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Theo dõi đơn hàng</h1>
          <p className="text-emerald-100 mb-8 max-w-md mx-auto">Nhập mã đơn hàng để xem trạng thái giao hàng theo thời gian thực</p>

          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã đơn hàng (VD: GF284910)"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg text-sm"
              />
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 px-6 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-lg whitespace-nowrap">
              Tra cứu
            </button>
          </form>

          {searchError && <p className="text-amber-200 text-sm mt-3">{searchError}</p>}

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-emerald-200 text-xs">Thử:</span>
            {['GF284910', 'GF285020', 'GF285130'].map(code => (
              <button key={code} onClick={() => { setSearchCode(code); }} className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full transition-colors font-mono">
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tracking Result */}
      {foundOrder && (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Status header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900 font-mono">#{foundOrder.id}</h2>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusMap[foundOrder.status]?.color}`}>
                    {statusMap[foundOrder.status]?.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <CalendarDays size={14} /> Đặt lúc: {foundOrder.date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tổng thanh toán</p>
                <p className="text-2xl font-bold text-emerald-600">{(foundOrder.total + foundOrder.shippingFee).toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Hành trình giao hàng</h3>
              <div className="space-y-0">
                {foundOrder.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {getStepIcon(index, step.completed, step.current)}
                      {index < foundOrder.steps.length - 1 && (
                        <div className={`w-0.5 h-12 my-1 ${step.completed ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <h4 className={`font-semibold text-sm ${step.completed || step.current ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.title}
                      </h4>
                      <p className={`text-xs mt-0.5 ${step.completed || step.current ? 'text-gray-500' : 'text-gray-300'}`}>
                        {step.desc}
                      </p>
                      {step.time && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">🕐 {step.time}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipper info */}
              {foundOrder.shipperName && (
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Thông tin shipper</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{foundOrder.shipperName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={11} /> {foundOrder.shipperPhone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map + Info */}
            <div className="space-y-6">
              {/* Mini Map */}
              {isClient && foundOrder.status === 'shipping' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <MapPin size={18} className="text-emerald-600" /> Vị trí giao hàng
                    </h3>
                  </div>
                  <div style={{ height: '250px' }}>
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <MapContainer center={[foundOrder.shipperLat, foundOrder.shipperLng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                      <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[foundOrder.shipperLat, foundOrder.shipperLng]}>
                        <Popup>🛵 Shipper: {foundOrder.shipperName}</Popup>
                      </Marker>
                      <Marker position={[foundOrder.destLat, foundOrder.destLng]}>
                        <Popup>📍 Điểm giao: {foundOrder.address}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin đơn hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Người nhận</span>
                    <span className="font-medium text-gray-800">{foundOrder.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Điện thoại</span>
                    <span className="font-medium text-gray-800">{foundOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Địa chỉ</span>
                    <span className="font-medium text-gray-800 text-right max-w-[200px]">{foundOrder.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thanh toán</span>
                    <span className="font-medium text-gray-800">{foundOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm ({foundOrder.items.length})</h3>
                <div className="space-y-3">
                  {foundOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.unit} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-700">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính</span>
                    <span>{foundOrder.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí giao hàng</span>
                    <span>{foundOrder.shippingFee === 0 ? 'Miễn phí' : `${foundOrder.shippingFee.toLocaleString('vi-VN')}đ`}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-emerald-600 pt-2 border-t border-gray-100">
                    <span>Tổng cộng</span>
                    <span>{(foundOrder.total + foundOrder.shippingFee).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No search yet */}
      {!foundOrder && !searchError && (
        <div className="container mx-auto px-4 py-16 text-center max-w-lg">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={36} className="text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm">Nhập mã đơn hàng phía trên để theo dõi trạng thái giao hàng</p>
        </div>
      )}
    </div>
  );
}
