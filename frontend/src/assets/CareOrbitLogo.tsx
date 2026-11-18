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
  // Full logo heights when sidebar is expanded
  const heights = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-18'
  };

  const getLogoImage = (cropped = false) => {
    const lower = productLabel.toLowerCase();
    const suffix = cropped ? '-cropped' : '';
    if (lower.includes('connect')) return `/careorbit-connect${suffix}.png`;
    if (lower.includes('home health') || lower.includes('homehealth')) return `/careorbit-homehealth${suffix}.png`;
    return `/careorbit-central${suffix}.png`;
  };

  if (collapsed) {
    // Show only the left icon portion (heart+stethoscope mark) when sidebar is collapsed
    return (
      <div
        className={`flex items-center justify-center select-none ${className}`}
        role="img"
        aria-label={`CareOrbit ${productLabel}`}
        title={`CareOrbit ${productLabel}`}
      >
        <img
          src={getLogoImage(true)}
          alt={`CareOrbit ${productLabel}`}
          className="h-9 w-9 object-cover object-left"
          style={{ minWidth: '36px' }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center min-w-0 select-none ${className}`}
      role="img"
      aria-label={`CareOrbit ${productLabel}`}
      title={`CareOrbit ${productLabel}`}
    >
      <img
        src={getLogoImage(true)}
        alt={`CareOrbit ${productLabel}`}
        className={`${heights[size]} w-auto object-contain`}
        style={{ maxWidth: '220px' }}
      />
    </div>
  );
};
