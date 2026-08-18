"use client";

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = totalAmount > 500000 ? 0 : 30000;
  const finalTotal = totalAmount + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Giả lập gọi API đặt hàng
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-emerald-100 text-emerald-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Đặt hàng thành công!</h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã đồng hành cùng nông sản Việt. Mã đơn hàng của bạn là <strong>#GF{Math.floor(Math.random() * 100000)}</strong>. Chúng tôi sẽ sớm liên hệ để xác nhận giao hàng.
        </p>
        <Link 
          href="/"
          className="inline-block bg-emerald-600 text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-700 transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
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

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center text-gray-500 hover:text-emerald-600 mb-6 text-sm font-medium">
        <ChevronLeft size={16} /> Tiếp tục mua hàng
      </Link>
      
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form nhập thông tin */}
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin giao hàng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Nhập họ tên đầy đủ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input required type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Nhập số điện thoại" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Email nhận hóa đơn (không bắt buộc)" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng *</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú đơn hàng</label>
              <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Ghi chú thêm về thời gian giao hàng..."></textarea>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-t border-gray-100 pt-6">Phương thức thanh toán</h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-emerald-500 bg-emerald-50 rounded-lg cursor-pointer transition-colors">
                <input type="radio" name="payment" value="cod" defaultChecked className="w-4 h-4 text-emerald-600 accent-emerald-600" />
                <span className="ml-3 font-medium text-emerald-800">Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="payment" value="transfer" className="w-4 h-4 text-emerald-600 accent-emerald-600" />
                <span className="ml-3 font-medium text-gray-700">Chuyển khoản qua ngân hàng / Ví MoMo</span>
              </label>
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
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí giao hàng</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
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
                isSubmitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>Đang xử lý...</>
              ) : (
                <>Đặt hàng ngay <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
