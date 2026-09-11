"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Star, ShieldCheck, Search, Leaf, Map } from 'lucide-react';
import { getFarmers, FarmerData } from '@/lib/api';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getFarmers({ zone: selectedZone, search: searchTerm });
      setFarmers(data);
      setLoading(false);
    }
    load();
  }, [selectedZone, searchTerm]);

  const zones = [
    { value: 'all', label: 'Tất cả vùng' },
    { value: 'south', label: 'Miền Nam' },
    { value: 'central', label: 'Miền Trung & Tây Nguyên' },
    { value: 'north', label: 'Miền Bắc' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 lg:px-8 py-16 relative z-10">
          <div className="flex items-center text-sm text-emerald-200 mb-6 gap-1">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">Nông hộ đối tác</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nông Hộ & HTX Liên Kết</h1>
          <p className="text-lg text-emerald-100 max-w-2xl">
            Gặp gỡ những người nông dân tâm huyết đang ngày đêm mang đến nông sản sạch, an toàn cho bàn ăn của bạn.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nông hộ, vùng miền..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {zones.map(z => (
              <button
                key={z.value}
                onClick={() => setSelectedZone(z.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedZone === z.value
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Farmers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa tìm thấy nông hộ</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={farmer.image}
                    alt={farmer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {farmer.isVerified && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Đã xác minh
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-xl font-bold">{farmer.name}</h3>
                    <p className="text-sm text-gray-200 flex items-center gap-1">
                      <MapPin size={12} /> {farmer.address}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={16} fill="currentColor" />
                      <span className="font-bold text-gray-800">{farmer.rating}</span>
                      <span className="text-xs text-gray-400">/ 5.0</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{farmer.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Leaf size={14} className="text-emerald-500" />
                    <span>Chuyên: <strong className="text-gray-800">{farmer.specialty}</strong></span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Chủ vườn: {farmer.owner}</p>
                  <div className="flex gap-2">
                    <Link
                      href="/map"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-emerald-100 transition-colors border border-emerald-100"
                    >
                      <Map size={14} /> Xem trên bản đồ
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
