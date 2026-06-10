/**
 * Static algorithm metadata not available from the backend.
 * Used by AlgorithmComparisonCenter to enrich the comparison tables.
 */

export interface SortingMeta {
  stable: boolean;
  inPlace: boolean;
  useCase: string;
}

export interface SearchingMeta {
  requirements: string;
  strengths: string;
  weaknesses: string;
}

export interface PathfindingMeta {
  complete: boolean;
  optimal: boolean;
  weighted: boolean;
  bestFor: string;
  advantage: string;
  limitation: string;
}

// ── Sorting ─────────────────────────────────────────────────────────────────
export const SORTING_META: Record<string, SortingMeta> = {
  'Bubble Sort': {
    stable: true,
    inPlace: true,
    useCase: 'Educational purposes; nearly-sorted tiny arrays',
  },
  'Selection Sort': {
    stable: false,
    inPlace: true,
    useCase: 'Minimizing swaps when write operations are costly',
  },
  'Insertion Sort': {
    stable: true,
    inPlace: true,
    useCase: 'Small datasets; online sorting; nearly-sorted data',
  },
  'Merge Sort': {
    stable: true,
    inPlace: false,
    useCase: 'Linked lists; large datasets; stable sort required',
  },
  'Quick Sort': {
    stable: false,
    inPlace: true,
    useCase: 'General-purpose; cache-friendly for arrays',
  },
  'Heap Sort': {
    stable: false,
    inPlace: true,
    useCase: 'Priority queues; guaranteed O(n log n) worst case',
  },
  'Shell Sort': {
    stable: false,
    inPlace: true,
    useCase: 'Medium datasets; faster than O(n²) without extra memory',
  },
  'Counting Sort': {
    stable: true,
    inPlace: false,
    useCase: 'Integer data in a limited range (e.g. scores, ages)',
  },
  'Radix Sort': {
    stable: true,
    inPlace: false,
    useCase: 'Fixed-length integer or string keys with large datasets',
  },
  'Cocktail Sort': {
    stable: true,
    inPlace: true,
    useCase: 'Slightly optimised variant of Bubble Sort for teaching',
  },
  'Gnome Sort': {
    stable: true,
    inPlace: true,
    useCase: 'Simple implementation studies; small datasets',
  },
  'Tim Sort': {
    stable: true,
    inPlace: false,
    useCase: 'Real-world data (Python/Java default sort); mixed-order input',
  },
};

// ── Searching ────────────────────────────────────────────────────────────────
export const SEARCHING_META: Record<string, SearchingMeta> = {
  'Linear Search': {
    requirements: 'Unsorted or sorted array',
    strengths: 'Works on any data; simple to implement',
    weaknesses: 'O(n) time; slow for large datasets',
  },
  'Binary Search': {
    requirements: 'Sorted array required',
    strengths: 'O(log n) time; very fast on large sorted data',
    weaknesses: 'Requires pre-sorted input; not suitable for linked lists',
  },
  'Jump Search': {
    requirements: 'Sorted array required',
    strengths: 'Better than linear; O(√n) skips reduce comparisons',
    weaknesses: 'Slower than binary search; fixed step size may be suboptimal',
  },
  'Exponential Search': {
    requirements: 'Sorted array required',
    strengths: 'Good for unbounded/infinite lists; O(log n) after finding range',
    weaknesses: 'Overhead of range-finding step; rarely used in practice',
  },
  'Ternary Search': {
    requirements: 'Sorted array required',
    strengths: 'Divides search space into thirds each step',
    weaknesses: 'More comparisons per step than Binary Search; rarely preferred',
  },
  'Fibonacci Search': {
    requirements: 'Sorted array required',
    strengths: 'Works without division operator; cache-friendly access',
    weaknesses: 'Slightly more complex implementation; similar to binary search',
  },
};

// ── Pathfinding ──────────────────────────────────────────────────────────────
export const PATHFINDING_META: Record<string, PathfindingMeta> = {
  'BFS': {
    complete: true,
    optimal: true,
    weighted: false,
    bestFor: 'Unweighted graphs; guaranteeing shortest path',
    advantage: 'Always finds the shortest path in unweighted graphs',
    limitation: 'Memory-intensive; explores equally in all directions',
  },
  'DFS': {
    complete: true,
    optimal: false,
    weighted: false,
    bestFor: 'Maze generation; cycle detection; deep graph traversal',
    advantage: 'Very low memory usage; simple to implement',
    limitation: 'Does not guarantee the shortest path',
  },
  'Dijkstra': {
    complete: true,
    optimal: true,
    weighted: true,
    bestFor: 'Weighted graphs with non-negative edge costs',
    advantage: 'Guarantees optimal path with positive weights',
    limitation: 'Slower than A* when a good heuristic exists',
  },
  "A* Search": {
    complete: true,
    optimal: true,
    weighted: true,
    bestFor: 'Game AI, robotics; when a heuristic (e.g. Euclidean distance) is available',
    advantage: 'Fastest shortest-path algorithm when heuristic is accurate',
    limitation: 'Performance depends on heuristic quality; inadmissible h(x) can break optimality',
  },
  'Greedy Best-First': {
    complete: false,
    optimal: false,
    weighted: false,
    bestFor: 'Fast approximate pathfinding when optimality is not required',
    advantage: 'Extremely fast; heads directly toward goal',
    limitation: 'Not guaranteed to find shortest path; can get trapped',
  },
  'Bidirectional BFS': {
    complete: true,
    optimal: true,
    weighted: false,
    bestFor: 'Large unweighted graphs where both endpoints are known',
    advantage: 'Explores ~half the nodes compared to standard BFS',
    limitation: 'Complex implementation; restricted to unweighted graphs',
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns SortingMeta or a sensible default */
export function getSortingMeta(name: string): SortingMeta {
  return (
    SORTING_META[name] ?? {
      stable: false,
      inPlace: true,
      useCase: 'General-purpose sorting',
    }
  );
}

/** Returns SearchingMeta or a sensible default */
export function getSearchingMeta(name: string): SearchingMeta {
  return (
    SEARCHING_META[name] ?? {
      requirements: 'Array input',
      strengths: 'Finds target element',
      weaknesses: 'Varies by implementation',
    }
  );
}

/** Returns PathfindingMeta or a sensible default */
export function getPathfindingMeta(name: string): PathfindingMeta {
  return (
    PATHFINDING_META[name] ?? {
      complete: true,
      optimal: false,
      weighted: false,
      bestFor: 'Graph traversal',
      advantage: 'Explores the search space',
      limitation: 'May not find the shortest path',
    }
  );
}
