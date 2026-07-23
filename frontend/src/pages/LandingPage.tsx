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
} from 'lucide-react';
import { HeroMiniCanvas } from '../components/HeroMiniCanvas';
import { AlgorithmMatrix } from '../components/AlgorithmMatrix';

interface Props {
  onNavigate: (page: 'sorting' | 'searching' | 'pathfinding' | 'history' | 'settings') => void;
}

export function LandingPage({ onNavigate }: Props) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Ambient background glow layers */}
      <div className="landing-glow-bg glow-purple" />
      <div className="landing-glow-bg glow-cyan" />
      <div className="landing-grid-overlay" />

      {/* Top Header / Sticky Nav */}
      <header className="landing-navbar">
        <div className="landing-nav-brand">
          <div className="brand-logo-icon">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <div className="brand-title-group">
            <span className="brand-name">AlgoRace</span>
            <span className="brand-badge">v2.0</span>
          </div>
        </div>

        <nav className="landing-nav-links">
          <button onClick={() => scrollToSection('arenas')} className="nav-link-btn">
            Arenas
          </button>
          <button onClick={() => scrollToSection('demo')} className="nav-link-btn">
            Live Simulator
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
        </nav>

        <div className="landing-nav-actions">
          <button
            className="landing-cta-btn btn-primary"
            onClick={() => onNavigate('sorting')}
          >
            <span>Launch Arena</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="landing-hero-section">
        <div className="hero-content">
          <div className="hero-chip-badge">
            <Sparkles size={13} className="chip-icon text-amber-400" />
            <span>ALGORITHM VISUALIZATION & BENCHMARKING</span>
          </div>

          <h1 className="hero-main-title">
            Visualize. Benchmark.{' '}
            <span className="hero-gradient-text">Race Algorithms Live.</span>
          </h1>

          <p className="hero-description">
            Compare sorting, searching, and pathfinding algorithms side by side — with live performance metrics, step-by-step debugging, and interactive canvas visualizations.
          </p>

          <div className="hero-cta-group">
            <button
              className="hero-btn-primary"
              onClick={() => onNavigate('sorting')}
            >
              <Zap size={18} />
              <span>Launch Sorting Arena</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="hero-btn-secondary"
              onClick={() => onNavigate('pathfinding')}
            >
              <GitBranch size={18} className="text-cyan-400" />
              <span>Explore Pathfinding</span>
            </button>

            <button
              className="hero-btn-ghost"
              onClick={() => scrollToSection('matrix')}
            >
              <span>View Complexity Index</span>
            </button>
          </div>

          {/* Statistics Bar */}
          <div className="hero-stats-grid">
            <div className="stat-card">
              <span className="stat-number">12+</span>
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

        {/* Live Hardware Mini Canvas Teaser */}
        <div id="demo" className="hero-canvas-showcase">
          <HeroMiniCanvas />
        </div>
      </section>

      {/* Feature Arenas Bento Grid */}
      <section id="arenas" className="landing-section bento-section">
        <div className="section-header">
          <div className="section-badge">
            <Layers size={14} className="text-indigo-400" />
            <span>INTERACTIVE ARENAS</span>
          </div>
          <h2 className="section-title">Built for Precision & Deep Insight</h2>
          <p className="section-subtitle">
            Engineered for computer scientists, developers, and students to compare algorithmic behavior side-by-side.
          </p>
        </div>

        <div className="bento-grid">
          {/* Row 1: Card 1 (Sorting Arena - 2 cols) + Card 2 (Search Arena - 1 col) */}
          <div className="bento-card bento-card-large bento-sorting featured" onClick={() => onNavigate('sorting')}>
            <div className="bento-card-bg-glow glow-purple-subtle" />
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-purple">
                <BarChart3 size={22} />
              </div>
              <span className="bento-arena-tag">SORTING ARENA</span>
            </div>
            <h3 className="bento-title">Multi-Lane Array Sorting Race</h3>
            <p className="bento-text">
              Compare QuickSort, MergeSort, HeapSort, InsertionSort, and SelectionSort on uniform dataset seeds.
              Features precise glowing visual indicators for comparisons, swaps, pivots, heap bounds, and sorted ranges.
            </p>

            <div className="bento-preview-pills">
              <span className="bento-pill">Step Debugger & Seek Bar</span>
              <span className="bento-pill">Random / Nearly Sorted / Reversed</span>
              <span className="bento-pill">Inline Pseudocode Inspector</span>
            </div>

            <div className="bento-card-action">
              <span>Launch Sorting Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="bento-card bento-searching" onClick={() => onNavigate('searching')}>
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-blue">
                <Binary size={22} />
              </div>
              <span className="bento-arena-tag">SEARCH ARENA</span>
            </div>
            <h3 className="bento-title">Binary, Jump & Linear Search</h3>
            <p className="bento-text">
              Observe logarithmic search space elimination in Binary Search with darkened inactive ranges and index targeting.
            </p>
            <div className="bento-card-action">
              <span>Launch Search Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Row 2: Card 3 (Pathfinding Arena - 2 cols) + Card 4 (Web Audio - 1 col) */}
          <div className="bento-card bento-card-large bento-pathfinding" onClick={() => onNavigate('pathfinding')}>
            <div className="bento-card-bg-glow glow-cyan-subtle" />
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-cyan">
                <GitBranch size={22} />
              </div>
              <span className="bento-arena-tag">PATHFINDING ARENA</span>
            </div>
            <h3 className="bento-title">2D Grid Pathfinding & Wall Editor</h3>
            <p className="bento-text">
              Visualize A*, Dijkstra, BFS, and DFS graph traversals on custom 2D grid maps.
              Click and drag directly on the canvas to draw custom wall barriers with live path recalculation.
            </p>

            <div className="bento-preview-pills">
              <span className="bento-pill">Interactive Drag Walls</span>
              <span className="bento-pill">Recursive Division Maze Gen</span>
              <span className="bento-pill">Shortest Path Highlighting</span>
            </div>

            <div className="bento-card-action">
              <span>Launch Pathfinding Arena</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="bento-card bento-audio" onClick={() => onNavigate('settings')}>
            <div className="bento-card-header">
              <div className="bento-icon-wrapper icon-amber">
                <Volume2 size={22} />
              </div>
              <span className="bento-arena-tag">SOUND ENGINE</span>
            </div>
            <h3 className="bento-title">Synthesized Web Audio Feedback</h3>
            <p className="bento-text">
              Custom synthesized acoustic chimes providing subtle auditory feedback for array swaps, comparisons, and victory fanfares.
            </p>
            <div className="bento-card-action">
              <span>Audio Settings</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Row 3: Card 5 (Performance Benchmarks - 2 cols) + Card 6 (Step Debugger - 1 col) */}
          <div className="bento-card bento-card-large bento-benchmarks" onClick={() => onNavigate('history')}>
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
            <div className="bento-preview-pills">
              <span className="bento-pill">Live Execution Charts ($ms$)</span>
              <span className="bento-pill">Swap & Comparison Counters</span>
              <span className="bento-pill">Historical Race Logs</span>
            </div>
            <div className="bento-card-action">
              <span>View Benchmarks</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="bento-card bento-debugger" onClick={() => onNavigate('sorting')}>
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
            <div className="bento-card-action">
              <span>Try Debugger</span>
              <ArrowRight size={16} />
            </div>
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
            <h2 className="arch-title">Powered by Modern High-Performance Tech Stack</h2>
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
        <AlgorithmMatrix onNavigate={onNavigate} />
      </section>

      {/* Bottom CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">Ready to Benchmark Computer Science Algorithms?</h2>
          <p className="cta-banner-desc">
            Jump into the race arenas now and experience live multi-lane algorithm visualization.
          </p>
          <button
            className="landing-cta-btn btn-primary btn-large"
            onClick={() => onNavigate('sorting')}
          >
            <Zap size={20} />
            <span>Launch Sorting Arena</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-logo-icon">
              <Zap size={18} className="text-emerald-400" />
            </div>
            <span className="footer-brand-title">AlgoRace</span>
          </div>

          <div className="footer-links">
            <button onClick={() => onNavigate('sorting')}>Sorting Arena</button>
            <button onClick={() => onNavigate('searching')}>Search Arena</button>
            <button onClick={() => onNavigate('pathfinding')}>Pathfinding Arena</button>
            <button onClick={() => onNavigate('history')}>Benchmarks</button>
            <button onClick={() => onNavigate('settings')}>Settings</button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 AlgoRace. Built by <strong>Muhammad Sanan Sarwar</strong>.</p>
          <div className="footer-tech-tags">
            <span>React 18</span>
            <span>TypeScript</span>
            <span>Spring Boot</span>
            <span>Web Audio API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
