import { useEffect } from 'react';
import type { CatalogResponse, RaceResponse, SimulationFrame } from '../models/types';
import { Trophy, Clock, Zap } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

interface PerformanceComparisonProps {
  response: RaceResponse | null;
  activeFrames: (SimulationFrame | undefined)[] | undefined;
  type: 'sorting' | 'searching' | 'pathfinding';
  isCompleted: boolean;
  catalog: CatalogResponse;
  playing?: boolean;
}

function getWinnerExplanation(winnerName: string, type: 'sorting' | 'searching' | 'pathfinding') {
  if (type === 'searching') {
    if (winnerName.includes('Binary')) {
      return 'Binary Search won because it operates on a sorted array and halves the search space in each step, resulting in a logarithmic time complexity of O(log N) compared to O(N) for a Linear Search.';
    }
    if (winnerName.includes('Jump')) {
      return 'Jump Search won because it skips ahead by fixed steps (O(√N)) to find the range, then performs a local linear scan. This is significantly faster than checking every element sequentially.';
    }
    if (winnerName.includes('Linear')) {
      return 'Linear Search won, which typically happens when the target element is located very close to the start of the array, avoiding any algorithmic overhead.';
    }
  } else if (type === 'pathfinding') {
    if (winnerName.includes('A*')) {
      return 'A* Search won because it uses a heuristic function (estimating distance to target) to prioritize nodes closer to the destination, avoiding exploring unnecessary branches.';
    }
    if (winnerName.includes('BFS') || winnerName.includes('Breadth')) {
      return 'Breadth-First Search (BFS) won. It explores layer-by-layer and guarantees the shortest path, outperforming others if the target is shallow or DFS gets stuck in a deep dead-end.';
    }
    if (winnerName.includes('Dijkstra')) {
      return 'Dijkstra won because it systematically expands nodes with the lowest cumulative cost, ensuring the shortest path is found while adapting to weighted traversals.';
    }
    if (winnerName.includes('DFS') || winnerName.includes('Depth')) {
      return 'Depth-First Search (DFS) won. It dives deep along a branch first, which happened to reach the destination quickly without exploring other directions, despite not guaranteeing the shortest path.';
    }
  } else if (type === 'sorting') {
    if (winnerName.includes('Quick')) {
      return 'Quick Sort won because of its highly optimized, in-place partitioning with O(N log N) average-case complexity, minimizing memory allocations and cache misses.';
    }
    if (winnerName.includes('Merge')) {
      return 'Merge Sort won because of its stable O(N log N) divide-and-conquer strategy, ensuring consistent performance regardless of initial dataset ordering.';
    }
    if (winnerName.includes('Heap')) {
      return 'Heap Sort won because it utilizes a binary heap structure to sort in-place with an O(N log N) guarantee and O(1) auxiliary space.';
    }
    if (winnerName.includes('Bubble') || winnerName.includes('Selection') || winnerName.includes('Insertion')) {
      return `${winnerName} won. This typically happens for very small arrays where simpler O(N²) algorithms can outperform O(N log N) algorithms due to lower constant overhead.`;
    }
  }
  return 'The winning algorithm achieved the goal with the best combination of time complexity, low constant overhead, and targeted search space.';
}

export function PerformanceComparison({
  response,
  activeFrames,
  type,
  isCompleted,
  catalog,
  playing = false
}: PerformanceComparisonProps) {
  useEffect(() => {
    if (isCompleted && response?.winner) {
      triggerConfetti();
    }
  }, [isCompleted, response?.winner]);

  if (!response) {
    return (
      <section className="panel compact">
        <div className="section-title">Performance Comparison</div>
        <p className="no-data-msg">No active simulation. Start a race to compare algorithms.</p>
      </section>
    );
  }

  // Get live data for each lane
  const laneData = response.lanes.map((lane, index) => {
    const frame = activeFrames?.[index] ?? lane.frames[0];
    const complexityInfo = catalog.complexity[lane.name];

    // Metrics depending on type
    const timeMs = frame?.timeMs ?? 0;
    const done = frame?.done ?? false;
    
    let opLabel = 'Operations';
    let opValue = 0;
    let secValue = 0;
    let secLabel = '';

    let nodesVisited = 0;
    let frontierSize = 0;
    if (type === 'pathfinding' && frame?.grid) {
      for (let r = 0; r < frame.grid.length; r++) {
        for (let c = 0; c < frame.grid[r].length; c++) {
          const cellState = frame.grid[r][c];
          if (cellState === 'VISITED' || cellState === 'PATH') {
            nodesVisited++;
          } else if (cellState === 'FRONTIER') {
            frontierSize++;
          }
        }
      }
    }
    const pathLength = (type === 'pathfinding' && frame?.path) ? frame.path.length : 0;

    if (type === 'sorting') {
      opLabel = 'Comparisons';
      opValue = frame?.comparisons ?? 0;
      secLabel = 'Swaps';
      secValue = frame?.swaps ?? 0;
    } else if (type === 'searching') {
      opLabel = 'Comparisons';
      opValue = frame?.comparisons ?? 0;
      secLabel = 'Status';
      secValue = frame?.foundIndex !== null && frame?.foundIndex !== undefined && frame.foundIndex >= 0 ? 1 : 0;
    } else if (type === 'pathfinding') {
      opLabel = 'Steps';
      opValue = frame?.steps ?? 0;
      secLabel = 'Path Found';
      secValue = frame?.pathFound ? 1 : 0;
    }

    return {
      name: lane.name,
      timeMs,
      done,
      opLabel,
      opValue,
      secLabel,
      secValue,
      complexityInfo,
      pathFound: frame?.pathFound ?? false,
      foundIndex: frame?.foundIndex ?? null,
      nodesVisited,
      frontierSize,
      pathLength,
    };
  });

  // Calculate live ranking
  const rankedLanes = [...laneData].sort((a, b) => {
    if (a.done && !b.done) return -1;
    if (!a.done && b.done) return 1;
    if (a.timeMs !== b.timeMs) {
      return a.timeMs - b.timeMs;
    }
    return a.opValue - b.opValue;
  });

  // Calculate efficiency comparisons
  const finishedLanes = laneData.filter(l => l.done);
  let efficiencyText = '';
  
  if (finishedLanes.length >= 2) {
    const sortedFinished = [...finishedLanes].sort((a, b) => a.timeMs - b.timeMs);
    const fastest = sortedFinished[0];
    const slowest = sortedFinished[sortedFinished.length - 1];

    if (fastest.timeMs > 0 && slowest.timeMs > fastest.timeMs) {
      const ratio = (slowest.timeMs / fastest.timeMs).toFixed(1);
      efficiencyText = `${fastest.name} completed the task ${ratio}x faster than ${slowest.name}.`;
    } else if (fastest.opValue > 0 && slowest.opValue > fastest.opValue) {
      const ratio = (slowest.opValue / fastest.opValue).toFixed(1);
      efficiencyText = `${fastest.name} required ${ratio}x fewer ${fastest.opLabel.toLowerCase()} than ${slowest.name}.`;
    } else {
      efficiencyText = `${fastest.name} demonstrated optimal efficiency in this run.`;
    }
  } else if (laneData.length >= 2 && playing) {
    const currentFastest = [...laneData].sort((a, b) => a.timeMs - b.timeMs)[0];
    const currentSlowest = [...laneData].sort((a, b) => b.timeMs - a.timeMs)[0];
    if (currentFastest.timeMs > 0 && currentSlowest.timeMs > currentFastest.timeMs) {
      const ratio = (currentSlowest.timeMs / currentFastest.timeMs).toFixed(1);
      efficiencyText = `Running: ${currentFastest.name} is currently leading, processing ${ratio}x faster than ${currentSlowest.name}.`;
    }
  }

  // Maximum operations for visual bar scale
  const maxOps = Math.max(1, ...laneData.map(l => l.opValue));
  const maxTime = Math.max(1, ...laneData.map(l => l.timeMs));
  const maxNodesVisited = Math.max(1, ...laneData.map(l => l.nodesVisited || 1));
  const maxFrontier = Math.max(1, ...laneData.map(l => l.frontierSize || 1));
  const maxPathLength = Math.max(1, ...laneData.map(l => l.pathLength || 1));

  return (
    <section className="panel compact performance-comparison-panel">
      <div className="section-title">Performance Comparison</div>

      <div className="perf-grid">
        {/* Live Metrics Column */}
        <div className="perf-metrics-section">
          <h4>Live Statistics</h4>
          <div className="live-bars-list">
            {laneData.map((lane) => {
              const opPercent = Math.max(3, (lane.opValue / maxOps) * 100);
              const timePercent = Math.max(3, (lane.timeMs / maxTime) * 100);

              if (type === 'pathfinding') {
                const visitedPercent = Math.max(3, (lane.nodesVisited / maxNodesVisited) * 100);
                const frontierPercent = Math.max(3, (lane.frontierSize / maxFrontier) * 100);
                const pathPercent = Math.max(3, (lane.pathLength / maxPathLength) * 100);
                
                return (
                  <div className="lane-perf-row" key={lane.name}>
                    <div className="lane-perf-meta">
                      <span className="lane-perf-name">{lane.name}</span>
                      <span className="lane-perf-time">
                        <Clock size={12} /> {lane.timeMs} ms
                      </span>
                    </div>

                    <div className="pathfinding-metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                      <div className="perf-bar-container">
                        <span className="perf-bar-label">Nodes Visited: {lane.nodesVisited}</span>
                        <div className="chart-track">
                          <div 
                            className="chart-fill op-fill" 
                            style={{ width: `${visitedPercent}%` }} 
                          />
                        </div>
                      </div>

                      <div className="perf-bar-container">
                        <span className="perf-bar-label">Frontier Size: {lane.frontierSize}</span>
                        <div className="chart-track">
                          <div 
                            className="chart-fill frontier-fill" 
                            style={{ 
                              width: `${frontierPercent}%`,
                              background: 'linear-gradient(90deg, #c084fc, #818cf8)'
                            }} 
                          />
                        </div>
                      </div>

                      <div className="perf-bar-container">
                        <span className="perf-bar-label">Path Length: {lane.pathLength || (lane.done ? 'No path' : '0')}</span>
                        <div className="chart-track">
                          <div 
                            className="chart-fill path-fill" 
                            style={{ 
                              width: `${pathPercent}%`,
                              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                            }} 
                          />
                        </div>
                      </div>

                      <div className="perf-bar-container">
                        <span className="perf-bar-label">Execution Time</span>
                        <div className="chart-track">
                          <div 
                            className="chart-fill time-fill" 
                            style={{ 
                              width: `${timePercent}%`,
                              background: 'linear-gradient(90deg, #f472b6, #db2777)'
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (type === 'searching') {
                const isReady = lane.timeMs === 0 && lane.opValue === 0 && !isCompleted;
                const searchStatusText = lane.foundIndex !== null && lane.foundIndex >= 0 
                  ? `Target found at index ${lane.foundIndex}` 
                  : (lane.done 
                      ? 'Target not found' 
                      : (isReady 
                          ? 'Ready' 
                          : (playing ? 'Searching...' : 'Paused')));
                const searchStatusColor = lane.foundIndex !== null && lane.foundIndex >= 0 
                  ? '#10b981' 
                  : (lane.done ? '#ef4444' : (isReady ? '#a855f7' : (playing ? '#fbbf24' : '#60a5fa')));

                return (
                  <div className="lane-perf-row" key={lane.name}>
                    <div className="lane-perf-meta">
                      <span className="lane-perf-name">{lane.name}</span>
                      <span className="lane-perf-time">
                        <Clock size={12} /> {lane.timeMs} ms
                      </span>
                    </div>

                    <div className="searching-metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                      <div className="perf-bar-container">
                        <span className="perf-bar-label">Comparisons: {lane.opValue}</span>
                        <div className="chart-track">
                          <div 
                            className="chart-fill op-fill" 
                            style={{ width: `${opPercent}%` }} 
                          />
                        </div>
                      </div>

                      <div className="perf-bar-container">
                        <span className="perf-bar-label">Execution Time</span>
                        <div className="chart-track">
                          <div 
                            className="chart-fill time-fill" 
                            style={{ 
                              width: `${timePercent}%`,
                              background: 'linear-gradient(90deg, #8b5cf6, #d946ef)'
                            }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                      Status:{' '}
                      <strong style={{ color: searchStatusColor }}>
                        {searchStatusText}
                      </strong>
                    </div>
                  </div>
                );
              }

              return (
                <div className="lane-perf-row" key={lane.name}>
                  <div className="lane-perf-meta">
                    <span className="lane-perf-name">{lane.name}</span>
                    <span className="lane-perf-time">
                      <Clock size={12} /> {lane.timeMs} ms
                    </span>
                  </div>
                  
                  <div className="perf-bar-container">
                    <span className="perf-bar-label">{lane.opLabel}: {lane.opValue.toLocaleString()}</span>
                    <div className="chart-track">
                      <div 
                        className="chart-fill op-fill" 
                        style={{ width: `${opPercent}%` }} 
                      />
                    </div>
                  </div>

                  <div className="perf-bar-container">
                    <span className="perf-bar-label">{lane.secLabel}: {lane.secValue.toLocaleString()}</span>
                    <div className="chart-track">
                      <div 
                        className="chart-fill swaps-fill" 
                        style={{ 
                          width: `${Math.max(3, (lane.secValue / Math.max(1, ...laneData.map(l => l.secValue))) * 100)}%`,
                          background: 'linear-gradient(90deg, #3b82f6, #06b6d4)'
                        }} 
                      />
                    </div>
                  </div>

                  <div className="perf-bar-container">
                    <span className="perf-bar-label">Execution Time</span>
                    <div className="chart-track">
                      <div 
                        className="chart-fill time-fill" 
                        style={{ 
                          width: `${timePercent}%`,
                          background: 'linear-gradient(90deg, #8b5cf6, #d946ef)'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard & Winner Card Column */}
        <div className="perf-leaderboard-section">
          <h4>Leaderboard Ranking</h4>
          <div className="ranking-list">
            {rankedLanes.map((lane, idx) => {
              const isReady = lane.timeMs === 0 && lane.opValue === 0 && !isCompleted;
              const statusText = lane.done || isCompleted
                ? 'Finished'
                : (isReady
                    ? 'Ready'
                    : (playing ? 'Running...' : 'Paused'));

              return (
                <div 
                  className={`ranking-item ${idx === 0 && lane.done ? 'gold-rank' : ''} ${lane.done ? 'completed-rank' : ''}`} 
                  key={lane.name}
                >
                  <div className="rank-badge">{idx + 1}</div>
                  <div className="rank-details">
                    <span className="rank-name">{lane.name}</span>
                    <span className="rank-status">
                      {statusText}
                    </span>
                  </div>
                  <div className="rank-score">
                    {lane.timeMs} ms
                  </div>
                </div>
              );
            })}
          </div>

          {/* Winner announcement / Efficiency insight card */}
          {(isCompleted && response.winner) ? (
            <div className="winner-highlight-card">
              <div className="winner-header">
                <Trophy size={20} className="trophy-icon" />
                <span>Winner Declared!</span>
              </div>
              <div className="winner-body">
                <strong>{response.winner}</strong>
                <p className="efficiency-note">
                  {efficiencyText}
                </p>
                <p className="explanation-note" style={{ marginTop: '8px', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
                  {getWinnerExplanation(response.winner, type)}
                </p>
              </div>
            </div>
          ) : efficiencyText ? (
            <div className="live-insight-card">
              <div className="insight-header">
                <Zap size={16} className="insight-icon" />
                <span>Live Efficiency Insight</span>
              </div>
              <p className="insight-body">{efficiencyText}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Complexity Comparison Table */}
      <div className="complexity-comparison-table-section">
        <h4>Complexity Specifications</h4>
        <div className="complexity-table-wrapper">
          <table className="complexity-comparison-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Time (Best)</th>
                <th>Time (Average)</th>
                <th>Time (Worst)</th>
                <th>Space Complexity</th>
              </tr>
            </thead>
            <tbody>
              {laneData.map((lane) => (
                <tr key={lane.name}>
                  <td><strong>{lane.name}</strong></td>
                  <td><code className="complexity-code best-code">{lane.complexityInfo?.best || 'O(1)'}</code></td>
                  <td><code className="complexity-code avg-code">{lane.complexityInfo?.average || '-'}</code></td>
                  <td><code className="complexity-code worst-code">{lane.complexityInfo?.worst || '-'}</code></td>
                  <td><code className="complexity-code space-code">{lane.complexityInfo?.space || '-'}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
