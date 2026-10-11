"use client";

import { useState } from 'react';
import { Play, Sparkles, ChevronRight, Video, Flame, Star, ShieldCheck } from 'lucide-react';
import { ProductReviewItem } from '@/types/review';
import { TheaterMediaItem } from './ShopeeMediaTheaterModal';

interface ShopeeVideoReelsBarProps {
  reviews: ProductReviewItem[];
  onOpenTheater: (mediaIndex: number) => void;
  mediaList: TheaterMediaItem[];
}

export default function ShopeeVideoReelsBar({
  reviews,
  onOpenTheater,
  mediaList
}: ShopeeVideoReelsBarProps) {
  // Lọc chỉ những đánh giá có Video
  const videoReviews = reviews.filter(r => !!r.videoUrl);

  if (videoReviews.length === 0) return null;

  return (
    <div className="mb-10 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl">
      {/* Background Glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-60 h-60 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
            <Video size={24} className="fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl lg:text-2xl font-black tracking-tight flex items-center gap-2">
                Shopee Video • Góc Nông Sản Thực Tế
              </h3>
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                <Flame size={10} className="fill-white" /> Hot
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Khách hàng mở hộp, nếm thử và chia sẻ video cảm nhận chân thực nhất
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const firstVideoIndex = mediaList.findIndex(m => m.type === 'video');
            if (firstVideoIndex >= 0) onOpenTheater(firstVideoIndex);
          }}
          className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer hover:scale-105"
        >
          <span>Xem tất cả video ({videoReviews.length})</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Video Reels Grid / Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        {videoReviews.slice(0, 4).map((rev, idx) => {
          const mediaIndex = mediaList.findIndex(m => m.review.id === rev.id && m.type === 'video');
          return (
            <div
              key={rev.id}
              onClick={() => {
                if (mediaIndex >= 0) onOpenTheater(mediaIndex);
              }}
              className="group relative bg-black/40 rounded-2xl overflow-hidden aspect-[9/14] border border-white/15 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-emerald-400"
            >
              {/* Thumbnail Image */}
              <img
                src={rev.videoThumbnail || rev.images[0] || 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=600&auto=format&fit=crop'}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 pointer-events-none" />

              {/* Duration Badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white border border-white/15 flex items-center gap-1">
                <Video size={10} className="text-emerald-400" />
                <span>{rev.videoDuration || '0:20'}</span>
              </div>

              {/* Center Play Button with hover pulse */}
              <div className="absolute inset-0 m-auto w-12 h-12 bg-white/20 group-hover:bg-emerald-500 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg border border-white/30">
                <Play size={20} className="ml-0.5 text-white fill-white transition-transform" />
              </div>

              {/* Bottom Info: User & Quote */}
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <img
                    src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                  />
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">
                    {rev.userName}
                  </span>
                  <div className="flex text-amber-400 text-[10px] ml-auto">
                    <Star size={11} className="fill-amber-400" />
                    <span className="ml-0.5 font-bold text-white">{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-200 line-clamp-2 leading-snug font-normal">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {rev.variantInfo && (
                  <span className="inline-block mt-1 text-[9px] text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30 truncate max-w-full">
                    {rev.variantInfo}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
