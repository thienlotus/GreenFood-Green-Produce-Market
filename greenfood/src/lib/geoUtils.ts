/**
 * Dữ liệu tọa độ trung tâm 63 tỉnh thành Việt Nam
 * Dùng để tự động Geocoding vị trí địa lý cho gian hàng nông hộ
 */

export interface VietnamProvinceGeo {
  keywords: string[];
  name: string;
  lat: number;
  lng: number;
  regionId: number;
  zone: 'north' | 'central' | 'south';
}

export const VIETNAM_PROVINCES: VietnamProvinceGeo[] = [
  // Miền Bắc (zone: north, regionId: 3)
  { keywords: ['hà nội', 'ha noi', 'hanoi', 'thủ đô'], name: 'Hà Nội', lat: 21.0285, lng: 105.8542, regionId: 3, zone: 'north' },
  { keywords: ['hải phòng', 'hai phong'], name: 'Hải Phòng', lat: 20.8449, lng: 106.6881, regionId: 3, zone: 'north' },
  { keywords: ['quảng ninh', 'quang ninh', 'hạ long', 'ha long'], name: 'Quảng Ninh', lat: 21.0069, lng: 107.2925, regionId: 3, zone: 'north' },
  { keywords: ['hải dương', 'hai duong'], name: 'Hải Dương', lat: 20.9333, lng: 106.3167, regionId: 3, zone: 'north' },
  { keywords: ['hưng yên', 'hung yen'], name: 'Hưng Yên', lat: 20.6500, lng: 106.0500, regionId: 3, zone: 'north' },
  { keywords: ['thái nguyên', 'thai nguyen', 'tân cương'], name: 'Thái Nguyên', lat: 21.5546, lng: 105.8008, regionId: 3, zone: 'north' },
  { keywords: ['sơn la', 'son la', 'mộc châu', 'moc chau'], name: 'Sơn La', lat: 20.8332, lng: 104.6724, regionId: 3, zone: 'north' },
  { keywords: ['lào cai', 'lao cai', 'sa pa', 'sapa'], name: 'Lào Cai', lat: 22.4833, lng: 103.9667, regionId: 3, zone: 'north' },
  { keywords: ['hà giang', 'ha giang', 'đồng văn'], name: 'Hà Giang', lat: 22.8233, lng: 104.9839, regionId: 3, zone: 'north' },
  { keywords: ['yên bái', 'yen bai', 'mù cang chải'], name: 'Yên Bái', lat: 21.7000, lng: 104.8667, regionId: 3, zone: 'north' },
  { keywords: ['bắc giang', 'bac giang', 'lục ngạn'], name: 'Bắc Giang', lat: 21.2731, lng: 106.1946, regionId: 3, zone: 'north' },
  { keywords: ['bắc ninh', 'bac ninh'], name: 'Bắc Ninh', lat: 21.1861, lng: 106.0763, regionId: 3, zone: 'north' },
  { keywords: ['nam định', 'nam dinh'], name: 'Nam Định', lat: 20.4333, lng: 106.1667, regionId: 3, zone: 'north' },
  { keywords: ['thái bình', 'thai binh'], name: 'Thái Bình', lat: 20.4500, lng: 106.3333, regionId: 3, zone: 'north' },
  { keywords: ['ninh bình', 'ninh binh', 'tràng an'], name: 'Ninh Bình', lat: 20.2500, lng: 105.9667, regionId: 3, zone: 'north' },
  { keywords: ['hà nam', 'ha nam'], name: 'Hà Nam', lat: 20.5833, lng: 105.9167, regionId: 3, zone: 'north' },
  { keywords: ['vĩnh phúc', 'vinh phuc', 'tam đảo'], name: 'Vĩnh Phúc', lat: 21.3000, lng: 105.6000, regionId: 3, zone: 'north' },
  { keywords: ['phú thọ', 'phu tho'], name: 'Phú Thọ', lat: 21.3167, lng: 105.2167, regionId: 3, zone: 'north' },
  { keywords: ['tuyên quang', 'tuyen quang'], name: 'Tuyên Quang', lat: 21.8167, lng: 105.2167, regionId: 3, zone: 'north' },
  { keywords: ['cao bằng', 'cao bang'], name: 'Cao Bằng', lat: 22.6667, lng: 106.2500, regionId: 3, zone: 'north' },
  { keywords: ['lạng sơn', 'lang son'], name: 'Lạng Sơn', lat: 21.8500, lng: 106.7500, regionId: 3, zone: 'north' },
  { keywords: ['bắc kạn', 'bac kan'], name: 'Bắc Kạn', lat: 22.1470, lng: 105.8348, regionId: 3, zone: 'north' },
  { keywords: ['hòa bình', 'hoa binh', 'mai châu'], name: 'Hòa Bình', lat: 20.8167, lng: 105.3333, regionId: 3, zone: 'north' },
  { keywords: ['điện biên', 'dien bien'], name: 'Điện Biên', lat: 21.3833, lng: 103.0167, regionId: 3, zone: 'north' },
  { keywords: ['lai châu', 'lai chau'], name: 'Lai Châu', lat: 22.4000, lng: 103.4667, regionId: 3, zone: 'north' },

  // Miền Trung (zone: central, regionId: 4)
  { keywords: ['thanh hóa', 'thanh hoa', 'sầm sơn'], name: 'Thanh Hóa', lat: 19.8067, lng: 105.7852, regionId: 4, zone: 'central' },
  { keywords: ['nghệ an', 'nghe an', 'vinh', 'nam đàn'], name: 'Nghệ An', lat: 19.2342, lng: 104.9200, regionId: 4, zone: 'central' },
  { keywords: ['hà tĩnh', 'ha tinh'], name: 'Hà Tĩnh', lat: 18.3333, lng: 105.9000, regionId: 4, zone: 'central' },
  { keywords: ['quảng bình', 'quang binh', 'đồng hới'], name: 'Quảng Bình', lat: 17.4833, lng: 106.6000, regionId: 4, zone: 'central' },
  { keywords: ['quảng trị', 'quang tri'], name: 'Quảng Trị', lat: 16.7500, lng: 107.1833, regionId: 4, zone: 'central' },
  { keywords: ['thừa thiên huế', 'thua thien hue', 'huế', 'hue'], name: 'Thừa Thiên Huế', lat: 16.4667, lng: 107.6000, regionId: 4, zone: 'central' },
  { keywords: ['đà nẵng', 'da nang'], name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, regionId: 4, zone: 'central' },
  { keywords: ['quảng nam', 'quang nam', 'hội an', 'hoi an'], name: 'Quảng Nam', lat: 15.5994, lng: 107.9791, regionId: 4, zone: 'central' },
  { keywords: ['quảng ngãi', 'quang ngai', 'lý sơn'], name: 'Quảng Ngãi', lat: 15.1167, lng: 108.8000, regionId: 4, zone: 'central' },
  { keywords: ['bình định', 'binh dinh', 'quy nhơn'], name: 'Bình Định', lat: 14.1667, lng: 108.9000, regionId: 4, zone: 'central' },
  { keywords: ['phú yên', 'phu yen', 'tuy hòa'], name: 'Phú Yên', lat: 13.0833, lng: 109.0833, regionId: 4, zone: 'central' },
  { keywords: ['khánh hòa', 'khanh hoa', 'nha trang', 'cam ranh'], name: 'Khánh Hòa', lat: 12.2500, lng: 109.1833, regionId: 4, zone: 'central' },
  { keywords: ['ninh thuận', 'ninh thuan', 'phan rang'], name: 'Ninh Thuận', lat: 11.5667, lng: 108.9833, regionId: 4, zone: 'central' },
  { keywords: ['bình thuận', 'binh thuan', 'phan thiết'], name: 'Bình Thuận', lat: 11.1042, lng: 108.1833, regionId: 4, zone: 'central' },

  // Tây Nguyên & Đà Lạt (zone: central, regionId: 2)
  { keywords: ['lâm đồng', 'lam dong', 'đà lạt', 'da lat', 'bảo lộc', 'đơn dương', 'đức trọng'], name: 'Lâm Đồng', lat: 11.8188, lng: 108.4933, regionId: 2, zone: 'central' },
  { keywords: ['đắk lắk', 'dak lak', 'daklak', 'buôn ma thuột', 'bmt'], name: 'Đắk Lắk', lat: 12.6667, lng: 108.0500, regionId: 2, zone: 'central' },
  { keywords: ['gia lai', 'pleiku'], name: 'Gia Lai', lat: 13.9833, lng: 108.0000, regionId: 2, zone: 'central' },
  { keywords: ['đắk nông', 'dak nong', 'gia nghĩa'], name: 'Đắk Nông', lat: 12.0000, lng: 107.6833, regionId: 2, zone: 'central' },
  { keywords: ['kon tum', 'kontum', 'măng đen', 'mang den'], name: 'Kon Tum', lat: 14.3500, lng: 108.0000, regionId: 2, zone: 'central' },

  // Miền Nam & ĐBSCL (zone: south, regionId: 1)
  { keywords: ['hồ chí minh', 'ho chi minh', 'sài gòn', 'sai gon', 'tp hcm', 'tphcm', 'q1', 'thủ đức'], name: 'TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009, regionId: 1, zone: 'south' },
  { keywords: ['bình dương', 'binh duong', 'thủ dầu một'], name: 'Bình Dương', lat: 11.1667, lng: 106.6667, regionId: 1, zone: 'south' },
  { keywords: ['đồng nai', 'dong nai', 'biên hòa', 'long khánh'], name: 'Đồng Nai', lat: 11.0000, lng: 107.0000, regionId: 1, zone: 'south' },
  { keywords: ['bà rịa', 'vũng tàu', 'ba ria', 'vung tau'], name: 'Bà Rịa - Vũng Tàu', lat: 10.5425, lng: 107.2429, regionId: 1, zone: 'south' },
  { keywords: ['tây ninh', 'tay ninh'], name: 'Tây Ninh', lat: 11.3000, lng: 106.1000, regionId: 1, zone: 'south' },
  { keywords: ['bình phước', 'binh phuoc', 'đồng xoài'], name: 'Bình Phước', lat: 11.7500, lng: 106.9000, regionId: 1, zone: 'south' },
  { keywords: ['long an', 'tân an'], name: 'Long An', lat: 10.5333, lng: 106.4000, regionId: 1, zone: 'south' },
  { keywords: ['tiền giang', 'tien giang', 'mỹ tho', 'cái bè'], name: 'Tiền Giang', lat: 10.3600, lng: 106.3600, regionId: 1, zone: 'south' },
  { keywords: ['bến tre', 'ben tre', 'chợ lách', 'ba tri', 'mỏ cày'], name: 'Bến Tre', lat: 10.2348, lng: 106.3485, regionId: 1, zone: 'south' },
  { keywords: ['đồng tháp', 'dong thap', 'cao lãnh', 'sa đéc'], name: 'Đồng Tháp', lat: 10.4563, lng: 105.6409, regionId: 1, zone: 'south' },
  { keywords: ['vĩnh long', 'vinh long', 'bình minh'], name: 'Vĩnh Long', lat: 10.0772, lng: 105.9545, regionId: 1, zone: 'south' },
  { keywords: ['cần thơ', 'can tho', 'ninh kiều', 'phong điền'], name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, regionId: 1, zone: 'south' },
  { keywords: ['hậu giang', 'hau giang', 'vị thanh'], name: 'Hậu Giang', lat: 9.7833, lng: 105.4667, regionId: 1, zone: 'south' },
  { keywords: ['trà vinh', 'tra vinh', 'cầu kè'], name: 'Trà Vinh', lat: 9.9333, lng: 106.3333, regionId: 1, zone: 'south' },
  { keywords: ['sóc trăng', 'soc trang'], name: 'Sóc Trăng', lat: 9.6000, lng: 105.9667, regionId: 1, zone: 'south' },
  { keywords: ['bạc liêu', 'bac lieu'], name: 'Bạc Liêu', lat: 9.2941, lng: 105.7278, regionId: 1, zone: 'south' },
  { keywords: ['cà mau', 'ca mau', 'u minh', 'năm căn'], name: 'Cà Mau', lat: 9.1769, lng: 105.1524, regionId: 1, zone: 'south' },
  { keywords: ['an giang', 'long xuyên', 'châu đốc'], name: 'An Giang', lat: 10.5216, lng: 105.1259, regionId: 1, zone: 'south' },
  { keywords: ['kiên giang', 'kien giang', 'rạch giá', 'phú quốc'], name: 'Kiên Giang', lat: 10.0167, lng: 105.0833, regionId: 1, zone: 'south' },
];

/**
 * Tự động tìm kiếm tọa độ tỉnh thành từ chuỗi địa chỉ
 */
export function resolveCoordinatesFromAddress(
  address?: string,
  currentLat?: number | null,
  currentLng?: number | null
): { lat: number; lng: number; provinceName: string; regionId: number; zone: 'north' | 'central' | 'south' } {
  // Nếu đã có tọa độ hợp lệ, ưu tiên giữ lại
  if (currentLat && currentLng && currentLat > 0 && currentLng > 0) {
    const province = findProvinceByAddress(address || '');
    return {
      lat: Number(currentLat),
      lng: Number(currentLng),
      provinceName: province?.name || 'Việt Nam',
      regionId: province?.regionId || 1,
      zone: province?.zone || 'south'
    };
  }

  const province = findProvinceByAddress(address || '');
  if (province) {
    return {
      lat: province.lat,
      lng: province.lng,
      provinceName: province.name,
      regionId: province.regionId,
      zone: province.zone
    };
  }

  // Fallback mặc định
  return {
    lat: 10.7769,
    lng: 106.7009,
    provinceName: 'TP. Hồ Chí Minh',
    regionId: 1,
    zone: 'south'
  };
}

export function findProvinceByAddress(address: string): VietnamProvinceGeo | null {
  if (!address) return null;
  const normalized = address.toLowerCase().trim();

  for (const prov of VIETNAM_PROVINCES) {
    for (const kw of prov.keywords) {
      if (normalized.includes(kw)) {
        return prov;
      }
    }
  }

  return null;
}
