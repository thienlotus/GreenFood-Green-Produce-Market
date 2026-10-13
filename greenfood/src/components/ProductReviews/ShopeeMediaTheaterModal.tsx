"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX,
  Maximize2, ThumbsUp, Star, CheckCircle, ShoppingBag, ShieldCheck,
  RotateCcw, Sparkles
} from 'lucide-react';
import { ProductReviewItem } from '@/types/review';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'react-hot-toast';

export interface TheaterMediaItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  thumbnail?: string;
  duration?: string;
  review: ProductReviewItem;
}

interface ShopeeMediaTheaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: TheaterMediaItem[];
  initialIndex?: number;
  productInfo: {
    id: string;
    name: string;
    slug: string;
    price: number;
    unit: string;
    variantId?: string;
    image: string;
  };
  onLikeReview?: (reviewId: string | number) => void;
}

export default function ShopeeMediaTheaterModal({
  isOpen,
  onClose,
  mediaList,
  initialIndex = 0,
  productInfo,
  onLikeReview
}: ShopeeMediaTheaterModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<string | number, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string | number, number>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentMedia = mediaList[currentIndex];

  // Khởi tạo lượt thích
  useEffect(() => {
    if (currentMedia?.review) {
      const r = currentMedia.review;
      if (likesCountMap[r.id] === undefined) {
        setLikesCountMap(prev => ({ ...prev, [r.id]: r.likesCount }));
      }
    }
  }, [currentMedia, likesCountMap]);

  // Điều khiển Video khi đổi slide
  useEffect(() => {
    if (!isOpen) return;

    if (currentMedia?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay policy: fallback to muted play
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      });
    }
  }, [currentIndex, isOpen, currentMedia]);

  // Phím tắt bàn phím
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === ' ' && currentMedia?.type === 'video') {
      e.preventDefault();
      togglePlay();
    }
  }, [isOpen, currentIndex, mediaList.length, currentMedia]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !currentMedia) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLike = () => {
    const revId = currentMedia.review.id;
    const isCurrentlyLiked = likedMap[revId];
    setLikedMap(prev => ({ ...prev, [revId]: !isCurrentlyLiked }));
    setLikesCountMap(prev => ({
      ...prev,
      [revId]: (prev[revId] || 0) + (isCurrentlyLiked ? -1 : 1)
    }));
    if (onLikeReview) onLikeReview(revId);
    toast.success(isCurrentlyLiked ? 'Đã bỏ thích đánh giá' : 'Cảm ơn bạn! Đã ghi nhận đánh giá hữu ích 👍');
  };

  const handleAddToCart = () => {
    addItem({
      id: productInfo.id,
      name: productInfo.name,
      slug: productInfo.slug,
      variantId: productInfo.variantId || 'v1',
      unit: productInfo.unit,
      price: productInfo.price,
      quantity: 1,
      image: productInfo.image
    });
    toast.success(`Đã thêm "${productInfo.name}" vào giỏ hàng!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200">
      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg"
        title="Đóng (Esc)"
      >
        <X size={22} />
      </button>

      {/* Container chính: 2 cột (Media Player bên trái, Review thông tin bên phải) */}
      <div 
        ref={containerRef}
        className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center overflow-hidden p-2 lg:p-6 gap-4"
      >
        {/* CỘT TRÁI: Media Viewer Stage (Shopee Video / Image) */}
        <div className="relative flex-1 w-full h-[55vh] lg:h-[85vh] bg-black/60 rounded-3xl overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl">
          {/* Nút Prev */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md cursor-pointer border border-white/15 hover:scale-105"
            title="Đánh giá trước đó (Mũi tên trái)"
          >
            <ChevronLeft size={26} />
          </button>

          {/* Nút Next */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md cursor-pointer border border-white/15 hover:scale-105"
            title="Đánh giá tiếp theo (Mũi tên phải)"
          >
            <ChevronRight size={26} />
          </button>

          {/* Vùng Media hiển thị */}
          <div className="relative w-full h-full flex items-center justify-center p-2">
            {currentMedia.type === 'video' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="max-h-full max-w-full rounded-2xl object-contain cursor-pointer shadow-2xl"
                  onClick={togglePlay}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                  autoPlay
                  loop
                />

                {/* Nút Play to đè giữa video khi Pause */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-20 h-20 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-2xl cursor-pointer"
                  >
                    <Play size={36} className="ml-1 fill-white" />
                  </button>
                )}

                {/* Custom Video Controls Bar chuẩn Shopee */}
                <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 rounded-2xl backdrop-blur-sm flex items-center gap-3 text-white text-xs">
                  <button 
                    onClick={togglePlay}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                    title={isPlaying ? 'Tạm dừng' : 'Phát'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
                  </button>

                  <button 
                    onClick={toggleMute}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                    title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                  >
                    {isMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} />}
                  </button>

                  <span className="font-mono text-gray-300 min-w-10">
                    {formatTime(currentTime)}
                  </span>

                  {/* Progress Timeline Scrubber */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />

                  <span className="font-mono text-gray-400 min-w-10">
                    {formatTime(duration)}
                  </span>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          videoRef.current.requestFullscreen();
                        }
                      }
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                    title="Toàn màn hình"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={currentMedia.url}
                alt="Ảnh review thực tế"
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl transition-all"
              />
            )}
          </div>

          {/* Dải ảnh nhỏ bên dưới (Thumbnail selector) */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shopee Video Review • {currentIndex + 1}/{mediaList.length}</span>
          </div>
        </div>

        {/* CỘT PHẢI: Reviewer Card & Thông Tin Đánh Giá (Shopee Style) */}
        <div className="w-full lg:w-[420px] h-[35vh] lg:h-[85vh] bg-white rounded-3xl p-5 lg:p-6 flex flex-col justify-between overflow-y-auto shadow-2xl border border-gray-100">
          <div>
            {/* Header: User Avatar & Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <img
                src={currentMedia.review.userAvatar || '/avatars/user-levuthien.jpg'}
                alt={currentMedia.review.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-gray-900 text-sm truncate">
                    {currentMedia.review.userName}
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <CheckCircle size={10} /> Đã mua hàng
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < currentMedia.review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                    />
                  ))}
                  <span className="text-[11px] text-gray-400 font-normal ml-1">
                    {currentMedia.review.createdAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Phân loại hàng */}
            {currentMedia.review.variantInfo && (
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                Phân loại hàng: <span className="text-gray-800 font-medium">{currentMedia.review.variantInfo}</span>
              </div>
            )}

            {/* Chi tiết tiêu chí đánh giá chuẩn Shopee */}
            <div className="mt-3 space-y-1.5 text-xs text-gray-700 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/60">
              {currentMedia.review.productQuality && (
                <p>
                  <strong className="text-emerald-900">Chất lượng sản phẩm:</strong> {currentMedia.review.productQuality}
                </p>
              )}
              {currentMedia.review.matchDescription && (
                <p>
                  <strong className="text-emerald-900">Đúng với mô tả:</strong> {currentMedia.review.matchDescription}
                </p>
              )}
              {currentMedia.review.tasteExperience && (
                <p>
                  <strong className="text-emerald-900">Trải nghiệm vị giác:</strong> {currentMedia.review.tasteExperience}
                </p>
              )}
            </div>

            {/* Nội dung bình luận */}
            <div className="mt-3 text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-line">
              {currentMedia.review.comment}
            </div>

            {/* Review Tags */}
            {currentMedia.review.tags && currentMedia.review.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentMedia.review.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Phản hồi của Người Bán (Shopee format) */}
            {currentMedia.review.sellerReply && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Phản hồi của Người Bán:</span>
                </div>
                <p className="text-gray-600 leading-relaxed italic">
                  &ldquo;{currentMedia.review.sellerReply}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions: Thích hữu ích & Mua nhanh sản phẩm */}
          <div className="pt-4 border-t border-gray-100 space-y-3 mt-4">
            {/* Lượt thích hữu ích */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  likedMap[currentMedia.review.id]
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp size={13} className={likedMap[currentMedia.review.id] ? 'fill-rose-600' : ''} />
                <span>Hữu ích ({likesCountMap[currentMedia.review.id] || currentMedia.review.likesCount})</span>
              </button>

              <span className="text-[11px] text-gray-400">
                Shopee Verified Review
              </span>
            </div>

            {/* Thẻ sản phẩm nổi (Shopee Video format - cho phép mua ngay trong video!) */}
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex items-center justify-between gap-3">
              <img
                src={productInfo.image}
                alt={productInfo.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-emerald-200"
              />
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-gray-900 text-xs truncate">{productInfo.name}</h5>
                <p className="text-emerald-700 font-black text-sm">
                  {productInfo.price.toLocaleString('vi-VN')}đ
                  <span className="text-[10px] text-gray-500 font-normal ml-1">/{productInfo.unit}</span>
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <ShoppingBag size={14} /> Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
