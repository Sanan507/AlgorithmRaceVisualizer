import { useState } from 'react';
import type { CatalogResponse } from '../models/types';
import { 
  Trophy, 
  Clock, 
  Layers, 
  Flame, 
  Cpu, 
  Search, 
  Zap, 
  Map, 
  Share2, 
  Grid, 
  Database,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface AlgoMeta {
  name: string;
  category: 'Sorting' | 'Searching' | 'Pathfinding';
  best: string;
  average: string;
  worst: string;
  space: string;
  stability: 'Stable' | 'Unstable' | 'N/A';
  speedRank: 'Elite' | 'Fast' | 'Moderate' | 'Slow';
  memoryRank: 'Minimal' | 'Low' | 'Medium' | 'High';
  recommendedUse: string;
  realWorldApp: string;
  appDescription: string;
}

const algoDatabase: Record<string, AlgoMeta> = {
  // Sorting
  'Bubble Sort': {
    name: 'Bubble Sort',
    category: 'Sorting',
    best: 'O(N)',
    average: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stability: 'Stable',
    speedRank: 'Slow',
    memoryRank: 'Minimal',
    recommendedUse: 'Mainly educational. Can be used to verify if a list is already sorted with O(N) cost, or for extremely small datasets.',
    realWorldApp: 'Computer science education and computer graphics polygon ordering (when shapes are already nearly sorted).',
    appDescription: 'Pedagogical demonstration of sorting basics.'
  },
  'Selection Sort': {
    name: 'Selection Sort',
    category: 'Sorting',
    best: 'O(N²)',
    average: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stability: 'Unstable',
    speedRank: 'Slow',
    memoryRank: 'Minimal',
    recommendedUse: 'When writing to memory/disk is extremely expensive. Selection Sort guarantees a minimum number of swap operations (O(N)).',
    realWorldApp: 'EEPROM or flash memory hardware controllers where write operations are limited by physical wear.',
    appDescription: 'EEPROM/Flash write-optimization systems.'
  },
  'Insertion Sort': {
    name: 'Insertion Sort',
    category: 'Sorting',
    best: 'O(N)',
    average: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stability: 'Stable',
    speedRank: 'Slow',
    memoryRank: 'Minimal',
    recommendedUse: 'Highly efficient for very small datasets (N < 15) or nearly sorted datasets. Often used as the base case in hybrid algorithms.',
    realWorldApp: 'Part of hybrid algorithms like Timsort (used in Java & Python) and IntroSort (used in C++ standard library).',
    appDescription: 'High-performance hybrid programming libraries.'
  },
  'Merge Sort': {
    name: 'Merge Sort',
    category: 'Sorting',
    best: 'O(N log N)',
    average: 'O(N log N)',
    worst: 'O(N log N)',
    space: 'O(N)',
    stability: 'Stable',
    speedRank: 'Fast',
    memoryRank: 'Medium',
    recommendedUse: 'When sorting linked lists (requires O(1) space modification), external sorting of datasets that do not fit in RAM, or when stable sorting is required.',
    realWorldApp: 'External sort-merge routines in relational databases (PostgreSQL) and transaction processors.',
    appDescription: 'RDBMS query planner sorting routines.'
  },
  'Quick Sort': {
    name: 'Quick Sort',
    category: 'Sorting',
    best: 'O(N log N)',
    average: 'O(N log N)',
    worst: 'O(N²)',
    space: 'O(log N)',
    stability: 'Unstable',
    speedRank: 'Elite',
    memoryRank: 'Low',
    recommendedUse: 'General-purpose in-memory sorting. Possesses excellent cache locality and minimal constant factor overhead.',
    realWorldApp: 'Language standard library sorting (e.g. C++ std::sort, Java primitive sorting, JavaScript V8 engine).',
    appDescription: 'V8 JS engine and standard programming languages.'
  },
  'Heap Sort': {
    name: 'Heap Sort',
    category: 'Sorting',
    best: 'O(N log N)',
    average: 'O(N log N)',
    worst: 'O(N log N)',
    space: 'O(1)',
    stability: 'Unstable',
    speedRank: 'Fast',
    memoryRank: 'Minimal',
    recommendedUse: 'When worst-case time bounds and strict auxiliary memory usage are required, avoiding Quick Sort\'s worst case.',
    realWorldApp: 'Operating system kernels (Linux kernel scheduler) and safety-critical embedded systems.',
    appDescription: 'Safety-critical systems and Kernel thread schedulers.'
  },
  // Searching
  'Linear Search': {
    name: 'Linear Search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(N)',
    worst: 'O(N)',
    space: 'O(1)',
    stability: 'N/A',
    speedRank: 'Slow',
    memoryRank: 'Minimal',
    recommendedUse: 'Unsorted arrays, small collections, or list checks that are executed infrequently.',
    realWorldApp: 'Boot-up checks, linear settings parses, or scanning key-value configuration values.',
    appDescription: 'Boot up configuration parses.'
  },
  'Binary Search': {
    name: 'Binary Search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(log N)',
    worst: 'O(log N)',
    space: 'O(1)',
    stability: 'N/A',
    speedRank: 'Elite',
    memoryRank: 'Minimal',
    recommendedUse: 'Searching in pre-sorted datasets. An absolute necessity for high-frequency search arrays.',
    realWorldApp: 'Database indexing (B-Tree searches), Git bisection tool, and IP address routing table matches.',
    appDescription: 'B-Tree database index lookups.'
  },
  'Jump Search': {
    name: 'Jump Search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(√N)',
    worst: 'O(√N)',
    space: 'O(1)',
    stability: 'N/A',
    speedRank: 'Moderate',
    memoryRank: 'Minimal',
    recommendedUse: 'Sorted arrays where moving backward in memory is expensive (e.g. tape drives or disk block reads).',
    realWorldApp: 'Block lookup on physical sequential disks or hardware registers backing streaming data.',
    appDescription: 'Block sequential read controllers.'
  },
  // Pathfinding
  'BFS': {
    name: 'BFS',
    category: 'Pathfinding',
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    stability: 'N/A',
    speedRank: 'Moderate',
    memoryRank: 'High',
    recommendedUse: 'Finding the shortest path on unweighted graphs, or searching layer-by-layer.',
    realWorldApp: 'Social networks (Bacon number, peer connections), network packet broadcasting, and P2P trackers.',
    appDescription: 'Social networks connection paths.'
  },
  'DFS': {
    name: 'DFS',
    category: 'Pathfinding',
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    stability: 'N/A',
    speedRank: 'Moderate',
    memoryRank: 'Medium',
    recommendedUse: 'Solving mazes, checking for cycles in graphs, topological sorting, or evaluating game trees.',
    realWorldApp: 'Compiler optimization routines (flow parsing) and chess engines evaluating move branches.',
    appDescription: 'Compiler flow parse and chess game AI.'
  },
  'Dijkstra': {
    name: 'Dijkstra',
    category: 'Pathfinding',
    best: 'O(V log V + E)',
    average: 'O((V + E) log V)',
    worst: 'O((V + E) log V)',
    space: 'O(V)',
    stability: 'N/A',
    speedRank: 'Fast',
    memoryRank: 'High',
    recommendedUse: 'Finding the absolute shortest path on weighted graphs with non-negative weights.',
    realWorldApp: 'Network routing protocol OSPF (Open Shortest Path First) and flight ticket connection engines.',
    appDescription: 'Router packet routing protocols.'
  },
  'A* Search': {
    name: 'A* Search',
    category: 'Pathfinding',
    best: 'O(1) / O(E)',
    average: 'O(b^d)',
    worst: 'O(V + E)',
    space: 'O(V)',
    stability: 'N/A',
    speedRank: 'Elite',
    memoryRank: 'High',
    recommendedUse: 'Coordinate-based map navigation and pathfinding in video games or mobile maps.',
    realWorldApp: 'GPS systems calculating physical driving routes, video game AI character movement (e.g. StarCraft, RTS games).',
    appDescription: 'GPS vehicle navigation and game map navigation.'
  }
};

// Normalized name mapping because backend can return BFS, DFS, Dijkstra, A* Search
const getNormalizedName = (name: string): string => {
  if (name === 'A*') return 'A* Search';
  return name;
};

export function HistoryPage({ catalog }: { catalog: CatalogResponse }) {
  const [selectedAlgo, setSelectedAlgo] = useState('Quick Sort');
  const [activeTab, setActiveTab] = useState<'sorting' | 'searching' | 'pathfinding'>('sorting');

  const selectedData = algoDatabase[getNormalizedName(selectedAlgo)] || algoDatabase['Quick Sort'];

  const speedRankings = [
    { name: 'Binary Search / A* Search', type: 'Searching / Pathfinding', rating: 'Elite', desc: 'Logarithmic or highly heuristic' },
    { name: 'Quick Sort', type: 'Sorting', rating: 'Elite', desc: 'Ultra-low constant factors, O(N log N)' },
    { name: 'Merge Sort / Heap Sort / Dijkstra', type: 'Sorting / Pathfinding', rating: 'Fast', desc: 'Guaranteed O(N log N) / O(V log V)' },
    { name: 'Jump Search / BFS / DFS', type: 'Searching / Pathfinding', rating: 'Moderate', desc: 'O(√N) / Linear graph traversals' },
    { name: 'Bubble / Selection / Insertion / Linear Search', type: 'Sorting / Searching', rating: 'Slow', desc: 'Quadratic O(N²) sorting, O(N) searching' }
  ];

  const memoryRankings = [
    { name: 'Bubble / Selection / Insertion / Heap Sort', type: 'Sorting', rating: 'Minimal', desc: 'O(1) auxiliary space, in-place' },
    { name: 'Linear / Binary / Jump Search', type: 'Searching', rating: 'Minimal', desc: 'O(1) auxiliary space, index checks' },
    { name: 'Quick Sort', type: 'Sorting', rating: 'Low', desc: 'O(log N) recursion stack' },
    { name: 'DFS', type: 'Pathfinding', rating: 'Medium', desc: 'O(Depth) recursion stack' },
    { name: 'Merge Sort / BFS / Dijkstra / A*', type: 'Sorting / Pathfinding', rating: 'High', desc: 'O(N) / O(V) auxiliary grid queues/arrays' }
  ];

  const stabilityRankings = [
    { name: 'Merge Sort / Insertion Sort / Bubble Sort', type: 'Sorting', rating: 'Stable', desc: 'Preserves duplicate keys ordering' },
    { name: 'Quick Sort / Heap Sort / Selection Sort', type: 'Sorting', rating: 'Unstable', desc: 'Does not guarantee duplicate ordering' },
    { name: 'Searching & Pathfinding Algorithms', type: 'Other', rating: 'N/A', desc: 'Stability metric is not applicable' }
  ];

  const getRankBadgeClass = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'elite':
      case 'stable':
      case 'minimal':
        return 'algo-badge elite';
      case 'fast':
      case 'low':
        return 'algo-badge fast';
      case 'moderate':
      case 'medium':
        return 'algo-badge moderate';
      case 'slow':
      case 'high':
      case 'unstable':
        return 'algo-badge slow';
      default:
        return 'algo-badge';
    }
  };

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Algorithm Benchmarks</h1>
          <p>Comprehensive pedagogical analysis, complexity indices, and real-world execution metrics.</p>
        </div>
      </header>

      <div className="benchmarks-container">
        {/* Interactive Algorithm Explorer */}
        <section className="panel" style={{ padding: '28px' }}>
          <div className="section-title">Interactive Algorithm Explorer</div>
          
          <div className="benchmarks-explorer">
            {/* Sidebar List */}
            <div className="algo-sidebar-panel">
              <div className="algo-sidebar-group">
                <h5>Sorting</h5>
                {catalog.sortingAlgorithms.map((name) => (
                  <button
                    key={name}
                    className={`algo-selector-btn ${selectedAlgo === name ? 'active' : ''}`}
                    onClick={() => setSelectedAlgo(name)}
                  >
                    <span>{name}</span>
                    <ArrowRight size={14} className="icon-muted" style={{ opacity: selectedAlgo === name ? 1 : 0.4 }} />
                  </button>
                ))}
              </div>

              <div className="algo-sidebar-group">
                <h5>Searching</h5>
                {catalog.searchingAlgorithms.map((name) => (
                  <button
                    key={name}
                    className={`algo-selector-btn ${selectedAlgo === name ? 'active' : ''}`}
                    onClick={() => setSelectedAlgo(name)}
                  >
                    <span>{name}</span>
                    <ArrowRight size={14} className="icon-muted" style={{ opacity: selectedAlgo === name ? 1 : 0.4 }} />
                  </button>
                ))}
              </div>

              <div className="algo-sidebar-group">
                <h5>Pathfinding</h5>
                {catalog.pathfindingAlgorithms.map((name) => (
                  <button
                    key={name}
                    className={`algo-selector-btn ${selectedAlgo === name ? 'active' : ''}`}
                    onClick={() => setSelectedAlgo(name)}
                  >
                    <span>{name === 'A*' ? 'A* Search' : name}</span>
                    <ArrowRight size={14} className="icon-muted" style={{ opacity: selectedAlgo === name ? 1 : 0.4 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Card */}
            <div className="panel algo-details-panel">
              <div className="algo-details-header">
                <div>
                  <span className="algo-badge category">{selectedData.category}</span>
                  <h2 style={{ marginTop: '8px' }}>{selectedData.name}</h2>
                  <div className="algo-details-badges">
                    <span className={getRankBadgeClass(selectedData.speedRank)}>Speed: {selectedData.speedRank}</span>
                    <span className={getRankBadgeClass(selectedData.memoryRank)}>Memory: {selectedData.memoryRank}</span>
                    <span className={getRankBadgeClass(selectedData.stability)}>Stability: {selectedData.stability}</span>
                  </div>
                </div>

                <div className="algo-metric-meter-container">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Flame size={14} /> Complexity Profile
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-2)', fontFamily: 'ui-monospace, SFMono-Regular, monospace', marginTop: '4px' }}>
                    {selectedData.average}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Average Case Time</span>
                </div>
              </div>

              <div className="algo-details-body">
                {/* Complexity Grid */}
                <div className="algo-detail-section">
                  <h4><Layers size={14} /> Complexity Matrix</h4>
                  <div className="complexity-grid" style={{ margin: '8px 0 0 0' }}>
                    <span>
                      Best Case Time
                      <strong>{selectedData.best}</strong>
                    </span>
                    <span>
                      Average Case Time
                      <strong>{selectedData.average}</strong>
                    </span>
                    <span>
                      Worst Case Time
                      <strong>{selectedData.worst}</strong>
                    </span>
                    <span>
                      Space Complexity
                      <strong>{selectedData.space}</strong>
                    </span>
                  </div>
                </div>

                {/* Recommended Use Case */}
                <div className="algo-detail-section">
                  <h4><Zap size={14} /> Recommended Use Cases</h4>
                  <p>{selectedData.recommendedUse}</p>
                </div>

                {/* Real World Application */}
                <div className="algo-detail-section" style={{ background: 'var(--panel-2)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <h4 style={{ color: 'var(--accent-2)' }}><Sparkles size={14} /> Practical Industry Application</h4>
                  <strong style={{ fontSize: '0.98rem', display: 'block', margin: '6px 0 4px 0', color: 'var(--text)' }}>
                    {selectedData.realWorldApp}
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>{selectedData.recommendedUse}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Algorithm Rankings */}
        <section className="rankings-grid">
          <article className="panel ranking-card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={16} /> Speed Performance
            </div>
            <div className="ranking-ordered-list">
              {speedRankings.map((item, idx) => (
                <div className={`ranking-row-item ${idx === 0 ? 'top-rank' : ''}`} key={item.name}>
                  <div className="ranking-num-badge">{idx + 1}</div>
                  <div className="ranking-item-info">
                    <span className="ranking-item-name">{item.name}</span>
                    <span className="ranking-item-desc">{item.desc}</span>
                  </div>
                  <span className={getRankBadgeClass(item.rating)}>{item.rating}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel ranking-card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} /> Memory Efficiency
            </div>
            <div className="ranking-ordered-list">
              {memoryRankings.map((item, idx) => (
                <div className={`ranking-row-item ${idx === 0 ? 'top-rank' : ''}`} key={item.name}>
                  <div className="ranking-num-badge">{idx + 1}</div>
                  <div className="ranking-item-info">
                    <span className="ranking-item-name">{item.name}</span>
                    <span className="ranking-item-desc">{item.desc}</span>
                  </div>
                  <span className={getRankBadgeClass(item.rating)}>{item.rating}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel ranking-card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} /> Sorting Stability
            </div>
            <div className="ranking-ordered-list">
              {stabilityRankings.map((item, idx) => (
                <div className={`ranking-row-item ${idx === 0 ? 'top-rank' : ''}`} key={item.name}>
                  <div className="ranking-num-badge">{idx + 1}</div>
                  <div className="ranking-item-info">
                    <span className="ranking-item-name">{item.name}</span>
                    <span className="ranking-item-desc">{item.desc}</span>
                  </div>
                  <span className={getRankBadgeClass(item.rating)}>{item.rating}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Complexity Comparison Matrix Tables */}
        <section className="panel" style={{ padding: '28px' }}>
          <div className="section-title">Complexity Matrices</div>
          
          <div className="tab-selector-bar">
            <button 
              className={`tab-selector-btn ${activeTab === 'sorting' ? 'active' : ''}`}
              onClick={() => setActiveTab('sorting')}
            >
              Sorting
            </button>
            <button 
              className={`tab-selector-btn ${activeTab === 'searching' ? 'active' : ''}`}
              onClick={() => setActiveTab('searching')}
            >
              Searching
            </button>
            <button 
              className={`tab-selector-btn ${activeTab === 'pathfinding' ? 'active' : ''}`}
              onClick={() => setActiveTab('pathfinding')}
            >
              Pathfinding
            </button>
          </div>

          <div className="matrix-list">
            <div className="matrix-row matrix-header" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr' }}>
              <strong>Algorithm</strong>
              <span>Best Time</span>
              <span>Average Time</span>
              <span>Worst Time</span>
              <span>Space Complexity</span>
            </div>

            {activeTab === 'sorting' && catalog.sortingAlgorithms.map((name) => {
              const data = algoDatabase[name];
              if (!data) return null;
              return (
                <div className="matrix-row" key={name} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr' }}>
                  <strong>{name}</strong>
                  <span>{data.best}</span>
                  <span>{data.average}</span>
                  <span>{data.worst}</span>
                  <span>{data.space}</span>
                </div>
              );
            })}

            {activeTab === 'searching' && catalog.searchingAlgorithms.map((name) => {
              const data = algoDatabase[name];
              if (!data) return null;
              return (
                <div className="matrix-row" key={name} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr' }}>
                  <strong>{name}</strong>
                  <span>{data.best}</span>
                  <span>{data.average}</span>
                  <span>{data.worst}</span>
                  <span>{data.space}</span>
                </div>
              );
            })}

            {activeTab === 'pathfinding' && catalog.pathfindingAlgorithms.map((name) => {
              const normalizedName = getNormalizedName(name);
              const data = algoDatabase[normalizedName];
              if (!data) return null;
              return (
                <div className="matrix-row" key={name} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr' }}>
                  <strong>{normalizedName}</strong>
                  <span>{data.best}</span>
                  <span>{data.average}</span>
                  <span>{data.worst}</span>
                  <span>{data.space}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Real World Applications */}
        <section className="panel" style={{ padding: '28px' }}>
          <div className="section-title">Real World Production Applications</div>
          <div className="app-use-cases-grid">
            <div className="app-use-case-card">
              <div className="app-use-case-icon-box">
                <Search size={20} />
              </div>
              <h5>Google Search</h5>
              <p>Uses high-dimensional search indices and tree-based structures (similar to Binary Search) to locate matching terms across billions of indexed web documents in milliseconds.</p>
            </div>

            <div className="app-use-case-card">
              <div className="app-use-case-icon-box">
                <Map size={20} />
              </div>
              <h5>GPS Navigation</h5>
              <p>Navigation software like Google Maps utilizes A* Search and Dijkstra\'s algorithms on massive highway graphs to compute the fastest driving routes while accounting for traffic costs.</p>
            </div>

            <div className="app-use-case-card">
              <div className="app-use-case-icon-box">
                <Share2 size={20} />
              </div>
              <h5>Social Networks</h5>
              <p>Platforms like Facebook and LinkedIn use Breadth-First Search (BFS) to map connections, recommend mutual friends, and calculate degree-of-separation paths.</p>
            </div>

            <div className="app-use-case-card">
              <div className="app-use-case-icon-box">
                <Grid size={20} />
              </div>
              <h5>Network Routing</h5>
              <p>Hardware routers deploy Dijkstra\'s algorithm within the OSPF (Open Shortest Path First) protocol to find the shortest routing paths for data packets across network topology.</p>
            </div>

            <div className="app-use-case-card">
              <div className="app-use-case-icon-box">
                <Database size={20} />
              </div>
              <h5>Database Indexing</h5>
              <p>Relational databases use B-Trees and binary search trees to index primary keys. This ensures queries look up records in O(log N) search operations instead of full table scans.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
