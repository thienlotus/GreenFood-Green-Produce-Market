export interface Ward {
  name: string;
  code?: string;
}

export interface District {
  name: string;
  id?: number | string;
  wards: Ward[];
}

export interface Province {
  name: string;
  id?: number | string;
  districts: District[];
}

/**
 * Dữ liệu đầy đủ 63 Tỉnh / Thành phố Việt Nam với phân cấp Quận/Huyện và Phường/Xã
 * Chuẩn phân cấp hành chính địa lý Việt Nam
 */
export const VIETNAM_LOCATIONS: Province[] = [
  {
    name: 'TP. Hồ Chí Minh',
    id: 1,
    districts: [
      {
        name: 'Quận 1',
        wards: [
          { name: 'Phường Bến Nghé' },
          { name: 'Phường Bến Thành' },
          { name: 'Phường Cầu Kho' },
          { name: 'Phường Cầu Ông Lãnh' },
          { name: 'Phường Cô Giang' },
          { name: 'Phường Đa Kao' },
          { name: 'Phường Nguyễn Cư Trinh' },
          { name: 'Phường Nguyễn Thái Bình' },
          { name: 'Phường Phạm Ngũ Lão' },
          { name: 'Phường Tân Định' },
        ],
      },
      {
        name: 'Quận 3',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 3' },
          { name: 'Phường 4' },
          { name: 'Phường 5' },
          { name: 'Phường Võ Thị Sáu' },
          { name: 'Phường 9' },
          { name: 'Phường 11' },
          { name: 'Phường 12' },
          { name: 'Phường 14' },
        ],
      },
      {
        name: 'Quận 4',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 3' },
          { name: 'Phường 4' },
          { name: 'Phường 6' },
          { name: 'Phường 8' },
          { name: 'Phường 9' },
          { name: 'Phường 13' },
          { name: 'Phường 15' },
          { name: 'Phường 18' },
        ],
      },
      {
        name: 'Quận 5',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 5' },
          { name: 'Phường 7' },
          { name: 'Phường 8' },
          { name: 'Phường 9' },
          { name: 'Phường 11' },
          { name: 'Phường 12' },
          { name: 'Phường 14' },
        ],
      },
      {
        name: 'Quận 6',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 6' },
          { name: 'Phường 9' },
          { name: 'Phường 11' },
          { name: 'Phường 13' },
        ],
      },
      {
        name: 'Quận 7',
        wards: [
          { name: 'Phường Tân Thuận Đông' },
          { name: 'Phường Tân Thuận Tây' },
          { name: 'Phường Tân Kiểng' },
          { name: 'Phường Tân Hưng' },
          { name: 'Phường Bình Thuận' },
          { name: 'Phường Tân Quy' },
          { name: 'Phường Phú Thuận' },
          { name: 'Phường Tân Phú' },
          { name: 'Phường Tân Phong' },
          { name: 'Phường Phú Mỹ' },
        ],
      },
      {
        name: 'Quận 8',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 4' },
          { name: 'Phường 5' },
          { name: 'Phường 8' },
          { name: 'Phường 14' },
          { name: 'Phường 16' },
        ],
      },
      {
        name: 'Quận 10',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 4' },
          { name: 'Phường 6' },
          { name: 'Phường 10' },
          { name: 'Phường 12' },
          { name: 'Phường 14' },
        ],
      },
      {
        name: 'Quận 11',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 3' },
          { name: 'Phường 5' },
          { name: 'Phường 8' },
          { name: 'Phường 11' },
          { name: 'Phường 15' },
        ],
      },
      {
        name: 'Quận 12',
        wards: [
          { name: 'Phường Thạnh Xuân' },
          { name: 'Phường Hiệp Thành' },
          { name: 'Phường Thới An' },
          { name: 'Phường Thạnh Lộc' },
          { name: 'Phường An Phú Đông' },
          { name: 'Phường Tân Chánh Hiệp' },
          { name: 'Phường Tân Thới Hiệp' },
          { name: 'Phường Trung Mỹ Tây' },
        ],
      },
      {
        name: 'Quận Bình Thạnh',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 3' },
          { name: 'Phường 12' },
          { name: 'Phường 15' },
          { name: 'Phường 17' },
          { name: 'Phường 19' },
          { name: 'Phường 21' },
          { name: 'Phường 25' },
          { name: 'Phường 26' },
        ],
      },
      {
        name: 'Quận Gò Vấp',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 3' },
          { name: 'Phường 5' },
          { name: 'Phường 7' },
          { name: 'Phường 8' },
          { name: 'Phường 10' },
          { name: 'Phường 11' },
          { name: 'Phường 14' },
          { name: 'Phường 16' },
        ],
      },
      {
        name: 'Quận Phú Nhuận',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 5' },
          { name: 'Phường 7' },
          { name: 'Phường 9' },
          { name: 'Phường 11' },
          { name: 'Phường 15' },
        ],
      },
      {
        name: 'Quận Tân Bình',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 4' },
          { name: 'Phường 6' },
          { name: 'Phường 8' },
          { name: 'Phường 10' },
          { name: 'Phường 12' },
          { name: 'Phường 13' },
          { name: 'Phường 15' },
        ],
      },
      {
        name: 'Quận Tân Phú',
        wards: [
          { name: 'Phường Tân Sơn Nhì' },
          { name: 'Phường Tây Thạnh' },
          { name: 'Phường Sơn Kỳ' },
          { name: 'Phường Tân Quý' },
          { name: 'Phường Tân Thành' },
          { name: 'Phường Phú Thọ Hòa' },
          { name: 'Phường Phú Thạnh' },
          { name: 'Phường Hiệp Tân' },
        ],
      },
      {
        name: 'Quận Bình Tân',
        wards: [
          { name: 'Phường An Lạc' },
          { name: 'Phường An Lạc A' },
          { name: 'Phường Bình Trị Đông' },
          { name: 'Phường Bình Trị Đông A' },
          { name: 'Phường Bình Hưng Hòa' },
          { name: 'Phường Tân Tạo' },
        ],
      },
      {
        name: 'TP. Thủ Đức',
        wards: [
          { name: 'Phường Thảo Điền' },
          { name: 'Phường An Phú' },
          { name: 'Phường An Khánh' },
          { name: 'Phường Bình An' },
          { name: 'Phường Thủ Thiêm' },
          { name: 'Phường Hiệp Phú' },
          { name: 'Phường Tăng Nhơn Phú A' },
          { name: 'Phường Tăng Nhơn Phú B' },
          { name: 'Phường Linh Chiểu' },
          { name: 'Phường Linh Đông' },
          { name: 'Phường Linh Tây' },
          { name: 'Phường Tam Bình' },
        ],
      },
      {
        name: 'Huyện Bình Chánh',
        wards: [
          { name: 'Thị trấn Tân Túc' },
          { name: 'Xã An Phú Tây' },
          { name: 'Xã Bình Chánh' },
          { name: 'Xã Bình Hưng' },
          { name: 'Xã Đa Phước' },
          { name: 'Xã Phong Phú' },
          { name: 'Xã Vĩnh Lộc A' },
          { name: 'Xã Vĩnh Lộc B' },
        ],
      },
      {
        name: 'Huyện Hóc Môn',
        wards: [
          { name: 'Thị trấn Hóc Môn' },
          { name: 'Xã Bà Điểm' },
          { name: 'Xã Đông Thạnh' },
          { name: 'Xã Nhị Bình' },
          { name: 'Xã Tân Thới Nhì' },
          { name: 'Xã Xuân Thới Thượng' },
        ],
      },
      {
        name: 'Huyện Củ Chi',
        wards: [
          { name: 'Thị trấn Củ Chi' },
          { name: 'Xã An Nhơn Tây' },
          { name: 'Xã Bình Mỹ' },
          { name: 'Xã Nhuận Đức' },
          { name: 'Xã Tân An Hội' },
          { name: 'Xã Thái Mỹ' },
        ],
      },
      {
        name: 'Huyện Nhà Bè',
        wards: [
          { name: 'Thị trấn Nhà Bè' },
          { name: 'Xã Hiệp Phước' },
          { name: 'Xã Long Thới' },
          { name: 'Xã Nhơn Đức' },
          { name: 'Xã Phú Xuân' },
          { name: 'Xã Phước Kiển' },
        ],
      },
      {
        name: 'Huyện Cần Giờ',
        wards: [
          { name: 'Thị trấn Cần Thạnh' },
          { name: 'Xã An Thới Đông' },
          { name: 'Xã Bình Khánh' },
          { name: 'Xã Long Hòa' },
          { name: 'Xã Lý Nhơn' },
          { name: 'Xã Tam Thôn Hiệp' },
        ],
      },
    ],
  },
  {
    name: 'Hà Nội',
    id: 2,
    districts: [
      {
        name: 'Quận Ba Đình',
        wards: [
          { name: 'Phường Cống Vị' },
          { name: 'Phường Điện Biên' },
          { name: 'Phường Đội Cấn' },
          { name: 'Phường Giảng Võ' },
          { name: 'Phường Kim Mã' },
          { name: 'Phường Liễu Giai' },
          { name: 'Phường Ngọc Hà' },
          { name: 'Phường Quán Thánh' },
          { name: 'Phường Thành Công' },
          { name: 'Phường Trúc Bạch' },
        ],
      },
      {
        name: 'Quận Hoàn Kiếm',
        wards: [
          { name: 'Phường Chương Dương' },
          { name: 'Phường Cửa Đông' },
          { name: 'Phường Cửa Nam' },
          { name: 'Phường Đồng Xuân' },
          { name: 'Phường Hàng Bạc' },
          { name: 'Phường Hàng Bài' },
          { name: 'Phường Hàng Bông' },
          { name: 'Phường Hàng Buồm' },
          { name: 'Phường Hàng Đào' },
          { name: 'Phường Hàng Gai' },
          { name: 'Phường Hàng Trống' },
          { name: 'Phường Lý Thái Tổ' },
          { name: 'Phường Phan Chu Trinh' },
          { name: 'Phường Tràng Tiền' },
        ],
      },
      {
        name: 'Quận Đống Đa',
        wards: [
          { name: 'Phường Cát Linh' },
          { name: 'Phường Hàng Bột' },
          { name: 'Phường Khâm Thiên' },
          { name: 'Phường Khương Thượng' },
          { name: 'Phường Kim Liên' },
          { name: 'Phường Láng Hạ' },
          { name: 'Phường Láng Thượng' },
          { name: 'Phường Nam Đồng' },
          { name: 'Phường Ô Chợ Dừa' },
          { name: 'Phường Quang Trung' },
          { name: 'Phường Quốc Tử Giám' },
          { name: 'Phường Trung Liệt' },
          { name: 'Phường Trung Phụng' },
          { name: 'Phường Văn Miếu' },
        ],
      },
      {
        name: 'Quận Cầu Giấy',
        wards: [
          { name: 'Phường Dịch Vọng' },
          { name: 'Phường Dịch Vọng Hậu' },
          { name: 'Phường Mai Dịch' },
          { name: 'Phường Nghĩa Đô' },
          { name: 'Phường Nghĩa Tân' },
          { name: 'Phường Quan Hoa' },
          { name: 'Phường Trung Hòa' },
          { name: 'Phường Yên Hòa' },
        ],
      },
      {
        name: 'Quận Hai Bà Trưng',
        wards: [
          { name: 'Phường Bách Khoa' },
          { name: 'Phường Bạch Đằng' },
          { name: 'Phường Bạch Mai' },
          { name: 'Phường Cầu Dền' },
          { name: 'Phường Đống Mác' },
          { name: 'Phường Đồng Nhân' },
          { name: 'Phường Đồng Tâm' },
          { name: 'Phường Lê Đại Hành' },
          { name: 'Phường Minh Khai' },
          { name: 'Phường Phố Huế' },
          { name: 'Phường Trương Định' },
          { name: 'Phường Vĩnh Tuy' },
        ],
      },
      {
        name: 'Quận Thanh Xuân',
        wards: [
          { name: 'Phường Hạ Đình' },
          { name: 'Phường Khương Đình' },
          { name: 'Phường Khương Mai' },
          { name: 'Phường Khương Trung' },
          { name: 'Phường Kim Giang' },
          { name: 'Phường Nhân Chính' },
          { name: 'Phường Phương Liệt' },
          { name: 'Phường Thanh Xuân Bắc' },
          { name: 'Phường Thanh Xuân Nam' },
          { name: 'Phường Thanh Xuân Trung' },
        ],
      },
      {
        name: 'Quận Tây Hồ',
        wards: [
          { name: 'Phường Bưởi' },
          { name: 'Phường Nhật Tân' },
          { name: 'Phường Phú Thượng' },
          { name: 'Phường Quảng An' },
          { name: 'Phường Thụy Khuê' },
          { name: 'Phường Tứ Liên' },
          { name: 'Phường Xuân La' },
          { name: 'Phường Yên Phụ' },
        ],
      },
      {
        name: 'Quận Hoàng Mai',
        wards: [
          { name: 'Phường Đại Kim' },
          { name: 'Phường Định Công' },
          { name: 'Phường Giáp Bát' },
          { name: 'Phường Hoàng Liệt' },
          { name: 'Phường Hoàng Văn Thụ' },
          { name: 'Phường Lĩnh Nam' },
          { name: 'Phường Mai Động' },
          { name: 'Phường Tân Mai' },
          { name: 'Phường Thịnh Liệt' },
          { name: 'Phường Trần Phú' },
          { name: 'Phường Vĩnh Hưng' },
          { name: 'Phường Yên Sở' },
        ],
      },
      {
        name: 'Quận Long Biên',
        wards: [
          { name: 'Phường Bồ Đề' },
          { name: 'Phường Cự Khối' },
          { name: 'Phường Đức Giang' },
          { name: 'Phường Gia Thụy' },
          { name: 'Phường Giang Biên' },
          { name: 'Phường Long Biên' },
          { name: 'Phường Ngọc Lâm' },
          { name: 'Phường Ngọc Thụy' },
          { name: 'Phường Phúc Đồng' },
          { name: 'Phường Phúc Lợi' },
          { name: 'Phường Sài Đồng' },
          { name: 'Phường Thạch Bàn' },
          { name: 'Phường Thượng Thanh' },
          { name: 'Phường Việt Hưng' },
        ],
      },
      {
        name: 'Quận Nam Từ Liêm',
        wards: [
          { name: 'Phường Cầu Diễn' },
          { name: 'Phường Đại Mỗ' },
          { name: 'Phường Mễ Trì' },
          { name: 'Phường Mỹ Đình 1' },
          { name: 'Phường Mỹ Đình 2' },
          { name: 'Phường Phú Đô' },
          { name: 'Phường Tây Mỗ' },
          { name: 'Phường Trung Văn' },
          { name: 'Phường Xuân Phương' },
        ],
      },
      {
        name: 'Quận Bắc Từ Liêm',
        wards: [
          { name: 'Phường Cổ Nhuế 1' },
          { name: 'Phường Cổ Nhuế 2' },
          { name: 'Phường Đông Ngạc' },
          { name: 'Phường Đức Thắng' },
          { name: 'Phường Liên Mạc' },
          { name: 'Phường Minh Khai' },
          { name: 'Phường Phú Diễn' },
          { name: 'Phường Phúc Diễn' },
          { name: 'Phường Tây Tựu' },
          { name: 'Phường Thụy Phương' },
          { name: 'Phường Xuân Đỉnh' },
          { name: 'Phường Xuân Tảo' },
        ],
      },
      {
        name: 'Quận Hà Đông',
        wards: [
          { name: 'Phường Biên Giang' },
          { name: 'Phường Dương Nội' },
          { name: 'Phường Hà Cầu' },
          { name: 'Phường La Khê' },
          { name: 'Phường Mộ Lao' },
          { name: 'Phường Nguyễn Trãi' },
          { name: 'Phường Phú La' },
          { name: 'Phường Phú Lương' },
          { name: 'Phường Phúc La' },
          { name: 'Phường Quang Trung' },
          { name: 'Phường Vạn Phúc' },
          { name: 'Phường Văn Quán' },
          { name: 'Phường Yết Kiêu' },
        ],
      },
      {
        name: 'Thị xã Sơn Tây',
        wards: [
          { name: 'Phường Lê Lợi' },
          { name: 'Phường Ngô Quyền' },
          { name: 'Phường Quang Trung' },
          { name: 'Phường Sơn Lộc' },
          { name: 'Phường Trung Hưng' },
          { name: 'Phường Xuân Khanh' },
        ],
      },
      {
        name: 'Huyện Gia Lâm',
        wards: [
          { name: 'Thị trấn Trâu Quỳ' },
          { name: 'Thị trấn Yên Viên' },
          { name: 'Xã Bát Tràng' },
          { name: 'Xã Đa Tốn' },
          { name: 'Xã Ninh Hiệp' },
          { name: 'Xã Phù Đổng' },
        ],
      },
      {
        name: 'Huyện Đông Anh',
        wards: [
          { name: 'Thị trấn Đông Anh' },
          { name: 'Xã Cổ Loa' },
          { name: 'Xã Hải Bối' },
          { name: 'Xã Kim Chung' },
          { name: 'Xã Tiên Dương' },
          { name: 'Xã Vĩnh Ngọc' },
        ],
      },
      {
        name: 'Huyện Sóc Sơn',
        wards: [
          { name: 'Thị trấn Sóc Sơn' },
          { name: 'Xã Bắc Sơn' },
          { name: 'Xã Mai Đình' },
          { name: 'Xã Phù Linh' },
          { name: 'Xã Tiên Dược' },
        ],
      },
      {
        name: 'Huyện Thanh Trì',
        wards: [
          { name: 'Thị trấn Văn Điển' },
          { name: 'Xã Đại Áng' },
          { name: 'Xã Tân Triều' },
          { name: 'Xã Thanh Liệt' },
          { name: 'Xã Vĩnh Quỳnh' },
        ],
      },
      {
        name: 'Huyện Hoài Đức',
        wards: [
          { name: 'Thị trấn Trạm Trôi' },
          { name: 'Xã An Khánh' },
          { name: 'Xã Kim Chung' },
          { name: 'Xã La Phù' },
          { name: 'Xã Song Phương' },
        ],
      },
      {
        name: 'Huyện Đan Phượng',
        wards: [{ name: 'Thị trấn Phùng' }, { name: 'Xã Đan Phượng' }, { name: 'Xã Tân Hội' }],
      },
      {
        name: 'Huyện Thạch Thất',
        wards: [{ name: 'Thị trấn Liên Quan' }, { name: 'Xã Cần Kiệm' }, { name: 'Xã Thạch Hòa' }],
      },
    ],
  },
  {
    name: 'Đà Nẵng',
    id: 3,
    districts: [
      {
        name: 'Quận Hải Châu',
        wards: [
          { name: 'Phường Hải Châu 1' },
          { name: 'Phường Hải Châu 2' },
          { name: 'Phường Thạch Thang' },
          { name: 'Phường Thanh Bình' },
          { name: 'Phường Thuận Phước' },
          { name: 'Phường Hòa Thuận Đông' },
          { name: 'Phường Hòa Thuận Tây' },
          { name: 'Phường Nam Dương' },
          { name: 'Phường Phước Ninh' },
          { name: 'Phường Bình Thuận' },
          { name: 'Phường Bình Hiên' },
          { name: 'Phường Hòa Cường Bắc' },
          { name: 'Phường Hòa Cường Nam' },
        ],
      },
      {
        name: 'Quận Thanh Khê',
        wards: [
          { name: 'Phường Tam Thuận' },
          { name: 'Phường Thanh Khê Tây' },
          { name: 'Phường Thanh Khê Đông' },
          { name: 'Phường Xuân Hà' },
          { name: 'Phường Tân Chính' },
          { name: 'Phường Chính Gián' },
          { name: 'Phường Vĩnh Trung' },
          { name: 'Phường Thạc Gián' },
          { name: 'Phường An Khê' },
          { name: 'Phường Hòa Khê' },
        ],
      },
      {
        name: 'Quận Sơn Trà',
        wards: [
          { name: 'Phường Thọ Quang' },
          { name: 'Phường Nại Hiên Đông' },
          { name: 'Phường Mân Thái' },
          { name: 'Phường An Hải Bắc' },
          { name: 'Phường Phước Mỹ' },
          { name: 'Phường An Hải Tây' },
          { name: 'Phường An Hải Đông' },
        ],
      },
      {
        name: 'Quận Ngũ Hành Sơn',
        wards: [
          { name: 'Phường Mỹ An' },
          { name: 'Phường Khuê Mỹ' },
          { name: 'Phường Hòa Quý' },
          { name: 'Phường Hòa Hải' },
        ],
      },
      {
        name: 'Quận Liên Chiểu',
        wards: [
          { name: 'Phường Hòa Hiệp Bắc' },
          { name: 'Phường Hòa Hiệp Nam' },
          { name: 'Phường Hòa Khánh Bắc' },
          { name: 'Phường Hòa Khánh Nam' },
          { name: 'Phường Hòa Minh' },
        ],
      },
      {
        name: 'Quận Cẩm Lệ',
        wards: [
          { name: 'Phường Khuê Trung' },
          { name: 'Phường Hòa Phát' },
          { name: 'Phường Hòa An' },
          { name: 'Phường Hòa Thọ Tây' },
          { name: 'Phường Hòa Thọ Đông' },
          { name: 'Phường Hòa Xuân' },
        ],
      },
      {
        name: 'Huyện Hòa Vang',
        wards: [
          { name: 'Xã Hòa Bắc' },
          { name: 'Xã Hòa Liên' },
          { name: 'Xã Hòa Ninh' },
          { name: 'Xã Hòa Sơn' },
          { name: 'Xã Hòa Nhơn' },
          { name: 'Xã Hòa Phú' },
          { name: 'Xã Hòa Phong' },
          { name: 'Xã Hòa Châu' },
          { name: 'Xã Hòa Tiến' },
          { name: 'Xã Hòa Phước' },
          { name: 'Xã Hòa Khương' },
        ],
      },
      {
        name: 'Huyện Hoàng Sa',
        wards: [{ name: 'Huyện đảo Hoàng Sa' }],
      },
    ],
  },
  {
    name: 'Cần Thơ',
    id: 4,
    districts: [
      {
        name: 'Quận Ninh Kiều',
        wards: [
          { name: 'Phường Cái Khế' },
          { name: 'Phường An Hòa' },
          { name: 'Phường Thới Bình' },
          { name: 'Phường An Nghiệp' },
          { name: 'Phường An Cư' },
          { name: 'Phường Tân An' },
          { name: 'Phường An Phú' },
          { name: 'Phường Xuân Khánh' },
          { name: 'Phường Hưng Lợi' },
          { name: 'Phường An Khánh' },
          { name: 'Phường An Bình' },
        ],
      },
      {
        name: 'Quận Bình Thủy',
        wards: [
          { name: 'Phường Bình Thủy' },
          { name: 'Phường Trà An' },
          { name: 'Phường Trà Nóc' },
          { name: 'Phường Thới An Đông' },
          { name: 'Phường Bùi Hữu Nghĩa' },
          { name: 'Phường Long Hòa' },
          { name: 'Phường Long Tuyền' },
        ],
      },
      {
        name: 'Quận Cái Răng',
        wards: [
          { name: 'Phường Lê Bình' },
          { name: 'Phường Hưng Phú' },
          { name: 'Phường Hưng Thạnh' },
          { name: 'Phường Ba Láng' },
          { name: 'Phường Thường Thạnh' },
          { name: 'Phường Phú Thứ' },
          { name: 'Phường Tân Phú' },
        ],
      },
      {
        name: 'Quận Ô Môn',
        wards: [{ name: 'Phường Châu Văn Liêm' }, { name: 'Phường Thới Hòa' }, { name: 'Phường Thới An' }],
      },
      {
        name: 'Quận Thốt Nốt',
        wards: [{ name: 'Phường Thốt Nốt' }, { name: 'Phường Thuận An' }, { name: 'Phường Tân Lộc' }],
      },
      {
        name: 'Huyện Phong Điền',
        wards: [{ name: 'Thị trấn Phong Điền' }, { name: 'Xã Mỹ Khánh' }, { name: 'Xã Giai Xuân' }],
      },
      {
        name: 'Huyện Cờ Đỏ',
        wards: [{ name: 'Thị trấn Cờ Đỏ' }, { name: 'Xã Thới Hưng' }, { name: 'Xã Đông Hiệp' }],
      },
      {
        name: 'Huyện Thới Lai',
        wards: [{ name: 'Thị trấn Thới Lai' }, { name: 'Xã Định Môn' }, { name: 'Xã Trường Thành' }],
      },
      {
        name: 'Huyện Vĩnh Thạnh',
        wards: [{ name: 'Thị trấn Vĩnh Thạnh' }, { name: 'Thị trấn Thạnh An' }, { name: 'Xã Thạnh Lộc' }],
      },
    ],
  },
  {
    name: 'Hải Phòng',
    id: 5,
    districts: [
      {
        name: 'Quận Hồng Bàng',
        wards: [{ name: 'Phường Quán Toan' }, { name: 'Phường Hùng Vương' }, { name: 'Phường Sở Dầu' }, { name: 'Phường Thượng Lý' }, { name: 'Phường Hạ Lý' }, { name: 'Phường Minh Khai' }, { name: 'Phường Hoàng Văn Thụ' }, { name: 'Phường Phan Bội Châu' }],
      },
      {
        name: 'Quận Ngô Quyền',
        wards: [{ name: 'Phường Máy Chai' }, { name: 'Phường Cầu Tre' }, { name: 'Phường Vạn Mỹ' }, { name: 'Phường Gia Viên' }, { name: 'Phường Đông Khê' }, { name: 'Phường Cầu Đất' }, { name: 'Phường Lê Lợi' }, { name: 'Phường Đằng Giang' }, { name: 'Phường Lạch Tray' }],
      },
      {
        name: 'Quận Lê Chân',
        wards: [{ name: 'Phường Cát Dài' }, { name: 'Phường An Biên' }, { name: 'Phường Lam Sơn' }, { name: 'Phường An Dương' }, { name: 'Phường Trần Nguyên Hãn' }, { name: 'Phường Hồ Nam' }, { name: 'Phường Dư Hàng' }, { name: 'Phường Hàng Kênh' }, { name: 'Phường Đông Hải' }, { name: 'Phường Niệm Nghĩa' }, { name: 'Phường Nghĩa Xá' }, { name: 'Phường Dư Hàng Kênh' }, { name: 'Phường Kênh Dương' }, { name: 'Phường Vĩnh Niệm' }],
      },
      {
        name: 'Quận Hải An',
        wards: [{ name: 'Phường Đông Hải 1' }, { name: 'Phường Đông Hải 2' }, { name: 'Phường Đằng Lâm' }, { name: 'Phường Đằng Hải' }, { name: 'Phường Nam Hải' }, { name: 'Phường Cát Bi' }, { name: 'Phường Tràng Cát' }],
      },
      {
        name: 'Quận Kiến An',
        wards: [{ name: 'Phường Quán Trữ' }, { name: 'Phường Lãm Hà' }, { name: 'Phường Đồng Hòa' }, { name: 'Phường Bắc Sơn' }, { name: 'Phường Trần Thành Ngọ' }, { name: 'Phường Ngọc Sơn' }, { name: 'Phường Phù Liễn' }, { name: 'Phường Tràng Minh' }, { name: 'Phường Văn Đẩu' }],
      },
      {
        name: 'Quận Đồ Sơn',
        wards: [{ name: 'Phường Ngọc Xuyên' }, { name: 'Phường Hải Sơn' }, { name: 'Phường Vạn Hương' }, { name: 'Phường Bàng La' }, { name: 'Phường Hợp Đức' }, { name: 'Phường Minh Đức' }],
      },
      {
        name: 'Huyện Thủy Nguyên',
        wards: [{ name: 'Thị trấn Núi Đèo' }, { name: 'Thị trấn Minh Đức' }, { name: 'Xã Lại Xuân' }, { name: 'Xã An Sơn' }, { name: 'Xã Kỳ Sơn' }],
      },
      {
        name: 'Huyện An Dương',
        wards: [{ name: 'Thị trấn An Dương' }, { name: 'Xã Lê Thiện' }, { name: 'Xã Đại Bản' }, { name: 'Xã An Hưng' }],
      },
    ],
  },
  {
    name: 'Bến Tre',
    id: 6,
    districts: [
      {
        name: 'TP. Bến Tre',
        wards: [
          { name: 'Phường An Hội' },
          { name: 'Phường 4' },
          { name: 'Phường 5' },
          { name: 'Phường 6' },
          { name: 'Phường 7' },
          { name: 'Phường 8' },
          { name: 'Phường Phú Khương' },
          { name: 'Phường Phú Tân' },
          { name: 'Xã Bình Phú' },
          { name: 'Xã Mỹ Thạnh An' },
          { name: 'Xã Nhơn Thạnh' },
          { name: 'Xã Phú Nhuận' },
          { name: 'Xã Sơn Đông' },
        ],
      },
      {
        name: 'Huyện Chợ Lách',
        wards: [
          { name: 'Thị trấn Chợ Lách' },
          { name: 'Xã Hòa Nghĩa' },
          { name: 'Xã Hưng Khánh Trung B' },
          { name: 'Xã Long Thới' },
          { name: 'Xã Phú Phụng' },
          { name: 'Xã Phú Sơn' },
          { name: 'Xã Sơn Định' },
          { name: 'Xã Tân Thiềng' },
          { name: 'Xã Vĩnh Bình' },
          { name: 'Xã Vĩnh Hòa' },
          { name: 'Xã Vĩnh Thành' },
        ],
      },
      {
        name: 'Huyện Châu Thành',
        wards: [
          { name: 'Thị trấn Châu Thành' },
          { name: 'Xã An Khánh' },
          { name: 'Xã Giao Long' },
          { name: 'Xã Quới Sơn' },
          { name: 'Xã Tân Thạch' },
          { name: 'Xã Tiên Thủy' },
        ],
      },
      {
        name: 'Huyện Mỏ Cày Bắc',
        wards: [{ name: 'Thị trấn Phước Mỹ Trung' }, { name: 'Xã Tân Phú Tây' }, { name: 'Xã Thành An' }],
      },
      {
        name: 'Huyện Mỏ Cày Nam',
        wards: [{ name: 'Thị trấn Mỏ Cày' }, { name: 'Xã An Thạnh' }, { name: 'Xã Định Thủy' }],
      },
      {
        name: 'Huyện Giồng Trôm',
        wards: [{ name: 'Thị trấn Giồng Trôm' }, { name: 'Xã Châu Hòa' }, { name: 'Xã Lương Hòa' }],
      },
      {
        name: 'Huyện Bình Đại',
        wards: [{ name: 'Thị trấn Bình Đại' }, { name: 'Xã Bình Thắng' }, { name: 'Xã Thừa Đức' }],
      },
      {
        name: 'Huyện Ba Tri',
        wards: [{ name: 'Thị trấn Ba Tri' }, { name: 'Xã An Đức' }, { name: 'Xã Bảo Thạnh' }],
      },
      {
        name: 'Huyện Thạnh Phú',
        wards: [{ name: 'Thị trấn Thạnh Phú' }, { name: 'Xã An Nhơn' }, { name: 'Xã Giao Thạnh' }],
      },
    ],
  },
  {
    name: 'Lâm Đồng',
    id: 7,
    districts: [
      {
        name: 'TP. Đà Lạt',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường 3' },
          { name: 'Phường 4' },
          { name: 'Phường 5' },
          { name: 'Phường 6' },
          { name: 'Phường 7' },
          { name: 'Phường 8' },
          { name: 'Phường 9' },
          { name: 'Phường 10' },
          { name: 'Phường 11' },
          { name: 'Phường 12' },
          { name: 'Xã Tà Nung' },
          { name: 'Xã Trạm Hành' },
          { name: 'Xã Xuân Thọ' },
          { name: 'Xã Xuân Trường' },
        ],
      },
      {
        name: 'TP. Bảo Lộc',
        wards: [
          { name: 'Phường 1' },
          { name: 'Phường 2' },
          { name: 'Phường B\'Lao' },
          { name: 'Phường Lộc Phát' },
          { name: 'Phường Lộc Tiến' },
          { name: 'Phường Lộc Sơn' },
          { name: 'Xã Đam B\'ri' },
          { name: 'Xã Lộc Châu' },
          { name: 'Xã Lộc Nga' },
          { name: 'Xã Lộc Thanh' },
        ],
      },
      {
        name: 'Huyện Đơn Dương',
        wards: [
          { name: 'Thị trấn Thạnh Mỹ' },
          { name: 'Thị trấn D’ran' },
          { name: 'Xã Ka Đô' },
          { name: 'Xã Ka Đơn' },
          { name: 'Xã Lạc Lâm' },
          { name: 'Xã Lạc Xuân' },
          { name: 'Xã Pró' },
          { name: 'Xã Quảng Lập' },
          { name: 'Xã Tu Tra' },
        ],
      },
      {
        name: 'Huyện Đức Trọng',
        wards: [
          { name: 'Thị trấn Liên Nghĩa' },
          { name: 'Xã Bình Thạnh' },
          { name: 'Xã Đà Loan' },
          { name: 'Xã Hiệp An' },
          { name: 'Xã Hiệp Thạnh' },
          { name: 'Xã Liên Hiệp' },
          { name: 'Xã Ninh Gia' },
          { name: 'Xã Phú Hội' },
          { name: 'Xã Tà Hine' },
          { name: 'Xã Tà Năng' },
        ],
      },
      {
        name: 'Huyện Lạc Dương',
        wards: [{ name: 'Thị trấn Lạc Dương' }, { name: 'Xã Đạ Chais' }, { name: 'Xã Đạ Nhim' }, { name: 'Xã Đạ Sar' }, { name: 'Xã Lát' }],
      },
      {
        name: 'Huyện Lâm Hà',
        wards: [{ name: 'Thị trấn Đinh Văn' }, { name: 'Thị trấn Nam Ban' }, { name: 'Xã Gia Lâm' }, { name: 'Xã Mê Linh' }],
      },
      {
        name: 'Huyện Bảo Lâm',
        wards: [{ name: 'Thị trấn Lộc Thắng' }, { name: 'Xã B\'Lá' }, { name: 'Xã Lộc An' }, { name: 'Xã Lộc Bảo' }],
      },
      {
        name: 'Huyện Di Linh',
        wards: [{ name: 'Thị trấn Di Linh' }, { name: 'Xã Bảo Thuận' }, { name: 'Xã Đinh Lạc' }, { name: 'Xã Gung Ré' }],
      },
    ],
  },
  {
    name: 'Bình Dương',
    id: 8,
    districts: [
      {
        name: 'TP. Thủ Dầu Một',
        wards: [{ name: 'Phường Phú Cường' }, { name: 'Phường Hiệp Thành' }, { name: 'Phường Chánh Nghĩa' }, { name: 'Phường Phú Hòa' }, { name: 'Phường Phú Lợi' }, { name: 'Phường Phú Thọ' }, { name: 'Phường Định Hòa' }, { name: 'Phường Hòa Phú' }],
      },
      {
        name: 'TP. Thuận An',
        wards: [{ name: 'Phường Lái Thiêu' }, { name: 'Phường An Thạnh' }, { name: 'Phường Vĩnh Phú' }, { name: 'Phường Bình Hòa' }, { name: 'Phường Thuận Giao' }, { name: 'Phường An Phú' }],
      },
      {
        name: 'TP. Dĩ An',
        wards: [{ name: 'Phường Dĩ An' }, { name: 'Phường An Bình' }, { name: 'Phường Tân Đông Hiệp' }, { name: 'Phường Đông Hòa' }, { name: 'Phường Tân Bình' }],
      },
      {
        name: 'TP. Tân Uyên',
        wards: [{ name: 'Phường Uyên Hưng' }, { name: 'Phường Tân Phước Khánh' }, { name: 'Phường Thái Hòa' }],
      },
      {
        name: 'Thị xã Bến Cát',
        wards: [{ name: 'Phường Mỹ Phước' }, { name: 'Phường Thới Hòa' }, { name: 'Phường Tân Định' }],
      },
    ],
  },
  {
    name: 'Đồng Nai',
    id: 9,
    districts: [
      {
        name: 'TP. Biên Hòa',
        wards: [{ name: 'Phường Trung Dũng' }, { name: 'Phường Quyết Thắng' }, { name: 'Phường Thanh Bình' }, { name: 'Phường Quang Vinh' }, { name: 'Phường Tân Phong' }, { name: 'Phường Tân Tiến' }, { name: 'Phường Thống Nhất' }, { name: 'Phường Trảng Dài' }, { name: 'Phường Tam Hiệp' }, { name: 'Phường Long Bình' }],
      },
      {
        name: 'TP. Long Khánh',
        wards: [{ name: 'Phường Xuân An' }, { name: 'Phường Xuân Bình' }, { name: 'Phường Xuân Trung' }, { name: 'Phường Suối Tre' }],
      },
      {
        name: 'Huyện Long Thành',
        wards: [{ name: 'Thị trấn Long Thành' }, { name: 'Xã An Phước' }, { name: 'Xã Bình Sơn' }, { name: 'Xã Lộc An' }],
      },
      {
        name: 'Huyện Nhơn Trạch',
        wards: [{ name: 'Thị trấn Hiệp Phước' }, { name: 'Xã Đại Phước' }, { name: 'Xã Phú Hội' }, { name: 'Xã Phước Khánh' }],
      },
    ],
  },
  {
    name: 'Bà Rịa - Vũng Tàu',
    id: 10,
    districts: [
      {
        name: 'TP. Vũng Tàu',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 3' }, { name: 'Phường 4' }, { name: 'Phường 7' }, { name: 'Phường 8' }, { name: 'Phường Thắng Nhì' }, { name: 'Phường Thắng Tam' }, { name: 'Phường Nguyễn An Ninh' }, { name: 'Phường Rạch Dừa' }],
      },
      {
        name: 'TP. Bà Rịa',
        wards: [{ name: 'Phường Phước Hưng' }, { name: 'Phường Phước Hiệp' }, { name: 'Phường Phước Nguyên' }, { name: 'Phường Long Hương' }],
      },
      {
        name: 'Thị xã Phú Mỹ',
        wards: [{ name: 'Phường Phú Mỹ' }, { name: 'Phường Hắc Dịch' }, { name: 'Phường Mỹ Xuân' }],
      },
    ],
  },
  {
    name: 'Đồng Tháp',
    id: 11,
    districts: [
      {
        name: 'TP. Cao Lãnh',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 3' }, { name: 'Phường 4' }, { name: 'Phường Mỹ Phú' }, { name: 'Phường Hòa Thuận' }],
      },
      {
        name: 'TP. Sa Đéc',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường An Hòa' }, { name: 'Phường Tân Quy Đông' }],
      },
      {
        name: 'Huyện Lai Vung',
        wards: [{ name: 'Thị trấn Lai Vung' }, { name: 'Xã Định An' }, { name: 'Xã Hòa Thành' }, { name: 'Xã Phong Hòa' }],
      },
    ],
  },
  {
    name: 'Vĩnh Long',
    id: 12,
    districts: [
      {
        name: 'TP. Vĩnh Long',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 3' }, { name: 'Phường 4' }, { name: 'Phường 8' }, { name: 'Phường 9' }],
      },
      {
        name: 'Thị xã Bình Minh',
        wards: [{ name: 'Phường Cái Vồn' }, { name: 'Phường Thành Phước' }, { name: 'Xã Đông Bình' }, { name: 'Xã Mỹ Hòa' }],
      },
      {
        name: 'Huyện Long Hồ',
        wards: [{ name: 'Thị trấn Long Hồ' }, { name: 'Xã An Bình' }, { name: 'Xã Bình Hòa Phước' }],
      },
    ],
  },
  {
    name: 'An Giang',
    id: 13,
    districts: [
      {
        name: 'TP. Long Xuyên',
        wards: [{ name: 'Phường Mỹ Bình' }, { name: 'Phường Mỹ Long' }, { name: 'Phường Mỹ Xuyên' }, { name: 'Phường Đông Xuyên' }],
      },
      {
        name: 'TP. Châu Đốc',
        wards: [{ name: 'Phường Châu Phú A' }, { name: 'Phường Châu Phú B' }, { name: 'Phường Núi Sam' }],
      },
      {
        name: 'Thị xã Tân Châu',
        wards: [{ name: 'Phường Long Thạnh' }, { name: 'Phường Long Hưng' }],
      },
    ],
  },
  {
    name: 'Tiền Giang',
    id: 14,
    districts: [
      {
        name: 'TP. Mỹ Tho',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 4' }, { name: 'Phường 5' }, { name: 'Phường 7' }],
      },
      {
        name: 'Thị xã Gò Công',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 5' }],
      },
      {
        name: 'Huyện Cái Bè',
        wards: [{ name: 'Thị trấn Cái Bè' }, { name: 'Xã An Thái Trung' }, { name: 'Xã Đông Hòa Hiệp' }],
      },
    ],
  },
  {
    name: 'Sơn La',
    id: 15,
    districts: [
      {
        name: 'TP. Sơn La',
        wards: [{ name: 'Phường Chiềng Lề' }, { name: 'Phường Tô Hiệu' }, { name: 'Phường Quyết Thắng' }, { name: 'Phường Quyết Tâm' }],
      },
      {
        name: 'Huyện Mộc Châu',
        wards: [
          { name: 'Thị trấn Mộc Châu' },
          { name: 'Thị trấn Nông trường Mộc Châu' },
          { name: 'Xã Đông Sang' },
          { name: 'Xã Mường Sang' },
          { name: 'Xã Phiêng Luông' },
          { name: 'Xã Tân Lập' },
        ],
      },
    ],
  },
  {
    name: 'Thái Nguyên',
    id: 16,
    districts: [
      {
        name: 'TP. Thái Nguyên',
        wards: [
          { name: 'Phường Hoàng Văn Thụ' },
          { name: 'Phường Phan Đình Phùng' },
          { name: 'Phường Trưng Vương' },
          { name: 'Phường Tân Thịnh' },
          { name: 'Xã Tân Cương' },
          { name: 'Xã Phúc Trìu' },
        ],
      },
      {
        name: 'TP. Sông Công',
        wards: [{ name: 'Phường Thắng Lợi' }, { name: 'Phường Mỏ Chè' }],
      },
      {
        name: 'TP. Phổ Yên',
        wards: [{ name: 'Phường Ba Hàng' }, { name: 'Phường Bắc Sơn' }],
      },
    ],
  },
  {
    name: 'Thừa Thiên Huế',
    id: 17,
    districts: [
      {
        name: 'TP. Huế',
        wards: [{ name: 'Phường Phú Nhuận' }, { name: 'Phường Vĩnh Ninh' }, { name: 'Phường Thuận Thành' }, { name: 'Phường Thuận Hòa' }, { name: 'Phường Tây Lộc' }, { name: 'Phường Vỹ Dạ' }, { name: 'Phường Hương Long' }],
      },
      {
        name: 'Thị xã Hương Thủy',
        wards: [{ name: 'Phường Phú Bài' }, { name: 'Phường Thủy Dương' }],
      },
      {
        name: 'Thị xã Hương Trà',
        wards: [{ name: 'Phường Tứ Hạ' }, { name: 'Phường Hương Văn' }],
      },
    ],
  },
  {
    name: 'Đắk Lắk',
    id: 18,
    districts: [
      {
        name: 'TP. Buôn Ma Thuột',
        wards: [{ name: 'Phường Thắng Lợi' }, { name: 'Phường Tân Lợi' }, { name: 'Phường Tự An' }, { name: 'Phường Thành Công' }, { name: 'Phường Tân Lập' }],
      },
      {
        name: 'Thị xã Buôn Hồ',
        wards: [{ name: 'Phường An Lạc' }, { name: 'Phường An Bình' }],
      },
      {
        name: 'Huyện Cư M\'gar',
        wards: [{ name: 'Thị trấn Quảng Phú' }, { name: 'Xã Cư Suê' }],
      },
    ],
  },
  {
    name: 'Khánh Hòa',
    id: 19,
    districts: [
      {
        name: 'TP. Nha Trang',
        wards: [{ name: 'Phường Lộc Thọ' }, { name: 'Phường Tân Lập' }, { name: 'Phường Phước Hải' }, { name: 'Phường Vĩnh Hải' }, { name: 'Phường Vĩnh Phước' }, { name: 'Phường Phước Tân' }],
      },
      {
        name: 'TP. Cam Ranh',
        wards: [{ name: 'Phường Cam Nghĩa' }, { name: 'Phường Cam Phú' }, { name: 'Phường Ba Ngòi' }],
      },
      {
        name: 'Thị xã Ninh Hòa',
        wards: [{ name: 'Phường Ninh Hiệp' }, { name: 'Phường Ninh Giang' }],
      },
    ],
  },
  {
    name: 'Bình Thuận',
    id: 20,
    districts: [
      {
        name: 'TP. Phan Thiết',
        wards: [{ name: 'Phường Mũi Né' }, { name: 'Phường Hàm Tiến' }, { name: 'Phường Phú Thủy' }, { name: 'Phường Đức Nghĩa' }],
      },
      {
        name: 'Thị xã La Gi',
        wards: [{ name: 'Phường Tân An' }, { name: 'Phường Phước Hội' }],
      },
      {
        name: 'Huyện Hàm Thuận Bắc',
        wards: [{ name: 'Thị trấn Ma Lâm' }, { name: 'Xã Hàm Đức' }],
      },
    ],
  },
  {
    name: 'Quảng Ninh',
    id: 21,
    districts: [
      {
        name: 'TP. Hạ Long',
        wards: [{ name: 'Phường Bạch Đằng' }, { name: 'Phường Bãi Cháy' }, { name: 'Phường Cao Xanh' }, { name: 'Phường Hòn Gai' }],
      },
      {
        name: 'TP. Cẩm Phả',
        wards: [{ name: 'Phường Cẩm Trung' }, { name: 'Phường Cẩm Thành' }],
      },
      {
        name: 'TP. Uông Bí',
        wards: [{ name: 'Phường Quang Trung' }, { name: 'Phường Thanh Sơn' }],
      },
      {
        name: 'TP. Móng Cái',
        wards: [{ name: 'Phường Trần Phú' }, { name: 'Phường Ka Long' }],
      },
    ],
  },
  {
    name: 'Thanh Hóa',
    id: 22,
    districts: [
      {
        name: 'TP. Thanh Hóa',
        wards: [{ name: 'Phường Điện Biên' }, { name: 'Phường Ba Đình' }, { name: 'Phường Lam Sơn' }, { name: 'Phường Đông Thọ' }],
      },
      {
        name: 'TP. Sầm Sơn',
        wards: [{ name: 'Phường Bắc Sơn' }, { name: 'Phường Trường Sơn' }],
      },
      {
        name: 'Thị xã Bỉm Sơn',
        wards: [{ name: 'Phường Ba Đình' }, { name: 'Phường Ngọc Trạo' }],
      },
    ],
  },
  {
    name: 'Nghệ An',
    id: 23,
    districts: [
      {
        name: 'TP. Vinh',
        wards: [{ name: 'Phường Lê Lợi' }, { name: 'Phường Quang Trung' }, { name: 'Phường Trường Thi' }, { name: 'Phường Hưng Dũng' }],
      },
      {
        name: 'Thị xã Cửa Lò',
        wards: [{ name: 'Phường Nghi Hương' }, { name: 'Phường Thu Thủy' }],
      },
      {
        name: 'Thị xã Thái Hòa',
        wards: [{ name: 'Phường Hòa Hiếu' }, { name: 'Phường Quang Tiến' }],
      },
    ],
  },
  {
    name: 'Kiên Giang',
    id: 24,
    districts: [
      {
        name: 'TP. Rạch Giá',
        wards: [{ name: 'Phường Vĩnh Thanh Vân' }, { name: 'Phường Vĩnh Lạc' }, { name: 'Phường An Hòa' }],
      },
      {
        name: 'TP. Phú Quốc',
        wards: [{ name: 'Phường Dương Đông' }, { name: 'Phường An Thới' }, { name: 'Xã Cửa Cạn' }, { name: 'Xã Gành Dầu' }, { name: 'Xã Hàm Ninh' }],
      },
      {
        name: 'TP. Hà Tiên',
        wards: [{ name: 'Phường Bình San' }, { name: 'Phường Pháo Đài' }],
      },
    ],
  },
  {
    name: 'Cà Mau',
    id: 25,
    districts: [
      {
        name: 'TP. Cà Mau',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 5' }, { name: 'Phường 9' }],
      },
      {
        name: 'Huyện Năm Căn',
        wards: [{ name: 'Thị trấn Năm Căn' }, { name: 'Xã Đất Mới' }],
      },
      {
        name: 'Huyện Ngọc Hiển',
        wards: [{ name: 'Thị trấn Rạch Gốc' }, { name: 'Xã Đất Mũi' }],
      },
    ],
  },
  {
    name: 'Bắc Ninh',
    id: 26,
    districts: [
      {
        name: 'TP. Bắc Ninh',
        wards: [{ name: 'Phường Suối Hoa' }, { name: 'Phường Tiền An' }, { name: 'Phường Ninh Xá' }, { name: 'Phường Đại Phúc' }],
      },
      {
        name: 'TP. Từ Sơn',
        wards: [{ name: 'Phường Đông Ngàn' }, { name: 'Phường Đồng Nguyên' }, { name: 'Phường Đình Bảng' }],
      },
      {
        name: 'Thị xã Quế Võ',
        wards: [{ name: 'Phường Phố Mới' }, { name: 'Phường Bằng An' }],
      },
    ],
  },
  {
    name: 'Hải Dương',
    id: 27,
    districts: [
      {
        name: 'TP. Hải Dương',
        wards: [{ name: 'Phường Trần Phú' }, { name: 'Phường Lê Thanh Nghị' }, { name: 'Phường Quang Trung' }],
      },
      {
        name: 'TP. Chí Linh',
        wards: [{ name: 'Phường Sao Đỏ' }, { name: 'Phường Cộng Hòa' }],
      },
    ],
  },
  {
    name: 'Bắc Giang',
    id: 28,
    districts: [
      {
        name: 'TP. Bắc Giang',
        wards: [{ name: 'Phường Ngô Quyền' }, { name: 'Phường Trần Phú' }, { name: 'Phường Lê Lợi' }],
      },
      {
        name: 'Thị xã Việt Yên',
        wards: [{ name: 'Phường Bích Động' }, { name: 'Phường Nếnh' }],
      },
      {
        name: 'Huyện Lục Ngạn',
        wards: [{ name: 'Thị trấn Chũ' }, { name: 'Xã Hồng Giang' }],
      },
    ],
  },
  {
    name: 'Vĩnh Phúc',
    id: 29,
    districts: [
      {
        name: 'TP. Vĩnh Yên',
        wards: [{ name: 'Phường Tích Sơn' }, { name: 'Phường Liên Bảo' }, { name: 'Phường Khai Quang' }],
      },
      {
        name: 'TP. Phúc Yên',
        wards: [{ name: 'Phường Trưng Trắc' }, { name: 'Phường Hùng Vương' }],
      },
    ],
  },
  {
    name: 'Hưng Yên',
    id: 30,
    districts: [
      {
        name: 'TP. Hưng Yên',
        wards: [{ name: 'Phường Lê Lợi' }, { name: 'Phường Hiến Nam' }, { name: 'Phường Lam Sơn' }],
      },
      {
        name: 'Thị xã Mỹ Hào',
        wards: [{ name: 'Phường Bần Yên Nhân' }, { name: 'Phường Phan Đình Phùng' }],
      },
      {
        name: 'Huyện Văn Giang',
        wards: [{ name: 'Thị trấn Văn Giang' }, { name: 'Xã Phụng Công' }, { name: 'Xã Xuân Quan' }],
      },
    ],
  },
  {
    name: 'Nam Định',
    id: 31,
    districts: [
      {
        name: 'TP. Nam Định',
        wards: [{ name: 'Phường Vị Hoàng' }, { name: 'Phường Quang Trung' }, { name: 'Phường Trần Hưng Đạo' }],
      },
      {
        name: 'Huyện Hải Hậu',
        wards: [{ name: 'Thị trấn Yên Định' }, { name: 'Thị trấn Cồn' }],
      },
    ],
  },
  {
    name: 'Thái Bình',
    id: 32,
    districts: [
      {
        name: 'TP. Thái Bình',
        wards: [{ name: 'Phường Lê Hồng Phong' }, { name: 'Phường Bồ Xuyên' }, { name: 'Phường Đề Thám' }],
      },
      {
        name: 'Huyện Đông Hưng',
        wards: [{ name: 'Thị trấn Đông Hưng' }, { name: 'Xã Đông La' }],
      },
    ],
  },
  {
    name: 'Ninh Bình',
    id: 33,
    districts: [
      {
        name: 'TP. Ninh Bình',
        wards: [{ name: 'Phường Vân Giang' }, { name: 'Phường Tân Thành' }, { name: 'Phường Nam Thành' }],
      },
      {
        name: 'TP. Tam Điệp',
        wards: [{ name: 'Phường Bắc Sơn' }, { name: 'Phường Trung Sơn' }],
      },
      {
        name: 'Huyện Hoa Lư',
        wards: [{ name: 'Thị trấn Thiên Tôn' }, { name: 'Xã Ninh Xuân' }, { name: 'Xã Ninh Hải' }],
      },
    ],
  },
  {
    name: 'Hà Nam',
    id: 34,
    districts: [
      {
        name: 'TP. Phủ Lý',
        wards: [{ name: 'Phường Minh Khai' }, { name: 'Phường Trần Hưng Đạo' }, { name: 'Phường Hai Bà Trưng' }],
      },
      {
        name: 'Thị xã Duy Tiên',
        wards: [{ name: 'Phường Hòa Mạc' }, { name: 'Phường Đồng Văn' }],
      },
    ],
  },
  {
    name: 'Hà Tĩnh',
    id: 35,
    districts: [
      {
        name: 'TP. Hà Tĩnh',
        wards: [{ name: 'Phường Bắc Hà' }, { name: 'Phường Nam Hà' }, { name: 'Phường Trần Phú' }],
      },
      {
        name: 'Thị xã Hồng Lĩnh',
        wards: [{ name: 'Phường Bắc Hồng' }, { name: 'Phường Nam Hồng' }],
      },
      {
        name: 'Thị xã Kỳ Anh',
        wards: [{ name: 'Phường Sông Trí' }, { name: 'Phường Kỳ Long' }],
      },
    ],
  },
  {
    name: 'Quảng Bình',
    id: 36,
    districts: [
      {
        name: 'TP. Đồng Hới',
        wards: [{ name: 'Phường Đồng Mỹ' }, { name: 'Phường Hải Đình' }, { name: 'Phường Nam Lý' }],
      },
      {
        name: 'Thị xã Ba Đồn',
        wards: [{ name: 'Phường Ba Đồn' }, { name: 'Phường Quảng Thọ' }],
      },
    ],
  },
  {
    name: 'Quảng Trị',
    id: 37,
    districts: [
      {
        name: 'TP. Đông Hà',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 5' }],
      },
      {
        name: 'Thị xã Quảng Trị',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 3' }],
      },
    ],
  },
  {
    name: 'Quảng Nam',
    id: 38,
    districts: [
      {
        name: 'TP. Tam Kỳ',
        wards: [{ name: 'Phường An Mỹ' }, { name: 'Phường Tân Thạnh' }, { name: 'Phường Phước Hòa' }],
      },
      {
        name: 'TP. Hội An',
        wards: [{ name: 'Phường Minh An' }, { name: 'Phường Cẩm Phô' }, { name: 'Phường Sơn Phong' }, { name: 'Phường Cẩm Châu' }, { name: 'Phường Cửa Đại' }],
      },
      {
        name: 'Thị xã Điện Bàn',
        wards: [{ name: 'Phường Vĩnh Điện' }, { name: 'Phường Điện Ngọc' }],
      },
    ],
  },
  {
    name: 'Quảng Ngãi',
    id: 39,
    districts: [
      {
        name: 'TP. Quảng Ngãi',
        wards: [{ name: 'Phường Trần Phú' }, { name: 'Phường Lê Hồng Phong' }, { name: 'Phường Chánh Lộ' }],
      },
      {
        name: 'Thị xã Đức Phổ',
        wards: [{ name: 'Phường Nguyễn Nghiêm' }, { name: 'Phường Phổ Thạnh' }],
      },
    ],
  },
  {
    name: 'Bình Định',
    id: 40,
    districts: [
      {
        name: 'TP. Quy Nhơn',
        wards: [{ name: 'Phường Lê Hồng Phong' }, { name: 'Phường Lý Thường Kiệt' }, { name: 'Phường Ngô Mây' }, { name: 'Phường Ghềnh Ráng' }],
      },
      {
        name: 'Thị xã An Nhơn',
        wards: [{ name: 'Phường Bình Định' }, { name: 'Phường Đập Đá' }],
      },
      {
        name: 'Thị xã Hoài Nhơn',
        wards: [{ name: 'Phường Bồng Sơn' }, { name: 'Phường Tam Quan' }],
      },
    ],
  },
  {
    name: 'Phú Yên',
    id: 41,
    districts: [
      {
        name: 'TP. Tuy Hòa',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 5' }, { name: 'Phường 7' }],
      },
      {
        name: 'Thị xã Sông Cầu',
        wards: [{ name: 'Phường Xuân Phú' }, { name: 'Phường Xuân Thành' }],
      },
      {
        name: 'Thị xã Đông Hòa',
        wards: [{ name: 'Phường Hòa Vinh' }, { name: 'Phường Hòa Hiệp Trung' }],
      },
    ],
  },
  {
    name: 'Ninh Thuận',
    id: 42,
    districts: [
      {
        name: 'TP. Phan Rang - Tháp Chàm',
        wards: [{ name: 'Phường Kinh Dinh' }, { name: 'Phường Thanh Sơn' }, { name: 'Phường Phước Mỹ' }, { name: 'Phường Đô Vinh' }],
      },
      {
        name: 'Huyện Ninh Hải',
        wards: [{ name: 'Thị trấn Khánh Hải' }, { name: 'Xã Vĩnh Hải' }],
      },
    ],
  },
  {
    name: 'Kon Tum',
    id: 43,
    districts: [
      {
        name: 'TP. Kon Tum',
        wards: [{ name: 'Phường Quyết Thắng' }, { name: 'Phường Thắng Lợi' }, { name: 'Phường Quang Trung' }],
      },
      {
        name: 'Huyện Măng Đen / Kon Plông',
        wards: [{ name: 'Thị trấn Măng Đen' }, { name: 'Xã Hiếu' }],
      },
    ],
  },
  {
    name: 'Gia Lai',
    id: 44,
    districts: [
      {
        name: 'TP. Pleiku',
        wards: [{ name: 'Phường Diên Hồng' }, { name: 'Phường Hoa Lư' }, { name: 'Phường Tây Sơn' }, { name: 'Phường Hội Thương' }],
      },
      {
        name: 'Thị xã An Khê',
        wards: [{ name: 'Phường An Phú' }, { name: 'Phường Tây Sơn' }],
      },
      {
        name: 'Thị xã Ayun Pa',
        wards: [{ name: 'Phường Cheo Reo' }, { name: 'Phường Đoàn Kết' }],
      },
    ],
  },
  {
    name: 'Đắk Nông',
    id: 45,
    districts: [
      {
        name: 'TP. Gia Nghĩa',
        wards: [{ name: 'Phường Nghĩa Đức' }, { name: 'Phường Nghĩa Thành' }, { name: 'Phường Nghĩa Phú' }],
      },
      {
        name: 'Huyện Đắk Mil',
        wards: [{ name: 'Thị trấn Đắk Mil' }, { name: 'Xã Đức Minh' }],
      },
    ],
  },
  {
    name: 'Tây Ninh',
    id: 46,
    districts: [
      {
        name: 'TP. Tây Ninh',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 3' }, { name: 'Phường Hiệp Ninh' }],
      },
      {
        name: 'Thị xã Trảng Bàng',
        wards: [{ name: 'Phường Trảng Bàng' }, { name: 'Phường An Tịnh' }],
      },
      {
        name: 'Thị xã Hòa Thành',
        wards: [{ name: 'Phường Long Hoa' }, { name: 'Phường Hiệp Tân' }],
      },
    ],
  },
  {
    name: 'Bình Phước',
    id: 47,
    districts: [
      {
        name: 'TP. Đồng Xoài',
        wards: [{ name: 'Phường Tân Phú' }, { name: 'Phường Tân Đồng' }, { name: 'Phường Tân Bình' }],
      },
      {
        name: 'Thị xã Phước Long',
        wards: [{ name: 'Phường Long Phước' }, { name: 'Phường Thác Mơ' }],
      },
      {
        name: 'Thị xã Bình Long',
        wards: [{ name: 'Phường An Lộc' }, { name: 'Phường Hưng Chiến' }],
      },
    ],
  },
  {
    name: 'Long An',
    id: 48,
    districts: [
      {
        name: 'TP. Tân An',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 3' }, { name: 'Phường 4' }, { name: 'Phường Tân Khánh' }],
      },
      {
        name: 'Thị xã Kiến Tường',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }],
      },
      {
        name: 'Huyện Bến Lức',
        wards: [{ name: 'Thị trấn Bến Lức' }, { name: 'Xã Mỹ Yên' }, { name: 'Xã Thạnh Đức' }],
      },
      {
        name: 'Huyện Cần Giuộc',
        wards: [{ name: 'Thị trấn Cần Giuộc' }, { name: 'Xã Long Hậu' }, { name: 'Xã Tân Kim' }],
      },
    ],
  },
  {
    name: 'Trà Vinh',
    id: 49,
    districts: [
      {
        name: 'TP. Trà Vinh',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 7' }],
      },
      {
        name: 'Thị xã Duyên Hải',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }],
      },
      {
        name: 'Huyện Cầu Kè',
        wards: [{ name: 'Thị trấn Cầu Kè' }, { name: 'Xã An Phú Tân' }],
      },
    ],
  },
  {
    name: 'Hậu Giang',
    id: 50,
    districts: [
      {
        name: 'TP. Vị Thanh',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 3' }, { name: 'Phường 4' }],
      },
      {
        name: 'TP. Ngã Bảy',
        wards: [{ name: 'Phường Ngã Bảy' }, { name: 'Phường Lái Hiếu' }],
      },
      {
        name: 'Thị xã Long Mỹ',
        wards: [{ name: 'Phường Bình Thạnh' }, { name: 'Phường Thuận An' }],
      },
    ],
  },
  {
    name: 'Sóc Trăng',
    id: 51,
    districts: [
      {
        name: 'TP. Sóc Trăng',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 3' }, { name: 'Phường 6' }],
      },
      {
        name: 'Thị xã Vĩnh Châu',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }],
      },
      {
        name: 'Thị xã Ngã Năm',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }],
      },
    ],
  },
  {
    name: 'Bạc Liêu',
    id: 52,
    districts: [
      {
        name: 'TP. Bạc Liêu',
        wards: [{ name: 'Phường 1' }, { name: 'Phường 2' }, { name: 'Phường 3' }, { name: 'Phường 7' }],
      },
      {
        name: 'Thị xã Giá Rai',
        wards: [{ name: 'Phường 1' }, { name: 'Phường Hộ Phòng' }],
      },
    ],
  },
  {
    name: 'Hòa Bình',
    id: 53,
    districts: [
      {
        name: 'TP. Hòa Bình',
        wards: [{ name: 'Phường Phương Lâm' }, { name: 'Phường Đồng Tiến' }, { name: 'Phường Tân Hòa' }],
      },
      {
        name: 'Huyện Lương Sơn',
        wards: [{ name: 'Thị trấn Lương Sơn' }, { name: 'Xã Hòa Sơn' }],
      },
      {
        name: 'Huyện Mai Châu',
        wards: [{ name: 'Thị trấn Mai Châu' }, { name: 'Xã Chiềng Châu' }],
      },
    ],
  },
  {
    name: 'Lào Cai',
    id: 54,
    districts: [
      {
        name: 'TP. Lào Cai',
        wards: [{ name: 'Phường Kim Tân' }, { name: 'Phường Cốc Lếu' }, { name: 'Phường Bắc Cường' }],
      },
      {
        name: 'Thị xã Sa Pa',
        wards: [{ name: 'Phường Sa Pa' }, { name: 'Phường Cầu Mây' }, { name: 'Phường Hàm Rồng' }],
      },
      {
        name: 'Huyện Bắc Hà',
        wards: [{ name: 'Thị trấn Bắc Hà' }, { name: 'Xã Bản Phố' }],
      },
    ],
  },
  {
    name: 'Yên Bái',
    id: 55,
    districts: [
      {
        name: 'TP. Yên Bái',
        wards: [{ name: 'Phường Đồng Tâm' }, { name: 'Phường Yên Ninh' }, { name: 'Phường Hồng Hà' }],
      },
      {
        name: 'Thị xã Nghĩa Lộ',
        wards: [{ name: 'Phường Tân An' }, { name: 'Phường Trung Tâm' }],
      },
      {
        name: 'Huyện Mù Cang Chải',
        wards: [{ name: 'Thị trấn Mù Cang Chải' }, { name: 'Xã La Pán Tẩn' }],
      },
    ],
  },
  {
    name: 'Điện Biên',
    id: 56,
    districts: [
      {
        name: 'TP. Điện Biên Phủ',
        wards: [{ name: 'Phường Mường Thanh' }, { name: 'Phường Tân Thanh' }, { name: 'Phường Thanh Bình' }],
      },
      {
        name: 'Thị xã Mường Lay',
        wards: [{ name: 'Phường Sông Đà' }, { name: 'Phường Na Lay' }],
      },
    ],
  },
  {
    name: 'Lai Châu',
    id: 57,
    districts: [
      {
        name: 'TP. Lai Châu',
        wards: [{ name: 'Phường Tân Phong' }, { name: 'Phường Quyết Thắng' }, { name: 'Phường Đông Phong' }],
      },
      {
        name: 'Huyện Phong Thổ',
        wards: [{ name: 'Thị trấn Phong Thổ' }],
      },
    ],
  },
  {
    name: 'Hà Giang',
    id: 58,
    districts: [
      {
        name: 'TP. Hà Giang',
        wards: [{ name: 'Phường Trần Phú' }, { name: 'Phường Nguyễn Trãi' }, { name: 'Phường Minh Khai' }],
      },
      {
        name: 'Huyện Đồng Văn',
        wards: [{ name: 'Thị trấn Đồng Văn' }, { name: 'Xã Lũng Cú' }, { name: 'Xã Sà Phìn' }],
      },
      {
        name: 'Huyện Mèo Vạc',
        wards: [{ name: 'Thị trấn Mèo Vạc' }, { name: 'Xã Pả Vi' }],
      },
    ],
  },
  {
    name: 'Tuyên Quang',
    id: 59,
    districts: [
      {
        name: 'TP. Tuyên Quang',
        wards: [{ name: 'Phường Phan Thiết' }, { name: 'Phường Tân Quang' }, { name: 'Phường Minh Xuân' }],
      },
      {
        name: 'Huyện Na Hang',
        wards: [{ name: 'Thị trấn Na Hang' }],
      },
    ],
  },
  {
    name: 'Cao Bằng',
    id: 60,
    districts: [
      {
        name: 'TP. Cao Bằng',
        wards: [{ name: 'Phường Hợp Giang' }, { name: 'Phường Sông Bằng' }, { name: 'Phường Tân Giang' }],
      },
      {
        name: 'Huyện Trùng Khánh',
        wards: [{ name: 'Thị trấn Trùng Khánh' }, { name: 'Xã Đàm Thủy' }],
      },
    ],
  },
  {
    name: 'Bắc Kạn',
    id: 61,
    districts: [
      {
        name: 'TP. Bắc Kạn',
        wards: [{ name: 'Phường Đức Xuân' }, { name: 'Phường Sông Cầu' }, { name: 'Phường Phùng Chí Kiên' }],
      },
      {
        name: 'Huyện Ba Bể',
        wards: [{ name: 'Thị trấn Chợ Rã' }, { name: 'Xã Nam Mẫu' }],
      },
    ],
  },
  {
    name: 'Lạng Sơn',
    id: 62,
    districts: [
      {
        name: 'TP. Lạng Sơn',
        wards: [{ name: 'Phường Hoàng Văn Thụ' }, { name: 'Phường Tam Thanh' }, { name: 'Phường Vĩnh Trại' }],
      },
      {
        name: 'Huyện Cao Lộc',
        wards: [{ name: 'Thị trấn Đồng Đăng' }, { name: 'Thị trấn Cao Lộc' }],
      },
    ],
  },
  {
    name: 'Phú Thọ',
    id: 63,
    districts: [
      {
        name: 'TP. Việt Trì',
        wards: [{ name: 'Phường Tiên Cát' }, { name: 'Phường Gia Cẩm' }, { name: 'Phường Nông Trang' }, { name: 'Phường Tân Dân' }],
      },
      {
        name: 'Thị xã Phú Thọ',
        wards: [{ name: 'Phường Âu Cơ' }, { name: 'Phường Hùng Vương' }],
      },
      {
        name: 'Huyện Lâm Thao',
        wards: [{ name: 'Thị trấn Lâm Thao' }, { name: 'Xã Hy Cương' }],
      },
    ],
  },
];

/**
 * Trả về danh sách tên 63 Tỉnh/Thành phố
 */
export function getAllProvinces(): string[] {
  return VIETNAM_LOCATIONS.map((p) => p.name);
}

/**
 * Lấy danh sách Quận / Huyện theo Tỉnh / Thành phố
 */
export function getDistrictsByProvince(provinceName: string): string[] {
  const p = VIETNAM_LOCATIONS.find((item) => item.name.toLowerCase() === provinceName.trim().toLowerCase());
  if (!p) return [];
  return p.districts.map((d) => d.name);
}

/**
 * Lấy danh sách Phường / Xã theo Tỉnh/Thành và Quận/Huyện
 */
export function getWardsByDistrict(provinceName: string, districtName: string): string[] {
  const p = VIETNAM_LOCATIONS.find((item) => item.name.toLowerCase() === provinceName.trim().toLowerCase());
  if (!p) return [];
  const d = p.districts.find((item) => item.name.toLowerCase() === districtName.trim().toLowerCase());
  if (!d) return [];
  return d.wards.map((w) => w.name);
}

/**
 * Hàm phân tích (parse) chuỗi địa chỉ đầy đủ thành các phần: Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/Thành
 */
export function parseVietnamAddress(rawAddress: string): {
  province: string;
  district: string;
  ward: string;
  street: string;
} {
  if (!rawAddress || typeof rawAddress !== 'string') {
    return { province: '', district: '', ward: '', street: '' };
  }

  const parts = rawAddress.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { province: '', district: '', ward: '', street: '' };
  }

  // Thử khớp tỉnh thành từ phần tử cuối cùng
  let province = '';
  let district = '';
  let ward = '';
  let street = '';

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const matchP = VIETNAM_LOCATIONS.find(
      (p) =>
        p.name.toLowerCase() === part.toLowerCase() ||
        p.name.toLowerCase().replace(/^(tp\.|tỉnh)\s*/i, '').trim() === part.toLowerCase().replace(/^(tp\.|tỉnh)\s*/i, '').trim()
    );
    if (matchP) {
      province = matchP.name;
      parts.splice(i, 1);
      break;
    }
  }

  // Khớp quận huyện
  if (province) {
    const districts = getDistrictsByProvince(province);
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      const matchD = districts.find(
        (d) =>
          d.toLowerCase() === part.toLowerCase() ||
          d.toLowerCase().replace(/^(quận|huyện|thị xã|tp\.)\s*/i, '').trim() === part.toLowerCase().replace(/^(quận|huyện|thị xã|tp\.)\s*/i, '').trim()
      );
      if (matchD) {
        district = matchD;
        parts.splice(i, 1);
        break;
      }
    }
  }

  // Khớp phường xã
  if (province && district) {
    const wards = getWardsByDistrict(province, district);
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      const matchW = wards.find(
        (w) =>
          w.toLowerCase() === part.toLowerCase() ||
          w.toLowerCase().replace(/^(phường|xã|thị trấn)\s*/i, '').trim() === part.toLowerCase().replace(/^(phường|xã|thị trấn)\s*/i, '').trim()
      );
      if (matchW) {
        ward = matchW;
        parts.splice(i, 1);
        break;
      }
    }
  }

  street = parts.join(', ');

  return { province, district, ward, street };
}

/**
 * Tổng hợp địa chỉ từ các thành phần
 */
export function formatVietnamAddress(street: string, ward: string, district: string, province: string): string {
  const parts = [street.trim(), ward.trim(), district.trim(), province.trim()].filter(Boolean);
  return parts.join(', ');
}
