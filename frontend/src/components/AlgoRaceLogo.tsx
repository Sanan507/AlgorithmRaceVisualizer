import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
  tagline?: string;
  badge?: string;
}

export const AlgoRaceLogo: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  showText = false,
  animated = true,
  tagline,
  badge = 'v2.0',
}) => {
  const gradientId = React.useId().replace(/:/g, '-');

  return (
    <div
      className={`algorace-brand-logo ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35 }}
    >
      <div
        className={`logo-symbol-wrapper ${animated ? 'logo-animated' : ''}`}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Ambient High-Precision Glow */}
            <filter id={`${gradientId}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Perimeter Bevel & Border Gradient */}
            <linearGradient id={`${gradientId}-border`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
            </linearGradient>

            {/* Stream Alpha (Left: Cyan -> Sapphire -> Indigo) */}
            <linearGradient id={`${gradientId}-stream-a`} x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="60%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Stream Beta (Right: Indigo -> Violet -> Fuchsia) */}
            <linearGradient id={`${gradientId}-stream-b`} x1="100%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Pivot Bar Gradient (Horizontal Convergence) */}
            <linearGradient id={`${gradientId}-pivot`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            {/* Glass Container Background Gradient */}
            <linearGradient id={`${gradientId}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#13172e" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#080a14" stopOpacity="0.98" />
            </linearGradient>
          </defs>

          {/* Precision Glass Plate Container */}
          <rect
            x="3.5"
            y="3.5"
            width="41"
            height="41"
            rx="11"
            fill={`url(#${gradientId}-bg)`}
            stroke={`url(#${gradientId}-border)`}
            strokeWidth="1.25"
            className="logo-plate"
          />

          {/* Sub-grid Fine Reference Lines (Micro Precision Detailing) */}
          <line x1="10" y1="24" x2="38" y2="24" stroke="#ffffff" strokeOpacity="0.04" strokeDasharray="2 2" />
          <line x1="24" y1="10" x2="24" y2="38" stroke="#ffffff" strokeOpacity="0.04" strokeDasharray="2 2" />

          {/* Stream Alpha (Left Algorithmic Track) */}
          <path
            d="M 13 36 C 13 36 17 21 24 10 C 27.5 15.5 30 20 33 25"
            stroke={`url(#${gradientId}-stream-a)`}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-track-alpha"
          />

          {/* Stream Beta (Right Algorithmic Track) */}
          <path
            d="M 35 36 C 35 36 31 21 24 10 C 20.5 15.5 18 20 15 25"
            stroke={`url(#${gradientId}-stream-b)`}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-track-beta"
          />

          {/* Synchronized Partition / Pivot Bridge */}
          <path
            d="M 15 28 L 24 22 L 33 28"
            stroke={`url(#${gradientId}-pivot)`}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-pivot-bridge"
          />

          {/* Left Origin Node */}
          <circle cx="13" cy="36" r="2.5" fill="#00f2fe" stroke="#ffffff" strokeWidth="0.8" />

          {/* Right Origin Node */}
          <circle cx="35" cy="36" r="2.5" fill="#ec4899" stroke="#ffffff" strokeWidth="0.8" />

          {/* Central Pivot Node */}
          <circle cx="24" cy="22" r="2.2" fill="#818cf8" stroke="#ffffff" strokeWidth="0.8" />

          {/* Apex Convergence Node (Glow Finish) */}
          <circle
            cx="24"
            cy="10"
            r="3.2"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="1.2"
            filter={`url(#${gradientId}-glow)`}
            className="logo-apex-node"
          />
        </svg>
      </div>

      {showText && (
        <div className="logo-brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="logo-brand-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: size * 0.56,
                letterSpacing: '-0.025em',
              }}
            >
              Algo
              <span
                style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Race
              </span>
            </span>
            {badge && (
              <span
                className="logo-version-badge"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1.5px 6px',
                  borderRadius: '6px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.28)',
                  color: '#818cf8',
                  letterSpacing: '0.02em',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {tagline && (
            <span
              className="logo-tagline"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.66rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
