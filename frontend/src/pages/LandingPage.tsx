import { useState, lazy, Suspense } from 'react';
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
  Trophy,
  Check,
  Flame,
} from 'lucide-react';

const HeroMiniCanvas = lazy(() => import('../components/HeroMiniCanvas').then(m => ({ default: m.HeroMiniCanvas })));
const AlgorithmMatrix = lazy(() => import('../components/AlgorithmMatrix').then(m => ({ default: m.AlgorithmMatrix })));

export type NavigationPage = 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees' | 'quiz' | 'history' | 'settings';

interface Props {
  onNavigate: (page: NavigationPage) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export function LandingPage({ onNavigate, darkMode, setDarkMode }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (page: NavigationPage) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <div className="landing-page">
      {/* Ambient background glow layers */}
      <div className="landing-glow-bg glow-purple" />
      <div className="landing-glow-bg glow-cyan" />
      <div className="landing-grid-overlay" />

      {/* Top Header / Sticky Nav */}
      <header className="landing-navbar">
        <div className="landing-nav-brand" onClick={() => scrollToSection('top')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo-icon">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <div className="brand-title-group">
            <span className="brand-name">AlgoRace</span>
            <span className="brand-badge">v2.0</span>
          </div>
        </div>

        <button
          type="button"
          className="landing-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`landing-nav-links ${mobileMenuOpen ? 'mobile-expanded' : ''}`}>
          <button onClick={() => scrollToSection('arenas')} className="nav-link-btn">
            Arenas
          </button>
          <button onClick={() => scrollToSection('demo')} className="nav-link-btn">
            Live Simulator
          </button>
          <button onClick={() => scrollToSection('comparison')} className="nav-link-btn">
            Comparison
          </button>
          <button onClick={() => scrollToSection('features')} className="nav-link-btn">
            Features
          </button>
          <button onClick={() => scrollToSection('matrix')} className="nav-link-btn">
            Algorithm Index
          </button>
          <button onClick={() => scrollToSection('architecture')} className="nav-link-btn">
            Architecture
          </button>
          <button
            className="landing-cta-btn btn-primary mobile-cta-only"
            onClick={() => handleNavClick('sorting')}
          >
            <span>Launch Arena</span>
            <ArrowRight size={16} />
          </button>
        </nav>

        <div className="landing-nav-actions desktop-cta-only" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {setDarkMode && (
            <button
              type="button"
              className="theme-toggle-btn-top"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--fg)',
                transition: 'all 0.2s ease',
              }}
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
          )}

          <button
            className="landing-cta-btn btn-primary"
            onClick={() => handleNavClick('sorting')}
          >
            <span>Launch Arena</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Real-Time Telemetry Ticker Marquee */}
      <div className="landing-ticker-bar" aria-label="Real-time Algorithm Telemetry">
        <div className="ticker-track">
          <div className="ticker-item"><span className="ticker-pill pill-winner">⚡ QuickSort: 2.1ms (Winner)</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-cyan">🌊 MergeSort: 4.3ms (Stable)</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-purple">🧭 A* Search: 118 nodes visited</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-amber">🔍 Binary Search: 4 comps (O(log n))</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-blue">🌲 AVL Tree: Height-balanced 0.4ms</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-winner">🎒 0/1 Knapsack: Optimal Profit $240</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-cyan">🏆 AlgoGym: 94.2% Success Rate</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-purple">🔊 Web Audio: Polyphonic Chimes 60 FPS</span></div>
          {/* Duplicate track for seamless infinite scroll */}
          <div className="ticker-item"><span className="ticker-pill pill-winner">⚡ QuickSort: 2.1ms (Winner)</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-cyan">🌊 MergeSort: 4.3ms (Stable)</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-purple">🧭 A* Search: 118 nodes visited</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-amber">🔍 Binary Search: 4 comps (O(log n))</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-blue">🌲 AVL Tree: Height-balanced 0.4ms</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-winner">🎒 0/1 Knapsack: Optimal Profit $240</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-cyan">🏆 AlgoGym: 94.2% Success Rate</span></div>
          <div className="ticker-item"><span className="ticker-pill pill-purple">🔊 Web Audio: Polyphonic Chimes 60 FPS</span></div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section id="top" className="landing-hero-section">
        <div className="hero-content">
          <div className="hero-chip-badge">
            <Sparkles size={14} className="chip-icon text-amber-400" />
            <span>ALGORITHM VISUALIZATION & BENCHMARKING ENGINE</span>
          </div>

          <h1 className="hero-main-title">
            Visualize. Benchmark.{' '}
            <span className="hero-gradient-text">Race Algorithms Live.</span>
          </h1>

          <p className="hero-description">
            Compare sorting, searching, pathfinding, dynamic programming, and tree balancing algorithms side by side — with live telemetry, step debugging, and hardware-accelerated canvas visualizations.
          </p>

          <div className="hero-cta-cluster">
            <button
              className="hero-btn-primary hero-btn-glow"
              onClick={() => handleNavClick('sorting')}
            >
              <BarChart3 size={18} />
              <span>Launch Sorting Arena</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="hero-btn-secondary"
              onClick={() => handleNavClick('searching')}
            >
              <Binary size={18} className="text-blue-400" />
              <span>Search Arena</span>
            </button>

            <button
              className="hero-btn-secondary"
              onClick={() => handleNavClick('pathfinding')}
            >
              <GitBranch size={18} className="text-cyan-400" />
              <span>Pathfinding</span>
            </button>

            <button
              className="hero-btn-secondary"
              onClick={() => handleNavClick('dp')}
            >
              <Layers size={18} className="text-purple-400" />
              <span>DP Matrix</span>
            </button>

            <button
              className="hero-btn-secondary"
              onClick={() => handleNavClick('trees')}
            >
              <Cpu size={18} className="text-amber-400" />
              <span>Tree Arena</span>
            </button>

            <button
              className="hero-btn-secondary"
              onClick={() => handleNavClick('quiz')}
            >
              <Trophy size={18} className="text-emerald-400" />
              <span>AlgoGym Quiz</span>
            </button>

            <button
              className="hero-btn-ghost"
              onClick={() => scrollToSection('matrix')}
            >
              <span>Algorithm Matrix</span>
            </button>
          </div>

          {/* Interactive Keyboard Shortcuts Navigation Bar */}
          <div className="hero-keycaps-row">
            <span className="keycaps-label">
              <Sparkles size={12} className="text-amber-400" />
              <span>Direct Hotkeys:</span>
            </span>
            <div className="keycaps-group">
              <button className="kbd-pill" onClick={() => handleNavClick('sorting')} title="Press 1 for Sorting Arena">
                <kbd>1</kbd> <span>Sorting</span>
              </button>
              <button className="kbd-pill" onClick={() => handleNavClick('searching')} title="Press 2 for Search Arena">
                <kbd>2</kbd> <span>Search</span>
              </button>
              <button className="kbd-pill" onClick={() => handleNavClick('pathfinding')} title="Press 3 for Pathfinding Arena">
                <kbd>3</kbd> <span>Pathfinding</span>
              </button>
              <button className="kbd-pill" onClick={() => handleNavClick('dp')} title="Press 4 for DP Arena">
                <kbd>4</kbd> <span>DP</span>
              </button>
              <button className="kbd-pill" onClick={() => handleNavClick('trees')} title="Press 5 for Trees Arena">
                <kbd>5</kbd> <span>Trees</span>
              </button>
              <button className="kbd-pill" onClick={() => handleNavClick('quiz')} title="Press 6 or Q for AlgoGym Quiz">
                <kbd>6</kbd> <span>Gym</span>
              </button>
              <button className="kbd-pill" onClick={() => handleNavClick('history')} title="Press H for Performance Benchmarks">
                <kbd>H</kbd> <span>Benchmarks</span>
              </button>
              {setDarkMode && (
                <button className="kbd-pill" onClick={() => setDarkMode(!darkMode)} title="Press T to toggle theme">
                  <kbd>T</kbd> <span>Theme</span>
                </button>
              )}
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="hero-stats-grid">
            <div className="stat-card">
              <span className="stat-number">20+</span>
              <span className="stat-label">Competitive Algorithms</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">&lt; 1ms</span>
              <span className="stat-label">Telemetry Precision</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">60 FPS</span>
              <span className="stat-label">Hardware Canvas Engine</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">Web Audio</span>
              <span className="stat-label">Synthesized Chimes</span>
            </div>
          </div>
        </div>

        {/* Live Hardware Mini Canvas Teaser */}
        <div id="demo" className="hero-canvas-showcase">
          <Suspense fallback={<div className="hero-canvas-skeleton" />}>
            <HeroMiniCanvas />
          </Suspense>
        </div>
      </section>

      {/* Feature Arenas Bento Grid */}
      <section id="arenas" className="landing-section bento-section">
        <div className="section-header">
          <div className="section-badge">
            <Layers size={14} className="text-indigo-400" />
            <span>INTERACTIVE ARENAS</span>
          </div>
          <h2 className="section-title">Built for Precision & Deep Algorithmic Insight</h2>
          <p className="section-subtitle">
            Engineered for computer scientists, competitive coders, and students to evaluate computational behavior side-by-side.
          </p>
        </div>

        <div className="bento-grid">
          {/* Row 1: Card 1 (Sorting Arena - 2 col) + Card 2 (Search Arena - 1 col) */}
          <div className="bento-card bento-card-large bento-sorting featured" onClick={() => handleNavClick('sorting')}>
            <div className="bento-card-bg-glow glow-purple-subtle" />
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-purple">
                <BarChart3 size={22} />
              </div>
              <span className="bento-arena-tag">SORTING ARENA</span>
            </div>
            <h3 className="bento-title">Multi-Lane Array Sorting Race</h3>
            <p className="bento-text">
              Compare QuickSort, MergeSort, HeapSort, RadixSort, CountingSort, InsertionSort, and SelectionSort on uniform dataset seeds.
              Features glowing visual indicators for comparisons, swaps, pivots, heap bounds, and sorted sub-arrays.
            </p>

            <div className="bento-preview-pills">
              <span className="bento-pill">Step Debugger & Timeline Seek</span>
              <span className="bento-pill">Uniform Seed Preservation</span>
              <span className="bento-pill">Pseudocode Inspector</span>
              <span className="bento-pill">Multi-Lane Concurrent Race</span>
            </div>

            <div className="bento-card-action">
              <span>Launch Sorting Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="bento-card bento-searching" onClick={() => handleNavClick('searching')}>
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-blue">
                <Binary size={22} />
              </div>
              <span className="bento-arena-tag">SEARCH ARENA</span>
            </div>
            <h3 className="bento-title">Binary, Jump & Linear Search</h3>
            <p className="bento-text">
              Observe logarithmic search space elimination in Binary and Exponential search with darkened inactive boundaries and targeted pivots.
            </p>
            <div className="bento-preview-pills">
              <span className="bento-pill">O(log n) Halving</span>
              <span className="bento-pill">Jump Interval Step</span>
              <span className="bento-pill">Interpolation Target</span>
            </div>
            <div className="bento-card-action">
              <span>Launch Search Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Row 2: Card 3 (Pathfinding Arena - 2 col) + Card 4 (DP Arena - 1 col) */}
          <div className="bento-card bento-card-large bento-pathfinding" onClick={() => handleNavClick('pathfinding')}>
            <div className="bento-card-bg-glow glow-cyan-subtle" />
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-cyan">
                <GitBranch size={22} />
              </div>
              <span className="bento-arena-tag">PATHFINDING ARENA</span>
            </div>
            <h3 className="bento-title">2D Grid Pathfinding & Interactive Maze Editor</h3>
            <p className="bento-text">
              Visualize A*, Dijkstra, BFS, and DFS graph traversals on custom 2D grid maps.
              Click and drag directly on the canvas to draw custom wall barriers with live shortest-path recalculations.
            </p>

            <div className="bento-preview-pills">
              <span className="bento-pill">Interactive Drag Walls</span>
              <span className="bento-pill">Recursive Division Maze Gen</span>
              <span className="bento-pill">Manhattan / Euclidean Heuristics</span>
              <span className="bento-pill">Shortest Path Highlight</span>
            </div>

            <div className="bento-card-action">
              <span>Launch Pathfinding Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="bento-card bento-dp" onClick={() => handleNavClick('dp')}>
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-purple">
                <Layers size={22} />
              </div>
              <span className="bento-arena-tag">DP MATRIX ARENA</span>
            </div>
            <h3 className="bento-title">Dynamic Programming Recurrence</h3>
            <p className="bento-text">
              Step through 0/1 Knapsack, Longest Common Subsequence (LCS), Edit Distance, and Coin Change with live state matrices.
            </p>
            <div className="bento-preview-pills">
              <span className="bento-pill">2D State Grid</span>
              <span className="bento-pill">Recurrence Highlighting</span>
              <span className="bento-pill">Memoization Cache</span>
            </div>
            <div className="bento-card-action">
              <span>Launch DP Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Row 3: Card 5 (Tree Structures - 1 col) + Card 6 (AlgoGym Quiz - 2 col) */}
          <div className="bento-card bento-trees" onClick={() => handleNavClick('trees')}>
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-amber">
                <Cpu size={22} />
              </div>
              <span className="bento-arena-tag">TREE STRUCTURES</span>
            </div>
            <h3 className="bento-title">Self-Balancing AVL & BST</h3>
            <p className="bento-text">
              Watch Left and Right tree rotations maintain height balance with real-time balance factor telemetry on insert and delete.
            </p>
            <div className="bento-preview-pills">
              <span className="bento-pill">AVL Rotations</span>
              <span className="bento-pill">BST Traversal</span>
              <span className="bento-pill">Balance Factors</span>
            </div>
            <div className="bento-card-action">
              <span>Explore Trees Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="bento-card bento-card-large bento-quiz featured" onClick={() => handleNavClick('quiz')}>
            <div className="bento-card-bg-glow glow-cyan-subtle" />
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-emerald">
                <Trophy size={22} />
              </div>
              <span className="bento-arena-tag">ALGOGYM & QUIZ ARENA</span>
            </div>
            <h3 className="bento-title">Interactive LeetCode Challenges & Complexity Drills</h3>
            <p className="bento-text">
              Test your algorithmic knowledge with gamified competitive challenges, complexity analysis drills, edge-case debugging, and speed trivia.
            </p>

            <div className="bento-preview-pills">
              <span className="bento-pill">LeetCode Problem Drills</span>
              <span className="bento-pill">Time/Space Complexity Quiz</span>
              <span className="bento-pill">Direct Arena Launch Handoff</span>
              <span className="bento-pill">Streak & Accuracy Telemetry</span>
            </div>

            <div className="bento-card-action">
              <span>Enter AlgoGym</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Row 4: Card 7 (Benchmarks - 2 col) + Card 8 (Sound Engine - 1 col) */}
          <div className="bento-card bento-card-large bento-benchmarks" onClick={() => handleNavClick('history')}>
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-emerald">
                <Activity size={22} />
              </div>
              <span className="bento-arena-tag">BENCHMARKS & HISTORICAL TELEMETRY</span>
            </div>
            <h3 className="bento-title">Real-Time Performance Graphs & Operation Counters</h3>
            <p className="bento-text">
              Live comparative execution time graphs ($ms$), total comparisons, and swap count telemetry for scientific benchmarking and comparative reporting.
            </p>
            <div className="bento-preview-pills">
              <span className="bento-pill">Execution Charts ($ms$)</span>
              <span className="bento-pill">Operations Counter</span>
              <span className="bento-pill">Exportable Race Logs</span>
            </div>
            <div className="bento-card-action">
              <span>View Benchmarks</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="bento-card bento-audio" onClick={() => handleNavClick('settings')}>
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-amber">
                <Volume2 size={22} />
              </div>
              <span className="bento-arena-tag">SOUND ENGINE</span>
            </div>
            <h3 className="bento-title">Synthesized Web Audio Engine</h3>
            <p className="bento-text">
              Custom polyphonic synthesized acoustic chimes mapped to array frequencies for sensory feedback on comparisons and swaps.
            </p>
            <div className="bento-preview-pills">
              <span className="bento-pill">Polyphonic Chimes</span>
              <span className="bento-pill">Frequency Mapping</span>
            </div>
            <div className="bento-card-action">
              <span>Audio Settings</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Comparison Section */}
      <section id="comparison" className="comparison-section">
        <div className="section-header">
          <div className="section-badge">
            <Flame size={14} className="text-amber-400" />
            <span>VALUE PROPOSITION</span>
          </div>
          <h2 className="section-title">Why AlgoRace vs Legacy Visualizers</h2>
          <p className="section-subtitle">
            Traditional visualizers show algorithms one at a time on synthetic data. AlgoRace delivers live multi-lane racing with scientific rigor.
          </p>
        </div>

        <div className="comparison-grid">
          <div className="comparison-card legacy-card">
            <div className="comparison-card-header">
              <span className="comp-badge badge-legacy">Legacy Visualizers</span>
              <h3 className="comp-title">Single Algorithm Viewers</h3>
              <p className="comp-desc">Conventional single-threaded tools with static delays and isolated executions.</p>
            </div>
            <ul className="comparison-list">
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>Single algorithm execution at a time</span>
              </li>
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>Different random arrays make comparison biased</span>
              </li>
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>DOM-based animations lag on large array sizes</span>
              </li>
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>No step-back frame scrubbing seek bar</span>
              </li>
              <li className="comp-item item-negative">
                <X size={18} className="icon-cross" />
                <span>Limited to basic sorting only</span>
              </li>
            </ul>
          </div>

          <div className="comparison-card algorace-card">
            <div className="comp-card-glow" />
            <div className="comparison-card-header">
              <span className="comp-badge badge-algorace">AlgoRace v2.0</span>
              <h3 className="comp-title">Multi-Lane Benchmarking Engine</h3>
              <p className="comp-desc">Engineered for parallel multi-lane racing with microsecond telemetry.</p>
            </div>
            <ul className="comparison-list">
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span>Concurrent multi-lane algorithm race view</span>
              </li>
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span>Exact uniform random seed preservation</span>
              </li>
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span>60 FPS hardware-accelerated 2D HTML5 Canvas</span>
              </li>
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span>Frame-accurate seek bar & inline pseudocode</span>
              </li>
              <li className="comp-item item-positive">
                <Check size={18} className="icon-check" />
                <span>Full suite: Sorting, Search, Pathfinding, DP & Trees</span>
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
            <h4>Obsidian Dark & Icy Glass Themes</h4>
            <p>
              Seamlessly switch between Obsidian dark mode and high-contrast light mode tailored for long study and development sessions.
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
            <h2 className="arch-title">Powered by High-Performance Tech Stack</h2>
            <p className="arch-subtitle">
              AlgoRace decouples simulation step calculation and client-side hardware canvas rendering for zero UI lag.
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

      {/* Complexity Matrix Section */}
      <section id="matrix" className="landing-section matrix-container-section">
        <Suspense fallback={<div className="matrix-skeleton" />}>
          <AlgorithmMatrix onNavigate={handleNavClick} />
        </Suspense>
      </section>

      {/* Upgraded CTA Launchpad */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <div className="cta-ambient-glow" />
          <div className="cta-content-wrapper">
            <div className="cta-badge">
              <div className="cta-status-dot" />
              <span>READY FOR REAL-TIME BENCHMARKING</span>
            </div>

            <h2 className="cta-headline">
              Elevate Your Computer Science Understanding
            </h2>

            <p className="cta-subheadline">
              Jump straight into multi-lane algorithm arenas, run deterministic races, inspect pseudocode, and benchmark execution times live.
            </p>

            <div className="cta-arena-chips-grid">
              <button className="cta-chip" onClick={() => handleNavClick('sorting')}>
                <BarChart3 size={15} className="text-purple-400" />
                <span>Sorting Arena</span>
                <span className="cta-chip-kbd">1</span>
              </button>
              <button className="cta-chip" onClick={() => handleNavClick('searching')}>
                <Binary size={15} className="text-blue-400" />
                <span>Search Arena</span>
                <span className="cta-chip-kbd">2</span>
              </button>
              <button className="cta-chip" onClick={() => handleNavClick('pathfinding')}>
                <GitBranch size={15} className="text-cyan-400" />
                <span>Pathfinding</span>
                <span className="cta-chip-kbd">3</span>
              </button>
              <button className="cta-chip" onClick={() => handleNavClick('dp')}>
                <Layers size={15} className="text-purple-400" />
                <span>DP Matrix</span>
                <span className="cta-chip-kbd">4</span>
              </button>
              <button className="cta-chip" onClick={() => handleNavClick('trees')}>
                <Cpu size={15} className="text-amber-400" />
                <span>Tree Arena</span>
                <span className="cta-chip-kbd">5</span>
              </button>
              <button className="cta-chip" onClick={() => handleNavClick('quiz')}>
                <Trophy size={15} className="text-emerald-400" />
                <span>AlgoGym</span>
                <span className="cta-chip-kbd">6</span>
              </button>
            </div>

            <div className="cta-action-cluster">
              <button
                className="landing-cta-btn btn-primary btn-large"
                onClick={() => handleNavClick('sorting')}
              >
                <Zap size={20} />
                <span>Launch Sorting Race</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="hero-btn-ghost"
                onClick={() => scrollToSection('matrix')}
              >
                <span>Browse Algorithm Directory</span>
              </button>
            </div>

            <div className="cta-specs-strip">
              <div className="cta-spec-item">
                <Check size={14} className="text-emerald-400" />
                <span>Deterministic Random Seeds</span>
              </div>
              <div className="cta-spec-divider" />
              <div className="cta-spec-item">
                <Check size={14} className="text-emerald-400" />
                <span>60 FPS Hardware Canvas</span>
              </div>
              <div className="cta-spec-divider" />
              <div className="cta-spec-item">
                <Check size={14} className="text-emerald-400" />
                <span>Zero Latency Web Audio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upgraded 4-Column SaaS Footer */}
      <footer className="landing-footer">
        <div className="footer-grid-container">
          <div className="footer-col footer-col-brand">
            <div className="landing-nav-brand">
              <div className="brand-logo-icon">
                <Zap size={20} className="text-emerald-400" />
              </div>
              <div className="brand-title-group">
                <span className="brand-name">AlgoRace</span>
                <span className="brand-badge">v2.0</span>
              </div>
            </div>
            <p className="footer-mission-text">
              High-performance interactive algorithm benchmarking and visual exploration engine designed for computer scientists, developers, and students.
            </p>
            <div className="footer-status-pill">
              <div className="status-dot-pulse" />
              <span>System Nominal • 60 FPS</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Interactive Arenas</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleNavClick('sorting')}>
                  <span>Sorting Arena</span>
                  <kbd>1</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('searching')}>
                  <span>Search Arena</span>
                  <kbd>2</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('pathfinding')}>
                  <span>Pathfinding Arena</span>
                  <kbd>3</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('dp')}>
                  <span>DP Matrix Arena</span>
                  <kbd>4</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('trees')}>
                  <span>Tree Structures</span>
                  <kbd>5</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('quiz')}>
                  <span>AlgoGym Challenges</span>
                  <kbd>6</kbd>
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Telemetry & Controls</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleNavClick('history')}>
                  <span>Performance Benchmarks</span>
                  <kbd>H</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('settings')}>
                  <span>Audio & Display Settings</span>
                  <kbd>S</kbd>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('matrix')}>
                  <span>Complexity Matrix</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('architecture')}>
                  <span>System Architecture</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Community & Source</h4>
            <ul className="footer-links-list">
              <li>
                <a
                  href="https://github.com/Sanan507/AlgorithmRaceVisualizer"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-external-link"
                >
                  <span className="footer-link-content">
                    <Zap size={14} className="text-cyan-400" />
                    <span>GitHub Repository</span>
                  </span>
                  <kbd className="footer-star-kbd">★ Star</kbd>
                </a>
              </li>
              <li>
                <button onClick={() => scrollToSection('comparison')}>
                  <span>Why AlgoRace</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')}>
                  <span>Feature Highlights</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © 2026 AlgoRace. Built with precision by <strong>Sanan</strong>. Open source on GitHub.
          </p>
          <div className="footer-tech-stack">
            <span className="tech-chip">React 18</span>
            <span className="tech-chip">TypeScript</span>
            <span className="tech-chip">Spring Boot 3.4</span>
            <span className="tech-chip">HTML5 Canvas</span>
            <span className="tech-chip">Web Audio API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
