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
import type { CatalogResponse, RaceLaneResponse, RaceResponse, SimulationFrame } from '../models/types';
import { api } from '../services/api';
import { createSimulationStream } from '../services/sseClient';
import { parseCustomArrayInput } from '../utils/arrayParser';
import { StepExplanationCard } from '../components/StepExplanationCard';
import { CustomDatasetModal } from '../components/CustomDatasetModal';
import { CsvUploader } from '../components/CsvUploader';
import { appendHistory } from '../utils/historyStorage';
import { Share2 } from 'lucide-react';
import { getUrlParams } from '../utils/urlParams';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);
  const hasStartedPlaybackRef = useRef(false);
  const requestIdRef = useRef(0);
  const initialized = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Instant 0ms Preview & Fallback Response Generator
  const activeResponse: RaceResponse = useMemo(() => {
    if (isCustomMode && parsedCustomArray.length > 0) {
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
        weights: null,
        lanes: previewLanes,
        winner: null,
      };
    }

    if (response) return response;

    const fallbackArr = Array.from({ length: size }, (_, i) => i * 2 + 5);
    const fallbackLanes: RaceLaneResponse[] = algorithms.map((name) => ({
      name,
      complexity: catalog?.complexity?.[name]?.worst || 'O(log n)',
      complexityInfo: catalog?.complexity?.[name] || {
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
          array: fallbackArr,
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
      dataset: fallbackArr,
      target,
      walls: null,
      weights: null,
      lanes: fallbackLanes,
      winner: null,
    };
  }, [isCustomMode, parsedCustomArray, response, algorithms, target, catalog, size]);

  const onFrame = useCallback((event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
    // Audio is now handled centrally in usePlayback hook
  }, []);

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
      if (autoplay) {
        hasStartedPlaybackRef.current = true;
      } else {
        hasStartedPlaybackRef.current = false;
      }
      const useTarget = customTarget ?? target;
      const useAlgos = customAlgos ?? algorithms;
      const useDataset = overrideDataset ?? dataset;
      const useSize = customSize ?? (isCustomMode && useDataset ? Math.max(1, useDataset.length) : size);

      try {
        const params = {
          algorithms: useAlgos,
          size: useSize,
          target: useTarget,
          dataset: useDataset ?? undefined,
        };

        const cancelStream = createSimulationStream('/api/simulations/stream/searching', params,
          (startData: any) => {
            if (requestId !== requestIdRef.current) {
              cancelStream();
              return;
            }
            setDataset(startData.dataset);
            setResponse(startData);
            setHasFreshDataset(true);
            playback.reset();
            if (autoplay) {
              play('start');
              playback.setPlaying(true);
              setHasFreshDataset(false);
            }
          },
          (frameEvent: any) => {
             if (requestId !== requestIdRef.current) {
                cancelStream();
                return;
             }
             setResponse((prev) => {
                if (!prev) return prev;
                const newLanes = prev.lanes.map(lane => {
                   if (lane.name === frameEvent.laneName) {
                      return { ...lane, frames: [...lane.frames, frameEvent.frame] };
                   }
                   return lane;
                });
                if (!newLanes.find(l => l.name === frameEvent.laneName)) {
                   newLanes.push({
                      name: frameEvent.laneName,
                      complexity: '',
                      complexityInfo: {} as any,
                      stats: { comparisons: 0, swaps: 0, steps: 0, timeMs: 0, found: false, foundIndex: null },
                      frames: [frameEvent.frame]
                   });
                }
                return { ...prev, lanes: newLanes };
             });
          },
          (endData: any) => {
            if (requestId !== requestIdRef.current) return;
            setResponse(prev => prev ? { ...prev, winner: endData.winner } : endData);
          },
          (err: any) => {
            console.error('SSE Error', err);
          }
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [algorithms, isCustomMode, size, target, dataset, play, playback]
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const params = getUrlParams();
      if (params && params.page === 'searching') {
        const urlAlgos = params.algos;
        const urlSize = params.size;
        const urlMode = params.mode;

        let newAlgos = [...algorithms];
        let newSize = size;
        let newTarget = target;

        if (urlAlgos) {
          newAlgos = [
             urlAlgos[0] || algorithms[0],
             urlAlgos[1] || algorithms[1],
             urlAlgos[2] || algorithms[2]
          ];
          setAlgorithms(newAlgos);
        }
        if (urlSize) {
           newSize = urlSize;
           setSize(urlSize);
        }
        if (params.cArray) {
          setIsCustomMode(true);
          setCustomArrayStr(params.cArray);
          const parsed = parseCustomArrayInput(params.cArray);
          setDataset(parsed);
          if (parsed.length > 0) newSize = parsed.length;
          if (params.target !== undefined) {
            newTarget = params.target;
            setTarget(params.target);
          }

          const url = new URL(window.location.href);
          url.search = '';
          window.history.replaceState(null, '', url.href);

          fetchSimulation(true, false, newTarget, newAlgos, newSize, parsed);
          return;
        }

        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState(null, '', url.href);

        fetchSimulation(true, false, newTarget, newAlgos, newSize, undefined);
      } else {
        fetchSimulation(true, false);
      }
    }
  }, []);

  function handleShareRun() {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'searching');
    url.searchParams.set('algos', algorithms.join(','));
    url.searchParams.set('target', target.toString());
    if (dataset && dataset.length > 0) {
      url.searchParams.set('mode', 'Custom');
      url.searchParams.set('cArray', dataset.join(', '));
    } else if (!isCustomMode) {
      url.searchParams.set('size', size.toString());
    } else {
      url.searchParams.set('mode', 'Custom');
      url.searchParams.set('cArray', customArrayStr);
    }

    navigator.clipboard.writeText(url.href)
      .then(() => {
        setToastMessage('Link copied to clipboard!');
        setTimeout(() => setToastMessage(null), 3000);
      })
      .catch((err) => console.error('Failed to copy link', err));
  }

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
      hasStartedPlaybackRef.current = true;
      play('start');
      playback.reset();
      playback.setPlaying(true);
      setHasFreshDataset(false);
    } else {
      hasStartedPlaybackRef.current = true;
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
    () =>
      activeResponse?.lanes.map((lane) => {
        if (!lane.frames || lane.frames.length === 0) return undefined;
        const safeIdx = Math.max(0, Math.min(playback.frameIndex, lane.frames.length - 1));
        return lane.frames[safeIdx];
      }),
    [activeResponse, playback.frameIndex]
  );

  const activeFramesMap = useMemo(() => {
    if (!activeResponse?.lanes || !activeFrames) return {};
    const map: Record<string, SimulationFrame | null> = {};
    activeResponse.lanes.forEach((lane, i) => {
      map[lane.name] = activeFrames[i] ?? null;
    });
    return map;
  }, [activeResponse, activeFrames]);

  const prevFramesMap = useMemo(() => {
    if (!activeResponse?.lanes || playback.frameIndex <= 0) return {};
    const map: Record<string, SimulationFrame | null> = {};
    activeResponse.lanes.forEach((lane) => {
      map[lane.name] = lane.frames[playback.frameIndex - 1] ?? null;
    });
    return map;
  }, [activeResponse, playback.frameIndex]);

  const isCompleted = !!(activeResponse && playback.frameIndex === playback.maxFrames - 1 && playback.maxFrames > 0);
  const winnerLane = activeResponse?.lanes.find((l) => l.name === activeResponse.winner);

  useEffect(() => {
    if (isCompleted && activeResponse && hasStartedPlaybackRef.current && !winnerAnnouncedRef.current) {
      winnerAnnouncedRef.current = true;
      hasStartedPlaybackRef.current = false;

      const datasetArrayStr = activeResponse.dataset ? activeResponse.dataset.join(',') : undefined;

      appendHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        arenaType: 'searching',
        winner: activeResponse.winner || 'Tie',
        datasetSize: size,
        datasetType: isCustomMode ? 'Custom' : 'Sorted List',
        targetValue: target,
        replayParams: {
          page: 'searching',
          algos: algorithms.join(','),
          mode: 'Custom',
          cArray: datasetArrayStr || '',
          target: target.toString(),
          size: (activeResponse.dataset?.length || size).toString()
        },
        lanes: activeResponse.lanes.map(l => ({
          name: l.name,
          comparisons: l.stats.comparisons,
          timeMs: l.stats.timeMs,
          found: l.stats.found
        }))
      });

      if (activeResponse.winner) {
        setTimeout(() => play('winner'), 120);
      } else {
        setTimeout(() => play('raceComplete'), 120);
      }
    }
  }, [isCompleted, activeResponse, play, size, isCustomMode, target, algorithms]);

  return (
    <main className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Search Arena</h1>
          <p>Real-time benchmarking of search algorithms</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {activeResponse?.target !== undefined && activeResponse?.target !== null && (
            <div className="winner-pill target-pill" style={{ margin: 0 }}>Target: {activeResponse.target}</div>
          )}
          <button className="btn btn-secondary" onClick={handleShareRun} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={16} /> Share Run
          </button>
        </div>
      </header>

      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

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
          <button type="button" className="close-banner-btn" onClick={() => setValidationError(null)} aria-label="Dismiss error message">
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn-custom-toggle ${isCustomMode ? 'active' : ''}`}
              onClick={handleToggleCustomMode}
            >
              {isCustomMode ? '✓ Custom Mode' : 'Custom Array'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0 12px', height: '38px' }}
              onClick={() => setIsModalOpen(true)}
            >
              ⚡ Math Suite
            </button>
          </div>
        </div>

        {isCustomMode ? (
          <div className="field custom-values-field" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span>Custom Values (comma-separated or file upload)</span>
              <span className="field-hint-text">Accepts .csv / .txt</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                className={`custom-input-inline ${hasInvalidTokens || isCustomEmpty ? 'input-error' : ''}`}
                value={customArrayStr}
                placeholder="e.g. 10, 5, 20, 15, 30"
                onChange={(e) => handleCustomArrayTextChange(e.target.value)}
                style={{ flex: 1, height: '40px' }}
              />
              <CsvUploader onUploadSuccess={(parsed) => handleCustomArrayTextChange(parsed.join(', '))} />
            </div>
          </div>
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
          else if (isCompleted || (frame && frame.done)) laneState = 'finished';
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
        {activeResponse?.lanes && activeResponse.lanes.length > 0 && (
          <StepExplanationCard
            lanes={activeResponse.lanes}
            activeFrames={activeFrames}
            frameIndex={playback.frameIndex}
            totalFrames={playback.maxFrames}
          />
        )}
        <PerformanceComparison
          response={activeResponse}
          activeFrames={activeFrames}
          type="searching"
          isCompleted={isCompleted}
          catalog={catalog}
          playing={playback.playing}
          datasetType={isCustomMode ? 'Custom' : 'Random'}
        />
        <AlgorithmComparisonCenter
          algorithms={catalog.searchingAlgorithms}
          type="searching"
          catalog={catalog}
          activeFrames={activeFramesMap}
          prevFrames={prevFramesMap}
          maxFrames={playback.maxFrames}
        />
        <VisualizationLegend type="searching" />
      </div>

      <CustomDatasetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentSize={size}
        onApplyDataset={(parsedArray, label) => {
          setIsCustomMode(true);
          setCustomArrayStr(parsedArray.join(', '));
          setSize(parsedArray.length);
          setDataset(parsedArray);
          fetchSimulation(true, false, target, algorithms, parsedArray.length, parsedArray);
          setToastMessage(`Applied ${label} dataset (${parsedArray.length} elements)!`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />
    </main>
  );
}