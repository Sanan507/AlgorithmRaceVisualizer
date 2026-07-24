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
import type { CatalogResponse, RaceLaneResponse, RaceResponse } from '../models/types';
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);
  const requestIdRef = useRef(0);

  // Filter out "Custom" from Dataset selection dropdown options
  const predefinedOptions = useMemo(
    () => catalog.datasetTypes.filter((d) => d !== 'Custom'),
    [catalog.datasetTypes]
  );

  // Custom Array validation helpers
  const parsedCustomArray = useMemo(() => parseCustomArrayInput(customArrayStr), [customArrayStr]);
  
  const invalidCustomTokens = useMemo(() => {
    if (!isCustomMode || !customArrayStr.trim()) return [];
    return customArrayStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !/^-?\d+$/.test(t));
  }, [isCustomMode, customArrayStr]);

  const isCustomEmpty = isCustomMode && parsedCustomArray.length === 0;
  const hasInvalidTokens = invalidCustomTokens.length > 0;

  // Instant 0ms Preview Response Generator for Custom Array Editing
  const activeResponse: RaceResponse | null = useMemo(() => {
    if (!isCustomMode || parsedCustomArray.length === 0) {
      return response;
    }
    // If backend response matches current custom array, use response
    if (response?.dataset && response.dataset.join(',') === parsedCustomArray.join(',')) {
      return response;
    }
    // Otherwise, construct an instant local preview response
    const previewLanes: RaceLaneResponse[] = algorithms.map((name) => ({
      name,
      complexity: catalog?.complexity[name]?.worst || 'O(n²)',
      complexityInfo: catalog?.complexity[name] || {
        best: 'O(n)',
        average: 'O(n log n)',
        worst: 'O(n²)',
        space: 'O(1)',
        theory: '',
        pseudocode: '',
      },
      frames: [
        {
          frame: 0,
          array: parsedCustomArray,
          highlight: [],
          sortedBoundary: -1,
          pivotIndex: -1,
          mergeRegionStart: -1,
          mergeRegionEnd: -1,
          heapBoundary: -1,
          comparisons: 0,
          swaps: 0,
          timeMs: 0,
          done: false,
          status: 'Ready',
          foundIndex: null,
          searchPath: [],
          grid: null,
          path: [],
          steps: 0,
          pathFound: false,
        },
      ],
      stats: {
        comparisons: 0,
        swaps: 0,
        steps: 0,
        timeMs: 0,
        found: false,
        foundIndex: null,
      },
    }));
    return {
      type: 'sorting',
      dataset: parsedCustomArray,
      target: null,
      walls: null,
      lanes: previewLanes,
      winner: null,
    };
  }, [isCustomMode, parsedCustomArray, response, algorithms]);


  const onFrame = useCallback(
    (event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
      if (event === 'swap') play('swap');
      else if (event === 'compare') play('compare');
    },
    [play]
  );

  const playback = usePlayback(activeResponse, speed, onFrame);

  const fetchSimulation = useCallback(
    async (
      newDataset: boolean,
      autoplay = false,
      customParams?: { algos?: string[]; dType?: string; sz?: number; cArray?: string }
    ) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      winnerAnnouncedRef.current = false;
      const useAlgos = customParams?.algos ?? algorithms;
      const useType = customParams?.dType ?? (isCustomMode ? 'Custom' : datasetType);
      const useCArrayStr = customParams?.cArray ?? customArrayStr;

      let sendCustomArray: number[] | undefined;
      if (useType === 'Custom') {
        sendCustomArray = parseCustomArrayInput(useCArrayStr);
      } else if (!newDataset && dataset) {
        sendCustomArray = dataset;
      }

      // Compute actual size dynamically
      const useSize = customParams?.sz ?? (useType === 'Custom' && sendCustomArray ? Math.max(1, sendCustomArray.length) : size);

      try {
        const body = {
          algorithms: useAlgos,
          datasetType: useType,
          size: useSize,
          customArray: sendCustomArray,
        };
        const data = await api.sorting(body);

        // Ignore stale out-of-order API responses
        if (requestId !== requestIdRef.current) return;

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
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [algorithms, datasetType, isCustomMode, size, customArrayStr, dataset, play, playback]
  );

  useEffect(() => {
    fetchSimulation(true, false);
  }, []);

  async function startRace() {
    if (isCustomMode) {
      if (isCustomEmpty) {
        setValidationError('Cannot start race: Custom Array is empty. Please enter comma-separated numbers (e.g. 5, 3, 8).');
        return;
      }
      if (hasInvalidTokens) {
        setValidationError(`Cannot start race: Invalid entry "${invalidCustomTokens[0]}". Please enter valid integers only.`);
        return;
      }
    }

    setValidationError(null);

    if (hasFreshDataset && activeResponse) {
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
    setValidationError(null);
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
    setValidationError(null);
    setDatasetType(nextType);
    fetchSimulation(true, false, { dType: nextType });
  }

  function handleToggleCustomMode() {
    const nextMode = !isCustomMode;
    setIsCustomMode(nextMode);
    setValidationError(null);

    if (nextMode) {
      const parsed = parseCustomArrayInput(customArrayStr);
      if (parsed.length > 0) {
        setSize(parsed.length);
        setDataset(parsed);
        fetchSimulation(true, false, { dType: 'Custom', cArray: customArrayStr, sz: parsed.length });
      } else {
        setValidationError('Custom Array is empty. Please enter comma-separated numbers.');
      }
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
    
    // Check validation
    const invalid = text
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !/^-?\d+$/.test(t));

    if (invalid.length > 0) {
      setValidationError(`Invalid entry "${invalid[0]}". Please enter numbers only.`);
    } else if (parsed.length === 0) {
      setValidationError('Custom Array is empty. Please enter comma-separated numbers.');
    } else {
      setValidationError(null);
      setSize(parsed.length);
      setDataset(parsed);
      fetchSimulation(true, false, { dType: 'Custom', cArray: text, sz: parsed.length });
    }
  }

  const activeFrames = useMemo(
    () => activeResponse?.lanes.map((lane) => lane.frames[Math.min(playback.frameIndex, lane.frames.length - 1)]),
    [activeResponse, playback.frameIndex]
  );

  const isCompleted = !!(activeResponse && playback.frameIndex === playback.maxFrames - 1 && playback.maxFrames > 0);
  const winnerLane = activeResponse?.lanes.find((l) => l.name === activeResponse.winner);

  useEffect(() => {
    if (isCompleted && activeResponse && !winnerAnnouncedRef.current) {
      winnerAnnouncedRef.current = true;
      if (activeResponse.winner) {
        setTimeout(() => play('winner'), 120);
      } else {
        setTimeout(() => play('raceComplete'), 120);
      }
    }
  }, [isCompleted, activeResponse, play]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Sorting Arena</h1>
          <p>Real-time benchmarking of sorting algorithms</p>
        </div>
      </header>

      {isCompleted && activeResponse?.winner && (
        <div className="winner-banner">
          <div className="winner-trophy">🏆</div>
          <div className="winner-details">
            <h3>{activeResponse.winner} Wins!</h3>
            <p>
              Completed sorting in <strong>{winnerLane?.stats.timeMs ?? 0} ms</strong> with{' '}
              <strong>{winnerLane?.stats.comparisons?.toLocaleString() ?? 0}</strong> comparisons and{' '}
              <strong>{winnerLane?.stats.swaps?.toLocaleString() ?? 0}</strong> swaps.
            </p>
          </div>
        </div>
      )}

      {/* User-facing Validation Error Banner */}
      {validationError && (
        <div className="validation-alert-banner">
          <span className="alert-icon">⚠️</span>
          <span>{validationError}</span>
          <button type="button" className="close-banner-btn" onClick={() => setValidationError(null)}>
            ✕
          </button>
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
              className={`custom-input-inline ${hasInvalidTokens || isCustomEmpty ? 'input-error' : ''}`}
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
        disabled={loading || (isCustomMode && (isCustomEmpty || hasInvalidTokens))}
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
        {activeResponse?.lanes.map((lane, index) => {
          const frame = activeFrames?.[index] ?? lane.frames[0];
          let laneState: LaneState;
          if (!activeResponse) laneState = 'ready';
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
          response={activeResponse}
          activeFrames={activeFrames}
          type="sorting"
          isCompleted={isCompleted}
          catalog={catalog}
          playing={playback.playing}
        />
        <AlgorithmComparisonCenter algorithms={catalog.sortingAlgorithms} type="sorting" catalog={catalog} />
        <VisualizationLegend type="sorting" />
      </div>
    </main>
  );
}
