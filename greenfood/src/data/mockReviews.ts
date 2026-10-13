import { ProductReviewItem, ReviewStats } from '@/types/review';

export const DEFAULT_PRODUCT_REVIEWS: ProductReviewItem[] = [
  {
    id: 'rev-1',
    productId: 'sau-rieng-ri6',
    userName: 'Lê Vũ Thiên',
    userAvatar: '/avatars/user-levuthien.jpg',
    rating: 5,
    comment: 'Sản phẩm quá tuyệt vời luôn mọi người ơi! Nhận hàng mà bất ngờ vì độ tươi rói của nông sản, cùi dày hạt lép béo ngậy chuẩn chỉ. Đóng gói thùng xốp giữ nhiệt cẩn thận, có kèm đá khô. Sẽ ủng hộ shop dài dài!',
    variantInfo: 'Hộp 1kg (Cơm sầu riêng vàng ươm)',
    productQuality: 'Xuất sắc, chuẩn VietGAP tươi ngon',
    matchDescription: '100% đúng với mô tả từ nhà vườn',
    tasteExperience: 'Vị ngọt đậm đà, béo ngậy khó cưỡng',
    videoUrl: '/videos/reel-durian.mp4',
    videoThumbnail: '/videos/reel-durian-cover.jpg',
    videoDuration: '0:18',
    images: [
      '/products/sau-rieng-ri6.jpg',
      '/products/dau-tay.jpg'
    ],
    tags: ['Rau củ rất tươi', 'Đóng gói cẩn thận', 'Giao nhanh 2h', 'Đúng với mô tả'],
    likesCount: 48,
    sellerReply: 'GreenFood xin chân thành cảm ơn bạn Lê Vũ Thiên đã ủng hộ nhà vườn! Chúc bạn và gia đình thưởng thức thật ngon miệng ạ ❤️',
    sellerReplyAt: '2 ngày trước',
    isVerifiedPurchase: true,
    isAnonymous: false,
    createdAt: '2026-10-09 14:32'
  },
  {
    id: 'rev-2',
    productId: 'sau-rieng-ri6',
    userName: 'Lethieuhung12',
    userAvatar: '/avatars/user-lethieuhung.jpg',
    rating: 5,
    comment: 'Quay video unbox cho mọi người xem trực tiếp độ tươi luôn này! Cầm trái trên tay thơm lừng cả phòng, mở ra cơm vàng hạt lép đúng chuẩn loại 1. Mua online mà chất lượng xịn hơn cả mua ngoài sạp chợ.',
    variantInfo: 'Hộp 500g (Tuyển chọn cao cấp)',
    productQuality: 'Tươi mới thu hoạch trong ngày',
    matchDescription: 'Hình chụp thực tế thế nào giao y vậy',
    tasteExperience: 'Mềm mịn dẻo quánh, không bị sượng',
    videoUrl: '/videos/reel-chuoi-laba.mp4',
    videoThumbnail: '/videos/reel-chuoi-laba-cover.jpg',
    videoDuration: '0:26',
    images: [
      '/products/chuoi-laba.jpg'
    ],
    tags: ['Chuẩn VietGAP', 'Nhà vườn uy tín', 'Giao nhanh 2h'],
    likesCount: 32,
    sellerReply: 'Dạ GreenFood cảm ơn anh Hùng (Lethieuhung12) rất nhiều! Sự hài lòng của khách hàng là động lực lớn nhất của bà con nông dân ạ!',
    sellerReplyAt: '3 ngày trước',
    isVerifiedPurchase: true,
    isAnonymous: false,
    createdAt: '2026-10-08 09:15'
  },
  {
    id: 'rev-3',
    productId: 'sau-rieng-ri6',
    userName: 'levannam22',
    userAvatar: '/avatars/user-levannam.jpg',
    rating: 5,
    comment: 'Giao hỏa tốc đúng 90 phút là shipper tới cửa nhà rồi. Rau quả bọc màng thở chuyên dụng nên không hề bị dập hay úa tí nào. Đã test độ ngọt rất vừa ý, vote 5 sao và tiếp tục đặt cho gia đình.',
    variantInfo: 'Túi 2kg (Combo Tiết Kiệm)',
    productQuality: 'Tươi xanh mơn mởn, sạch sẽ',
    matchDescription: 'Chuẩn chỉ 100%',
    tasteExperience: 'Ngọt mát thanh khiết',
    videoUrl: '/videos/reel-pomelo.mp4',
    videoThumbnail: '/videos/reel-pomelo-cover.jpg',
    videoDuration: '0:32',
    images: [
      '/products/buoi-da-xanh.jpg'
    ],
    tags: ['Rau củ rất tươi', 'Đóng gói cẩn thận', 'Shipper thân thiện'],
    likesCount: 19,
    sellerReply: 'GreenFood xin cảm ơn anh Nam (levannam22)! Chúc anh và gia đình những bữa ăn tràn ngập dinh dưỡng và niềm vui!',
    sellerReplyAt: 'Hôm qua',
    isVerifiedPurchase: true,
    isAnonymous: false,
    createdAt: '2026-10-10 16:45'
  },
  {
    id: 'rev-4',
    productId: 'sau-rieng-ri6',
    userName: 'Nguyễn Thị Kim Thảo',
    userAvatar: '/avatars/user-kimthao.jpg',
    rating: 5,
    comment: 'Lần đầu mua nông sản online mà ưng bụng thế này. Trái cây tươi như vừa hái tại vườn Đà Lạt/Bến Tre vậy. Mua làm quà biếu bố mẹ ai cũng khen nức nở. Đóng hộp quà sang xịn mịn.',
    variantInfo: 'Hộp 1kg (Loại Đặc Biệt)',
    productQuality: 'Hàng tuyển chọn loại 1',
    matchDescription: 'Chính xác như quảng cáo',
    tasteExperience: 'Đậm đà hương vị quê hương',
    videoUrl: null,
    videoThumbnail: null,
    videoDuration: null,
    images: [
      '/products/sau-rieng-ri6.jpg'
    ],
    tags: ['Thích hợp làm quà biếu', 'Đóng gói sang trọng'],
    likesCount: 12,
    sellerReply: 'Cảm ơn chị Kim Thảo! GreenFood luôn nỗ lực để mang đến nông sản sạch tinh hoa nhất cho mâm cơm Việt ạ!',
    sellerReplyAt: '4 ngày trước',
    isVerifiedPurchase: true,
    isAnonymous: false,
    createdAt: '2026-10-07 11:20'
  },
  {
    id: 'rev-5',
    productId: 'sau-rieng-ri6',
    userName: 'Đặng Quỳnh Trang',
    userAvatar: '/avatars/user-quynhtrang.jpg',
    rating: 5,
    comment: 'Chất lượng rất ngon, ngọt thơm. Shipper giao tới đúng giờ, rau củ quả tươi roi rói. Đã giới thiệu cho cả hội chị em đồng nghiệp cùng công ty ủng hộ nhà vườn.',
    variantInfo: 'Gói tiêu chuẩn 1kg',
    productQuality: 'Ngon, tươi rói',
    matchDescription: 'Đúng miêu tả',
    tasteExperience: 'Rất vừa miệng',
    videoUrl: null,
    videoThumbnail: null,
    videoDuration: null,
    images: [
      '/products/dau-tay.jpg'
    ],
    tags: ['Rau củ rất tươi', 'Tư vấn nhiệt tình'],
    likesCount: 15,
    sellerReply: 'Dạ GreenFood cảm ơn bạn Quỳnh Trang rất nhiều! Sự hài lòng của bạn là động lực lớn nhất của bà con nông dân ạ ❤️',
    sellerReplyAt: '5 ngày trước',
    isVerifiedPurchase: true,
    isAnonymous: false,
    createdAt: '2026-10-06 18:02'
  }
];

export function calculateReviewStats(reviews: ProductReviewItem[]): ReviewStats {
  const total = reviews.length;
  const avgRating = total > 0 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
    : 5.0;

  const starsCount = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const hasMediaCount = reviews.filter(r => !!r.videoUrl || (r.images && r.images.length > 0)).length;
  const hasVideoCount = reviews.filter(r => !!r.videoUrl).length;
  const hasCommentCount = reviews.filter(r => !!r.comment && r.comment.trim().length > 0).length;

  return {
    total,
    avgRating,
    starsCount,
    hasMediaCount,
    hasVideoCount,
    hasCommentCount,
  };
}

const LOCAL_STORAGE_KEY_PREFIX = 'greenfood_reviews_';

export function getStoredUserReviews(productId: string): ProductReviewItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read reviews from localStorage:', err);
  }
  return [];
}

export function saveUserReviewToStorage(review: ProductReviewItem): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredUserReviews(review.productId);
    const updated = [review, ...list];
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${review.productId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save review to localStorage:', err);
  }
}

export function getCombinedReviews(productId: string, apiReviews?: ProductReviewItem[]): {
  reviews: ProductReviewItem[];
  stats: ReviewStats;
} {
  const stored = getStoredUserReviews(productId);
  
  let base: ProductReviewItem[] = [];
  if (apiReviews && apiReviews.length > 0) {
    base = apiReviews;
  } else {
    // Generate context-tailored mock reviews for the current product
    base = DEFAULT_PRODUCT_REVIEWS.map(r => ({
      ...r,
      productId: productId,
    }));
  }

  // Deduplicate and merge stored (user uploaded) at the front
  const map = new Map<string | number, ProductReviewItem>();
  stored.forEach(r => map.set(r.id, r));
  base.forEach(r => {
    if (!map.has(r.id)) {
      map.set(r.id, r);
    }
  });

  const list = Array.from(map.values());
  const stats = calculateReviewStats(list);
  return { reviews: list, stats };
}
