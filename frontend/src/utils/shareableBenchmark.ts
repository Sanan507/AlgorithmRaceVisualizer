/**
 * shareableBenchmark.ts
 * Utilities for encoding, generating, and parsing shareable benchmark configurations
 * with custom datasets and algorithm parameters across all AlgoRace arenas.
 */

export interface ShareableBenchmarkConfig {
  arena: 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees';
  algorithms?: string[];
  datasetType?: string;
  size?: number;
  customArray?: number[];
  target?: number;
  speed?: number;
  mazeType?: string;
  weights?: number[][];
  walls?: boolean[][];
  title?: string;
}

/**
 * Encode array of numbers into a compact URL-safe string
 */
export function encodeArrayToParam(arr: number[]): string {
  if (!arr || arr.length === 0) return '';
  // If small, standard comma-separated is readable and clear
  if (arr.length <= 100) {
    return arr.join(',');
  }
  // For larger arrays, compress into base64 url-safe string
  try {
    const raw = JSON.stringify(arr);
    return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return arr.join(',');
  }
}

/**
 * Decode array from URL-safe string
 */
export function decodeArrayFromParam(param: string): number[] {
  if (!param || !param.trim()) return [];

  // Try base64 decoding first if it doesn't contain commas and has typical base64 characters
  if (!param.includes(',') && /^[A-Za-z0-9\-_]+$/.test(param)) {
    try {
      const base64 = param.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        return parsed.map(Number).filter((n) => !isNaN(n));
      }
    } catch {
      // Fallback to comma-separated
    }
  }

  return param
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n));
}

/**
 * Generate full shareable URL with parameters
 */
export function generateShareableUrl(config: ShareableBenchmarkConfig): string {
  const url = new URL(window.location.origin + window.location.pathname);
  url.hash = `#${config.arena}`;
  url.searchParams.set('page', config.arena);

  if (config.algorithms && config.algorithms.length > 0) {
    url.searchParams.set('algos', config.algorithms.join(','));
  }

  if (config.customArray && config.customArray.length > 0) {
    url.searchParams.set('mode', 'Custom');
    url.searchParams.set('cArray', encodeArrayToParam(config.customArray));
    url.searchParams.set('size', config.customArray.length.toString());
  } else {
    if (config.datasetType) url.searchParams.set('mode', config.datasetType);
    if (config.size) url.searchParams.set('size', config.size.toString());
  }

  if (config.target !== undefined && !isNaN(config.target)) {
    url.searchParams.set('target', config.target.toString());
  }

  if (config.mazeType) {
    url.searchParams.set('maze', config.mazeType);
  }

  if (config.speed) {
    url.searchParams.set('speed', config.speed.toString());
  }

  return url.href;
}

/**
 * Parse shareable configuration from current URL
 */
export function parseCurrentShareableConfig(): ShareableBenchmarkConfig | null {
  const search = window.location.search;
  const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase();

  const params = new URLSearchParams(search);
  const pageParam = params.get('page')?.toLowerCase();
  const arenaRaw = pageParam || hash || 'sorting';

  const arenaMap: Record<string, ShareableBenchmarkConfig['arena']> = {
    sorting: 'sorting',
    searching: 'searching',
    search: 'searching',
    pathfinding: 'pathfinding',
    dp: 'dp',
    trees: 'trees',
    tree: 'trees',
  };

  const arena = arenaMap[arenaRaw];
  if (!arena && !search) return null;

  const algosStr = params.get('algos');
  const mode = params.get('mode') || undefined;
  const sizeStr = params.get('size');
  const cArrayStr = params.get('cArray');
  const targetStr = params.get('target');
  const speedStr = params.get('speed');
  const mazeStr = params.get('maze');

  const customArray = cArrayStr ? decodeArrayFromParam(cArrayStr) : undefined;
  const size = sizeStr ? parseInt(sizeStr, 10) : customArray ? customArray.length : undefined;
  const target = targetStr ? parseInt(targetStr, 10) : undefined;
  const speed = speedStr ? parseInt(speedStr, 10) : undefined;

  return {
    arena: arena || 'sorting',
    algorithms: algosStr ? algosStr.split(',').map((s) => s.trim()) : undefined,
    datasetType: mode,
    size: size && !isNaN(size) ? size : undefined,
    customArray: customArray && customArray.length > 0 ? customArray : undefined,
    target: target && !isNaN(target) ? target : undefined,
    speed: speed && !isNaN(speed) ? speed : undefined,
    mazeType: mazeStr || undefined,
  };
}
