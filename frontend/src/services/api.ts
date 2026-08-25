import type { CatalogResponse, RaceResponse, TreeSimulationRequest, TreeSimulationResponse } from '../models/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Every request gets a deadline. Without one a cold or sleeping backend leaves
 * the arena spinning forever, because the client-side fallback only runs once a
 * request actually fails.
 */
export const DEFAULT_TIMEOUT_MS = 8000;

export type RequestOptions = RequestInit & { timeoutMs?: number };

/** Thrown when a request exceeds its deadline, so callers can label it clearly. */
export class ApiTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Backend did not respond within ${Math.round(timeoutMs / 1000)}s`);
    this.name = 'ApiTimeoutError';
  }
}

/** True when a request was cancelled because a newer one superseded it. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * Combines our timeout with a caller-supplied signal, so a superseded request
 * is genuinely cancelled rather than merely having its result discarded.
 */
function withDeadline(timeoutMs: number, external?: AbortSignal | null) {
  const controller = new AbortController();
  let timedOut = false;

  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const forwardAbort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener('abort', forwardAbort, { once: true });
  }

  return {
    signal: controller.signal,
    didTimeOut: () => timedOut,
    cleanup: () => {
      window.clearTimeout(timer);
      external?.removeEventListener('abort', forwardAbort);
    },
  };
}

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: callerSignal, headers, ...rest } = options ?? {};
  const deadline = withDeadline(timeoutMs, callerSignal);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
      signal: deadline.signal,
      ...rest
    });
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data && typeof data === 'object' && typeof data.message === 'string') {
          message = data.message;
        }
      } catch {
        // Fallback to default message if response isn't JSON
      }
      throw new Error(message);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    // Distinguish "we gave up waiting" from "a newer request replaced this one".
    if (deadline.didTimeOut() && isAbortError(error)) {
      throw new ApiTimeoutError(timeoutMs);
    }
    throw error;
  } finally {
    deadline.cleanup();
  }
}

export const api = {
  catalog: (options?: RequestOptions) => request<CatalogResponse>('/api/catalog', options),
  sorting: (body: unknown, options?: RequestOptions) =>
    request<RaceResponse>('/api/simulations/sorting', { method: 'POST', body: JSON.stringify(body), ...options }),
  searching: (body: unknown, options?: RequestOptions) =>
    request<RaceResponse>('/api/simulations/searching', { method: 'POST', body: JSON.stringify(body), ...options }),
  pathfinding: (body: unknown, options?: RequestOptions) =>
    request<RaceResponse>('/api/simulations/pathfinding', { method: 'POST', body: JSON.stringify(body), ...options }),
  tree: (body: TreeSimulationRequest, options?: RequestOptions) =>
    request<TreeSimulationResponse>('/api/simulations/tree', { method: 'POST', body: JSON.stringify(body), ...options })
};
