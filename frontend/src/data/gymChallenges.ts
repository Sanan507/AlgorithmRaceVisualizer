/**
 * gymChallenges.ts
 * Curated collection of high-level algorithmic showdowns and debugging challenges for AlgoGym.
 */

import { RacePredictionChallenge, BugHuntChallenge } from '../models/gymTypes';

export const RACE_PREDICTION_CHALLENGES: RacePredictionChallenge[] = [
  {
    id: 'dutch-national-flag-trap',
    title: 'The Dutch National Flag Trap: 90% Duplicate Keys',
    category: 'sorting',
    difficulty: 'Intermediate',
    scenarioDescription:
      'A dataset of N=120 elements containing only 3 unique values ([10, 20, 30]) repeated randomly. Standard 2-Way QuickSort fails to group equal keys together, repeatedly placing duplicates on both sides of the partition.',
    datasetType: 'Few Unique',
    datasetSize: 120,
    contenders: [
      {
        name: 'Quick Sort (2-Way Lomuto)',
        algorithmKey: 'Quick Sort',
        timeComplexity: 'O(N^2) on equal keys',
        spaceComplexity: 'O(N)',
        color: '#ef4444',
        expectedBehavior: 'Recursively splits equal elements, degenerating into O(N^2) depth.',
      },
      {
        name: 'Merge Sort',
        algorithmKey: 'Merge Sort',
        timeComplexity: 'O(N log N) Guaranteed',
        spaceComplexity: 'O(N)',
        color: '#38bdf8',
        expectedBehavior: 'Predictable divide-and-conquer halves regardless of duplicates.',
      },
      {
        name: 'Tim Sort (Hybrid Insertion/Merge)',
        algorithmKey: 'Tim Sort',
        timeComplexity: 'O(N) to O(N log N)',
        spaceComplexity: 'O(N)',
        color: '#10b981',
        expectedBehavior: 'Exploits natural runs and handles duplicate streaks efficiently.',
      },
    ],
    correctWinner: 'Tim Sort',
    efficiencyTrapAlgorithm: 'Quick Sort',
    wagerQuestion: 'Which algorithm will finish fastest with the fewest redundant comparisons on this 90% duplicate dataset?',
    options: [
      {
        id: 'opt-a',
        label: 'Tim Sort — It identifies equal/monotone runs and minimizes recursive overhead.',
        isCorrect: true,
        explanation: 'Correct! TimSort detects contiguous non-decreasing runs and handles duplicates with minimal comparisons, whereas standard 2-way QuickSort suffers from redundant equal-element partitions.',
      },
      {
        id: 'opt-b',
        label: 'Quick Sort — It will finish in linear O(N) time because partition scans quickly.',
        isCorrect: false,
        explanation: 'Incorrect. Standard 2-way QuickSort does not group equal keys together; it repeatedly splits equal elements across partitions, degrading toward quadratic O(N^2) behavior.',
      },
      {
        id: 'opt-c',
        label: 'Merge Sort — It has the absolute lowest comparison count on any distribution.',
        isCorrect: false,
        explanation: 'Incorrect. While MergeSort is reliably O(N log N), TimSort takes advantage of existing equal-value runs to finish with fewer comparisons and swaps.',
      },
    ],
    postMortem: {
      theoreticalWinner: 'Tim Sort',
      whyWinnerWon: 'TimSort adaptively measures run lengths. With only 3 unique values, large plateaus of identical values require zero internal re-sorting, allowing TimSort to gallop through merging.',
      whyLosersFailed: 'Classic Lomuto QuickSort repeatedly places identical elements into the right sub-array, causing unbalanced recursion trees of depth O(N).',
      realWorldLesson: 'This is why Java (Arrays.sort for primitives) uses Dual-Pivot Quicksort (Yaroslavskiy) with 3-way partitioning, and Python/Java (Objects) use TimSort.',
      leetCodeRelevance: 'LeetCode 75: Sort Colors (Dutch National Flag problem) specifically teaches why 3-way partitioning is required for arrays with heavy duplicate values.',
    },
  },
  {
    id: 'inversion-rush-nearly-sorted',
    title: 'The Inversion Rush: 98% Sorted Array',
    category: 'sorting',
    difficulty: 'Beginner',
    scenarioDescription:
      'A dataset of N=150 integers where only 3 adjacent pairs have been perturbed (98% pre-sorted). One algorithm can sort this in strictly linear O(N) operations.',
    datasetType: 'Nearly Sorted',
    datasetSize: 150,
    contenders: [
      {
        name: 'Insertion Sort',
        algorithmKey: 'Insertion Sort',
        timeComplexity: 'O(N + K) where K is inversions',
        spaceComplexity: 'O(1)',
        color: '#10b981',
        expectedBehavior: 'Glides over already sorted elements in O(1) step per element.',
      },
      {
        name: 'Quick Sort',
        algorithmKey: 'Quick Sort',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(log N)',
        color: '#f59e0b',
        expectedBehavior: 'Executes full partitioning overhead regardless of pre-sortedness.',
      },
      {
        name: 'Selection Sort',
        algorithmKey: 'Selection Sort',
        timeComplexity: 'O(N^2) always',
        spaceComplexity: 'O(1)',
        color: '#ef4444',
        expectedBehavior: 'Blindly checks all N(N-1)/2 pairs even if already perfectly sorted.',
      },
    ],
    correctWinner: 'Insertion Sort',
    efficiencyTrapAlgorithm: 'Selection Sort',
    wagerQuestion: 'Which algorithm will require the least execution time and minimum comparisons on this 98% pre-sorted array?',
    options: [
      {
        id: 'opt-a',
        label: 'Insertion Sort — Its inner loop terminates immediately on sorted elements, achieving ~O(N) time.',
        isCorrect: true,
        explanation: 'Correct! Insertion Sort is adaptive: when the number of inversions K is small, its runtime is O(N + K), easily outpacing divide-and-conquer algorithms.',
      },
      {
        id: 'opt-b',
        label: 'Selection Sort — It requires fewer swaps than any other algorithm, winning overall.',
        isCorrect: false,
        explanation: 'Incorrect. Although Selection Sort makes at most N swaps, it still performs exactly N(N-1)/2 comparisons regardless of the array order, taking O(N^2) time.',
      },
      {
        id: 'opt-c',
        label: 'Quick Sort — Partitioning eliminates half the elements on each recursive step.',
        isCorrect: false,
        explanation: 'Incorrect. QuickSort must still perform recursive calls and pivot comparisons, adding O(N log N) overhead, while Insertion Sort glides through in O(N).',
      },
    ],
    postMortem: {
      theoreticalWinner: 'Insertion Sort',
      whyWinnerWon: 'Insertion Sort only shifts elements when an inversion is detected. With only 3 inversions, it makes ~150 comparisons and finishes almost instantaneously.',
      whyLosersFailed: 'Selection Sort and QuickSort lack the early-exit adaptive checks for near-sorted data that give Insertion Sort its O(N) best case.',
      realWorldLesson: 'This is why production sort engines (TimSort, V8 Array.prototype.sort, pdqsort) switch to Insertion Sort for small partitions or near-sorted chunks.',
      leetCodeRelevance: 'Recognizing when data is nearly sorted allows choosing Insertion Sort or Tree insertion for streaming real-time metrics.',
    },
  },
  {
    id: 'adversarial-reverse-trap',
    title: 'Adversarial Worst-Case: Reverse Ordered Permutation',
    category: 'sorting',
    difficulty: 'Hard',
    scenarioDescription:
      'A strictly descending array [200, 199, 198, ... 1]. QuickSort choosing the rightmost element as pivot encounters its theoretical worst-case quadratic disaster.',
    datasetType: 'Reversed',
    datasetSize: 200,
    contenders: [
      {
        name: 'Quick Sort (Naive Last-Pivot)',
        algorithmKey: 'Quick Sort',
        timeComplexity: 'O(N^2) Worst Case',
        spaceComplexity: 'O(N) Call Stack',
        color: '#ef4444',
        expectedBehavior: 'Maximal partition imbalance (0 vs N-1), causing N recursive frames.',
      },
      {
        name: 'Heap Sort',
        algorithmKey: 'Heap Sort',
        timeComplexity: 'O(N log N) Guaranteed',
        spaceComplexity: 'O(1)',
        color: '#10b981',
        expectedBehavior: 'Builds max-heap in O(N) time and extracts elements in O(N log N).',
      },
      {
        name: 'Bubble Sort',
        algorithmKey: 'Bubble Sort',
        timeComplexity: 'O(N^2) Worst Case',
        spaceComplexity: 'O(1)',
        color: '#f97316',
        expectedBehavior: 'Performs all N*(N-1)/2 swaps to bubble smallest elements to the front.',
      },
    ],
    correctWinner: 'Heap Sort',
    efficiencyTrapAlgorithm: 'Quick Sort',
    wagerQuestion: 'What will happen when QuickSort races HeapSort on this reverse-ordered dataset?',
    options: [
      {
        id: 'opt-a',
        label: 'HeapSort dominates in O(N log N) while QuickSort degrades to O(N^2) with ~20,000 comparisons.',
        isCorrect: true,
        explanation: 'Correct! Choosing the last element as pivot on a descending array creates partitions of sizes (0, N-1) at every recursion level, degrading QuickSort to O(N^2) time and O(N) recursion stack.',
      },
      {
        id: 'opt-b',
        label: 'QuickSort wins because reversing an array allows instantaneous pivot swaps.',
        isCorrect: false,
        explanation: 'Incorrect. QuickSort does not detect reverse order automatically; naive pivot selection causes maximal partition imbalance.',
      },
      {
        id: 'opt-c',
        label: 'BubbleSort beats HeapSort because adjacent swaps are cache-friendly.',
        isCorrect: false,
        explanation: 'Incorrect. BubbleSort performs exactly 19,900 swaps on a reversed array of size 200, making it extremely slow.',
      },
    ],
    postMortem: {
      theoreticalWinner: 'Heap Sort',
      whyWinnerWon: 'HeapSort builds a binary max-heap in linear O(N) time and guarantees O(N log N) runtime in best, average, and worst cases with zero recursion stack overhead.',
      whyLosersFailed: 'Naive QuickSort encounters maximal partition skew, computing sum(1..N) = ~20,000 comparisons and risking StackOverflowError in environments without tail-call optimization.',
      realWorldLesson: 'Modern C++ `std::sort` uses Introsort: it starts with QuickSort, but automatically switches to HeapSort if recursion depth exceeds 2 * log(N).',
      leetCodeRelevance: 'Avoid naive pivot choices in interview implementations; always pick random pivot or median-of-three.',
    },
  },
  {
    id: 'chokepoint-pathfinding-maze',
    title: 'The Chokepoint: Maze with Narrow Corridors',
    category: 'pathfinding',
    difficulty: 'Intermediate',
    scenarioDescription:
      'A dense labyrinth where the straight-line Euclidean distance points directly through an impenetrable wall, forcing the true shortest path through a detour chokepoint.',
    datasetType: 'Maze Chokepoint',
    datasetSize: 400,
    contenders: [
      {
        name: 'A* Search (Manhattan)',
        algorithmKey: 'A* Search',
        timeComplexity: 'O(E)',
        spaceComplexity: 'O(V)',
        color: '#6366f1',
        expectedBehavior: 'Pushes toward goal heuristic, gets temporarily trapped by wall, then backtracks.',
      },
      {
        name: 'Dijkstra Algorithm',
        algorithmKey: 'Dijkstra',
        timeComplexity: 'O(E + V log V)',
        spaceComplexity: 'O(V)',
        color: '#38bdf8',
        expectedBehavior: 'Uniform radial exploration in all directions without directional bias.',
      },
      {
        name: 'Breadth-First Search (BFS)',
        algorithmKey: 'BFS',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        color: '#10b981',
        expectedBehavior: 'Level-by-level concentric wave exploration finding minimum hops.',
      },
    ],
    correctWinner: 'A* Search',
    wagerQuestion: 'Why does A* Search still find the target in fewer total visited nodes than Dijkstra despite the wall obstacle?',
    options: [
      {
        id: 'opt-a',
        label: 'A* uses f(n) = g(n) + h(n), focusing its search cone only around the detour rather than expanding radially backwards.',
        isCorrect: true,
        explanation: 'Correct! Even when obstructed, the admissible heuristic steers A* toward the target once the chokepoint is found, whereas Dijkstra must expand equally in all directions.',
      },
      {
        id: 'opt-b',
        label: 'Dijkstra visits fewer nodes because it does not compute heuristic distances.',
        isCorrect: false,
        explanation: 'Incorrect. Dijkstra explores uniformly in every direction (expanding circles), visiting vastly more total nodes than heuristic-guided search.',
      },
      {
        id: 'opt-c',
        label: 'BFS is faster than A* on mazes because it does not use a Priority Queue.',
        isCorrect: false,
        explanation: 'Incorrect. BFS expands in full concentric circles identical to unweighted Dijkstra, visiting all non-goal directions.',
      },
    ],
    postMortem: {
      theoreticalWinner: 'A* Search',
      whyWinnerWon: 'A* prioritizes nodes that minimize estimated total cost f(n). Once the detour opening is explored, it immediately surges toward the goal with minimal wasted exploration.',
      whyLosersFailed: 'Dijkstra and BFS have zero directional awareness: they explore backwards, sideways, and into dead ends with equal priority.',
      realWorldLesson: 'Video game navigation meshes and robotics navigation use hierarchical A* with jump-point search to navigate complex maps with minimal memory.',
      leetCodeRelevance: 'LeetCode 1091: Shortest Path in Binary Matrix & LeetCode 773: Sliding Puzzle both favor A* over standard BFS for huge state spaces.',
    },
  },
];

export const BUG_HUNT_CHALLENGES: BugHuntChallenge[] = [
  {
    id: 'binary-search-overflow-bug',
    title: 'The Famous 20-Year-Old Binary Search Bug',
    category: 'searching',
    difficulty: 'Intermediate',
    description:
      'In 2006, Joshua Bloch discovered that Java\'s `Arrays.binarySearch` contained an integer overflow bug that remained hidden for over 9 years. Identify the line and choose the fix.',
    language: 'typescript',
    buggyCode: `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    // ⚠️ Bug line below:
    const mid = Math.floor((low + high) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}`,
    highlightLines: [7],
    options: [
      {
        id: 'fix-1',
        description: 'Replace with: const mid = low + Math.floor((high - low) / 2);',
        codeFix: 'const mid = low + Math.floor((high - low) / 2);',
        isCorrect: true,
        explanation: 'Correct! In languages with bounded 32-bit signed integers (Java, C++, Rust), (low + high) can exceed 2^31 - 1, producing a negative sum. Subtracting high - low prevents integer overflow.',
      },
      {
        id: 'fix-2',
        description: 'Replace with: while (low < high) instead of while (low <= high)',
        codeFix: 'while (low < high)',
        isCorrect: false,
        explanation: 'Incorrect. Changing to low < high causes the algorithm to fail when target is located at the boundaries (e.g. single element arrays).',
      },
      {
        id: 'fix-3',
        description: 'Replace with: high = mid instead of high = mid - 1',
        codeFix: 'high = mid;',
        isCorrect: false,
        explanation: 'Incorrect. Setting high = mid causes an infinite loop when low + 1 === high.',
      },
    ],
    buggyDataset: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21],
    buggyTarget: 19,
    expectedBugSymptom: 'Overflow occurs when array size > 2^30, causing ArrayIndexOutOfBoundsException with negative mid.',
    theoreticalDeepDive: 'In 32-bit arithmetic, max integer is 2,147,483,647. If low + high is 2,147,483,648, it overflows into -2,147,483,648. Using low + (high - low) / 2 or unsigned bit shift `(low + high) >>> 1` guarantees safety.',
  },
  {
    id: 'knapsack-1d-direction-bug',
    title: '0/1 Knapsack: The 1D Space Optimization Direction Trap',
    category: 'dp',
    difficulty: 'Hard',
    description:
      'When optimizing 0/1 Knapsack from a 2D table O(N*W) to a 1D array O(W), the inner capacity loop must iterate in a specific direction. Identify why this code solves Unbounded Knapsack instead.',
    language: 'typescript',
    buggyCode: `function knapsack01(weights: number[], values: number[], W: number): number {
  const dp = new Array(W + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    const wt = weights[i];
    const val = values[i];

    // ⚠️ Bug below: Iterating forward allows using same item multiple times!
    for (let w = wt; w <= W; w++) {
      dp[w] = Math.max(dp[w], dp[w - wt] + val);
    }
  }
  return dp[W];
}`,
    highlightLines: [9],
    options: [
      {
        id: 'fix-a',
        description: 'Iterate capacity backwards: for (let w = W; w >= wt; w--)',
        codeFix: 'for (let w = W; w >= wt; w--)',
        isCorrect: true,
        explanation: 'Correct! In 0/1 knapsack, each item can only be used once. Iterating backwards ensures that dp[w - wt] comes from the PREVIOUS item iteration, preventing multiple inclusions of item i.',
      },
      {
        id: 'fix-b',
        description: 'Initialize dp array with -Infinity instead of 0',
        codeFix: 'const dp = new Array(W + 1).fill(-Infinity);',
        isCorrect: false,
        explanation: 'Incorrect. Initializing with -Infinity only affects exact weight sum problems, not the duplicate item reuse bug.',
      },
      {
        id: 'fix-c',
        description: 'Change Math.max to Math.min',
        codeFix: 'dp[w] = Math.min(dp[w], dp[w - wt] + val);',
        isCorrect: false,
        explanation: 'Incorrect. Knapsack aims to maximize total value.',
      },
    ],
    buggyDataset: [2, 3, 4],
    expectedBugSymptom: 'Forward loop counts item values multiple times, turning 0/1 Knapsack into Unbounded Knapsack.',
    theoreticalDeepDive: 'If you iterate forward w = wt..W, dp[w - wt] has already been updated with item i in the current outer loop. Backward iteration w = W..wt guarantees dp[w - wt] still holds the value from item i-1.',
  },
];
