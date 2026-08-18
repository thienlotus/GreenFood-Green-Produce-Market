"use client";

import { X, Trash2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-800">Giỏ hàng của bạn</h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-600">Giỏ hàng trống</p>
              <p className="text-sm mt-1 mb-6 text-center">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-emerald-700 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.variantId}`} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-50"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 pr-2">{item.name}</h3>
                        <button 
                          onClick={() => removeItem(item.id, item.variantId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.unit}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-emerald-600">
                        {item.price.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="flex items-center border border-gray-200 rounded-lg h-8">
                        <button 
                          onClick={() => updateQuantity(item.id, item.variantId, Math.max(1, item.quantity - 1))}
                          className="px-2.5 text-gray-500 hover:text-emerald-600 font-bold"
                        >-</button>
                        <span className="w-6 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                          className="px-2.5 text-gray-500 hover:text-emerald-600 font-bold"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Tổng tạm tính:</span>
              <span className="text-xl font-bold text-emerald-600">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <Link 
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              Tiến hành thanh toán
              <ChevronRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
