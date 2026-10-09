"use client";

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore, VoucherItem } from '@/store/useAuthStore';
import { ChevronLeft, CheckCircle, ChevronRight, MapPin, CreditCard, Smartphone, Building2, Banknote, ShieldCheck, Truck, Package, Copy, Check, QrCode, RefreshCw, Tag, Ticket, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getGhnProvinces, getGhnDistricts, getGhnWards, calculateGhnShippingFee, calculateGhnShippingFeeDetail, ShippingPackageDetail, createOrder, createMomoPayment, createSepayPayment, checkSepayStatus, SepayPaymentResponse, checkVoucherApi } from '@/lib/api';
import { cleanVietnameseMojibake, FALLBACK_PROVINCES, getFallbackDistricts, getFallbackWards } from '@/data/vietnamAddress';
import { ALL_PRODUCTS } from '@/data/products';
import { toast } from 'react-hot-toast';
import { useNotificationStore } from '@/store/useNotificationStore';

// Fallback zones logic removed since we use GHN directly

type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'ATM_CARD';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user, userVouchers, markVoucherAsUsed } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [provinces, setProvinces] = useState<any[]>(FALLBACK_PROVINCES);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | ''>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | ''>('');
  const [selectedWardCode, setSelectedWardCode] = useState<string | ''>('');
  const [ghnShippingFee, setGhnShippingFee] = useState<number | null>(null);
  const [shippingPackages, setShippingPackages] = useState<ShippingPackageDetail[]>([]);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  // Voucher states
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    title: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(''); // street address
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ATM_CARD');
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [momoData, setMomoData] = useState<{ payUrl?: string; qrCodeUrl?: string } | null>(null);
  const [isGeneratingMomo, setIsGeneratingMomo] = useState(false);
  const [sepayData, setSepayData] = useState<SepayPaymentResponse | null>(null);
  const [isGeneratingSepay, setIsGeneratingSepay] = useState(false);
  const [isSepayPaid, setIsSepayPaid] = useState(false);
  const [tempOrderId, setTempOrderId] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép ${field}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadProvinces() {
      setLoadingProvinces(true);
      try {
        const data = await getGhnProvinces();
        if (isMounted) {
          if (data && data.length > 0) {
            setProvinces(data);
          } else {
            setProvinces(FALLBACK_PROVINCES);
          }
        }
      } catch (err) {
        if (isMounted) setProvinces(FALLBACK_PROVINCES);
      } finally {
        if (isMounted) setLoadingProvinces(false);
      }
    }
    loadProvinces();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadDistricts() {
      if (selectedProvinceId) {
        const fallback = getFallbackDistricts(selectedProvinceId as number);
        setDistricts(fallback);
        setWards([]);
        setSelectedDistrictId('');
        setSelectedWardCode('');
        setGhnShippingFee(null);
        setLoadingDistricts(true);
        try {
          const data = await getGhnDistricts(selectedProvinceId as number);
          if (isMounted && data && data.length > 0) {
            setDistricts(data);
          }
        } catch (err) {
          console.warn('[Checkout] Use fallback districts:', err);
        } finally {
          if (isMounted) setLoadingDistricts(false);
        }
      } else {
        setDistricts([]);
        setWards([]);
        setSelectedDistrictId('');
        setSelectedWardCode('');
        setGhnShippingFee(null);
      }
    }
    loadDistricts();
    return () => { isMounted = false; };
  }, [selectedProvinceId]);

  useEffect(() => {
    let isMounted = true;
    async function loadWards() {
      if (selectedDistrictId) {
        const fallback = getFallbackWards(selectedDistrictId as number);
        setWards(fallback);
        setSelectedWardCode('');
        setGhnShippingFee(null);
        setLoadingWards(true);
        try {
          const data = await getGhnWards(selectedDistrictId as number);
          if (isMounted && data && data.length > 0) {
            setWards(data);
          }
        } catch (err) {
          console.warn('[Checkout] Use fallback wards:', err);
        } finally {
          if (isMounted) setLoadingWards(false);
        }
      } else {
        setWards([]);
        setSelectedWardCode('');
        setGhnShippingFee(null);
      }
    }
    loadWards();
    return () => { isMounted = false; };
  }, [selectedDistrictId]);

  useEffect(() => {
    async function fetchFee() {
      if (selectedDistrictId && selectedWardCode && items.length > 0) {
        setIsCalculatingFee(true);
        const feeDetail = await calculateGhnShippingFeeDetail(selectedDistrictId as number, selectedWardCode as string, items);
        setGhnShippingFee(feeDetail.total);
        setShippingPackages(feeDetail.packages || []);
        setIsCalculatingFee(false);
      } else {
        setGhnShippingFee(null);
        setShippingPackages([]);
      }
    }
    fetchFee();
  }, [selectedDistrictId, selectedWardCode, items]);

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const isFreeShipping = totalAmount >= 300000;
  const rawShippingFee = ghnShippingFee !== null ? ghnShippingFee : (selectedWardCode ? 28000 : null);
  const shippingFee = (selectedWardCode && !isFreeShipping) ? (rawShippingFee || 0) : 0;

  // Tính số tiền giảm giá thực tế của voucher
  let calculatedDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'shipping' || appliedVoucher.discountType === 'freeship') {
      calculatedDiscount = Math.min(appliedVoucher.discountAmount, shippingFee);
    } else {
      calculatedDiscount = Math.min(appliedVoucher.discountAmount, totalAmount);
    }
  }
  const finalTotal = Math.max(0, totalAmount + shippingFee - calculatedDiscount);

  // Áp dụng voucher từ ví của người dùng
  const handleApplyVoucherFromWallet = (v: VoucherItem) => {
    if (v.isUsed) {
      toast.error('Voucher này đã được sử dụng!');
      return;
    }
    if (totalAmount < v.minOrder) {
      toast.error(`Đơn hàng tối thiểu ${v.minOrder.toLocaleString('vi-VN')}đ để sử dụng voucher này.`);
      return;
    }
    setAppliedVoucher({
      code: v.code,
      title: v.title,
      discountAmount: v.discountAmount,
      discountType: v.discountType,
    });
    setVoucherInput(v.code);
    setShowVoucherList(false);
    toast.success(`Áp dụng mã ${v.code} (-${v.discountAmount.toLocaleString('vi-VN')}đ) thành công!`);
  };

  // Áp dụng mã voucher nhập tay
  const handleApplyManualVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }

    // 1. Kiểm tra ví voucher của người dùng trước
    const inWallet = (userVouchers || []).find(v => v.code.toUpperCase() === code);
    if (inWallet) {
      handleApplyVoucherFromWallet(inWallet);
      return;
    }

    // 2. Kiểm tra API Backend
    setIsCheckingVoucher(true);
    try {
      const res = await checkVoucherApi(code, totalAmount);
      if (res && res.valid) {
        const discountType = (res as any).discount_type || 'fixed';
        const discountVal = res.discount || 0;
        setAppliedVoucher({
          code: code,
          title: (res as any).title || `Mã khuyến mãi ${code}`,
          discountAmount: discountVal,
          discountType: discountType,
        });
        toast.success(res.message || `Áp dụng mã ${code} thành công!`);
      } else {
        toast.error(res?.message || 'Mã khuyến mãi không hợp lệ hoặc chưa đủ điều kiện!');
      }
    } catch (err) {
      toast.error('Không thể kiểm tra mã khuyến mãi');
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  // Gỡ bỏ voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    toast('Đã hủy áp dụng mã giảm giá');
  };

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

  // Tự động kiểm tra trạng thái thanh toán SePay VietQR (polling 2s/lần tự động hoàn tất)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPaymentPopup && paymentMethod === 'BANK_TRANSFER' && tempOrderId && !isSepayPaid) {
      interval = setInterval(async () => {
        try {
          const res = await checkSepayStatus(tempOrderId);
          if (res && res.isPaid) {
            setIsSepayPaid(true);
            toast.success('🎉 SePay đã xác nhận thanh toán thành công!');
            // Tự động hoàn tất không cần ấn xác nhận
            setTimeout(() => {
              setShowPaymentPopup(false);
              if (appliedVoucher) {
                markVoucherAsUsed(appliedVoucher.code);
              }
              const savedOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
              savedOrders.unshift({
                code: tempOrderId,
                date: new Date().toISOString(),
                total: finalTotal
              });
              localStorage.setItem('my_orders', JSON.stringify(savedOrders));
              clearCart();
              setIsSuccess(true);
            }, 1000);
          }
        } catch (err) {
          console.debug('Polling SePay status...', err);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showPaymentPopup, paymentMethod, tempOrderId, isSepayPaid, appliedVoucher, finalTotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'ATM_CARD') {
      setIsSubmitting(true);
      const code = tempOrderId || ('GF' + Math.floor(100000 + Math.random() * 900000));
      if (!tempOrderId) {
        setTempOrderId(code);
      }

      const provinceName = provinces.find(p => p.ProvinceID === selectedProvinceId)?.ProvinceName || '';
      const districtName = districts.find(d => d.DistrictID === selectedDistrictId)?.DistrictName || '';
      const wardName = wards.find(w => w.WardCode === selectedWardCode)?.WardName || '';
      const fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}`;

      createOrder({
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        shippingAddress: fullAddress,
        shippingFee: shippingFee,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        discountAmount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        toDistrictId: selectedDistrictId ? Number(selectedDistrictId) : undefined,
        toWardCode: selectedWardCode ? String(selectedWardCode) : undefined,
        paymentMethod: 'VNPAY',
        trackingNumber: code,
        paymentStatus: 'unpaid',
        status: 'PENDING',
        note: note,
        items: items.map(i => ({
          productId: String(i.id),
          variantId: i.variantId ? String(i.variantId) : undefined,
          productName: cleanVietnameseMojibake(i.name),
          unit: cleanVietnameseMojibake(i.unit),
          quantity: i.quantity,
          price: i.price,
        }))
      })
      .then((orderRes) => {
        if (!orderRes || !orderRes.success) {
          toast.error(orderRes?.message || 'Có lỗi xảy ra khi tạo đơn hàng!');
          setIsSubmitting(false);
          return;
        }
        const finalTrackingCode = orderRes.trackingNumber || code;
        window.location.href = `/payment/atm-card/?orderId=${encodeURIComponent(finalTrackingCode)}&amount=${finalTotal}`;
      })
      .catch((err) => {
        console.error('Lỗi tạo đơn thẻ ATM:', err);
        toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
        setIsSubmitting(false);
      });
      return;
    }

    if (paymentMethod === 'MOMO') {
      alert('Phương thức thanh toán Ví MoMo đang trong quá trình phát triển & nâng cấp. Vui lòng chọn Thẻ ATM nội địa hoặc Chuyển khoản VietQR!');
      setIsSubmitting(false);
      return;
    }

    if (paymentMethod === 'VNPAY') {
      setShowPaymentPopup(true);
      return;
    }

    if (paymentMethod === 'BANK_TRANSFER') {
      setIsSubmitting(true);
      const code = tempOrderId || ('GF' + Math.floor(100000 + Math.random() * 900000));
      if (!tempOrderId) {
        setTempOrderId(code);
      }

      const provinceName = provinces.find(p => p.ProvinceID === selectedProvinceId)?.ProvinceName || '';
      const districtName = districts.find(d => d.DistrictID === selectedDistrictId)?.DistrictName || '';
      const wardName = wards.find(w => w.WardCode === selectedWardCode)?.WardName || '';
      const fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}`;

      // 1. Tạo đơn hàng PENDING trong DB ngay để webhook SePay bắt được giao dịch
      createOrder({
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        shippingAddress: fullAddress,
        shippingFee: shippingFee,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        discountAmount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        toDistrictId: selectedDistrictId ? Number(selectedDistrictId) : undefined,
        toWardCode: selectedWardCode ? String(selectedWardCode) : undefined,
        paymentMethod: 'BANK_TRANSFER',
        trackingNumber: code,
        paymentStatus: 'unpaid',
        status: 'PENDING',
        note: note,
        items: items.map(i => ({
          productId: String(i.id),
          variantId: i.variantId ? String(i.variantId) : undefined,
          productName: cleanVietnameseMojibake(i.name),
          unit: cleanVietnameseMojibake(i.unit),
          quantity: i.quantity,
          price: i.price,
        }))
      })
      .then((orderRes) => {
        const orderTracking = orderRes.trackingNumber || code;
        setOrderId(orderTracking);
        setTempOrderId(orderTracking);
        setShowPaymentPopup(true);

        // 2. Tạo mã VietQR SePay khớp với mã đơn hàng
        setIsGeneratingSepay(true);
        return createSepayPayment(orderTracking, finalTotal, `Thanh toán đơn hàng GreenFood #${orderTracking}`);
      })
      .then((res) => {
        if (res && res.success) {
          setSepayData(res);
        }
      })
      .catch((err) => {
        console.error('Lỗi tạo đơn hàng SePay:', err);
        setShowPaymentPopup(true);
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsGeneratingSepay(false);
      });

      return;
    }
    processOrder();
  };

  const processOrder = async (customTrackingNumber?: string, isPrePaid?: boolean) => {
    setIsSubmitting(true);
    setShowPaymentPopup(false);

    // Nếu đơn SePay đã tạo trước đó hoặc đã thanh toán
    if (tempOrderId && (isPrePaid || isSepayPaid)) {
      if (appliedVoucher) {
        markVoucherAsUsed(appliedVoucher.code);
      }
      const savedOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      savedOrders.unshift({
        code: tempOrderId,
        date: new Date().toISOString(),
        total: finalTotal
      });
      localStorage.setItem('my_orders', JSON.stringify(savedOrders));
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
      toast.success('Thanh toán & đặt hàng thành công!');
      return;
    }

    const provinceName = provinces.find(p => p.ProvinceID === selectedProvinceId)?.ProvinceName || '';
    const districtName = districts.find(d => d.DistrictID === selectedDistrictId)?.DistrictName || '';
    const wardName = wards.find(w => w.WardCode === selectedWardCode)?.WardName || '';
    const fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}`;

    const effectiveTrackingNumber = customTrackingNumber || tempOrderId || undefined;
    const isPaidOrder = isPrePaid || isSepayPaid;

    const res = await createOrder({
      customerName: fullName,
      customerPhone: phone,
      customerEmail: email,
      shippingAddress: fullAddress,
      shippingFee: shippingFee,
      voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
      discountAmount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
      toDistrictId: selectedDistrictId ? Number(selectedDistrictId) : undefined,
      toWardCode: selectedWardCode ? String(selectedWardCode) : undefined,
      paymentMethod: paymentMethod,
      trackingNumber: effectiveTrackingNumber,
      paymentStatus: isPaidOrder ? 'paid' : 'unpaid',
      status: isPaidOrder ? 'CONFIRMED' : 'PENDING',
      note: note,
      items: items.map(i => ({
        productId: String(i.id),
        variantId: i.variantId ? String(i.variantId) : undefined,
        productName: cleanVietnameseMojibake(i.name),
        unit: cleanVietnameseMojibake(i.unit),
        quantity: i.quantity,
        price: i.price
      }))
    });

    if (res.success && (res.trackingNumber || res.ghnOrderCode || effectiveTrackingNumber)) {
      const finalCode = res.trackingNumber || res.ghnOrderCode || effectiveTrackingNumber || '';
      setOrderId(finalCode);
      if (appliedVoucher) {
        markVoucherAsUsed(appliedVoucher.code);
      }
      
      // Save to local storage for tracking page
      const savedOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      savedOrders.unshift({
        code: finalCode,
        date: new Date().toISOString(),
        total: finalTotal
      });
      localStorage.setItem('my_orders', JSON.stringify(savedOrders));

      // Thông báo kiểu Shopee cho đơn hàng mới
      try {
        useNotificationStore.getState().addNotification({
          type: 'order',
          title: `Đặt hàng thành công: Đơn #${finalCode}`,
          message: `Đơn hàng trị giá ${finalTotal.toLocaleString('vi-VN')}đ đã được chuyển đến nhà vườn để chuẩn bị và đóng gói nông sản.`,
          link: `/tracking?order=${encodeURIComponent(finalCode)}`,
          orderCode: finalCode,
          tag: isPaidOrder ? 'Đã thanh toán' : 'Chờ xác nhận',
        });
      } catch (err) {
        console.warn('Failed to add order notification:', err);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
      toast.success(isPaidOrder ? 'Thanh toán & đặt hàng thành công!' : 'Đặt hàng thành công!');
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

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải thông tin đơn hàng...</p>
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
    { 
      id: 'ATM_CARD' as PaymentMethod, 
      name: 'Thẻ ATM nội địa (Napas / Thẻ ngân hàng)', 
      desc: 'Thanh toán trực tiếp bằng thẻ ATM tất cả ngân hàng Việt Nam (VCB, MB, Techcombank, NCB...)', 
      icon: CreditCard, 
      color: 'emerald', 
    },
    { 
      id: 'VNPAY' as PaymentMethod, 
      name: 'Cổng VNPAY-QR / Thẻ ATM', 
      desc: 'Thanh toán qua cổng VNPAY hỗ trợ thẻ nội địa và quốc tế', 
      icon: CreditCard, 
      color: 'indigo', 
    },
    { 
      id: 'BANK_TRANSFER' as PaymentMethod, 
      name: 'Chuyển khoản VietQR (SePay tự động)', 
      desc: 'Quét mã VietQR SePay xác nhận tức thì trong 3 giây', 
      icon: Building2, 
      color: 'blue', 
      badge: 'Tự động 24/7' 
    },
    { 
      id: 'COD' as PaymentMethod, 
      name: 'Thanh toán khi nhận hàng (COD)', 
      desc: 'Trả tiền mặt cho shipper khi nhận hàng', 
      icon: Banknote, 
      color: 'amber' 
    },
    { 
      id: 'MOMO' as PaymentMethod, 
      name: 'Ví điện tử MoMo', 
      desc: 'Phương thức Ví MoMo đang trong quá trình bảo trì & nâng cấp', 
      icon: CreditCard, 
      color: 'pink', 
      badge: 'Đang phát triển',
      disabled: true,
    },
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố * {loadingProvinces && <span className="text-emerald-600 text-xs font-normal animate-pulse">Đang tải...</span>}
                    </label>
                    <select value={selectedProvinceId} onChange={(e) => setSelectedProvinceId(Number(e.target.value) || '')}
                      disabled={loadingProvinces}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.province ? 'border-rose-400 bg-rose-50' : 'border-gray-300'} disabled:bg-gray-100 disabled:text-gray-400`}>
                      <option value="">{loadingProvinces ? '-- Đang tải Tỉnh/Thành... --' : '-- Chọn Tỉnh/Thành --'}</option>
                      {provinces.map(p => (
                        <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                      ))}
                    </select>
                    {formErrors.province && <p className="text-rose-500 text-xs mt-1">{formErrors.province}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện * {loadingDistricts && <span className="text-emerald-600 text-xs font-normal animate-pulse">Đang tải...</span>}
                    </label>
                    <select value={selectedDistrictId} onChange={(e) => setSelectedDistrictId(Number(e.target.value) || '')}
                      disabled={!selectedProvinceId || loadingDistricts}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.district ? 'border-rose-400 bg-rose-50' : 'border-gray-300'} disabled:bg-gray-100 disabled:text-gray-400`}>
                      <option value="">{loadingDistricts ? '-- Đang tải Quận/Huyện... --' : '-- Chọn Quận/Huyện --'}</option>
                      {districts.map(d => (
                        <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                      ))}
                    </select>
                    {formErrors.district && <p className="text-rose-500 text-xs mt-1">{formErrors.district}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phường/Xã * {loadingWards && <span className="text-emerald-600 text-xs font-normal animate-pulse">Đang tải...</span>}
                    </label>
                    <select value={selectedWardCode} onChange={(e) => setSelectedWardCode(e.target.value || '')}
                      disabled={!selectedDistrictId || loadingWards}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${formErrors.ward ? 'border-rose-400 bg-rose-50' : 'border-gray-300'} disabled:bg-gray-100 disabled:text-gray-400`}>
                      <option value="">{loadingWards ? '-- Đang tải Phường/Xã... --' : '-- Chọn Phường/Xã --'}</option>
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
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between text-emerald-800 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Truck size={18} className="text-emerald-600" />
                          <span>Phí vận chuyển Giao Hàng Nhanh (GHN)</span>
                        </div>
                        {isCalculatingFee ? (
                          <span className="text-xs text-gray-500 animate-pulse">Đang tính phí...</span>
                        ) : isFreeShipping ? (
                          <div className="text-right">
                            <span className="line-through text-xs text-gray-400 mr-1.5">
                              {(rawShippingFee || 28000).toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-emerald-700 font-bold">Miễn phí 🎉</span>
                          </div>
                        ) : rawShippingFee !== null ? (
                          <span className="font-bold text-emerald-700 text-base">
                            {rawShippingFee.toLocaleString('vi-VN')}đ
                          </span>
                        ) : (
                          <span className="text-gray-500">Đang cập nhật...</span>
                        )}
                      </div>
                      {isFreeShipping ? (
                        <p className="text-[11px] text-emerald-600 mt-1">
                          🎉 Đơn hàng từ 300.000đ được miễn phí vận chuyển toàn quốc!
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-500 mt-1">
                          Cước tính tự động theo địa chỉ người nhận và khối lượng hàng.
                        </p>
                      )}
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
                    const isDisabled = Boolean((pm as any).disabled);
                    return (
                      <label key={pm.id}
                        className={`flex items-start gap-4 p-4 border rounded-xl transition-all ${
                          isDisabled
                            ? 'opacity-60 cursor-not-allowed bg-slate-50/70 border-slate-200'
                            : isSelected 
                              ? 'border-emerald-500 bg-emerald-50 shadow-sm cursor-pointer' 
                              : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                        }`}>
                        <input type="radio" name="payment" value={pm.id} checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => {
                            if (!isDisabled) setPaymentMethod(pm.id);
                          }}
                          className="w-4 h-4 text-emerald-600 accent-emerald-600 mt-1 disabled:opacity-40" />
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
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800 text-sm">{pm.name}</span>
                              {(pm as any).badge && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  pm.id === 'MOMO' 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200/80' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {(pm as any).badge}
                                </span>
                              )}
                            </div>
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

              {/* PHÂN BỔ KIỆN HÀNG NÔNG HỘ CHUẨN SÀN SHOPEE */}
              {shippingPackages.length > 1 ? (
                <div className="space-y-3 mb-6 max-h-[350px] overflow-y-auto pr-1">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 flex items-start gap-2">
                    <Truck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Đơn hàng gồm {shippingPackages.length} kiện hàng:</span>
                      <p className="text-[11px] text-amber-700 mt-0.5">Mỗi kiện xuất phát từ kho của nhà vườn độc lập (Bắc/Trung/Nam) tới bạn qua GHN.</p>
                    </div>
                  </div>

                  {shippingPackages.map((pkg, pIdx) => (
                    <div key={pkg.farmer_key || pIdx} className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-3">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-100">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Package size={14} className="text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-gray-800 truncate">{pkg.farmer_name}</span>
                          {pkg.ghn_shop_id && (
                            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 border border-orange-200 px-1.5 py-0.2 rounded shrink-0 font-mono">
                              Shop #{pkg.ghn_shop_id}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                          Ship: {pkg.shipping_fee.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin size={10} className="text-gray-400 shrink-0" />
                        <span className="truncate">Gửi từ kho GHN: {pkg.from_location}</span>
                      </p>
                      <div className="space-y-2">
                        {pkg.items.map((item: any, iIdx: number) => (
                          <div key={`${item.id}-${item.variantId || iIdx}`} className="flex gap-2 text-xs">
                            <img src={item.image} alt={cleanVietnameseMojibake(item.name)} className="w-10 h-10 object-cover rounded border border-gray-200 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-800 truncate">{cleanVietnameseMojibake(item.name)}</h5>
                              <p className="text-[10px] text-gray-500">{cleanVietnameseMojibake(item.unit)} • x{item.quantity}</p>
                              <p className="text-xs font-bold text-gray-700 mt-0.5">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variantId}`} className="flex gap-3">
                      <div className="relative">
                        <img src={item.image} alt={cleanVietnameseMojibake(item.name)} className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                        <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{cleanVietnameseMojibake(item.name)}</h4>
                        <p className="text-xs text-gray-500">{cleanVietnameseMojibake(item.unit)}</p>
                        {(() => {
                          const product = ALL_PRODUCTS.find(p => p.id === item.id || p.slug === item.slug);
                          const farmerName = item.farmer?.name || item.farmer?.farmName || product?.farmer?.name;
                          const farmerRegion = item.farmer?.region || product?.farmer?.region;
                          return farmerName ? (
                            <p className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5">
                              <MapPin size={9} /> {farmerName} {farmerRegion ? `(${farmerRegion})` : ''}
                            </p>
                          ) : null;
                        })()}
                        <p className="text-sm font-bold text-gray-700 mt-1">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* KHỐI ÁP DỤNG VOUCHER & MÃ KHUYẾN MÃI */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <Ticket size={16} className="text-emerald-600" />
                    Mã khuyến mãi & Voucher
                  </span>
                  {(userVouchers || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowVoucherList(!showVoucherList)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={12} />
                      Ví voucher ({(userVouchers || []).filter(v => !v.isUsed).length})
                    </button>
                  )}
                </div>

                {/* Form nhập mã */}
                {!appliedVoucher ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nhập mã (GREEN10, GF50K...)"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyManualVoucher(); }}}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none uppercase font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:normal-case placeholder:font-normal placeholder:text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyManualVoucher}
                      disabled={isCheckingVoucher || !voucherInput.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                    >
                      {isCheckingVoucher ? 'Kiểm tra...' : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  /* Thẻ hiển thị voucher đang áp dụng */
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-800 text-xs tracking-wider">{appliedVoucher.code}</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Đã áp dụng</span>
                        </div>
                        <p className="text-xs text-emerald-700 font-medium">{appliedVoucher.title}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                      title="Gỡ bỏ mã"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Danh sách voucher có sẵn trong ví người dùng */}
                {showVoucherList && (
                  <div className="mt-3 p-3 bg-gray-50 border border-emerald-100 rounded-xl space-y-2.5 max-h-[220px] overflow-y-auto">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 border-b border-gray-200 pb-1.5">
                      <span>Voucher trong ví của bạn:</span>
                      <button
                        type="button"
                        onClick={() => setShowVoucherList(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {(userVouchers || []).length === 0 ? (
                      <p className="text-xs text-gray-500 py-2 text-center">Bạn chưa có voucher nào trong ví. Hãy đổi điểm thưởng tại trang cá nhân!</p>
                    ) : (
                      (userVouchers || []).map((v) => {
                        const isApplicable = totalAmount >= v.minOrder && !v.isUsed;
                        const isCurrent = appliedVoucher?.code === v.code;
                        return (
                          <div
                            key={v.id}
                            className={`p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${
                              isCurrent
                                ? 'border-emerald-500 bg-emerald-50'
                                : v.isUsed
                                ? 'border-gray-200 bg-gray-100 opacity-60'
                                : isApplicable
                                ? 'border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-xs'
                                : 'border-gray-200 bg-white opacity-80'
                            }`}
                          >
                            <div className="flex-1 pr-1">
                              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                                <Ticket size={13} className="text-emerald-600 shrink-0" />
                                <span>{v.code}</span>
                                {v.isUsed && <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded">Đã dùng</span>}
                              </div>
                              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{v.title}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Đơn từ {v.minOrder.toLocaleString('vi-VN')}đ • HSD: {v.expiryDate}
                              </p>
                              {!isApplicable && !v.isUsed && (
                                <p className="text-[10px] text-rose-500 mt-0.5">
                                  Mua thêm {(v.minOrder - totalAmount).toLocaleString('vi-VN')}đ để dùng
                                </p>
                              )}
                            </div>
                            <div>
                              {isCurrent ? (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                                  Đang chọn
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!isApplicable}
                                  onClick={() => handleApplyVoucherFromWallet(v)}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                                >
                                  Dùng ngay
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                  <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={14} /> Giảm giá voucher ({appliedVoucher?.code})
                    </span>
                    <span>-{calculatedDiscount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Phí giao hàng {shippingPackages.length > 1 ? `(${shippingPackages.length} kiện nhà vườn)` : 'GHN'}
                  </span>
                  <span className={isFreeShipping ? 'text-emerald-600 font-medium' : 'text-gray-700 font-medium'}>
                    {!selectedWardCode
                      ? 'Chọn địa chỉ'
                      : isCalculatingFee
                        ? 'Đang tính...'
                        : isFreeShipping
                          ? 'Miễn phí 🎉'
                          : `${shippingFee.toLocaleString('vi-VN')}đ`}
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
                disabled={isSubmitting || paymentMethod === 'MOMO'}
                className={`w-full font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  isSubmitting || paymentMethod === 'MOMO'
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>Đang khởi tạo...</>
                ) : paymentMethod === 'MOMO' ? (
                  <>⚠️ Ví MoMo đang phát triển (Vui lòng chọn phương thức khác)</>
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
              {paymentMethod === 'BANK_TRANSFER' && '⚡ Thanh toán VietQR SePay'}
              {paymentMethod === 'VNPAY' && '💳 Thanh toán VNPay'}
            </h3>

            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      VietQR SePay tự động
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">Khớp lệnh tự động 24/7</span>
                  </div>

                  <div className="text-center my-2">
                    <p className="text-xs text-gray-500 mb-0.5">Số tiền chuyển khoản</p>
                    <p className="text-2xl font-black text-blue-700 font-mono">
                      {finalTotal.toLocaleString('vi-VN')}đ
                    </p>
                  </div>

                  {/* VietQR Display */}
                  <div className="bg-white rounded-xl p-3 border border-blue-100 shadow-sm flex flex-col items-center justify-center my-2">
                    {isGeneratingSepay ? (
                      <div className="py-10 flex flex-col items-center gap-2 text-blue-600">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-medium">Đang tạo mã VietQR...</span>
                      </div>
                    ) : sepayData?.qrCodeUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={sepayData.qrCodeUrl}
                          alt="VietQR SePay"
                          className="w-44 h-44 object-contain rounded-lg border border-gray-100 shadow-inner"
                        />
                        <p className="text-[11px] text-gray-500 text-center">
                          Mở App ngân hàng bất kỳ để quét mã VietQR
                        </p>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-gray-400 text-xs">
                        Đang tạo mã thanh toán...
                      </div>
                    )}
                  </div>

                  {/* Bank Details with Copy buttons */}
                  <div className="space-y-1.5 text-xs bg-white/90 rounded-xl p-3 border border-blue-100">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-500">Ngân hàng:</span>
                      <strong className="text-gray-800">{sepayData?.bank || 'MBBank'}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-500">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono text-blue-700 text-sm font-bold">{sepayData?.accountNumber || '0987654321'}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sepayData?.accountNumber || '0987654321', 'Số tài khoản')}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
                          title="Sao chép số tài khoản"
                        >
                          {copiedField === 'Số tài khoản' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-500">Chủ tài khoản:</span>
                      <strong className="text-gray-800 uppercase">{sepayData?.accountName || 'CONG TY GREENFOOD'}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500">Nội dung CK:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                          {sepayData?.description || tempOrderId}
                        </strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sepayData?.description || tempOrderId, 'Nội dung chuyển khoản')}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-emerald-600 transition-colors"
                          title="Sao chép nội dung"
                        >
                          {copiedField === 'Nội dung chuyển khoản' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Realtime Waiting Indicator */}
                  <div className="mt-2.5">
                    {isSepayPaid ? (
                      <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold animate-pulse shadow-sm">
                        <Check size={18} className="text-emerald-600 stroke-[3]" />
                        🎉 ĐÃ NHẬN ĐƯỢC TIỀN! HỆ THỐNG ĐANG TỰ ĐỘNG CHUYỂN TRANG...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        <span className="text-gray-700 font-medium">Đang đợi quét mã... Hệ thống tự động xác nhận sau khi chuyển khoản</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'VNPAY' && (
              <div className="space-y-4 text-center">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-indigo-700 text-sm">Bạn sẽ được chuyển đến cổng thanh toán VNPay</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">{finalTotal.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-indigo-100 rounded-xl h-40 flex items-center justify-center text-indigo-500 font-medium text-sm border border-dashed border-indigo-300">
                  💳 Cổng thanh toán VNPAY-QR / Thẻ ATM
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button 
                disabled={isSepayPaid}
                onClick={() => setShowPaymentPopup(false)}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 disabled:opacity-50">
                Đóng
              </button>
              <button 
                disabled={isSepayPaid}
                onClick={() => processOrder(undefined, true)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSepayPaid
                    ? 'bg-emerald-500 text-white cursor-wait'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}>
                {isSepayPaid ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang hoàn tất...</span>
                  </>
                ) : (
                  <span>Tự động khớp lệnh 24/7</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
