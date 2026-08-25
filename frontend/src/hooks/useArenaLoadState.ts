/**
 * useArenaLoadState.ts
 * One honest loading state, shared by the Sorting, Searching and Pathfinding arenas.
 *
 * The arenas previously carried a bare `loading` boolean that only ever disabled
 * buttons — and in the Sorting arena it was flipped back to false synchronously,
 * before the stream had delivered anything, so it was false for the whole real
 * wait. This models the phases the user should actually be told about.
 */

import { useCallback, useMemo, useState } from 'react';

export type LoadStatus =
  /** Nothing in flight; real data is on screen. */
  | 'idle'
  /** A debounced request is queued but not yet sent. */
  | 'pending'
  /** Request sent, nothing back yet. No real data to show. */
  | 'waiting'
  /** Computing locally in the Web Worker. No real data to show yet. */
  | 'computing'
  /** Frames are arriving and already rendering. Do not block the view. */
  | 'streaming'
  /** Gave up. Show the reason and a way to retry. */
  | 'error';

export type ArenaLoadState = {
  status: LoadStatus;
  /** 0-100 for a determinate bar, or null when the duration is unknowable. */
  progress: number | null;
  label: string;
  detail?: string;
};

const IDLE: ArenaLoadState = { status: 'idle', progress: null, label: '' };

export function useArenaLoadState() {
  const [state, setState] = useState<ArenaLoadState>(IDLE);

  const markQueued = useCallback((label = 'Queued…') => {
    setState({ status: 'pending', progress: null, label });
  }, []);

  const markWaiting = useCallback((label = 'Generating dataset…', detail?: string) => {
    setState({ status: 'waiting', progress: null, label, detail });
  }, []);

  const markComputing = useCallback((label: string, progress: number | null = null, detail?: string) => {
    setState({ status: 'computing', progress, label, detail });
  }, []);

  const markStreaming = useCallback((label = 'Receiving frames…', progress: number | null = null) => {
    setState({ status: 'streaming', progress, label });
  }, []);

  const markReady = useCallback(() => setState(IDLE), []);

  const markError = useCallback((label: string, detail?: string) => {
    setState({ status: 'error', progress: null, label, detail });
  }, []);

  const derived = useMemo(() => {
    const { status } = state;
    return {
      /** Work is in flight (an error is not "busy"). */
      isBusy: status === 'pending' || status === 'waiting' || status === 'computing' || status === 'streaming',
      /** Cover the arena only while there is genuinely nothing real to look at. */
      showOverlay: status === 'waiting' || status === 'computing',
      /** A quiet header pill is enough once frames are already rendering. */
      showPill: status === 'pending' || status === 'streaming',
      hasError: status === 'error',
    };
  }, [state]);

  return { state, ...derived, markQueued, markWaiting, markComputing, markStreaming, markReady, markError };
}
