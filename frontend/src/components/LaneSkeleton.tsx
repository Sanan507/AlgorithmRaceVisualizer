/**
 * LaneSkeleton.tsx
 * Placeholder shown inside a lane while its real frames are still missing.
 *
 * This replaces the old behaviour of synthesizing a sine-wave array and drawing
 * it as ordinary bars — indistinguishable from a real dataset, so users pressed
 * Start on data that did not exist. A shimmer reads unmistakably as "not ready".
 */

// Fixed, not random: a stable pattern avoids the bars twitching on every render.
const BAR_HEIGHTS = [42, 68, 30, 84, 55, 72, 38, 90, 47, 63, 26, 78, 51, 35, 66, 44];

export function LaneSkeleton({ variant = 'bars' }: { variant?: 'bars' | 'grid' }) {
  if (variant === 'grid') {
    return (
      <div className="lane-skeleton lane-skeleton--grid" aria-hidden="true">
        {Array.from({ length: 96 }, (_, i) => (
          <span key={i} className="lane-skeleton-cell" style={{ animationDelay: `${(i % 12) * 60}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="lane-skeleton lane-skeleton--bars" aria-hidden="true">
      {BAR_HEIGHTS.map((height, i) => (
        <span
          key={i}
          className="lane-skeleton-bar"
          style={{ height: `${height}%`, animationDelay: `${i * 55}ms` }}
        />
      ))}
    </div>
  );
}
