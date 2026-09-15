"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Star, ChevronRight, RotateCcw, Layers } from 'lucide-react';
import { FarmerData } from '@/lib/api';

// Helper controller bên trong MapContainer
function MapController({
  selectedFarm,
  resetTrigger,
}: {
  selectedFarm: FarmerData | null;
  resetTrigger: number;
}) {
  const map = useMap();

  // Đảm bảo Leaflet tính toán đúng kích thước khi container mount hoặc resize
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  // Bay tới vị trí nhà vườn được chọn
  useEffect(() => {
    if (selectedFarm) {
      map.flyTo([selectedFarm.lat, selectedFarm.lng], 13, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedFarm, map]);

  // Reset góc nhìn toàn cảnh Việt Nam
  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo([14.0583, 108.2772], 6, {
        duration: 1.0,
      });
    }
  }, [resetTrigger, map]);

  return null;
}

// Icon tùy biến SVG chuẩn nét cho nông sản GreenFood
const createFarmIcon = (isSelected: boolean, isVerified: boolean) => {
  const bgColor = isSelected ? '#059669' : '#10b981';
  const size = isSelected ? 42 : 36;
  const pinShadow = isSelected
    ? 'filter: drop-shadow(0 4px 8px rgba(5,150,105,0.5));'
    : 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; ${pinShadow} transition: transform 0.2s;">
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${bgColor}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="3" fill="#ffffff" stroke="none"/>
        </svg>
        <span style="position: absolute; top: ${size * 0.18}px; font-size: ${size * 0.35}px;">🌱</span>
        ${isVerified ? `<span style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background-color: #f59e0b; border: 2px solid #ffffff; border-radius: 9999px;"></span>` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

interface FarmerLeafletMapProps {
  farms: FarmerData[];
  selectedFarm: FarmerData | null;
  onSelectFarm: (farm: FarmerData) => void;
  resetTrigger: number;
  onResetView: () => void;
}

export default function FarmerLeafletMap({
  farms,
  selectedFarm,
  onSelectFarm,
  resetTrigger,
  onResetView,
}: FarmerLeafletMapProps) {
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-100">
      <MapContainer
        center={[14.0583, 108.2772]}
        zoom={6}
        minZoom={5}
        maxZoom={18}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        {/* Google Maps Tiles: Tốc độ cao tại Việt Nam, chuẩn tiếng Việt 100%, KHÔNG CÓ WATERMARK API KEY REQUIRED */}
        {mapType === 'satellite' ? (
          <TileLayer
            attribution='&copy; Google Maps Vệ Tinh'
            url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
          />
        )}

        {/* Controller điều khiển invalidateSize và flyTo */}
        <MapController selectedFarm={selectedFarm} resetTrigger={resetTrigger} />

        {/* Marker nhà vườn */}
        {farms.map((farm) => {
          const isSelected = selectedFarm?.id === farm.id;
          return (
            <Marker
              key={farm.id}
              position={[farm.lat, farm.lng]}
              icon={createFarmIcon(isSelected, farm.isVerified)}
              eventHandlers={{
                click: () => onSelectFarm(farm),
              }}
            >
              <Popup className="custom-farm-popup">
                <div className="w-56 p-1 text-gray-800">
                  <div className="relative h-24 rounded-lg overflow-hidden mb-2 bg-gray-100">
                    <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" />
                    {farm.isVerified && (
                      <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        VietGAP
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-gray-900 leading-snug">{farm.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                    <MapPin size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{farm.address}</span>
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs">
                    <span className="text-amber-600 font-bold flex items-center gap-0.5">
                      ⭐ {farm.rating}
                    </span>
                    <span className="text-gray-500">{farm.products} sản phẩm</span>
                  </div>

                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    🌱 {farm.specialty}
                  </p>

                  <button
                    onClick={() => onSelectFarm(farm)}
                    className="mt-2.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    Chi tiết nhà vườn <ChevronRight size={14} />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bộ điều khiển góc phải: Chuyển layer và Xem toàn cảnh */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* Toggle Kiểu bản đồ */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-gray-200 flex items-center gap-1">
          <button
            onClick={() => setMapType('standard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'standard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tiêu chuẩn
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Vệ tinh
          </button>
        </div>

        {/* Nút xem toàn cảnh Việt Nam */}
        <button
          onClick={onResetView}
          title="Xem toàn cảnh Việt Nam"
          className="bg-white/95 backdrop-blur hover:bg-white text-gray-700 hover:text-emerald-600 p-2.5 rounded-xl shadow-md border border-gray-200 transition-all flex items-center justify-center gap-1.5 text-xs font-bold self-end"
        >
          <RotateCcw size={15} />
          <span>Toàn cảnh</span>
        </button>
      </div>

      {/* Floating Badge số lượng nông hộ đang hiển thị */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-gray-200 text-xs flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="font-semibold text-gray-700">
          Đang hiển thị <strong>{farms.length}</strong> tọa độ nông hộ sạch
        </span>
      </div>
    </div>
  );
}
