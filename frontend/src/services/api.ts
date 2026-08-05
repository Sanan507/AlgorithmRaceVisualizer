import type { CatalogResponse, RaceResponse, TreeSimulationRequest, TreeSimulationResponse } from '../models/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options
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
}

export const api = {
  catalog: () => request<CatalogResponse>('/api/catalog'),
  sorting: (body: unknown) =>
    request<RaceResponse>('/api/simulations/sorting', { method: 'POST', body: JSON.stringify(body) }),
  searching: (body: unknown) =>
    request<RaceResponse>('/api/simulations/searching', { method: 'POST', body: JSON.stringify(body) }),
  pathfinding: (body: unknown) =>
    request<RaceResponse>('/api/simulations/pathfinding', { method: 'POST', body: JSON.stringify(body) }),
  tree: (body: TreeSimulationRequest) =>
    request<TreeSimulationResponse>('/api/simulations/tree', { method: 'POST', body: JSON.stringify(body) })
};

