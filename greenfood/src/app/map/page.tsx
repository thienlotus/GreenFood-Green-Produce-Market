"use client";

import { useState, useEffect } from 'react';
import { Search, MapPin, Star, ChevronRight, Leaf, X } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getFarmers, FarmerData } from '@/lib/api';

// Dynamic import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

const fallbackFarms: FarmerData[] = [
  { id: 'f1', name: 'Vườn Trái Cây Chú Ba', owner: 'Nguyễn Văn Ba', region: 'Bến Tre', zone: 'south', address: 'Chợ Lách, Bến Tre', lat: 10.2348, lng: 106.3485, rating: 4.8, products: 12, specialty: 'Sầu riêng Ri6, Bưởi da xanh', isVerified: true, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' },
  { id: 'f2', name: 'HTX Bưởi Da Xanh', owner: 'Trần Văn Năm', region: 'Vĩnh Long', zone: 'south', address: 'Bình Minh, Vĩnh Long', lat: 10.0772, lng: 105.9545, rating: 4.6, products: 8, specialty: 'Bưởi da xanh ruột hồng', isVerified: true, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400' },
  { id: 'f3', name: 'Nông Trại Xanh Đà Lạt', owner: 'Phạm Thị Lan', region: 'Lâm Đồng', zone: 'central', address: 'Đơn Dương, Lâm Đồng', lat: 11.8188, lng: 108.4933, rating: 4.9, products: 15, specialty: 'Dâu tây, Dưa lưới hữu cơ', isVerified: true, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400' },
  { id: 'f4', name: 'Vườn Xoài Ông Năm', owner: 'Lê Văn Năm', region: 'Đồng Tháp', zone: 'south', address: 'Cao Lãnh, Đồng Tháp', lat: 10.4563, lng: 105.6409, rating: 4.5, products: 6, specialty: 'Xoài cát Hòa Lộc', isVerified: false, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400' },
  { id: 'f5', name: 'Trang Trại Mộc Châu', owner: 'Hoàng Văn Minh', region: 'Sơn La', zone: 'north', address: 'Mộc Châu, Sơn La', lat: 20.8332, lng: 104.6724, rating: 4.7, products: 10, specialty: 'Mận hậu, Đào Mộc Châu', isVerified: true, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' },
  { id: 'f6', name: 'HTX Chè Thái Nguyên', owner: 'Nguyễn Thị Mai', region: 'Thái Nguyên', zone: 'north', address: 'Tân Cương, Thái Nguyên', lat: 21.5546, lng: 105.8008, rating: 4.4, products: 5, specialty: 'Chè Tân Cương, Trà xanh', isVerified: true, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400' },
];

const zoneNames: Record<string, string> = { all: 'Tất cả vùng', north: 'Miền Bắc', central: 'Miền Trung', south: 'Miền Nam' };
const zoneColors: Record<string, string> = { north: 'bg-blue-100 text-blue-700', central: 'bg-amber-100 text-amber-700', south: 'bg-emerald-100 text-emerald-700' };

export default function MapPage() {
  const [farms, setFarms] = useState<FarmerData[]>(fallbackFarms);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('all');
  const [selectedFarm, setSelectedFarm] = useState<FarmerData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function loadFarmers() {
      const data = await getFarmers({ zone: filterZone, search: searchTerm });
      if (data && data.length > 0) {
        setFarms(data);
      }
    }
    loadFarmers();
  }, [filterZone, searchTerm]);

  const filteredFarms = farms.filter(f =>
    (filterZone === 'all' || f.zone === filterZone) &&
    (f.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
     f.region.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
     f.specialty.toLowerCase().includes(searchTerm.trim().toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <MapPin size={22} className="text-emerald-600" />
            </div>
            Bản Đồ Nhà Vườn GreenFood (GIS API)
          </h1>
          <p className="text-gray-600 mt-2">Dữ liệu tọa độ GPS thực tế kết nối trực tiếp từ Backend CSDL Nông nghiệp</p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm nhà vườn, vùng miền, đặc sản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex gap-2">
              {Object.entries(zoneNames).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterZone(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    filterZone === key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Sidebar list */}
        <div className="w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto order-2 lg:order-1">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-600">
              <Leaf size={14} className="inline text-emerald-500 mr-1" />
              Tìm thấy <strong className="text-emerald-700">{filteredFarms.length}</strong> nhà vườn
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredFarms.map((farm) => (
              <button
                key={farm.id}
                onClick={() => setSelectedFarm(farm)}
                className={`w-full text-left p-4 hover:bg-emerald-50 transition-colors ${selectedFarm?.id === farm.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''}`}
              >
                <div className="flex gap-3">
                  <img src={farm.image} alt={farm.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{farm.name}</h3>
                      {farm.isVerified && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">VietGAP</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} /> {farm.address}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Star size={12} fill="currentColor" /> {farm.rating}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${zoneColors[farm.zone]}`}>
                        {zoneNames[farm.zone]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">{farm.specialty}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0 self-center" />
                </div>
              </button>
            ))}
            {filteredFarms.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Search size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Không tìm thấy nhà vườn nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative order-1 lg:order-2 min-h-[400px]">
          {isClient && (
            <>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <MapContainer
                center={[14.0583, 108.2772]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredFarms.map((farm) => (
                  <Marker
                    key={farm.id}
                    position={[farm.lat, farm.lng]}
                    eventHandlers={{ click: () => setSelectedFarm(farm) }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <img src={farm.image} alt={farm.name} className="w-full h-24 object-cover rounded-md mb-2" />
                        <h3 className="font-bold text-gray-800 text-sm">{farm.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <span>📍</span> {farm.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-amber-600 font-medium">⭐ {farm.rating}</span>
                          <span className="text-xs text-gray-500">• {farm.products} sản phẩm</span>
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">🌿 {farm.specialty}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </>
          )}
        </div>
      </div>

      {/* Farm Detail Modal */}
      {selectedFarm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4" onClick={() => setSelectedFarm(null)}>
          <div className="bg-white rounded-t-2xl lg:rounded-2xl shadow-xl w-full lg:max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedFarm.image} alt={selectedFarm.name} className="w-full h-48 object-cover rounded-t-2xl" />
              <button onClick={() => setSelectedFarm(null)} className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full hover:bg-white transition-colors">
                <X size={18} />
              </button>
              {selectedFarm.isVerified && (
                <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Leaf size={12} /> VietGAP
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedFarm.name}</h2>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <MapPin size={14} className="text-emerald-500" /> {selectedFarm.address}
              </p>

              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star size={16} fill="currentColor" /> {selectedFarm.rating}
                </span>
                <span className="text-sm text-gray-500">{selectedFarm.products} sản phẩm</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${zoneColors[selectedFarm.zone]}`}>
                  {zoneNames[selectedFarm.zone]}
                </span>
              </div>

              <hr className="my-4 border-gray-100" />

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Chủ vườn</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedFarm.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Đặc sản</p>
                  <p className="text-sm text-emerald-700 font-medium">{selectedFarm.specialty}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Tọa độ GPS</p>
                  <p className="text-sm text-gray-600 font-mono">{selectedFarm.lat.toFixed(4)}, {selectedFarm.lng.toFixed(4)}</p>
                </div>
              </div>

              <Link href="/category/trai-cay" className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                Xem sản phẩm <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
