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
    <div className={`algorace-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.38 }}>
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
            {/* Ambient Backing Glow */}
            <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Linear Brand Gradient: Cyan to Indigo to Emerald */}
            <linearGradient id={`${gradientId}-primary`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            {/* Accent Spark / Energy Path Gradient */}
            <linearGradient id={`${gradientId}-spark`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Bevel Shadow & Surface Shimmer */}
            <linearGradient id={`${gradientId}-surface`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1e38" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0b0b1e" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Geometric Diamond Squircle Container */}
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="12"
            fill={`url(#${gradientId}-surface)`}
            stroke={`url(#${gradientId}-primary)`}
            strokeWidth="1.75"
            className="logo-squircle"
          />

          {/* Inner Circuit / Algorithm Track Lines */}
          <path
            d="M12 28L19 15L27 31L36 17"
            stroke={`url(#${gradientId}-spark)`}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-track-line"
          />

          {/* Node 1: Start Seed (Cyan) */}
          <circle cx="12" cy="28" r="3.2" fill="#00f2fe" />
          <circle cx="12" cy="28" r="1.4" fill="#ffffff" />

          {/* Node 2: Pivot / Decision Node (Indigo) */}
          <circle cx="19" cy="15" r="3" fill="#818cf8" />

          {/* Node 3: Swapping Vertex (Purple) */}
          <circle cx="27" cy="31" r="3.2" fill="#c084fc" />

          {/* Node 4: Optimal Finish Vertex (Emerald Glow) */}
          <circle cx="36" cy="17" r="3.8" fill="#10b981" filter={`url(#${gradientId}-glow)`} />
          <circle cx="36" cy="17" r="1.6" fill="#ffffff" />

          {/* Lightning / Velocity Accent Streak */}
          <path
            d="M24 10L20 22H27L23 38"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.4"
            className="logo-spark-bolt"
          />
        </svg>
      </div>

      {showText && (
        <div className="logo-brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="logo-brand-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: size * 0.58, letterSpacing: '-0.025em' }}>
              Algo<span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Race</span>
            </span>
            {badge && (
              <span
                className="logo-version-badge"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#818cf8',
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
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '3px',
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
