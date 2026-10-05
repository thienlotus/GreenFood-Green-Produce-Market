"use client";

import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  showTagline?: boolean;
  className?: string;
}

export default function BrandLogo({
  variant = 'light',
  size = 'md',
  href = '/',
  showTagline = true,
  className = '',
}: BrandLogoProps) {
  const isDark = variant === 'dark';

  // Kích thước chuẩn cân đối giữa Icon và Typography
  const imageDimensions = {
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-16 md:h-[4.75rem]',
    lg: 'h-18 sm:h-20 md:h-24',
  }[size];

  const brandTextSize = {
    sm: 'text-2xl sm:text-3xl pb-1',
    md: 'text-3xl sm:text-4xl md:text-[2.65rem] pb-1.5 sm:pb-2',
    lg: 'text-4xl sm:text-5xl md:text-[3.25rem] pb-2',
  }[size];

  // Khoảng cách an toàn tuyệt đối, không để descender của phông Pacifico che chữ
  const taglineSpacing = {
    sm: 'text-[9px] tracking-[0.2em] mt-2 sm:mt-2.5',
    md: 'text-[10px] sm:text-[11px] tracking-[0.25em] mt-3.5 sm:mt-4',
    lg: 'text-[11px] sm:text-[12px] tracking-[0.28em] mt-4 sm:mt-5',
  }[size];

  const content = (
    <div className={`flex items-center gap-3 sm:gap-4 shrink-0 group ${className}`}>
      {/* Biểu tượng Mầm Nông Sản Xanh */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src="/logo.png"
          alt="GreenFood Logo"
          className={`${imageDimensions} w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter ${
            isDark ? 'drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]' : 'drop-shadow-sm'
          }`}
          style={{ width: 'auto' }}
        />
      </div>

      {/* Tên thương hiệu + Tagline chuẩn nhận diện, có khoảng cách rõ ràng */}
      <div className="flex flex-col justify-center select-none">
        <span
          className={`font-pacifico font-bold leading-none transition-colors ${brandTextSize} ${
            isDark 
              ? 'text-white group-hover:text-emerald-200' 
              : 'text-emerald-600 group-hover:text-emerald-700'
          }`}
          style={{ textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : undefined }}
        >
          GreenFood
        </span>
        {showTagline && (
          <span
            className={`font-bold uppercase whitespace-nowrap leading-none transition-colors block ${taglineSpacing} ${
              isDark ? 'text-emerald-300' : 'text-emerald-800'
            }`}
          >
            Nông sản sạch từ tâm
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
