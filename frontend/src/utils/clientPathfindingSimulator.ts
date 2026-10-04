import type { CellState, ComplexityInfo, LaneStats, RaceLaneResponse, RaceResponse, SimulationFrame } from '../models/types';

interface PathfindingParams {
  algorithms: string[];
  rows: number;
  cols: number;
  mazeType?: string;
  walls?: boolean[][] | null;
  weights?: number[][] | null;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

const DIRS = [
  [-1, 0], // Up
  [1, 0],  // Down
  [0, -1], // Left
  [0, 1],  // Right
];

const DEFAULT_COMPLEXITY: Record<string, ComplexityInfo> = {
  BFS: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    theory: 'Breadth-First Search explores outward in uniform waves, guaranteeing the shortest route on unweighted graphs.',
    pseudocode: 'queue.push(start)\nwhile queue:\n  u = queue.pop()\n  if u == end: return path\n  for v in neighbors(u):\n    if unvisited(v):\n      visit(v)\n      queue.push(v)',
  },
  DFS: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    theory: 'Depth-First Search dives deeply into each branch before backtracking; does not guarantee the shortest path.',
    pseudocode: 'stack.push(start)\nwhile stack:\n  u = stack.pop()\n  if u == end: return path\n  for v in neighbors(u):\n    if unvisited(v):\n      visit(v)\n      stack.push(v)',
  },
  Dijkstra: {
    best: 'O(E + V log V)',
    average: 'O(E + V log V)',
    worst: 'O(E + V log V)',
    space: 'O(V)',
    theory: 'Dijkstra explores paths in order of cumulative edge and terrain weights, guaranteeing minimum total cost.',
    pseudocode: 'pq.push((0, start))\nwhile pq:\n  cost, u = pq.pop()\n  if u == end: return path\n  for v, w in neighbors(u):\n    if dist[u] + w < dist[v]:\n      dist[v] = dist[u] + w\n      pq.push((dist[v], v))',
  },
  'A* Search': {
    best: 'O(E)',
    average: 'O(E + V log V)',
    worst: 'O(V²)',
    space: 'O(V)',
    theory: 'A* combines Dijkstra cost with an admissible heuristic h(n) (Manhattan distance) to guide the search towards the goal.',
    pseudocode: 'pq.push((h(start), 0, start))\nwhile pq:\n  f, g, u = pq.pop()\n  if u == end: return path\n  for v, w in neighbors(u):\n    if g + w < gCost[v]:\n      gCost[v] = g + w\n      pq.push((gCost[v] + h(v), gCost[v], v))',
  },
  'Greedy Best-First': {
    best: 'O(1)',
    average: 'O(V log V)',
    worst: 'O(V²)',
    space: 'O(V)',
    theory: 'Greedy Best-First expands nodes solely based on heuristic proximity to the target, prioritizing speed over optimality.',
    pseudocode: 'pq.push((h(start), start))\nwhile pq:\n  h, u = pq.pop()\n  if u == end: return path\n  for v in neighbors(u):\n    if unvisited(v):\n      visit(v)\n      pq.push((h(v), v))',
  },
  'Bidirectional BFS': {
    best: 'O(1)',
    average: 'O(b^(d/2))',
    worst: 'O(V + E)',
    space: 'O(V)',
    theory: 'Bidirectional BFS searches simultaneously from start and goal until the two expanding frontiers meet.',
    pseudocode: 'qStart.push(start); qEnd.push(end)\nwhile qStart and qEnd:\n  expand(qStart)\n  if intersect(qStart, qEnd): return joinPaths()\n  expand(qEnd)\n  if intersect(qStart, qEnd): return joinPaths()',
  },
  'Bellman-Ford': {
    best: 'O(V * E)',
    average: 'O(V * E)',
    worst: 'O(V * E)',
    space: 'O(V)',
    theory: 'Bellman-Ford repeatedly relaxes all edges across the graph, supporting weighted terrains with guaranteed convergence.',
    pseudocode: 'for i = 1 to V - 1:\n  for each edge (u, v, w):\n    if dist[u] + w < dist[v]:\n      dist[v] = dist[u] + w',
  },
};

export function simulateClientPathfinding(params: PathfindingParams): RaceResponse {
  const {
    algorithms,
    rows = 18,
    cols = 28,
    walls: inputWalls,
    weights: inputWeights,
    startRow = 2,
    startCol = 2,
    endRow = 15,
    endCol = 25,
  } = params;

  // Initialize sanitised walls & weights
  const walls: boolean[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => !!(inputWalls && inputWalls[r] && inputWalls[r][c]))
  );

  const weights: number[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      inputWeights && inputWeights[r] && inputWeights[r][c] ? Math.max(1, inputWeights[r][c]) : 1
    )
  );

  // Ensure endpoints are never walls
  walls[startRow][startCol] = false;
  walls[endRow][endCol] = false;

  const lanes: RaceLaneResponse[] = algorithms.map((algoName) => {
    return simulateSingleLane(algoName, rows, cols, startRow, startCol, endRow, endCol, walls, weights);
  });

  // Determine winner: fastest algorithm that found a path, or lowest steps
  let winner = '';
  let minTime = Infinity;
  lanes.forEach((lane) => {
    if (lane.stats.pathFound && lane.stats.timeMs < minTime) {
      minTime = lane.stats.timeMs;
      winner = lane.name;
    }
  });

  if (!winner && lanes.length > 0) {
    winner = lanes[0].name;
  }

  return {
    type: 'pathfinding',
    walls,
    weights,
    lanes,
    winner,
  };
}

function simulateSingleLane(
  algo: string,
  rows: number,
  cols: number,
  sR: number,
  sC: number,
  eR: number,
  eC: number,
  walls: boolean[][],
  weights: number[][]
): RaceLaneResponse {
  const complexityInfo = DEFAULT_COMPLEXITY[algo] || DEFAULT_COMPLEXITY.BFS;
  const complexity = complexityInfo.average;

  // Initial grid state
  const gridState: CellState[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (r === sR && c === sC) return 'START';
      if (r === eR && c === eC) return 'END';
      return walls[r][c] ? 'WALL' : 'EMPTY';
    })
  );

  const frames: SimulationFrame[] = [];
  const maxFrames = 1000;
  const frameMs = 15;

  // Push initial frame
  frames.push({
    frame: 0,
    array: [],
    highlight: [],
    sortedBoundary: -1,
    pivotIndex: -1,
    mergeRegionStart: -1,
    mergeRegionEnd: -1,
    heapBoundary: -1,
    comparisons: 0,
    swaps: 0,
    timeMs: 0,
    done: false,
    status: 'Ready to race',
    foundIndex: null,
    searchPath: [],
    grid: copyGrid(gridState),
    path: [],
    steps: 0,
    pathFound: false,
  });

  const parentMap = new Map<string, [number, number]>();
  const key = (r: number, c: number) => `${r},${c}`;

  const manhattan = (r: number, c: number) => Math.abs(r - eR) + Math.abs(c - eC);

  const inBounds = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols && !walls[r][c];

  let pathFound = false;
  let steps = 0;
  let done = false;
  let finalPath: { row: number; col: number }[] = [];

  if (algo === 'DFS') {
    // Depth-First Search
    const stack: [number, number][] = [[sR, sC]];
    const visited = new Set<string>([key(sR, sC)]);

    while (stack.length > 0 && !done && frames.length < maxFrames) {
      const [cr, cc] = stack.pop()!;
      steps++;

      if (cr !== sR || cc !== sC) {
        gridState[cr][cc] = 'VISITED';
      }

      if (cr === eR && cc === eC) {
        pathFound = true;
        done = true;
        break;
      }

      for (const [dr, dc] of DIRS) {
        const nr = cr + dr;
        const nc = cc + dc;
        const nk = key(nr, nc);
        if (inBounds(nr, nc) && !visited.has(nk)) {
          visited.add(nk);
          parentMap.set(nk, [cr, cc]);
          if (nr !== eR || nc !== eC) {
            gridState[nr][nc] = 'FRONTIER';
          }
          stack.push([nr, nc]);
        }
      }

      frames.push({
        frame: frames.length,
        array: [],
        highlight: [],
        sortedBoundary: -1,
        pivotIndex: -1,
        mergeRegionStart: -1,
        mergeRegionEnd: -1,
        heapBoundary: -1,
        comparisons: 0,
        swaps: 0,
        timeMs: frames.length * frameMs,
        done: false,
        status: `Exploring cell (${cr}, ${cc})`,
        foundIndex: null,
        searchPath: [],
        grid: copyGrid(gridState),
        path: [],
        steps,
        pathFound: false,
      });
    }
  } else if (algo === 'Bidirectional BFS') {
    // Bidirectional BFS
    const qForward: [number, number][] = [[sR, sC]];
    const qBackward: [number, number][] = [[eR, eC]];
    const visitedForward = new Map<string, [number, number]>();
    const visitedBackward = new Map<string, [number, number]>();
    visitedForward.set(key(sR, sC), [-1, -1]);
    visitedBackward.set(key(eR, eC), [-1, -1]);

    let meetingPoint: [number, number] | null = null;

    while (qForward.length > 0 && qBackward.length > 0 && !done && frames.length < maxFrames) {
      // Step Forward
      if (qForward.length > 0) {
        const [cr, cc] = qForward.shift()!;
        steps++;
        if (cr !== sR || cc !== sC) gridState[cr][cc] = 'VISITED_FORWARD';

        if (visitedBackward.has(key(cr, cc))) {
          meetingPoint = [cr, cc];
          pathFound = true;
          done = true;
          break;
        }

        for (const [dr, dc] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          const nk = key(nr, nc);
          if (inBounds(nr, nc) && !visitedForward.has(nk)) {
            visitedForward.set(nk, [cr, cc]);
            if (visitedBackward.has(nk)) {
              meetingPoint = [nr, nc];
              pathFound = true;
              done = true;
              break;
            }
            if ((nr !== sR || nc !== sC) && (nr !== eR || nc !== eC)) gridState[nr][nc] = 'FRONTIER_FORWARD';
            qForward.push([nr, nc]);
          }
        }
      }

      if (done) break;

      // Step Backward
      if (qBackward.length > 0) {
        const [cr, cc] = qBackward.shift()!;
        steps++;
        if (cr !== eR || cc !== eC) gridState[cr][cc] = 'VISITED_BACKWARD';

        if (visitedForward.has(key(cr, cc))) {
          meetingPoint = [cr, cc];
          pathFound = true;
          done = true;
          break;
        }

        for (const [dr, dc] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          const nk = key(nr, nc);
          if (inBounds(nr, nc) && !visitedBackward.has(nk)) {
            visitedBackward.set(nk, [cr, cc]);
            if (visitedForward.has(nk)) {
              meetingPoint = [nr, nc];
              pathFound = true;
              done = true;
              break;
            }
            if ((nr !== sR || nc !== sC) && (nr !== eR || nc !== eC)) gridState[nr][nc] = 'FRONTIER_BACKWARD';
            qBackward.push([nr, nc]);
          }
        }
      }

      frames.push({
        frame: frames.length,
        array: [],
        highlight: [],
        sortedBoundary: -1,
        pivotIndex: -1,
        mergeRegionStart: -1,
        mergeRegionEnd: -1,
        heapBoundary: -1,
        comparisons: 0,
        swaps: 0,
        timeMs: frames.length * frameMs,
        done: false,
        status: `Bidirectional frontiers expanding`,
        foundIndex: null,
        searchPath: [],
        grid: copyGrid(gridState),
        path: [],
        steps,
        pathFound: false,
      });
    }

    if (meetingPoint) {
      // Reconstruct bidirectional path
      const forwardHalf: { row: number; col: number }[] = [];
      let curr: [number, number] | undefined = meetingPoint;
      while (curr && (curr[0] !== -1 || curr[1] !== -1)) {
        forwardHalf.unshift({ row: curr[0], col: curr[1] });
        const p = visitedForward.get(key(curr[0], curr[1]));
        curr = p && p[0] !== -1 ? p : undefined;
      }
      const backwardHalf: { row: number; col: number }[] = [];
      let bCurr = visitedBackward.get(key(meetingPoint[0], meetingPoint[1]));
      while (bCurr && (bCurr[0] !== -1 || bCurr[1] !== -1)) {
        backwardHalf.push({ row: bCurr[0], col: bCurr[1] });
        const p = visitedBackward.get(key(bCurr[0], bCurr[1]));
        bCurr = p && p[0] !== -1 ? p : undefined;
      }
      finalPath = [...forwardHalf, ...backwardHalf];
    }
  } else {
    // Best-First / Dijkstra / A* / BFS
    interface Node {
      r: number;
      c: number;
      g: number;
      f: number;
    }

    const dist = new Map<string, number>();
    const openSet: Node[] = [{ r: sR, c: sC, g: 0, f: manhattan(sR, sC) }];
    dist.set(key(sR, sC), 0);

    while (openSet.length > 0 && !done && frames.length < maxFrames) {
      // Sort openSet by f-cost (or g-cost for Dijkstra, or FIFO for BFS)
      if (algo === 'BFS') {
        // Strict queue FIFO
      } else if (algo === 'Dijkstra') {
        openSet.sort((a, b) => a.g - b.g);
      } else if (algo === 'Greedy Best-First') {
        openSet.sort((a, b) => manhattan(a.r, a.c) - manhattan(b.r, b.c));
      } else {
        // A* Search & Bellman-Ford
        openSet.sort((a, b) => a.f - b.f || a.g - b.g);
      }

      const current = openSet.shift()!;
      const { r: cr, c: cc, g: cg } = current;
      steps++;

      if (cr !== sR || cc !== sC) {
        gridState[cr][cc] = 'VISITED';
      }

      if (cr === eR && cc === eC) {
        pathFound = true;
        done = true;
        break;
      }

      for (const [dr, dc] of DIRS) {
        const nr = cr + dr;
        const nc = cc + dc;
        const nk = key(nr, nc);
        if (!inBounds(nr, nc)) continue;

        const cellWeight = weights[nr][nc] || 1;
        const ng = cg + (algo === 'BFS' ? 1 : cellWeight);

        if (!dist.has(nk) || ng < dist.get(nk)!) {
          dist.set(nk, ng);
          parentMap.set(nk, [cr, cc]);
          const h = manhattan(nr, nc);
          const f = algo === 'Dijkstra' ? ng : algo === 'BFS' ? 0 : ng + h;

          if (nr !== eR || nc !== eC) {
            gridState[nr][nc] = 'FRONTIER';
          }
          openSet.push({ r: nr, c: nc, g: ng, f });
        }
      }

      frames.push({
        frame: frames.length,
        array: [],
        highlight: [],
        sortedBoundary: -1,
        pivotIndex: -1,
        mergeRegionStart: -1,
        mergeRegionEnd: -1,
        heapBoundary: -1,
        comparisons: 0,
        swaps: 0,
        timeMs: frames.length * frameMs,
        done: false,
        status: `Evaluating (${cr}, ${cc}) • Distance: ${cg}`,
        foundIndex: null,
        searchPath: [],
        grid: copyGrid(gridState),
        path: [],
        steps,
        pathFound: false,
      });
    }
  }

  // If path found through parentMap and not bidirectional
  if (pathFound && finalPath.length === 0) {
    let curr: [number, number] | undefined = [eR, eC];
    while (curr) {
      finalPath.unshift({ row: curr[0], col: curr[1] });
      curr = parentMap.get(key(curr[0], curr[1]));
    }
  }

  // Paint the shortest path on the final frame
  if (pathFound && finalPath.length > 0) {
    finalPath.forEach((pt) => {
      if ((pt.row !== sR || pt.col !== sC) && (pt.row !== eR || pt.col !== eC)) {
        gridState[pt.row][pt.col] = 'PATH';
      }
    });
  }

  // Final completion frame
  frames.push({
    frame: frames.length,
    array: [],
    highlight: [],
    sortedBoundary: -1,
    pivotIndex: -1,
    mergeRegionStart: -1,
    mergeRegionEnd: -1,
    heapBoundary: -1,
    comparisons: 0,
    swaps: 0,
    timeMs: frames.length * frameMs,
    done: true,
    status: pathFound ? `Shortest path discovered (${finalPath.length} nodes)` : 'Target unreachable (no valid path)',
    foundIndex: pathFound ? finalPath.length : null,
    searchPath: [],
    grid: copyGrid(gridState),
    path: finalPath,
    steps,
    pathFound,
  });

  const stats: LaneStats = {
    comparisons: 0,
    swaps: 0,
    steps,
    timeMs: frames.length * frameMs,
    pathFound,
    foundIndex: pathFound ? finalPath.length : null,
  };

  return {
    name: algo,
    complexity,
    complexityInfo,
    frames,
    stats,
  };
}

function copyGrid(grid: CellState[][]): CellState[][] {
  return grid.map((row) => [...row]);
}
