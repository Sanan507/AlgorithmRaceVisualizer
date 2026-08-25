/**
 * ArenaLoadingOverlay.tsx
 * Covers the lane grid while there is no real simulation data to show yet.
 *
 * Reuses the existing `.cyber-spinner` used by the app boot screen. The bar is
 * determinate when the Web Worker reports real progress, and an indeterminate
 * shimmer when we genuinely cannot know how long the backend will take —
 * a fake moving percentage would be a lie.
 */

import type { ArenaLoadState } from '../hooks/useArenaLoadState';

export function ArenaLoadingOverlay({
  visible,
  state,
}: {
  visible: boolean;
  state: ArenaLoadState;
}) {
  if (!visible) return null;

  const hasProgress = typeof state.progress === 'number' && Number.isFinite(state.progress);
  const percent = hasProgress ? Math.min(100, Math.max(0, Math.round(state.progress as number))) : 0;

  return (
    <div className="arena-loading-overlay" role="status" aria-live="polite">
      <div className="arena-loading-card">
        <div className="cyber-spinner" aria-hidden="true" />
        <p className="arena-loading-label">{state.label}</p>
        {state.detail && <p className="arena-loading-detail">{state.detail}</p>}

        <div
          className="arena-loading-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          {...(hasProgress ? { 'aria-valuenow': percent } : {})}
        >
          <div
            className={`arena-loading-progress-fill ${hasProgress ? '' : 'is-indeterminate'}`}
            style={hasProgress ? { width: `${percent}%` } : undefined}
          />
        </div>

        {hasProgress && <span className="arena-loading-percent tabular-nums">{percent}%</span>}
      </div>
    </div>
  );
}
