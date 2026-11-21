import React from 'react';

interface ScallopDividerProps {
  color: string;
  direction?: 'down' | 'up';
  className?: string;
}

export const ScallopDivider: React.FC<ScallopDividerProps> = ({
  color,
  direction = 'down',
  className = '',
}) => {
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 36"
        preserveAspectRatio="none"
        className={`block w-full h-6 md:h-8 ${direction === 'up' ? 'rotate-180' : ''}`}
      >
        <defs>
          <pattern id={`scallop-${color.replace('#', '')}`} width="48" height="36" patternUnits="userSpaceOnUse">
            <path d="M0,0 L48,0 L48,14 A24,22 0 0,1 0,14 Z" fill={color} />
          </pattern>
        </defs>
        <rect width="1440" height="36" fill={`url(#scallop-${color.replace('#', '')})`} />
      </svg>
    </div>
  );
};

export const DaisyMotif: React.FC<{ className?: string; centerColor?: string; petalColor?: string }> = ({
  className = 'w-8 h-8',
  centerColor = '#F8E59E',
  petalColor = '#FFFFFF',
}) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <ellipse
        key={angle}
        cx="32"
        cy="16"
        rx="7"
        ry="13"
        fill={petalColor}
        transform={`rotate(${angle} 32 32)`}
      />
    ))}
    <circle cx="32" cy="32" r="8" fill={centerColor} />
  </svg>
);

export const ButterflyMotif: React.FC<{ className?: string; wingColor?: string }> = ({
  className = 'w-8 h-8',
  wingColor = '#FFF8EB',
}) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <g transform="rotate(-12 32 32)">
      <ellipse cx="21" cy="24" rx="12" ry="9" transform="rotate(-24 21 24)" fill={wingColor} stroke="#F5C4D8" strokeWidth="1.5" />
      <ellipse cx="43" cy="24" rx="12" ry="9" transform="rotate(24 43 24)" fill={wingColor} stroke="#F5C4D8" strokeWidth="1.5" />
      <ellipse cx="23" cy="39" rx="9" ry="7" transform="rotate(20 23 39)" fill={wingColor} stroke="#F5C4D8" strokeWidth="1.5" />
      <ellipse cx="41" cy="39" rx="9" ry="7" transform="rotate(-20 41 39)" fill={wingColor} stroke="#F5C4D8" strokeWidth="1.5" />
      <rect x="30.5" y="18" width="3" height="26" rx="1.5" fill="#C9A8B8" />
    </g>
  </svg>
);
