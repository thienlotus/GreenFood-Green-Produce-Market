"use client";

import { useRef, useState } from 'react';
import { Play, Volume2, VolumeX, Maximize2, Flame } from 'lucide-react';

export interface LocalVideoItem {
  id: string;
  src: string;
  poster: string;
  tiktokUrl: string;
  title: string;
}

export const REVIEW_VIDEOS: LocalVideoItem[] = [
  {
    id: 'tiktok-1',
    src: '/videos/tiktok-1.mp4',
    poster: '/videos/tiktok-1-cover.jpg',
    tiktokUrl: 'https://www.tiktok.com/@haidangrevieww/video/7478650791054642450?is_from_webapp=1&sender_device=pc',
    title: 'Video Review #1',
  },
  {
    id: 'tiktok-2',
    src: '/videos/tiktok-2.mp4',
    poster: '/videos/tiktok-2-cover.jpg',
    tiktokUrl: 'https://www.tiktok.com/@haidangrevieww/video/7382074794755280135?is_from_webapp=1&sender_device=pc',
    title: 'Video Review #2',
  },
  {
    id: 'tiktok-3',
    src: '/videos/tiktok-3.mp4',
    poster: '/videos/tiktok-3-cover.jpg',
    tiktokUrl: 'https://www.tiktok.com/@ruongbacthang1980/video/7650412727776660744?is_from_webapp=1&sender_device=pc',
    title: 'Video Review #3',
  },
];

interface SimpleTikTokVideoSectionProps {
  title?: string;
  subtitle?: string;
}

export default function SimpleTikTokVideoSection({
  title = "Reels",
  subtitle = "Bấm để xem video trực tiếp"
}: SimpleTikTokVideoSectionProps) {
  // Quản lý video đang phát
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
        if (v && key !== id) {
          v.pause();
        }
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
    <section className="mt-12 pt-8 border-t border-emerald-900/10" id="product-reviews">
      {/* Tiêu đề Reels đơn giản */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase">
            {title}
          </h2>
          <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Flame size={12} className="fill-white" /> Hot
          </span>
        </div>
      </div>

      {/* Grid 3 Video HTML5 - Khung to lớn, không chữ link, không chữ review */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center w-full">
        {REVIEW_VIDEOS.map((item) => {
          const isPlaying = playingId === item.id;
          const isMuted = mutedMap[item.id] ?? false;

          return (
            <div
              key={item.id}
              className="w-full max-w-[420px] lg:max-w-[440px] bg-white rounded-3xl p-2.5 sm:p-3 border border-emerald-900/10 shadow-elevated-card flex flex-col items-center hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Vùng phát Video trực tiếp 9:16 to lớn */}
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

                {/* Nút Play lớn ở giữa khi chưa phát */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 flex items-center justify-center transition-colors">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-600/95 group-hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                      <Play size={32} className="ml-1 fill-white" />
                    </div>
                    <span className="absolute bottom-5 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 shadow-md">
                      Bấm để phát video
                    </span>
                  </div>
                )}

                {/* Các nút điều khiển nhanh */}
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
    </section>
  );
}
