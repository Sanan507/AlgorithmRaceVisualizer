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
import { Share2 } from 'lucide-react';
import { getUrlParams } from '../utils/urlParams';

export function PathfindingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['BFS', 'Dijkstra', 'A* Search', 'DFS']);
  const [mazeType, setMazeType] = useState('Recursive Backtracker');
  const [walls, setWalls] = useState<boolean[][] | null>(null);
  const [drawMode, setDrawMode] = useState<'WALL' | 'START' | 'TARGET'>('WALL');
  const [startNode, setStartNode] = useState<[number, number]>([2, 2]);
  const [endNode, setEndNode] = useState<[number, number]>([15, 25]);
  const [hasFreshDataset, setHasFreshDataset] = useState(true);
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [speed, setSpeed] = useState(6);
  const [loading, setLoading] = useState(false);

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);
  const initialized = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const onFrame = useCallback(
    (event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
      if (event === 'hit') play('pathFound');
      else play('compare');
    },
    [play]
  );

  const playback = usePlayback(response, speed, onFrame);

  const fetchSimulation = useCallback(
    async (
      newMaze: boolean,
      autoplay = false,
      customParams?: { algos?: string[]; mType?: string; walls?: boolean[][]; start?: [number, number]; end?: [number, number] }
    ) => {
      setLoading(true);
      winnerAnnouncedRef.current = false;
      const useAlgos = customParams?.algos ?? algorithms;
      const useMazeType = customParams?.mType ?? mazeType;
      const useStart = customParams?.start ?? startNode;
      const useEnd = customParams?.end ?? endNode;
      const sendWalls = customParams?.walls ?? (!newMaze && walls ? walls : null);

      try {
        const data = await api.pathfinding({
          algorithms: useAlgos,
          rows: 18,
          cols: 28,
          mazeType: useMazeType,
          walls: sendWalls,
          startRow: useStart[0],
          startCol: useStart[1],
          endRow: useEnd[0],
          endCol: useEnd[1]
        });
        setResponse(data);
        if (data.walls) {
          setWalls(data.walls);
        }
        setHasFreshDataset(true);
        playback.reset();
        if (autoplay) {
          play('start');
          playback.setPlaying(true);
          setHasFreshDataset(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [algorithms, mazeType, walls, play, playback]
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const params = getUrlParams();
      if (params && params.page === 'pathfinding') {
        const urlAlgos = params.algos;
        const urlMaze = params.maze;
        const urlWallsStr = params.walls;

        let newAlgos = [...algorithms];
        let newMaze = mazeType;
        let parsedWallsGrid: boolean[][] | undefined = undefined;

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

        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState(null, '', url.href);

        fetchSimulation(true, false, { algos: newAlgos, mType: newMaze, walls: parsedWallsGrid });
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
      play('start');
      playback.reset();
      playback.setPlaying(true);
      setHasFreshDataset(false);
    } else {
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
      const currentGrid = walls ?? Array.from({ length: 18 }, () => Array(28).fill(false));
      const nextGrid = currentGrid.map((rowArr, rowIdx) =>
        rowArr.map((cell, colIdx) => (rowIdx === r && colIdx === c ? !cell : cell))
      );
      setWalls(nextGrid);
      fetchSimulation(false, false, { walls: nextGrid });
    } else if (drawMode === 'START') {
      setStartNode([r, c]);
      fetchSimulation(false, false, { start: [r, c] });
    } else if (drawMode === 'TARGET') {
      setEndNode([r, c]);
      fetchSimulation(false, false, { end: [r, c] });
    }
  }

  const activeFrames = useMemo(
    () => response?.lanes.map((lane) => lane.frames[Math.min(playback.frameIndex, lane.frames.length - 1)]),
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

  useEffect(() => {
    if (isCompleted && response && !winnerAnnouncedRef.current) {
      winnerAnnouncedRef.current = true;
      if (response.winner) {
        setTimeout(() => play('winner'), 120);
      } else {
        setTimeout(() => play('raceComplete'), 120);
      }
    }
  }, [isCompleted, response, play]);

  return (
    <main className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Pathfinding Arena</h1>
          <p>Real-time benchmarking of pathfinding algorithms (Click/drag grid to edit walls)</p>
        </div>
        <button className="btn btn-secondary" onClick={handleShareRun} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={16} /> Share Run
        </button>
      </header>

      <div className="draw-mode-controls" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`btn ${drawMode === 'WALL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDrawMode('WALL')}
        >
          Draw Walls
        </button>
        <button
          className={`btn ${drawMode === 'START' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDrawMode('START')}
        >
          Set Start (Green)
        </button>
        <button
          className={`btn ${drawMode === 'TARGET' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDrawMode('TARGET')}
        >
          Set Target (Red)
        </button>
      </div>

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
              <strong>{winnerLane?.stats.steps?.toLocaleString() ?? 0}</strong> steps.
            </p>
          </div>
        </div>
      )}

      <section className="panel config-panel">
        {algorithms.map((value, index) => (
          <SelectField
            key={index}
            label={`Lane ${index + 1} Algorithm`}
            value={value}
            options={catalog.pathfindingAlgorithms}
            onChange={(val) => handleAlgorithmChange(index, val)}
          />
        ))}
        <SelectField label="Maze Pattern" value={mazeType} options={catalog.mazeTypes} onChange={handleMazeTypeChange} />
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
            <LaneCard key={lane.name} lane={lane} frame={frame} laneState={laneState} arenaType="pathfinding">
              <PathCanvas
                frame={frame}
                editable={!playback.playing}
                onGridClick={handleGridClick}
              />
            </LaneCard>
          );
        })}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        <PerformanceComparison
          response={response}
          activeFrames={activeFrames}
          type="pathfinding"
          isCompleted={isCompleted}
          catalog={catalog}
          playing={playback.playing}
          datasetType={mazeType}
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
