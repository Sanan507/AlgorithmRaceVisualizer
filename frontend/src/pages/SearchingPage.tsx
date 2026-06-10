import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LaneState } from '../components/LaneCard';
import { Controls } from '../components/Controls';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { LaneCard } from '../components/LaneCard';
import { PerformanceComparison } from '../components/PerformanceComparison';
import { VisualizationLegend } from '../components/VisualizationLegend';
import { SearchCanvas } from '../components/SearchCanvas';
import { SelectField } from '../components/SelectField';
import { useAudio } from '../context/AudioContext';
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

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);

  const onFrame = useCallback(
    (event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
      if (event === 'hit') play('searchHit');
      else if (event === 'miss') play('searchMiss');
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
      const data = await api.searching({ algorithms, size, target });
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

  const isCompleted = !!(response && playback.frameIndex === playback.maxFrames - 1 && playback.maxFrames > 0);
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
          <h1>Search Arena</h1>
          <p>Real-time benchmarking of search algorithms</p>
        </div>
        {response?.target && <div className="winner-pill target-pill">Target: {response.target}</div>}
      </header>

      {isCompleted && response?.winner && (
        <div className="winner-banner">
          <div className="winner-trophy">🏆</div>
          <div className="winner-details">
            <h3>{response.winner} Wins!</h3>
            <p>
              Completed search in <strong>{winnerLane?.stats.timeMs ?? 0} ms</strong> performing{' '}
              <strong>{winnerLane?.stats.comparisons?.toLocaleString() ?? 0}</strong> comparisons.{' '}
              {winnerLane?.stats.found ? (
                <span>Target found at index <strong>{winnerLane?.stats.foundIndex}</strong>.</span>
              ) : (
                <span>Target not found in dataset.</span>
              )}
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
        onReset={playback.reset}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <section className="lane-grid">
        {response?.lanes.map((lane, index) => {
          const frame = activeFrames?.[index] ?? lane.frames[0];
          let laneState: LaneState;
          if (!response) laneState = 'ready';
          else if (isCompleted || frame.done) laneState = 'finished';
          else if (!playback.playing && playback.frameIndex > 0) laneState = 'paused';
          else if (playback.playing) laneState = 'running';
          else laneState = 'ready';
          return (
            <LaneCard key={lane.name} lane={lane} frame={frame} laneState={laneState}>
              <SearchCanvas frame={frame} algorithm={lane.name} />
            </LaneCard>
          );
        })}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        <PerformanceComparison
          response={response}
          activeFrames={activeFrames}
          type="searching"
          isCompleted={isCompleted}
          catalog={catalog}
        />
        <div className="bottom-grid">
          <ExplanationPanel title={algorithms[0]} info={catalog.complexity[algorithms[0]]} />
          <VisualizationLegend type="searching" />
        </div>
      </div>
    </main>
  );
}
