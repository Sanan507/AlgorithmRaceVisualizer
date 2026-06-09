import { useMemo, useState } from 'react';
import { Controls } from '../components/Controls';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { LaneCard } from '../components/LaneCard';
import { MetricChart } from '../components/MetricChart';
import { SelectField } from '../components/SelectField';
import { SortingCanvas } from '../components/SortingCanvas';
import { usePlayback } from '../hooks/usePlayback';
import type { CatalogResponse, RaceResponse } from '../models/types';
import { api } from '../services/api';

export function SortingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['Bubble Sort', 'Quick Sort', 'Merge Sort']);
  const [datasetType, setDatasetType] = useState('Random');
  const [size, setSize] = useState(30);
  const [customArray, setCustomArray] = useState('5, 12, 3, 8, 1');
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(6);
  const playback = usePlayback(response, speed);
  const firstInfo = catalog.complexity[algorithms[0]];

  async function startRace() {
    setLoading(true);
    try {
      const body = {
        algorithms,
        datasetType,
        size,
        customArray: customArray.split(',').map((part) => Number(part.trim())).filter((n) => Number.isFinite(n))
      };
      const data = await api.sorting(body);
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
          <h1>Sorting Algorithm Race</h1>
          <p>Compare real step-by-step sorting models running on identical data.</p>
        </div>
        {response?.winner && <div className="winner-pill">Winner: {response.winner}</div>}
      </header>

      <section className="panel config-panel">
        {algorithms.map((value, index) => (
          <SelectField
            key={index}
            label={`Lane ${index + 1}`}
            value={value}
            options={catalog.sortingAlgorithms}
            onChange={(next) => setAlgorithms((items) => items.map((item, i) => (i === index ? next : item)))}
          />
        ))}
        <SelectField label="Dataset" value={datasetType} options={catalog.datasetTypes} onChange={setDatasetType} />
        {datasetType === 'Custom' ? (
          <label className="field wide">
            <span>Custom Array</span>
            <input value={customArray} onChange={(event) => setCustomArray(event.target.value)} />
          </label>
        ) : (
          <label className="field">
            <span>Array Size</span>
            <input type="number" min={2} max={160} value={size} onChange={(event) => setSize(Number(event.target.value))} />
          </label>
        )}
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

      <section className="lane-grid">
        {response?.lanes.map((lane, index) => {
          const frame = activeFrames?.[index] ?? lane.frames[0];
          return (
            <LaneCard key={lane.name} lane={lane} frame={frame}>
              <SortingCanvas frame={frame} />
            </LaneCard>
          );
        })}
      </section>

      <div className="bottom-grid">
        <MetricChart response={response} metric="comparisons" />
        <ExplanationPanel title={algorithms[0]} info={firstInfo} />
      </div>
    </main>
  );
}
