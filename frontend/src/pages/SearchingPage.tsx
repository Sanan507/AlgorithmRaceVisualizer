import { useMemo, useState } from 'react';
import { Controls } from '../components/Controls';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { LaneCard } from '../components/LaneCard';
import { MetricChart } from '../components/MetricChart';
import { SearchCanvas } from '../components/SearchCanvas';
import { SelectField } from '../components/SelectField';
import { usePlayback } from '../hooks/usePlayback';
import type { CatalogResponse, RaceResponse } from '../models/types';
import { api } from '../services/api';

export function SearchingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['Linear Search', 'Binary Search', 'Jump Search']);
  const [target, setTarget] = useState(66);
  const [size, setSize] = useState(42);
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [speed, setSpeed] = useState(6);
  const [loading, setLoading] = useState(false);
  const playback = usePlayback(response, speed);

  async function startRace() {
    setLoading(true);
    try {
      const data = await api.searching({ algorithms, size, target });
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
          <h1>Searching Algorithm Race</h1>
          <p>Binary and Jump Search receive sorted private copies only when the race starts.</p>
        </div>
        {response?.target && <div className="winner-pill">Target: {response.target}</div>}
      </header>

      <section className="panel config-panel">
        {algorithms.map((value, index) => (
          <SelectField
            key={index}
            label={`Lane ${index + 1}`}
            value={value}
            options={catalog.searchingAlgorithms}
            onChange={(next) => setAlgorithms((items) => items.map((item, i) => (i === index ? next : item)))}
          />
        ))}
        <label className="field">
          <span>Target</span>
          <input type="number" value={target} onChange={(event) => setTarget(Number(event.target.value))} />
        </label>
        <label className="field">
          <span>Array Size</span>
          <input type="number" min={2} max={160} value={size} onChange={(event) => setSize(Number(event.target.value))} />
        </label>
      </section>

      <Controls
        playing={playback.playing}
        disabled={loading}
        onStart={startRace}
        onToggle={() => playback.setPlaying(!playback.playing)}
        onReset={startRace}
        speed={speed}
        onSpeedChange={setSpeed}
        resetLabel="Random Data"
      />

      <section className="lane-grid">
        {response?.lanes.map((lane, index) => {
          const frame = activeFrames?.[index] ?? lane.frames[0];
          return (
            <LaneCard key={lane.name} lane={lane} frame={frame}>
              <SearchCanvas frame={frame} />
            </LaneCard>
          );
        })}
      </section>

      <div className="bottom-grid">
        <MetricChart response={response} metric="comparisons" />
        <ExplanationPanel title={algorithms[0]} info={catalog.complexity[algorithms[0]]} />
      </div>
    </main>
  );
}
