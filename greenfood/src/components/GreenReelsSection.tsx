"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  X, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Star, 
  CheckCircle2, 
  ExternalLink,
  MapPin,
  Heart
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

export interface ReelProduct {
  id: string;
  name: string;
  slug: string;
  origin: string;
  farmer: string;
  price: number;
  comparePrice: number;
  unit: string;
  variantId: string;
  image: string;
  rating: number;
  reviewsCount: number;
  badge: string;
  descSnippet: string;
}

export interface ReelItem {
  id: string;
  videoSrc: string;
  poster: string;
  reviewerName: string;
  reviewerHandle: string;
  reviewerRole: string;
  avatar: string;
  title: string;
  caption: string;
  views: string;
  likes: string;
  product: ReelProduct;
}

export const GREEN_REELS: ReelItem[] = [
  {
    id: 'reel-durian',
    videoSrc: '/videos/tiktok-1.mp4',
    poster: '/videos/reels-durian.jpg',
    reviewerName: 'Mỹ Duyên',
    reviewerHandle: '@myduyen.farm',
    reviewerRole: 'Reviewer Nông Sản Bến Tre',
    avatar: '/videos/reels-durian.jpg',
    title: 'Khui Sầu Riêng Ri6 Chín Cây Vườn Chú Ba',
    caption: 'Cơm vàng hạt lép, béo ngậy ngọt lịm bao ăn từng múi tại Chợ Lách Bến Tre!',
    views: '142.8K',
    likes: '14.2K',
    product: {
      id: 'p1',
      name: 'Sầu Riêng Ri6 Hạt Lép',
      slug: 'sau-rieng-ri6',
      origin: 'Chợ Lách, Bến Tre',
      farmer: 'Vườn Trái Cây Chú Ba',
      price: 150000,
      comparePrice: 190000,
      unit: 'Tách vỏ (Hộp 500g)',
      variantId: 'v1',
      image: '/products/sau-rieng-ri6.jpg',
      rating: 4.8,
      reviewsCount: 154,
      badge: 'Chín cây tự nhiên',
      descSnippet: 'Cơm vàng rực, múi ráo hạt lép, độ ngọt béo ngậy chuẩn nông trại VietGAP.'
    }
  },
  {
    id: 'reel-strawberry',
    videoSrc: '/videos/tiktok-2.mp4',
    poster: '/videos/reels-strawberry.jpg',
    reviewerName: 'Phương Thảo',
    reviewerHandle: '@phuongthao.dalat',
    reviewerRole: 'Vlogger Vườn Dâu Đà Lạt',
    avatar: '/videos/reels-strawberry.jpg',
    title: 'Hái Dâu Tây Giống Nhật Trên Giàn Treo',
    caption: 'Dâu tây đỏ mọng hái sáng sớm tại farm Đà Lạt, vị chua ngọt thanh mát cực thơm!',
    views: '98.5K',
    likes: '10.6K',
    product: {
      id: 'f1',
      name: 'Dâu Tây Đà Lạt Cấp Đông',
      slug: 'dau-tay',
      origin: 'Đà Lạt, Lâm Đồng',
      farmer: 'Nông Trại Xanh Đà Lạt',
      price: 120000,
      comparePrice: 140000,
      unit: 'Hộp 500g',
      variantId: 'v1',
      image: '/products/dau-tay.jpg',
      rating: 4.9,
      reviewsCount: 200,
      badge: 'Công nghệ cao IQF',
      descSnippet: 'Dâu quả đỏ mọng, vị ngọt thanh tự nhiên, thu hoạch tại vườn treo sạch 100%.'
    }
  },
  {
    id: 'reel-banana',
    videoSrc: '/videos/tiktok-3.mp4',
    poster: '/videos/reels-banana.jpg',
    reviewerName: 'Thu Hà',
    reviewerHandle: '@thuha.farmstay',
    reviewerRole: 'Reviewer Sinh Thái Đà Lạt',
    avatar: '/videos/reels-banana.jpg',
    title: 'Thử Chuối Laba Thượng Hạng Tiến Vua',
    caption: 'Chuối Laba dẻo thơm, ruột vàng ánh kim ngọt ngào từ đất đỏ bazan Lâm Đồng.',
    views: '86.4K',
    likes: '8.9K',
    product: {
      id: 'f4',
      name: 'Chuối Laba Trứ Danh',
      slug: 'chuoi-laba',
      origin: 'Lâm Đồng',
      farmer: 'Laba Farm',
      price: 45000,
      comparePrice: 55000,
      unit: 'Nải (1.2-1.5kg)',
      variantId: 'v1',
      image: '/products/chuoi-laba.jpg',
      rating: 4.8,
      reviewsCount: 120,
      badge: 'Đặc sản dâng vua',
      descSnippet: 'Chuối Laba ruột vàng ánh kim, dẻo thơm nức mũi, giàu kali và vitamin tự nhiên.'
    }
  },
  {
    id: 'reel-pomelo',
    videoSrc: '/videos/tiktok-1.mp4',
    poster: '/videos/reels-pomelo.jpg',
    reviewerName: 'Thanh Trúc',
    reviewerHandle: '@thanhtruc.mientay',
    reviewerRole: 'Reviewer Miệt Vườn Nam Bộ',
    avatar: '/videos/reels-pomelo.jpg',
    title: 'Bóc Bưởi Da Xanh Ruột Hồng Mọng Nước',
    caption: 'Tép bưởi hồng ngọc óng ánh, vị ngọt thanh mát đậm đà ăn tới đâu mát tới đó.',
    views: '118.2K',
    likes: '12.8K',
    product: {
      id: 'p2',
      name: 'Bưởi Da Xanh Ruột Hồng',
      slug: 'buoi-da-xanh',
      origin: 'Bến Tre / Vĩnh Long',
      farmer: 'HTX Bưởi Da Xanh',
      price: 65000,
      comparePrice: 85000,
      unit: 'Trái 1.2 - 1.5kg',
      variantId: 'v1',
      image: '/products/buoi-da-xanh.jpg',
      rating: 4.6,
      reviewsCount: 42,
      badge: 'VietGAP Bến Tre',
      descSnippet: 'Vỏ mỏng múi căng, tép màu hồng ngọc mọng nước, vị ngọt thanh không the đắng.'
    }
  },
  {
    id: 'reel-grape',
    videoSrc: '/videos/tiktok-2.mp4',
    poster: '/videos/reels-grape.jpg',
    reviewerName: 'Khánh Vy',
    reviewerHandle: '@khanhvy.greeneats',
    reviewerRole: 'Healthy Food Influencer',
    avatar: '/videos/reels-grape.jpg',
    title: 'Thưởng Thức Nho Mẫu Đơn Shine Muscat',
    caption: 'Trái tròn bóng bẩy, vị ngọt thơm mùi xoài sữa quý tộc, giòn ngọt tan trong miệng!',
    views: '156.4K',
    likes: '18.2K',
    product: {
      id: 'f2',
      name: 'Nho Mẫu Đơn Shine Muscat',
      slug: 'nho-mau-don',
      origin: 'Nhập khẩu cao cấp',
      farmer: 'GreenFood Global',
      price: 450000,
      comparePrice: 500000,
      unit: 'Chùm 600g',
      variantId: 'v1',
      image: '/products/nho-mau-don.jpg',
      rating: 4.9,
      reviewsCount: 38,
      badge: 'Thượng hạng VIP',
      descSnippet: 'Quả to tròn vỏ mỏng không hạt, vị ngọt ngào thoang thoảng hương thơm quý phái.'
    }
  },
  {
    id: 'reel-melon',
    videoSrc: '/videos/tiktok-3.mp4',
    poster: '/videos/reels-melon.jpg',
    reviewerName: 'Ngọc Lan',
    reviewerHandle: '@ngoclan.organic',
    reviewerRole: 'Chuyên Gia Nông Sản Sạch',
    avatar: '/videos/reels-melon.jpg',
    title: 'Bổ Dưa Lưới Mật Huỳnh Long Giòn Ngọt',
    caption: 'Thịt dưa cam đậm óng ánh, vị ngọt sắc như mật, giòn mát đỉnh chóp!',
    views: '94.7K',
    likes: '9.3K',
    product: {
      id: 'p3',
      name: 'Dưa Lưới Mật Hữu Cơ',
      slug: 'dua-luoi-mat',
      origin: 'Đà Lạt, Lâm Đồng',
      farmer: 'Nông Trại Xanh Đà Lạt',
      price: 99000,
      comparePrice: 120000,
      unit: 'Trái 1.5kg',
      variantId: 'v1',
      image: '/products/dua-luoi-mat.jpg',
      rating: 4.9,
      reviewsCount: 89,
      badge: 'Hữu cơ VietGAP',
      descSnippet: 'Ruột cam giòn ngọt lịm, trồng nhà màng tưới nhỏ giọt công nghệ Israel.'
    }
  }
];

export default function GreenReelsSection() {
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingModal, setIsPlayingModal] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});

  const trackRef = useRef<HTMLDivElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const { addItem } = useCartStore();

  // Scroll manually via buttons
  const handleScrollTrack = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleOpenModal = (index: number) => {
    setActiveReelIndex(index);
    setIsPlayingModal(true);
  };

  const handleCloseModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setActiveReelIndex(null);
  };

  const handleNextModalReel = () => {
    if (activeReelIndex === null) return;
    const next = (activeReelIndex + 1) % GREEN_REELS.length;
    setActiveReelIndex(next);
    setIsPlayingModal(true);
  };

  const handlePrevModalReel = () => {
    if (activeReelIndex === null) return;
    const prev = (activeReelIndex - 1 + GREEN_REELS.length) % GREEN_REELS.length;
    setActiveReelIndex(prev);
    setIsPlayingModal(true);
  };

  const toggleModalPlay = () => {
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play().then(() => setIsPlayingModal(true)).catch(() => {});
    } else {
      modalVideoRef.current.pause();
      setIsPlayingModal(false);
    }
  };

  const toggleModalMute = () => {
    if (!modalVideoRef.current) return;
    modalVideoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedReels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (e: React.MouseEvent, product: ReelProduct) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      variantId: product.variantId,
      unit: product.unit,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
      icon: '🌿',
      style: {
        borderRadius: '12px',
        background: '#064e3b',
        color: '#fff',
        fontSize: '13px',
        fontWeight: '500'
      }
    });
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeReelIndex === null) return;
      if (e.key === 'Escape') handleCloseModal();
      if (e.key === 'ArrowRight') handleNextModalReel();
      if (e.key === 'ArrowLeft') handlePrevModalReel();
      if (e.key === ' ') {
        e.preventDefault();
        toggleModalPlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex]);

  // Auto-slide gently to the left ticker (requestAnimationFrame)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!isPaused && track) {
        track.scrollLeft += 38 * delta; // 38px/second: gentle, elegant luxury gliding
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  // Current active reel in modal
  const activeReel = activeReelIndex !== null ? GREEN_REELS[activeReelIndex] : null;

  return (
    <section 
      id="greenreels" 
      className="container mx-auto px-4 lg:px-8 mt-7 relative z-10 reveal-on-scroll scroll-reactive-item"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 md:p-8 shadow-elevated-card relative overflow-hidden">
        {/* Glow hiệu ứng tinh tế phong cách Soopi Atelier */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-80 h-80 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />

        {/* ================= HEADER SECTION PHONG CÁCH SOOPI.SITE ================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 relative z-10 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                SOOPI & GREENFOOD · L’INSTANT FRAIS
              </span>
              <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Flame size={11} className="fill-white" /> Hot 6 Reels
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-2">
              GreenReels <span className="font-normal italic text-slate-600 font-serif">· Trải nghiệm thực tế</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
              Thước phim review chân thực từ các nữ reviewer tại nhà vườn VietGAP. Bấm vào từng clip để xem và mua ngay sản phẩm!
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {/* Nút cuộn trái phải */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => handleScrollTrack('left')}
                aria-label="Cuộn reels sang trái"
                className="w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleScrollTrack('right')}
                aria-label="Cuộn reels sang phải"
                className="w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <Link
              href="/product/sau-rieng-ri6#product-reviews"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 px-4 py-2 rounded-full transition-all shadow-sm hover:scale-105 active:scale-95"
            >
              <span>Tất cả đánh giá</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* ================= AUTO-SLIDE REELS TRACK (TRƯỢT NHẸ QUA BÊN TRÁI) ================= */}
        <div 
          className="relative overflow-hidden group/marquee"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Màn mờ 2 bên mép để chuyển động lướt mềm mại */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none hidden md:block" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none hidden md:block" />

          {/* Dải reels tự động trượt ngang qua bên trái vô tận (Infinite Marquee) */}
          <div 
            ref={trackRef}
            className="flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {/* Nhân đôi danh sách 6 clip để hiệu ứng cuộn liền mạch liên tục */}
            {[...GREEN_REELS, ...GREEN_REELS].map((reel, index) => {
              const actualIndex = index % GREEN_REELS.length;
              const isLiked = likedReels[reel.id] ?? false;

              return (
                <div
                  key={`${reel.id}-${index}`}
                  onClick={() => handleOpenModal(actualIndex)}
                  style={{ scrollSnapAlign: 'start' }}
                  className="w-[220px] sm:w-[250px] md:w-[270px] shrink-0 h-[400px] sm:h-[450px] md:h-[480px] rounded-3xl overflow-hidden relative cursor-pointer group/card border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-emerald-500/70 hover:-translate-y-1.5 transition-all duration-300 select-none bg-slate-900"
                >
                  {/* Ảnh cover 9:16 nữ reviewer sắc nét */}
                  <img
                    src={reel.poster}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out brightness-[0.92] group-hover/card:brightness-100"
                    loading="lazy"
                  />

                  {/* Gradient tối lớp phủ để văn bản luôn nổi bật rõ ràng */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/35 pointer-events-none" />

                  {/* Thanh trên: Huy hiệu Live / Hot & Nút thích */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Reels #{actualIndex + 1}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => toggleLike(e, reel.id)}
                      aria-label="Thích video"
                      className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                        isLiked 
                          ? 'bg-rose-500 text-white scale-110 shadow-md' 
                          : 'bg-black/40 text-white/90 hover:bg-black/60 hover:text-white'
                      }`}
                    >
                      <Heart size={15} className={isLiked ? 'fill-white' : ''} />
                    </button>
                  </div>

                  {/* Nút Play trung tâm (hiện rõ nét và hiệu ứng khi hover) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-600/90 group-hover/card:bg-emerald-500 text-white flex items-center justify-center shadow-xl group-hover/card:scale-115 transition-all duration-300 border-2 border-white/40">
                      <Play size={26} className="ml-1 fill-white" />
                    </div>
                  </div>

                  {/* Thanh dưới: Thông tin Nữ Reviewer + Sản phẩm đang review */}
                  <div className="absolute bottom-3 inset-x-3 z-10 flex flex-col gap-2">
                    {/* Tên reviewer & Caption */}
                    <div>
                      <div className="flex items-center gap-1.5 text-white drop-shadow">
                        <span className="text-xs sm:text-sm font-black truncate">{reel.reviewerName}</span>
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0 fill-emerald-400/20" />
                        <span className="text-[10px] text-white/70 truncate">({reel.reviewerRole.split(' ')[0]})</span>
                      </div>
                      <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5 font-medium leading-tight drop-shadow-sm">
                        {reel.title}
                      </p>
                    </div>

                    {/* Hộp sản phẩm nổi bật (Exact Product Shelf Preview) */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 border border-white/40 shadow-lg flex items-center gap-2 group-hover/card:border-emerald-400 transition-colors">
                      <img
                        src={reel.product.image}
                        alt={reel.product.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-slate-900 truncate leading-tight">
                          {reel.product.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[11px] font-extrabold text-rose-600">
                            {reel.product.price.toLocaleString('vi-VN')}₫
                          </span>
                          <span className="text-[9px] text-slate-400 line-through">
                            {reel.product.comparePrice.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover/card:scale-105 shadow-xs">
                        <ShoppingBag size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gợi ý trượt nhẹ */}
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 font-medium px-1">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-500" /> Tự động trượt nhẹ qua trái · Rê chuột để dừng lại
            </span>
            <span className="hidden sm:inline">
              Bấm vào từng video để xem clip & link mua sản phẩm chính xác
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          THEATER MODAL PLAYER & EXACT PRODUCT BUY LINK (PHONG CÁCH SOOPI.SITE)
          Khi khách hàng click vào xem, hiện video + link mua sản phẩm chính xác
          ========================================================================= */}
      {activeReel && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          {/* Nút đóng Modal */}
          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Đóng cửa sổ xem Reels"
            className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl"
          >
            <X size={22} />
          </button>

          {/* Nút chuyển Reels trước / sau trên Modal */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handlePrevModalReel(); }}
            aria-label="Reels trước"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center transition-all hover:scale-110 shadow-xl"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleNextModalReel(); }}
            aria-label="Reels sau"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center transition-all hover:scale-110 shadow-xl"
          >
            <ChevronRight size={24} />
          </button>

          {/* Modal Container: Bento 2 cột (Trái: Video 9:16 - Phải: Shelf mua sản phẩm chính xác) */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[92vh] bg-slate-950 rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-30"
          >
            {/* CỘT TRÁI: KHUNG VIDEO 9:16 */}
            <div className="relative w-full lg:w-[460px] h-[480px] sm:h-[540px] lg:h-[640px] bg-black flex items-center justify-center shrink-0">
              <video
                ref={modalVideoRef}
                src={activeReel.videoSrc}
                poster={activeReel.poster}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onPlay={() => setIsPlayingModal(true)}
                onPause={() => setIsPlayingModal(false)}
                className="w-full h-full object-cover cursor-pointer"
                onClick={toggleModalPlay}
              />

              {/* Lớp phủ điều khiển trên video */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  GreenReels #{activeReelIndex! + 1}
                </span>
                <span className="bg-black/50 backdrop-blur-md text-white/90 text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                  {activeReel.views} lượt xem
                </span>
              </div>

              {/* Nút điều khiển âm thanh & toàn màn hình */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleModalMute}
                  aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                  className="w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                >
                  {isMuted ? <VolumeX size={17} className="text-rose-400" /> : <Volume2 size={17} />}
                </button>
              </div>

              {/* Nút Play to ở giữa khi đang Pause */}
              {!isPlayingModal && (
                <div 
                  onClick={toggleModalPlay}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl scale-110">
                    <Play size={36} className="ml-1 fill-white" />
                  </div>
                </div>
              )}

              {/* Thông tin reviewer & caption nằm dưới video */}
              <div className="absolute bottom-4 inset-x-4 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-6 rounded-b-2xl pointer-events-none">
                <div className="flex items-center gap-2 text-white">
                  <img
                    src={activeReel.avatar}
                    alt={activeReel.reviewerName}
                    className="w-9 h-9 rounded-full object-cover border border-emerald-400 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white">{activeReel.reviewerName}</span>
                      <CheckCircle2 size={14} className="text-emerald-400 fill-emerald-400/20" />
                      <span className="text-xs text-emerald-300 font-semibold">{activeReel.reviewerHandle}</span>
                    </div>
                    <span className="text-[11px] text-slate-300 font-medium">{activeReel.reviewerRole}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-200 mt-2 font-medium line-clamp-2 leading-relaxed">
                  {activeReel.caption}
                </p>
              </div>
            </div>

            {/* CỘT PHẢI: SHELF SẢN PHẨM CHÍNH XÁC (INSPIRED BY SOOPI.SITE /LIVESTREAM PRODUCT SHELF) */}
            <div className="flex-1 bg-white p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Tiêu đề Shelf */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      GỢI Ý TỪ VIDEO REVIEW
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 font-serif">
                      Chọn nông sản ngay khi xem
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Sản phẩm chính hãng
                  </span>
                </div>

                {/* Card sản phẩm chính xác đang review */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-500/50 transition-colors">
                  <div className="flex gap-4">
                    <img
                      src={activeReel.product.image}
                      alt={activeReel.product.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            {activeReel.product.badge}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={12} className="text-emerald-600" />
                            {activeReel.product.origin}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                          {activeReel.product.name}
                        </h4>

                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Nhà vườn: <span className="text-slate-800 font-bold">{activeReel.product.farmer}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={13} className="fill-amber-400" />
                          <span className="text-xs font-bold text-slate-800">{activeReel.product.rating}</span>
                        </div>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">({activeReel.product.reviewsCount} đánh giá)</span>
                      </div>
                    </div>
                  </div>

                  {/* Giá & Ưu đãi */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Quy cách: {activeReel.product.unit}</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
                          {activeReel.product.price.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-xs sm:text-sm text-slate-400 line-through">
                          {activeReel.product.comparePrice.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          -{(Math.round((1 - activeReel.product.price / activeReel.product.comparePrice) * 100))}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60">
                    {activeReel.product.descSnippet}
                  </p>
                </div>

                {/* Danh sách 5 video khác để tiện chuyển đổi trực tiếp */}
                <div className="mt-5">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Các clip review nông sản khác:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {GREEN_REELS.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { setActiveReelIndex(idx); setIsPlayingModal(true); }}
                        className={`w-16 h-20 rounded-xl overflow-hidden shrink-0 relative border-2 transition-all ${
                          idx === activeReelIndex 
                            ? 'border-emerald-600 scale-105 shadow-md' 
                            : 'border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white font-bold text-center py-0.5 truncate px-1">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CÁC NÚT HÀNH ĐỘNG MUA HÀNG CHÍNH XÁC */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                {/* Nút thêm giỏ hàng nhanh */}
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, activeReel.product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl border border-emerald-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag size={16} className="text-emerald-700" />
                  <span>Thêm vào giỏ hàng</span>
                </button>

                {/* NÚT LINK MUA SẢN PHẨM CHÍNH XÁC (DẪN ĐẾN TRANG CHI TIẾT SẢN PHẨM) */}
                <Link
                  href={`/product/${activeReel.product.slug}`}
                  onClick={handleCloseModal}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-lg shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Xem chi tiết & Mua ngay</span>
                  <ExternalLink size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
