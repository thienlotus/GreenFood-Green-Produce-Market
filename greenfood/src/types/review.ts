export interface ProductReviewItem {
  id: string | number;
  productId: string;
  userId?: string | number;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  variantInfo?: string;
  productQuality?: string;
  matchDescription?: string;
  tasteExperience?: string;
  
  // Video review attributes (Shopee style)
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  videoDuration?: string | null;
  
  // Photos and tags
  images: string[];
  tags?: string[];
  
  // Interactions & seller feedback
  likesCount: number;
  isLiked?: boolean;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
  isVerifiedPurchase: boolean;
  isAnonymous: boolean;
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  avgRating: number;
  starsCount: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  hasMediaCount: number;
  hasVideoCount: number;
  hasCommentCount: number;
}

export type ReviewFilterTab = 'all' | '5' | '4' | '3' | '2' | '1' | 'has_media' | 'has_video' | 'has_comment';

export interface SubmitReviewPayload {
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  variantInfo?: string;
  productQuality?: string;
  matchDescription?: string;
  tasteExperience?: string;
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  videoDuration?: string | null;
  images?: string[];
  tags?: string[];
  isAnonymous?: boolean;
}
