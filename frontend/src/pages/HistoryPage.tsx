import { useState, useEffect, useMemo, useRef } from 'react';
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
  Info,
  Trash2,
  Download,
  Upload,
  BarChart2,
  X,
  Play,
  RotateCcw
} from 'lucide-react';
import { 
  getHistory, 
  clearHistory, 
  exportHistoryToJSON, 
  exportHistoryToCSV, 
  importHistoryFromJSON, 
  type RaceHistoryEntry, 
  type ArenaType 
} from '../utils/historyStorage';

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
  'Comb Sort': {
    name: 'Comb Sort',
    category: 'Sorting',
    best: 'O(N log N)',
    average: 'O(N²/2ᵖ)',
    worst: 'O(N²)',
    space: 'O(1)',
    stability: 'Unstable',
    speedRank: 'Moderate',
    memoryRank: 'Minimal',
    recommendedUse: 'Eliminates turtles (small values near the end of array) in Bubble Sort via shrinking gaps.',
    realWorldApp: 'Embedded systems requiring simple gap-based sorting improvements over Bubble Sort.',
    appDescription: 'Embedded gap-sorting optimizations.'
  },
  'Radix Sort': {
    name: 'Radix Sort',
    category: 'Sorting',
    best: 'O(N·K)',
    average: 'O(N·K)',
    worst: 'O(N·K)',
    space: 'O(N + K)',
    stability: 'Stable',
    speedRank: 'Elite',
    memoryRank: 'Medium',
    recommendedUse: 'Fixed-length integer arrays, keys with bounded digit counts (e.g. 32-bit integers, telephone numbers).',
    realWorldApp: 'Suffix array construction, integer sorting in parallel computing GPUs, and radix-tree dictionary keys.',
    appDescription: 'Parallel GPU sorting and suffix tree constructions.'
  },
  'Counting Sort': {
    name: 'Counting Sort',
    category: 'Sorting',
    best: 'O(N + K)',
    average: 'O(N + K)',
    worst: 'O(N + K)',
    space: 'O(K)',
    stability: 'Stable',
    speedRank: 'Elite',
    memoryRank: 'Low',
    recommendedUse: 'Integer data with a small known maximum range K (e.g. test scores, age distributions, pixel values).',
    realWorldApp: 'Image processing histogram equalizations, radix sort sub-routines, and survey score tabulations.',
    appDescription: 'Histogram equalizations and survey scoring engines.'
  },
  'Shell Sort': {
    name: 'Shell Sort',
    category: 'Sorting',
    best: 'O(N log N)',
    average: 'O(N^1.3)',
    worst: 'O(N²)',
    space: 'O(1)',
    stability: 'Unstable',
    speedRank: 'Moderate',
    memoryRank: 'Minimal',
    recommendedUse: 'Improves on Insertion Sort by comparing and shifting elements at a shrinking gap.',
    realWorldApp: 'Embedded systems and low-memory sorting libraries.',
    appDescription: 'Embedded systems and low-memory sorting libraries.'
  },
  'Cocktail Sort': {
    name: 'Cocktail Shaker Sort',
    category: 'Sorting',
    best: 'O(N)',
    average: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stability: 'Stable',
    speedRank: 'Slow',
    memoryRank: 'Minimal',
    recommendedUse: 'Bidirectional variant of Bubble Sort.',
    realWorldApp: 'Educational algorithm design.',
    appDescription: 'Bidirectional array sorting.'
  },
  'Cocktail Shaker Sort': {
    name: 'Cocktail Shaker Sort',
    category: 'Sorting',
    best: 'O(N)',
    average: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stability: 'Stable',
    speedRank: 'Slow',
    memoryRank: 'Minimal',
    recommendedUse: 'Bidirectional variant of Bubble Sort.',
    realWorldApp: 'Educational algorithm design.',
    appDescription: 'Bidirectional array sorting.'
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
    recommendedUse: 'Unsorted arrays or small collections.',
    realWorldApp: 'Boot-up checks, linear settings parses.',
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
    recommendedUse: 'Searching in pre-sorted datasets.',
    realWorldApp: 'Database indexing, Git bisection, IP routing.',
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
    recommendedUse: 'Sorted arrays where backward memory navigation is costly.',
    realWorldApp: 'Block lookup on physical sequential disks.',
    appDescription: 'Block sequential read controllers.'
  },
  'Exponential Search': {
    name: 'Exponential Search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(log N)',
    worst: 'O(log N)',
    space: 'O(1)',
    stability: 'N/A',
    speedRank: 'Fast',
    memoryRank: 'Minimal',
    recommendedUse: 'Unbounded arrays or items close to start.',
    realWorldApp: 'Streaming search logs, infinite list lookups.',
    appDescription: 'Streaming search logs and unbounded array queries.'
  },
  'Interpolation Search': {
    name: 'Interpolation Search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(log log N)',
    worst: 'O(N)',
    space: 'O(1)',
    stability: 'N/A',
    speedRank: 'Elite',
    memoryRank: 'Minimal',
    recommendedUse: 'Uniformly distributed sorted data.',
    realWorldApp: 'Phonebook directory lookups.',
    appDescription: 'Uniformly distributed key lookups.'
  },
  'Ternary Search': {
    name: 'Ternary Search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(log3 N)',
    worst: 'O(log3 N)',
    space: 'O(1)',
    stability: 'N/A',
    speedRank: 'Elite',
    memoryRank: 'Minimal',
    recommendedUse: 'Dividing search spaces into 3 parts on pre-sorted arrays or finding unimodal function extrema.',
    realWorldApp: 'Optimization problems, ternary range splitting.',
    appDescription: 'Unimodal function optimization and 3-way partition searches.'
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
    recommendedUse: 'Shortest path on unweighted graphs.',
    realWorldApp: 'Social networks, network broadcasting.',
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
    speedRank: 'Slow',
    memoryRank: 'Medium',
    recommendedUse: 'Maze generation, topological sort, connectivity.',
    realWorldApp: 'Cycle detection in dependency graphs.',
    appDescription: 'Dependency graph cycle analysis.'
  },
  'Dijkstra': {
    name: 'Dijkstra',
    category: 'Pathfinding',
    best: 'O(V log V + E)',
    average: 'O(E log V)',
    worst: 'O(E log V)',
    space: 'O(V)',
    stability: 'N/A',
    speedRank: 'Fast',
    memoryRank: 'High',
    recommendedUse: 'Shortest path on non-negatively weighted graphs.',
    realWorldApp: 'OSPF network routing protocol.',
    appDescription: 'OSPF network routing protocol.'
  },
  'A* Search': {
    name: 'A* Search',
    category: 'Pathfinding',
    best: 'O(1)',
    average: 'O(E)',
    worst: 'O(V)',
    space: 'O(V)',
    stability: 'N/A',
    speedRank: 'Elite',
    memoryRank: 'High',
    recommendedUse: 'Targeted pathfinding using distance heuristic.',
    realWorldApp: 'Game AI pathfinding, GPS navigation.',
    appDescription: 'Game AI pathfinding & GPS routing.'
  },
  'Bellman-Ford': {
    name: 'Bellman-Ford',
    category: 'Pathfinding',
    best: 'O(E)',
    average: 'O(V·E)',
    worst: 'O(V·E)',
    space: 'O(V)',
    stability: 'N/A',
    speedRank: 'Slow',
    memoryRank: 'Medium',
    recommendedUse: 'Graphs containing negative edge weights.',
    realWorldApp: 'Distance-vector routing protocols (RIP).',
    appDescription: 'RIP network distance-vector routing.'
  },
  'Greedy Best-First': {
    name: 'Greedy Best-First',
    category: 'Pathfinding',
    best: 'O(1)',
    average: 'O(V log V)',
    worst: 'O(V²)',
    space: 'O(V)',
    stability: 'N/A',
    speedRank: 'Elite',
    memoryRank: 'Medium',
    recommendedUse: 'Fast heuristic pathfinding when an approximate path to target is needed quickly.',
    realWorldApp: 'Fast game map routing and real-time path estimation.',
    appDescription: 'Heuristic-guided rapid graph navigation.'
  },
  'Bidirectional BFS': {
    name: 'Bidirectional BFS',
    category: 'Pathfinding',
    best: 'O(1)',
    average: 'O(b^(d/2))',
    worst: 'O(b^(d/2))',
    space: 'O(b^(d/2))',
    stability: 'N/A',
    speedRank: 'Elite',
    memoryRank: 'High',
    recommendedUse: 'Shortest path on unweighted graphs by searching simultaneously from start and goal nodes.',
    realWorldApp: 'Peer-to-peer network graph traversal and social network degree-of-separation queries.',
    appDescription: 'Bidirectional search space reduction engines.'
  }
};

const getNormalizedName = (name: string): string => {
  if (name === 'A*') return 'A* Search';
  return name;
};

export function HistoryPage({ catalog }: { catalog: CatalogResponse }) {
  const [selectedAlgo, setSelectedAlgo] = useState('Quick Sort');
  const [activeTab, setActiveTab] = useState<'sorting' | 'searching' | 'pathfinding'>('sorting');

  const [historyEntries, setHistoryEntries] = useState<RaceHistoryEntry[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | ArenaType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'datasetSize'>('newest');
  
  const [selectedEntryModal, setSelectedEntryModal] = useState<RaceHistoryEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reloadHistory = () => {
    setHistoryEntries(getHistory());
  };

  useEffect(() => {
    reloadHistory();
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setHistoryEntries([]);
    setShowClearConfirm(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && importHistoryFromJSON(text)) {
        reloadHistory();
      } else {
        alert('Failed to parse history JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Analytics KPIs computed from historyEntries
  const analyticsKPIs = useMemo(() => {
    const totalRaces = historyEntries.length;

    const winnerCounts: Record<string, number> = {};
    const arenaCounts: Record<string, number> = {};
    let totalDataset = 0;
    let datasetCount = 0;

    historyEntries.forEach(entry => {
      if (entry.winner && entry.winner !== 'Tie') {
        winnerCounts[entry.winner] = (winnerCounts[entry.winner] || 0) + 1;
      }
      arenaCounts[entry.arenaType] = (arenaCounts[entry.arenaType] || 0) + 1;
      if (entry.datasetSize > 0) {
        totalDataset += entry.datasetSize;
        datasetCount++;
      }
    });

    let topWinner = 'N/A';
    let maxWins = 0;
    Object.entries(winnerCounts).forEach(([name, count]) => {
      if (count > maxWins) {
        maxWins = count;
        topWinner = name;
      }
    });

    let topArena = 'Sorting';
    let maxArenaCount = 0;
    Object.entries(arenaCounts).forEach(([arena, count]) => {
      if (count > maxArenaCount) {
        maxArenaCount = count;
        topArena = arena;
      }
    });

    const avgDataset = datasetCount > 0 ? Math.round(totalDataset / datasetCount) : 0;

    return {
      totalRaces,
      topWinner,
      maxWins,
      avgDataset,
      topArena: topArena.charAt(0).toUpperCase() + topArena.slice(1)
    };
  }, [historyEntries]);

  // Filtered & Sorted History
  const processedHistory = useMemo(() => {
    let result = historyEntries.filter(entry => {
      const matchesArena = historyFilter === 'all' || entry.arenaType === historyFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        entry.winner.toLowerCase().includes(query) ||
        entry.arenaType.toLowerCase().includes(query) ||
        (entry.datasetType && entry.datasetType.toLowerCase().includes(query)) ||
        entry.lanes.some(l => l.name.toLowerCase().includes(query));
      return matchesArena && matchesSearch;
    });

    result = [...result].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOrder === 'datasetSize') {
        return b.datasetSize - a.datasetSize;
      }
      return 0;
    });

    return result;
  }, [historyEntries, historyFilter, searchQuery, sortOrder]);

  const selectedData = algoDatabase[getNormalizedName(selectedAlgo)] || algoDatabase['Quick Sort'];

  const speedRankings = [
    { name: 'Binary / Interpolation Search / Radix / Counting Sort / A* Search', type: 'All Arenas', rating: 'Elite', desc: 'O(1), O(log log N), O(N·K) or heuristic optimal' },
    { name: 'Quick Sort / Exponential Search', type: 'Sorting / Searching', rating: 'Elite', desc: 'Ultra-low constant factors, O(N log N) / O(log N)' },
    { name: 'Merge Sort / Heap Sort / Dijkstra', type: 'Sorting / Pathfinding', rating: 'Fast', desc: 'Guaranteed O(N log N) / O(V log V)' },
    { name: 'Jump Search / BFS / DFS / Comb Sort / Shell Sort', type: 'All Arenas', rating: 'Moderate', desc: 'O(√N) / Linear graph traversals / gap sorting' },
    { name: 'Bubble / Selection / Insertion / Cocktail Sort / Linear Search / Bellman-Ford', type: 'All Arenas', rating: 'Slow', desc: 'Quadratic O(N²) sorting, O(N) search, O(V·E) pathfinding' }
  ];

  const memoryRankings = [
    { name: 'Bubble / Selection / Insertion / Heap / Comb Sort / Shell Sort / Cocktail Sort', type: 'Sorting', rating: 'Minimal', desc: 'O(1) auxiliary space, in-place' },
    { name: 'Linear / Binary / Jump / Exponential / Interpolation Search', type: 'Searching', rating: 'Minimal', desc: 'O(1) auxiliary space, index checks' },
    { name: 'Quick Sort / Counting Sort', type: 'Sorting', rating: 'Low', desc: 'O(log N) stack / O(K) frequency count array' },
    { name: 'DFS / Radix Sort / Bellman-Ford', type: 'All Arenas', rating: 'Medium', desc: 'O(Depth) stack / O(N+K) bucket buffers / distance table' },
    { name: 'Merge Sort / BFS / Dijkstra / A*', type: 'Sorting / Pathfinding', rating: 'High', desc: 'O(N) / O(V) auxiliary grid queues/arrays' }
  ];

  const stabilityRankings = [
    { name: 'Merge Sort / Insertion Sort / Bubble Sort / Cocktail Sort / Radix Sort / Counting Sort', type: 'Sorting', rating: 'Stable', desc: 'Preserves duplicate keys ordering' },
    { name: 'Quick Sort / Heap Sort / Selection Sort / Comb Sort / Shell Sort', type: 'Sorting', rating: 'Unstable', desc: 'Does not guarantee duplicate ordering' },
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

  const handleReplayRace = (entry: RaceHistoryEntry) => {
    if (!entry.replayParams) {
      window.location.hash = `#/${entry.arenaType}`;
      return;
    }
    const params = new URLSearchParams(entry.replayParams);
    window.location.href = `/?${params.toString()}#/${entry.arenaType}`;
  };

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart2 className="text-primary" size={32} />
            Benchmark & Performance Analytics Center
          </h1>
          <p>Real-time persistent session logs, comparative metric breakdowns, and theoretical algorithm performance matrices.</p>
        </div>
      </header>

      <div className="page-body">
        {/* Session Analytics KPI Cards */}
        <section className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon-box blue">
              <Zap size={24} />
            </div>
            <div>
              <div className="analytics-kpi-val">{analyticsKPIs.totalRaces}</div>
              <div className="analytics-kpi-label">Total Races Recorded</div>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon-box gold">
              <Trophy size={24} />
            </div>
            <div>
              <div className="analytics-kpi-val">{analyticsKPIs.topWinner}</div>
              <div className="analytics-kpi-label">
                Most Dominant ({analyticsKPIs.maxWins} {analyticsKPIs.maxWins === 1 ? 'Win' : 'Wins'})
              </div>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon-box purple">
              <Layers size={24} />
            </div>
            <div>
              <div className="analytics-kpi-val">{analyticsKPIs.avgDataset}</div>
              <div className="analytics-kpi-label">Avg Dataset Size</div>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon-box green">
              <Cpu size={24} />
            </div>
            <div>
              <div className="analytics-kpi-val">{analyticsKPIs.topArena}</div>
              <div className="analytics-kpi-label">Most Active Arena</div>
            </div>
          </div>
        </section>

        {/* Persistent Race Session History & Log Hub */}
        <section className="panel" style={{ padding: '28px', marginBottom: '32px' }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} className="text-primary" /> Persistent Race Session History
            </span>

            <div className="history-actions-group">
              <button className="btn btn-secondary btn-sm" onClick={exportHistoryToCSV} title="Export History as CSV">
                <Download size={14} /> CSV
              </button>
              <button className="btn btn-secondary btn-sm" onClick={exportHistoryToJSON} title="Export History as JSON">
                <Download size={14} /> JSON
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} title="Import JSON History">
                <Upload size={14} /> Import
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" style={{ display: 'none' }} />
              
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ color: '#ef4444', borderColor: '#ef4444' }} 
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="history-filters-bar">
            <div className="history-pills-group">
              {(['all', 'sorting', 'searching', 'pathfinding'] as const).map(type => (
                <button
                  key={type}
                  className={`history-pill-btn ${historyFilter === type ? 'active' : ''}`}
                  onClick={() => setHistoryFilter(type)}
                >
                  {type === 'all' ? 'All Arenas' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 32px',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                    width: '180px'
                  }}
                />
              </div>

              <select
                className="select-dropdown"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="datasetSize">Dataset Size</option>
              </select>
            </div>
          </div>

          {/* Clear History Confirmation Modal */}
          {showClearConfirm && (
            <div className="history-modal-overlay">
              <div className="history-modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '12px', color: '#ef4444' }}>Clear Session History?</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  This action will permanently remove all persistent benchmark session records from local storage.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ background: '#ef4444' }} onClick={handleClearHistory}>Confirm Clear</button>
                </div>
              </div>
            </div>
          )}

          {processedHistory.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
              No race history matches the current filters. Run algorithms in the arenas to record session benchmarks!
            </div>
          ) : (
            <div className="matrix-list">
              <div className="matrix-row matrix-header" style={{ gridTemplateColumns: '1.2fr 1fr 1.2fr 1.5fr 1fr' }}>
                <strong>Date & Time</strong>
                <span>Arena Type</span>
                <span>Dataset / Target</span>
                <span>Winner</span>
                <span>Actions</span>
              </div>
              {processedHistory.map((entry) => (
                <div className="matrix-row" key={entry.id} style={{ gridTemplateColumns: '1.2fr 1fr 1.2fr 1.5fr 1fr' }}>
                  <strong>{new Date(entry.date).toLocaleString()}</strong>
                  <span style={{ textTransform: 'capitalize' }}>{entry.arenaType}</span>
                  <span>
                    {entry.arenaType === 'pathfinding' ? 'Grid (18x28)' : `${entry.datasetSize} items`}
                    {entry.targetValue !== undefined && ` (Target: ${entry.targetValue})`}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={14} color={entry.winner === 'Tie' ? 'gray' : 'gold'} />
                    <strong>{entry.winner}</strong>
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedEntryModal(entry)}
                      title="Inspect Detailed Standings & Chart"
                    >
                      <Info size={14} /> Details
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleReplayRace(entry)}
                      title="Race again with the exact same dataset configuration"
                    >
                      <RotateCcw size={14} /> Rematch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Detailed History Inspector Modal */}
        {selectedEntryModal && (
          <div className="history-modal-overlay" onClick={() => setSelectedEntryModal(null)}>
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Trophy size={20} className="text-amber-400" />
                  Race Session Breakdown
                </h3>
                <button
                  style={{ background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer' }}
                  onClick={() => setSelectedEntryModal(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: 'var(--panel-2)', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div><strong>Arena:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedEntryModal.arenaType}</span></div>
                  <div><strong>Date:</strong> {new Date(selectedEntryModal.date).toLocaleString()}</div>
                  <div><strong>Dataset Type:</strong> {selectedEntryModal.datasetType || 'Standard'}</div>
                  <div><strong>Dataset Size:</strong> {selectedEntryModal.datasetSize || '18x28 Grid'}</div>
                  {selectedEntryModal.targetValue !== undefined && <div><strong>Search Target:</strong> {selectedEntryModal.targetValue}</div>}
                  {selectedEntryModal.pathCost !== undefined && <div><strong>Path Cost:</strong> {selectedEntryModal.pathCost}</div>}
                </div>
              </div>

              <h4>Ranked Standings Podium</h4>
              <div className="history-podium-grid">
                {selectedEntryModal.lanes.map((lane, idx) => (
                  <div key={lane.name} className={`history-podium-card ${idx === 0 ? 'rank-1' : ''}`}>
                    <div className="history-podium-badge">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="history-podium-name">{lane.name}</div>
                    <div className="history-podium-stats">
                      {lane.comparisons > 0 && <div>Comparisons: {lane.comparisons.toLocaleString()}</div>}
                      {lane.swaps !== undefined && <div>Swaps: {lane.swaps.toLocaleString()}</div>}
                      {lane.steps !== undefined && <div>Steps: {lane.steps.toLocaleString()}</div>}
                      <div style={{ color: 'var(--primary)', marginTop: '4px' }}>Time: {lane.timeMs}ms</div>
                    </div>
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: '24px' }}>Execution Time Comparison (ms)</h4>
              <div className="history-bar-chart">
                {(() => {
                  const maxTime = Math.max(...selectedEntryModal.lanes.map(l => l.timeMs), 1);
                  return selectedEntryModal.lanes.map((lane, idx) => {
                    const widthPct = Math.max(8, Math.min(100, (lane.timeMs / maxTime) * 100));
                    return (
                      <div className="history-bar-row" key={lane.name}>
                        <div className="history-bar-label">{lane.name}</div>
                        <div className="history-bar-track">
                          <div
                            className={`history-bar-fill ${idx === 0 ? 'rank-1' : ''}`}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <div className="history-bar-value">{lane.timeMs} ms</div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedEntryModal(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => handleReplayRace(selectedEntryModal)}>
                  <RotateCcw size={16} /> Race Again (Rematch)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Algorithm Explorer */}
        <section className="panel" style={{ padding: '28px', marginBottom: '32px' }}>
          <div className="algo-explorer-section-header">
            <div className="algo-explorer-header-bar" />
            <h2 className="algo-explorer-section-title">Interactive Algorithm Explorer</h2>
          </div>

          <div className="algo-explorer-container">
            {/* Sidebar list of algorithms */}
            <div className="algo-explorer-sidebar">
              <div className="algo-explorer-group">
                <div className="algo-explorer-group-title">SORTING</div>
                <div className="algo-explorer-group-items">
                  {(catalog?.sortingAlgorithms ?? [
                    'Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 
                    'Quick Sort', 'Heap Sort', 'Comb Sort', 'Radix Sort', 'Counting Sort', 'Cocktail Sort', 'Shell Sort'
                  ]).map((algo) => (
                    <button
                      key={algo}
                      className={`algo-explorer-item ${selectedAlgo === algo ? 'active' : ''}`}
                      onClick={() => setSelectedAlgo(algo)}
                    >
                      <span>{algo}</span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="algo-explorer-group">
                <div className="algo-explorer-group-title">SEARCHING</div>
                <div className="algo-explorer-group-items">
                  {(catalog?.searchingAlgorithms ?? [
                    'Linear Search', 'Binary Search', 'Jump Search', 
                    'Exponential Search', 'Interpolation Search', 'Ternary Search'
                  ]).map((algo) => (
                    <button
                      key={algo}
                      className={`algo-explorer-item ${selectedAlgo === algo ? 'active' : ''}`}
                      onClick={() => setSelectedAlgo(algo)}
                    >
                      <span>{algo}</span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="algo-explorer-group">
                <div className="algo-explorer-group-title">PATHFINDING</div>
                <div className="algo-explorer-group-items">
                  {(catalog?.pathfindingAlgorithms ?? [
                    'BFS', 'DFS', 'Dijkstra', 'A* Search', 'Bellman-Ford', 'Greedy Best-First', 'Bidirectional BFS'
                  ]).map((algo) => (
                    <button
                      key={algo}
                      className={`algo-explorer-item ${selectedAlgo === algo ? 'active' : ''}`}
                      onClick={() => setSelectedAlgo(algo)}
                    >
                      <span>{algo}</span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main detail card for selected algorithm */}
            <div className="algo-explorer-main">
              <div className="algo-explorer-top-bar">
                <div>
                  <span className="algo-category-pill">{selectedData.category}</span>
                  <h2 className="algo-explorer-title">{selectedData.name}</h2>
                  <div className="algo-explorer-badges-row">
                    <span className={getRankBadgeClass(selectedData.speedRank)}>
                      SPEED: {selectedData.speedRank.toUpperCase()}
                    </span>
                    <span className={getRankBadgeClass(selectedData.memoryRank)}>
                      MEMORY: {selectedData.memoryRank.toUpperCase()}
                    </span>
                    <span className={getRankBadgeClass(selectedData.stability)}>
                      STABILITY: {selectedData.stability.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="algo-explorer-profile-box">
                  <div className="algo-explorer-profile-lbl">
                    <Clock size={14} /> COMPLEXITY PROFILE
                  </div>
                  <div className="algo-explorer-profile-val">{selectedData.average}</div>
                  <div className="algo-explorer-profile-sub">Average Case Time</div>
                </div>
              </div>

              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.82rem', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                  <Layers size={16} /> COMPLEXITY MATRIX
                </h4>
                <div className="algo-explorer-matrix-grid">
                  <div className="algo-explorer-matrix-card">
                    <div className="algo-explorer-card-lbl">Best Case Time</div>
                    <div className="algo-explorer-card-val">{selectedData.best}</div>
                  </div>
                  <div className="algo-explorer-matrix-card">
                    <div className="algo-explorer-card-lbl">Average Case Time</div>
                    <div className="algo-explorer-card-val">{selectedData.average}</div>
                  </div>
                  <div className="algo-explorer-matrix-card">
                    <div className="algo-explorer-card-lbl">Worst Case Time</div>
                    <div className="algo-explorer-card-val">{selectedData.worst}</div>
                  </div>
                  <div className="algo-explorer-matrix-card">
                    <div className="algo-explorer-card-lbl">Space Complexity</div>
                    <div className="algo-explorer-card-val">{selectedData.space}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                  <Zap size={16} className="text-amber-400" /> RECOMMENDED USE CASES
                </h4>
                <div className="algo-explorer-usecase-box">
                  {selectedData.recommendedUse}
                </div>
              </div>

              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--cyan, #0284c7)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                  <Sparkles size={16} className="text-cyan-400" /> PRACTICAL INDUSTRY APPLICATION
                </h4>
                <div className="algo-explorer-industry-box">
                  <div className="algo-explorer-industry-title">{selectedData.realWorldApp}</div>
                  <div className="algo-explorer-industry-desc">{selectedData.appDescription}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Theoretical Rankings & Matrices */}
        <section className="rankings-grid">
          <article className="panel ranking-card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={16} /> Speed & Efficiency Spectrum
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
              <Cpu size={16} /> Auxiliary Memory Overhead
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

            {activeTab === 'sorting' && (catalog?.sortingAlgorithms ?? []).map((name) => {
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

            {activeTab === 'searching' && (catalog?.searchingAlgorithms ?? []).map((name) => {
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

            {activeTab === 'pathfinding' && (catalog?.pathfindingAlgorithms ?? []).map((name) => {
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
              <p>Navigation software like Google Maps utilizes A* Search and Dijkstra's algorithms on massive highway graphs to compute the fastest driving routes while accounting for traffic costs.</p>
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
              <p>Hardware routers deploy Dijkstra's algorithm within the OSPF (Open Shortest Path First) protocol to find the shortest routing paths for data packets across network topology.</p>
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
