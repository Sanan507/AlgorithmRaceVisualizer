import { useMemo, useState } from 'react';
import { Controls } from '../components/Controls';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { LaneCard } from '../components/LaneCard';
import { MetricChart } from '../components/MetricChart';
import { PathCanvas } from '../components/PathCanvas';
import { SelectField } from '../components/SelectField';
import { usePlayback } from '../hooks/usePlayback';
import type { CatalogResponse, RaceResponse } from '../models/types';
import { api } from '../services/api';

export function PathfindingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['BFS', 'Dijkstra', 'A* Search', 'DFS']);
  const [mazeType, setMazeType] = useState('Recursive Backtracker');
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [speed, setSpeed] = useState(6);
  const [loading, setLoading] = useState(false);
  const playback = usePlayback(response, speed);

  async function startRace() {
    setLoading(true);
    try {
      const data = await api.pathfinding({ algorithms, rows: 18, cols: 28, mazeType });
      setResponse(data);
      playback.setPlaying(true);
    } finally {
      setLoading(false);
    }
  }

  const activeFrames = useMemo(
    () => response?.lanes.map((lane) => lane.frames[Math.min(playback.frameIndex, lane.frames.length - 1)]),
    [response, playback.frameIndex]
  );

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Pathfinding Algorithm Race</h1>
          <p>BFS, DFS, Dijkstra, and A* explore the same maze in parallel lanes.</p>
        </div>
        {response?.winner && <div className="winner-pill">Winner: {response.winner}</div>}
      </header>

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
