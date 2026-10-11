"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Video, Play, Flame, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { REVIEW_VIDEOS } from '@/components/ProductReviews/SimpleTikTokVideoSection';

export default function HomeVideoReviewsSection() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const handleTogglePlay = (id: string) => {
    const currentVideo = videoRefs.current[id];
    if (!currentVideo) return;

    if (playingId === id) {
      currentVideo.pause();
      setPlayingId(null);
    } else {
      // Dừng video khác
      Object.keys(videoRefs.current).forEach((key) => {
        const v = videoRefs.current[key];
        if (v && key !== id) v.pause();
      });

      currentVideo.play().then(() => {
        setPlayingId(id);
      }).catch((err) => {
        console.warn('Playback error:', err);
      });
    }
  };

  const handleToggleMute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const currentVideo = videoRefs.current[id];
    if (!currentVideo) return;
    const isMuted = !currentVideo.muted;
    currentVideo.muted = isMuted;
    setMutedMap(prev => ({ ...prev, [id]: isMuted }));
  };

  const handleFullscreen = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const currentVideo = videoRefs.current[id];
    if (!currentVideo) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      currentVideo.requestFullscreen();
    }
  };

  return (
    <section className="container mx-auto px-4 lg:px-8 mt-14 relative z-10 reveal-on-scroll">
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-emerald-900/10 text-gray-900 relative overflow-hidden shadow-elevated-card">
        {/* Vùng hào quang nhẹ nhàng */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-80 h-80 bg-teal-400/8 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header: Tiêu đề Reels */}
        <div className="flex items-center justify-between gap-4 mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase">
              Reels
            </h2>
            <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Flame size={13} className="fill-white" /> Hot
            </span>
          </div>

          <Link
            href="/product/sau-rieng-ri6#product-reviews"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-2xl transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
          >
            <Video size={16} />
            <span>Xem trang sản phẩm</span>
          </Link>
        </div>

        {/* Grid 3 Video HTML5 - Khung to lớn, nền trắng */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center relative z-10 w-full">
          {REVIEW_VIDEOS.map((item) => {
            const isPlaying = playingId === item.id;
            const isMuted = mutedMap[item.id] ?? false;

            return (
              <div
                key={item.id}
                className="w-full max-w-[420px] lg:max-w-[440px] bg-gray-50 rounded-3xl p-2.5 sm:p-3 border border-gray-200 shadow-md flex flex-col items-center hover:border-emerald-500 transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Khung video trực tiếp 9:16 to lớn */}
                <div 
                  onClick={() => handleTogglePlay(item.id)}
                  className="group relative w-full h-[620px] sm:h-[680px] lg:h-[720px] xl:h-[740px] bg-black rounded-2xl overflow-hidden cursor-pointer shadow-inner flex items-center justify-center"
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[item.id] = el;
                    }}
                    src={item.src}
                    poster={item.poster}
                    playsInline
                    controls={isPlaying}
                    onEnded={() => setPlayingId(null)}
                    onPause={() => {
                      if (playingId === item.id) setPlayingId(null);
                    }}
                    onPlay={() => setPlayingId(item.id)}
                    className="w-full h-full object-cover"
                  />

                  {/* Nút Play lớn khi chưa phát */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-600/95 group-hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                        <Play size={32} className="ml-1 fill-white" />
                      </div>
                      <span className="absolute bottom-5 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 shadow-md">
                        Bấm để phát video
                      </span>
                    </div>
                  )}

                  {/* Nút điều khiển nhanh */}
                  {isPlaying && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        type="button"
                        onClick={(e) => handleToggleMute(e, item.id)}
                        className="w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
                      >
                        {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleFullscreen(e, item.id)}
                        className="w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Toàn màn hình"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
