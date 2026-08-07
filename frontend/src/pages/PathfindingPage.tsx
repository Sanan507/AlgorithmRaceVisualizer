import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LaneState } from '../components/LaneCard';
import { Controls } from '../components/Controls';
import { AlgorithmComparisonCenter } from '../components/AlgorithmComparisonCenter';
import { LaneCard } from '../components/LaneCard';
import { PathCanvas } from '../components/PathCanvas';
import { SelectField } from '../components/SelectField';
import { PerformanceComparison } from '../components/PerformanceComparison';
import { VisualizationLegend } from '../components/VisualizationLegend';
import { useAudio } from '../context/AudioContext';
import { usePlayback } from '../hooks/usePlayback';
import type { CatalogResponse, RaceResponse, SimulationFrame } from '../models/types';
import { api } from '../services/api';
import { StepExplanationCard } from '../components/StepExplanationCard';
import { Share2, RefreshCw, Sparkles, Palette } from 'lucide-react';
import { getUrlParams } from '../utils/urlParams';
import { generateClientMaze } from '../utils/clientMazeGenerator';
import { appendHistory } from '../utils/historyStorage';

const defaultMazeTypes = [
  'Recursive Backtracker',
  'Random Walls',
  'Spiral',
  'Rooms',
  'Binary Tree',
  "Prim's Algorithm",
  'Recursive Division',
  'Cellular Automata',
  'Weighted Terrain Map'
];

export function PathfindingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['BFS', 'Dijkstra', 'A* Search', 'DFS']);
  const [mazeType, setMazeType] = useState('Recursive Backtracker');
  const [walls, setWalls] = useState<boolean[][] | null>(null);
  const [weights, setWeights] = useState<number[][] | null>(null);
  const [drawMode, setDrawMode] = useState<'WALL' | 'START' | 'TARGET' | 'WEIGHT'>('WALL');
  const [selectedWeight, setSelectedWeight] = useState<number>(3); // Default Mud (3x)
  const [startNode, setStartNode] = useState<[number, number]>([2, 2]);
  const [endNode, setEndNode] = useState<[number, number]>([15, 25]);
  const [hasFreshDataset, setHasFreshDataset] = useState(true);
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [speed, setSpeed] = useState(6);
  const [loading, setLoading] = useState(false);

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);
  const hasStartedPlaybackRef = useRef(false);
  const initialized = useRef(false);
  const latestFetchIdRef = useRef(0);
  const currentWallsRef = useRef<boolean[][] | null>(null);
  const currentWeightsRef = useRef<number[][] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableMazeTypes = useMemo(() => {
    if (catalog?.mazeTypes && catalog.mazeTypes.length >= 8) {
      return catalog.mazeTypes;
    }
    return defaultMazeTypes;
  }, [catalog]);

  const onFrame = useCallback((event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
    // Audio is now handled centrally in usePlayback hook
  }, []);

  const playback = usePlayback(response, speed, onFrame);

  const fetchSimulation = useCallback(
    async (
      newMaze: boolean,
      autoplay = false,
      customParams?: {
        algos?: string[];
        mType?: string;
        walls?: boolean[][];
        weights?: number[][];
        start?: [number, number];
        end?: [number, number];
      }
    ) => {
      const fetchId = ++latestFetchIdRef.current;
      setLoading(true);
      winnerAnnouncedRef.current = false;
      if (autoplay) {
        hasStartedPlaybackRef.current = true;
      } else {
        hasStartedPlaybackRef.current = false;
      }
      const useAlgos = customParams?.algos ?? algorithms;
      const useMazeType = customParams?.mType ?? mazeType;
      const useStart = customParams?.start ?? startNode;
      const useEnd = customParams?.end ?? endNode;

      let sendWalls = customParams?.walls ?? (!newMaze ? (walls ?? currentWallsRef.current) : null);
      let sendWeights = customParams?.weights ?? (!newMaze ? (weights ?? currentWeightsRef.current) : null);

      if (newMaze && !customParams?.walls && !customParams?.weights) {
        const generated = generateClientMaze(useMazeType, 18, 28, useStart, useEnd);
        sendWalls = generated.walls;
        sendWeights = generated.weights;
      }

      currentWallsRef.current = sendWalls;
      currentWeightsRef.current = sendWeights;
      if (sendWalls) setWalls(sendWalls);
      if (sendWeights) setWeights(sendWeights);

      const wasCompletedOrAdvanced = playback.frameIndex > 0;

      try {
        const data = await api.pathfinding({
          algorithms: useAlgos,
          rows: 18,
          cols: 28,
          mazeType: useMazeType,
          walls: sendWalls,
          weights: sendWeights,
          startRow: useStart[0],
          startCol: useStart[1],
          endRow: useEnd[0],
          endCol: useEnd[1]
        });

        if (fetchId !== latestFetchIdRef.current) return;

        setResponse(data);
        const resolvedWalls = data.walls ?? sendWalls ?? Array.from({ length: 18 }, () => Array(28).fill(false));
        const resolvedWeights = data.weights ?? sendWeights ?? Array.from({ length: 18 }, () => Array(28).fill(1));
        setWalls(resolvedWalls);
        setWeights(resolvedWeights);
        currentWallsRef.current = resolvedWalls;
        currentWeightsRef.current = resolvedWeights;

        setHasFreshDataset(true);
        playback.reset();
        if (autoplay) {
          play('start');
          playback.setPlaying(true);
          setHasFreshDataset(false);
        } else if (wasCompletedOrAdvanced) {
          setTimeout(() => {
            if (data.lanes && data.lanes[0]?.frames) {
              const maxF = Math.max(...data.lanes.map((l) => l.frames.length)) - 1;
              playback.seek(Math.max(0, maxF));
            }
          }, 10);
        }
      } finally {
        if (fetchId === latestFetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [algorithms, mazeType, walls, weights, startNode, endNode, play, playback]
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const params = getUrlParams();
      if (params && params.page === 'pathfinding') {
        const urlAlgos = params.algos;
        const urlMaze = params.maze;
        const urlWallsStr = params.walls;
        const urlWeightsStr = params.weights;

        let newAlgos = [...algorithms];
        let newMaze = mazeType;
        let parsedWallsGrid: boolean[][] | undefined = undefined;
        let parsedWeightsGrid: number[][] | undefined = undefined;

        if (urlAlgos) {
          newAlgos = [
            urlAlgos[0] || algorithms[0],
            urlAlgos[1] || algorithms[1],
            urlAlgos[2] || algorithms[2],
            urlAlgos[3] || algorithms[3],
          ].filter(Boolean);
          setAlgorithms(newAlgos);
        }
        if (urlMaze) {
          newMaze = urlMaze;
          setMazeType(urlMaze);
        }
        if (urlWallsStr) {
          const grid = Array.from({ length: 18 }, () => Array(28).fill(false));
          urlWallsStr.split(',').forEach((coord) => {
            const [rStr, cStr] = coord.split(':');
            const r = parseInt(rStr, 10);
            const c = parseInt(cStr, 10);
            if (!isNaN(r) && !isNaN(c) && r >= 0 && r < 18 && c >= 0 && c < 28) {
              grid[r][c] = true;
            }
          });
          parsedWallsGrid = grid;
          setWalls(grid);
        }
        if (urlWeightsStr) {
          const wGrid = Array.from({ length: 18 }, () => Array(28).fill(1));
          urlWeightsStr.split(',').forEach((token) => {
            const [rStr, cStr, wStr] = token.split(':');
            const r = parseInt(rStr, 10);
            const c = parseInt(cStr, 10);
            const w = parseInt(wStr, 10);
            if (!isNaN(r) && !isNaN(c) && !isNaN(w) && r >= 0 && r < 18 && c >= 0 && c < 28) {
              wGrid[r][c] = w;
            }
          });
          parsedWeightsGrid = wGrid;
          setWeights(wGrid);
        }

        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState(null, '', url.href);

        fetchSimulation(true, false, { algos: newAlgos, mType: newMaze, walls: parsedWallsGrid, weights: parsedWeightsGrid });
      } else {
        fetchSimulation(true, false);
      }
    }
  }, []);

  function handleShareRun() {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'pathfinding');
    url.searchParams.set('algos', algorithms.join(','));
    url.searchParams.set('maze', mazeType);

    if (walls) {
      const wallCoords: string[] = [];
      walls.forEach((rowArr, r) => {
        rowArr.forEach((isWall, c) => {
          if (isWall) wallCoords.push(`${r}:${c}`);
        });
      });
      if (wallCoords.length > 0) {
        url.searchParams.set('walls', wallCoords.join(','));
      }
    }

    if (weights) {
      const weightTokens: string[] = [];
      weights.forEach((rowArr, r) => {
        rowArr.forEach((w, c) => {
          if (w > 1) weightTokens.push(`${r}:${c}:${w}`);
        });
      });
      if (weightTokens.length > 0) {
        url.searchParams.set('weights', weightTokens.join(','));
      }
    }

    navigator.clipboard.writeText(url.href)
      .then(() => {
        setToastMessage('Link copied to clipboard!');
        setTimeout(() => setToastMessage(null), 3000);
      })
      .catch((err) => console.error('Failed to copy link', err));
  }

  async function startRace() {
    if (hasFreshDataset && response) {
      winnerAnnouncedRef.current = false;
      hasStartedPlaybackRef.current = true;
      play('start');
      playback.reset();
      playback.setPlaying(true);
      setHasFreshDataset(false);
    } else {
      hasStartedPlaybackRef.current = true;
      await fetchSimulation(true, true);
      setHasFreshDataset(false);
    }
  }

  async function handleReset() {
    await fetchSimulation(true, false);
    setHasFreshDataset(true);
  }

  function handleAlgorithmChange(index: number, nextAlgo: string) {
    const nextAlgos = algorithms.map((item, i) => (i === index ? nextAlgo : item));
    setAlgorithms(nextAlgos);
    fetchSimulation(false, false, { algos: nextAlgos });
  }

  function handleMazeTypeChange(nextMazeType: string) {
    setMazeType(nextMazeType);
    fetchSimulation(true, false, { mType: nextMazeType });
  }

  function handleGridClick(r: number, c: number) {
    if (playback.playing) return;
    if (drawMode === 'WALL') {
      const currentGrid = walls ?? currentWallsRef.current ?? Array.from({ length: 18 }, () => Array(28).fill(false));
      const nextGrid = currentGrid.map((rowArr, rowIdx) =>
        rowArr.map((cell, colIdx) => (rowIdx === r && colIdx === c ? !cell : cell))
      );
      currentWallsRef.current = nextGrid;
      setWalls(nextGrid);
      fetchSimulation(false, false, { walls: nextGrid });
    } else if (drawMode === 'START') {
      setStartNode([r, c]);
      fetchSimulation(false, false, { start: [r, c] });
    } else if (drawMode === 'TARGET') {
      setEndNode([r, c]);
      fetchSimulation(false, false, { end: [r, c] });
    } else if (drawMode === 'WEIGHT') {
      const currentWeights = weights ?? currentWeightsRef.current ?? Array.from({ length: 18 }, () => Array(28).fill(1));
      const nextWeights = currentWeights.map((rowArr, rowIdx) =>
        rowArr.map((val, colIdx) => {
          if (rowIdx === r && colIdx === c) {
            return val === selectedWeight ? 1 : selectedWeight;
          }
          return val;
        })
      );
      currentWeightsRef.current = nextWeights;
      setWeights(nextWeights);
      fetchSimulation(false, false, { weights: nextWeights });
    }
  }

  const activeFrames = useMemo(
    () =>
      response?.lanes.map((lane) => {
        if (!lane.frames || lane.frames.length === 0) return undefined;
        const safeIdx = Math.max(0, Math.min(playback.frameIndex, lane.frames.length - 1));
        return lane.frames[safeIdx];
      }),
    [response, playback.frameIndex]
  );

  const activeFramesMap = useMemo(() => {
    if (!response?.lanes || !activeFrames) return {};
    const map: Record<string, SimulationFrame | null> = {};
    response.lanes.forEach((lane, i) => {
      map[lane.name] = activeFrames[i] ?? null;
    });
    return map;
  }, [response, activeFrames]);

  const prevFramesMap = useMemo(() => {
    if (!response?.lanes || playback.frameIndex <= 0) return {};
    const map: Record<string, SimulationFrame | null> = {};
    response.lanes.forEach((lane) => {
      map[lane.name] = lane.frames[playback.frameIndex - 1] ?? null;
    });
    return map;
  }, [response, playback.frameIndex]);

  const isCompleted = !!(response && playback.frameIndex === playback.maxFrames - 1 && playback.maxFrames > 0);
  const winnerLane = response?.lanes.find((l) => l.name === response.winner);

  const winnerPathCost = useMemo(() => {
    if (!winnerLane?.frames) return 0;
    const finalFrame = winnerLane.frames[winnerLane.frames.length - 1];
    if (!finalFrame?.path) return 0;
    if (!response?.weights) return finalFrame.path.length;
    return finalFrame.path.reduce((sum, pt) => sum + (response.weights?.[pt.row]?.[pt.col] ?? 1), 0);
  }, [winnerLane, response]);

  useEffect(() => {
    if (isCompleted && response && hasStartedPlaybackRef.current && !winnerAnnouncedRef.current) {
      winnerAnnouncedRef.current = true;
      hasStartedPlaybackRef.current = false;

      let wallCoordsStr = '';
      if (response.walls) {
        const wallCoords: string[] = [];
        response.walls.forEach((rowArr, r) => {
          rowArr.forEach((isWall, c) => {
            if (isWall) wallCoords.push(`${r}:${c}`);
          });
        });
        wallCoordsStr = wallCoords.join(',');
      }

      let weightTokensStr = '';
      if (response.weights) {
        const weightTokens: string[] = [];
        response.weights.forEach((rowArr, r) => {
          rowArr.forEach((w, c) => {
            if (w > 1) weightTokens.push(`${r}:${c}:${w}`);
          });
        });
        weightTokensStr = weightTokens.join(',');
      }

      appendHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        arenaType: 'pathfinding',
        winner: response.winner || 'Tie',
        datasetSize: 18 * 28,
        datasetType: mazeType,
        pathCost: winnerPathCost,
        replayParams: {
          page: 'pathfinding',
          algos: algorithms.join(','),
          maze: mazeType,
          start: `${startNode[0]},${startNode[1]}`,
          end: `${endNode[0]},${endNode[1]}`,
          walls: wallCoordsStr,
          weights: weightTokensStr
        },
        lanes: response.lanes.map(l => ({
          name: l.name,
          comparisons: l.stats.comparisons,
          steps: l.stats.steps,
          timeMs: l.stats.timeMs
        }))
      });

      if (response.winner) {
        setTimeout(() => play('winner'), 120);
      } else {
        setTimeout(() => play('raceComplete'), 120);
      }
    }
  }, [isCompleted, response, play, mazeType, winnerPathCost, algorithms, startNode, endNode]);

  return (
    <main className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Pathfinding Arena</h1>
          <p>Real-time benchmarking of pathfinding algorithms (Click/drag grid to edit walls & terrain weights)</p>
        </div>
        <button className="btn btn-secondary" onClick={handleShareRun} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={16} /> Share Run
        </button>
      </header>

      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

      {isCompleted && response?.winner && (
        <div className="winner-banner">
          <div className="winner-trophy">🏆</div>
          <div className="winner-details">
            <h3>{response.winner} Wins!</h3>
            <p>
              Found shortest path in <strong>{winnerLane?.stats.timeMs ?? 0} ms</strong> taking{' '}
              <strong>{winnerLane?.stats.steps?.toLocaleString() ?? 0}</strong> steps
              {winnerPathCost > 0 ? <> (Total Path Cost: <strong>{winnerPathCost}</strong>)</> : null}.
            </p>
          </div>
        </div>
      )}

      <section className="panel config-panel pathfinding-config">
        {/* 1. Algorithm Selection Grid (4 Columns) */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '10px' }}>
            Lane Algorithm Assignments
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            {algorithms.map((value, index) => (
              <SelectField
                key={index}
                label={`Lane ${index + 1} Algorithm`}
                value={value}
                options={catalog.pathfindingAlgorithms}
                onChange={(val) => handleAlgorithmChange(index, val)}
              />
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--line)', opacity: 0.5 }} />

        {/* 2. Maze Generator & Canvas Tools Grid */}
        <div className="control-suite-grid">
          {/* Maze & Terrain Generator Suite */}
          <div className="suite-card generator-suite-card">
            <div className="suite-title">
              <Sparkles size={15} className="suite-icon" />
              <span>Maze & Layout Generator Suite</span>
            </div>
            <div className="suite-controls">
              <div className="select-field-container">
                <SelectField
                  label="Select Pattern Algorithm"
                  value={mazeType}
                  options={availableMazeTypes}
                  onChange={handleMazeTypeChange}
                />
              </div>
              <button
                type="button"
                className="btn layout-gen-btn"
                onClick={() => fetchSimulation(true, false)}
                title="Generate new layout from selected algorithm"
              >
                <RefreshCw size={15} />
                <span>Generate Layout</span>
              </button>
            </div>
          </div>

          {/* Interactive Grid Canvas Painting Tools */}
          <div className="suite-card canvas-mode-card">
            <div className="suite-title">
              <Palette size={15} className="suite-icon" />
              <span>Grid Interactive Canvas Mode</span>
            </div>
            <div className="draw-mode-controls">
              <button
                type="button"
                className={`draw-mode-btn mode-wall ${drawMode === 'WALL' ? 'active' : ''}`}
                onClick={() => setDrawMode('WALL')}
              >
                <span className="mode-icon">🧱</span>
                <span>Walls</span>
              </button>
              <button
                type="button"
                className={`draw-mode-btn mode-start ${drawMode === 'START' ? 'active' : ''}`}
                onClick={() => setDrawMode('START')}
              >
                <span className="mode-icon">🟢</span>
                <span>Start</span>
              </button>
              <button
                type="button"
                className={`draw-mode-btn mode-target ${drawMode === 'TARGET' ? 'active' : ''}`}
                onClick={() => setDrawMode('TARGET')}
              >
                <span className="mode-icon">🔴</span>
                <span>Target</span>
              </button>
              <button
                type="button"
                className={`draw-mode-btn mode-weight ${drawMode === 'WEIGHT' ? 'active' : ''}`}
                onClick={() => setDrawMode('WEIGHT')}
              >
                <span className="mode-icon">🏞️</span>
                <span>Terrain / Weight</span>
              </button>
            </div>

            {drawMode === 'WEIGHT' && (
              <div className="terrain-brush-container">
                <div className="terrain-brush-title">
                  <span>Select Terrain Paint Brush</span>
                </div>
                <div className="terrain-brush-grid">
                  {[
                    { label: 'Mud (3x)', weight: 3, color: '#d97706', badgeBg: 'rgba(217, 119, 6, 0.15)' },
                    { label: 'Water (5x)', weight: 5, color: '#0284c7', badgeBg: 'rgba(2, 132, 199, 0.15)' },
                    { label: 'Forest (8x)', weight: 8, color: '#16a34a', badgeBg: 'rgba(22, 163, 74, 0.15)' },
                    { label: 'Mountain (15x)', weight: 15, color: '#64748b', badgeBg: 'rgba(100, 116, 139, 0.15)' },
                    { label: 'Clear (1x)', weight: 1, color: '#6366f1', badgeBg: 'rgba(99, 102, 241, 0.15)' }
                  ].map((t) => (
                    <button
                      key={t.weight}
                      type="button"
                      className={`terrain-brush-btn ${selectedWeight === t.weight ? 'active' : ''}`}
                      style={{
                        '--brush-color': t.color,
                        '--brush-bg': t.badgeBg,
                      } as React.CSSProperties}
                      onClick={() => setSelectedWeight(t.weight)}
                    >
                      <span className="brush-dot" style={{ backgroundColor: t.color }} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Controls
        playing={playback.playing}
        disabled={loading}
        onStart={startRace}
        onToggle={() => playback.setPlaying(!playback.playing)}
        onReset={handleReset}
        onStepForward={playback.stepForward}
        onStepBackward={playback.stepBackward}
        frameIndex={playback.frameIndex}
        maxFrames={playback.maxFrames}
        onSeek={playback.seek}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <section className="lane-grid">
        {response?.lanes.map((lane, index) => {
          const frame = activeFrames?.[index] ?? lane.frames[0];
          let laneState: LaneState;
          if (!response) laneState = 'ready';
          else if (isCompleted || (frame && frame.done)) laneState = 'finished';
          else if (!playback.playing && playback.frameIndex > 0) laneState = 'paused';
          else if (playback.playing) laneState = 'running';
          else laneState = 'ready';
          return (
            <LaneCard key={lane.name} lane={lane} frame={frame} laneState={laneState} arenaType="pathfinding" weights={response?.weights ?? weights}>
              <PathCanvas
                frame={frame}
                weights={response?.weights ?? weights}
                editable={!playback.playing}
                onGridClick={handleGridClick}
              />
            </LaneCard>
          );
        })}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        {response?.lanes && response.lanes.length > 0 && (
          <StepExplanationCard
            lanes={response.lanes}
            activeFrames={activeFrames}
            frameIndex={playback.frameIndex}
            totalFrames={playback.maxFrames}
          />
        )}
        <PerformanceComparison
          response={response}
          activeFrames={activeFrames}
          type="pathfinding"
          isCompleted={isCompleted}
          catalog={catalog}
          playing={playback.playing}
          datasetType={mazeType}
          weights={weights}
        />
        <AlgorithmComparisonCenter
          algorithms={catalog.pathfindingAlgorithms}
          type="pathfinding"
          catalog={catalog}
          activeFrames={activeFramesMap}
          prevFrames={prevFramesMap}
          maxFrames={playback.maxFrames}
        />
        <VisualizationLegend type="pathfinding" />
      </div>
    </main>
  );
}
