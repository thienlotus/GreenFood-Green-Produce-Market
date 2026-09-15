"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, ChevronRight, Leaf, X, ListFilter, Map as MapIcon, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getFarmers, FarmerData } from '@/lib/api';

// Dynamic import component bản đồ Leaflet không chạy trên SSR
const FarmerLeafletMap = dynamic(() => import('@/components/FarmerLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-emerald-700">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-semibold text-gray-600">Đang tải bản đồ nhà vườn GreenFood...</p>
    </div>
  ),
});

const fallbackFarms: FarmerData[] = [
  { id: 'f1', name: 'Vườn Trái Cây Chú Ba', owner: 'Nguyễn Văn Ba', region: 'Bến Tre', zone: 'south', address: 'Chợ Lách, Bến Tre', lat: 10.2348, lng: 106.3485, rating: 4.8, products: 12, specialty: 'Sầu riêng Ri6, Bưởi da xanh', isVerified: true, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' },
  { id: 'f2', name: 'HTX Bưởi Da Xanh', owner: 'Trần Văn Năm', region: 'Vĩnh Long', zone: 'south', address: 'Bình Minh, Vĩnh Long', lat: 10.0772, lng: 105.9545, rating: 4.6, products: 8, specialty: 'Bưởi da xanh ruột hồng', isVerified: true, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
  { id: 'f3', name: 'Nông Trại Xanh Đà Lạt', owner: 'Phạm Thị Lan', region: 'Lâm Đồng', zone: 'central', address: 'Đơn Dương, Lâm Đồng', lat: 11.8188, lng: 108.4933, rating: 4.9, products: 15, specialty: 'Dâu tây, Dưa lưới hữu cơ', isVerified: true, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400' },
  { id: 'f4', name: 'Vườn Xoài Ông Năm', owner: 'Lê Văn Năm', region: 'Đồng Tháp', zone: 'south', address: 'Cao Lãnh, Đồng Tháp', lat: 10.4563, lng: 105.6409, rating: 4.5, products: 6, specialty: 'Xoài cát Hòa Lộc', isVerified: false, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400' },
  { id: 'f5', name: 'Trang Trại Mộc Châu', owner: 'Hoàng Văn Minh', region: 'Sơn La', zone: 'north', address: 'Mộc Châu, Sơn La', lat: 20.8332, lng: 104.6724, rating: 4.7, products: 10, specialty: 'Mận hậu, Đào Mộc Châu, Cà phê', isVerified: true, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' },
  { id: 'f6', name: 'HTX Chè Thái Nguyên', owner: 'Nguyễn Thị Mai', region: 'Thái Nguyên', zone: 'north', address: 'Tân Cương, Thái Nguyên', lat: 21.5546, lng: 105.8008, rating: 4.4, products: 5, specialty: 'Chè Tân Cương, Trà xanh', isVerified: true, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400' },
];

const zoneNames: Record<string, string> = { all: 'Tất cả vùng', north: 'Miền Bắc', central: 'Miền Trung', south: 'Miền Nam' };
const zoneColors: Record<string, string> = { north: 'bg-blue-50 text-blue-700 border-blue-200', central: 'bg-amber-50 text-amber-700 border-amber-200', south: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

export default function MapPage() {
  const [farms, setFarms] = useState<FarmerData[]>(fallbackFarms);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('all');
  const [selectedFarm, setSelectedFarm] = useState<FarmerData | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('map');

  const sidebarListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadFarmers() {
      const data = await getFarmers({ zone: filterZone, search: searchTerm });
      if (data && data.length > 0) {
        setFarms(data);
      }
    }
    loadFarmers();
  }, [filterZone, searchTerm]);

  const filteredFarms = farms.filter((f) => {
    const matchZone = filterZone === 'all' || f.zone === filterZone;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const matchSearch =
      !cleanSearch ||
      f.name.toLowerCase().includes(cleanSearch) ||
      f.region.toLowerCase().includes(cleanSearch) ||
      f.address.toLowerCase().includes(cleanSearch) ||
      f.specialty.toLowerCase().includes(cleanSearch);
    return matchZone && matchSearch;
  });

  const handleSelectFarm = (farm: FarmerData) => {
    setSelectedFarm(farm);
    if (mobileView === 'list') {
      setMobileView('map');
    }
  };

  const handleResetView = () => {
    setSelectedFarm(null);
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className="bg-gray-100 flex flex-col h-[calc(100vh-160px)] min-h-[550px] overflow-hidden">
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-2 flex items-center justify-center gap-2 z-20 shadow-sm">
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'map' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <MapIcon size={14} /> Bản đồ ({filteredFarms.length})
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <ListFilter size={14} /> Danh sách nhà vườn
        </button>
      </div>

      {/* Main Container: Split-view Sidebar & Leaflet Map */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* SIDEBAR BÊN TRÁI: Tìm kiếm, Bộ lọc & Danh sách nhà vườn */}
        <div
          className={`w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 shadow-lg lg:shadow-none transition-all duration-300 ${
            mobileView === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Header & Filter Controls */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 leading-tight">Bản Đồ Nông Hộ</h1>
                  <p className="text-[11px] text-gray-500">Mạng lưới nhà vườn sạch GreenFood</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {filteredFarms.length} đối tác
              </span>
            </div>

            {/* Input tìm kiếm */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Tìm tên nhà vườn, tỉnh thành, đặc sản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Bộ lọc vùng miền */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Object.entries(zoneNames).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterZone(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterZone === key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách nhà vườn có thể cuộn */}
          <div ref={sidebarListRef} className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-2">
            {filteredFarms.length > 0 ? (
              filteredFarms.map((farm) => {
                const isSelected = selectedFarm?.id === farm.id;
                return (
                  <div
                    key={farm.id}
                    onClick={() => handleSelectFarm(farm)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" />
                        {farm.isVerified && (
                          <span className="absolute bottom-1 right-1 bg-amber-500 text-white text-[9px] font-extrabold px-1 rounded shadow">
                            GAP
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{farm.name}</h3>
                          <span className="flex items-center gap-0.5 text-xs text-amber-600 font-bold shrink-0">
                            <Star size={11} fill="currentColor" /> {farm.rating}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={11} className="text-gray-400 shrink-0" />
                          <span className="truncate">{farm.address}</span>
                        </p>

                        <p className="text-xs text-emerald-700 font-medium mt-1 truncate">
                          🌿 {farm.specialty}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-medium border ${zoneColors[farm.zone] || ''}`}>
                            {zoneNames[farm.zone]}
                          </span>
                          <span className="text-gray-500 font-medium">
                            {farm.products} sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Không tìm thấy nhà vườn nào</p>
                <p className="text-xs text-gray-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn vùng miền khác.</p>
                <button
                  onClick={() => { setSearchTerm(''); setFilterZone('all'); }}
                  className="mt-4 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BẢN ĐỒ LEAFLET BÊN PHẢI (Dynamic client-only) */}
        <div
          className={`flex-1 h-full relative overflow-hidden bg-slate-100 ${
            mobileView === 'map' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <FarmerLeafletMap
            farms={filteredFarms}
            selectedFarm={selectedFarm}
            onSelectFarm={handleSelectFarm}
            resetTrigger={resetTrigger}
            onResetView={handleResetView}
          />
        </div>
      </div>

      {/* Modal chi tiết nhà vườn (Khi click "Chi tiết" hoặc chọn nhà vườn) */}
      {selectedFarm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedFarm(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 sm:h-56 bg-gray-100">
              <img src={selectedFarm.image} alt={selectedFarm.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedFarm(null)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-colors"
              >
                <X size={18} />
              </button>
              {selectedFarm.isVerified && (
                <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                  <Leaf size={14} /> Tiêu chuẩn VietGAP
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedFarm.name}</h2>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <MapPin size={15} className="text-emerald-600 shrink-0" /> {selectedFarm.address}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-amber-600 font-extrabold text-base bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                  <Star size={15} fill="currentColor" /> {selectedFarm.rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[11px] text-gray-500 uppercase font-bold">Chủ nông hộ</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedFarm.owner}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[11px] text-gray-500 uppercase font-bold">Quy mô sản phẩm</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">{selectedFarm.products} nông sản</p>
                </div>
              </div>

              <div className="mt-4 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                <p className="text-[11px] text-emerald-800 uppercase font-bold">Đặc sản tiêu biểu</p>
                <p className="text-sm font-semibold text-emerald-900 mt-0.5">🌾 {selectedFarm.specialty}</p>
              </div>

              <div className="mt-3 text-xs text-gray-500 font-mono flex items-center justify-between">
                <span>Tọa độ GPS:</span>
                <span>{selectedFarm.lat.toFixed(4)}, {selectedFarm.lng.toFixed(4)}</span>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  href="/category/trai-cay"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  Xem nông sản nhà vườn <ChevronRight size={16} />
                </Link>
                <button
                  onClick={() => setSelectedFarm(null)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
