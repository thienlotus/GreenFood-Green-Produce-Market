"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Star, Video, Image as ImageIcon, ThumbsUp, ShieldCheck,
  CheckCircle, MessageSquare, Filter, Play, Sparkles, ChevronRight,
  PenLine, Gift, Award
} from 'lucide-react';
import { ProductReviewItem, ReviewStats, ReviewFilterTab } from '@/types/review';
import { getProductReviews, likeProductReviewApi } from '@/lib/api';
import ShopeeMediaTheaterModal, { TheaterMediaItem } from './ShopeeMediaTheaterModal';
import WriteReviewModal from './WriteReviewModal';
import ShopeeVideoReelsBar from './ShopeeVideoReelsBar';
import { toast } from 'react-hot-toast';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productUnit: string;
  productImage: string;
  variants: { id: string; unit: string }[];
}

export default function ProductReviewsSection({
  productId,
  productName,
  productSlug,
  productPrice,
  productUnit,
  productImage,
  variants
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    avgRating: 5.0,
    starsCount: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    hasMediaCount: 0,
    hasVideoCount: 0,
    hasCommentCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReviewFilterTab>('all');
  const [activeInlineVideoId, setActiveInlineVideoId] = useState<string | number | null>(null);

  // Modals state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [theaterInitialIndex, setTheaterInitialIndex] = useState(0);

  // Local likes tracking
  const [likedReviewsMap, setLikedReviewsMap] = useState<Record<string | number, boolean>>({});

  // 1. Load reviews from API / mock helper
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getProductReviews(productId);
        if (res) {
          setReviews(res.reviews);
          setStats(res.stats);
        }
      } catch (err) {
        console.warn('Failed to load reviews:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (productId) {
      load();
    }
  }, [productId]);

  // 2. Build flat list of all media items for the Theater Modal
  const allMediaList: TheaterMediaItem[] = useMemo(() => {
    const list: TheaterMediaItem[] = [];
    reviews.forEach((r) => {
      // Add video first if exists
      if (r.videoUrl) {
        list.push({
          id: `vid-${r.id}`,
          type: 'video',
          url: r.videoUrl,
          thumbnail: r.videoThumbnail || r.images[0],
          duration: r.videoDuration || '0:20',
          review: r
        });
      }
      // Add images
      if (r.images && r.images.length > 0) {
        r.images.forEach((imgUrl, idx) => {
          list.push({
            id: `img-${r.id}-${idx}`,
            type: 'image',
            url: imgUrl,
            review: r
          });
        });
      }
    });
    return list;
  }, [reviews]);

  // 3. Filter reviews based on active tab
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (activeTab === 'all') return true;
      if (activeTab === '5') return r.rating === 5;
      if (activeTab === '4') return r.rating === 4;
      if (activeTab === '3') return r.rating === 3;
      if (activeTab === '2') return r.rating === 2;
      if (activeTab === '1') return r.rating === 1;
      if (activeTab === 'has_video') return !!r.videoUrl;
      if (activeTab === 'has_media') return !!r.videoUrl || (r.images && r.images.length > 0);
      if (activeTab === 'has_comment') return !!r.comment && r.comment.trim().length > 0;
      return true;
    });
  }, [reviews, activeTab]);

  const handleOpenTheater = (index: number) => {
    setTheaterInitialIndex(index);
    setIsTheaterOpen(true);
  };

  const handleOpenTheaterForReview = (rev: ProductReviewItem, type: 'video' | 'image' = 'video') => {
    const idx = allMediaList.findIndex(m => m.review.id === rev.id && m.type === type);
    if (idx >= 0) {
      handleOpenTheater(idx);
    } else {
      const fallbackIdx = allMediaList.findIndex(m => m.review.id === rev.id);
      if (fallbackIdx >= 0) handleOpenTheater(fallbackIdx);
    }
  };

  const handleLikeReview = async (reviewId: string | number) => {
    const isCurrentlyLiked = likedReviewsMap[reviewId];
    setLikedReviewsMap(prev => ({ ...prev, [reviewId]: !isCurrentlyLiked }));
    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            likesCount: r.likesCount + (isCurrentlyLiked ? -1 : 1),
            isLiked: !isCurrentlyLiked
          };
        }
        return r;
      })
    );
    await likeProductReviewApi(reviewId);
    toast.success(isCurrentlyLiked ? 'Đã bỏ thích đánh giá' : 'Đã ghi nhận đánh giá hữu ích 👍');
  };

  const handleReviewSubmitted = (newReview: ProductReviewItem) => {
    setReviews(prev => [newReview, ...prev]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      hasMediaCount: prev.hasMediaCount + (newReview.videoUrl || newReview.images.length > 0 ? 1 : 0),
      hasVideoCount: prev.hasVideoCount + (newReview.videoUrl ? 1 : 0),
      starsCount: {
        ...prev.starsCount,
        [newReview.rating]: (prev.starsCount[newReview.rating as keyof typeof prev.starsCount] || 0) + 1
      }
    }));
  };

  return (
    <section className="mt-14 pt-10 border-t border-emerald-900/10" id="product-reviews">
      {/* 1. Shopee Video Reels Bar (Shorts Showcase) */}
      <ShopeeVideoReelsBar
        reviews={reviews}
        onOpenTheater={handleOpenTheater}
        mediaList={allMediaList}
      />

      {/* Main Reviews Container */}
      <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-elevated-card border border-emerald-900/10">
        
        {/* Tiêu đề & Nút Viết Đánh Giá */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
              <span>ĐÁNH GIÁ SẢN PHẨM</span>
              <span className="text-emerald-700 bg-emerald-100 text-xs px-2.5 py-1 rounded-full font-bold">
                Shopee Verified
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Phản hồi thực tế từ khách hàng đã mua và trải nghiệm nông sản
            </p>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <PenLine size={16} />
            <span>Viết Đánh Giá</span>
            <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-black">
              +200 Xu
            </span>
          </button>
        </div>

        {/* 2. Shopee Rating Overview Box (Hộp Thống Kê Điểm Số & Bộ Lọc Shopee) */}
        <div className="bg-emerald-50/50 rounded-3xl p-6 lg:p-8 border border-emerald-100/80 mb-8 flex flex-col lg:flex-row items-center gap-8">
          {/* Cột trái: Điểm số trung bình */}
          <div className="text-center lg:text-left shrink-0">
            <div className="flex items-baseline justify-center lg:justify-start gap-1">
              <span className="text-5xl font-black text-emerald-700">
                {stats.avgRating || 4.9}
              </span>
              <span className="text-lg text-emerald-800/60 font-bold">trên 5</span>
            </div>

            <div className="flex items-center justify-center lg:justify-start text-amber-500 my-2 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Dựa trên <strong>{stats.total || reviews.length}</strong> lượt đánh giá
            </p>
          </div>

          {/* Cột phải: Bộ lọc Tabs phong cách Shopee */}
          <div className="flex-1 flex flex-wrap gap-2.5">
            {/* Tất cả */}
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              Tất Cả ({stats.total || reviews.length})
            </button>

            {/* 5 Sao */}
            <button
              onClick={() => setActiveTab('5')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === '5'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              5 Sao ({stats.starsCount[5]})
            </button>

            {/* 4 Sao */}
            <button
              onClick={() => setActiveTab('4')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === '4'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              4 Sao ({stats.starsCount[4]})
            </button>

            {/* 3 Sao */}
            <button
              onClick={() => setActiveTab('3')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === '3'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              3 Sao ({stats.starsCount[3]})
            </button>

            {/* 2 Sao */}
            <button
              onClick={() => setActiveTab('2')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === '2'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              2 Sao ({stats.starsCount[2]})
            </button>

            {/* 1 Sao */}
            <button
              onClick={() => setActiveTab('1')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === '1'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              1 Sao ({stats.starsCount[1]})
            </button>

            {/* Có Hình Ảnh / Video */}
            <button
              onClick={() => setActiveTab('has_media')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'has_media'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              <ImageIcon size={14} />
              <span>Có Hình Ảnh / Video ({stats.hasMediaCount})</span>
            </button>

            {/* ĐẶC BIỆT: CÓ VIDEO REVIEW (Nút Shopee Highlight) */}
            <button
              onClick={() => setActiveTab('has_video')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer flex items-center gap-1.5 shadow-sm ${
                activeTab === 'has_video'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white border-rose-500 shadow-rose-950/20'
                  : 'bg-gradient-to-r from-rose-50 to-amber-50 text-rose-700 border-rose-200 hover:border-rose-400'
              }`}
            >
              <Video size={14} className={activeTab === 'has_video' ? 'text-white' : 'text-rose-600'} />
              <span>Có Video Review ({stats.hasVideoCount})</span>
            </button>
          </div>
        </div>

        {/* 3. Dải Thumbnail Media Bar (Thư viện Video & Ảnh từ người mua) */}
        {allMediaList.length > 0 && (
          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Video size={14} className="text-emerald-600" />
              <span>Thư viện Video & Hình ảnh từ người mua ({allMediaList.length})</span>
            </h4>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {allMediaList.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenTheater(idx)}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-gray-100 hover:border-emerald-500 cursor-pointer group shadow-2xs transition-all hover:scale-105"
                >
                  <img
                    src={item.thumbnail || item.url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Overlay Play nếu là video */}
                  {item.type === 'video' && (
                    <>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-md">
                          <Play size={14} className="ml-0.5 fill-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded-sm">
                        {item.duration || '0:20'}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Danh sách các đánh giá chi tiết */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
              <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm font-medium">Chưa có đánh giá nào phù hợp với bộ lọc này.</p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-3 text-xs text-emerald-600 font-bold hover:underline"
              >
                Xem tất cả đánh giá
              </button>
            </div>
          ) : (
            filteredReviews.map((rev) => {
              const isInlineVideoActive = activeInlineVideoId === rev.id;
              return (
                <div
                  key={rev.id}
                  className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0"
                >
                  {/* Reviewer Header */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                      alt={rev.userName}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{rev.userName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                            <CheckCircle size={10} /> Đã mua tại GreenFood
                          </span>
                        )}
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-amber-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>

                      {/* Timestamp & Variant */}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                        <span>{rev.createdAt}</span>
                        {rev.variantInfo && (
                          <>
                            <span>|</span>
                            <span>Phân loại: <strong className="text-gray-600">{rev.variantInfo}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Structured Feedback (Chất lượng sản phẩm & Đúng với mô tả) */}
                  <div className="space-y-1 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-2xl mb-3 border border-gray-100">
                    {rev.productQuality && (
                      <p>
                        <span className="text-gray-400">Chất lượng sản phẩm:</span>{' '}
                        <strong className="text-gray-800">{rev.productQuality}</strong>
                      </p>
                    )}
                    {rev.matchDescription && (
                      <p>
                        <span className="text-gray-400">Đúng với mô tả:</span>{' '}
                        <strong className="text-gray-800">{rev.matchDescription}</strong>
                      </p>
                    )}
                  </div>

                  {/* Text Comment */}
                  <p className="text-sm text-gray-800 leading-relaxed mb-3 whitespace-pre-line">
                    {rev.comment}
                  </p>

                  {/* MEDIA DISPLAY (VIDEO & PHOTOS) */}
                  <div className="space-y-3 mb-4">
                    {/* Inline Video Player hoặc Thumbnail Video */}
                    {rev.videoUrl && (
                      <div>
                        {isInlineVideoActive ? (
                          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video max-w-lg shadow-lg border border-emerald-200">
                            <video
                              src={rev.videoUrl}
                              className="w-full h-full object-contain"
                              controls
                              autoPlay
                              playsInline
                            />
                            <button
                              onClick={() => setActiveInlineVideoId(null)}
                              className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white text-xs px-2.5 py-1 rounded-full cursor-pointer"
                            >
                              Thu nhỏ
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 flex-wrap">
                            {/* Nút Video Thumbnail to xem */}
                            <div
                              onClick={() => handleOpenTheaterForReview(rev, 'video')}
                              className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/80 hover:border-emerald-600 cursor-pointer group shadow-sm transition-transform hover:scale-105 shrink-0"
                            >
                              <img
                                src={rev.videoThumbnail || rev.images[0] || 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=600&auto=format&fit=crop'}
                                alt="Video preview"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play size={18} className="ml-0.5 fill-white" />
                                </div>
                              </div>
                              <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold">
                                {rev.videoDuration || '0:20'}
                              </span>
                            </div>

                            {/* Nút click xem inline tiện lợi */}
                            <button
                              onClick={() => setActiveInlineVideoId(rev.id)}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Play size={13} className="fill-emerald-700" />
                              <span>Phát video tại đây</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Photos list */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex gap-2.5 flex-wrap">
                        {rev.images.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => handleOpenTheaterForReview(rev, 'image')}
                            className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-500 cursor-pointer transition-all hover:scale-105 shrink-0 shadow-2xs"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Review Tags */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {rev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Phản hồi của Người Bán (Shopee Seller Reply) */}
                  {rev.sellerReply && (
                    <div className="bg-gray-50/90 border border-gray-200 rounded-2xl p-4 text-xs mt-3">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-1">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Phản hồi của Người Bán</span>
                        {rev.sellerReplyAt && (
                          <span className="text-[11px] text-gray-400 font-normal ml-auto">
                            {rev.sellerReplyAt}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed italic">
                        &ldquo;{rev.sellerReply}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Lượt thích hữu ích */}
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => handleLikeReview(rev.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer ${
                        likedReviewsMap[rev.id] || rev.isLiked
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp size={13} className={likedReviewsMap[rev.id] || rev.isLiked ? 'fill-rose-600' : ''} />
                      <span>Hữu ích ({rev.likesCount})</span>
                    </button>

                    <button
                      onClick={() => toast.success('Cảm ơn bạn! Báo cáo đã được gửi tới ban quản trị.')}
                      className="text-xs text-gray-400 hover:text-gray-600 hover:underline cursor-pointer"
                    >
                      Báo cáo
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Shopee Media Theater Modal (Xem video/ảnh to có điều khiển & chuyển tiếp) */}
      <ShopeeMediaTheaterModal
        isOpen={isTheaterOpen}
        onClose={() => setIsTheaterOpen(false)}
        mediaList={allMediaList}
        initialIndex={theaterInitialIndex}
        productInfo={{
          id: productId,
          name: productName,
          slug: productSlug,
          price: productPrice,
          unit: productUnit,
          image: productImage
        }}
        onLikeReview={handleLikeReview}
      />

      {/* Modal Viết Đánh Giá Kèm Video */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        productId={productId}
        productName={productName}
        variants={variants}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </section>
  );
}
