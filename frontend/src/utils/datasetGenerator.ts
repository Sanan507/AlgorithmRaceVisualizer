/**
 * datasetGenerator.ts
 * Generates test datasets (Random, Nearly Sorted, Reversed, Few Unique, etc.)
 * for massive arrays (N up to 10,000) for client-side and Web Worker simulations.
 */

export function generateDataset(size: number, type = 'Random'): number[] {
  const n = Math.max(1, Math.min(10000, size));
  const arr: number[] = [];

  switch (type) {
    case 'Nearly Sorted':
    case 'nearly-sorted': {
      for (let i = 1; i <= n; i++) arr.push(i * 10);
      // Swap ~5% of elements randomly
      const swaps = Math.max(1, Math.floor(n * 0.05));
      for (let s = 0; s < swaps; s++) {
        const i1 = Math.floor(Math.random() * n);
        const i2 = Math.floor(Math.random() * n);
        const temp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = temp;
      }
      break;
    }

    case 'Reversed':
    case 'reversed': {
      for (let i = n; i >= 1; i--) arr.push(i * 10);
      break;
    }

    case 'Few Unique':
    case 'few-unique': {
      const distinct = [25, 50, 75, 100, 150];
      for (let i = 0; i < n; i++) {
        arr.push(distinct[Math.floor(Math.random() * distinct.length)]);
      }
      break;
    }

    case 'Sorted':
    case 'sorted': {
      for (let i = 1; i <= n; i++) arr.push(i * 10);
      break;
    }

    case 'Random':
    case 'random':
    default: {
      for (let i = 0; i < n; i++) {
        arr.push(Math.floor(Math.random() * 950) + 10);
      }
      break;
    }
  }

  return arr;
}
