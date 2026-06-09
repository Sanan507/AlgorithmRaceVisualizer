import type { CatalogResponse, RaceResponse } from '../models/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  catalog: () => request<CatalogResponse>('/api/catalog'),
  sorting: (body: unknown) =>
    request<RaceResponse>('/api/simulations/sorting', { method: 'POST', body: JSON.stringify(body) }),
  searching: (body: unknown) =>
    request<RaceResponse>('/api/simulations/searching', { method: 'POST', body: JSON.stringify(body) }),
  pathfinding: (body: unknown) =>
    request<RaceResponse>('/api/simulations/pathfinding', { method: 'POST', body: JSON.stringify(body) })
};
