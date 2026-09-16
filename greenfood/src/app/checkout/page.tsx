"use client";

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { ChevronLeft, CheckCircle, ChevronRight, MapPin, CreditCard, Smartphone, Building2, Banknote, ShieldCheck, Truck, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getGhnProvinces, getGhnDistricts, getGhnWards, calculateGhnShippingFee, createOrder } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Fallback zones logic removed since we use GHN directly

type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | ''>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | ''>('');
  const [selectedWardCode, setSelectedWardCode] = useState<string | ''>('');
  const [ghnShippingFee, setGhnShippingFee] = useState<number | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(''); // street address
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadProvinces() {
      const data = await getGhnProvinces();
      setProvinces(data);
    }
    loadProvinces();
  }, []);

  useEffect(() => {
    async function loadDistricts() {
      if (selectedProvinceId) {
        setDistricts([]);
        setWards([]);
        setSelectedDistrictId('');
        setSelectedWardCode('');
        setGhnShippingFee(null);
        const data = await getGhnDistricts(selectedProvinceId as number);
        setDistricts(data);
      }
    }
    loadDistricts();
  }, [selectedProvinceId]);

  useEffect(() => {
    async function loadWards() {
      if (selectedDistrictId) {
        setWards([]);
        setSelectedWardCode('');
        setGhnShippingFee(null);
        const data = await getGhnWards(selectedDistrictId as number);
        setWards(data);
      }
    }
    loadWards();
  }, [selectedDistrictId]);

  useEffect(() => {
    async function fetchFee() {
      if (selectedDistrictId && selectedWardCode && items.length > 0) {
        setIsCalculatingFee(true);
        const fee = await calculateGhnShippingFee(selectedDistrictId as number, selectedWardCode as string, items);
        setGhnShippingFee(fee);
        setIsCalculatingFee(false);
      } else {
        setGhnShippingFee(null);
      }
    }
    fetchFee();
  }, [selectedDistrictId, selectedWardCode, items]);

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = ghnShippingFee || 0;
  const finalTotal = totalAmount + shippingFee;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
    if (!phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+?84)[35789][0-9]{8}$/.test(phone.replace(/\s/g, ''))) errors.phone = 'Số điện thoại không hợp lệ (cần 10 chữ số, đầu 03, 05, 07, 08, 09)';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';
    if (!address.trim()) errors.address = 'Vui lòng nhập số nhà/tên đường';
    if (!selectedProvinceId) errors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    if (!selectedDistrictId) errors.district = 'Vui lòng chọn Quận/Huyện';
    if (!selectedWardCode) errors.ward = 'Vui lòng chọn Phường/Xã';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
      setShowPaymentPopup(true);
      return;
    }
    processOrder();
  };

  const processOrder = async () => {
    setIsSubmitting(true);
    setShowPaymentPopup(false);

    const provinceName = provinces.find(p => p.ProvinceID === selectedProvinceId)?.ProvinceName || '';
    const districtName = districts.find(d => d.DistrictID === selectedDistrictId)?.DistrictName || '';
    const wardName = wards.find(w => w.WardCode === selectedWardCode)?.WardName || '';
    const fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}`;

    const res = await createOrder({
      customerName: fullName,
      customerPhone: phone,
      customerEmail: email,
      shippingAddress: fullAddress,
      shippingFee: shippingFee,
      toDistrictId: selectedDistrictId ? Number(selectedDistrictId) : undefined,
      toWardCode: selectedWardCode ? String(selectedWardCode) : undefined,
      paymentMethod: paymentMethod,
      note: note,
      items: items.map(i => ({
        productId: String(i.id),
        variantId: i.variantId ? String(i.variantId) : undefined,
        productName: i.name,
        unit: i.unit,
        quantity: i.quantity,
        price: i.price
      }))
    });

    if (res.success && res.trackingNumber) {
      setOrderId(res.trackingNumber);
      
      // Save to local storage for tracking page
      const savedOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      savedOrders.unshift({
        code: res.trackingNumber,
        date: new Date().toISOString(),
        total: finalTotal
      });
      localStorage.setItem('my_orders', JSON.stringify(savedOrders));

      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
      toast.success('Đặt hàng thành công!');
    } else {
      setIsSubmitting(false);
      toast.error(res.message || 'Không thể tạo đơn hàng, vui lòng thử lại!');
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-emerald-100 text-emerald-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Đặt hàng thành công!</h1>
        <p className="text-gray-600 mb-4">
          Cảm ơn bạn đã đồng hành cùng nông sản Việt. Mã đơn hàng đã lưu vào hệ thống:
        </p>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl py-4 px-6 mb-6 inline-block">
          <span className="text-2xl font-bold text-emerald-700 font-mono">#{orderId}</span>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Bạn có thể theo dõi đơn hàng bằng mã đơn này tại trang <Link href="/tracking" className="text-emerald-600 underline font-medium">Theo dõi đơn hàng</Link>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/tracking" className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 font-bold py-3 px-6 rounded-full border-2 border-emerald-600 hover:bg-emerald-50 transition-colors">
            <Package size={18} /> Theo dõi đơn hàng
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 px-6 rounded-full hover:bg-emerald-700 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
        <p className="text-gray-600 mb-6">Bạn chưa chọn sản phẩm nào để thanh toán.</p>
        <Link href="/" className="text-emerald-600 font-semibold hover:underline flex items-center justify-center gap-1">
          <ChevronLeft size={16} /> Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'COD' as PaymentMethod, name: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt cho shipper khi nhận hàng', icon: Banknote, color: 'emerald' },
    { id: 'BANK_TRANSFER' as PaymentMethod, name: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản qua tài khoản ngân hàng', icon: Building2, color: 'blue' },
    { id: 'MOMO' as PaymentMethod, name: 'Ví MoMo', desc: 'Thanh toán qua ví điện tử MoMo', icon: Smartphone, color: 'pink' },
    { id: 'VNPAY' as PaymentMethod, name: 'VNPay', desc: 'Thanh toán qua cổng VNPay', icon: CreditCard, color: 'indigo' },
  ];

  return (
    <>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-emerald-600 mb-6 text-sm font-medium">
          <ChevronLeft size={16} /> Tiếp tục mua hàng
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form nhập thông tin */}
          <div className="flex-1">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Thông tin giao hàng */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-emerald-600" /> Thông tin giao hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.fullName ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}`}
                      placeholder="Nhập họ tên đầy đủ" />
                    {formErrors.fullName && <p className="text-rose-500 text-xs mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.phone ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}`}
                      placeholder="Nhập số điện thoại" />
                    {formErrors.phone && <p className="text-rose-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.email ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}`}
                    placeholder="Email nhận hóa đơn (không bắt buộc)" />
                  {formErrors.email && <p className="text-rose-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                    <select value={selectedProvinceId} onChange={(e) => setSelectedProvinceId(Number(e.target.value) || '')}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.province ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}`}>
                      <option value="">-- Chọn Tỉnh/Thành --</option>
                      {provinces.map(p => (
                        <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                      ))}
                    </select>
                    {formErrors.province && <p className="text-rose-500 text-xs mt-1">{formErrors.province}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                    <select value={selectedDistrictId} onChange={(e) => setSelectedDistrictId(Number(e.target.value) || '')}
                      disabled={!selectedProvinceId}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.district ? 'border-rose-400 bg-rose-50' : 'border-gray-300'} disabled:bg-gray-100`}>
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map(d => (
                        <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                      ))}
                    </select>
                    {formErrors.district && <p className="text-rose-500 text-xs mt-1">{formErrors.district}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
                    <select value={selectedWardCode} onChange={(e) => setSelectedWardCode(e.target.value || '')}
                      disabled={!selectedDistrictId}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.ward ? 'border-rose-400 bg-rose-50' : 'border-gray-300'} disabled:bg-gray-100`}>
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map(w => (
                        <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                      ))}
                    </select>
                    {formErrors.ward && <p className="text-rose-500 text-xs mt-1">{formErrors.ward}</p>}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số nhà, Tên đường *</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.address ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}`}
                    placeholder="Số nhà, tên đường, ngõ ngách..." />
                  {formErrors.address && <p className="text-rose-500 text-xs mt-1">{formErrors.address}</p>}
                </div>

                {selectedWardCode && (
                  <div className="mb-4">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center justify-between text-emerald-700 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Truck size={16} /> Phí vận chuyển Giao Hàng Nhanh
                        </div>
                        {isCalculatingFee ? (
                          <span className="animate-pulse">Đang tính phí...</span>
                        ) : ghnShippingFee !== null ? (
                          <span>{ghnShippingFee.toLocaleString('vi-VN')}đ</span>
                        ) : (
                          <span className="text-rose-500">Không thể tính phí giao hàng</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú đơn hàng</label>
                  <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Ghi chú thêm về thời gian giao hàng..." />
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-emerald-600" /> Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <label key={pm.id}
                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                          isSelected ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                        <input type="radio" name="payment" value={pm.id} checked={isSelected}
                          onChange={() => setPaymentMethod(pm.id)}
                          className="w-4 h-4 text-emerald-600 accent-emerald-600 mt-1" />
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            pm.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                            pm.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            pm.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                            'bg-indigo-100 text-indigo-600'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 text-sm">{pm.name}</span>
                            <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variantId}`} className="flex gap-3">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                      <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.unit}</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                  <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className={shippingFee === 0 ? 'text-emerald-600 font-medium' : 'text-gray-700'}>
                    {!selectedWardCode ? 'Chọn địa chỉ' : isCalculatingFee ? 'Đang tính...' : shippingFee === 0 ? 'Miễn phí 🎉' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thanh toán</span>
                  <span className="text-gray-700 font-medium">
                    {paymentMethods.find(p => p.id === paymentMethod)?.name}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-2xl font-bold text-emerald-600">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className={`w-full font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>Đang tạo đơn trên hệ thống...</>
                ) : (
                  <>Đặt hàng ngay <ChevronRight size={20} /></>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                Thanh toán an toàn & bảo mật 100%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              {paymentMethod === 'BANK_TRANSFER' && '🏦 Chuyển khoản ngân hàng'}
              {paymentMethod === 'MOMO' && '📱 Thanh toán MoMo'}
              {paymentMethod === 'VNPAY' && '💳 Thanh toán VNPay'}
            </h3>

            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-blue-800 mb-2">Thông tin chuyển khoản:</p>
                  <div className="space-y-1 text-blue-700">
                    <p>🏦 Ngân hàng: <strong>Vietcombank</strong></p>
                    <p>📋 Số TK: <strong>1234 5678 9012</strong></p>
                    <p>👤 Chủ TK: <strong>CONG TY GREENFOOD</strong></p>
                    <p>💰 Số tiền: <strong className="text-blue-900">{finalTotal.toLocaleString('vi-VN')}đ</strong></p>
                    <p>📝 Nội dung: <strong>GF {phone}</strong></p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-gray-400 text-sm">
                  [ QR Code chuyển khoản ]
                </div>
              </div>
            )}

            {paymentMethod === 'MOMO' && (
              <div className="space-y-4 text-center">
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                  <p className="text-pink-700 text-sm">Quét mã QR bằng ứng dụng MoMo để thanh toán</p>
                  <p className="text-2xl font-bold text-pink-600 mt-2">{finalTotal.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-pink-100 rounded-xl h-40 flex items-center justify-center text-pink-400 text-sm">
                  [ QR MoMo ]
                </div>
              </div>
            )}

            {paymentMethod === 'VNPAY' && (
              <div className="space-y-4 text-center">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-indigo-700 text-sm">Bạn sẽ được chuyển đến cổng thanh toán VNPay</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">{finalTotal.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-indigo-100 rounded-xl h-40 flex items-center justify-center text-indigo-400 text-sm">
                  [ Cổng thanh toán VNPay ]
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPaymentPopup(false)}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                Hủy
              </button>
              <button onClick={processOrder}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors">
                Xác nhận đã thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
