import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  collapsed?: boolean;
  productLabel?: string;
}

export const AxxessLogo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showTagline = false,
  collapsed = false,
  productLabel = 'Central'
}) => {
  const heights = {
    sm: 30,
    md: 40,
    lg: 50
  };

  const currentHeight = heights[size];

  return (
    <div
      className={`flex items-center gap-2 min-w-0 select-none ${className}`}
      role="img"
      aria-label={`Axxess ${productLabel}`}
      title={`Axxess ${productLabel} Healthcare`}
    >
      {/* Precision Vector Emblem: Heart + Key + Medical Cross */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={currentHeight * 1.15}
          height={currentHeight}
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="axxessCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#be123c" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Stylized Red Heart Outline & Curves */}
          <path
            d="M58 84 C38 72 12 50 12 30 C12 16 23 7 36 7 C46 7 54 13 58 22 C62 13 70 7 80 7 C93 7 104 16 104 30 C104 42 94 56 82 66"
            stroke="url(#axxessCrimson)"
            strokeWidth="9.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#logoShadow)"
          />

          {/* Stethoscope Earpiece loop & Key Shaft */}
          <path
            d="M16 68 C14 62 19 56 26 56 L86 16"
            stroke="#0f172a"
            className="dark:stroke-white transition-colors"
            strokeWidth="7.5"
            strokeLinecap="round"
          />

          {/* Stethoscope bell circle at base */}
          <circle cx="17" cy="71" r="5.5" fill="#0f172a" className="dark:fill-white transition-colors" />
          
          {/* Key Head / Bow with Cross */}
          <rect
            x="76"
            y="6"
            width="22"
            height="22"
            rx="5"
            transform="rotate(18 87 17)"
            fill="#0f172a"
            className="dark:fill-white transition-colors"
          />
          {/* Medical Cross inside Key Head */}
          <path
            d="M87 11 V23 M81 17 H93"
            stroke="#ffffff"
            className="dark:stroke-charcoal-900"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typography: AXXESS Central - Stark Bold & Crystal Clear */}
      {!collapsed && (
        <div className="flex flex-col leading-tight shrink-0 whitespace-nowrap">
          <div className="flex items-baseline tracking-tight">
            <span className="font-black text-slate-950 dark:text-white tracking-wide text-base font-heading transition-colors">
              AXXESS
            </span>
            <span className="font-black text-rose-700 dark:text-rose-400 text-base ml-1 font-heading transition-colors">
              {productLabel}
            </span>
          </div>
          {showTagline && (
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 dark:text-slate-400 mt-0.5">
              Healthcare Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};
