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
import type { CatalogResponse, RaceLaneResponse, RaceResponse } from '../models/types';
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);
  const requestIdRef = useRef(0);

  // Custom Array & Target validation helpers
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
  const isTargetInvalid = Number.isNaN(target);

  // Instant 0ms Preview Response Generator for Custom Array Editing in Search Arena
  const activeResponse: RaceResponse | null = useMemo(() => {
    if (!isCustomMode || parsedCustomArray.length === 0) {
      return response;
    }
    if (response?.dataset && response.dataset.join(',') === parsedCustomArray.join(',')) {
      return response;
    }
    const previewLanes: RaceLaneResponse[] = algorithms.map((name) => ({
      name,
      complexity: catalog?.complexity[name]?.worst || 'O(log n)',
      complexityInfo: catalog?.complexity[name] || {
        best: 'O(1)',
        average: 'O(log n)',
        worst: 'O(log n)',
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
      type: 'searching',
      dataset: parsedCustomArray,
      target,
      walls: null,
      lanes: previewLanes,
      winner: null,
    };
  }, [isCustomMode, parsedCustomArray, response, algorithms, target]);


  const onFrame = useCallback(
    (event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
      if (event === 'hit') play('searchHit');
      else if (event === 'miss') play('searchMiss');
      else play('compare');
    },
    [play]
  );

  const playback = usePlayback(activeResponse, speed, onFrame);

  const fetchSimulation = useCallback(
    async (
      newDataset: boolean,
      autoplay = false,
      customTarget?: number,
      customAlgos?: string[],
      customSize?: number,
      overrideDataset?: number[]
    ) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      winnerAnnouncedRef.current = false;
      const useTarget = customTarget ?? target;
      const useAlgos = customAlgos ?? algorithms;
      const useDataset = overrideDataset ?? dataset;

      // Dynamically compute size for single-element or multi-element custom arrays
      const useSize = customSize ?? (isCustomMode && useDataset ? Math.max(1, useDataset.length) : size);

      try {
        if (newDataset || !useDataset) {
          const data = await api.searching({
            algorithms: useAlgos,
            size: useSize,
            target: useTarget,
            dataset: useDataset ?? undefined,
          });

          // Ignore stale out-of-order responses
          if (requestId !== requestIdRef.current) return;

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

          // Ignore stale out-of-order responses
          if (requestId !== requestIdRef.current) return;

          setResponse(data);
          playback.reset();
          if (autoplay) {
            play('start');
            playback.setPlaying(true);
          }
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [algorithms, isCustomMode, size, target, dataset, play, playback]
  );

  useEffect(() => {
    fetchSimulation(true, false);
  }, []);

  async function startRace() {
    if (isTargetInvalid) {
      setValidationError('Cannot start search: Please enter a valid target integer.');
      return;
    }

    if (isCustomMode) {
      if (isCustomEmpty) {
        setValidationError('Cannot start search: Custom Array is empty. Please enter comma-separated numbers (e.g. 10, 5, 20).');
        return;
      }
      if (hasInvalidTokens) {
        setValidationError(`Cannot start search: Invalid entry "${invalidCustomTokens[0]}". Please enter integers only.`);
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

  function handleTargetChange(newTarget: number) {
    setTarget(newTarget);
    if (Number.isNaN(newTarget)) {
      setValidationError('Please enter a valid target integer.');
      return;
    }
    setValidationError(null);

    if (dataset) {
      const requestId = ++requestIdRef.current;
      api
        .searching({ algorithms, size: dataset.length, target: newTarget, dataset })
        .then((data) => {
          if (requestId !== requestIdRef.current) return;
          setResponse(data);
          playback.reset();
        });
    }
  }

  function handleSizeChange(newSize: number) {
    setSize(newSize);
    setIsCustomMode(false);
    setValidationError(null);
    fetchSimulation(true, false, target, algorithms, newSize, undefined);
  }

  function handleToggleCustomMode() {
    const nextMode = !isCustomMode;
    setIsCustomMode(nextMode);
    setValidationError(null);

    if (nextMode) {
      const parsed = parseCustomArrayInput(customArrayStr);
      if (parsed.length > 0) {
        setDataset(parsed);
        setSize(parsed.length);
        fetchSimulation(true, false, target, algorithms, parsed.length, parsed);
      } else {
        setValidationError('Custom Array is empty. Please enter comma-separated numbers.');
      }
    } else {
      fetchSimulation(true, false, target, algorithms, size, undefined);
    }
  }

  function handleCustomArrayTextChange(text: string) {
    setCustomArrayStr(text);
    const parsed = parseCustomArrayInput(text);

    const invalid = text
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !/^-?\d+$/.test(t));

    if (invalid.length > 0) {
      setValidationError(`Invalid entry "${invalid[0]}". Please enter integers only.`);
    } else if (parsed.length === 0) {
      setValidationError('Custom Array is empty. Please enter comma-separated numbers.');
    } else {
      setValidationError(null);
      setDataset(parsed);
      setSize(parsed.length);
      fetchSimulation(true, false, target, algorithms, parsed.length, parsed);
    }
  }

  function handleAlgorithmChange(index: number, nextAlgo: string) {
    const nextAlgos = algorithms.map((item, i) => (i === index ? nextAlgo : item));
    setAlgorithms(nextAlgos);

    if (dataset) {
      const requestId = ++requestIdRef.current;
      api
        .searching({ algorithms: nextAlgos, size: dataset.length, target, dataset })
        .then((data) => {
          if (requestId !== requestIdRef.current) return;
          setResponse(data);
          playback.reset();
        });
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
          <h1>Search Arena</h1>
          <p>Real-time benchmarking of search algorithms</p>
        </div>
        {activeResponse?.target !== undefined && activeResponse?.target !== null && (
          <div className="winner-pill target-pill">Target: {activeResponse.target}</div>
        )}
      </header>

      {isCompleted && activeResponse?.winner && (
        <div className="winner-banner">
          <div className="winner-trophy">🏆</div>
          <div className="winner-details">
            <h3>{activeResponse.winner} Wins!</h3>
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
            className={isTargetInvalid ? 'input-error' : ''}
            value={Number.isNaN(target) ? '' : target}
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
              className={`custom-input-inline ${hasInvalidTokens || isCustomEmpty ? 'input-error' : ''}`}
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
        disabled={loading || (isCustomMode && (isCustomEmpty || hasInvalidTokens)) || isTargetInvalid}
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
            <LaneCard key={lane.name} lane={lane} frame={frame} laneState={laneState} arenaType="searching">
              <SearchCanvas frame={frame} algorithm={lane.name} />
            </LaneCard>
          );
        })}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        <PerformanceComparison
          response={activeResponse}
          activeFrames={activeFrames}
          type="searching"
          isCompleted={isCompleted}
          catalog={catalog}
          playing={playback.playing}
        />
        <AlgorithmComparisonCenter algorithms={catalog.searchingAlgorithms} type="searching" catalog={catalog} />
        <VisualizationLegend type="searching" />
      </div>
    </main>
  );
}
