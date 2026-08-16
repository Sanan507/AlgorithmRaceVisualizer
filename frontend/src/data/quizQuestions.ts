export interface QuizQuestion {
  id: string;
  category: 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees' | 'complexity';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  scenario: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  detailedConcept: string;
  leetcodeReference?: string;
  sampleDataset?: number[];
  recommendedAlgorithm?: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'sort-01',
    category: 'sorting',
    difficulty: 'Medium',
    title: 'Adversarial Pivot Attack on QuickSort',
    scenario: 'You are implementing a search engine ranking pipeline. An adversary discovers you use naive Lomuto partitioning with the last element as the pivot. If they send an already sorted array of size N = 100,000, what happens?',
    codeSnippet: `// Naive Lomuto Partition
int pivot = arr[high];
int i = (low - 1);
for (int j = low; j <= high - 1; j++) {
    if (arr[j] < pivot) {
        i++;
        swap(arr[i], arr[j]);
    }
}
swap(arr[i + 1], arr[high]);`,
    options: [
      {
        id: 'a',
        text: 'The recursion tree degrades to O(N^2) depth with ~5 billion comparisons and stack overflow.',
        isCorrect: true,
        explanation: 'Correct! When the array is already sorted, choosing the last element yields maximally unbalanced partitions of sizes (N-1) and 0 at every step, creating O(N^2) time complexity and O(N) call stack recursion depth.',
      },
      {
        id: 'b',
        text: 'QuickSort finishes in linear O(N) time because no elements need to be swapped.',
        isCorrect: false,
        explanation: 'Incorrect. While minimal swaps occur, every single pair comparison is still executed across all N recursive levels, causing O(N^2) total comparisons.',
      },
      {
        id: 'c',
        text: 'QuickSort automatically switches to HeapSort in O(N log N) time.',
        isCorrect: false,
        explanation: 'Incorrect. That is the behavior of IntroSort (used in C++ std::sort), not pure Lomuto QuickSort.',
      },
      {
        id: 'd',
        text: 'The time complexity remains O(N log N) but auxiliary space becomes O(N).',
        isCorrect: false,
        explanation: 'Incorrect. The time complexity degrades to quadratic O(N^2).',
      },
    ],
    detailedConcept: 'Standard QuickSort with naive pivot selection degrades to O(N^2) on sorted or reverse-sorted data. Production engines prevent this using Median-of-Three, randomized pivots, or TimSort.',
    leetcodeReference: 'LeetCode #912: Sort an Array',
    sampleDataset: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    recommendedAlgorithm: 'Quick Sort',
  },
  {
    id: 'sort-02',
    category: 'sorting',
    difficulty: 'Easy',
    title: 'Sorting Stability in Multi-Column Records',
    scenario: 'You are sorting customer transactions first by Date (secondary), and then by Customer Name (primary). Which sorting algorithm guarantees that transactions for the same customer remain in chronological order?',
    options: [
      {
        id: 'a',
        text: 'Merge Sort or Tim Sort (Stable)',
        isCorrect: true,
        explanation: 'Correct! Stable sorting algorithms preserve the relative order of equal keys. When sorting by Customer Name with MergeSort/TimSort, identical customer names preserve their prior date ordering.',
      },
      {
        id: 'b',
        text: 'Heap Sort (In-place)',
        isCorrect: false,
        explanation: 'HeapSort is not stable because building and sifting the heap swaps elements across distant array positions, destroying prior relative ordering.',
      },
      {
        id: 'c',
        text: 'Quick Sort (Lomuto)',
        isCorrect: false,
        explanation: 'Standard in-place QuickSort is unstable due to long-range partition swaps.',
      },
      {
        id: 'd',
        text: 'Selection Sort',
        isCorrect: false,
        explanation: 'Selection Sort is unstable (e.g. [4a, 4b, 1] swaps 4a with 1, placing 4a after 4b).',
      },
    ],
    detailedConcept: 'A sorting algorithm is stable if two objects with equal keys appear in the same order in sorted output as they appear in the input array. Merge Sort, Insertion Sort, and Tim Sort are stable; QuickSort and HeapSort are unstable.',
    leetcodeReference: 'LeetCode #179: Largest Number',
    recommendedAlgorithm: 'Merge Sort',
  },
  {
    id: 'search-01',
    category: 'searching',
    difficulty: 'Medium',
    title: 'Integer Overflow Bug in Binary Search Midpoint',
    scenario: 'In 2006, Joshua Bloch revealed that standard Java library Binary Search contained an integer overflow bug active since JDK 1.1. Why does `int mid = (low + high) / 2;` fail on massive arrays?',
    codeSnippet: `// Faulty Midpoint Calculation
int low = 0;
int high = arr.length - 1;
while (low <= high) {
    int mid = (low + high) / 2; // <-- Bug occurs here
    if (arr[mid] == target) return mid;
    // ...
}`,
    options: [
      {
        id: 'a',
        text: 'When low + high exceeds Integer.MAX_VALUE (2^31 - 1), the sum overflows into negative numbers, throwing ArrayIndexOutOfBoundsException.',
        isCorrect: true,
        explanation: 'Correct! In 32-bit signed integers, if low + high > 2,147,483,647, the sum overflows to a negative integer, causing arr[mid] to crash with a negative array index.',
      },
      {
        id: 'b',
        text: 'Dividing by 2 truncates floating points and causes infinite recursion.',
        isCorrect: false,
        explanation: 'Incorrect. Integer division truncates towards zero safely; the bug is purely arithmetic 32-bit overflow.',
      },
      {
        id: 'c',
        text: 'Bitwise division cannot handle odd array sizes.',
        isCorrect: false,
        explanation: 'Incorrect. Bit shifts and division handle odd integers properly.',
      },
      {
        id: 'd',
        text: 'The time complexity degrades from O(log N) to O(N).',
        isCorrect: false,
        explanation: 'Incorrect. The bug causes a runtime crash, not complexity degradation.',
      },
    ],
    detailedConcept: 'The safe midpoint calculation in all programming languages is `int mid = low + (high - low) / 2;` or unsigned right shift `int mid = (low + high) >>> 1;`.',
    leetcodeReference: 'LeetCode #704: Binary Search',
    sampleDataset: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
    recommendedAlgorithm: 'Binary Search',
  },
  {
    id: 'path-01',
    category: 'pathfinding',
    difficulty: 'Hard',
    title: 'Admissibility & Consistency of Heuristics in A*',
    scenario: 'You are designing an A* pathfinding bot on a 2D grid where diagonal movement is disallowed (cardinal 4-direction only). If you use Euclidean Distance `sqrt(dx^2 + dy^2)` instead of Manhattan Distance `|dx| + |dy|`, is the path guaranteed to be optimal?',
    options: [
      {
        id: 'a',
        text: 'Yes, because Euclidean distance is strictly less than or equal to true grid distance, satisfying admissibility h(n) <= h*(n).',
        isCorrect: true,
        explanation: 'Correct! Euclidean distance is admissible because a straight line is the shortest possible distance between two points, so it never overestimates the true cardinal grid distance. However, Manhattan distance is more informed (closer to h*) and explores fewer nodes.',
      },
      {
        id: 'b',
        text: 'No, because Euclidean distance overestimates grid distance on diagonals.',
        isCorrect: false,
        explanation: 'Incorrect. Euclidean distance is always <= Manhattan distance (e.g. sqrt(1+1)=1.414 <= 1+1=2), so it never overestimates.',
      },
      {
        id: 'c',
        text: 'No, because A* requires Dijkstra weights on all non-uniform grids.',
        isCorrect: false,
        explanation: 'Incorrect. A* works on any non-negative edge weight graph.',
      },
      {
        id: 'd',
        text: 'Yes, and Euclidean distance will explore fewer nodes than Manhattan distance.',
        isCorrect: false,
        explanation: 'Incorrect. Being less informed (smaller heuristic value), Euclidean distance behaves closer to Dijkstra and explores more nodes than Manhattan.',
      },
    ],
    detailedConcept: 'An A* heuristic h(n) is admissible if it never overestimates the actual cost to reach the goal. A heuristic is consistent (monotone) if h(n) <= c(n, p) + h(p). Admissible heuristics guarantee finding the shortest path.',
    leetcodeReference: 'LeetCode #1091: Shortest Path in Binary Matrix',
    recommendedAlgorithm: 'A* Search',
  },
  {
    id: 'tree-01',
    category: 'trees',
    difficulty: 'Medium',
    title: 'AVL Tree Self-Balancing Rotation Identification',
    scenario: 'You have a balanced AVL Tree. You insert the key 10, creating a Left-Right (LR) imbalance where node 30 has a balance factor of +2, and its left child 20 has a balance factor of -1. What sequence of rotations restores balance?',
    codeSnippet: `      30 (+2)
     /
   20 (-1)
     \\
      25 (Newly inserted)`,
    options: [
      {
        id: 'a',
        text: 'Left Rotation on child (20), followed by Right Rotation on parent (30).',
        isCorrect: true,
        explanation: 'Correct! An LR imbalance is resolved with a double rotation: first a Left Rotation on the left child (20) to transform it into an LL (Left-Left) chain, followed by a Right Rotation on the root (30) bringing 25 to the top.',
      },
      {
        id: 'b',
        text: 'Single Right Rotation on node (30).',
        isCorrect: false,
        explanation: 'A single right rotation would fail to balance an LR zigzag.',
      },
      {
        id: 'c',
        text: 'Right Rotation on node (20), followed by Left Rotation on node (30).',
        isCorrect: false,
        explanation: 'Incorrect. That resolves an RL (Right-Left) imbalance, not an LR.',
      },
      {
        id: 'd',
        text: 'Double Right Rotation on node (30).',
        isCorrect: false,
        explanation: 'Incorrect. Double right rotation does not exist in AVL mechanics.',
      },
    ],
    detailedConcept: 'AVL trees enforce the balance factor property |h_left - h_right| <= 1 for all nodes. Imbalances are classified into LL (Single Right), RR (Single Left), LR (Left then Right), and RL (Right then Left).',
    leetcodeReference: 'LeetCode #110: Balanced Binary Tree',
    recommendedAlgorithm: 'AVL Tree',
  },
  {
    id: 'dp-01',
    category: 'dp',
    difficulty: 'Hard',
    title: 'Space Optimization in 0/1 Knapsack Problem',
    scenario: 'The standard 2D DP table for 0/1 Knapsack uses O(N * W) space. How can we optimize this to O(W) 1D array space while preventing an item from being chosen more than once?',
    codeSnippet: `// 1D DP Array Space Optimization
int[] dp = new int[W + 1];
for (int i = 0; i < N; i++) {
    // How should the inner capacity loop iterate?
    for (int w = ???; w >= weight[i]; w--) {
        dp[w] = Math.max(dp[w], dp[w - weight[i]] + value[i]);
    }
}`,
    options: [
      {
        id: 'a',
        text: 'Iterate capacity w backwards from W down to weight[i], ensuring dp[w - weight[i]] references values from the previous item iteration.',
        isCorrect: true,
        explanation: 'Correct! By iterating capacity backwards from W down to weight[i], dp[w - weight[i]] has not yet been overwritten by the current item i, ensuring each item is used at most once (0/1 constraint). If iterated forward, it solves Unbounded Knapsack.',
      },
      {
        id: 'b',
        text: 'Iterate capacity w forward from weight[i] up to W.',
        isCorrect: false,
        explanation: 'Incorrect! Forward iteration allows items to be reused multiple times, turning it into Unbounded Knapsack.',
      },
      {
        id: 'c',
        text: 'Use two pointers from 0 and W meeting at W/2.',
        isCorrect: false,
        explanation: 'Incorrect. Two pointers do not preserve correct state transitions across all capacities.',
      },
      {
        id: 'd',
        text: 'Space optimization is mathematically impossible for 0/1 Knapsack.',
        isCorrect: false,
        explanation: 'Incorrect. 1D rolling array optimization is the standard production solution.',
      },
    ],
    detailedConcept: 'In 0/1 Knapsack, iterating capacity backwards guarantees that each item is considered at most once. Forward iteration solves the Unbounded Knapsack problem (like Coin Change).',
    leetcodeReference: 'LeetCode #416: Partition Equal Subset Sum',
    recommendedAlgorithm: 'Knapsack DP',
  },
];
