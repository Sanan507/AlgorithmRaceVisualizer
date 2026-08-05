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
  'Interpolation Search': {
    requirements: 'Sorted array required',
    strengths: 'Fast O(log log n) average time on uniformly distributed data',
    weaknesses: 'Degrades to O(n) on non-uniform data; complex position calculation',
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
  'Bellman-Ford': {
    complete: true,
    optimal: true,
    weighted: true,
    bestFor: 'Graphs with negative edge weights & negative cycle detection',
    advantage: 'Handles negative edge weights cleanly via relaxation passes',
    limitation: 'O(V*E) time complexity is slower than Dijkstra on positive-weight graphs',
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

// ── Algorithm Detailed Metadata ─────────────────────────────────────────────
export const algorithmMetadata: Record<string, {
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  pseudocode: string[];
}> = {
  '0/1 Knapsack': {
    name: '0/1 Knapsack Problem',
    description: 'Select items with given weights and values to maximize total value without exceeding knapsack capacity.',
    timeComplexity: 'O(N * W)',
    spaceComplexity: 'O(N * W)',
    pseudocode: [
      'for i = 0 to N:',
      '  for w = 0 to W:',
      '    if wt[i-1] <= w:',
      '      dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])',
      '    else:',
      '      dp[i][w] = dp[i-1][w]',
      'return dp[N][W]',
    ],
  },
  'Longest Common Subsequence': {
    name: 'Longest Common Subsequence (LCS)',
    description: 'Finds the longest sequence that appears in the same relative order in both input strings.',
    timeComplexity: 'O(M * N)',
    spaceComplexity: 'O(M * N)',
    pseudocode: [
      'for i = 1 to M:',
      '  for j = 1 to N:',
      '    if s1[i-1] == s2[j-1]:',
      '      dp[i][j] = 1 + dp[i-1][j-1]',
      '    else:',
      '      dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
      'return dp[M][N]',
    ],
  },
  'Edit Distance': {
    name: 'Edit Distance (Levenshtein)',
    description: 'Computes minimum operations (insertion, deletion, substitution) to convert string S1 into S2.',
    timeComplexity: 'O(M * N)',
    spaceComplexity: 'O(M * N)',
    pseudocode: [
      'for i = 1 to M:',
      '  for j = 1 to N:',
      '    if s1[i-1] == s2[j-1]:',
      '      dp[i][j] = dp[i-1][j-1]',
      '    else:',
      '      dp[i][j] = 1 + min(dp[i-1][j-1], dp[i][j-1], dp[i-1][j])',
      'return dp[M][N]',
    ],
  },
  'Binary Search Tree': {
    name: 'Binary Search Tree (BST)',
    description: 'A binary tree structure where each node left child < parent and right child > parent.',
    timeComplexity: 'O(log N) Avg / O(N) Worst',
    spaceComplexity: 'O(N)',
    pseudocode: [
      'insert(node, val):',
      '  if node is null: return new Node(val)',
      '  if val < node.val: node.left = insert(node.left, val)',
      '  else: node.right = insert(node.right, val)',
      '  return node',
    ],
  },
  'AVL Tree': {
    name: 'AVL Tree (Self-Balancing)',
    description: 'Self-balancing BST maintaining balance factor |height(L) - height(R)| <= 1 via 4 rotation types (LL, RR, LR, RL).',
    timeComplexity: 'O(log N) Guaranteed',
    spaceComplexity: 'O(N)',
    pseudocode: [
      'insert(node, val):',
      '  node = standard_bst_insert(node, val)',
      '  bf = height(node.left) - height(node.right)',
      '  if bf > 1 and val < node.left.val: return rotateRight(node)',
      '  if bf < -1 and val > node.right.val: return rotateLeft(node)',
      '  return node',
    ],
  },
  'Red-Black Tree': {
    name: 'Red-Black Tree',
    description: 'Self-balancing BST using red/black node coloring and restructuring to ensure max path length <= 2 * min path length.',
    timeComplexity: 'O(log N) Guaranteed',
    spaceComplexity: 'O(N)',
    pseudocode: [
      'insert(val):',
      '  node = bst_insert(val, color=RED)',
      '  while node.parent is RED:',
      '    recolor_and_rotate(node)',
      '  root.color = BLACK',
    ],
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


