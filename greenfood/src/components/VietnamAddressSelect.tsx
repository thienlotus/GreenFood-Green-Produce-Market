"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Building, Home, Navigation } from 'lucide-react';
import {
  getAllProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  formatVietnamAddress,
} from '@/data/vietnamLocations';

interface VietnamAddressSelectProps {
  initialProvince?: string;
  initialDistrict?: string;
  initialWard?: string;
  initialStreet?: string;
  onChange: (data: {
    province: string;
    district: string;
    ward: string;
    street: string;
    fullAddress: string;
  }) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function VietnamAddressSelect({
  initialProvince = '',
  initialDistrict = '',
  initialWard = '',
  initialStreet = '',
  onChange,
  disabled = false,
  required = false,
}: VietnamAddressSelectProps) {
  const [provinces] = useState<string[]>(getAllProvinces());
  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvince);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedWard, setSelectedWard] = useState<string>(initialWard);
  const [streetAddress, setStreetAddress] = useState<string>(initialStreet);

  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);

  // Đồng bộ props khởi tạo khi thay đổi từ bên ngoài
  useEffect(() => {
    if (initialProvince && initialProvince !== selectedProvince) {
      setSelectedProvince(initialProvince);
    }
  }, [initialProvince]);

  useEffect(() => {
    if (initialDistrict && initialDistrict !== selectedDistrict) {
      setSelectedDistrict(initialDistrict);
    }
  }, [initialDistrict]);

  useEffect(() => {
    if (initialWard && initialWard !== selectedWard) {
      setSelectedWard(initialWard);
    }
  }, [initialWard]);

  useEffect(() => {
    if (initialStreet !== undefined && initialStreet !== streetAddress) {
      setStreetAddress(initialStreet);
    }
  }, [initialStreet]);

  // Cập nhật danh sách Quận/Huyện khi Tỉnh/Thành thay đổi
  useEffect(() => {
    if (selectedProvince) {
      const dists = getDistrictsByProvince(selectedProvince);
      setDistricts(dists);
      if (!dists.includes(selectedDistrict)) {
        setSelectedDistrict('');
        setSelectedWard('');
        setWards([]);
      }
    } else {
      setDistricts([]);
      setSelectedDistrict('');
      setSelectedWard('');
      setWards([]);
    }
  }, [selectedProvince]);

  // Cập nhật danh sách Phường/Xã khi Quận/Huyện thay đổi
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      const wds = getWardsByDistrict(selectedProvince, selectedDistrict);
      setWards(wds);
      if (!wds.includes(selectedWard)) {
        setSelectedWard('');
      }
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict, selectedProvince]);

  // Phát tín hiệu onChange lên component cha
  const emitChange = (prov: string, dist: string, wrd: string, str: string) => {
    const full = formatVietnamAddress(str, wrd, dist, prov);
    onChange({
      province: prov,
      district: dist,
      ward: wrd,
      street: str,
      fullAddress: full,
    });
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProvince(val);
    setSelectedDistrict('');
    setSelectedWard('');
    emitChange(val, '', '', streetAddress);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedWard('');
    emitChange(selectedProvince, val, '', streetAddress);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedWard(val);
    emitChange(selectedProvince, selectedDistrict, val, streetAddress);
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStreetAddress(val);
    emitChange(selectedProvince, selectedDistrict, selectedWard, val);
  };

  const fullPreview = formatVietnamAddress(streetAddress, selectedWard, selectedDistrict, selectedProvince);

  return (
    <div className="space-y-3">
      {/* 3 Dropdown Hành chính */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Dropdown 1: Tỉnh / Thành phố */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
            <Building size={13} className="text-emerald-600" />
            <span>Tỉnh / Thành phố {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <select
            disabled={disabled}
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
          >
            <option value="">-- Chọn Tỉnh / Thành --</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Quận / Huyện */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
            <Navigation size={13} className="text-emerald-600" />
            <span>Quận / Huyện {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <select
            disabled={disabled || !selectedProvince}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
          >
            <option value="">-- Chọn Quận / Huyện --</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 3: Phường / Xã */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
            <Home size={13} className="text-emerald-600" />
            <span>Phường / Xã {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <select
            disabled={disabled || !selectedDistrict}
            value={selectedWard}
            onChange={handleWardChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
          >
            <option value="">-- Chọn Phường / Xã --</option>
            {wards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Số nhà, tên đường */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
          <MapPin size={13} className="text-emerald-600" />
          <span>Số nhà, tên đường, ngõ xóm {required && <span className="text-rose-500">*</span>}</span>
        </label>
        <input
          type="text"
          disabled={disabled}
          value={streetAddress}
          onChange={handleStreetChange}
          placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Chung cư Saigon Center"
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:bg-gray-100"
        />
      </div>

      {/* Preview địa chỉ hoàn chỉnh */}
      {fullPreview && (
        <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
          <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-emerald-800">Địa chỉ đầy đủ: </span>
            <span className="font-medium text-gray-800">{fullPreview}</span>
          </div>
        </div>
      )}
    </div>
  );
}
