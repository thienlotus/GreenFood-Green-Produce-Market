"use client";

import { Save, Globe, Lock, Bell, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminSettings() {
  const handleSave = () => {
    toast.success('Đã lưu cấu hình hệ thống thành công!');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Cài đặt Hệ thống</h2>
          <p className="text-sm text-gray-500 mt-1">Cấu hình thông tin cửa hàng và hệ thống vận hành.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Section: Thông tin chung */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Store size={20} className="text-emerald-600" />
              Thông tin cửa hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
                <input type="text" defaultValue="GreenFood" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotline</label>
                <input type="text" defaultValue="028 7770 2614" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ văn phòng</label>
                <input type="text" defaultValue="Quận 1, TP. Hồ Chí Minh" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section: Khu vực & Vận chuyển */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Globe size={20} className="text-emerald-600" />
              Giao hàng & Vận chuyển
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                <span className="text-sm text-gray-700">Cho phép giao hàng hỏa tốc (2h) tại TP.HCM</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                <span className="text-sm text-gray-700">Miễn phí giao hàng cho đơn trên 500.000đ</span>
              </label>
            </div>
          </section>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Save size={18} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
