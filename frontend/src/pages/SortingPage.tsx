import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LaneState } from '../components/LaneCard';
import { Controls } from '../components/Controls';
import { AlgorithmComparisonCenter } from '../components/AlgorithmComparisonCenter';
import { LaneCard } from '../components/LaneCard';
import { PerformanceComparison } from '../components/PerformanceComparison';
import { VisualizationLegend } from '../components/VisualizationLegend';
import { SelectField } from '../components/SelectField';
import { SortingCanvas } from '../components/SortingCanvas';
import { useAudio } from '../context/AudioContext';
import { usePlayback } from '../hooks/usePlayback';
import type { CatalogResponse, RaceResponse } from '../models/types';
import { api } from '../services/api';
import { parseCustomArrayInput } from '../utils/arrayParser';

export function SortingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['Bubble Sort', 'Quick Sort', 'Merge Sort']);
  const [datasetType, setDatasetType] = useState('Random');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [size, setSize] = useState(30);
  const [customArrayStr, setCustomArrayStr] = useState('5, 3, 8, 1, 9, 2');
  const [dataset, setDataset] = useState<number[] | null>(null);
  const [hasFreshDataset, setHasFreshDataset] = useState(true);
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(6);

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);

  // Filter out "Custom" from Dataset selection dropdown options
  const predefinedOptions = useMemo(
    () => catalog.datasetTypes.filter((d) => d !== 'Custom'),
    [catalog.datasetTypes]
  );

  const onFrame = useCallback(
    (event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
      if (event === 'swap') play('swap');
      else if (event === 'compare') play('compare');
    },
    [play]
  );

  const playback = usePlayback(response, speed, onFrame);

  const fetchSimulation = useCallback(
    async (
      newDataset: boolean,
      autoplay = false,
      customParams?: { algos?: string[]; dType?: string; sz?: number; cArray?: string }
    ) => {
      setLoading(true);
      winnerAnnouncedRef.current = false;
      const useAlgos = customParams?.algos ?? algorithms;
      const useType = customParams?.dType ?? (isCustomMode ? 'Custom' : datasetType);
      const useSize = customParams?.sz ?? size;
      const useCArrayStr = customParams?.cArray ?? customArrayStr;

      let sendCustomArray: number[] | undefined;
      if (useType === 'Custom') {
        sendCustomArray = parseCustomArrayInput(useCArrayStr);
      } else if (!newDataset && dataset) {
        sendCustomArray = dataset;
      }

      try {
        const body = {
          algorithms: useAlgos,
          datasetType: useType,
          size: useSize,
          customArray: sendCustomArray,
        };
        const data = await api.sorting(body);
        setResponse(data);
        if (data.dataset) {
          setDataset(data.dataset);
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
    [algorithms, datasetType, isCustomMode, size, customArrayStr, dataset, play, playback]
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

  function handleAlgorithmChange(index: number, nextAlgo: string) {
    const nextAlgos = algorithms.map((item, i) => (i === index ? nextAlgo : item));
    setAlgorithms(nextAlgos);
    fetchSimulation(false, false, { algos: nextAlgos });
  }

  function handleDatasetTypeChange(nextType: string) {
    setIsCustomMode(false);
    setDatasetType(nextType);
    fetchSimulation(true, false, { dType: nextType });
  }

  function handleToggleCustomMode() {
    const nextMode = !isCustomMode;
    setIsCustomMode(nextMode);
    if (nextMode) {
      fetchSimulation(true, false, { dType: 'Custom', cArray: customArrayStr });
    } else {
      fetchSimulation(true, false, { dType: datasetType });
    }
  }

  function handleSizeChange(nextSize: number) {
    setSize(nextSize);
    fetchSimulation(true, false, { sz: nextSize });
  }

  function handleCustomArrayTextChange(text: string) {
    setCustomArrayStr(text);
    const parsed = parseCustomArrayInput(text);
    if (parsed.length > 0) {
      fetchSimulation(true, false, { dType: 'Custom', cArray: text, sz: parsed.length });
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
          <h1>Sorting Arena</h1>
          <p>Real-time benchmarking of sorting algorithms</p>
        </div>
      </header>

      {isCompleted && response?.winner && (
        <div className="winner-banner">
          <div className="winner-trophy">🏆</div>
          <div className="winner-details">
            <h3>{response.winner} Wins!</h3>
            <p>
              Completed sorting in <strong>{winnerLane?.stats.timeMs ?? 0} ms</strong> with{' '}
              <strong>{winnerLane?.stats.comparisons?.toLocaleString() ?? 0}</strong> comparisons and{' '}
              <strong>{winnerLane?.stats.swaps?.toLocaleString() ?? 0}</strong> swaps.
            </p>
          </div>
        </div>
      )}

      {/* Dataset & Control Config Panel */}
      <section className="panel config-panel">
        {algorithms.map((value, index) => (
          <SelectField
            key={index}
            label={`Lane ${index + 1}`}
            value={value}
            options={catalog.sortingAlgorithms}
            onChange={(next) => handleAlgorithmChange(index, next)}
          />
        ))}

        <SelectField
          label="Dataset"
          value={isCustomMode ? 'Custom' : datasetType}
          options={predefinedOptions}
          onChange={handleDatasetTypeChange}
        />

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
              placeholder="e.g. 5, 3, 8, 1, 9, 2"
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
            <LaneCard key={lane.name} lane={lane} frame={frame} laneState={laneState} arenaType="sorting">
              <SortingCanvas frame={frame} algorithm={lane.name} />
            </LaneCard>
          );
        })}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        <PerformanceComparison
          response={response}
          activeFrames={activeFrames}
          type="sorting"
          isCompleted={isCompleted}
          catalog={catalog}
          playing={playback.playing}
        />
        <AlgorithmComparisonCenter algorithms={algorithms} type="sorting" catalog={catalog} />
        <VisualizationLegend type="sorting" />
      </div>
    </main>
  );
}
