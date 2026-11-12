import type { RaceResponse, SimulationFrame } from '../models/types';

export type LaneFrameEvent = {
  laneName: string;
  frame: SimulationFrame;
};

const isBrowser = typeof window !== 'undefined';
const isLocalhost =
  isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const RENDER_BACKEND_URL = 'https://algorithmracevisualizer.onrender.com';
const configuredBase = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL.trim() : undefined;
const API_BASE_URL =
  configuredBase && (!isLocalhost || !configuredBase.includes('onrender.com'))
    ? configuredBase
    : (isLocalhost ? 'http://localhost:8080' : RENDER_BACKEND_URL);

/** How long to wait for events before considering the stream stalled. */
export const DEFAULT_STREAM_TIMEOUT_MS = 8000;

/** `onError` receives an Event of this type when the deadline expired. */
export const STREAM_TIMEOUT_EVENT = 'algorace:stream-timeout';

export type StreamOptions = {
  /** Inactivity deadline between events. Defaults to 8000ms. */
  timeoutMs?: number;
};

export function createSimulationStream(
  endpoint: string,
  params: Record<string, any>,
  onStart: (initialResponse: RaceResponse) => void,
  onFrame: (event: LaneFrameEvent) => void,
  onEnd: (finalResponse: RaceResponse) => void,
  onError: (error: Event | Error) => void,
  options?: StreamOptions
): () => void {
  const finalParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (key === 'walls' || key === 'weights') continue;
    if (Array.isArray(value)) {
      value.forEach((v) => finalParams.append(key, v.toString()));
    } else {
      finalParams.append(key, value.toString());
    }
  }

  if (params.walls) {
     params.walls.forEach((row: boolean[]) => {
       finalParams.append('walls', row.join(','));
     });
  }
  if (params.weights) {
     params.weights.forEach((row: number[]) => {
       finalParams.append('weights', row.join(','));
     });
  }

  const url = `${API_BASE_URL}${endpoint}?${finalParams.toString()}`;
  const eventSource = new EventSource(url);

  // EventSource has no built-in timeout: against a sleeping backend it stays in
  // CONNECTING indefinitely and never fires onerror, so the arena would wait
  // forever and the Web Worker fallback would never be reached.
  const timeoutMs = options?.timeoutMs ?? DEFAULT_STREAM_TIMEOUT_MS;
  let closed = false;
  let timer: number | null = null;

  const clearTimer = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const armTimer = () => {
    clearTimer();
    timer = window.setTimeout(() => {
      timer = null;
      if (closed) return;
      close();
      onError(new Event(STREAM_TIMEOUT_EVENT));
    }, timeoutMs);
  };

  const close = () => {
    if (closed) return;
    closed = true;
    clearTimer();
    eventSource.removeEventListener('START', handleStart);
    eventSource.removeEventListener('FRAME', handleFrame);
    eventSource.removeEventListener('END', handleEnd);
    eventSource.onerror = null;
    eventSource.close();
  };

  const handleStart = (event: MessageEvent) => {
    if (closed) return;
    armTimer();
    try {
      const data = JSON.parse(event.data) as RaceResponse;
      onStart(data);
    } catch {
      close();
      onError(new Error('Invalid JSON received from server'));
    }
  };

  const handleFrame = (event: MessageEvent) => {
    if (closed) return;
    armTimer();
    try {
      const data = JSON.parse(event.data) as LaneFrameEvent;
      onFrame(data);
    } catch {
      close();
      onError(new Error('Invalid JSON received from server'));
    }
  };

  const handleEnd = (event: MessageEvent) => {
    if (closed) return;
    try {
      const payload = JSON.parse(event.data) as RaceResponse;
      close();
      onEnd(payload);
    } catch {
      close();
      onError(new Error('Invalid JSON received from server'));
    }
  };

  const handleError = (error: Event) => {
    if (closed) return;
    close();
    onError(error);
  };

  armTimer();

  eventSource.addEventListener('START', handleStart);
  eventSource.addEventListener('FRAME', handleFrame);
  eventSource.addEventListener('END', handleEnd);
  eventSource.onerror = handleError;

  return close;
}
