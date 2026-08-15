import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  BarChart3,
  GitBranch,
  Layers,
  Cpu,
  Binary,
  FastForward,
} from 'lucide-react';

export type HeroSimMode = 'sorting' | 'pathfinding' | 'dp' | 'trees' | 'searching';

interface SortingStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot?: number;
}

interface PathfindingStep {
  grid: number[][]; // 0: empty, 1: wall, 2: visitedA, 3: visitedB, 4: path, 5: start, 6: target
  pathNodes: [number, number][];
  currentPos?: [number, number];
  stats: { visited: number; pathLength: number; status: string };
}

interface DPStep {
  table: (number | null)[][];
  currentRow: number;
  currentCol: number;
  highlightedCells: [number, number][];
  optimalPath: [number, number][];
  currentVal: number;
}

interface TreeStep {
  nodes: { id: number; val: number; x: number; y: number; level: number; status: 'normal' | 'active' | 'rotated' | 'balanced' }[];
  edges: { from: number; to: number }[];
  statusText: string;
}

interface SearchStep {
  array: number[];
  low: number;
  mid: number;
  high: number;
  target: number;
  found: boolean;
  stepCount: number;
}

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth <= 768;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function HeroMiniCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<HeroSimMode>('sorting');
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion());
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(1);
  const [isMobileDevice, setIsMobileDevice] = useState(isMobileViewport);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [isVisible, setIsVisible] = useState(true);

  // Dynamic Telemetry States
  const [sortingStats, setSortingStats] = useState({
    lane1: { name: 'QuickSort', comps: 0, swaps: 0, status: 'Racing...' },
    lane2: { name: 'BubbleSort', comps: 0, swaps: 0, status: 'Racing...' },
  });
  const [pathfindingStats, setPathfindingStats] = useState({ visited: 0, pathLength: 0, status: 'Exploring...' });
  const [dpStats, setDPStats] = useState({ cell: '0,0', optimalVal: 0, status: 'Filling Matrix...' });
  const [treeStats, setTreeStats] = useState({ balance: 'In-Balance', rotations: 0, status: 'Inserting nodes...' });
  const [searchStats, setSearchStats] = useState({ low: 0, mid: 0, high: 0, step: 0, status: 'Halving Search Space...' });

  // Simulation State Storage
  const simState = useRef<{
    stepIdx: number;
    maxSteps: number;
    timer: number | null;
    // Sorting Data
    qSteps: SortingStep[];
    bSteps: SortingStep[];
    // Pathfinding Data
    pathSteps: PathfindingStep[];
    // DP Data
    dpSteps: DPStep[];
    // Tree Data
    treeSteps: TreeStep[];
    // Search Data
    searchSteps: SearchStep[];
  }>({
    stepIdx: 0,
    maxSteps: 0,
    timer: null,
    qSteps: [],
    bSteps: [],
    pathSteps: [],
    dpSteps: [],
    treeSteps: [],
    searchSteps: [],
  });

  // Handle Resize and Accessibility preferences
  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(isMobileViewport());
      const reduceMotion = prefersReducedMotion();
      setReducedMotion(reduceMotion);
      if (reduceMotion) setIsPlaying(false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver: Pause simulation when scrolled out of view to consume 0% idle CPU
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Tab Visibility API: Pause when backgrounded
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ----------------------------------------------------
  // STEP GENERATORS FOR ALL 5 MODES
  // ----------------------------------------------------

  // 1. Sorting Step Generator
  const generateSortingSimulation = () => {
    const size = isMobileDevice ? 16 : 22;
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 20);

    // QuickSort
    const qSteps: SortingStep[] = [];
    const qArr = [...arr];
    const quickSortHelper = (low: number, high: number) => {
      if (low < high) {
        const pivotVal = qArr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
          qSteps.push({
            array: [...qArr],
            comparing: [j, high],
            swapping: [],
            sorted: [],
            pivot: high,
          });
          if (qArr[j] < pivotVal) {
            i++;
            if (i !== j) {
              const temp = qArr[i];
              qArr[i] = qArr[j];
              qArr[j] = temp;
              qSteps.push({
                array: [...qArr],
                comparing: [],
                swapping: [i, j],
                sorted: [],
                pivot: high,
              });
            }
          }
        }
        const temp = qArr[i + 1];
        qArr[i + 1] = qArr[high];
        qArr[high] = temp;
        const pIndex = i + 1;
        qSteps.push({
          array: [...qArr],
          comparing: [],
          swapping: [i + 1, high],
          sorted: [pIndex],
          pivot: pIndex,
        });

        quickSortHelper(low, pIndex - 1);
        quickSortHelper(pIndex + 1, high);
      }
    };
    quickSortHelper(0, qArr.length - 1);
    qSteps.push({
      array: [...qArr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: qArr.length }, (_, k) => k),
    });

    // BubbleSort
    const bSteps: SortingStep[] = [];
    const bArr = [...arr];
    const n = bArr.length;
    const sortedSoFar: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        bSteps.push({
          array: [...bArr],
          comparing: [j, j + 1],
          swapping: [],
          sorted: [...sortedSoFar],
        });
        if (bArr[j] > bArr[j + 1]) {
          const temp = bArr[j];
          bArr[j] = bArr[j + 1];
          bArr[j + 1] = temp;
          bSteps.push({
            array: [...bArr],
            comparing: [],
            swapping: [j, j + 1],
            sorted: [...sortedSoFar],
          });
        }
      }
      sortedSoFar.push(n - 1 - i);
    }
    sortedSoFar.push(0);
    bSteps.push({
      array: [...bArr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, k) => k),
    });

    simState.current.qSteps = qSteps;
    simState.current.bSteps = bSteps;
    simState.current.maxSteps = Math.max(qSteps.length, bSteps.length);
    simState.current.stepIdx = 0;
  };

  // 2. Pathfinding Step Generator (A* Wavefront on 2D Grid)
  const generatePathfindingSimulation = () => {
    const rows = 11;
    const cols = 23;
    const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    const start: [number, number] = [5, 2];
    const target: [number, number] = [5, 20];

    // Procedural Walls
    for (let r = 2; r < 9; r++) {
      if (r !== 5 && r !== 6) grid[r][7] = 1;
      if (r !== 3 && r !== 4) grid[r][15] = 1;
    }
    grid[start[0]][start[1]] = 5;
    grid[target[0]][target[1]] = 6;

    const steps: PathfindingStep[] = [];
    const openSet: [number, number][] = [[start[0], start[1]]];
    const visited = new Set<string>([`${start[0]},${start[1]}`]);
    const parentMap = new Map<string, [number, number]>();

    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    let foundTarget = false;
    let iterations = 0;

    while (openSet.length > 0 && !foundTarget && iterations < 200) {
      iterations++;
      // A* heuristic sort
      openSet.sort((a, b) => {
        const distA = Math.abs(a[0] - target[0]) + Math.abs(a[1] - target[1]);
        const distB = Math.abs(b[0] - target[0]) + Math.abs(b[1] - target[1]);
        return distA - distB;
      });

      const current = openSet.shift()!;
      const [cr, cc] = current;

      if (cr === target[0] && cc === target[1]) {
        foundTarget = true;
        break;
      }

      if (grid[cr][cc] !== 5 && grid[cr][cc] !== 6) {
        grid[cr][cc] = 2; // Visited
      }

      for (const [dr, dc] of directions) {
        const nr = cr + dr;
        const nc = cc + dc;
        const key = `${nr},${nc}`;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== 1 && !visited.has(key)) {
          visited.add(key);
          parentMap.set(key, [cr, cc]);
          openSet.push([nr, nc]);
          if (grid[nr][nc] !== 6) {
            grid[nr][nc] = 3; // Open Set Wavefront
          }
        }
      }

      const gridCopy = grid.map((r) => [...r]);
      steps.push({
        grid: gridCopy,
        pathNodes: [],
        currentPos: [cr, cc],
        stats: { visited: visited.size, pathLength: 0, status: 'A* Wavefront Expanding...' },
      });
    }

    // Trace shortest path
    const path: [number, number][] = [];
    let currKey = `${target[0]},${target[1]}`;
    while (parentMap.has(currKey)) {
      const p = parentMap.get(currKey)!;
      path.unshift(p);
      currKey = `${p[0]},${p[1]}`;
    }

    // Path tracing animation steps
    const finalGrid = grid.map((r) => [...r]);
    for (let i = 0; i < path.length; i++) {
      const [pr, pc] = path[i];
      if (finalGrid[pr][pc] !== 5 && finalGrid[pr][pc] !== 6) {
        finalGrid[pr][pc] = 4; // Shortest Path
      }
      steps.push({
        grid: finalGrid.map((r) => [...r]),
        pathNodes: path.slice(0, i + 1),
        currentPos: [pr, pc],
        stats: { visited: visited.size, pathLength: i + 1, status: 'Tracing Optimal Shortest Path 🏆' },
      });
    }

    simState.current.pathSteps = steps;
    simState.current.maxSteps = steps.length;
    simState.current.stepIdx = 0;
  };

  // 3. Dynamic Programming Step Generator (0/1 Knapsack Grid)
  const generateDPMatrixSimulation = () => {
    const weights = [2, 3, 4, 5];
    const values = [3, 4, 5, 8];
    const capacity = 6;
    const n = weights.length;

    const dp: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(null));
    for (let w = 0; w <= capacity; w++) dp[0][w] = 0;
    for (let i = 0; i <= n; i++) dp[i][0] = 0;

    const steps: DPStep[] = [];

    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= capacity; w++) {
        const highlighted: [number, number][] = [[i - 1, w]];
        let optVal = dp[i - 1][w] ?? 0;

        if (weights[i - 1] <= w) {
          highlighted.push([i - 1, w - weights[i - 1]]);
          optVal = Math.max(optVal, (dp[i - 1][w - weights[i - 1]] ?? 0) + values[i - 1]);
        }
        dp[i][w] = optVal;

        steps.push({
          table: dp.map((row) => [...row]),
          currentRow: i,
          currentCol: w,
          highlightedCells: highlighted,
          optimalPath: [],
          currentVal: optVal,
        });
      }
    }

    // Trace back optimal items
    let curW = capacity;
    const optCells: [number, number][] = [];
    for (let i = n; i > 0; i--) {
      if (dp[i][curW] !== dp[i - 1][curW]) {
        optCells.push([i, curW]);
        curW -= weights[i - 1];
      }
    }

    steps.push({
      table: dp.map((row) => [...row]),
      currentRow: n,
      currentCol: capacity,
      highlightedCells: [],
      optimalPath: optCells,
      currentVal: dp[n][capacity] ?? 0,
    });

    simState.current.dpSteps = steps;
    simState.current.maxSteps = steps.length;
    simState.current.stepIdx = 0;
  };

  // 4. Tree Balancing / AVL Step Generator
  const generateTreeSimulation = () => {
    const steps: TreeStep[] = [];
    const valuesToInsert = [50, 25, 75, 15, 35, 65, 85, 10];

    const basePositions = [
      { id: 1, val: 50, x: 290, y: 40, level: 0 },
      { id: 2, val: 25, x: 150, y: 100, level: 1 },
      { id: 3, val: 75, x: 430, y: 100, level: 1 },
      { id: 4, val: 15, x: 80, y: 165, level: 2 },
      { id: 5, val: 35, x: 220, y: 165, level: 2 },
      { id: 6, val: 65, x: 360, y: 165, level: 2 },
      { id: 7, val: 85, x: 500, y: 165, level: 2 },
      { id: 8, val: 10, x: 40, y: 225, level: 3 },
    ];

    const edges = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 6 },
      { from: 3, to: 7 },
      { from: 4, to: 8 },
    ];

    for (let i = 1; i <= valuesToInsert.length; i++) {
      const activeNodes = basePositions.slice(0, i).map((n, idx) => ({
        ...n,
        status: idx === i - 1 ? ('active' as const) : ('normal' as const),
      }));

      const activeEdges = edges.filter((e) => e.from <= i && e.to <= i);

      steps.push({
        nodes: activeNodes,
        edges: activeEdges,
        statusText: `Inserting Node (${valuesToInsert[i - 1]}). Balancing factors: O(log N)`,
      });
    }

    // Add balancing rotation frame
    steps.push({
      nodes: basePositions.map((n) => ({
        ...n,
        status: n.val === 25 || n.val === 15 ? 'rotated' : 'balanced',
      })),
      edges,
      statusText: 'AVL Self-Balancing: Right-Rotation executed. Tree Balanced 🌳',
    });

    simState.current.treeSteps = steps;
    simState.current.maxSteps = steps.length;
    simState.current.stepIdx = 0;
  };

  // 5. Binary Search Step Generator
  const generateSearchingSimulation = () => {
    const size = 17;
    const array = Array.from({ length: size }, (_, i) => (i + 1) * 5 + Math.floor(Math.random() * 2));
    const target = array[Math.floor(Math.random() * (size - 2)) + 1];

    const steps: SearchStep[] = [];
    let low = 0;
    let high = size - 1;
    let stepCount = 0;
    let found = false;

    while (low <= high) {
      stepCount++;
      const mid = Math.floor((low + high) / 2);
      const isMatch = array[mid] === target;

      steps.push({
        array: [...array],
        low,
        mid,
        high,
        target,
        found: isMatch,
        stepCount,
      });

      if (isMatch) {
        found = true;
        break;
      }

      if (array[mid] < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    simState.current.searchSteps = steps;
    simState.current.maxSteps = steps.length;
    simState.current.stepIdx = 0;
  };

  // ----------------------------------------------------
  // INITIALIZE / RESET ACTIVE SIMULATION
  // ----------------------------------------------------
  const resetSimulation = useCallback(() => {
    if (mode === 'sorting') {
      generateSortingSimulation();
      setSortingStats({
        lane1: { name: 'QuickSort', comps: 0, swaps: 0, status: 'Racing...' },
        lane2: { name: 'BubbleSort', comps: 0, swaps: 0, status: 'Racing...' },
      });
    } else if (mode === 'pathfinding') {
      generatePathfindingSimulation();
      setPathfindingStats({ visited: 0, pathLength: 0, status: 'Exploring Grid...' });
    } else if (mode === 'dp') {
      generateDPMatrixSimulation();
      setDPStats({ cell: '0,0', optimalVal: 0, status: 'Filling Matrix...' });
    } else if (mode === 'trees') {
      generateTreeSimulation();
      setTreeStats({ balance: 'Evaluating', rotations: 0, status: 'Inserting nodes...' });
    } else if (mode === 'searching') {
      generateSearchingSimulation();
      setSearchStats({ low: 0, mid: 0, high: 0, step: 0, status: 'Halving Search Space...' });
    }
  }, [mode, isMobileDevice]);

  // ----------------------------------------------------
  // CANVAS RENDERING DISPATCHER
  // ----------------------------------------------------
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina / High-DPI Scaling
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth || 580;
    const displayHeight = canvas.clientHeight || 260;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = displayWidth;
    const height = displayHeight;

    ctx.clearRect(0, 0, width, height);

    // Dark sleek background
    ctx.fillStyle = '#080a10';
    ctx.fillRect(0, 0, width, height);

    // Subtle technical grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const idx = simState.current.stepIdx;

    if (mode === 'sorting') {
      drawSortingMode(ctx, width, height, idx);
    } else if (mode === 'pathfinding') {
      drawPathfindingMode(ctx, width, height, idx);
    } else if (mode === 'dp') {
      drawDPMode(ctx, width, height, idx);
    } else if (mode === 'trees') {
      drawTreeMode(ctx, width, height, idx);
    } else if (mode === 'searching') {
      drawSearchMode(ctx, width, height, idx);
    }

    ctx.restore();
  }, [mode]);

  // Mode 1: Draw Sorting
  const drawSortingMode = (ctx: CanvasRenderingContext2D, width: number, height: number, stepIdx: number) => {
    const laneHeight = (height - 35) / 2;
    const qStep = simState.current.qSteps[Math.min(stepIdx, simState.current.qSteps.length - 1)];
    const bStep = simState.current.bSteps[Math.min(stepIdx, simState.current.bSteps.length - 1)];

    // Lane 1: QuickSort
    drawArrayLane(ctx, 15, laneHeight, qStep, '#a855f7', 'QuickSort (O(N log N))');

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.beginPath();
    ctx.moveTo(15, laneHeight + 17);
    ctx.lineTo(width - 15, laneHeight + 17);
    ctx.stroke();

    // Lane 2: BubbleSort
    drawArrayLane(ctx, laneHeight + 25, laneHeight, bStep, '#3b82f6', 'BubbleSort (O(N²))');
  };

  const drawArrayLane = (
    ctx: CanvasRenderingContext2D,
    yOffset: number,
    height: number,
    step: SortingStep | undefined,
    primaryColor: string,
    _label: string
  ) => {
    if (!step) return;
    const padding = 20;
    const availableWidth = (canvasRef.current?.clientWidth || 580) - padding * 2;
    const n = step.array.length;
    const barGap = 4;
    const barWidth = Math.max(3, (availableWidth - (n - 1) * barGap) / n);
    const maxVal = 100;

    step.array.forEach((val, i) => {
      const barHeight = (val / maxVal) * (height - 20);
      const x = padding + i * (barWidth + barGap);
      const y = yOffset + height - barHeight;

      let fill = '#334155';
      let shadowColor = 'transparent';
      let shadowBlur = 0;

      if (step.sorted.includes(i)) {
        fill = '#10b981';
        shadowColor = 'rgba(16, 185, 129, 0.6)';
        shadowBlur = 8;
      } else if (step.swapping.includes(i)) {
        fill = '#ec4899';
        shadowColor = 'rgba(236, 72, 153, 0.8)';
        shadowBlur = 10;
      } else if (step.comparing.includes(i)) {
        fill = '#f59e0b';
        shadowColor = 'rgba(245, 158, 11, 0.7)';
        shadowBlur = 8;
      } else if (step.pivot === i) {
        fill = '#c084fc';
        shadowColor = 'rgba(192, 132, 252, 0.8)';
        shadowBlur = 10;
      } else {
        fill = primaryColor;
      }

      ctx.save();
      ctx.fillStyle = fill;
      if (shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
      }
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
      ctx.fill();
      ctx.restore();
    });
  };

  // Mode 2: Draw Pathfinding Grid
  const drawPathfindingMode = (ctx: CanvasRenderingContext2D, width: number, height: number, stepIdx: number) => {
    const step = simState.current.pathSteps[Math.min(stepIdx, simState.current.pathSteps.length - 1)];
    if (!step) return;

    const rows = step.grid.length;
    const cols = step.grid[0].length;
    const cellSize = Math.min((width - 40) / cols, (height - 30) / rows);
    const startX = (width - cols * cellSize) / 2;
    const startY = (height - rows * cellSize) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = step.grid[r][c];
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        let fill = '#111827';
        let shadow = 'transparent';

        if (val === 1) fill = '#374151'; // Wall
        else if (val === 2) fill = 'rgba(6, 182, 212, 0.5)'; // Visited
        else if (val === 3) fill = 'rgba(245, 158, 11, 0.7)'; // Wavefront Open
        else if (val === 4) {
          fill = '#10b981'; // Shortest Path
          shadow = 'rgba(16, 185, 129, 0.8)';
        } else if (val === 5) fill = '#3b82f6'; // Start
        else if (val === 6) fill = '#ef4444'; // Target

        ctx.save();
        ctx.fillStyle = fill;
        if (shadow !== 'transparent') {
          ctx.shadowColor = shadow;
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, 2);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  // Mode 3: Draw DP Matrix
  const drawDPMode = (ctx: CanvasRenderingContext2D, width: number, height: number, stepIdx: number) => {
    const step = simState.current.dpSteps[Math.min(stepIdx, simState.current.dpSteps.length - 1)];
    if (!step) return;

    const rows = step.table.length;
    const cols = step.table[0].length;
    const cellW = Math.min(65, (width - 60) / cols);
    const cellH = Math.min(38, (height - 40) / rows);
    const startX = (width - cols * cellW) / 2;
    const startY = (height - rows * cellH) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = step.table[r][c];
        const x = startX + c * cellW;
        const y = startY + r * cellH;

        const isCurrent = r === step.currentRow && c === step.currentCol;
        const isHighlight = step.highlightedCells.some(([hr, hc]) => hr === r && hc === c);
        const isOptimal = step.optimalPath.some(([opr, opc]) => opr === r && opc === c);

        let bg = 'rgba(255, 255, 255, 0.03)';
        let border = 'rgba(255, 255, 255, 0.08)';

        if (isCurrent) {
          bg = 'rgba(168, 85, 247, 0.35)';
          border = '#c084fc';
        } else if (isHighlight) {
          bg = 'rgba(245, 158, 11, 0.25)';
          border = '#f59e0b';
        } else if (isOptimal) {
          bg = 'rgba(16, 185, 129, 0.35)';
          border = '#10b981';
        }

        ctx.save();
        ctx.fillStyle = bg;
        ctx.strokeStyle = border;
        ctx.lineWidth = isCurrent || isOptimal ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, cellW - 4, cellH - 4, 4);
        ctx.fill();
        ctx.stroke();

        // Cell Value
        if (val !== null) {
          ctx.fillStyle = isOptimal ? '#10b981' : isCurrent ? '#c084fc' : '#e2e8f0';
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(val), x + cellW / 2, y + cellH / 2);
        }
        ctx.restore();
      }
    }
  };

  // Mode 4: Draw Trees
  const drawTreeMode = (ctx: CanvasRenderingContext2D, width: number, height: number, stepIdx: number) => {
    const step = simState.current.treeSteps[Math.min(stepIdx, simState.current.treeSteps.length - 1)];
    if (!step) return;

    // Scale positions to fit current width/height
    const scaleX = width / 580;
    const scaleY = height / 260;

    // Draw Edges
    step.edges.forEach((edge) => {
      const fromNode = step.nodes.find((n) => n.id === edge.from);
      const toNode = step.nodes.find((n) => n.id === edge.to);
      if (fromNode && toNode) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromNode.x * scaleX, fromNode.y * scaleY);
        ctx.lineTo(toNode.x * scaleX, toNode.y * scaleY);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw Nodes
    step.nodes.forEach((node) => {
      const nx = node.x * scaleX;
      const ny = node.y * scaleY;
      const radius = 16;

      let fill = '#1e293b';
      let stroke = '#64748b';
      let shadow = 'transparent';

      if (node.status === 'active') {
        fill = '#7c3aed';
        stroke = '#c084fc';
        shadow = 'rgba(192, 132, 252, 0.8)';
      } else if (node.status === 'rotated') {
        fill = '#ec4899';
        stroke = '#f472b6';
        shadow = 'rgba(236, 72, 153, 0.8)';
      } else if (node.status === 'balanced') {
        fill = '#059669';
        stroke = '#34d399';
        shadow = 'rgba(52, 211, 153, 0.7)';
      }

      ctx.save();
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      if (shadow !== 'transparent') {
        ctx.shadowColor = shadow;
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.arc(nx, ny, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(node.val), nx, ny);
      ctx.restore();
    });
  };

  // Mode 5: Draw Binary Search
  const drawSearchMode = (ctx: CanvasRenderingContext2D, width: number, height: number, stepIdx: number) => {
    const step = simState.current.searchSteps[Math.min(stepIdx, simState.current.searchSteps.length - 1)];
    if (!step) return;

    const padding = 20;
    const availableWidth = width - padding * 2;
    const n = step.array.length;
    const boxGap = 4;
    const boxWidth = (availableWidth - (n - 1) * boxGap) / n;
    const boxHeight = 44;
    const yCenter = (height - boxHeight) / 2;

    step.array.forEach((val, i) => {
      const x = padding + i * (boxWidth + boxGap);
      const inRange = i >= step.low && i <= step.high;
      const isMid = i === step.mid;
      const isMatch = isMid && step.found;

      let fill = inRange ? '#1e293b' : 'rgba(30, 41, 59, 0.3)';
      let border = inRange ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)';
      let textCol = inRange ? '#e2e8f0' : '#475569';
      let shadow = 'transparent';

      if (isMatch) {
        fill = '#10b981';
        border = '#34d399';
        textCol = '#ffffff';
        shadow = 'rgba(16, 185, 129, 0.8)';
      } else if (isMid) {
        fill = '#6366f1';
        border = '#818cf8';
        textCol = '#ffffff';
        shadow = 'rgba(99, 102, 241, 0.8)';
      }

      ctx.save();
      ctx.fillStyle = fill;
      ctx.strokeStyle = border;
      ctx.lineWidth = isMid ? 2 : 1;
      if (shadow !== 'transparent') {
        ctx.shadowColor = shadow;
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.roundRect(x, yCenter, boxWidth, boxHeight, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textCol;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(val), x + boxWidth / 2, yCenter + boxHeight / 2);
      ctx.restore();
    });
  };

  // ----------------------------------------------------
  // INITIALIZE / RESET SIMULATION ON MODE SWITCH
  // ----------------------------------------------------
  useEffect(() => {
    resetSimulation();
    // Render initial static preview frame immediately on mount/mode switch
    requestAnimationFrame(() => {
      renderCanvas();
    });
  }, [resetSimulation, renderCanvas]);

  // ----------------------------------------------------
  // MAIN ANIMATION LOOP
  // ----------------------------------------------------
  useEffect(() => {
    if (!isPlaying || !isVisible || reducedMotion) {
      if (simState.current.timer) clearInterval(simState.current.timer);
      return;
    }

    const baseDelay = mode === 'sorting' ? 70 : mode === 'pathfinding' ? 60 : 120;
    const intervalTime = Math.max(20, baseDelay / speedMultiplier);

    simState.current.timer = window.setInterval(() => {
      const curr = simState.current.stepIdx;
      const max = simState.current.maxSteps;

      if (curr < max - 1) {
        simState.current.stepIdx++;
        renderCanvas();

        // Update mode telemetry
        if (mode === 'sorting') {
          const qLen = simState.current.qSteps.length;
          const bLen = simState.current.bSteps.length;
          setSortingStats({
            lane1: {
              name: 'QuickSort',
              comps: Math.floor(Math.min(curr, qLen) * 0.8),
              swaps: Math.floor(Math.min(curr, qLen) * 0.4),
              status: curr >= qLen - 1 ? 'Winner 🏆' : 'Racing...',
            },
            lane2: {
              name: 'BubbleSort',
              comps: Math.floor(Math.min(curr, bLen) * 0.9),
              swaps: Math.floor(Math.min(curr, bLen) * 0.5),
              status: curr >= bLen - 1 ? 'Completed' : 'Racing...',
            },
          });
        } else if (mode === 'pathfinding') {
          const step = simState.current.pathSteps[curr];
          if (step) setPathfindingStats(step.stats);
        } else if (mode === 'dp') {
          const step = simState.current.dpSteps[curr];
          if (step) {
            setDPStats({
              cell: `${step.currentRow},${step.currentCol}`,
              optimalVal: step.currentVal,
              status: curr >= max - 1 ? 'Optimal Substructure Solved 🏆' : 'Memoizing Subproblems...',
            });
          }
        } else if (mode === 'trees') {
          const step = simState.current.treeSteps[curr];
          if (step) {
            setTreeStats({
              balance: curr >= max - 1 ? 'Balanced (AVL Factor 0)' : 'Rebalancing Tree',
              rotations: curr >= max - 1 ? 1 : 0,
              status: step.statusText,
            });
          }
        } else if (mode === 'searching') {
          const step = simState.current.searchSteps[curr];
          if (step) {
            setSearchStats({
              low: step.low,
              mid: step.mid,
              high: step.high,
              step: step.stepCount,
              status: step.found ? `Target ${step.target} Found in ${step.stepCount} steps! 🎯` : 'Halving Search Space...',
            });
          }
        }
      } else {
        // Loop simulation after short pause
        setTimeout(() => {
          resetSimulation();
        }, 2200);
      }
    }, intervalTime);

    return () => {
      if (simState.current.timer) clearInterval(simState.current.timer);
    };
  }, [isPlaying, isVisible, speedMultiplier, mode, reducedMotion, renderCanvas, resetSimulation]);

  return (
    <div className="hero-mini-canvas-container" ref={containerRef}>
      {/* Top Header with Mode Tabs */}
      <div className="hero-canvas-top-bar">
        <div className="hero-mode-tabs-list" role="tablist">
          <button
            className={`hero-mode-tab-btn ${mode === 'sorting' ? 'active' : ''}`}
            onClick={() => setMode('sorting')}
            role="tab"
            aria-selected={mode === 'sorting'}
          >
            <BarChart3 size={14} />
            <span>Sorting Race</span>
          </button>

          <button
            className={`hero-mode-tab-btn ${mode === 'pathfinding' ? 'active' : ''}`}
            onClick={() => setMode('pathfinding')}
            role="tab"
            aria-selected={mode === 'pathfinding'}
          >
            <GitBranch size={14} />
            <span>A* Maze</span>
          </button>

          <button
            className={`hero-mode-tab-btn ${mode === 'dp' ? 'active' : ''}`}
            onClick={() => setMode('dp')}
            role="tab"
            aria-selected={mode === 'dp'}
          >
            <Layers size={14} />
            <span>DP Matrix</span>
          </button>

          <button
            className={`hero-mode-tab-btn ${mode === 'trees' ? 'active' : ''}`}
            onClick={() => setMode('trees')}
            role="tab"
            aria-selected={mode === 'trees'}
          >
            <Cpu size={14} />
            <span>AVL Tree</span>
          </button>

          <button
            className={`hero-mode-tab-btn ${mode === 'searching' ? 'active' : ''}`}
            onClick={() => setMode('searching')}
            role="tab"
            aria-selected={mode === 'searching'}
          >
            <Binary size={14} />
            <span>Binary Search</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="hero-canvas-actions">
          <button
            className="hero-speed-btn"
            onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : speedMultiplier === 2 ? 4 : 1)}
            title="Adjust Simulation Speed"
          >
            <FastForward size={13} />
            <span>{speedMultiplier}x</span>
          </button>

          <button
            className="hero-canvas-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Simulator' : 'Play Simulator'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            className="hero-canvas-btn"
            onClick={resetSimulation}
            title="Re-generate Simulation Dataset"
          >
            <RotateCcw size={13} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Canvas Element Wrapper */}
      <div className="hero-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="hero-canvas-element"
        />
      </div>

      {/* Dynamic Telemetry Footer */}
      <div className="hero-canvas-footer-stats">
        {mode === 'sorting' && (
          <>
            <div className="lane-stat-pill lane-1-pill">
              <Zap size={13} className="pill-icon text-purple-400" />
              <span className="pill-title">{sortingStats.lane1.name}:</span>
              <span className="pill-val">{sortingStats.lane1.comps} comps</span>
              <span className={`pill-badge ${sortingStats.lane1.status.includes('Winner') ? 'badge-winner' : ''}`}>
                {sortingStats.lane1.status}
              </span>
            </div>

            <div className="lane-stat-pill lane-2-pill">
              <Zap size={13} className="pill-icon text-blue-400" />
              <span className="pill-title">{sortingStats.lane2.name}:</span>
              <span className="pill-val">{sortingStats.lane2.comps} comps</span>
              <span className="pill-badge">{sortingStats.lane2.status}</span>
            </div>
          </>
        )}

        {mode === 'pathfinding' && (
          <div className="lane-stat-pill lane-1-pill" style={{ width: '100%' }}>
            <GitBranch size={13} className="pill-icon text-cyan-400" />
            <span className="pill-title">A* Wavefront:</span>
            <span className="pill-val">{pathfindingStats.visited} nodes evaluated</span>
            <span className="pill-val" style={{ color: '#10b981' }}>Path: {pathfindingStats.pathLength} steps</span>
            <span className="pill-badge badge-winner">{pathfindingStats.status}</span>
          </div>
        )}

        {mode === 'dp' && (
          <div className="lane-stat-pill lane-1-pill" style={{ width: '100%' }}>
            <Layers size={13} className="pill-icon text-purple-400" />
            <span className="pill-title">Knapsack Table:</span>
            <span className="pill-val">Cell: [{dpStats.cell}]</span>
            <span className="pill-val" style={{ color: '#a855f7' }}>Max Value: ${dpStats.optimalVal}</span>
            <span className="pill-badge badge-winner">{dpStats.status}</span>
          </div>
        )}

        {mode === 'trees' && (
          <div className="lane-stat-pill lane-1-pill" style={{ width: '100%' }}>
            <Cpu size={13} className="pill-icon text-amber-400" />
            <span className="pill-title">AVL Tree:</span>
            <span className="pill-val">{treeStats.balance}</span>
            <span className="pill-badge badge-winner">{treeStats.status}</span>
          </div>
        )}

        {mode === 'searching' && (
          <div className="lane-stat-pill lane-1-pill" style={{ width: '100%' }}>
            <Binary size={13} className="pill-icon text-blue-400" />
            <span className="pill-title">Binary Search:</span>
            <span className="pill-val">Step {searchStats.step} (Log₂ N)</span>
            <span className="pill-badge badge-winner">{searchStats.status}</span>
          </div>
        )}
      </div>
    </div>
  );
}
