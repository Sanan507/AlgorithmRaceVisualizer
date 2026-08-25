/**
 * canvasScale.ts
 *
 * One place to decide the canvas backing-store scale.
 *
 * Every canvas used to size itself by the raw `window.devicePixelRatio`. On a
 * modern phone that is 3, so each canvas allocated and repainted 9x the pixels
 * of its CSS box — multiplied by the three or four lanes an arena renders, and
 * repeated on every playback frame. That was the main source of mobile lag.
 *
 * Capping at 2 is visually indistinguishable on a phone screen (the extra
 * subpixels are far below what the eye resolves at arm's length) and cuts the
 * fill cost by more than half. Narrow viewports get a tighter cap still,
 * because that is exactly where the GPU is weakest and the canvases are
 * smallest.
 */

/** Max backing-store scale on phone-sized viewports. */
const MOBILE_MAX_DPR = 1.5;
/** Max backing-store scale everywhere else. */
const DESKTOP_MAX_DPR = 2;
/** Viewport width at or below which the mobile cap applies. */
const MOBILE_BREAKPOINT = 768;

export function getCanvasScale(): number {
  const raw = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  if (raw <= 1) return 1;
  const isNarrow = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
  return Math.min(raw, isNarrow ? MOBILE_MAX_DPR : DESKTOP_MAX_DPR);
}
