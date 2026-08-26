import React from 'react';

interface VosPrintLogoProps {
  variant?: 'full' | 'mark' | 'banner' | 'horizontal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  theme?: 'dark' | 'light' | 'auto';
}

export function VosPrintMark({
  size = 36,
  className = '',
  forceWhite = false,
}: {
  size?: number;
  className?: string;
  forceWhite?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Logo VosPrint"
    >
      {/* Bagian Putih / Elemen Utamanya */}
      <g className={forceWhite ? "fill-white" : "fill-slate-900 dark:fill-white transition-colors duration-200"}>
        {/* Bilah Tengah Utamanya */}
        <polygon points="180,60 332,60 300,280 212,280" />
        
        {/* Bilah Dalam Kiri */}
        <polygon points="106,115 156,118 200,280 168,280" />
        
        {/* Bilah Dalam Kanan */}
        <polygon points="406,115 356,118 312,280 344,280" />

        {/* Wadah Outer Frame (Bingkai Luar & Samping) */}
        <path d="M44 100 L130 350 L382 350 L468 100 L426 100 L356 312 Q256 312 156 312 L86 100 Z" />
      </g>

      {/* Segitiga Emas Kuning di Bawah */}
      <polygon points="152,370 360,370 256,460" fill="#FFB300" />
    </svg>
  );
}

/**
 * GAMBAR 2: Full VosPrint Logo (Emblem + Teks 'vosprint' huruf kecil persis seperti PNG)
 */
export function VosPrintBanner({
  className = '',
  height = 36,
  theme = 'auto',
}: {
  className?: string;
  height?: number;
  theme?: 'dark' | 'light' | 'auto';
}) {
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const textColor = isDark 
    ? "text-white" 
    : isLight 
      ? "text-slate-900" 
      : "text-slate-900 dark:text-white";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Gambar 1 Mark */}
      <VosPrintMark size={height} forceWhite={isDark} />

      {/* Gambar 2 Teks "vosprint" (semua huruf kecil & bold persis PNG asli) */}
      <span className={`font-black tracking-tight ${textColor} lowercase text-2xl leading-none`}>
        vosprint
      </span>
    </div>
  );
}

export default function VosPrintLogo({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = false,
  theme = 'auto',
}: VosPrintLogoProps) {
  const getPixelSize = () => {
    switch (size) {
      case 'xs': return 22;
      case 'sm': return 28;
      case 'lg': return 42;
      case 'xl': return 56;
      case 'md':
      default: return 34;
    }
  };

  const px = getPixelSize();

  // Mode: Hanya Emblem (Gambar 1)
  if (variant === 'mark') {
    return <VosPrintMark size={px} className={className} forceWhite={theme === 'dark'} />;
  }

  // Mode: Banner Horizontal (Gambar 2)
  if (variant === 'banner') {
    return <VosPrintBanner height={px} className={className} theme={theme} />;
  }

  // Mode: Full Logo Navbar / Card / Header
  const isDark = theme === 'dark';
  const textColor = isDark 
    ? "text-white" 
    : theme === 'light' 
      ? "text-slate-900" 
      : "text-slate-900 dark:text-white";

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Gambar 1: Emblem Mark dalam Dark Badge untuk memastikan warna putih & kuning selalu kontras tajam */}
      <div className="relative shrink-0 flex items-center justify-center p-1.5 rounded-xl bg-slate-950 text-white dark:bg-slate-900 border border-slate-800 dark:border-white/10 shadow-xs group-hover:scale-105 transition-transform duration-200">
        <VosPrintMark size={px} forceWhite={true} />
      </div>

      {/* Gambar 2: Teks "vosprint" Huruf Kecil Persis PNG Asli */}
      <div className="flex flex-col text-left justify-center">
        <div className={`flex items-center text-xl md:text-2xl font-black tracking-tight leading-none lowercase ${textColor}`}>
          vosprint
        </div>
        {showSubtitle && (
          <span className="text-[9px] font-semibold tracking-wider text-slate-500 dark:text-neutral-400 uppercase mt-0.5">
            Digital Printing & Offset
          </span>
        )}
      </div>
    </div>
  );
}
