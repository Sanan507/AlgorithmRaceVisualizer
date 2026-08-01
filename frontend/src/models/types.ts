export type ComplexityInfo = {
  best: string;
  average: string;
  worst: string;
  space: string;
  theory: string;
  pseudocode: string;
};

export type CatalogResponse = {
  sortingAlgorithms: string[];
  searchingAlgorithms: string[];
  pathfindingAlgorithms: string[];
  datasetTypes: string[];
  mazeTypes: string[];
  complexity: Record<string, ComplexityInfo>;
};

export type PointDto = { row: number; col: number };

export type SimulationFrame = {
  frame: number;
  array: number[];
  highlight: number[];
  sortedBoundary: number;
  pivotIndex: number;
  mergeRegionStart: number;
  mergeRegionEnd: number;
  heapBoundary: number;
  comparisons: number;
  swaps: number;
  timeMs: number;
  done: boolean;
  status: string;
  foundIndex: number | null;
  searchPath: number[];
  grid: string[][] | null;
  path: PointDto[];
  steps: number;
  pathFound: boolean;
};

export type LaneStats = {
  comparisons: number;
  swaps: number;
  steps: number;
  timeMs: number;
  found: boolean;
  foundIndex: number | null;
};

export type RaceLaneResponse = {
  name: string;
  complexity: string;
  complexityInfo: ComplexityInfo;
  frames: SimulationFrame[];
  stats: LaneStats;
};

export type RaceResponse = {
  type: 'sorting' | 'searching' | 'pathfinding';
  dataset: number[] | null;
  target: number | null;
  walls: boolean[][] | null;
  lanes: RaceLaneResponse[];
  winner: string | null;
};
