export interface ProductVariant {
  id: string;
  unit: string;
  price: number;
  comparePrice?: number;
}

export interface FarmerInfo {
  name: string;
  region: string;
  rating: number;
  story: string;
  address?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  description: string;
  farmer: FarmerInfo;
  images: string[];
  variants: ProductVariant[];
  badge?: string;
  soldCount?: number;
  rating?: number;
  isSeasonal?: boolean;
}

export interface CategoryInfo {
  name: string;
  slug: string;
  description: string;
  icon: string;
  bannerImage: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    name: 'Đi chợ online',
    slug: 'di-cho-online',
    description: 'Thực phẩm tươi ngon, rau củ sạch thu hoạch trong ngày giao tận nhà.',
    icon: '🛒',
    bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop'
  },
  {
    name: 'Trái cây tươi ngon',
    slug: 'trai-cay',
    description: 'Trái cây nhiệt đới và ôn đới chín cây tự nhiên, chuẩn VietGAP, ngọt thơm mọng nước.',
    icon: '🍉',
    bannerImage: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=1920&auto=format&fit=crop'
  },
  {
    name: 'Trà - Cà phê - Socola',
    slug: 'tra-ca-phe',
    description: 'Trà Thái Nguyên thượng hạng, Cà phê Robusta Mộc Châu rang mộc, Cacao Bến Tre nguyên chất.',
    icon: '☕',
    bannerImage: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1920&auto=format&fit=crop'
  },
  {
    name: 'Đặc sản vùng miền',
    slug: 'dac-san',
    description: 'Đặc sản trứ danh 3 miền: Sầu riêng Ri6, Mật ong rừng Tràm, Bưởi da xanh Bến Tre.',
    icon: '🎁',
    bannerImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop'
  },
  {
    name: 'Agrishow Triển Lãm',
    slug: 'agrishow',
    description: 'Bộ sưu tập nông sản đạt chuẩn xuất khẩu chất lượng cao tại Hội chợ Nông sản Việt.',
    icon: '🌾',
    bannerImage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1920&auto=format&fit=crop'
  }
];

export const ALL_PRODUCTS: ProductItem[] = [
  {
    id: "p1",
    name: "Sầu Riêng Ri6 Hạt Lép",
    slug: "sau-rieng-ri6",
    categorySlug: "trai-cay",
    categoryName: "Trái cây tươi ngon",
    description: "Sầu riêng Ri6 trứ danh được trồng tại vùng phù sa màu mỡ Chợ Lách, Bến Tre. Cơm vàng óng, hạt lép, độ ngọt vừa phải và béo ngậy. Cam kết chín cây tự nhiên, không nhúng thuốc ép chín.",
    farmer: {
      name: "Vườn Trái Cây Chú Ba",
      region: "Bến Tre",
      rating: 4.8,
      address: "Chợ Lách, Bến Tre",
      story: "Hơn 20 năm gắn bó với cây sầu riêng, vườn chú Ba áp dụng chuẩn VietGAP mang lại những trái sầu riêng an toàn nhất."
    },
    images: [
      "https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Tách vỏ (Hộp 500g)", price: 150000, comparePrice: 190000 },
      { id: "v2", unit: "Nguyên trái (2.5-3kg)", price: 350000, comparePrice: 400000 }
    ],
    badge: "Freeship",
    soldCount: 154,
    rating: 4.8,
    isSeasonal: true
  },
  {
    id: "p2",
    name: "Bưởi Da Xanh Ruột Hồng",
    slug: "buoi-da-xanh",
    categorySlug: "trai-cay",
    categoryName: "Trái cây tươi ngon",
    description: "Bưởi da xanh Bến Tre vỏ mỏng, múi căng mọng, tép bưởi màu hồng tự nhiên, vị ngọt thanh mát đậm đà. Đạt chuẩn chứng nhận VietGAP an toàn tuyệt đối.",
    farmer: {
      name: "HTX Bưởi Da Xanh",
      region: "Vĩnh Long",
      rating: 4.6,
      address: "Bình Minh, Vĩnh Long",
      story: "Hợp tác xã quy tụ 50 hộ gia đình trồng bưởi truyền thống với tiêu chuẩn sinh học sạch."
    },
    images: [
      "https://images.unsplash.com/photo-1557161189-ce564ad72591?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Trái 1.2 - 1.5kg", price: 65000, comparePrice: 85000 },
      { id: "v2", unit: "Thùng 6 trái", price: 360000, comparePrice: 420000 }
    ],
    badge: "VietGAP",
    soldCount: 42,
    rating: 4.6,
    isSeasonal: true
  },
  {
    id: "p3",
    name: "Dưa Lưới Mật Hữu Cơ",
    slug: "dua-luoi-mat",
    categorySlug: "trai-cay",
    categoryName: "Trái cây tươi ngon",
    description: "Dưa lưới mật trồng trong nhà màng công nghệ cao tại Đà Lạt. Ruột màu cam đậm, vị ngọt lịm như mật, giòn thơm nức mũi.",
    farmer: {
      name: "Nông Trại Xanh Đà Lạt",
      region: "Lâm Đồng",
      rating: 4.9,
      address: "Đơn Dương, Lâm Đồng",
      story: "Nông trại ứng dụng công nghệ tưới nhỏ giọt Israel và phân bón vi sinh hữu cơ 100%."
    },
    images: [
      "https://images.unsplash.com/photo-1598468305048-fb2ce57bc6ff?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Trái 1.5kg", price: 99000, comparePrice: 120000 }
    ],
    badge: "Hữu cơ",
    soldCount: 89,
    rating: 4.9,
    isSeasonal: true
  },
  {
    id: "p4",
    name: "Xoài Cát Hòa Lộc",
    slug: "xoai-cat-hoa-loc",
    categorySlug: "trai-cay",
    categoryName: "Trái cây tươi ngon",
    description: "Xoài cát Hòa Lộc Đồng Tháp loại 1 quả thon dài, vỏ vàng tươi khi chín, thịt quả dẻo mịn không xơ, hương thơm ngào ngạt.",
    farmer: {
      name: "Vườn Xoài Ông Năm",
      region: "Đồng Tháp",
      rating: 4.7,
      address: "Cao Lãnh, Đồng Tháp",
      story: "Truyền thống 3 đời canh tác giống xoài quý trên đất phù sa sông Tiền."
    },
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "1kg (2-3 trái)", price: 120000, comparePrice: 150000 }
    ],
    badge: "Mới về",
    soldCount: 20,
    rating: 4.7,
    isSeasonal: true
  },
  {
    id: "f1",
    name: "Dâu Tây Đà Lạt Cấp Đông",
    slug: "dau-tay",
    categorySlug: "trai-cay",
    categoryName: "Trái cây tươi ngon",
    description: "Dâu tây giống New Zealand quả đỏ tươi, vị chua ngọt hài hòa tự nhiên. Thu hoạch sáng sớm và cấp đông nhanh chuẩn IQF giữ trọn dinh dưỡng.",
    farmer: {
      name: "Nông Trại Xanh Đà Lạt",
      region: "Đà Lạt",
      rating: 4.9,
      address: "Lâm Đồng",
      story: "Canh tác giá thể xơ dừa treo cao, không tiếp xúc đất, sạch tuyệt đối."
    },
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Hộp 500g", price: 120000, comparePrice: 140000 },
      { id: "v2", unit: "Hộp 1kg", price: 220000, comparePrice: 260000 }
    ],
    soldCount: 200,
    rating: 4.9,
    isSeasonal: true
  },
  {
    id: "f2",
    name: "Nho Mẫu Đơn Shine Muscat",
    slug: "nho-mau-don",
    categorySlug: "trai-cay",
    categoryName: "Trái cây tươi ngon",
    description: "Nho mẫu đơn quả to tròn, vỏ mỏng không hạt, vị ngọt đậm thơm mùi xoài sữa quý tộc.",
    farmer: {
      name: "GreenFood Global",
      region: "Nhập khẩu",
      rating: 4.9,
      story: "Kiểm nghiệm chất lượng nghiêm ngặt từng chùm trước khi đóng gói."
    },
    images: [
      "https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Chùm 600g", price: 450000, comparePrice: 500000 }
    ],
    badge: "Cao cấp",
    soldCount: 15,
    rating: 4.9
  },
  {
    id: "f3",
    name: "Cam Sành Mọng Nước",
    slug: "cam-sanh",
    categorySlug: "di-cho-online",
    categoryName: "Đi chợ online",
    description: "Cam sành Vĩnh Long vỏ sần mọng nước, tép vàng ươm, vắt nước uống giải nhiệt và tăng sức đề kháng mỗi ngày.",
    farmer: {
      name: "Miệt Vườn Miền Tây",
      region: "Vĩnh Long",
      rating: 4.5,
      story: "Vườn cam phù sa bồi đắp quanh năm cho trái mọng nước tự nhiên."
    },
    images: [
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "1kg (3-4 trái)", price: 35000, comparePrice: 45000 }
    ],
    soldCount: 450,
    rating: 4.5
  },
  {
    id: "f4",
    name: "Chuối Laba Trứ Danh",
    slug: "chuoi-laba",
    categorySlug: "di-cho-online",
    categoryName: "Đi chợ online",
    description: "Chuối Laba Đà Lạt dẻo thơm, ruột vàng ánh kim, vị ngọt đậm đà đặc trưng từng dâng vua ngày xưa.",
    farmer: {
      name: "Laba Farm",
      region: "Lâm Đồng",
      rating: 4.8,
      story: "Giống chuối cổ truyền thống vùng đất đỏ bazan Lâm Đồng."
    },
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Nải (1.2-1.5kg)", price: 45000, comparePrice: 55000 }
    ],
    soldCount: 120,
    rating: 4.8
  },
  {
    id: "t1",
    name: "Cà Phê Robusta Mộc Châu",
    slug: "ca-phe-robusta",
    categorySlug: "tra-ca-phe",
    categoryName: "Trà - Cà phê - Socola",
    description: "Cà phê nguyên chất rang mộc hương vị đậm đà, vị đắng thanh quyến rũ, thu hoạch từ cao nguyên Mộc Châu.",
    farmer: {
      name: "Trang Trại Mộc Châu",
      region: "Sơn La",
      rating: 4.7,
      story: "Cà phê trồng ở độ cao trên 1000m cho hương thơm tinh khiết."
    },
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Gói 500g (Hạt)", price: 100000, comparePrice: 120000 },
      { id: "v2", unit: "Gói 500g (Bột)", price: 100000, comparePrice: 120000 }
    ],
    badge: "Rang mộc",
    soldCount: 85,
    rating: 4.7
  },
  {
    id: "t2",
    name: "Chè Thái Nguyên Tân Cương",
    slug: "che-thai-nguyen",
    categorySlug: "tra-ca-phe",
    categoryName: "Trà - Cà phê - Socola",
    description: "Trà nõn tôm Tân Cương cánh xoăn hương cốm nồng nàn, nước xanh ánh vàng, hậu ngọt sâu lắng chuẩn vị.",
    farmer: {
      name: "HTX Chè Thái Nguyên",
      region: "Thái Nguyên",
      rating: 4.6,
      story: "Búp chè hái tay 1 tôm 2 lá lúc sáng sớm giữ trọn hương sương mai."
    },
    images: [
      "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Gói 200g", price: 95000, comparePrice: 110000 }
    ],
    badge: "Thượng hạng",
    soldCount: 95,
    rating: 4.6
  },
  {
    id: "d1",
    name: "Mật Ong Rừng Tràm U Minh",
    slug: "mat-ong-rung-tram",
    categorySlug: "dac-san",
    categoryName: "Đặc sản vùng miền",
    description: "Mật ong hoa tràm nguyên chất 100% thu hoạch tự nhiên từ rừng tràm U Minh Cà Mau, màu vàng óng, thơm nồng dịu.",
    farmer: {
      name: "Vườn Trái Cây Chú Ba",
      region: "Cà Mau",
      rating: 4.9,
      story: "Người gác kèo ong rừng U Minh kinh nghiệm trên 30 năm khai thác bền vững."
    },
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Chai 500ml", price: 180000, comparePrice: 210000 },
      { id: "v2", unit: "Chai 1 Lít", price: 340000, comparePrice: 390000 }
    ],
    badge: "Rừng 100%",
    soldCount: 160,
    rating: 4.9
  },
  {
    id: "a1",
    name: "Rau Hữu Cơ Tổng Hợp Đà Lạt",
    slug: "rau-huu-co-tong-hop",
    categorySlug: "agrishow",
    categoryName: "Agrishow Triển Lãm",
    description: "Combo 5 loại rau củ hữu cơ Đà Lạt: Xà lách lolo, cải kale, cà chua bi cherry, cà rốt baby, ớt chuông ngọt.",
    farmer: {
      name: "Nông Trại Xanh Đà Lạt",
      region: "Lâm Đồng",
      rating: 4.9,
      story: "Canh tác hữu cơ chuẩn quốc tế được trưng bày tại hội chợ Agrishow 2026."
    },
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop"
    ],
    variants: [
      { id: "v1", unit: "Combo 2kg (5 loại rau)", price: 85000, comparePrice: 100000 }
    ],
    badge: "Organic",
    soldCount: 65,
    rating: 4.9
  }
];

export function getProductsByCategory(slug: string): ProductItem[] {
  // If "di-cho-online", return all fresh items or products matching
  if (slug === 'di-cho-online') {
    return ALL_PRODUCTS;
  }
  return ALL_PRODUCTS.filter(p => p.categorySlug === slug);
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  return ALL_PRODUCTS.find(p => p.slug === slug);
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}
