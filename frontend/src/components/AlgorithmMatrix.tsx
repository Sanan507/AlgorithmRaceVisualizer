import { useState } from 'react';
import { Play, Search, ShieldCheck, Sparkles } from 'lucide-react';

export interface AlgorithmItem {
  id: string;
  name: string;
  category: 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees';
  categoryLabel: string;
  bestTime: string;
  avgTime: string;
  worstTime: string;
  space: string;
  stable?: boolean;
  description: string;
}

const ALGORITHM_DATA: AlgorithmItem[] = [
  // Sorting
  {
    id: 'quicksort',
    name: 'Quick Sort',
    category: 'sorting',
    categoryLabel: 'Sorting Arena',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n²)',
    space: 'O(log n)',
    stable: false,
    description: 'Divide-and-conquer partition algorithm with dynamic pivot selection.',
  },
  {
    id: 'mergesort',
    name: 'Merge Sort',
    category: 'sorting',
    categoryLabel: 'Sorting Arena',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    description: 'Stable recursive divide-and-conquer algorithm with guaranteed O(n log n) runtime.',
  },
  {
    id: 'heapsort',
    name: 'Heap Sort',
    category: 'sorting',
    categoryLabel: 'Sorting Arena',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n log n)',
    space: 'O(1)',
    stable: false,
    description: 'In-place binary heap sorting algorithm with O(1) auxiliary space requirement.',
  },
  {
    id: 'insertionsort',
    name: 'Insertion Sort',
    category: 'sorting',
    categoryLabel: 'Sorting Arena',
    bestTime: 'O(n)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: true,
    description: 'Adaptive linear insertion mechanism optimal for small or nearly sorted arrays.',
  },
  {
    id: 'selectionsort',
    name: 'Selection Sort',
    category: 'sorting',
    categoryLabel: 'Sorting Arena',
    bestTime: 'O(n²)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: false,
    description: 'Repeatedly isolates minimum elements with minimal total memory swaps.',
  },
  {
    id: 'bubblesort',
    name: 'Bubble Sort',
    category: 'sorting',
    categoryLabel: 'Sorting Arena',
    bestTime: 'O(n)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: true,
    description: 'Classic comparison sort stepping through adjacent elements.',
  },
  {
    id: 'radixsort',
    name: 'Radix Sort',
    category: 'sorting',
    categoryLabel: 'Sorting Arena',
    bestTime: 'O(nk)',
    avgTime: 'O(nk)',
    worstTime: 'O(nk)',
    space: 'O(n+k)',
    stable: true,
    description: 'Non-comparison integer sorting algorithm that processes numbers digit-by-digit from least to most significant.',
  },
  {
    id: 'countingsort',
    name: 'Counting Sort',
    category: 'sorting',
    categoryLabel: 'Sorting Arena',
    bestTime: 'O(n+k)',
    avgTime: 'O(n+k)',
    worstTime: 'O(n+k)',
    space: 'O(k)',
    stable: true,
    description: 'Non-comparison integer sorting algorithm that counts value frequencies to construct sorted output.',
  },

  // Searching
  {
    id: 'binarysearch',
    name: 'Binary Search',
    category: 'searching',
    categoryLabel: 'Search Arena',
    bestTime: 'O(1)',
    avgTime: 'O(log n)',
    worstTime: 'O(log n)',
    space: 'O(1)',
    description: 'Logarithmic search space halving on pre-sorted arrays.',
  },
  {
    id: 'jumpsearch',
    name: 'Jump Search',
    category: 'searching',
    categoryLabel: 'Search Arena',
    bestTime: 'O(1)',
    avgTime: 'O(√n)',
    worstTime: 'O(√n)',
    space: 'O(1)',
    description: 'Fixed-step interval jumping with localized linear verification.',
  },
  {
    id: 'linearsearch',
    name: 'Linear Search',
    category: 'searching',
    categoryLabel: 'Search Arena',
    bestTime: 'O(1)',
    avgTime: 'O(n)',
    worstTime: 'O(n)',
    space: 'O(1)',
    description: 'Sequential step-by-step element evaluation for unordered data.',
  },
  {
    id: 'exponentialsearch',
    name: 'Exponential Search',
    category: 'searching',
    categoryLabel: 'Search Arena',
    bestTime: 'O(1)',
    avgTime: 'O(log n)',
    worstTime: 'O(log n)',
    space: 'O(1)',
    description: 'Finds range where target exists by doubling index bounds, then performs binary search within that range.',
  },
  {
    id: 'interpolationsearch',
    name: 'Interpolation Search',
    category: 'searching',
    categoryLabel: 'Search Arena',
    bestTime: 'O(1)',
    avgTime: 'O(log log n)',
    worstTime: 'O(n)',
    space: 'O(1)',
    description: 'Estimates target position based on key value distribution rather than splitting midpoints.',
  },
  {
    id: 'ternarysearch',
    name: 'Ternary Search',
    category: 'searching',
    categoryLabel: 'Search Arena',
    bestTime: 'O(1)',
    avgTime: 'O(log3 n)',
    worstTime: 'O(log3 n)',
    space: 'O(1)',
    description: 'Divides search space into three equal parts using two midpoints to locate target.',
  },

  // Pathfinding
  {
    id: 'astar',
    name: 'A* Search Algorithm',
    category: 'pathfinding',
    categoryLabel: 'Pathfinding Arena',
    bestTime: 'O(1)',
    avgTime: 'O(E log V)',
    worstTime: 'O(E)',
    space: 'O(V)',
    description: 'Heuristic-guided optimal pathfinding combining Manhattan distance & edge weights.',
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'pathfinding',
    categoryLabel: 'Pathfinding Arena',
    bestTime: 'O(V log V)',
    avgTime: 'O((V + E) log V)',
    worstTime: 'O(V²)',
    space: 'O(V)',
    description: 'Guaranteed shortest-path tree exploration for weighted grid graphs.',
  },
  {
    id: 'bfs',
    name: 'Breadth First Search (BFS)',
    category: 'pathfinding',
    categoryLabel: 'Pathfinding Arena',
    bestTime: 'O(1)',
    avgTime: 'O(V + E)',
    worstTime: 'O(V + E)',
    space: 'O(V)',
    description: 'Level-order queue traversal ensuring shortest path on unweighted grids.',
  },
  {
    id: 'bellmanford',
    name: 'Bellman-Ford Algorithm',
    category: 'pathfinding',
    categoryLabel: 'Pathfinding Arena',
    bestTime: 'O(V·E)',
    avgTime: 'O(V·E)',
    worstTime: 'O(V·E)',
    space: 'O(V)',
    description: 'Relaxation-based shortest path algorithm that iteratively relaxes all edges across the graph.',
  },
  {
    id: 'dfs',
    name: 'Depth First Search (DFS)',
    category: 'pathfinding',
    categoryLabel: 'Pathfinding Arena',
    bestTime: 'O(1)',
    avgTime: 'O(V + E)',
    worstTime: 'O(V + E)',
    space: 'O(V)',
    description: 'Recursive stack-based exploration traversing deepest branch vertices.',
  },

  // Dynamic Programming
  {
    id: 'knapsack',
    name: '0/1 Knapsack Problem',
    category: 'dp',
    categoryLabel: 'DP Arena',
    bestTime: 'O(n·W)',
    avgTime: 'O(n·W)',
    worstTime: 'O(n·W)',
    space: 'O(n·W)',
    description: 'Optimal item selection under capacity constraints using 2D subproblem recurrence.',
  },
  {
    id: 'lcs',
    name: 'Longest Common Subsequence (LCS)',
    category: 'dp',
    categoryLabel: 'DP Arena',
    bestTime: 'O(m·n)',
    avgTime: 'O(m·n)',
    worstTime: 'O(m·n)',
    space: 'O(m·n)',
    description: 'Finds longest subsequence present in both strings maintaining relative order.',
  },
  {
    id: 'editdistance',
    name: 'Edit Distance (Levenshtein)',
    category: 'dp',
    categoryLabel: 'DP Arena',
    bestTime: 'O(m·n)',
    avgTime: 'O(m·n)',
    worstTime: 'O(m·n)',
    space: 'O(m·n)',
    description: 'Computes minimum insert/delete/replace operations transforming string A into string B.',
  },
  {
    id: 'coinchange',
    name: 'Coin Change Problem',
    category: 'dp',
    categoryLabel: 'DP Arena',
    bestTime: 'O(n·A)',
    avgTime: 'O(n·A)',
    worstTime: 'O(n·A)',
    space: 'O(A)',
    description: 'Determines fewest coins required to make a target change amount.',
  },

  // Trees & Graphs
  {
    id: 'avl',
    name: 'AVL Tree Self-Balancing',
    category: 'trees',
    categoryLabel: 'Tree Arena',
    bestTime: 'O(log n)',
    avgTime: 'O(log n)',
    worstTime: 'O(log n)',
    space: 'O(n)',
    description: 'Strictly height-balanced BST guaranteeing O(log n) lookups via single/double rotations.',
  },
  {
    id: 'bst',
    name: 'Binary Search Tree (BST)',
    category: 'trees',
    categoryLabel: 'Tree Arena',
    bestTime: 'O(log n)',
    avgTime: 'O(log n)',
    worstTime: 'O(n)',
    space: 'O(n)',
    description: 'Hierarchical node structure maintaining left-smaller, right-greater ordering property.',
  },
  {
    id: 'redblack',
    name: 'Red-Black Tree',
    category: 'trees',
    categoryLabel: 'Tree Arena',
    bestTime: 'O(log n)',
    avgTime: 'O(log n)',
    worstTime: 'O(log n)',
    space: 'O(n)',
    description: 'Balanced BST with color constraints ensuring no path is more than twice as long as another.',
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    category: 'trees',
    categoryLabel: 'Tree Arena',
    bestTime: 'O(k)',
    avgTime: 'O(k)',
    worstTime: 'O(k)',
    space: 'O(Σ·k)',
    description: 'Tree search structure optimized for rapid string prefix lookups and autocomplete.',
  },
];

interface Props {
  onNavigate: (category: 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees' | 'quiz' | 'history' | 'settings') => void;
}

export function AlgorithmMatrix({ onNavigate }: Props) {
  const [filterCategory, setFilterCategory] = useState<'all' | 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlgorithms = ALGORITHM_DATA.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getComplexityClass = (complexity: string) => {
    if (complexity.includes('1') || complexity.includes('log n') || complexity.includes('√n') || complexity.includes('O(k)')) {
      return 'badge-complexity-optimal';
    }
    if (complexity.includes('n log n') || complexity.includes('V + E') || complexity.includes('E log V') || complexity.includes('n·A') || complexity.includes('m·n')) {
      return 'badge-complexity-good';
    }
    return 'badge-complexity-heavy';
  };

  return (
    <div className="algorithm-matrix-section">
      <div className="matrix-header">
        <div className="matrix-badge">
          <Sparkles size={14} className="text-amber-400" />
          <span>ALGORITHM CATALOG & COMPLEXITY MATRIX</span>
        </div>
        <h2 className="matrix-title">Benchmark Directory</h2>
        <p className="matrix-subtitle">
          Explore asymptotic time and space bounds across supported competitive algorithm suites.
        </p>

        <div className="matrix-controls">
          <div className="category-filter-pills">
            {(['all', 'sorting', 'searching', 'pathfinding', 'dp', 'trees'] as const).map((cat) => (
              <button
                key={cat}
                className={`filter-pill ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat === 'all'
                  ? 'All Algorithms'
                  : cat === 'sorting'
                  ? 'Sorting'
                  : cat === 'searching'
                  ? 'Searching'
                  : cat === 'pathfinding'
                  ? 'Pathfinding'
                  : cat === 'dp'
                  ? 'Dynamic Programming'
                  : 'Trees & Graphs'}
              </button>
            ))}
          </div>

          <div className="matrix-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search algorithm or complexity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="matrix-search-input"
            />
          </div>
        </div>
      </div>

      <div className="matrix-table-wrapper">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Arena</th>
              <th>Best Case</th>
              <th>Avg Case</th>
              <th>Worst Case</th>
              <th>Space</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlgorithms.map((algo) => (
              <tr key={algo.id} className="matrix-row">
                <td className="cell-name">
                  <div className="algo-name-container">
                    <strong className="algo-title">{algo.name}</strong>
                    <span className="algo-desc">{algo.description}</span>
                  </div>
                </td>
                <td className="cell-arena">
                  <span className={`arena-tag arena-tag-${algo.category}`}>
                    {algo.categoryLabel}
                  </span>
                </td>
                <td className="cell-complexity">
                  <span className={`complexity-badge ${getComplexityClass(algo.bestTime)}`}>
                    {algo.bestTime}
                  </span>
                </td>
                <td className="cell-complexity">
                  <span className={`complexity-badge ${getComplexityClass(algo.avgTime)}`}>
                    {algo.avgTime}
                  </span>
                </td>
                <td className="cell-complexity">
                  <span className={`complexity-badge ${getComplexityClass(algo.worstTime)}`}>
                    {algo.worstTime}
                  </span>
                </td>
                <td className="cell-complexity">
                  <span className="complexity-badge badge-complexity-space">
                    {algo.space}
                  </span>
                </td>
                <td className="cell-action">
                  <button
                    className="matrix-launch-btn"
                    onClick={() => onNavigate(algo.category)}
                    title={`Launch ${algo.name} in ${algo.categoryLabel}`}
                  >
                    <span>Launch</span>
                    <Play size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAlgorithms.length === 0 && (
          <div className="matrix-empty-state">
            <ShieldCheck size={32} className="text-slate-500" />
            <p>No algorithms match "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
