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
  'Jump Point Search': {
    complete: true,
    optimal: true,
    weighted: false,
    bestFor: 'Uniform-cost grids where memory and time optimization is critical',
    advantage: 'Dramatically faster than standard A* on open grids by skipping symmetric paths',
    limitation: 'Only applicable to uniform-cost grids',
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
  // ── Sorting ──────────────────────────────────────────────────────────────
  'Bubble Sort': {
    name: 'Bubble Sort',
    description: 'Repeatedly compares adjacent values and swaps out-of-order pairs until array is sorted.',
    timeComplexity: 'Best: O(n) | Avg: O(n²) | Worst: O(n²)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'for i = 0 to n - 1:',
      '  for j = 0 to n - i - 2:',
      '    if arr[j] > arr[j + 1]: swap(arr[j], arr[j + 1])',
    ],
  },
  'Selection Sort': {
    name: 'Selection Sort',
    description: 'Repeatedly scans the unsorted subarray for the minimum element and moves it to the front.',
    timeComplexity: 'Best: O(n²) | Avg: O(n²) | Worst: O(n²)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'for i = 0 to n - 1:',
      '  minIdx = i',
      '  for j = i + 1 to n - 1:',
      '    if arr[j] < arr[minIdx]: minIdx = j',
      '  swap(arr[i], arr[minIdx])',
    ],
  },
  'Insertion Sort': {
    name: 'Insertion Sort',
    description: 'Builds a sorted subarray by shifting larger elements right and inserting each new element into place.',
    timeComplexity: 'Best: O(n) | Avg: O(n²) | Worst: O(n²)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'for i = 1 to n - 1:',
      '  key = arr[i], j = i - 1',
      '  while j >= 0 and arr[j] > key:',
      '    arr[j + 1] = arr[j], j--',
      '  arr[j + 1] = key',
    ],
  },
  'Merge Sort': {
    name: 'Merge Sort',
    description: 'Divide-and-conquer algorithm that recursively splits array into halves, sorts them, and merges them back.',
    timeComplexity: 'Best: O(n log n) | Avg: O(n log n) | Worst: O(n log n)',
    spaceComplexity: 'O(n) auxiliary',
    pseudocode: [
      'mergeSort(arr, l, r):',
      '  if l < r:',
      '    mid = (l + r) / 2',
      '    mergeSort(arr, l, mid)',
      '    mergeSort(arr, mid + 1, r)',
      '    merge(arr, l, mid, r)',
    ],
  },
  'Quick Sort': {
    name: 'Quick Sort',
    description: 'Selects a pivot element and partitions the array into values smaller and larger than the pivot.',
    timeComplexity: 'Best: O(n log n) | Avg: O(n log n) | Worst: O(n²)',
    spaceComplexity: 'O(log n) auxiliary',
    pseudocode: [
      'quickSort(arr, low, high):',
      '  if low < high:',
      '    p = partition(arr, low, high)',
      '    quickSort(arr, low, p - 1)',
      '    quickSort(arr, p + 1, high)',
    ],
  },
  'Heap Sort': {
    name: 'Heap Sort',
    description: 'Converts array into a Max Heap structure and repeatedly extracts the root element to the end.',
    timeComplexity: 'Best: O(n log n) | Avg: O(n log n) | Worst: O(n log n)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'buildMaxHeap(arr)',
      'for i = n - 1 down to 1:',
      '  swap(arr[0], arr[i])',
      '  heapify(arr, 0, i)',
    ],
  },
  'Shell Sort': {
    name: 'Shell Sort',
    description: 'Generalization of insertion sort that compares elements at shrinking gap intervals.',
    timeComplexity: 'Best: O(n log n) | Avg: O(n^1.3) | Worst: O(n²)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'for gap = n / 2 down to 1:',
      '  insertionSortWithGap(arr, gap)',
    ],
  },
  'Comb Sort': {
    name: 'Comb Sort',
    description: 'Improves Bubble Sort by comparing elements with a shrinking gap (shrink factor 1.3).',
    timeComplexity: 'Best: O(n log n) | Avg: O(n²/2ᵖ) | Worst: O(n²)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'gap = n',
      'while gap > 1 or swapped:',
      '  gap = max(1, floor(gap / 1.3))',
      '  compare and swap with step gap',
    ],
  },
  'Radix Sort': {
    name: 'Radix Sort',
    description: 'Non-comparison integer sort that distributes numbers into buckets according to individual digit places.',
    timeComplexity: 'Best: O(nk) | Avg: O(nk) | Worst: O(nk)',
    spaceComplexity: 'O(n + k) auxiliary',
    pseudocode: [
      'for digit = 1 to maxDigit:',
      '  distribute into 10 buckets by digit',
      '  collect back to array',
    ],
  },
  'Counting Sort': {
    name: 'Counting Sort',
    description: 'Non-comparison integer sort that tallies key frequencies to calculate output index positions directly.',
    timeComplexity: 'Best: O(n + k) | Avg: O(n + k) | Worst: O(n + k)',
    spaceComplexity: 'O(k) auxiliary',
    pseudocode: [
      'count = array of zeros size k',
      'for x in arr: count[x]++',
      'reconstruct sorted array from count frequencies',
    ],
  },
  'Cocktail Sort': {
    name: 'Cocktail Sort',
    description: 'Bidirectional variation of Bubble Sort that traverses forward and backward during each pass.',
    timeComplexity: 'Best: O(n) | Avg: O(n²) | Worst: O(n²)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'repeat forward and backward passes swapping out-of-order adjacent elements',
    ],
  },
  'Tim Sort': {
    name: 'Tim Sort',
    description: 'A hybrid sorting algorithm derived from merge sort and insertion sort, designed to perform well on many kinds of real-world data.',
    timeComplexity: 'Best: O(n) | Avg: O(n log n) | Worst: O(n log n)',
    spaceComplexity: 'O(n) auxiliary',
    pseudocode: [
      'divide array into blocks (runs)',
      'sort runs with insertion sort',
      'merge runs with merge sort',
    ],
  },

  // ── Searching ─────────────────────────────────────────────────────────────
  'Linear Search': {
    name: 'Linear Search',
    description: 'Sequentially checks each element in the dataset until a match is found or end is reached.',
    timeComplexity: 'Best: O(1) | Avg: O(n) | Worst: O(n)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'for i = 0 to n - 1:',
      '  if arr[i] == target: return i',
      'return -1',
    ],
  },
  'Binary Search': {
    name: 'Binary Search',
    description: 'Requires sorted data; repeatedly compares target with midpoint and eliminates half the search space.',
    timeComplexity: 'Best: O(1) | Avg: O(log n) | Worst: O(log n)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'low = 0, high = n - 1',
      'while low <= high:',
      '  mid = (low + high) / 2',
      '  if arr[mid] == target: return mid',
      '  else if arr[mid] < target: low = mid + 1',
      '  else: high = mid - 1',
    ],
  },
  'Jump Search': {
    name: 'Jump Search',
    description: 'Jumps ahead by fixed steps (√n) on sorted data then performs linear search within matching block.',
    timeComplexity: 'Best: O(1) | Avg: O(√n) | Worst: O(√n)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'step = floor(sqrt(n))',
      'jump ahead by step while arr[min(step, n)-1] < target',
      'linear search in current block',
    ],
  },
  'Exponential Search': {
    name: 'Exponential Search',
    description: 'Finds range containing target by doubling index bounds (1, 2, 4, 8...), then runs binary search.',
    timeComplexity: 'Best: O(1) | Avg: O(log n) | Worst: O(log n)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'if arr[0] == target: return 0',
      'i = 1',
      'while i < n and arr[i] <= target: i *= 2',
      'return binarySearch(arr, i/2, min(i, n-1), target)',
    ],
  },
  'Interpolation Search': {
    name: 'Interpolation Search',
    description: 'Estimates target position on uniformly distributed sorted data using value proportionality.',
    timeComplexity: 'Best: O(1) | Avg: O(log log n) | Worst: O(n)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'pos = low + ((target - arr[low]) * (high - low)) / (arr[high] - arr[low])',
      'compare target with arr[pos] and adjust bounds',
    ],
  },
  'Ternary Search': {
    name: 'Ternary Search',
    description: 'Divides sorted search space into three equal parts using two midpoints.',
    timeComplexity: 'Best: O(1) | Avg: O(log₃ n) | Worst: O(log₃ n)',
    spaceComplexity: 'O(1) auxiliary',
    pseudocode: [
      'mid1 = low + (high - low) / 3',
      'mid2 = high - (high - low) / 3',
      'compare target with arr[mid1] and arr[mid2]',
    ],
  },

  // ── Pathfinding ───────────────────────────────────────────────────────────
  'BFS': {
    name: 'Breadth-First Search (BFS)',
    description: 'Explores graph nodes level-by-level using a FIFO queue; guarantees shortest path on unweighted graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V) auxiliary',
    pseudocode: [
      'queue.enqueue(start), visited.add(start)',
      'while queue not empty:',
      '  curr = queue.dequeue()',
      '  for neighbor of curr: if unvisited: enqueue and mark visited',
    ],
  },
  'DFS': {
    name: 'Depth-First Search (DFS)',
    description: 'Explores graph deeply along each branch before backtracking using a LIFO stack or recursion.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V) auxiliary',
    pseudocode: [
      'stack.push(start)',
      'while stack not empty:',
      '  curr = stack.pop()',
      '  visit unvisited neighbors',
    ],
  },
  'Dijkstra': {
    name: 'Dijkstra Algorithm',
    description: 'Finds shortest paths from start node to all other nodes in weighted graphs with non-negative edge weights.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V) auxiliary',
    pseudocode: [
      'dist[start] = 0, pq.insert(start, 0)',
      'while pq not empty:',
      '  u = pq.extractMin()',
      '  for neighbor v of u: relax edge (u, v)',
    ],
  },
  'A* Search': {
    name: 'A* Search Algorithm',
    description: 'Informed pathfinding algorithm combining actual distance g(n) and heuristic estimate h(n): f(n) = g(n) + h(n).',
    timeComplexity: 'Best: O(E) | Worst: O(bᵈ)',
    spaceComplexity: 'O(V) auxiliary',
    pseudocode: [
      'openSet.add(start)',
      'while openSet not empty:',
      '  curr = node with lowest fScore = gScore + hScore',
      '  if curr == goal: return reconstructPath()',
      '  evaluate neighbors and update fScores',
    ],
  },
  'Bellman-Ford': {
    name: 'Bellman-Ford Algorithm',
    description: 'Computes shortest paths from single source and detects negative-weight cycles by relaxing all edges V-1 times.',
    timeComplexity: 'O(V · E)',
    spaceComplexity: 'O(V) auxiliary',
    pseudocode: [
      'dist[start] = 0',
      'repeat V - 1 times:',
      '  for each edge (u, v, weight): relax edge',
    ],
  },
  'Greedy Best-First': {
    name: 'Greedy Best-First Search',
    description: 'Heuristic pathfinding algorithm that always expands the node closest to goal according to heuristic h(n).',
    timeComplexity: 'Best: O(1) | Worst: O(bᵐ)',
    spaceComplexity: 'O(bᵐ) auxiliary',
    pseudocode: [
      'pq.insert(start, h(start))',
      'while pq not empty:',
      '  curr = pq.extractMin()',
      '  expand neighbors ordered by heuristic h(neighbor)',
    ],
  },
  'Bidirectional BFS': {
    name: 'Bidirectional BFS',
    description: 'Runs two simultaneous BFS searches from start and goal until frontiers meet, halving search depth.',
    timeComplexity: 'O(bᵈ/²)',
    spaceComplexity: 'O(bᵈ/²) auxiliary',
    pseudocode: [
      'expand forward queue',
      'expand backward queue',
      'stop when search frontiers intersect',
    ],
  },
  'Jump Point Search': {
    name: 'Jump Point Search',
    description: 'Optimization of A* on uniform-cost grids that skips symmetric paths by jumping across straight lines.',
    timeComplexity: 'Best: O(E) | Worst: O(bᵈ)',
    spaceComplexity: 'O(V) auxiliary',
    pseudocode: [
      'openSet.add(start)',
      'while openSet not empty:',
      '  curr = node with lowest fScore',
      '  identify successors by jumping in valid directions',
      '  evaluate jump points and update fScores',
    ],
  },

  // ── Dynamic Programming ───────────────────────────────────────────────────
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

  // ── Trees ─────────────────────────────────────────────────────────────────
  'Binary Search Tree': {
    name: 'Binary Search Tree (BST)',
    description: 'A binary tree structure where each node left child < parent and right child > parent.',
    timeComplexity: 'Best: O(log N) | Avg: O(log N) | Worst: O(N)',
    spaceComplexity: 'O(N) auxiliary',
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
    timeComplexity: 'Best: O(log N) | Avg: O(log N) | Worst: O(log N)',
    spaceComplexity: 'O(N) auxiliary',
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
    timeComplexity: 'Best: O(log N) | Avg: O(log N) | Worst: O(log N)',
    spaceComplexity: 'O(N) auxiliary',
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


