/**
 * useDebouncedCallback.ts
 * Coalesces bursts of rapid calls into a single trailing invocation.
 *
 * Why this exists: the arena pages used to fire a full backend simulation on
 * every keystroke in the custom-array field, and on every grid cell touched
 * while drag-drawing walls. A single drag across the pathfinding grid could
 * launch dozens of concurrent simulations that all competed for the same
 * connection, which is what made the arenas feel slow to load.
 *
 * Only the network request is deferred — callers keep updating local state
 * immediately so typing and drawing stay responsive.
 */

import { useCallback, useEffect, useRef } from 'react';

export type DebouncedCallback<A extends unknown[]> = {
  /** Schedule the callback, replacing any already-queued call. */
  run: (...args: A) => void;
  /** Drop a queued call without invoking it. */
  cancel: () => void;
  /** Invoke a queued call right now instead of waiting out the delay. */
  flush: () => void;
  /** True while a call is queued. Not reactive — for guards, not rendering. */
  isPending: () => boolean;
};

export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = 300
): DebouncedCallback<A> {
  const callbackRef = useRef(callback);
  const timerRef = useRef<number | null>(null);
  const argsRef = useRef<A | null>(null);

  // Always invoke the newest closure. The arena `fetchSimulation` functions are
  // re-created on every render by their useCallback deps, so capturing one at
  // mount would fire a stale request with stale state.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    clearTimer();
    argsRef.current = null;
  }, [clearTimer]);

  const invokeQueued = useCallback(() => {
    const queued = argsRef.current;
    argsRef.current = null;
    if (queued) callbackRef.current(...queued);
  }, []);

  const run = useCallback(
    (...args: A) => {
      argsRef.current = args;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        invokeQueued();
      }, delay);
    },
    [clearTimer, delay, invokeQueued]
  );

  const flush = useCallback(() => {
    if (timerRef.current === null) return;
    clearTimer();
    invokeQueued();
  }, [clearTimer, invokeQueued]);

  const isPending = useCallback(() => timerRef.current !== null, []);

  // Never let a queued request fire after the arena unmounts.
  useEffect(() => cancel, [cancel]);

  return { run, cancel, flush, isPending };
}
