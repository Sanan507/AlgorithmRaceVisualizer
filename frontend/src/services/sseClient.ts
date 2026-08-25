import type { RaceResponse, SimulationFrame } from '../models/types';

export type LaneFrameEvent = {
  laneName: string;
  frame: SimulationFrame;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/** How long to wait for the stream's first event before giving up on the backend. */
export const DEFAULT_STREAM_TIMEOUT_MS = 8000;

/** `onError` receives an Event of this type when the deadline expired. */
export const STREAM_TIMEOUT_EVENT = 'algorace:stream-timeout';

export type StreamOptions = {
  /** Deadline for the first event. Frames that follow are not time-limited. */
  timeoutMs?: number;
};

export function createSimulationStream(
  endpoint: string,
  params: Record<string, any>,
  onStart: (initialResponse: RaceResponse) => void,
  onFrame: (event: LaneFrameEvent) => void,
  onEnd: (finalResponse: RaceResponse) => void,
  onError: (error: Event) => void,
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

  const close = () => {
    closed = true;
    clearTimer();
    eventSource.close();
  };

  timer = window.setTimeout(() => {
    timer = null;
    if (closed) return;
    close();
    onError(new Event(STREAM_TIMEOUT_EVENT));
  }, timeoutMs);

  eventSource.addEventListener('START', (event: MessageEvent) => {
    if (closed) return;
    clearTimer();
    onStart(JSON.parse(event.data) as RaceResponse);
  });

  eventSource.addEventListener('FRAME', (event: MessageEvent) => {
    if (closed) return;
    clearTimer();
    onFrame(JSON.parse(event.data) as LaneFrameEvent);
  });

  eventSource.addEventListener('END', (event: MessageEvent) => {
    if (closed) return;
    const payload = JSON.parse(event.data) as RaceResponse;
    close();
    onEnd(payload);
  });

  eventSource.onerror = (error) => {
    if (closed) return;
    close();
    onError(error);
  };

  return close;
}
