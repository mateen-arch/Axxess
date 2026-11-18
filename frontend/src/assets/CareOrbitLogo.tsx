import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  collapsed?: boolean;
  productLabel?: string;
}

export const CareOrbitLogo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showTagline = false,
  collapsed = false,
  productLabel = 'Central'
}) => {
  const heights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11'
  };

  const getLogoImage = () => {
    const lower = productLabel.toLowerCase();
    if (lower.includes('connect')) return '/careorbit-connect.jpg';
    if (lower.includes('home health') || lower.includes('homehealth')) return '/careorbit-homehealth.jpg';
    return '/careorbit-central.jpg';
  };

  if (collapsed) {
    return (
      <div
        className={`flex items-center justify-center select-none ${className}`}
        role="img"
        aria-label={`CareOrbit ${productLabel}`}
        title={`CareOrbit ${productLabel}`}
      >
        <img
          src={getLogoImage()}
          alt={`CareOrbit ${productLabel}`}
          className={`${heights[size]} w-auto object-contain rounded`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 min-w-0 select-none ${className}`}
      role="img"
      aria-label={`CareOrbit ${productLabel}`}
      title={`CareOrbit ${productLabel}`}
    >
      <img
        src={getLogoImage()}
        alt={`CareOrbit ${productLabel}`}
        className={`${heights[size]} w-auto object-contain rounded`}
      />
    </div>
  );
};
