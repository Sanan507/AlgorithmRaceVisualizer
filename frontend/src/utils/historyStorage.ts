export type ArenaType = 'sorting' | 'searching' | 'pathfinding';

export type LaneMetric = {
  name: string;
  comparisons: number;
  swaps?: number;
  steps?: number;
  timeMs: number;
};

export type RaceHistoryEntry = {
  id: string;
  date: string;
  arenaType: ArenaType;
  winner: string;
  datasetSize: number;
  lanes: LaneMetric[];
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
    history.push(entry);
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
