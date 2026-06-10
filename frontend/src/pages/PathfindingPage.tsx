import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controls } from '../components/Controls';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { LaneCard } from '../components/LaneCard';
import { MetricChart } from '../components/MetricChart';
import { PathCanvas } from '../components/PathCanvas';
import { SelectField } from '../components/SelectField';
import { useAudio } from '../context/AudioContext';
import { usePlayback } from '../hooks/usePlayback';
import type { CatalogResponse, RaceResponse } from '../models/types';
import { api } from '../services/api';

export function PathfindingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['BFS', 'Dijkstra', 'A* Search', 'DFS']);
  const [mazeType, setMazeType] = useState('Recursive Backtracker');
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [speed, setSpeed] = useState(6);
  const [loading, setLoading] = useState(false);

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);

  const onFrame = useCallback(
    (event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
      if (event === 'hit') play('pathFound');
      else play('compare');
    },
    [play]
  );

  const playback = usePlayback(response, speed, onFrame);

  async function startRace(autoplay = true) {
    setLoading(true);
    winnerAnnouncedRef.current = false;
    play('start');
    try {
      const data = await api.pathfinding({ algorithms, rows: 18, cols: 28, mazeType });
      setResponse(data);
      if (autoplay) {
        playback.setPlaying(true);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    startRace(false);
  }, []);

  const activeFrames = useMemo(
    () => response?.lanes.map((lane) => lane.frames[Math.min(playback.frameIndex, lane.frames.length - 1)]),
    [response, playback.frameIndex]
  );

  const isCompleted = response && playback.frameIndex === playback.maxFrames - 1 && playback.maxFrames > 0;
  const winnerLane = response?.lanes.find(l => l.name === response.winner);

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
      <header className="page-header">
        <div>
          <h1>Pathfinding Arena</h1>
          <p>Real-time benchmarking of pathfinding algorithms</p>
        </div>
      </header>

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
            label={`Lane ${index + 1}`}
            value={value}
            options={catalog.pathfindingAlgorithms}
            onChange={(next) => setAlgorithms((items) => items.map((item, i) => (i === index ? next : item)))}
          />
        ))}
        <SelectField label="Maze" value={mazeType} options={catalog.mazeTypes} onChange={setMazeType} />
      </section>

      <Controls
        playing={playback.playing}
        disabled={loading}
        onStart={startRace}
        onToggle={() => playback.setPlaying(!playback.playing)}
        onReset={playback.reset}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <section className="path-grid">
        {response?.lanes.map((lane, index) => {
          const frame = activeFrames?.[index] ?? lane.frames[0];
          return (
            <LaneCard key={lane.name} lane={lane} frame={frame}>
              <PathCanvas frame={frame} />
            </LaneCard>
          );
        })}
      </section>

      <div className="bottom-grid">
        <MetricChart response={response} metric="steps" />
        <ExplanationPanel title={algorithms[0]} info={catalog.complexity[algorithms[0]]} />
      </div>
    </main>
  );
}
