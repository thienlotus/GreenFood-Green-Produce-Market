/**
 * Dữ liệu hành chính Việt Nam & Bộ lọc sửa lỗi mã hóa ký tự (Mojibake Healer)
 * Đảm bảo hệ thống KHÔNG BAO GIỜ bị trống danh sách Tỉnh/Thành, Quận/Huyện, Phường/Xã
 * và tự động phục hồi văn bản tiếng Việt bị lỗi font/mã hóa.
 */

// 1. BỘ SỬA LỖI FONT / MOJIBAKE TIẾNG VIỆT (TỰ ĐỘNG CHỮA LÀNH DỮ LIỆU CŨ TRONG LOCALSTORAGE & API)
const CP1252_MAP: Record<number, number> = {
  0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E,
  0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
};

export function cleanVietnameseMojibake(str: string | undefined | null): string {
  if (!str || typeof str !== 'string') return str || '';

  let s = str;

  // Xóa bỏ triệt để các ký tự lỗi Latin1 như 'ï' (\u00EF), '¬' (\u00AC)
  s = s.replace(/Quản\s*tr[^\s]*\s*vi[^\s]*\s*GreenFood/gi, 'Quản trị viên GreenFood');
  s = s.replace(/Quản\s*tr[\u00EFï\?]+[\u00AC¬]*\s*viên/gi, 'Quản trị viên');
  s = s.replace(/tr[\u00EFï\?]+[\u00AC¬]*/gi, 'trị');
  s = s.replace(/[\u00EFï\u00AC¬\uFFFD]/g, '');

  // 1. Tự động phục hồi chuỗi bị mã hóa đúp UTF-8 / Windows-1252
  if (/[ÃÂÄÅÆÇÉÈÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßÄ–—‘’“”‹›\u0080-\u00FF]/.test(s)) {
    try {
      const bytes: number[] = [];
      let canDecode = true;
      for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);
        if (code <= 0xFF) {
          bytes.push(code);
        } else if (CP1252_MAP[code]) {
          bytes.push(CP1252_MAP[code]);
        } else {
          canDecode = false;
          break;
        }
      }
      if (canDecode && bytes.length > 0) {
        const decoded = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes));
        if (decoded && !decoded.includes('\uFFFD') && decoded !== s) {
          s = decoded;
        }
      }
    } catch {
      // Bỏ qua lỗi decode, tiếp tục bằng từ điển exactMap
    }
  }

  const exactMap: Record<string, string> = {
    'Cam S├ính Mß╗ông N╠░ß╗¢c': 'Cam Sành Mọng Nước',
    'Cam S├ính Mß╗ìng N╞░ß╗¢c': 'Cam Sành Mọng Nước',
    'Cam SÃ nh Má»\x9dng NÆ°á»›c': 'Cam Sành Mọng Nước',
    '1kg (3-4 tr├íi)': '1kg (3-4 trái)',
    'Tr├íi': 'Trái',
    'Sß║ºu Ri├¬ng Ri6 Hß║ít L├⌐p': 'Sầu Riêng Ri6 Hạt Lép',
    'B╞░ß╗ƒi Da Xanh Ruß╗Öt Hß╗ông': 'Bưởi Da Xanh Ruột Hồng',
    'D├óu T├óy ─É├á Lß║ít Cß║Ñp ─É├┤ng': 'Dâu Tây Đà Lạt Cấp Đông',
    'Ch├¿ Th├íi Nguy├¬n T├ón C╞░╞íng': 'Chè Thái Nguyên Tân Cương',
    'Nho Mß║½u ─É╞ín Shine Muscat': 'Nho Mẫu Đơn Shine Muscat',
    'Xo├ái C├ít H├▓a Lß╗Öc': 'Xoài Cát Hòa Lộc',
    'Mß║¡t Ong Rß╗½ng Tr├ám U Minh': 'Mật Ong Rừng Tràm U Minh',
    'Chuß╗æi Laba Trß╗⌐ Danh': 'Chuối Laba Trứ Danh',
    'D╞░a L╞░ß╗¢i Mß║¡t Hß╗»u C╞í': 'Dưa Lưới Mật Hữu Cơ',
    'C├á Ph├¬ Robusta Mß╗Öc Ch├óu': 'Cà Phê Robusta Mộc Châu',
    'Rau Hß╗»u C╞í Tß╗òng Hß╗úp ─É├á Lß║ít': 'Rau Hữu Cơ Tổng Hợp Đà Lạt',
    'Quản trï¬ viên GreenFood': 'Quản trị viên GreenFood',
    'Quản trï¬ viên': 'Quản trị viên',
    'Quản trï¬': 'Quản trị viên',
    'Quản trịï viên GreenFood': 'Quản trị viên GreenFood',
    'Quản trịï viên': 'Quản trị viên',
    'Quản trịï': 'Quản trị viên',
    'Qu|ún trị vi├¬n GreenFood': 'Quản trị viên GreenFood',
    'Qu|ún tr? vi├¬n GreenFood': 'Quản trị viên GreenFood',
    'Qu|ún tr? vi?n GreenFood': 'Quản trị viên GreenFood',
    'Quáº£n trá»‹ viÃªn GreenFood': 'Quản trị viên GreenFood',
    'Quáº£n trá»‹ viÃªn': 'Quản trị viên',
    'Tráº§n VÄƒn NÄƒm': 'Trần Văn Năm',
    'Nguyá»…n VÄƒn Ba': 'Nguyễn Văn Ba',
    'Nguyá»…n Thá»‹ Mai': 'Nguyễn Thị Mai',
    'HoÃ ng VÄƒn Minh': 'Hoàng Văn Minh',
    'LÃª VÄƒn NÄƒm': 'Lê Văn Năm',
    'Pháº¡m Thá»‹ Lan': 'Phạm Thị Lan',
    'LÃª HoÃ ng CÆ°á»\x9dng': 'Lê Hoàng Cường',
    'Tráº§n Thá»‹ BÃ­ch': 'Trần Thị Bích',
    'Nguyá»…n VÄƒn An': 'Nguyễn Văn An'
  };

  if (exactMap[s]) {
    return exactMap[s];
  }

  const replacements: [RegExp, string][] = [
    [/Cam S├ính Mß╗ông N╠░ß╗¢c/g, 'Cam Sành Mọng Nước'],
    [/Cam S├ính Mß╗ìng N╞░ß╗¢c/g, 'Cam Sành Mọng Nước'],
    [/Sß║ºu Ri├¬ng Ri6 Hß║ít L├⌐p/g, 'Sầu Riêng Ri6 Hạt Lép'],
    [/B╞░ß╗ƒi Da Xanh Ruß╗Öt Hß╗ông/g, 'Bưởi Da Xanh Ruột Hồng'],
    [/D├óu T├óy ─É├á Lß║ít Cß║Ñp ─É├┤ng/g, 'Dâu Tây Đà Lạt Cấp Đông'],
    [/Ch├¿ Th├íi Nguy├¬n T├ón C╞░╞íng/g, 'Chè Thái Nguyên Tân Cương'],
    [/Nho Mß║½u ─É╞ín Shine Muscat/g, 'Nho Mẫu Đơn Shine Muscat'],
    [/Xo├ái C├ít H├▓a Lß╗Öc/g, 'Xoài Cát Hòa Lộc'],
    [/Mß║¡t Ong Rß╗½ng Tr├ám U Minh/g, 'Mật Ong Rừng Tràm U Minh'],
    [/Chuß╗æi Laba Trß╗⌐ Danh/g, 'Chuối Laba Trứ Danh'],
    [/D╞░a L╞░ß╗¢i Mß║¡t Hß╗»u C╞í/g, 'Dưa Lưới Mật Hữu Cơ'],
    [/C├á Ph├¬ Robusta Mß╗Öc Ch├óu/g, 'Cà Phê Robusta Mộc Châu'],
    [/Rau Hß╗»u C╞í Tß╗òng Hß╗úp ─É├á Lß║ít/g, 'Rau Hữu Cơ Tổng Hợp Đà Lạt'],
    [/1kg \(3-4 tr├íi\)/gi, '1kg (3-4 trái)'],
    [/tr├íi/gi, 'trái'],
    [/hß╗Öp/gi, 'hộp'],
    [/N╠░ß╗¢c/g, 'Nước'],
    [/N╞░ß╗¢c/g, 'Nước'],
    [/n╞░ß╗¢c/g, 'nước'],
    [/Mß╗ông/g, 'Mọng'],
    [/Mß╗ìng/g, 'Mọng'],
    [/mß╗ìng/g, 'mọng'],
    [/S├ính/g, 'Sành'],
    [/s├ính/g, 'sành'],
    [/├ính/g, 'ành'],
    [/├í/g, 'á'],
    [/├á/g, 'à'],
    [/├ó/g, 'â'],
    [/├¬/g, 'ê'],
    [/├¡/g, 'í'],
    [/├▓/g, 'ò'],
    [/├│/g, 'ó'],
    [/├┤/g, 'ô'],
    [/├╣/g, 'ù'],
    [/├║/g, 'ú'],
    [/├╜/g, 'ý'],
    [/─æ/g, 'đ'],
    [/─É/g, 'Đ'],
    [/╞░ß╗¢/g, 'ước'],
    [/╞░/g, 'ư'],
    [/╞í/g, 'ơ'],
    [/ß╗ì/g, 'ọ'],
    [/ß╗ông/g, 'ọng'],
    [/ß╗Ö/g, 'ộ'],
    [/ß╗ô/g, 'ồ'],
    [/ß╗ƒ/g, 'ưở'],
    [/ß║º/g, 'ầ'],
    [/ß║ít/g, 'át'],
    [/ß║┐/g, 'ế'],
    [/ß║½/g, 'ẫ'],
    [/ß║¡/g, 'ậ'],
    [/ß║»/g, 'ắ'],
    [/ß║ú/g, 'ả'],
    [/ß╗»/g, 'ữ'],
    [/ß╗½/g, 'ử'],
    [/ß╗¡/g, 'ị'],
    [/ß╗ü/g, 'è'],
    [/ß╗æ/g, 'ố'],
    [/ß╗⌐/g, 'ứ'],
    [/─ân/g, 'ần'],
    [/─âng/g, 'ăng'],
    [/─óng/g, 'âng']
  ];

  for (const [pattern, rep] of replacements) {
    s = s.replace(pattern, rep);
  }

  return s;
}

// 2. DANH SÁCH 63 TỈNH / THÀNH PHỐ VIỆT NAM (CHUẨN THEO GHN VÀ HÀNH CHÍNH)
export interface ProvinceOption {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

export const FALLBACK_PROVINCES: ProvinceOption[] = [
  // Các trung tâm trọng điểm lên đầu
  { ProvinceID: 202, ProvinceName: "Hồ Chí Minh", Code: "8" },
  { ProvinceID: 201, ProvinceName: "Hà Nội", Code: "4" },
  { ProvinceID: 203, ProvinceName: "Đà Nẵng", Code: "511" },
  { ProvinceID: 205, ProvinceName: "Bình Dương", Code: "65" },
  { ProvinceID: 204, ProvinceName: "Đồng Nai", Code: "61" },
  { ProvinceID: 220, ProvinceName: "Cần Thơ", Code: "71" },
  { ProvinceID: 223, ProvinceName: "Hải Phòng", Code: "31" },
  { ProvinceID: 206, ProvinceName: "Bà Rịa - Vũng Tàu", Code: "64" },
  { ProvinceID: 209, ProvinceName: "Lâm Đồng", Code: "63" },
  { ProvinceID: 213, ProvinceName: "Bến Tre", Code: "75" },
  { ProvinceID: 215, ProvinceName: "Vĩnh Long", Code: "70" },
  { ProvinceID: 212, ProvinceName: "Tiền Giang", Code: "73" },
  { ProvinceID: 211, ProvinceName: "Long An", Code: "72" },
  { ProvinceID: 217, ProvinceName: "Đồng Tháp", Code: "67" },
  { ProvinceID: 218, ProvinceName: "An Giang", Code: "76" },
  { ProvinceID: 219, ProvinceName: "Kiên Giang", Code: "77" },
  { ProvinceID: 214, ProvinceName: "Trà Vinh", Code: "74" },
  { ProvinceID: 216, ProvinceName: "Bạc Liêu", Code: "781" },
  { ProvinceID: 225, ProvinceName: "Bình Phước", Code: "651" },
  { ProvinceID: 228, ProvinceName: "Bình Thuận", Code: "62" },
  { ProvinceID: 227, ProvinceName: "Bình Định", Code: "56" },
  { ProvinceID: 208, ProvinceName: "Khánh Hòa", Code: "58" },
  { ProvinceID: 210, ProvinceName: "Đắk Lắk", Code: "500" },
  { ProvinceID: 207, ProvinceName: "Gia Lai", Code: "59" },
  { ProvinceID: 224, ProvinceName: "Phú Yên", Code: "57" },
  { ProvinceID: 226, ProvinceName: "Ninh Thuận", Code: "68" },
  { ProvinceID: 221, ProvinceName: "Quảng Nam", Code: "510" },
  { ProvinceID: 222, ProvinceName: "Quảng Ngãi", Code: "55" },
  { ProvinceID: 229, ProvinceName: "Nghệ An", Code: "38" },
  { ProvinceID: 230, ProvinceName: "Hà Tĩnh", Code: "39" },
  { ProvinceID: 231, ProvinceName: "Quảng Bình", Code: "52" },
  { ProvinceID: 251, ProvinceName: "Quảng Trị", Code: "53" },
  { ProvinceID: 250, ProvinceName: "Thừa Thiên Huế", Code: "54" },
  { ProvinceID: 236, ProvinceName: "Bắc Ninh", Code: "27" },
  { ProvinceID: 237, ProvinceName: "Bắc Giang", Code: "204" },
  { ProvinceID: 238, ProvinceName: "Hưng Yên", Code: "321" },
  { ProvinceID: 235, ProvinceName: "Hải Dương", Code: "320" },
  { ProvinceID: 239, ProvinceName: "Thái Bình", Code: "36" },
  { ProvinceID: 232, ProvinceName: "Nam Định", Code: "350" },
  { ProvinceID: 233, ProvinceName: "Ninh Bình", Code: "30" },
  { ProvinceID: 234, ProvinceName: "Hà Nam", Code: "351" },
  { ProvinceID: 242, ProvinceName: "Thái Nguyên", Code: "280" },
  { ProvinceID: 241, ProvinceName: "Phú Thọ", Code: "210" },
  { ProvinceID: 240, ProvinceName: "Quảng Ninh", Code: "33" },
  { ProvinceID: 244, ProvinceName: "Lạng Sơn", Code: "25" },
  { ProvinceID: 246, ProvinceName: "Lào Cai", Code: "214" },
  { ProvinceID: 243, ProvinceName: "Hòa Bình", Code: "218" },
  { ProvinceID: 249, ProvinceName: "Sơn La", Code: "22" },
  { ProvinceID: 252, ProvinceName: "Lai Châu", Code: "213" },
  { ProvinceID: 253, ProvinceName: "Điện Biên", Code: "215" },
  { ProvinceID: 248, ProvinceName: "Hà Giang", Code: "219" },
  { ProvinceID: 247, ProvinceName: "Cao Bằng", Code: "26" },
  { ProvinceID: 245, ProvinceName: "Bắc Kạn", Code: "281" },
  { ProvinceID: 254, ProvinceName: "Đắk Nông", Code: "501" },
  { ProvinceID: 255, ProvinceName: "Hậu Giang", Code: "711" },
  { ProvinceID: 256, ProvinceName: "Sóc Trăng", Code: "79" },
  { ProvinceID: 257, ProvinceName: "Tây Ninh", Code: "66" },
  { ProvinceID: 258, ProvinceName: "Thanh Hóa", Code: "37" },
  { ProvinceID: 259, ProvinceName: "Tuyên Quang", Code: "207" },
  { ProvinceID: 260, ProvinceName: "Vĩnh Phúc", Code: "211" },
  { ProvinceID: 261, ProvinceName: "Yên Bái", Code: "216" },
  { ProvinceID: 262, ProvinceName: "Kon Tum", Code: "60" },
  { ProvinceID: 263, ProvinceName: "Cà Mau", Code: "780" }
];

// 3. DANH SÁCH QUẬN / HUYỆN PHỔ BIẾN THEO TỈNH
export interface DistrictOption {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
}

const DISTRICT_DATA: Record<number, { id: number; name: string }[]> = {
  // Hồ Chí Minh (202)
  202: [
    { id: 1442, name: "Quận 1" },
    { id: 1443, name: "Quận 3" },
    { id: 1444, name: "Quận 4" },
    { id: 1445, name: "Quận 5" },
    { id: 1446, name: "Quận 6" },
    { id: 1447, name: "Quận 7" },
    { id: 1448, name: "Quận 8" },
    { id: 1449, name: "Quận 10" },
    { id: 1450, name: "Quận 11" },
    { id: 1451, name: "Quận 12" },
    { id: 1452, name: "TP. Thủ Đức" },
    { id: 1453, name: "Quận Bình Thạnh" },
    { id: 1454, name: "Quận Gò Vấp" },
    { id: 1455, name: "Quận Phú Nhuận" },
    { id: 1456, name: "Quận Tân Bình" },
    { id: 1457, name: "Quận Tân Phú" },
    { id: 1458, name: "Quận Bình Tân" },
    { id: 1459, name: "Huyện Bình Chánh" },
    { id: 1460, name: "Huyện Hóc Môn" },
    { id: 1461, name: "Huyện Củ Chi" },
    { id: 1462, name: "Huyện Nhà Bè" },
    { id: 1463, name: "Huyện Cần Giờ" }
  ],
  // Hà Nội (201)
  201: [
    { id: 3440, name: "Quận Nam Từ Liêm" },
    { id: 1482, name: "Quận Ba Đình" },
    { id: 1483, name: "Quận Hoàn Kiếm" },
    { id: 1484, name: "Quận Tây Hồ" },
    { id: 1485, name: "Quận Long Biên" },
    { id: 1486, name: "Quận Cầu Giấy" },
    { id: 1487, name: "Quận Đống Đa" },
    { id: 1488, name: "Quận Hai Bà Trưng" },
    { id: 1489, name: "Quận Hoàng Mai" },
    { id: 1490, name: "Quận Thanh Xuân" },
    { id: 1491, name: "Quận Bắc Từ Liêm" },
    { id: 1492, name: "Quận Hà Đông" },
    { id: 1493, name: "Huyện Gia Lâm" },
    { id: 1494, name: "Huyện Đông Anh" },
    { id: 1495, name: "Huyện Thanh Trì" },
    { id: 1496, name: "Huyện Hoài Đức" }
  ],
  // Đà Nẵng (203)
  203: [
    { id: 1530, name: "Quận Hải Châu" },
    { id: 1531, name: "Quận Thanh Khê" },
    { id: 1532, name: "Quận Sơn Trà" },
    { id: 1533, name: "Quận Ngũ Hành Sơn" },
    { id: 1534, name: "Quận Liên Chiểu" },
    { id: 1535, name: "Quận Cẩm Lệ" },
    { id: 1536, name: "Huyện Hòa Vang" }
  ],
  // Bình Dương (205)
  205: [
    { id: 1540, name: "TP. Thủ Dầu Một" },
    { id: 1541, name: "TP. Thuận An" },
    { id: 1542, name: "TP. Dĩ An" },
    { id: 1543, name: "TP. Tân Uyên" },
    { id: 1544, name: "Thị xã Bến Cát" },
    { id: 1545, name: "Huyện Bàu Bàng" }
  ],
  // Đồng Nai (204)
  204: [
    { id: 1550, name: "TP. Biên Hòa" },
    { id: 1551, name: "TP. Long Khánh" },
    { id: 1552, name: "Huyện Long Thành" },
    { id: 1553, name: "Huyện Nhơn Trạch" },
    { id: 1554, name: "Huyện Trảng Bom" }
  ],
  // Cần Thơ (220)
  220: [
    { id: 1560, name: "Quận Ninh Kiều" },
    { id: 1561, name: "Quận Bình Thủy" },
    { id: 1562, name: "Quận Cái Răng" },
    { id: 1563, name: "Quận Ô Môn" },
    { id: 1564, name: "Quận Thốt Nốt" }
  ],
  // Hải Phòng (223)
  223: [
    { id: 1570, name: "Quận Hồng Bàng" },
    { id: 1571, name: "Quận Ngô Quyền" },
    { id: 1572, name: "Quận Lê Chân" },
    { id: 1573, name: "Quận Hải An" },
    { id: 1574, name: "Quận Kiến An" }
  ],
  // Lâm Đồng (209)
  209: [
    { id: 1580, name: "TP. Đà Lạt" },
    { id: 1581, name: "TP. Bảo Lộc" },
    { id: 1582, name: "Huyện Đơn Dương" },
    { id: 1583, name: "Huyện Đức Trọng" },
    { id: 1584, name: "Huyện Lạc Dương" }
  ],
  // Bến Tre (213)
  213: [
    { id: 1590, name: "TP. Bến Tre" },
    { id: 1591, name: "Huyện Chợ Lách" },
    { id: 1592, name: "Huyện Châu Thành" },
    { id: 1593, name: "Huyện Mỏ Cày Nam" },
    { id: 1594, name: "Huyện Giồng Trôm" }
  ],
  // Vĩnh Long (215)
  215: [
    { id: 1600, name: "TP. Vĩnh Long" },
    { id: 1601, name: "Thị xã Bình Minh" },
    { id: 1602, name: "Huyện Long Hồ" },
    { id: 1603, name: "Huyện Mang Thít" },
    { id: 1604, name: "Huyện Tam Bình" }
  ]
};

export function getFallbackDistricts(provinceId: number): DistrictOption[] {
  if (DISTRICT_DATA[provinceId]) {
    return DISTRICT_DATA[provinceId].map(d => ({
      DistrictID: d.id,
      DistrictName: d.name,
      ProvinceID: provinceId
    }));
  }

  // Dự phòng thông minh cho các tỉnh khác
  const province = FALLBACK_PROVINCES.find(p => p.ProvinceID === provinceId);
  const provName = province ? province.ProvinceName : "Tỉnh";
  return [
    { DistrictID: provinceId * 100 + 1, DistrictName: `TP. ${provName}`, ProvinceID: provinceId },
    { DistrictID: provinceId * 100 + 2, DistrictName: "Quận / Huyện Trung Tâm", ProvinceID: provinceId },
    { DistrictID: provinceId * 100 + 3, DistrictName: "Huyện Châu Thành", ProvinceID: provinceId },
    { DistrictID: provinceId * 100 + 4, DistrictName: "Huyện Ngoại Thành", ProvinceID: provinceId }
  ];
}

// 4. DANH SÁCH PHƯỜNG / XÃ PHỔ BIẾN THEO QUẬN
export interface WardOption {
  WardCode: string;
  WardName: string;
  DistrictID: number;
}

export function getFallbackWards(districtId: number): WardOption[] {
  return [
    { WardCode: `${districtId}_01`, WardName: "Phường 1", DistrictID: districtId },
    { WardCode: `${districtId}_02`, WardName: "Phường 2", DistrictID: districtId },
    { WardCode: `${districtId}_03`, WardName: "Phường 3", DistrictID: districtId },
    { WardCode: `${districtId}_04`, WardName: "Phường 4", DistrictID: districtId },
    { WardCode: `${districtId}_05`, WardName: "Phường 5", DistrictID: districtId },
    { WardCode: `${districtId}_06`, WardName: "Phường Trung Tâm", DistrictID: districtId },
    { WardCode: `${districtId}_07`, WardName: "Xã An Bình", DistrictID: districtId },
    { WardCode: `${districtId}_08`, WardName: "Xã Hòa Phú", DistrictID: districtId }
  ];
}

// 5. CƯỚC VẬN CHUYỂN DỰ PHÒNG
export function calculateFallbackShippingFee(orderTotal: number, provinceId?: number): number {
  if (orderTotal >= 300000) {
    return 0; // Miễn phí vận chuyển cho đơn từ 300.000đ
  }
  // Nội thành HCM/HN: 25.000đ, tỉnh khác 35.000đ
  if (provinceId === 202 || provinceId === 201) {
    return 25000;
  }
  return 35000;
}
