import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
  tagline?: string;
  badge?: string;
}

/**
 * AlgoRace mark — three ascending bars.
 *
 * Deliberately minimal: one gradient, three shapes, no container plate, no
 * glow filter, no decorative sub-grid. The previous mark stacked a glass plate,
 * a blur filter, five gradients and dashed reference lines into a 26px box,
 * where none of it resolved — it just read as noise and cost a filter repaint
 * on every hover. Three bars at an opacity ramp stay legible down to 16px
 * (favicon size) and still say "sorted array" at a glance.
 */
export const AlgoRaceLogo: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  showText = false,
  animated = true,
  tagline,
  badge,
}) => {
  const gradientId = React.useId().replace(/:/g, '-');

  return (
    <div
      className={`algorace-brand-logo ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34 }}
    >
      <div
        className={`logo-symbol-wrapper ${animated ? 'logo-animated' : ''}`}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${gradientId}-bars`} x1="0" y1="32" x2="32" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="55%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {/* Ascending lanes: short, mid, tall. Opacity carries the depth so the
              shape stays readable without extra strokes or shadows. */}
          <rect
            className="logo-bar logo-bar--1"
            x="4"
            y="18"
            width="5.5"
            height="10"
            rx="2.75"
            fill={`url(#${gradientId}-bars)`}
            opacity="0.42"
          />
          <rect
            className="logo-bar logo-bar--2"
            x="13.25"
            y="11"
            width="5.5"
            height="17"
            rx="2.75"
            fill={`url(#${gradientId}-bars)`}
            opacity="0.68"
          />
          <rect
            className="logo-bar logo-bar--3"
            x="22.5"
            y="4"
            width="5.5"
            height="24"
            rx="2.75"
            fill={`url(#${gradientId}-bars)`}
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
                fontWeight: 700,
                fontSize: size * 0.56,
                letterSpacing: '-0.03em',
              }}
            >
              Algo
              <span
                style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 55%, #c084fc 100%)',
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
                  fontWeight: 600,
                  padding: '1.5px 6px',
                  borderRadius: '6px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.22)',
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
