export type ArenaType = 'sorting' | 'searching' | 'pathfinding' | 'dp' | 'trees';

export type LaneMetric = {
  name: string;
  comparisons: number;
  swaps?: number;
  steps?: number;
  timeMs: number;
  found?: boolean;
  pathLength?: number;
  rank?: number;
};

export type RaceHistoryEntry = {
  id: string;
  date: string;
  arenaType: ArenaType;
  winner: string;
  datasetSize: number;
  datasetType?: string;
  targetValue?: number;
  pathCost?: number;
  lanes: LaneMetric[];
  replayParams?: Record<string, string>;
};

const HISTORY_KEY = 'algorace_history';

export function getHistory(): RaceHistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to parse history from localStorage', err);
    return [];
  }
}

export function appendHistory(entry: RaceHistoryEntry): void {
  try {
    const history = getHistory();
    // Pre-sort lanes into ranked order by timeMs, comparisons
    const sortedLanes = [...entry.lanes].sort((a, b) => {
      if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
      return a.comparisons - b.comparisons;
    });

    const rankedLanes = sortedLanes.map((lane, index) => ({
      ...lane,
      rank: index + 1
    }));

    const enrichedEntry: RaceHistoryEntry = {
      ...entry,
      lanes: rankedLanes
    };

    // Prepend new history item so newest is first
    history.unshift(enrichedEntry);
    
    // Keep max 100 entries to prevent localStorage bloat
    if (history.length > 100) {
      history.length = 100;
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save history to localStorage', err);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear history from localStorage', err);
  }
}

export function exportHistoryToJSON(): void {
  const history = getHistory();
  const jsonStr = JSON.stringify(history, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `algorace_benchmark_history_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportHistoryToCSV(): void {
  const history = getHistory();
  if (history.length === 0) return;

  const headers = ['ID', 'Date', 'Arena Type', 'Winner', 'Dataset Size', 'Dataset Type', 'Target Value', 'Path Cost', 'Lane Count'];
  const rows = history.map(e => [
    e.id,
    new Date(e.date).toLocaleString(),
    e.arenaType,
    `"${e.winner}"`,
    e.datasetSize || 0,
    `"${e.datasetType || 'Default'}"`,
    e.targetValue ?? 'N/A',
    e.pathCost ?? 'N/A',
    e.lanes.length
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `algorace_benchmark_history_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importHistoryFromJSON(jsonText: string): boolean {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) return false;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(parsed));
    return true;
  } catch (err) {
    console.error('Failed to import history JSON', err);
    return false;
  }
}
