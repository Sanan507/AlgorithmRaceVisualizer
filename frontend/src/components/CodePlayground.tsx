import { useState, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Terminal,
  Sparkles,
} from 'lucide-react';

type SupportedLanguage = 'typescript' | 'python' | 'java' | 'cpp';
type SupportedAlgorithm = 'quicksort' | 'binarysearch' | 'astar' | 'knapsack' | 'avl';

interface CodeSnippet {
  lines: string[];
  activeStepLines: number[]; // Maps step index (0..n) to 1-based line number in `lines`
}

const CODE_DATABASE: Record<SupportedAlgorithm, Record<SupportedLanguage, CodeSnippet>> = {
  quicksort: {
    typescript: {
      lines: [
        'function quickSort(arr: number[], low: number, high: number): void {',
        '  if (low < high) {',
        '    // Partition array and get pivot index',
        '    const pivotIdx = partition(arr, low, high);',
        '    // Recursively sort left and right partitions',
        '    quickSort(arr, low, pivotIdx - 1);',
        '    quickSort(arr, pivotIdx + 1, high);',
        '  }',
        '}',
        '',
        'function partition(arr: number[], low: number, high: number): number {',
        '  const pivot = arr[high];',
        '  let i = low - 1;',
        '  for (let j = low; j < high; j++) {',
        '    if (arr[j] < pivot) {',
        '      i++;',
        '      [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap',
        '    }',
        '  }',
        '  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];',
        '  return i + 1;',
        '}',
      ],
      activeStepLines: [2, 4, 12, 14, 17, 20, 6, 7],
    },
    python: {
      lines: [
        'def quick_sort(arr: list[int], low: int, high: int) -> None:',
        '    if low < high:',
        '        # Partition array around dynamic pivot',
        '        pivot_idx = partition(arr, low, high)',
        '        # Recursively conquer sub-arrays',
        '        quick_sort(arr, low, pivot_idx - 1)',
        '        quick_sort(arr, pivot_idx + 1, high)',
        '',
        'def partition(arr: list[int], low: int, high: int) -> int:',
        '    pivot = arr[high]',
        '    i = low - 1',
        '    for j in range(low, high):',
        '        if arr[j] < pivot:',
        '            i += 1',
        '            arr[i], arr[j] = arr[j], arr[i]',
        '    arr[i + 1], arr[high] = arr[high], arr[i + 1]',
        '    return i + 1',
      ],
      activeStepLines: [2, 4, 10, 12, 15, 16, 6, 7],
    },
    java: {
      lines: [
        'public class QuickSort {',
        '    public static void sort(int[] arr, int low, int high) {',
        '        if (low < high) {',
        '            int pIndex = partition(arr, low, high);',
        '            sort(arr, low, pIndex - 1);',
        '            sort(arr, pIndex + 1, high);',
        '        }',
        '    }',
        '',
        '    private static int partition(int[] arr, int low, int high) {',
        '        int pivot = arr[high];',
        '        int i = (low - 1);',
        '        for (int j = low; j < high; j++) {',
        '            if (arr[j] < pivot) {',
        '                i++;',
        '                swap(arr, i, j);',
        '            }',
        '        }',
        '        swap(arr, i + 1, high);',
        '        return i + 1;',
        '    }',
        '}',
      ],
      activeStepLines: [3, 4, 11, 13, 16, 19, 5, 6],
    },
    cpp: {
      lines: [
        '#include <vector>',
        '#include <algorithm>',
        '',
        'int partition(std::vector<int>& arr, int low, int high) {',
        '    int pivot = arr[high];',
        '    int i = low - 1;',
        '    for (int j = low; j < high; j++) {',
        '        if (arr[j] < pivot) {',
        '            i++;',
        '            std::swap(arr[i], arr[j]);',
        '        }',
        '    }',
        '    std::swap(arr[i + 1], arr[high]);',
        '    return i + 1;',
        '}',
        '',
        'void quickSort(std::vector<int>& arr, int low, int high) {',
        '    if (low < high) {',
        '        int p = partition(arr, low, high);',
        '        quickSort(arr, low, p - 1);',
        '        quickSort(arr, p + 1, high);',
        '    }',
        '}',
      ],
      activeStepLines: [18, 19, 5, 7, 10, 13, 20, 21],
    },
  },

  binarysearch: {
    typescript: {
      lines: [
        'function binarySearch(arr: number[], target: number): number {',
        '  let low = 0;',
        '  let high = arr.length - 1;',
        '',
        '  while (low <= high) {',
        '    const mid = Math.floor((low + high) / 2);',
        '    if (arr[mid] === target) return mid; // Found!',
        '    if (arr[mid] < target) {',
        '      low = mid + 1; // Discard left half',
        '    } else {',
        '      high = mid - 1; // Discard right half',
        '    }',
        '  }',
        '  return -1; // Not found',
        '}',
      ],
      activeStepLines: [2, 3, 5, 6, 8, 9, 7],
    },
    python: {
      lines: [
        'def binary_search(arr: list[int], target: int) -> int:',
        '    low = 0',
        '    high = len(arr) - 1',
        '',
        '    while low <= high:',
        '        mid = (low + high) // 2',
        '        if arr[mid] == target:',
        '            return mid  # Target lock',
        '        elif arr[mid] < target:',
        '            low = mid + 1',
        '        else:',
        '            high = mid - 1',
        '    return -1',
      ],
      activeStepLines: [2, 3, 5, 6, 9, 10, 8],
    },
    java: {
      lines: [
        'public class BinarySearch {',
        '    public static int search(int[] arr, int target) {',
        '        int low = 0;',
        '        int high = arr.length - 1;',
        '        while (low <= high) {',
        '            int mid = low + (high - low) / 2;',
        '            if (arr[mid] == target) return mid;',
        '            if (arr[mid] < target) low = mid + 1;',
        '            else high = mid - 1;',
        '        }',
        '        return -1;',
        '    }',
        '}',
      ],
      activeStepLines: [3, 4, 5, 6, 8, 9, 7],
    },
    cpp: {
      lines: [
        '#include <vector>',
        '',
        'int binarySearch(const std::vector<int>& arr, int target) {',
        '    int low = 0;',
        '    int high = static_cast<int>(arr.size()) - 1;',
        '    while (low <= high) {',
        '        int mid = low + (high - low) / 2;',
        '        if (arr[mid] == target) return mid;',
        '        if (arr[mid] < target) low = mid + 1;',
        '        else high = mid - 1;',
        '    }',
        '    return -1;',
        '}',
      ],
      activeStepLines: [4, 5, 6, 7, 9, 10, 8],
    },
  },

  astar: {
    typescript: {
      lines: [
        'function aStar(start: Node, target: Node, grid: Grid): Path {',
        '  const openSet = new PriorityQueue<Node>((a, b) => a.f - b.f);',
        '  openSet.push(start);',
        '',
        '  while (!openSet.isEmpty()) {',
        '    const current = openSet.pop()!;',
        '    if (current.equals(target)) return reconstructPath(current);',
        '',
        '    for (const neighbor of grid.getNeighbors(current)) {',
        '      const tentativeG = current.g + distance(current, neighbor);',
        '      if (tentativeG < neighbor.g) {',
        '        neighbor.parent = current;',
        '        neighbor.g = tentativeG;',
        '        neighbor.f = neighbor.g + heuristic(neighbor, target);',
        '        if (!openSet.contains(neighbor)) openSet.push(neighbor);',
        '      }',
        '    }',
        '  }',
        '  return []; // Path not found',
        '}',
      ],
      activeStepLines: [2, 3, 5, 6, 9, 10, 14, 7],
    },
    python: {
      lines: [
        'import heapq',
        '',
        'def a_star_search(start, target, grid):',
        '    open_set = []',
        '    heapq.heappush(open_set, (0, start))',
        '    came_from = {}',
        '    g_score = {start: 0}',
        '',
        '    while open_set:',
        '        _, current = heapq.heappop(open_set)',
        '        if current == target:',
        '            return reconstruct_path(came_from, current)',
        '',
        '        for neighbor in grid.neighbors(current):',
        '            tentative_g = g_score[current] + cost(current, neighbor)',
        '            if tentative_g < g_score.get(neighbor, float("inf")):',
        '                came_from[neighbor] = current',
        '                g_score[neighbor] = tentative_g',
        '                f_score = tentative_g + heuristic(neighbor, target)',
        '                heapq.heappush(open_set, (f_score, neighbor))',
        '    return []',
      ],
      activeStepLines: [4, 5, 9, 10, 14, 15, 19, 12],
    },
    java: {
      lines: [
        'public List<Node> aStar(Node start, Node target, Grid grid) {',
        '    PriorityQueue<Node> openSet = new PriorityQueue<>(Comparator.comparingDouble(n -> n.f));',
        '    openSet.add(start);',
        '    while (!openSet.isEmpty()) {',
        '        Node current = openSet.poll();',
        '        if (current.equals(target)) return buildPath(current);',
        '        for (Node neighbor : grid.getNeighbors(current)) {',
        '            double tentativeG = current.g + distance(current, neighbor);',
        '            if (tentativeG < neighbor.g) {',
        '                neighbor.parent = current;',
        '                neighbor.g = tentativeG;',
        '                neighbor.f = neighbor.g + heuristic(neighbor, target);',
        '                openSet.add(neighbor);',
        '            }',
        '        }',
        '    }',
        '    return Collections.emptyList();',
        '}',
      ],
      activeStepLines: [2, 3, 4, 5, 7, 8, 12, 6],
    },
    cpp: {
      lines: [
        '#include <queue>',
        '#include <vector>',
        '',
        'std::vector<Node*> aStar(Node* start, Node* target, Grid& grid) {',
        '    std::priority_queue<Node*, std::vector<Node*>, CompareF> openSet;',
        '    openSet.push(start);',
        '    while (!openSet.empty()) {',
        '        Node* current = openSet.top(); openSet.pop();',
        '        if (current == target) return reconstructPath(current);',
        '        for (Node* neighbor : grid.getNeighbors(current)) {',
        '            double tentativeG = current->g + dist(current, neighbor);',
        '            if (tentativeG < neighbor->g) {',
        '                neighbor->parent = current;',
        '                neighbor->g = tentativeG;',
        '                neighbor->f = neighbor->g + heuristic(neighbor, target);',
        '                openSet.push(neighbor);',
        '            }',
        '        }',
        '    }',
        '    return {};',
        '}',
      ],
      activeStepLines: [5, 6, 7, 8, 10, 11, 15, 9],
    },
  },

  knapsack: {
    typescript: {
      lines: [
        'function knapsack01(weights: number[], values: number[], capacity: number): number {',
        '  const n = weights.length;',
        '  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));',
        '',
        '  for (let i = 1; i <= n; i++) {',
        '    for (let w = 1; w <= capacity; w++) {',
        '      if (weights[i - 1] <= w) {',
        '        dp[i][w] = Math.max(',
        '          dp[i - 1][w], // Exclude item',
        '          values[i - 1] + dp[i - 1][w - weights[i - 1]] // Include item',
        '        );',
        '      } else {',
        '        dp[i][w] = dp[i - 1][w];',
        '      }',
        '    }',
        '  }',
        '  return dp[n][capacity];',
        '}',
      ],
      activeStepLines: [3, 5, 6, 7, 8, 13, 17],
    },
    python: {
      lines: [
        'def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:',
        '    n = len(weights)',
        '    dp = [[0] * (capacity + 1) for _ in range(n + 1)]',
        '',
        '    for i in range(1, n + 1):',
        '        for w in range(1, capacity + 1):',
        '            if weights[i - 1] <= w:',
        '                dp[i][w] = max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]])',
        '            else:',
        '                dp[i][w] = dp[i - 1][w]',
        '    return dp[n][capacity]',
      ],
      activeStepLines: [3, 5, 6, 7, 8, 10, 11],
    },
    java: {
      lines: [
        'public class Knapsack {',
        '    public static int solve(int[] weights, int[] values, int capacity) {',
        '        int n = weights.length;',
        '        int[][] dp = new int[n + 1][capacity + 1];',
        '        for (int i = 1; i <= n; i++) {',
        '            for (int w = 1; w <= capacity; w++) {',
        '                if (weights[i - 1] <= w) {',
        '                    dp[i][w] = Math.max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]);',
        '                } else {',
        '                    dp[i][w] = dp[i - 1][w];',
        '                }',
        '            }',
        '        }',
        '        return dp[n][capacity];',
        '    }',
        '}',
      ],
      activeStepLines: [4, 5, 6, 7, 8, 10, 14],
    },
    cpp: {
      lines: [
        '#include <vector>',
        '#include <algorithm>',
        '',
        'int knapsack01(const std::vector<int>& weights, const std::vector<int>& values, int W) {',
        '    int n = weights.size();',
        '    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(W + 1, 0));',
        '    for (int i = 1; i <= n; ++i) {',
        '        for (int w = 1; w <= W; ++w) {',
        '            if (weights[i - 1] <= w)',
        '                dp[i][w] = std::max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]);',
        '            else',
        '                dp[i][w] = dp[i - 1][w];',
        '        }',
        '    }',
        '    return dp[n][W];',
        '}',
      ],
      activeStepLines: [6, 7, 8, 9, 10, 12, 15],
    },
  },

  avl: {
    typescript: {
      lines: [
        'function rightRotate(y: AVLNode): AVLNode {',
        '  const x = y.left!;',
        '  const T2 = x.right;',
        '  x.right = y;',
        '  y.left = T2;',
        '  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;',
        '  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;',
        '  return x; // New root of subtree',
        '}',
        '',
        'function getBalance(node: AVLNode | null): number {',
        '  return node ? getHeight(node.left) - getHeight(node.right) : 0;',
        '}',
      ],
      activeStepLines: [2, 3, 4, 5, 6, 7, 8, 12],
    },
    python: {
      lines: [
        'def right_rotate(y: AVLNode) -> AVLNode:',
        '    x = y.left',
        '    t2 = x.right',
        '    x.right = y',
        '    y.left = t2',
        '    y.height = max(get_height(y.left), get_height(y.right)) + 1',
        '    x.height = max(get_height(x.left), get_height(x.right)) + 1',
        '    return x  # New subtree root',
        '',
        'def get_balance(node: AVLNode) -> int:',
        '    return get_height(node.left) - get_height(node.right) if node else 0',
      ],
      activeStepLines: [2, 3, 4, 5, 6, 7, 8, 11],
    },
    java: {
      lines: [
        'public class AVLTree {',
        '    private Node rightRotate(Node y) {',
        '        Node x = y.left;',
        '        Node T2 = x.right;',
        '        x.right = y;',
        '        y.left = T2;',
        '        y.height = Math.max(height(y.left), height(y.right)) + 1;',
        '        x.height = Math.max(height(x.left), height(x.right)) + 1;',
        '        return x;',
        '    }',
        '',
        '    private int getBalance(Node n) {',
        '        return (n == null) ? 0 : height(n.left) - height(n.right);',
        '    }',
        '}',
      ],
      activeStepLines: [3, 4, 5, 6, 7, 8, 9, 13],
    },
    cpp: {
      lines: [
        'Node* rightRotate(Node* y) {',
        '    Node* x = y->left;',
        '    Node* T2 = x->right;',
        '    x->right = y;',
        '    y->left = T2;',
        '    y->height = std::max(height(y->left), height(y->right)) + 1;',
        '    x->height = std::max(height(x->left), height(x->right)) + 1;',
        '    return x;',
        '}',
        '',
        'int getBalance(Node* n) {',
        '    return n ? height(n->left) - height(n->right) : 0;',
        '}',
      ],
      activeStepLines: [2, 3, 4, 5, 6, 7, 8, 12],
    },
  },
};

export function CodePlayground() {
  const [algo, setAlgo] = useState<SupportedAlgorithm>('quicksort');
  const [lang, setLang] = useState<SupportedLanguage>('typescript');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const snippet = CODE_DATABASE[algo][lang];
  const maxSteps = snippet.activeStepLines.length;

  // Handle Auto-Play timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % maxSteps);
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, maxSteps]);

  // Reset step index when algorithm or language changes
  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [algo, lang]);

  const activeLineNumber = snippet.activeStepLines[stepIdx] ?? 1;

  const handleCopyCode = () => {
    const fullCode = snippet.lines.join('\n');
    navigator.clipboard.writeText(fullCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-playground-card">
      {/* Top Window Header (macOS Terminal Style) */}
      <div className="code-window-header">
        <div className="window-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>

        {/* Algorithm Dropdown / Tabs */}
        <div className="algo-selector-group">
          {(
            [
              { id: 'quicksort', label: 'QuickSort' },
              { id: 'binarysearch', label: 'Binary Search' },
              { id: 'astar', label: 'A* Search' },
              { id: 'knapsack', label: '0/1 Knapsack' },
              { id: 'avl', label: 'AVL Rotation' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={`algo-tab-btn ${algo === item.id ? 'active-algo' : ''}`}
              onClick={() => setAlgo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Copy Button */}
        <button
          className={`copy-code-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopyCode}
          title="Copy Code to Clipboard"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Language Tabs & Playback Stepper Toolbar */}
      <div className="code-toolbar">
        {/* Language Tabs */}
        <div className="lang-tabs">
          {(
            [
              { id: 'typescript', label: 'TypeScript', ext: '.ts' },
              { id: 'python', label: 'Python', ext: '.py' },
              { id: 'java', label: 'Java', ext: '.java' },
              { id: 'cpp', label: 'C++', ext: '.cpp' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={`lang-tab-btn ${lang === item.id ? 'active-lang' : ''}`}
              onClick={() => setLang(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Step-by-Step Execution Controls */}
        <div className="stepper-controls">
          <span className="step-indicator">
            Line {activeLineNumber} • Step {stepIdx + 1}/{maxSteps}
          </span>

          <button
            className="stepper-btn"
            onClick={() => setStepIdx((prev) => (prev > 0 ? prev - 1 : maxSteps - 1))}
            title="Previous Step"
          >
            <RotateCcw size={12} />
          </button>

          <button
            className={`stepper-btn ${isPlaying ? 'btn-active-play' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Stepper' : 'Auto Play Stepper'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>

          <button
            className="stepper-btn"
            onClick={() => setStepIdx((prev) => (prev + 1) % maxSteps)}
            title="Next Step"
          >
            <SkipForward size={12} />
          </button>
        </div>
      </div>

      {/* Code Editor Body with Line-by-Line Tracking */}
      <div className="code-body-wrapper">
        <pre className="code-pre">
          <code>
            {snippet.lines.map((lineText, lineIdx) => {
              const lineNum = lineIdx + 1;
              const isActive = lineNum === activeLineNumber;

              return (
                <div
                  key={lineIdx}
                  className={`code-line-row ${isActive ? 'active-executing-line' : ''}`}
                >
                  <span className="code-line-number">{lineNum}</span>
                  <span className="code-line-content">{lineText || ' '}</span>
                  {isActive && <span className="active-line-indicator">← ACTIVE</span>}
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
