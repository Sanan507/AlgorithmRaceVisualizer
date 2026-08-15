import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  BarChart3,
  Binary,
  GitBranch,
  Volume2,
  Zap,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  Activity,
  Code2,
  Sliders,
  CheckCircle2,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
  Keyboard,
  Github,
  Compass,
  Check,
  RotateCw,
  Play,
  Flame,
  Shuffle,
  Terminal,
  FileCode2,
  Workflow,
  BarChart2,
  Star,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { AlgoRaceLogo } from '../components/AlgoRaceLogo';

const HeroMiniCanvas = lazy(() => import('../components/HeroMiniCanvas').then(m => ({ default: m.HeroMiniCanvas })));
const AlgorithmMatrix = lazy(() => import('../components/AlgorithmMatrix').then(m => ({ default: m.AlgorithmMatrix })));
const CodePlayground = lazy(() => import('../components/CodePlayground').then(m => ({ default: m.CodePlayground })));

interface Props {
  onNavigate: (page: 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees' | 'history' | 'settings') => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

// Real-Time Dynamic Shortest Path Solver for Mini Grid (BFS/A*)
function solveMiniGridPath(wallsGrid: number[][]): number[][] {
  const nextGrid = wallsGrid.map(r => [...r]);
  const rows = nextGrid.length;
  const cols = nextGrid[0].length;
  const start: [number, number] = [2, 0];
  const target: [number, number] = [2, 8];

  // Clear previous path
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (nextGrid[r][c] === 4) nextGrid[r][c] = 0;
    }
  }

  // BFS Queue
  const queue: [number, number][] = [start];
  const visited = new Set<string>([`${start[0]},${start[1]}`]);
  const parent = new Map<string, [number, number]>();

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  let found = false;
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    if (cr === target[0] && cc === target[1]) {
      found = true;
      break;
    }

    for (const [dr, dc] of directions) {
      const nr = cr + dr;
      const nc = cc + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && nextGrid[nr][nc] !== 1 && !visited.has(key)) {
        visited.add(key);
        parent.set(key, [cr, cc]);
        queue.push([nr, nc]);
      }
    }
  }

  // If path exists, trace and mark cells as 4 (Path)
  if (found) {
    let curr = target;
    while (curr[0] !== start[0] || curr[1] !== start[1]) {
      const p = parent.get(`${curr[0]},${curr[1]}`);
      if (!p) break;
      if ((p[0] !== start[0] || p[1] !== start[1]) && (p[0] !== target[0] || p[1] !== target[1])) {
        nextGrid[p[0]][p[1]] = 4;
      }
      curr = p;
    }
  }

  nextGrid[start[0]][start[1]] = 5; // Start marker
  nextGrid[target[0]][target[1]] = 6; // Target marker
  return nextGrid;
}

export function LandingPage({ onNavigate, darkMode, setDarkMode }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { play, playToneForValue } = useAudio();
  const bentoGridRef = useRef<HTMLDivElement | null>(null);

  // ----------------------------------------------------
  // Interactive Bento Micro-Widgets State
  // ----------------------------------------------------

  // 1. Sorting Partition Array Bars State
  const [sortingBars, setSortingBars] = useState<number[]>([35, 75, 45, 90, 60, 25, 85, 50, 95, 30, 70, 40]);
  const [pivotBarIdx, setPivotBarIdx] = useState<number>(3);
  const [swapBarIdx, setSwapBarIdx] = useState<number>(7);

  const handleShuffleSortingBars = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newArr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 75) + 25);
    setSortingBars(newArr);
    setPivotBarIdx(Math.floor(Math.random() * 12));
    setSwapBarIdx(Math.floor(Math.random() * 12));
    play('swap');
  };

  // 2. Web Audio Pentatonic Sound Pad State
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const pentatonicNotes = [
    { label: 'C4', val: 60, hz: '261 Hz' },
    { label: 'D4', val: 62, hz: '293 Hz' },
    { label: 'E4', val: 64, hz: '329 Hz' },
    { label: 'G4', val: 67, hz: '392 Hz' },
    { label: 'A4', val: 69, hz: '440 Hz' },
  ];

  const handlePlayTone = (noteVal: number, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveNoteIdx(idx);
    if (playToneForValue) {
      playToneForValue(noteVal, 50, 80, idx % 2 === 0 ? 'compare' : 'swap');
    } else {
      play('click');
    }
    setTimeout(() => setActiveNoteIdx(null), 250);
  };

  // 3. Search Space Halver State
  const [searchStep, setSearchStep] = useState(1);

  // 4. Mini Pathfinding Grid State with Real-Time Path Solver
  const [miniGrid, setMiniGrid] = useState<number[][]>(() => {
    const initialWalls = Array.from({ length: 5 }, () => Array(9).fill(0));
    initialWalls[1][4] = 1;
    initialWalls[2][4] = 1;
    initialWalls[3][4] = 1;
    return solveMiniGridPath(initialWalls);
  });

  const toggleMiniGridCell = (r: number, c: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if ((r === 2 && c === 0) || (r === 2 && c === 8)) return;
    setMiniGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return solveMiniGridPath(next);
    });
    play('click');
  };

  // 5. AVL Tree Rotator State
  const [isTreeRotated, setIsTreeRotated] = useState(false);

  // 6. DP Memoization Grid State
  const [activeDPCell, setActiveDPCell] = useState<[number, number]>([2, 3]);

  // 7. Debugger Timeline Scrubber State
  const [debuggerStep, setDebuggerStep] = useState(3);
  const pseudocodeLines = [
    'pivot = partition(arr, low, high)',
    'quickSort(arr, low, pivot - 1)',
    'quickSort(arr, pivot + 1, high) // Active Branch',
    'if (low >= high) return;',
  ];

  // ----------------------------------------------------
  // Cursor Spotlight Shader Effect on Bento Cards
  // ----------------------------------------------------
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bentoGridRef.current) return;
    const cards = bentoGridRef.current.getElementsByClassName('bento-card');
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Global Keyboard Navigation Listener (Keys 1-5, /, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      } else if (e.key === '1') {
        onNavigate('sorting');
      } else if (e.key === '2') {
        onNavigate('searching');
      } else if (e.key === '3') {
        onNavigate('pathfinding');
      } else if (e.key === '4') {
        onNavigate('dp');
      } else if (e.key === '5') {
        onNavigate('trees');
      } else if (e.key === '/') {
        e.preventDefault();
        scrollToSection('matrix');
        const searchInput = document.querySelector<HTMLInputElement>('.matrix-search-input');
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 300);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  return (
    <div className="landing-page">
      {/* Ambient background glow layers */}
      <div className="landing-glow-bg glow-purple" />
      <div className="landing-glow-bg glow-cyan" />
      <div className="landing-grid-overlay" />

      {/* Top Header / Sticky Nav */}
      <header className="landing-navbar">
        <div className="landing-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
          <AlgoRaceLogo size={32} showText={true} badge="v2.0" />
        </div>

        <button
          type="button"
          className="landing-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`landing-nav-links ${mobileMenuOpen ? 'mobile-expanded' : ''}`} aria-label="Main Navigation">
          <button onClick={() => scrollToSection('arenas')} className="nav-link-btn">
            Arenas
          </button>
          <button onClick={() => scrollToSection('workflow')} className="nav-link-btn">
            How It Works
          </button>
          <button onClick={() => scrollToSection('demo')} className="nav-link-btn">
            Live Simulator
          </button>
          <button onClick={() => scrollToSection('code-playground')} className="nav-link-btn">
            Code Sync
          </button>
          <button onClick={() => scrollToSection('comparison')} className="nav-link-btn">
            Comparison
          </button>
          <button onClick={() => scrollToSection('matrix')} className="nav-link-btn">
            Algorithm Index
          </button>
          <button
            className="landing-cta-btn btn-primary mobile-cta-only"
            onClick={() => onNavigate('sorting')}
            aria-label="Launch Sorting Arena"
          >
            <span>Launch Arena</span>
            <ArrowRight size={16} />
          </button>
        </nav>

        <div className="landing-nav-actions desktop-cta-only">
          <a
            href="https://github.com/Sanan507/AlgorithmRaceVisualizer"
            target="_blank"
            rel="noreferrer"
            className="landing-github-badge-btn"
            title="Star on GitHub"
            aria-label="Star on GitHub"
          >
            <Github size={15} />
            <span>GitHub</span>
            <span className="nav-github-star-pill">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span>Star</span>
            </span>
          </a>

          {setDarkMode && (
            <button
              type="button"
              className="theme-toggle-btn-top"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
          )}

          <button
            className="landing-cta-btn btn-primary"
            onClick={() => onNavigate('sorting')}
            aria-label="Launch Sorting Arena"
          >
            <span>Launch Arena</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Live Algorithm Race Telemetry Ticker */}
      <div className="landing-ticker-bar" aria-label="Real-time algorithm telemetry ticker">
        <div className="ticker-track">
          <div className="ticker-item">
            <span className="ticker-pill pill-winner">🏆 QuickSort: 0.14ms (1st place)</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill">MergeSort: 0.22ms • O(N log N)</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill pill-cyan">🗺️ A* Search: 42 nodes • 100% optimal</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill pill-purple">🧩 Knapsack DP: $280 optimal value</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill pill-amber">🌳 AVL Tree: Balance Factor 0 • 0 rotations</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill pill-blue">🔍 Binary Search: 4 steps • Target: 72</span>
          </div>
        </div>
        {/* Duplicate set for seamless continuous marquee, hidden from screen readers */}
        <div className="ticker-track" aria-hidden="true">
          <div className="ticker-item">
            <span className="ticker-pill pill-winner">🏆 QuickSort: 0.14ms (1st place)</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill">MergeSort: 0.22ms • O(N log N)</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill pill-cyan">🗺️ A* Search: 42 nodes • 100% optimal</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill pill-purple">🧩 Knapsack DP: $280 optimal value</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill pill-amber">🌳 AVL Tree: Balance Factor 0 • 0 rotations</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-pill pill-blue">🔍 Binary Search: 4 steps • Target: 72</span>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="landing-hero-section">
        <div className="hero-content">
          <div className="hero-chip-badge">
            <Sparkles size={13} className="chip-icon text-amber-400" />
            <span>HIGH-PERFORMANCE ALGORITHM BENCHMARKING SUITE</span>
          </div>

          <h1 className="hero-main-title">
            Visualize. Benchmark.{' '}
            <span className="hero-gradient-text">Race Algorithms Live.</span>
          </h1>

          <p className="hero-description">
            Compare sorting, graph pathfinding, dynamic programming, tree balancing, and search suites side-by-side with live sub-millisecond telemetry and interactive 60 FPS canvas debugging.
          </p>

          {/* Streamlined 2-CTA Action Cluster */}
          <div className="hero-cta-cluster">
            <button
              className="hero-btn-primary hero-btn-glow"
              onClick={() => onNavigate('sorting')}
              aria-label="Launch interactive algorithm race arena"
            >
              <Zap size={18} />
              <span>Launch Interactive Arena</span>
              <ArrowRight size={17} />
            </button>

            <button
              className="hero-btn-secondary"
              onClick={() => scrollToSection('matrix')}
              aria-label="View algorithm catalog and complexity matrix"
            >
              <Compass size={18} className="text-cyan-400" />
              <span>Algorithm Catalog & Matrix</span>
            </button>
          </div>

          {/* Keyboard Shortcuts Navigation Bar */}
          <div className="hero-keycaps-row" aria-label="Keyboard Shortcuts">
            <div className="keycaps-label">
              <Keyboard size={14} className="text-slate-400" />
              <span>Quick Hotkeys:</span>
            </div>
            <div className="keycaps-group">
              <button className="kbd-pill" onClick={() => onNavigate('sorting')} aria-label="Press 1 for Sorting Arena">
                <kbd>1</kbd> <span>Sorting</span>
              </button>
              <button className="kbd-pill" onClick={() => onNavigate('searching')} aria-label="Press 2 for Search Arena">
                <kbd>2</kbd> <span>Search</span>
              </button>
              <button className="kbd-pill" onClick={() => onNavigate('pathfinding')} aria-label="Press 3 for Pathfinding Arena">
                <kbd>3</kbd> <span>Pathfinding</span>
              </button>
              <button className="kbd-pill" onClick={() => onNavigate('dp')} aria-label="Press 4 for Dynamic Programming Arena">
                <kbd>4</kbd> <span>DP</span>
              </button>
              <button className="kbd-pill" onClick={() => onNavigate('trees')} aria-label="Press 5 for Tree Arena">
                <kbd>5</kbd> <span>Trees</span>
              </button>
              <button className="kbd-pill" onClick={() => scrollToSection('matrix')} aria-label="Press slash to search algorithm matrix">
                <kbd>/</kbd> <span>Search Index</span>
              </button>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="hero-stats-grid">
            <div className="stat-card">
              <span className="stat-number">20+</span>
              <span className="stat-label">Supported Algorithms</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">&lt; 1ms</span>
              <span className="stat-label">Telemetry Precision</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">60 FPS</span>
              <span className="stat-label">Hardware Canvas</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">Web Audio</span>
              <span className="stat-label">Synthesized Chimes</span>
            </div>
          </div>
        </div>

        {/* Live Multi-Modal Hardware Mini Canvas Teaser */}
        <div id="demo" className="hero-canvas-showcase">
          <Suspense fallback={
            <div className="hero-canvas-skeleton" aria-label="Loading algorithm simulation preview">
              <div className="skeleton-bar-row">
                <div className="skel-bar" style={{ height: '40%' }} />
                <div className="skel-bar" style={{ height: '70%' }} />
                <div className="skel-bar" style={{ height: '30%' }} />
                <div className="skel-bar" style={{ height: '90%' }} />
                <div className="skel-bar" style={{ height: '55%' }} />
                <div className="skel-bar" style={{ height: '80%' }} />
              </div>
            </div>
          }>
            <HeroMiniCanvas />
          </Suspense>
        </div>
      </section>

      {/* 3-Step Interactive Workflow Pipeline */}
      <section id="workflow" className="landing-section workflow-section">
        <div className="section-header">
          <div className="section-badge">
            <Workflow size={14} className="text-cyan-400" />
            <span>HOW ALGORACE WORKS</span>
          </div>
          <h2 className="section-title">Benchmark Algorithms in 3 Simple Steps</h2>
          <p className="section-subtitle">
            Configure multi-lane race tracks, inject custom dataset distributions, and analyze real-time execution frames.
          </p>
        </div>

        <div className="workflow-steps-grid">
          {/* Step 1 */}
          <div className="workflow-step-card">
            <div className="step-number-badge">01</div>
            <div className="step-icon-wrapper icon-purple">
              <Layers size={22} />
            </div>
            <h3 className="step-title">Select Contenders</h3>
            <p className="step-desc">
              Choose 2 to 4 competing algorithms across Sorting, Graph Pathfinding, Dynamic Programming, or Tree Balancing arenas.
            </p>
            <div className="step-tag-row">
              <span className="step-tag">QuickSort vs MergeSort</span>
              <span className="step-tag">A* vs Dijkstra</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="workflow-step-card">
            <div className="step-number-badge">02</div>
            <div className="step-icon-wrapper icon-cyan">
              <Sliders size={22} />
            </div>
            <h3 className="step-title">Configure Distribution & Seeds</h3>
            <p className="step-desc">
              Select uniform random seeds, nearly sorted arrays, reverse permutations, or custom 2D maze barrier weights.
            </p>
            <div className="step-tag-row">
              <span className="step-tag">Random Seeds</span>
              <span className="step-tag">Weighted Mazes</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="workflow-step-card">
            <div className="step-number-badge">03</div>
            <div className="step-icon-wrapper icon-emerald">
              <Activity size={22} />
            </div>
            <h3 className="step-title">Race, Benchmark & Debug</h3>
            <p className="step-desc">
              Execute at 60 FPS with live sub-ms telemetry, synthesized Web Audio chimes, and bidirectional timeline scrubbing.
            </p>
            <div className="step-tag-row">
              <span className="step-tag">60 FPS Canvas</span>
              <span className="step-tag">Frame Scrubbing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Arenas Bento Grid 2.0 (with Accessible Interactive Micro-Widgets) */}
      <section id="arenas" className="landing-section bento-section">
        <div className="section-header">
          <div className="section-badge">
            <Layers size={14} className="text-indigo-400" />
            <span>INTERACTIVE ARENAS & MICRO-TOOLS</span>
          </div>
          <h2 className="section-title">Built for Precision & Deep Insight</h2>
          <p className="section-subtitle">
            Engineered for computer scientists, software engineers, and students to dissect algorithmic behavior side-by-side.
          </p>
        </div>

        <div className="bento-grid" ref={bentoGridRef} onMouseMove={handleMouseMove}>
          {/* Card 1: Multi-Lane Sorting */}
          <div
            className="bento-card bento-card-large bento-sorting featured"
            onClick={() => onNavigate('sorting')}
            tabIndex={0}
            role="button"
            aria-label="Launch Sorting Arena to race QuickSort, MergeSort, and HeapSort"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('sorting');
              }
            }}
          >
            <div className="bento-card-bg-glow glow-purple-subtle" />
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-purple">
                <BarChart3 size={22} />
              </div>
              <span className="bento-arena-tag">SORTING ARENA</span>
            </div>
            <h3 className="bento-title">Multi-Lane Array Sorting Race</h3>
            <p className="bento-text">
              Compare QuickSort, MergeSort, HeapSort, InsertionSort, RadixSort, and ShellSort on uniform dataset seeds.
              Features precise glowing visual indicators for comparisons, swaps, pivots, heap bounds, and sorted ranges.
            </p>

            {/* Interactive Micro-Widget: Partition Array Bars */}
            <div className="bento-micro-widget sorting-micro-widget" onClick={(e) => e.stopPropagation()}>
              <div className="micro-widget-header">
                <span className="micro-tag">INTERACTIVE ARRAY PARTITION</span>
                <button
                  className="micro-action-btn"
                  onClick={handleShuffleSortingBars}
                  aria-label="Shuffle array partition sample"
                >
                  <Shuffle size={11} />
                  <span>Shuffle Partition</span>
                </button>
              </div>
              <div className="micro-bars-container">
                {sortingBars.map((val, idx) => (
                  <div
                    key={idx}
                    className={`micro-bar ${idx === pivotBarIdx ? 'micro-pivot' : idx === swapBarIdx ? 'micro-swap' : ''}`}
                    style={{ height: `${val}%` }}
                    title={`Index ${idx}: ${val}`}
                    onClick={() => {
                      setPivotBarIdx(idx);
                      play('compare');
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="bento-card-action">
              <span>Launch Sorting Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 2: Logarithmic Search Space Halver */}
          <div
            className="bento-card bento-searching"
            onClick={() => onNavigate('searching')}
            tabIndex={0}
            role="button"
            aria-label="Launch Search Arena to test Binary, Interpolation, and Ternary Search"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('searching');
              }
            }}
          >
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-blue">
                <Binary size={22} />
              </div>
              <span className="bento-arena-tag">SEARCH ARENA</span>
            </div>
            <h3 className="bento-title">Logarithmic Search Space Halver</h3>
            <p className="bento-text">
              Observe logarithmic search space elimination in Binary, Interpolation, and Ternary Search with darkened inactive ranges.
            </p>

            {/* Interactive Micro-Widget: Search Space Halver */}
            <div className="bento-micro-widget search-micro-widget" onClick={(e) => e.stopPropagation()}>
              <div className="micro-widget-header">
                <span className="micro-tag">O(log N) SEARCH RANGE</span>
                <span className="micro-hint">Step {searchStep} / 4</span>
              </div>
              <div
                className="search-range-bar"
                onClick={() => {
                  setSearchStep(s => (s % 4) + 1);
                  play('compare');
                }}
              >
                <div
                  className="search-active-segment"
                  style={{
                    width: `${100 / Math.pow(2, searchStep - 1)}%`,
                    left: `${searchStep === 2 ? 50 : searchStep === 3 ? 25 : searchStep === 4 ? 37.5 : 0}%`,
                  }}
                />
              </div>
              <div className="search-slider-controls">
                <button
                  className="micro-action-btn"
                  onClick={() => {
                    setSearchStep(s => (s % 4) + 1);
                    play('compare');
                  }}
                  aria-label="Halve search range by one step"
                >
                  <Play size={11} />
                  <span>Halve Range (1/{Math.pow(2, searchStep - 1)} space)</span>
                </button>
              </div>
            </div>

            <div className="bento-card-action">
              <span>Launch Search Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 3: 2D Pathfinding */}
          <div
            className="bento-card bento-card-large bento-pathfinding"
            onClick={() => onNavigate('pathfinding')}
            tabIndex={0}
            role="button"
            aria-label="Launch Pathfinding Arena with A*, Dijkstra, BFS, and DFS"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('pathfinding');
              }
            }}
          >
            <div className="bento-card-bg-glow glow-cyan-subtle" />
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-cyan">
                <GitBranch size={22} />
              </div>
              <span className="bento-arena-tag">PATHFINDING ARENA</span>
            </div>
            <h3 className="bento-title">2D Grid Pathfinding & Interactive Maze Editor</h3>
            <p className="bento-text">
              Visualize A*, Dijkstra, BFS, DFS, and Bellman-Ford graph traversals on 2D grid maps.
              Click grid cells directly inside this preview to draw walls—the shortest path will dynamically re-route around your obstacles!
            </p>

            {/* Interactive Micro-Widget: Interactive Mini Grid with Real-Time Path Solver */}
            <div className="bento-micro-widget path-micro-widget" onClick={(e) => e.stopPropagation()}>
              <div className="micro-widget-header">
                <span className="micro-tag">LIVE DYNAMIC A* MINI GRID</span>
                <span className="micro-hint">Click cells to toggle barrier walls</span>
              </div>
              <div className="mini-grid-container">
                {miniGrid.map((row, r) => (
                  <div key={r} className="mini-grid-row">
                    {row.map((val, c) => (
                      <div
                        key={c}
                        className={`mini-cell ${
                          val === 1
                            ? 'cell-wall'
                            : val === 4
                            ? 'cell-path'
                            : val === 5
                            ? 'cell-start'
                            : val === 6
                            ? 'cell-target'
                            : ''
                        }`}
                        onClick={(e) => toggleMiniGridCell(r, c, e)}
                        title={val === 5 ? 'Start Node' : val === 6 ? 'Target Node' : val === 1 ? 'Wall Obstacle' : val === 4 ? 'Shortest Path' : 'Empty Cell'}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="bento-card-action">
              <span>Launch Pathfinding Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 4: Playable Web Audio Synthesizer Pad */}
          <div
            className="bento-card bento-audio"
            onClick={() => onNavigate('settings')}
            tabIndex={0}
            role="button"
            aria-label="Open Sound Settings and audio synthesizer"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('settings');
              }
            }}
          >
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-amber">
                <Volume2 size={22} />
              </div>
              <span className="bento-arena-tag">SOUND ENGINE</span>
            </div>
            <h3 className="bento-title">Web Audio Synthesizer Pad</h3>
            <p className="bento-text">
              Custom synthesized acoustic chimes mapped to array element values for auditory feedback.
              Click keys below to test the sound engine live!
            </p>

            {/* Interactive Micro-Widget: Pentatonic Audio Pad */}
            <div className="bento-micro-widget audio-micro-widget" onClick={(e) => e.stopPropagation()}>
              <div className="micro-widget-header">
                <span className="micro-tag">PENTATONIC TONE PAD</span>
                <div className="equalizer-bars">
                  <span className={`eq-bar ${activeNoteIdx !== null ? 'animating' : ''}`} />
                  <span className={`eq-bar ${activeNoteIdx !== null ? 'animating' : ''}`} />
                  <span className={`eq-bar ${activeNoteIdx !== null ? 'animating' : ''}`} />
                  <span className={`eq-bar ${activeNoteIdx !== null ? 'animating' : ''}`} />
                </div>
              </div>
              <div className="audio-keys-pad">
                {pentatonicNotes.map((note, idx) => (
                  <button
                    key={note.label}
                    className={`audio-key-btn ${activeNoteIdx === idx ? 'active-key' : ''}`}
                    onClick={(e) => handlePlayTone(note.val, idx, e)}
                    title={`Play ${note.label} (${note.hz})`}
                    aria-label={`Play musical note ${note.label} at ${note.hz}`}
                  >
                    <span className="key-label">{note.label}</span>
                    <span className="key-hz">{note.hz}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bento-card-action">
              <span>Audio Settings</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 5: Dynamic Programming */}
          <div
            className="bento-card bento-card-large bento-dp"
            onClick={() => onNavigate('dp')}
            tabIndex={0}
            role="button"
            aria-label="Launch Dynamic Programming Arena with 0/1 Knapsack, LCS, and Edit Distance"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('dp');
              }
            }}
          >
            <div className="bento-card-bg-glow glow-purple-subtle" />
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-purple">
                <Layers size={22} />
              </div>
              <span className="bento-arena-tag">DYNAMIC PROGRAMMING</span>
            </div>
            <h3 className="bento-title">2D Memoization Tables & Subproblem Graphs</h3>
            <p className="bento-text">
              Step through 0/1 Knapsack, Longest Common Subsequence (LCS), and Edit Distance matrices.
              Follow recurrence transitions cell-by-cell with optimal subproblem backtracking.
            </p>

            {/* Interactive Micro-Widget: DP Grid Dependencies */}
            <div className="bento-micro-widget dp-micro-widget" onClick={(e) => e.stopPropagation()}>
              <div className="micro-widget-header">
                <span className="micro-tag">KNAPSACK RECURRENCE MATRIX</span>
                <span className="micro-hint">Click cell to inspect subproblems</span>
              </div>
              <div className="dp-matrix-mini">
                {[
                  [0, 0, 0, 0, 0],
                  [0, 3, 3, 3, 3],
                  [0, 3, 4, 7, 7],
                  [0, 3, 5, 8, 9],
                ].map((row, r) => (
                  <div key={r} className="dp-mini-row">
                    {row.map((val, c) => {
                      const isSelected = activeDPCell[0] === r && activeDPCell[1] === c;
                      const isDep = isSelected || (r === activeDPCell[0] - 1 && (c === activeDPCell[1] || c === activeDPCell[1] - 2));
                      return (
                        <div
                          key={c}
                          className={`dp-mini-cell ${isSelected ? 'cell-current' : isDep ? 'cell-dep' : ''}`}
                          onClick={() => {
                            setActiveDPCell([r, c]);
                            play('click');
                          }}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="dp-formula-pill">
                <code>dp[{activeDPCell[0]}][{activeDPCell[1]}] = max(dp[{activeDPCell[0]-1}][{activeDPCell[1]}], dp[{activeDPCell[0]-1}][{Math.max(0, activeDPCell[1]-2)}] + v)</code>
              </div>
            </div>

            <div className="bento-card-action">
              <span>Launch DP Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 6: Interactive AVL Tree Rotator */}
          <div
            className="bento-card bento-trees"
            onClick={() => onNavigate('trees')}
            tabIndex={0}
            role="button"
            aria-label="Launch Tree Structures Arena with BST, AVL, and Red-Black Trees"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('trees');
              }
            }}
          >
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-amber">
                <Cpu size={22} />
              </div>
              <span className="bento-arena-tag">TREE STRUCTURES</span>
            </div>
            <h3 className="bento-title">BST, AVL & Red-Black Balancing</h3>
            <p className="bento-text">
              Visualize self-balancing tree rotations, balance factor evaluations, and logarithmic depth maintenance.
            </p>

            {/* Interactive Micro-Widget: AVL Tree Rotator */}
            <div className="bento-micro-widget tree-micro-widget" onClick={(e) => e.stopPropagation()}>
              <div className="micro-widget-header">
                <span className="micro-tag">AVL ROTATION WIDGET</span>
                <button
                  className="tree-rotate-trigger"
                  onClick={() => {
                    setIsTreeRotated(!isTreeRotated);
                    play('click');
                  }}
                  aria-label="Trigger AVL tree balancing rotation"
                >
                  <RotateCw size={11} />
                  <span>Rotate</span>
                </button>
              </div>
              <div className="tree-nodes-display">
                <div className={`mini-tree-container ${isTreeRotated ? 'rotated' : ''}`}>
                  <div className="tree-node node-root">{isTreeRotated ? '30' : '20'}</div>
                  <div className="tree-branches">
                    <div className="tree-node node-left">{isTreeRotated ? '20' : '10'}</div>
                    <div className="tree-node node-right">{isTreeRotated ? '40' : '30'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-card-action">
              <span>Launch Tree Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 7: Real-Time Telemetry & Benchmark Sparkline */}
          <div
            className="bento-card bento-card-large bento-benchmarks"
            onClick={() => onNavigate('history')}
            tabIndex={0}
            role="button"
            aria-label="View Benchmarks and performance history"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('history');
              }
            }}
          >
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-emerald">
                <Activity size={22} />
              </div>
              <span className="bento-arena-tag">BENCHMARKS</span>
            </div>
            <h3 className="bento-title">Real-Time Performance Metrics & Telemetry</h3>
            <p className="bento-text">
              Live comparative execution time graphs ($ms$), total operations/comparisons, and swap count telemetry for scientific benchmarking.
            </p>

            {/* Interactive Micro-Widget: Telemetry Sparkline */}
            <div className="bento-micro-widget telemetry-micro-widget" onClick={(e) => e.stopPropagation()}>
              <div className="micro-widget-header">
                <span className="micro-tag">SAMPLE RUN TELEMETRY</span>
                <span className="telemetry-speed-badge">⚡ 0.14ms Sample</span>
              </div>
              <div className="telemetry-sparkline-box">
                <div className="sparkline-bars">
                  <div className="spark-bar" style={{ height: '40%' }} />
                  <div className="spark-bar" style={{ height: '65%' }} />
                  <div className="spark-bar" style={{ height: '30%' }} />
                  <div className="spark-bar" style={{ height: '85%' }} />
                  <div className="spark-bar" style={{ height: '45%' }} />
                  <div className="spark-bar highlight-winner" style={{ height: '95%' }} />
                  <div className="spark-bar" style={{ height: '55%' }} />
                  <div className="spark-bar" style={{ height: '75%' }} />
                </div>
              </div>
            </div>

            <div className="bento-card-action">
              <span>View Benchmarks</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 8: Step Debugger Timeline Scrubber */}
          <div
            className="bento-card bento-debugger"
            onClick={() => onNavigate('sorting')}
            tabIndex={0}
            role="button"
            aria-label="Try algorithm step debugger and timeline scrubber"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('sorting');
              }
            }}
          >
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-purple">
                <Code2 size={22} />
              </div>
              <span className="bento-arena-tag">INSPECTOR</span>
            </div>
            <h3 className="bento-title">Step Debugger & Pseudocode</h3>
            <p className="bento-text">
              Follow step-by-step algorithm execution with frame scrubbing seek bars and expandable pseudocode cards.
            </p>

            {/* Interactive Micro-Widget: Debugger Timeline */}
            <div className="bento-micro-widget debugger-micro-widget" onClick={(e) => e.stopPropagation()}>
              <div className="micro-widget-header">
                <span className="micro-tag">EXECUTION SCRUBBER</span>
                <span className="micro-hint">Frame {debuggerStep} / 4</span>
              </div>
              <div className="debugger-code-preview">
                {pseudocodeLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`debugger-code-line ${idx === debuggerStep - 1 ? 'active-code-line' : ''}`}
                  >
                    <span className="line-num">{idx + 1}</span>
                    <span className="line-text">{line}</span>
                  </div>
                ))}
              </div>
              <input
                type="range"
                min={1}
                max={4}
                value={debuggerStep}
                onChange={(e) => {
                  setDebuggerStep(Number(e.target.value));
                  play('click');
                }}
                className="micro-slider"
                aria-label="Algorithm execution step timeline scrubber"
              />
            </div>

            <div className="bento-card-action">
              <span>Try Debugger</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Synchronized Multi-Language Code Playground */}
      <section id="code-playground" className="landing-section code-playground-section">
        <div className="section-header">
          <div className="section-badge">
            <Terminal size={14} className="text-emerald-400" />
            <span>DEVELOPER PLAYGROUND</span>
          </div>
          <h2 className="section-title">Synchronized Multi-Language Source Code</h2>
          <p className="section-subtitle">
            Inspect canonical implementations across TypeScript, Python, Java, and C++ with real-time execution step highlighting.
          </p>
        </div>

        <div className="code-playground-container">
          <Suspense fallback={<div className="code-playground-skeleton" />}>
            <CodePlayground />
          </Suspense>
        </div>
      </section>

      {/* Competitive Value Proposition: AlgoRace vs Traditional Visualizers */}
      <section id="comparison" className="landing-section comparison-section">
        <div className="section-header">
          <div className="section-badge">
            <Flame size={14} className="text-rose-400" />
            <span>VALUE PROPOSITION</span>
          </div>
          <h2 className="section-title">The Modern Standard in Algorithm Visualization</h2>
          <p className="section-subtitle">
            Why engineers and computer scientists choose AlgoRace over static textbooks and legacy applets.
          </p>
        </div>

        <div className="comparison-grid">
          {/* Legacy Column */}
          <div className="comparison-card legacy-card">
            <div className="comparison-card-header">
              <div className="comp-badge badge-legacy">Legacy Tools & Textbooks</div>
              <h3 className="comp-title">Traditional Visualizers</h3>
              <p className="comp-desc">Static slideshows, outdated applets, and single-algorithm viewers.</p>
            </div>
            <ul className="comparison-list">
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>Single algorithm execution in isolation</span>
              </li>
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>No frame scrubbing or timeline seek</span>
              </li>
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>Zero audio feedback or frequency mapping</span>
              </li>
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>DOM-based rendering (No HTML5 Canvas)</span>
              </li>
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>Dated academic user interface</span>
              </li>
            </ul>
          </div>

          {/* AlgoRace 2.0 Column */}
          <div className="comparison-card algorace-card">
            <div className="comp-card-glow" />
            <div className="comparison-card-header">
              <div className="comp-badge badge-algorace">
                <Sparkles size={13} />
                <span>AlgoRace 2.0 Engine</span>
              </div>
              <h3 className="comp-title">Modern Real-Time Arena</h3>
              <p className="comp-desc">Multi-lane real-time algorithm racing with high-throughput simulation telemetry.</p>
            </div>
            <ul className="comparison-list">
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span><strong>Multi-Lane Racing</strong> with uniform seed preservation</span>
              </li>
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span><strong>Bidirectional Timeline Scrubbing</strong> & step-by-step inspector</span>
              </li>
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span><strong>Synthesized Web Audio API</strong> chimes and victory fanfares</span>
              </li>
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span><strong>Hardware 60 FPS Canvas</strong> with 0ms UI blocking (Decoupled Loop)</span>
              </li>
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span><strong>Obsidian Dark Mode & Okabe-Ito</strong> colorblind accessible themes</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Details / Highlights Grid */}
      <section id="features" className="landing-section features-highlights-section">
        <div className="section-header">
          <div className="section-badge">
            <Sliders size={14} className="text-emerald-400" />
            <span>FEATURES OVERVIEW</span>
          </div>
          <h2 className="section-title">Designed for Complete Execution Control</h2>
        </div>

        <div className="highlights-grid">
          <div className="highlight-card">
            <Code2 className="highlight-icon text-indigo-400" size={24} />
            <h4>Inline Pseudocode Debugger</h4>
            <p>
              Inspect step-by-step theoretical pseudocode alongside complexity analysis ($O(1)$, $O(n \log n)$, $O(n^2)$) to understand underlying logic.
            </p>
          </div>

          <div className="highlight-card">
            <Sliders className="highlight-icon text-cyan-400" size={24} />
            <h4>Frame Scrubbing & Timeline Seek</h4>
            <p>
              Scrub back and forth through algorithm execution timelines with interactive seek bars, step-forward, and step-backward controls.
            </p>
          </div>

          <div className="highlight-card">
            <CheckCircle2 className="highlight-icon text-emerald-400" size={24} />
            <h4>Dataset Preservation</h4>
            <p>
              Swap between algorithms while retaining exact random seed arrays for true un-biased performance comparisons.
            </p>
          </div>

          <div className="highlight-card">
            <Shield className="highlight-icon text-amber-400" size={24} />
            <h4>Dark & Light Obsidian Themes</h4>
            <p>
              Seamlessly switch between Obsidian dark mode, high-contrast mode, and colorblind-friendly palettes (Okabe-Ito).
            </p>
          </div>
        </div>
      </section>

      {/* Technical Architecture Section */}
      <section id="architecture" className="landing-section architecture-section">
        <div className="architecture-box">
          <div className="arch-header">
            <div className="arch-badge">
              <Cpu size={14} className="text-cyan-400" />
              <span>FULL-STACK SYSTEM ARCHITECTURE</span>
            </div>
            <h2 className="arch-title">Powered by Modern High-Performance Tech Stack</h2>
            <p className="arch-subtitle">
              AlgoRace decouples simulation step calculation and client-side hardware canvas rendering for zero UI blocking lag.
            </p>
          </div>

          <div className="arch-tech-grid">
            <div className="arch-tech-card">
              <div className="tech-badge-icon icon-java">☕</div>
              <h3>Spring Boot 3.4 API Engine</h3>
              <ul>
                <li>Java 21 / 25 High-throughput step generator</li>
                <li>REST Endpoints (`/api/simulations/sorting`)</li>
                <li>Deterministic Array & Grid Map generators</li>
              </ul>
            </div>

            <div className="arch-tech-card">
              <div className="tech-badge-icon icon-react">⚛️</div>
              <h3>React 18 & TypeScript Client</h3>
              <ul>
                <li>Hardware-Accelerated 2D HTML5 Canvas rendering</li>
                <li>60 FPS requestAnimationFrame animation loop</li>
                <li>Context-driven Web Audio Synthesizer</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Complexity Matrix Section & Big-O Curves */}
      <section id="matrix" className="landing-section matrix-container-section">
        <Suspense fallback={<div className="matrix-skeleton" />}>
          <AlgorithmMatrix onNavigate={onNavigate} />
        </Suspense>
      </section>

      {/* Upgraded Bottom CTA Launchpad */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <div className="cta-ambient-glow" />
          <div className="cta-content-wrapper">
            <div className="cta-badge">
              <span className="cta-status-dot" />
              <span>HIGH-THROUGHPUT ENGINE READY</span>
            </div>

            <h2 className="cta-headline">
              Ready to Benchmark <span className="hero-gradient-text">Algorithms Live?</span>
            </h2>

            <p className="cta-subheadline">
              Compare sorting mechanics, 2D weighted pathfinding, DP matrix memoization, and self-balancing tree rotations in real time with 60 FPS hardware acceleration.
            </p>

            {/* Quick-Launch Arena Grid */}
            <div className="cta-arena-chips-grid">
              <button className="cta-chip" onClick={() => onNavigate('sorting')} aria-label="Launch Sorting Arena">
                <span className="cta-chip-icon">📊</span>
                <span className="cta-chip-title">Sorting Arena</span>
                <kbd className="cta-chip-kbd">1</kbd>
              </button>

              <button className="cta-chip" onClick={() => onNavigate('searching')} aria-label="Launch Search Arena">
                <span className="cta-chip-icon">🔍</span>
                <span className="cta-chip-title">Search Arena</span>
                <kbd className="cta-chip-kbd">2</kbd>
              </button>

              <button className="cta-chip" onClick={() => onNavigate('pathfinding')} aria-label="Launch Pathfinding Arena">
                <span className="cta-chip-icon">🗺️</span>
                <span className="cta-chip-title">Pathfinding Arena</span>
                <kbd className="cta-chip-kbd">3</kbd>
              </button>

              <button className="cta-chip" onClick={() => onNavigate('dp')} aria-label="Launch DP Arena">
                <span className="cta-chip-icon">🧩</span>
                <span className="cta-chip-title">DP Arena</span>
                <kbd className="cta-chip-kbd">4</kbd>
              </button>

              <button className="cta-chip" onClick={() => onNavigate('trees')} aria-label="Launch Tree Arena">
                <span className="cta-chip-icon">🌳</span>
                <span className="cta-chip-title">Tree Arena</span>
                <kbd className="cta-chip-kbd">5</kbd>
              </button>
            </div>

            {/* Action Cluster */}
            <div className="cta-action-cluster">
              <button
                className="hero-btn-primary hero-btn-glow"
                onClick={() => onNavigate('sorting')}
                aria-label="Launch Sorting Arena"
              >
                <Zap size={18} />
                <span>Launch Interactive Arenas</span>
                <ArrowRight size={17} />
              </button>

              <button
                className="hero-btn-secondary"
                onClick={() => scrollToSection('matrix')}
                aria-label="Explore 20+ Algorithms"
              >
                <Compass size={18} className="text-cyan-400" />
                <span>Explore 20+ Algorithm Specs</span>
              </button>
            </div>

            {/* Feature Spec Strip */}
            <div className="cta-specs-strip">
              <div className="cta-spec-item">
                <Sparkles size={14} className="text-amber-400" />
                <span>Zero UI Thread Blocking</span>
              </div>
              <div className="cta-spec-divider" />
              <div className="cta-spec-item">
                <Volume2 size={14} className="text-purple-400" />
                <span>Pentatonic Web Audio Synthesis</span>
              </div>
              <div className="cta-spec-divider" />
              <div className="cta-spec-item">
                <Shield size={14} className="text-emerald-400" />
                <span>Colorblind Accessible (Okabe-Ito)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upgraded 4-Column SaaS Footer */}
      <footer className="landing-footer">
        <div className="footer-grid-container">
          {/* Column 1: Brand & Status */}
          <div className="footer-col footer-col-brand">
            <div className="footer-logo-row" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
              <AlgoRaceLogo size={36} showText={true} badge="v2.0" tagline="Benchmark Engine" />
            </div>
            <p className="footer-mission-text">
              High-performance interactive algorithm visualizer and benchmarking suite built for computer scientists, software engineers, and students.
            </p>
            <div className="footer-status-pill">
              <span className="status-dot-pulse" />
              <span>All Systems Operational · 60 FPS</span>
            </div>
          </div>

          {/* Column 2: Interactive Arenas */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Interactive Arenas</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => onNavigate('sorting')}>
                  <span>Sorting Arena</span>
                  <kbd>1</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('searching')}>
                  <span>Search Arena</span>
                  <kbd>2</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pathfinding')}>
                  <span>Pathfinding Arena</span>
                  <kbd>3</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dp')}>
                  <span>DP Arena (Knapsack / LCS)</span>
                  <kbd>4</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trees')}>
                  <span>Tree Arena (AVL / BST)</span>
                  <kbd>5</kbd>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Tools & Telemetry */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Platform & Tools</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => scrollToSection('matrix')}>
                  <span>Big-O Complexity Curves</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('matrix')}>
                  <span>Algorithm Catalog & Matrix</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('code-playground')}>
                  <span>Synchronized Code Playground</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')}>
                  <span>Benchmark History & KPIs</span>
                  <kbd>H</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')}>
                  <span>CSV & JSON Telemetry Export</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: System & Theme */}
          <div className="footer-col">
            <h4 className="footer-col-heading">System & Theme</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => onNavigate('settings')}>
                  <span>Web Audio Synthesizer</span>
                </button>
              </li>
              <li>
                <button onClick={() => setDarkMode && setDarkMode(!darkMode)}>
                  <span>{darkMode ? 'Light Theme Mode' : 'Dark Theme Mode'}</span>
                  <kbd>T</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('settings')}>
                  <span>Colorblind Presets</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('settings')}>
                  <span>Developer Profile & Settings</span>
                  <kbd>S</kbd>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/Sanan507/AlgorithmRaceVisualizer"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-external-link"
                >
                  <span className="footer-link-content">
                    <Github size={14} />
                    <span>Star on GitHub</span>
                  </span>
                  <kbd className="footer-star-kbd">★</kbd>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            <span>© 2026 AlgoRace. Built with precision by <strong>Sanan</strong>.</span>
          </div>

          <div className="footer-tech-stack">
            <span className="tech-chip">React 18</span>
            <span className="tech-chip">TypeScript</span>
            <span className="tech-chip">Spring Boot 3.4</span>
            <span className="tech-chip">Web Audio API</span>
            <span className="tech-chip">HTML5 Canvas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
