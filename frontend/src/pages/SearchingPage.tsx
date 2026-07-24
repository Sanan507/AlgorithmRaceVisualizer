import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LaneState } from '../components/LaneCard';
import { Controls } from '../components/Controls';
import { AlgorithmComparisonCenter } from '../components/AlgorithmComparisonCenter';
import { LaneCard } from '../components/LaneCard';
import { PerformanceComparison } from '../components/PerformanceComparison';
import { VisualizationLegend } from '../components/VisualizationLegend';
import { SearchCanvas } from '../components/SearchCanvas';
import { SelectField } from '../components/SelectField';
import { useAudio } from '../context/AudioContext';
import { usePlayback } from '../hooks/usePlayback';
import type { CatalogResponse, RaceResponse } from '../models/types';
import { api } from '../services/api';
import { parseCustomArrayInput } from '../utils/arrayParser';

export function SearchingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['Linear Search', 'Binary Search', 'Jump Search']);
  const [target, setTarget] = useState(20);
  const [size, setSize] = useState(42);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customArrayStr, setCustomArrayStr] = useState('10, 5, 20, 15, 30');
  const [dataset, setDataset] = useState<number[] | null>(null);
  const [hasFreshDataset, setHasFreshDataset] = useState(true);
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

  const fetchSimulation = useCallback(
    async (
      newDataset: boolean,
      autoplay = false,
      customTarget?: number,
      customAlgos?: string[],
      customSize?: number,
      overrideDataset?: number[]
    ) => {
      setLoading(true);
      winnerAnnouncedRef.current = false;
      const useTarget = customTarget ?? target;
      const useAlgos = customAlgos ?? algorithms;
      const useSize = customSize ?? size;
      const useDataset = overrideDataset ?? dataset;

      try {
        if (newDataset || !useDataset) {
          const data = await api.searching({
            algorithms: useAlgos,
            size: useSize,
            target: useTarget,
            dataset: useDataset ?? undefined,
          });
          setDataset(data.dataset);
          setResponse(data);
          setHasFreshDataset(true);
          playback.reset();
          if (autoplay) {
            play('start');
            playback.setPlaying(true);
          }
        } else {
          const data = await api.searching({
            algorithms: useAlgos,
            size: useSize,
            target: useTarget,
            dataset: useDataset,
          });
          setResponse(data);
          playback.reset();
          if (autoplay) {
            play('start');
            playback.setPlaying(true);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [algorithms, size, target, dataset, play, playback]
  );

  useEffect(() => {
    fetchSimulation(true, false);
  }, []);

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

  function handleTargetChange(newTarget: number) {
    setTarget(newTarget);
    if (dataset) {
      api
        .searching({ algorithms, size: dataset.length, target: newTarget, dataset })
        .then((data) => {
          setResponse(data);
          playback.reset();
        });
    }
  }

  function handleSizeChange(newSize: number) {
    setSize(newSize);
    setIsCustomMode(false);
    fetchSimulation(true, false, target, algorithms, newSize, undefined);
  }

  function handleToggleCustomMode() {
    const nextMode = !isCustomMode;
    setIsCustomMode(nextMode);
    if (nextMode) {
      const parsed = parseCustomArrayInput(customArrayStr);
      if (parsed.length > 0) {
        setDataset(parsed);
        setSize(parsed.length);
        fetchSimulation(true, false, target, algorithms, parsed.length, parsed);
      }
    } else {
      fetchSimulation(true, false, target, algorithms, size, undefined);
    }
  }

  function handleCustomArrayTextChange(text: string) {
    setCustomArrayStr(text);
    const parsed = parseCustomArrayInput(text);
    if (parsed.length > 0) {
      setDataset(parsed);
      setSize(parsed.length);
      fetchSimulation(true, false, target, algorithms, parsed.length, parsed);
    }
  }

  function handleAlgorithmChange(index: number, nextAlgo: string) {
    const nextAlgos = algorithms.map((item, i) => (i === index ? nextAlgo : item));
    setAlgorithms(nextAlgos);

    if (dataset) {
      api
        .searching({ algorithms: nextAlgos, size: dataset.length, target, dataset })
        .then((data) => {
          setResponse(data);
          playback.reset();
        });
    }
  }

  const activeFrames = useMemo(
    () => response?.lanes.map((lane) => lane.frames[Math.min(playback.frameIndex, lane.frames.length - 1)]),
    [response, playback.frameIndex]
  );

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
      <header className="page-header">
        <div>
          <h1>Search Arena</h1>
          <p>Real-time benchmarking of search algorithms</p>
        </div>
        {response?.target !== undefined && response?.target !== null && (
          <div className="winner-pill target-pill">Target: {response.target}</div>
        )}
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
                <span>
                  Target found at index <strong>{winnerLane?.stats.foundIndex}</strong>.
                </span>
              ) : (
                <span>Target not found in dataset.</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main Algorithm & Control Config Panel */}
      <section className="panel config-panel">
        {algorithms.map((value, index) => (
          <SelectField
            key={index}
            label={`Lane ${index + 1}`}
            value={value}
            options={catalog.searchingAlgorithms}
            onChange={(next) => handleAlgorithmChange(index, next)}
          />
        ))}

        <label className="field">
          <span>Target</span>
          <input
            type="number"
            value={target}
            onChange={(event) => handleTargetChange(Number(event.target.value))}
          />
        </label>

        <div className="field">
          <span>Dataset Mode</span>
          <button
            type="button"
            className={`btn-custom-toggle ${isCustomMode ? 'active' : ''}`}
            onClick={handleToggleCustomMode}
          >
            {isCustomMode ? '✓ Custom Mode' : '⚡ Custom Array'}
          </button>
        </div>

        {isCustomMode ? (
          <label className="field custom-values-field">
            <span>Custom Values (comma-separated)</span>
            <input
              type="text"
              className="custom-input-inline"
              value={customArrayStr}
              placeholder="e.g. 10, 5, 20, 15, 30"
              onChange={(e) => handleCustomArrayTextChange(e.target.value)}
            />
          </label>
        ) : (
          <label className="field">
            <span>Array Size</span>
            <input
              type="number"
              min={1}
              max={160}
              value={size}
              onChange={(event) => handleSizeChange(Number(event.target.value))}
            />
          </label>
        )}
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
          else if (isCompleted || frame.done) laneState = 'finished';
          else if (!playback.playing && playback.frameIndex > 0) laneState = 'paused';
          else if (playback.playing) laneState = 'running';
          else laneState = 'ready';
          return (
            <LaneCard key={lane.name} lane={lane} frame={frame} laneState={laneState} arenaType="searching">
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
          playing={playback.playing}
        />
        <AlgorithmComparisonCenter algorithms={algorithms} type="searching" catalog={catalog} />
        <VisualizationLegend type="searching" />
      </div>
    </main>
  );
}
