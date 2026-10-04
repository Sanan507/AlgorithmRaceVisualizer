import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { AlgoRaceLogo } from '../components/AlgoRaceLogo';
import {
  BarChart3,
  Binary,
  GitBranch,
  Volume2,
  Zap,
  ArrowRight,
  Cpu,
  Layers,
  Menu,
  X,
  Sun,
  Moon,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Check,
  Compass,
  Gauge,
  Timer,
  Workflow,
  Target,
  Award,
  Flame,
  ShieldCheck,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const HeroMiniCanvas = lazy(() => import('../components/HeroMiniCanvas').then(m => ({ default: m.HeroMiniCanvas })));
const AlgorithmMatrix = lazy(() => import('../components/AlgorithmMatrix').then(m => ({ default: m.AlgorithmMatrix })));

export type NavigationPage = 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees' | 'quiz' | 'history' | 'settings';

interface Props {
  onNavigate: (page: NavigationPage) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'What is the worst-case time complexity of QuickSort when the pivot chosen is always an extreme element?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    correct: 1,
    explanation: 'Unbalanced partitions of size (n - 1) and 0 produce a recursion tree of depth n, yielding O(n²) total comparisons.',
  },
  {
    question: 'Which traversal algorithm guarantees shortest path on an unweighted grid with minimum overhead?',
    options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Bellman-Ford', 'Floyd-Warshall'],
    correct: 1,
    explanation: 'Breadth-First Search explores vertices in order of frontier distance, guaranteeing the shortest unweighted path in O(V + E).',
  },
  {
    question: 'In dynamic programming, what principle enables caching identical subproblem solutions?',
    options: ['Overlapping Subproblems', 'Greedy Choice Property', 'Amortized Time Complexity', 'Bitmask Permutations'],
    correct: 0,
    explanation: 'Overlapping subproblems allow storing computed results in memoization tables or matrices, eliminating redundant recalculation.',
  },
];

export function LandingPage({ onNavigate, darkMode = true, setDarkMode }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'sorting' | 'pathfinding' | 'dp' | 'quiz'>('sorting');

  // ── 1. Interactive Sorting Stepper State ──
  const [sortBars, setSortBars] = useState<number[]>([52, 24, 78, 31, 95, 63, 17, 84]);
  const [sortMachine, setSortMachine] = useState<{ i: number; j: number; isSorted: boolean }>({
    i: 0,
    j: 0,
    isSorted: false,
  });
  const [comparingIdxs, setComparingIdxs] = useState<number[]>([]);
  const [swappingIdxs, setSwappingIdxs] = useState<number[]>([]);
  const [sortedIdxs, setSortedIdxs] = useState<number[]>([]);
  const [sortComps, setSortComps] = useState(0);
  const [sortSwaps, setSortSwaps] = useState(0);
  const [isAutoSorting, setIsAutoSorting] = useState(false);

  // ── 2. Interactive Pathfinding 7x7 Grid State ──
  const [gridWalls, setGridWalls] = useState<boolean[]>(() => {
    const initial = new Array(49).fill(false);
    [8, 9, 10, 17, 24, 25, 26, 31, 38, 39, 40].forEach(idx => {
      initial[idx] = true;
    });
    return initial;
  });

  // ── 3. Interactive DP Knapsack Matrix State ──
  const [activeDpCell, setActiveDpCell] = useState<{ r: number; c: number }>({ r: 2, c: 3 });

  // ── 4. Interactive AlgoGym Quiz State ──
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [viewMode, setViewMode] = useState<'tabbed' | 'all'>('tabbed');

  const ARENAS_LIST = [
    { key: 'sorting' as const, label: 'Sorting Arena', id: 'card-sorting' },
    { key: 'pathfinding' as const, label: 'Pathfinding Grid', id: 'card-pathfinding' },
    { key: 'dp' as const, label: 'DP Matrix', id: 'card-dp' },
    { key: 'quiz' as const, label: 'Complexity Drills', id: 'card-quiz' },
  ];

  const handleTabClick = (key: 'sorting' | 'pathfinding' | 'dp' | 'quiz', id: string) => {
    setActiveTab(key);
    if (viewMode === 'all') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrevArena = () => {
    const idx = ARENAS_LIST.findIndex(a => a.key === activeTab);
    const prevIdx = (idx - 1 + ARENAS_LIST.length) % ARENAS_LIST.length;
    setActiveTab(ARENAS_LIST[prevIdx].key);
  };

  const handleNextArena = () => {
    const idx = ARENAS_LIST.findIndex(a => a.key === activeTab);
    const nextIdx = (idx + 1) % ARENAS_LIST.length;
    setActiveTab(ARENAS_LIST[nextIdx].key);
  };

  const handleNavClick = (page: NavigationPage) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  // ── Step-by-Step Sorting Machine ──
  const stepSort = useCallback(() => {
    if (sortMachine.isSorted) {
      setSortedIdxs(sortBars.map((_, idx) => idx));
      setIsAutoSorting(false);
      return;
    }

    const arr = [...sortBars];
    const { i, j } = sortMachine;
    const comps = sortComps + 1;
    let swaps = sortSwaps;
    const newSorted = [...sortedIdxs];

    setComparingIdxs([j, j + 1]);

    if (arr[j] > arr[j + 1]) {
      const temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
      swaps += 1;
      setSwappingIdxs([j, j + 1]);
    } else {
      setSwappingIdxs([]);
    }

    let nextJ = j + 1;
    let nextI = i;
    let isDone = false;

    if (nextJ >= arr.length - 1 - i) {
      newSorted.push(arr.length - 1 - i);
      nextJ = 0;
      nextI = i + 1;
    }

    if (nextI >= arr.length - 1) {
      for (let k = 0; k < arr.length; k++) {
        if (!newSorted.includes(k)) newSorted.push(k);
      }
      isDone = true;
      setIsAutoSorting(false);
    }

    setSortBars(arr);
    setSortComps(comps);
    setSortSwaps(swaps);
    setSortedIdxs(newSorted);
    setSortMachine({ i: nextI, j: nextJ, isSorted: isDone });

    setTimeout(() => {
      setComparingIdxs([]);
      setSwappingIdxs([]);
    }, 240);
  }, [sortBars, sortMachine, sortComps, sortSwaps, sortedIdxs]);

  // Auto-run sorting animation loop
  useEffect(() => {
    if (!isAutoSorting) return;
    const timer = setInterval(() => {
      stepSort();
    }, 320);
    return () => clearInterval(timer);
  }, [isAutoSorting, stepSort]);

  const shuffleSort = () => {
    setIsAutoSorting(false);
    const fresh = Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 15);
    setSortBars(fresh);
    setSortMachine({ i: 0, j: 0, isSorted: false });
    setComparingIdxs([]);
    setSwappingIdxs([]);
    setSortedIdxs([]);
    setSortComps(0);
    setSortSwaps(0);
  };

  // ── 7x7 BFS Pathfinding Grid ──
  const toggleGridWall = (idx: number) => {
    if (idx === 0 || idx === 48) return;
    setGridWalls(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const randomizeMaze = () => {
    const next = new Array(49).fill(false);
    for (let i = 1; i < 48; i++) {
      if (Math.random() < 0.28) {
        next[i] = true;
      }
    }
    setGridWalls(next);
  };

  const clearMaze = () => {
    setGridWalls(new Array(49).fill(false));
  };

  const computeShortestPath = () => {
    const start = 0;
    const target = 48;
    const queue: number[] = [start];
    const visited = new Set<number>([start]);
    const parent = new Map<number, number>();

    const getNeighbors = (node: number) => {
      const r = Math.floor(node / 7);
      const c = node % 7;
      const neighbors: number[] = [];
      if (r > 0) neighbors.push(node - 7);
      if (r < 6) neighbors.push(node + 7);
      if (c > 0) neighbors.push(node - 1);
      if (c < 6) neighbors.push(node + 1);
      return neighbors.filter(n => !gridWalls[n]);
    };

    let found = false;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === target) {
        found = true;
        break;
      }
      for (const n of getNeighbors(curr)) {
        if (!visited.has(n)) {
          visited.add(n);
          parent.set(n, curr);
          queue.push(n);
        }
      }
    }

    const path: number[] = [];
    if (found) {
      let curr = target;
      while (curr !== start) {
        path.push(curr);
        curr = parent.get(curr)!;
      }
      path.push(start);
    }
    return { path, visitedCount: visited.size };
  };

  const { path: computedPath, visitedCount } = computeShortestPath();

  // ── DP Knapsack Calculation ──
  const dpWeights = [0, 2, 3, 4, 5];
  const dpValues = [0, 3, 4, 5, 8];

  const computeDpTable = () => {
    const table: number[][] = Array.from({ length: 5 }, () => new Array(6).fill(0));
    for (let i = 1; i <= 4; i++) {
      for (let w = 1; w <= 5; w++) {
        if (dpWeights[i] <= w) {
          table[i][w] = Math.max(table[i - 1][w], table[i - 1][w - dpWeights[i]] + dpValues[i]);
        } else {
          table[i][w] = table[i - 1][w];
        }
      }
    }
    return table;
  };
  const dpTable = computeDpTable();

  // ── AlgoGym Quiz ──
  const currentQuiz = SAMPLE_QUIZ_QUESTIONS[currentQuizIdx];
  const handleSelectQuizOption = (optIdx: number) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(optIdx);
    if (optIdx === currentQuiz.correct) {
      setQuizScore(s => s + 1);
    }
  };

  const nextQuizQuestion = () => {
    setSelectedQuizOption(null);
    setCurrentQuizIdx(prev => (prev + 1) % SAMPLE_QUIZ_QUESTIONS.length);
  };

  return (
    <div className={`landing-page ${!darkMode ? 'light-mode' : ''} gitlab-landing`}>
      <div className="gl-bg-mesh" />
      <div className="gl-grid-pattern" />

      {/* ── 1. Sticky Navbar ── */}
      <header className="gl-navbar">
        <div className="gl-nav-brand" onClick={() => scrollToSection('hero')}>
          <AlgoRaceLogo size={30} showText={true} />
        </div>

        <nav className="gl-nav-links" aria-label="Main Navigation">
          <button type="button" onClick={() => scrollToSection('showcase')} className="gl-nav-link-btn">
            <Layers size={14} className="text-amber-400" />
            <span>Arenas</span>
          </button>
          <button type="button" onClick={() => scrollToSection('simulator')} className="gl-nav-link-btn">
            <Zap size={14} className="text-cyan-400" />
            <span>Simulator</span>
          </button>
          <button type="button" onClick={() => scrollToSection('architecture')} className="gl-nav-link-btn">
            <Cpu size={14} className="text-purple-400" />
            <span>Architecture</span>
          </button>
          <button type="button" onClick={() => scrollToSection('specs')} className="gl-nav-link-btn">
            <Sliders size={14} className="text-emerald-400" />
            <span>Specs</span>
          </button>
          <button type="button" onClick={() => scrollToSection('matrix')} className="gl-nav-link-btn">
            <Binary size={14} className="text-blue-400" />
            <span>Matrix</span>
          </button>
        </nav>

        <div className="gl-nav-actions">
          {setDarkMode && (
            <button
              type="button"
              className="gl-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>
          )}

          <button
            type="button"
            className="gl-btn-primary"
            onClick={() => handleNavClick('sorting')}
          >
            <Zap size={15} />
            <span>Launch Arena</span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            className="gl-menu-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="gl-mobile-drawer">
            <button type="button" onClick={() => scrollToSection('showcase')} className="gl-nav-link-btn">
              <Layers size={16} className="text-amber-400" />
              <span>Arenas Showcase</span>
            </button>
            <button type="button" onClick={() => scrollToSection('simulator')} className="gl-nav-link-btn">
              <Zap size={16} className="text-cyan-400" />
              <span>Live Simulator</span>
            </button>
            <button type="button" onClick={() => scrollToSection('architecture')} className="gl-nav-link-btn">
              <Cpu size={16} className="text-purple-400" />
              <span>System Architecture</span>
            </button>
            <button type="button" onClick={() => scrollToSection('specs')} className="gl-nav-link-btn">
              <Sliders size={16} className="text-emerald-400" />
              <span>Technical Specs</span>
            </button>
            <button type="button" onClick={() => scrollToSection('matrix')} className="gl-nav-link-btn">
              <Binary size={16} className="text-blue-400" />
              <span>Algorithm Matrix</span>
            </button>
            <button
              type="button"
              className="gl-btn-primary"
              style={{ marginTop: '8px', width: '100%' }}
              onClick={() => handleNavClick('sorting')}
            >
              <span>Launch Arena</span>
              <ArrowRight size={15} />
            </button>
          </nav>
        )}
      </header>

      {/* ── 2. High-Craft Hero Section ── */}
      <section id="hero" className="gl-hero">
        <h1 className="gl-hero-heading">
          Race algorithms head-to-head.
          <span className="gl-hero-glow-text">Zero bias. Microsecond telemetry.</span>
        </h1>

        <p className="gl-hero-subhead">
          Benchmark sorting, pathfinding, and dynamic programming side-by-side on identical datasets with 60 FPS hardware canvas and synthesized Web Audio.
        </p>

        <div className="gl-hero-actions">
          <button
            type="button"
            className="gl-btn-primary"
            style={{ padding: '12px 26px', fontSize: '0.98rem' }}
            onClick={() => handleNavClick('sorting')}
          >
            <BarChart3 size={18} />
            <span>Launch Sorting Arena</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="gl-btn-secondary"
            style={{ padding: '12px 26px', fontSize: '0.98rem' }}
            onClick={() => scrollToSection('simulator')}
          >
            <Play size={16} className="text-cyan-400" />
            <span>Interactive Simulator</span>
          </button>
        </div>

        {/* Floating Interactive Hotkeys Dock */}
        <div className="gl-hero-dock">
          <span className="gl-dock-label">Direct Arenas:</span>
          <button type="button" className="gl-dock-chip" onClick={() => handleNavClick('sorting')}>
            <BarChart3 size={13} className="text-amber-400" />
            <kbd>1</kbd> <span>Sorting</span>
          </button>
          <button type="button" className="gl-dock-chip" onClick={() => handleNavClick('searching')}>
            <Binary size={13} className="text-blue-400" />
            <kbd>2</kbd> <span>Search</span>
          </button>
          <button type="button" className="gl-dock-chip" onClick={() => handleNavClick('pathfinding')}>
            <Compass size={13} className="text-cyan-400" />
            <kbd>3</kbd> <span>Pathfinding</span>
          </button>
          <button type="button" className="gl-dock-chip" onClick={() => handleNavClick('dp')}>
            <Layers size={13} className="text-purple-400" />
            <kbd>4</kbd> <span>DP</span>
          </button>
          <button type="button" className="gl-dock-chip" onClick={() => handleNavClick('trees')}>
            <Cpu size={13} className="text-emerald-400" />
            <kbd>5</kbd> <span>Trees</span>
          </button>
          <button type="button" className="gl-dock-chip" onClick={() => handleNavClick('quiz')}>
            <Trophy size={13} className="text-yellow-400" />
            <kbd>6</kbd> <span>AlgoGym</span>
          </button>
        </div>
      </section>

      {/* ── 4. Centerpiece Dual-Lane Canvas Terminal Frame ── */}
      <section id="simulator" className="gl-simulator-section">
        <div className="gl-console-frame">
          <div className="gl-console-header">
            <div className="gl-console-dots">
              <span className="gl-dot gl-dot-red" />
              <span className="gl-dot gl-dot-yellow" />
              <span className="gl-dot gl-dot-green" />
            </div>
            <div className="gl-console-title">
              <Activity size={15} className="text-emerald-400" />
              <span>Dual-Lane Simulation Engine (60 FPS)</span>
            </div>
            <div className="gl-console-meta">
              <span className="gl-telemetry-badge">
                <Check size={12} /> Direct 2D Context
              </span>
              <span>Deterministic Seeds</span>
            </div>
          </div>

          <div className="gl-console-body">
            <Suspense fallback={<div style={{ height: '340px', background: '#090a10', borderRadius: '10px' }} />}>
              <HeroMiniCanvas />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── 5. Interactive Stacking Arenas ── */}
      <section id="showcase" className="gl-showcase-section">
        <div className="gl-section-heading-wrap">
          <div className="gl-section-pill">
            <Layers size={13} />
            <span>Interactive Arenas</span>
          </div>
          <h2 className="gl-section-title">Test drive the arenas live</h2>
          <p className="gl-section-desc">
            Interact with the core simulation engines directly on this page before launching a full-scale competition.
          </p>
        </div>

        {/* Arena Workbench Controls: Dynamic Tabs & View Mode */}
        <div className="gl-tabs-controls-row">
          <div className="gl-stack-tabs-bar" role="tablist">
            <button
              type="button"
              className={`gl-stack-tab-btn ${activeTab === 'sorting' ? 'active tab-sorting' : ''}`}
              onClick={() => handleTabClick('sorting', 'card-sorting')}
            >
              <span className="gl-tab-icon-wrap" style={{ background: 'rgba(252, 109, 38, 0.15)', color: '#fc6d26' }}>
                <BarChart3 size={15} />
              </span>
              <span>Sorting Arena</span>
            </button>
            <button
              type="button"
              className={`gl-stack-tab-btn ${activeTab === 'pathfinding' ? 'active tab-pathfinding' : ''}`}
              onClick={() => handleTabClick('pathfinding', 'card-pathfinding')}
            >
              <span className="gl-tab-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <Compass size={15} />
              </span>
              <span>Pathfinding Grid</span>
            </button>
            <button
              type="button"
              className={`gl-stack-tab-btn ${activeTab === 'dp' ? 'active tab-dp' : ''}`}
              onClick={() => handleTabClick('dp', 'card-dp')}
            >
              <span className="gl-tab-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                <Layers size={15} />
              </span>
              <span>DP Matrix</span>
            </button>
            <button
              type="button"
              className={`gl-stack-tab-btn ${activeTab === 'quiz' ? 'active tab-quiz' : ''}`}
              onClick={() => handleTabClick('quiz', 'card-quiz')}
            >
              <span className="gl-tab-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Trophy size={15} />
              </span>
              <span>Complexity Drills</span>
            </button>
          </div>

          <div className="gl-view-mode-pill">
            <button
              type="button"
              className={`gl-view-mode-btn ${viewMode === 'tabbed' ? 'active' : ''}`}
              onClick={() => setViewMode('tabbed')}
            >
              Tabbed
            </button>
            <button
              type="button"
              className={`gl-view-mode-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              View All
            </button>
          </div>
        </div>

        <ul className="gl-stacking-list">
          {/* Card 1: Sorting */}
          <li id="card-sorting" className="gl-stacking-card" style={{ display: viewMode === 'all' || activeTab === 'sorting' ? 'grid' : 'none' }}>
            <div className="gl-workbench-info">
              <div>
                <div className="gl-icon-hub hub-orange">
                  <BarChart3 size={26} />
                </div>
                <span className="gl-card-kicker">Sorting Benchmark</span>
                <h3 className="gl-card-title">Deterministic Multi-Lane Sorting</h3>
                <p className="gl-card-desc">
                  Run QuickSort, MergeSort, and HeapSort simultaneously on identical seeds. Observe active comparisons, pivot partitioning, and sorted sub-arrays in real time.
                </p>

                <div className="gl-spec-pills">
                  <span className="gl-spec-pill">
                    <Gauge size={13} className="text-amber-400" />
                    <span>O(n log n) Best</span>
                  </span>
                  <span className="gl-spec-pill">
                    <Timer size={13} className="text-amber-400" />
                    <span>Microsecond Precision</span>
                  </span>
                  <span className="gl-spec-pill">
                    <Volume2 size={13} className="text-amber-400" />
                    <span>Web Audio Synced</span>
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="gl-btn-primary"
                  onClick={() => handleNavClick('sorting')}
                >
                  <span>Launch Sorting Arena</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="gl-workbench-sim">
              <div className="gl-sim-widget">
                <div className="gl-widget-header">
                  <span className="gl-widget-tag">
                    <BarChart3 size={14} />
                    <span>Bubble Sort Stepper</span>
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className={`gl-widget-btn ${isAutoSorting ? 'active-run' : ''}`}
                      onClick={() => setIsAutoSorting(!isAutoSorting)}
                      title={isAutoSorting ? 'Pause Auto Sort' : 'Auto Run Sorting'}
                    >
                      {isAutoSorting ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isAutoSorting ? 'Pause' : 'Auto Run'}</span>
                    </button>
                    <button type="button" className="gl-widget-btn" onClick={stepSort} title="Execute one step">
                      <Play size={12} /> <span>Step</span>
                    </button>
                    <button type="button" className="gl-widget-btn" onClick={shuffleSort} title="Shuffle array">
                      <RotateCcw size={12} /> <span>Shuffle</span>
                    </button>
                  </div>
                </div>

                <div className="gl-sort-bars-area">
                  {sortBars.map((val, idx) => {
                    const isComp = comparingIdxs.includes(idx);
                    const isSwap = swappingIdxs.includes(idx);
                    const isSorted = sortedIdxs.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`gl-sort-bar-col ${isComp ? 'comparing' : ''} ${isSwap ? 'swapping' : ''} ${isSorted ? 'sorted' : ''}`}
                        style={{ height: `${(val / 100) * 100}%` }}
                      />
                    );
                  })}
                </div>

                <div className="gl-widget-telemetry-row">
                  <span>Comps: <strong>{sortComps}</strong></span>
                  <span>Swaps: <strong>{sortSwaps}</strong></span>
                  <span style={{ color: sortMachine.isSorted ? '#10b981' : '#38bdf8' }}>
                    {sortMachine.isSorted ? '✓ Fully Sorted' : isAutoSorting ? '⚡ Running...' : 'Click "Auto Run"'}
                  </span>
                </div>
              </div>
            </div>

            {viewMode === 'tabbed' && (
              <div className="gl-workbench-footer-nav">
                <button type="button" className="gl-workbench-nav-btn" onClick={handlePrevArena}>
                  <ChevronLeft size={15} />
                  <span>Prev: Complexity Drills</span>
                </button>
                <div className="gl-workbench-nav-dots">
                  {ARENAS_LIST.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      className={`gl-workbench-nav-dot ${activeTab === a.key ? 'active' : ''}`}
                      onClick={() => setActiveTab(a.key)}
                      title={`Go to ${a.label}`}
                    />
                  ))}
                </div>
                <button type="button" className="gl-workbench-nav-btn" onClick={handleNextArena}>
                  <span>Next: Pathfinding Grid</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </li>

          {/* Card 2: Pathfinding */}
          <li id="card-pathfinding" className="gl-stacking-card" style={{ display: viewMode === 'all' || activeTab === 'pathfinding' ? 'grid' : 'none' }}>
            <div className="gl-workbench-info">
              <div>
                <div className="gl-icon-hub hub-cyan">
                  <Compass size={26} />
                </div>
                <span className="gl-card-kicker">Graph & Pathfinding</span>
                <h3 className="gl-card-title">Heuristic 2D Pathfinding</h3>
                <p className="gl-card-desc">
                  Draw obstacle barriers directly on the grid and watch BFS and A* compute shortest routes with instantaneous frontier exploration.
                </p>

                <div className="gl-spec-pills">
                  <span className="gl-spec-pill">
                    <Workflow size={13} className="text-cyan-400" />
                    <span>O(V + E) Bounds</span>
                  </span>
                  <span className="gl-spec-pill">
                    <Target size={13} className="text-cyan-400" />
                    <span>Manhattan Metric</span>
                  </span>
                  <span className="gl-spec-pill">
                    <Activity size={13} className="text-cyan-400" />
                    <span>Frontier Inspector</span>
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="gl-btn-primary"
                  onClick={() => handleNavClick('pathfinding')}
                >
                  <span>Launch Pathfinding Arena</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="gl-workbench-sim">
              <div className="gl-sim-widget">
                <div className="gl-widget-header">
                  <span className="gl-widget-tag" style={{ color: '#06b6d4' }}>
                    <Compass size={14} />
                    <span>Dynamic Obstacle Grid (7×7)</span>
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="gl-widget-btn" onClick={randomizeMaze}>
                      <span>Maze</span>
                    </button>
                    <button type="button" className="gl-widget-btn" onClick={clearMaze}>
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <div className="gl-grid-canvas">
                  {gridWalls.map((isWall, idx) => {
                    const isStart = idx === 0;
                    const isTarget = idx === 48;
                    const isPath = computedPath.includes(idx) && !isStart && !isTarget;
                    return (
                      <div
                        key={idx}
                        className={`gl-grid-tile ${isStart ? 'tile-start' : ''} ${isTarget ? 'tile-target' : ''} ${isWall ? 'tile-wall' : ''} ${isPath ? 'tile-path' : ''}`}
                        onClick={() => toggleGridWall(idx)}
                      />
                    );
                  })}
                </div>

                <div className="gl-widget-telemetry-row">
                  <span>Visited: <strong>{visitedCount}</strong></span>
                  <span>Path: <strong>{computedPath.length ? `${computedPath.length - 1} steps` : 'Blocked'}</strong></span>
                  <span style={{ color: computedPath.length ? '#10b981' : '#ef4444' }}>
                    {computedPath.length ? '✓ Route Solved' : '⚠️ Route Blocked'}
                  </span>
                </div>
              </div>
            </div>

            {viewMode === 'tabbed' && (
              <div className="gl-workbench-footer-nav">
                <button type="button" className="gl-workbench-nav-btn" onClick={handlePrevArena}>
                  <ChevronLeft size={15} />
                  <span>Prev: Sorting Arena</span>
                </button>
                <div className="gl-workbench-nav-dots">
                  {ARENAS_LIST.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      className={`gl-workbench-nav-dot ${activeTab === a.key ? 'active' : ''}`}
                      onClick={() => setActiveTab(a.key)}
                      title={`Go to ${a.label}`}
                    />
                  ))}
                </div>
                <button type="button" className="gl-workbench-nav-btn" onClick={handleNextArena}>
                  <span>Next: DP Matrix</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </li>

          {/* Card 3: DP Matrix */}
          <li id="card-dp" className="gl-stacking-card" style={{ display: viewMode === 'all' || activeTab === 'dp' ? 'grid' : 'none' }}>
            <div className="gl-workbench-info">
              <div>
                <div className="gl-icon-hub hub-purple">
                  <Layers size={26} />
                </div>
                <span className="gl-card-kicker">Dynamic Programming</span>
                <h3 className="gl-card-title">Optimal Substructure Recurrence</h3>
                <p className="gl-card-desc">
                  Trace exact top and diagonal parent lookups cell-by-cell in 0/1 Knapsack, Coin Change, and Longest Common Subsequence.
                </p>

                <div className="gl-spec-pills">
                  <span className="gl-spec-pill">
                    <Layers size={13} className="text-purple-400" />
                    <span>Bottom-Up Tabulation</span>
                  </span>
                  <span className="gl-spec-pill">
                    <Cpu size={13} className="text-purple-400" />
                    <span>O(n · W) Matrix</span>
                  </span>
                  <span className="gl-spec-pill">
                    <Sparkles size={13} className="text-purple-400" />
                    <span>Color-Coded Lookups</span>
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="gl-btn-primary"
                  onClick={() => handleNavClick('dp')}
                >
                  <span>Launch DP Arena</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="gl-workbench-sim">
              <div className="gl-sim-widget">
                <div className="gl-widget-header">
                  <span className="gl-widget-tag" style={{ color: '#c084fc' }}>
                    <Layers size={14} />
                    <span>0/1 Knapsack Recurrence Table</span>
                  </span>
                </div>

                <div className="gl-dp-table-wrap">
                  <table className="gl-dp-mini-grid">
                    <thead>
                      <tr>
                        <th>Item \ W</th>
                        {[0, 1, 2, 3, 4, 5].map(w => (
                          <th key={w}>w={w}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dpTable.map((row, r) => (
                        <tr key={r}>
                          <td style={{ fontWeight: 600, color: '#94a3b8' }}>
                            {r === 0 ? '∅' : `i=${r} ($${dpValues[r]})`}
                          </td>
                          {row.map((val, c) => {
                            const isCurrent = activeDpCell.r === r && activeDpCell.c === c;
                            const isParentTop = activeDpCell.r > 0 && r === activeDpCell.r - 1 && c === activeDpCell.c;
                            const wt = dpWeights[activeDpCell.r];
                            const isParentDiag = activeDpCell.r > 0 && activeDpCell.c >= wt && r === activeDpCell.r - 1 && c === activeDpCell.c - wt;
                            const isDep = isParentTop || isParentDiag;

                            return (
                              <td
                                key={c}
                                className={isCurrent ? 'gl-dp-cell-active' : isDep ? 'gl-dp-cell-dep' : ''}
                                onClick={() => setActiveDpCell({ r, c })}
                                onMouseEnter={() => setActiveDpCell({ r, c })}
                                style={{ cursor: 'pointer' }}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="gl-dp-formula-pill">
                  {activeDpCell.r === 0 ? (
                    <span>dp[0][{activeDpCell.c}] = 0 (Base Case: No items)</span>
                  ) : activeDpCell.c < dpWeights[activeDpCell.r] ? (
                    <span>
                      w={activeDpCell.c} &lt; wt={dpWeights[activeDpCell.r]} ⇒ Cannot take item: dp[{activeDpCell.r}][{activeDpCell.c}] = <strong>{dpTable[activeDpCell.r][activeDpCell.c]}</strong>
                    </span>
                  ) : (
                    <span>
                      dp[{activeDpCell.r}][{activeDpCell.c}] = max(
                      <span style={{ color: '#c084fc' }}>dp[{activeDpCell.r - 1}][{activeDpCell.c}]</span>, 
                      <span style={{ color: '#fbbf24' }}>dp[{activeDpCell.r - 1}][{activeDpCell.c - dpWeights[activeDpCell.r]}]+{dpValues[activeDpCell.r]}</span>
                      ) = <strong>{dpTable[activeDpCell.r][activeDpCell.c]}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {viewMode === 'tabbed' && (
              <div className="gl-workbench-footer-nav">
                <button type="button" className="gl-workbench-nav-btn" onClick={handlePrevArena}>
                  <ChevronLeft size={15} />
                  <span>Prev: Pathfinding Grid</span>
                </button>
                <div className="gl-workbench-nav-dots">
                  {ARENAS_LIST.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      className={`gl-workbench-nav-dot ${activeTab === a.key ? 'active' : ''}`}
                      onClick={() => setActiveTab(a.key)}
                      title={`Go to ${a.label}`}
                    />
                  ))}
                </div>
                <button type="button" className="gl-workbench-nav-btn" onClick={handleNextArena}>
                  <span>Next: Complexity Drills</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </li>

          {/* Card 4: AlgoGym */}
          <li id="card-quiz" className="gl-stacking-card" style={{ display: viewMode === 'all' || activeTab === 'quiz' ? 'grid' : 'none' }}>
            <div className="gl-workbench-info">
              <div>
                <div className="gl-icon-hub hub-emerald">
                  <Trophy size={26} />
                </div>
                <span className="gl-card-kicker">Complexity Drills</span>
                <h3 className="gl-card-title">Big-O Complexity Intuition</h3>
                <p className="gl-card-desc">
                  Sharpen runtime intuition and edge-case handling with interactive LeetCode and competitive programming challenges.
                </p>

                <div className="gl-spec-pills">
                  <span className="gl-spec-pill">
                    <Award size={13} className="text-emerald-400" />
                    <span>LeetCode Patterns</span>
                  </span>
                  <span className="gl-spec-pill">
                    <Flame size={13} className="text-emerald-400" />
                    <span>Instant Score Telemetry</span>
                  </span>
                  <span className="gl-spec-pill">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>Edge-Case Sandboxes</span>
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="gl-btn-primary"
                  onClick={() => handleNavClick('quiz')}
                >
                  <span>Enter AlgoGym</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="gl-workbench-sim">
              <div className="gl-sim-widget">
                <div className="gl-widget-header">
                  <span className="gl-widget-tag" style={{ color: '#10b981' }}>
                    <Trophy size={14} />
                    <span>Question {currentQuizIdx + 1} of {SAMPLE_QUIZ_QUESTIONS.length}</span>
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>Score: {quizScore}</span>
                </div>

                <p className="gl-quiz-question">{currentQuiz.question}</p>

                <div className="gl-quiz-options">
                  {currentQuiz.options.map((opt, optIdx) => {
                    const isSelected = selectedQuizOption === optIdx;
                    const isCorrect = selectedQuizOption !== null && optIdx === currentQuiz.correct;
                    const isWrong = isSelected && optIdx !== currentQuiz.correct;

                    return (
                      <div
                        key={optIdx}
                        className={`gl-quiz-opt ${isCorrect ? 'correct' : ''} ${isWrong ? 'incorrect' : ''}`}
                        onClick={() => handleSelectQuizOption(optIdx)}
                      >
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{String.fromCharCode(65 + optIdx)}.</span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {selectedQuizOption !== null && (
                  <div>
                    <p className="gl-quiz-feedback">
                      <strong>{selectedQuizOption === currentQuiz.correct ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
                      {currentQuiz.explanation}
                    </p>
                    <button
                      type="button"
                      className="gl-widget-btn"
                      style={{ marginTop: '8px' }}
                      onClick={nextQuizQuestion}
                    >
                      <span>Next Question →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {viewMode === 'tabbed' && (
              <div className="gl-workbench-footer-nav">
                <button type="button" className="gl-workbench-nav-btn" onClick={handlePrevArena}>
                  <ChevronLeft size={15} />
                  <span>Prev: DP Matrix</span>
                </button>
                <div className="gl-workbench-nav-dots">
                  {ARENAS_LIST.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      className={`gl-workbench-nav-dot ${activeTab === a.key ? 'active' : ''}`}
                      onClick={() => setActiveTab(a.key)}
                      title={`Go to ${a.label}`}
                    />
                  ))}
                </div>
                <button type="button" className="gl-workbench-nav-btn" onClick={handleNextArena}>
                  <span>Next: Sorting Arena</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </li>
        </ul>
      </section>

      {/* ── 6. System Architecture ── */}
      <section id="architecture" className="gl-architecture-section">
        <div className="gl-section-heading-wrap">
          <div className="gl-section-pill">
            <Cpu size={13} />
            <span>Under The Hood</span>
          </div>
          <h2 className="gl-section-title">Engineered for computational precision</h2>
          <p className="gl-section-desc">
            Direct bitmap execution and deterministic random generation eliminate browser lag and benchmark bias.
          </p>
        </div>

        <div className="gl-arch-grid">
          <div className="gl-arch-card">
            <div className="gl-arch-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Cpu size={22} />
            </div>
            <h3 className="gl-arch-title">Hardware 60 FPS Canvas</h3>
            <p className="gl-arch-desc">
              Direct bitmap rendering avoids DOM reflows and layout recalculations during high-frequency array swaps.
            </p>
            <div className="gl-arch-tags">
              <span className="gl-arch-tag">Direct 2D Context</span>
              <span className="gl-arch-tag">requestAnimationFrame</span>
              <span className="gl-arch-tag">Zero DOM Thrash</span>
            </div>
          </div>

          <div className="gl-arch-card">
            <div className="gl-arch-icon" style={{ background: 'rgba(252, 109, 38, 0.15)', color: '#fc6d26' }}>
              <Zap size={22} />
            </div>
            <h3 className="gl-arch-title">Deterministic PRNG Seeds</h3>
            <p className="gl-arch-desc">
              Every multi-lane race generates identical pseudo-random sequences across lanes to ensure mathematical parity.
            </p>
            <div className="gl-arch-tags">
              <span className="gl-arch-tag">Seed Parity</span>
              <span className="gl-arch-tag">Replayability</span>
              <span className="gl-arch-tag">Reproducible Runs</span>
            </div>
          </div>

          <div className="gl-arch-card">
            <div className="gl-arch-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Volume2 size={22} />
            </div>
            <h3 className="gl-arch-title">Web Audio Polyphony</h3>
            <p className="gl-arch-desc">
              Logarithmic frequency synthesis maps array element values to distinct acoustic pitches for sensory inspection.
            </p>
            <div className="gl-arch-tags">
              <span className="gl-arch-tag">Web Audio API</span>
              <span className="gl-arch-tag">Logarithmic Hz</span>
              <span className="gl-arch-tag">Gain Envelopes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Technical Specification Table ── */}
      <section id="specs" className="gl-spec-section">
        <div className="gl-section-heading-wrap">
          <div className="gl-section-pill">
            <Sliders size={13} />
            <span>Technical Audit</span>
          </div>
          <h2 className="gl-section-title">Conventional Visualizers vs AlgoRace</h2>
          <p className="gl-section-desc">
            A direct architectural comparison between single-threaded browser toys and a scientific benchmarking engine.
          </p>
        </div>

        <div className="gl-spec-table-container">
          <table className="gl-spec-table">
            <thead>
              <tr>
                <th>Benchmark Dimension</th>
                <th>Conventional Visualizers</th>
                <th>AlgoRace Platform</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="gl-spec-metric-name">
                  <Activity size={16} className="text-amber-400" />
                  <span>Execution Model</span>
                </td>
                <td className="gl-spec-legacy-val">Single algorithm in isolation</td>
                <td className="gl-spec-algorace-val">
                  <Check size={15} className="text-emerald-400" />
                  <span>Concurrent multi-lane race</span>
                </td>
              </tr>
              <tr>
                <td className="gl-spec-metric-name">
                  <ShieldCheck size={16} className="text-cyan-400" />
                  <span>Dataset Parity</span>
                </td>
                <td className="gl-spec-legacy-val">Unpaired random arrays (biased)</td>
                <td className="gl-spec-algorace-val">
                  <Check size={15} className="text-emerald-400" />
                  <span>Deterministic seed preservation</span>
                </td>
              </tr>
              <tr>
                <td className="gl-spec-metric-name">
                  <Cpu size={16} className="text-purple-400" />
                  <span>Rendering Pipeline</span>
                </td>
                <td className="gl-spec-legacy-val">DOM elements (reflow stutter)</td>
                <td className="gl-spec-algorace-val">
                  <Check size={15} className="text-emerald-400" />
                  <span>Hardware 60 FPS HTML5 Canvas</span>
                </td>
              </tr>
              <tr>
                <td className="gl-spec-metric-name">
                  <Sliders size={16} className="text-blue-400" />
                  <span>Timeline Control</span>
                </td>
                <td className="gl-spec-legacy-val">Play / Pause only</td>
                <td className="gl-spec-algorace-val">
                  <Check size={15} className="text-emerald-400" />
                  <span>Frame-accurate scrubbing seek bar</span>
                </td>
              </tr>
              <tr>
                <td className="gl-spec-metric-name">
                  <Volume2 size={16} className="text-emerald-400" />
                  <span>Acoustic Feedback</span>
                </td>
                <td className="gl-spec-legacy-val">Mute / None</td>
                <td className="gl-spec-algorace-val">
                  <Check size={15} className="text-emerald-400" />
                  <span>Synthesized Web Audio polyphony</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 8. Comprehensive Algorithm Matrix ── */}
      <section id="matrix" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 70px' }}>
        <div className="gl-section-heading-wrap">
          <div className="gl-section-pill">
            <Binary size={13} />
            <span>Reference Matrix</span>
          </div>
          <h2 className="gl-section-title">Asymptotic Complexity Directory</h2>
          <p className="gl-section-desc">
            Search, filter, and inspect Big-O bounds across all implemented algorithms.
          </p>
        </div>

        <div style={{ marginTop: '24px' }}>
          <Suspense fallback={<div style={{ height: '320px', background: '#0e1017', borderRadius: '12px' }} />}>
            <AlgorithmMatrix onNavigate={handleNavClick} />
          </Suspense>
        </div>
      </section>

      {/* ── 9. Pre-Footer Launchpad ── */}
      <section className="gl-launchpad">
        <div className="gl-launchpad-box">
          <h2 className="gl-launchpad-title">Ready for real-time benchmarking?</h2>
          <p className="gl-launchpad-sub">
            Jump into multi-lane arenas, run deterministic races, inspect pseudocode, and benchmark execution times live.
          </p>
          <button
            type="button"
            className="gl-btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.96rem' }}
            onClick={() => handleNavClick('sorting')}
          >
            <Zap size={17} />
            <span>Launch Sorting Race</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── 10. Minimalist Footer ── */}
      <footer className="gl-footer">
        <div className="gl-footer-grid">
          <div>
            <div className="gl-nav-brand" onClick={() => scrollToSection('hero')}>
              <AlgoRaceLogo size={26} showText={true} />
            </div>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '14px', lineHeight: 1.6, maxWidth: '280px' }}>
              High-precision algorithm benchmarking and visualization engine for computer scientists and engineers.
            </p>
          </div>

          <div>
            <h4 className="gl-footer-col-title">Arenas</h4>
            <ul className="gl-footer-links">
              <li><button type="button" className="gl-footer-link" onClick={() => handleNavClick('sorting')}><span>Sorting Arena</span> <kbd>1</kbd></button></li>
              <li><button type="button" className="gl-footer-link" onClick={() => handleNavClick('searching')}><span>Search Arena</span> <kbd>2</kbd></button></li>
              <li><button type="button" className="gl-footer-link" onClick={() => handleNavClick('pathfinding')}><span>Pathfinding Grid</span> <kbd>3</kbd></button></li>
              <li><button type="button" className="gl-footer-link" onClick={() => handleNavClick('dp')}><span>DP Matrix</span> <kbd>4</kbd></button></li>
              <li><button type="button" className="gl-footer-link" onClick={() => handleNavClick('trees')}><span>Tree Balancing</span> <kbd>5</kbd></button></li>
            </ul>
          </div>

          <div>
            <h4 className="gl-footer-col-title">Telemetry</h4>
            <ul className="gl-footer-links">
              <li><button type="button" className="gl-footer-link" onClick={() => handleNavClick('history')}><span>Benchmarks</span> <kbd>H</kbd></button></li>
              <li><button type="button" className="gl-footer-link" onClick={() => handleNavClick('settings')}><span>Audio & Display</span> <kbd>S</kbd></button></li>
              <li><button type="button" className="gl-footer-link" onClick={() => scrollToSection('simulator')}><span>Canvas Simulator</span></button></li>
              <li><button type="button" className="gl-footer-link" onClick={() => scrollToSection('matrix')}><span>Complexity Matrix</span></button></li>
            </ul>
          </div>

          <div>
            <h4 className="gl-footer-col-title">Project</h4>
            <ul className="gl-footer-links">
              <li>
                <a
                  href="https://github.com/Sanan507/AlgorithmRaceVisualizer"
                  target="_blank"
                  rel="noreferrer"
                  className="gl-footer-link"
                  style={{ textDecoration: 'none' }}
                >
                  <span>GitHub Repository</span>
                  <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>★ Star</span>
                </a>
              </li>
              <li><button type="button" className="gl-footer-link" onClick={() => scrollToSection('architecture')}><span>Architecture</span></button></li>
              <li><button type="button" className="gl-footer-link" onClick={() => scrollToSection('specs')}><span>Technical Specs</span></button></li>
            </ul>
          </div>
        </div>

        <div className="gl-footer-bottom">
          <span>© 2026 AlgoRace. Built by <strong>Sanan</strong>. Open source on GitHub.</span>
          <div className="gl-footer-chips">
            <span className="gl-footer-chip">React 18</span>
            <span className="gl-footer-chip">TypeScript</span>
            <span className="gl-footer-chip">Spring Boot 3.4</span>
            <span className="gl-footer-chip">HTML5 Canvas</span>
            <span className="gl-footer-chip">Web Audio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
