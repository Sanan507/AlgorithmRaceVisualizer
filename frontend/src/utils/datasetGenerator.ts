/**
 * datasetGenerator.ts
 * Generates test datasets (Random, Nearly Sorted, Reversed, Few Unique, etc.)
 * for massive arrays (N up to 10,000) for client-side and Web Worker simulations.
 *
 * Values are kept on the same 5..100 scale the backend uses
 * (ArrayGenerator.java), so a client-generated array looks identical to a
 * server-generated one. Before this, Random produced 10..959 and the sorted
 * ramps produced i * 10 — so the Searching arena (which always builds its array
 * here) and any Web Worker fallback showed values ~10x larger than the Sorting
 * arena, and a default target like 20 was almost never present in the data.
 */

const MIN_VALUE = 5;
const MAX_VALUE = 100;

/** Rescale onto MIN_VALUE..MAX_VALUE, matching ArrayGenerator.normalize. */
function normalize(arr: number[]): number[] {
  let min = Infinity;
  let max = -Infinity;
  for (const v of arr) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min;
  if (range === 0) return arr.map(() => MIN_VALUE);
  const span = MAX_VALUE - MIN_VALUE;
  return arr.map((v) => Math.round(((v - min) / range) * span) + MIN_VALUE);
}

export function generateDataset(size: number, type = 'Random'): number[] {
  const n = Math.max(1, Math.min(10000, size));
  const arr: number[] = [];

  switch (type) {
    case 'Nearly Sorted':
    case 'nearly-sorted': {
      for (let i = 1; i <= n; i++) arr.push(i);
      // Swap ~5% of elements randomly
      const swaps = Math.max(1, Math.floor(n * 0.05));
      for (let s = 0; s < swaps; s++) {
        const i1 = Math.floor(Math.random() * n);
        const i2 = Math.floor(Math.random() * n);
        const temp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = temp;
      }
      return normalize(arr);
    }

    case 'Reversed':
    case 'reversed': {
      for (let i = n; i >= 1; i--) arr.push(i);
      return normalize(arr);
    }

    case 'Few Unique':
    case 'few-unique': {
      const distinct = [10, 25, 50, 75, 90];
      for (let i = 0; i < n; i++) {
        arr.push(distinct[Math.floor(Math.random() * distinct.length)]);
      }
      return arr;
    }

    case 'Sorted':
    case 'sorted': {
      for (let i = 1; i <= n; i++) arr.push(i);
      return normalize(arr);
    }

    case 'Random':
    case 'random':
    default: {
      const span = MAX_VALUE - MIN_VALUE;
      for (let i = 0; i < n; i++) {
        arr.push(Math.floor(Math.random() * span) + MIN_VALUE);
      }
      return arr;
    }
  }
}
