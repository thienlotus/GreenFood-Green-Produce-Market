"use client";

import { useState, useEffect, Suspense } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, Phone, AlertCircle, RefreshCw, ChevronRight, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { trackOrder, getMyOrders } from '@/lib/api';



// Chuẩn hóa số điện thoại (+84 / 0...)
function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('84')) return '0' + digits.slice(2);
  return digits;
}

// Kiểm tra xem chuỗi nhập vào có phải số điện thoại không (9-11 chữ số)
function isPhoneNumber(val: string): boolean {
  const digits = val.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 11;
}

const fallbackOrders: Record<string, any> = {
  GF284910: {
    id: 'GF284910',
    customer: 'Nguyễn Văn Khách',
    phone: '0912345678',
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
    customer: 'Lê Hoàng Nông Dân',
    phone: '0987654321',
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

function TrackingContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [phoneOrdersList, setPhoneOrdersList] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<'NOT_FOUND' | null>(null);
  const [notFoundTerm, setNotFoundTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Tự động nhận mã đơn hoặc số điện thoại từ URL query parameter
    const queryOrder = searchParams.get('order') || searchParams.get('order_code') || searchParams.get('id');
    const queryPhone = searchParams.get('phone');

    if (queryOrder) {
      setSearchInput(queryOrder);
      handleSearch(queryOrder);
    } else if (queryPhone) {
      setSearchInput(queryPhone);
      handleSearch(queryPhone);
    }
  }, [searchParams]);

  const handleSearch = async (termToSearch?: string) => {
    const rawTerm = (termToSearch !== undefined ? termToSearch : searchInput).trim();
    if (!rawTerm) {
      toast.error('Vui lòng nhập mã đơn hàng hoặc số điện thoại cần tra cứu!');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setSearchError(null);
    setCurrentOrder(null);
    setPhoneOrdersList([]);

    // TRƯỜNG HỢP 1: NGƯỜI DÙNG NHẬP SỐ ĐIỆN THOẠI (9 - 11 chữ số)
    if (isPhoneNumber(rawTerm)) {
      const cleanPhone = normalizePhone(rawTerm);
      let list = await getMyOrders(cleanPhone);

      // Bổ sung các đơn fallback nếu trùng SĐT demo
      const matchedFallback = Object.values(fallbackOrders).filter(
        fo => normalizePhone(fo.phone) === cleanPhone
      );

      const combinedCodes = new Set<string>();
      const combinedList: any[] = [];

      (list || []).forEach(o => {
        const code = (o.code || o.id || '').replace('#', '');
        if (code && !combinedCodes.has(code)) {
          combinedCodes.add(code);
          combinedList.push({
            code: code,
            date: o.date || 'Gần đây',
            total: o.total || 0,
            status: o.status || 'pending',
            customer: o.customer_name || 'Khách hàng',
            phone: o.customer_phone || cleanPhone,
            address: o.shipping_address || '',
            itemsCount: o.items_count || undefined
          });
        }
      });

      matchedFallback.forEach(fo => {
        if (!combinedCodes.has(fo.id)) {
          combinedCodes.add(fo.id);
          combinedList.push({
            code: fo.id,
            date: fo.date,
            total: fo.total + (fo.shippingFee || 0),
            status: fo.status,
            customer: fo.customer,
            phone: fo.phone,
            address: fo.address,
            itemsCount: fo.items ? fo.items.length : undefined
          });
        }
      });

      if (combinedList.length === 0) {
        setSearchError('NOT_FOUND');
        setNotFoundTerm(rawTerm);
        setIsLoading(false);
        return;
      }

      // KHI TRA CỨU BẰNG SỐ ĐIỆN THOẠI: LUÔN HIỂN THỊ DANH SÁCH CÁC ĐƠN MÀ SỐ ĐT ĐÓ ĐÃ ĐẶT
      setPhoneOrdersList(combinedList);
      toast.success(`Tìm thấy ${combinedList.length} đơn hàng của số điện thoại ${rawTerm}`);
      setIsLoading(false);
      return;
    }

    // TRƯỜNG HỢP 2: NGƯỜI DÙNG NHẬP MÃ ĐƠN HÀNG (VD: GF284910, GF..., mã GHN)
    const cleanCode = rawTerm.replace('#', '').toUpperCase();
    let orderData = await trackOrder(cleanCode);

    if (!orderData) {
      orderData = fallbackOrders[cleanCode] || null;
    }

    if (!orderData) {
      setSearchError('NOT_FOUND');
      setNotFoundTerm(cleanCode);
      setIsLoading(false);
      return;
    }

    setCurrentOrder(orderData);
    setIsLoading(false);
  };

  const handleSelectOrderFromList = async (code: string) => {
    setIsLoading(true);
    const cleanCode = code.replace('#', '').toUpperCase();
    let orderData = await trackOrder(cleanCode);
    if (!orderData) {
      orderData = fallbackOrders[cleanCode] || null;
    }

    if (orderData) {
      setCurrentOrder(orderData);
    } else {
      toast.error('Không thể tải chi tiết đơn hàng này!');
    }
    setIsLoading(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusInfo = currentOrder ? (statusLabels[currentOrder.status] || statusLabels.pending) : null;
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white py-12">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-900/60 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 border border-emerald-600">
            <Package size={14} /> Hệ Thống Theo Dõi Đơn Hàng
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">Theo Dõi Đơn Hàng</h1>
          <p className="text-emerald-100 text-sm md:text-base mb-6">
            Nhập <strong>mã đơn hàng</strong> hoặc <strong>số điện thoại</strong> để kiểm tra danh sách đơn và tiến độ giao hàng thời gian thực.
          </p>

          {/* Search Box */}
          <div className="flex gap-2 max-w-lg mx-auto bg-white p-1.5 rounded-2xl shadow-xl">
            <input
              type="text"
              placeholder="Nhập mã đơn hàng hoặc số điện thoại..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 text-gray-800 text-sm focus:outline-none rounded-xl font-medium"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50 shadow-md cursor-pointer"
            >
              {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              {isLoading ? 'Đang tìm...' : 'Tra cứu'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-6">
        {/* TH1: HIỂN THỊ DANH SÁCH CÁC ĐƠN HÀNG KHI TRA CỨU BẰNG SỐ ĐIỆN THOẠI */}
        {phoneOrdersList.length > 0 && !currentOrder && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Phone size={18} className="text-emerald-600" />
                  Đơn hàng của số điện thoại: <span className="font-mono text-emerald-700">{searchInput}</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Đã tìm thấy <strong>{phoneOrdersList.length}</strong> đơn hàng được đặt bởi số điện thoại này.
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1 rounded-full border border-emerald-200">
                {phoneOrdersList.length} đơn hàng
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {phoneOrdersList.map((item, idx) => {
                const sInfo = statusLabels[item.status] || statusLabels.pending;
                const SIcon = sInfo.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-gray-900 text-base">#{item.code}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${sInfo.color}`}>
                          <SIcon size={12} />
                          {sInfo.label}
                        </span>
                        <span className="text-xs text-gray-400">• Ngày đặt: {item.date}</span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <p>
                          <span className="text-gray-400">Người nhận:</span>{' '}
                          <strong>{item.customer}</strong> ({item.phone})
                        </p>
                        {item.address && (
                          <p className="text-gray-500 line-clamp-1">
                            <span className="text-gray-400">Địa chỉ:</span> {item.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-gray-400 block">Tổng thanh toán</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {item.total.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectOrderFromList(item.code)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Truck size={14} />
                        <span>Theo dõi lộ trình</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TH2: HIỂN THỊ CHI TIẾT LỘ TRÌNH ĐƠN HÀNG */}
        {currentOrder ? (
          <div className="space-y-6">
            {/* Nút quay lại danh sách các đơn của SĐT đã tra cứu */}
            {phoneOrdersList.length > 0 && (
              <button
                onClick={() => setCurrentOrder(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm transition-colors cursor-pointer"
              >
                <ArrowLeft size={15} />
                Quay lại danh sách đơn hàng của SĐT {searchInput} ({phoneOrdersList.length} đơn)
              </button>
            )}

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

            {/* Thông tin Shipper (khi đơn hàng đang giao và có shipper phụ trách) */}
            {currentOrder.status === 'shipping' && currentOrder.shipperName && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-lg border border-indigo-100">
                    🛵
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Shipper phụ trách giao hàng</p>
                    <p className="font-bold text-gray-900 text-sm">{currentOrder.shipperName}</p>
                  </div>
                </div>
                {currentOrder.shipperPhone && (
                  <a
                    href={`tel:${currentOrder.shipperPhone}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20"
                  >
                    <Phone size={14} /> Gọi điện
                  </a>
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
        ) : searchError === 'NOT_FOUND' ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Không Tìm Thấy Đơn Hàng</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Không tìm thấy đơn hàng nào tương ứng với <strong>&quot;{notFoundTerm}&quot;</strong>. Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại đã điền khi đặt hàng.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => { setSearchError(null); setSearchInput(''); }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Nhập lại
              </button>
            </div>
          </div>
        ) : !hasSearched ? (
          /* Màn hình ban đầu khi chưa tra cứu */
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-emerald-600 border border-emerald-100">
              <Package size={36} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Sẵn Sàng Tra Cứu Đơn Hàng</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Nhập mã đơn hàng hoặc số điện thoại người nhận đã điền khi đặt hàng vào ô phía trên để tra cứu.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
