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
import { useArenaLoadState } from '../hooks/useArenaLoadState';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { ArenaLoadingOverlay } from '../components/ArenaLoadingOverlay';
import type { CatalogResponse, RaceLaneResponse, RaceResponse, SimulationFrame } from '../models/types';
import { api, ApiTimeoutError } from '../services/api';
import { parseCustomArrayInput } from '../utils/arrayParser';
import { StepExplanationCard } from '../components/StepExplanationCard';
import { CustomDatasetModal } from '../components/CustomDatasetModal';
import { ShareBenchmarkModal } from '../components/ShareBenchmarkModal';
import { CsvUploader } from '../components/CsvUploader';
import { Share2, Cpu } from 'lucide-react';
import { getUrlParams } from '../utils/urlParams';
import { parseCurrentShareableConfig } from '../utils/shareableBenchmark';
import { workerSimulationService } from '../services/workerSimulationService';
import { generateDataset } from '../utils/datasetGenerator';
import { appendHistory } from '../utils/historyStorage';

/**
 * Shown whenever a run was produced by the in-browser worker rather than the
 * backend. The worker does not implement every catalog algorithm — Exponential,
 * Interpolation and Ternary Search all render as Linear Search — so a local
 * result must never be presented as an authoritative benchmark.
 */
const APPROXIMATION_NOTICE =
  'Computed in your browser instead of on the server. Timings are approximate, and a few algorithms fall back to a similar one.';

export function SearchingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['Linear Search', 'Binary Search', 'Jump Search']);
  const [target, setTarget] = useState(20);
  const [size, setSize] = useState(42);
  const [datasetType, setDatasetType] = useState('Random');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customArrayStr, setCustomArrayStr] = useState('10, 5, 20, 15, 30');
  const [dataset, setDataset] = useState<number[] | null>(null);
  const [hasFreshDataset, setHasFreshDataset] = useState(true);
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [speed, setSpeed] = useState(6);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  /** Set when a result came from the local worker instead of the backend. */
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const load = useArenaLoadState();

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);
  const hasStartedPlaybackRef = useRef(false);
  const requestIdRef = useRef(0);
  const initialized = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableDatasetTypes = useMemo(() => {
    if (catalog?.datasetTypes && catalog.datasetTypes.length > 0) {
      return catalog.datasetTypes;
    }
    return ['Random', 'Sorted List', 'Nearly Sorted', 'Reversed'];
  }, [catalog]);

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

  // Instant 0ms Preview & Fallback Response Generator.
  // Also reports whether what we are about to render is synthesized rather than
  // measured, so the lanes can show a skeleton instead of convincing fake bars.
  const activeView: { response: RaceResponse; isPlaceholder: boolean } = useMemo(() => {
    if (isCustomMode && parsedCustomArray.length > 0) {
      if (response?.dataset && response.dataset.join(',') === parsedCustomArray.join(',')) {
        return { response, isPlaceholder: false };
      }
      const previewLanes: RaceLaneResponse[] = algorithms.map((name) => {
        const isLinear = name.toLowerCase().includes('linear');
        const laneArr = isLinear ? [...parsedCustomArray] : [...parsedCustomArray].sort((a, b) => a - b);
        return {
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
              array: laneArr,
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
        };
      });
      // Not a placeholder: frame 0 holds the numbers the user actually typed.
      return {
        response: {
          type: 'searching',
          dataset: parsedCustomArray,
          target,
          walls: null,
          weights: null,
          lanes: previewLanes,
          winner: null,
        },
        isPlaceholder: false,
      };
    }

    if (response && response.dataset?.length === size) return { response, isPlaceholder: false };

    const baseArr = dataset ?? generateDataset(size, datasetType);
    const fallbackLanes: RaceLaneResponse[] = algorithms.map((name) => {
      const isLinear = name.toLowerCase().includes('linear');
      const laneArr = isLinear ? [...baseArr] : [...baseArr].sort((a, b) => a - b);
      return {
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
            array: laneArr,
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
      };
    });

    // Nothing measured yet — the lanes render a skeleton over this.
    return {
      response: {
        type: 'searching',
        dataset: baseArr,
        target,
        walls: null,
        weights: null,
        lanes: fallbackLanes,
        winner: null,
      },
      isPlaceholder: true,
    };
  }, [isCustomMode, parsedCustomArray, response, algorithms, target, catalog, size, dataset, datasetType]);

  const activeResponse = activeView.response;
  const isPlaceholder = activeView.isPlaceholder;

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
      overrideDataset?: number[],
      customDatasetType?: string
    ) => {
      const requestId = ++requestIdRef.current;
      const isCurrent = () => requestId === requestIdRef.current;
      load.markWaiting('Preparing simulation…', 'Asking the backend for a fresh dataset.');
      setFallbackNotice(null);
      winnerAnnouncedRef.current = false;
      if (autoplay) {
        hasStartedPlaybackRef.current = true;
      } else {
        hasStartedPlaybackRef.current = false;
      }
      const useTarget = customTarget ?? target;
      const useAlgos = customAlgos ?? algorithms;
      const useType = customDatasetType ?? (isCustomMode ? 'Custom' : datasetType);

      let useDataset: number[] | undefined;
      if (isCustomMode) {
        useDataset = overrideDataset ?? (parsedCustomArray.length > 0 ? parsedCustomArray : dataset ?? undefined);
      } else if (!newDataset && dataset) {
        useDataset = overrideDataset ?? dataset;
      } else {
        useDataset = overrideDataset ?? (newDataset ? generateDataset(customSize ?? size, useType) : (dataset ?? undefined));
      }

      const useSize = customSize ?? (isCustomMode && useDataset ? Math.max(1, useDataset.length) : size);

      // Web Worker Simulation Offloading for N >= 1,000
      if (useSize >= 1000 && workerSimulationService.isWorkerAvailable()) {
        const workerDetail = `N = ${useSize.toLocaleString()} — computed in a background worker so the page stays responsive.`;
        load.markComputing('Simulating locally…', 0, workerDetail);

        let arrayToSimulate: number[];
        if (useDataset && useDataset.length > 0) {
          arrayToSimulate = useDataset;
        } else {
          arrayToSimulate = generateDataset(useSize, useType);
        }

        try {
          const workerRes = await workerSimulationService.runSimulation(
            {
              type: 'searching',
              algorithms: useAlgos,
              array: arrayToSimulate,
              target: useTarget,
            },
            (percent) => {
              if (isCurrent()) {
                load.markComputing('Simulating locally…', percent, workerDetail);
              }
            }
          );

          if (isCurrent()) {
            setResponse(workerRes);
            setDataset(workerRes.dataset);
            setHasFreshDataset(true);
            playback.reset();
            load.markReady();
            setFallbackNotice(APPROXIMATION_NOTICE);
            if (autoplay) {
              play('start');
              playback.setPlaying(true);
              setHasFreshDataset(false);
            }
          }
          return;
        } catch (workerErr) {
          console.warn('Worker offloading warning for search, falling back to API:', workerErr);
          // Fall through to the backend call below, which owns the load state now.
          if (isCurrent()) {
            load.markWaiting('Asking the backend instead…', 'The local worker could not finish this run.');
          }
        }
      }

      try {
        const sendArray = useDataset ?? generateDataset(useSize, useType);
        const data = await api.searching({
          algorithms: useAlgos,
          size: useSize,
          target: useTarget,
          dataset: sendArray,
        });

        if (isCurrent()) {
          setDataset(data.dataset ?? sendArray);
          setResponse(data);
          setHasFreshDataset(true);
          playback.reset();
          load.markReady();
          if (autoplay) {
            play('start');
            playback.setPlaying(true);
            setHasFreshDataset(false);
          }
        }
      } catch (err) {
        console.warn('API error for searching, running Web Worker fallback:', err);
        const timedOut = err instanceof ApiTimeoutError;

        if (!isCurrent()) return;

        if (!workerSimulationService.isWorkerAvailable()) {
          load.markError(
            timedOut ? 'The backend did not respond in time' : 'Could not reach the backend',
            'Your browser cannot run the local fallback either. Check the connection and retry.'
          );
          return;
        }

        load.markComputing(
          'Simulating locally…',
          0,
          timedOut
            ? 'The backend did not respond in time, so this run is being computed in your browser.'
            : 'The backend is unreachable, so this run is being computed in your browser.'
        );

        let arrayFallback = useDataset || dataset || generateDataset(useSize, useType);
        try {
          const fallbackRes = await workerSimulationService.runSimulation(
            {
              type: 'searching',
              algorithms: useAlgos,
              array: arrayFallback,
              target: useTarget,
            },
            (percent) => {
              if (isCurrent()) load.markComputing('Simulating locally…', percent);
            }
          );
          if (isCurrent()) {
            setResponse(fallbackRes);
            setDataset(fallbackRes.dataset);
            setHasFreshDataset(true);
            playback.reset();
            load.markReady();
            setFallbackNotice(APPROXIMATION_NOTICE);
            if (autoplay) {
              play('start');
              playback.setPlaying(true);
              setHasFreshDataset(false);
            }
          }
        } catch (workerErr) {
          console.error('Worker simulation also failed:', workerErr);
          if (isCurrent()) {
            load.markError(
              timedOut ? 'The backend did not respond in time' : 'Could not reach the backend',
              'The local fallback failed too. Check that the backend is running, then retry.'
            );
          }
        }
      }
    },
    [algorithms, isCustomMode, size, target, dataset, datasetType, play, playback, parsedCustomArray, load]
  );

  // Only the request is debounced; the callers update local state immediately so
  // typing and the number steppers stay responsive.
  const debouncedFetch = useDebouncedCallback(
    (
      newDataset: boolean,
      autoplay: boolean,
      customTarget?: number,
      customAlgos?: string[],
      customSize?: number,
      overrideDataset?: number[],
      customDatasetType?: string
    ) => {
      void fetchSimulation(newDataset, autoplay, customTarget, customAlgos, customSize, overrideDataset, customDatasetType);
    },
    350
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const sharedConfig = parseCurrentShareableConfig();
      const params = getUrlParams();

      if (sharedConfig && (sharedConfig.arena === 'searching' || (params && params.page === 'searching'))) {
        const urlAlgos = sharedConfig.algorithms || params?.algos;
        const urlSize = sharedConfig.size || params?.size;
        const urlTarget = sharedConfig.target !== undefined ? sharedConfig.target : params?.target;

        let newAlgos = [...algorithms];
        let newSize = size;
        let newTarget = target;
        let loadedArray: number[] | undefined;

        if (urlAlgos && urlAlgos.length > 0) {
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
        if (urlTarget !== undefined) {
           newTarget = urlTarget;
           setTarget(urlTarget);
        }
        if (sharedConfig.customArray && sharedConfig.customArray.length > 0) {
          setIsCustomMode(true);
          setCustomArrayStr(sharedConfig.customArray.join(', '));
          setDataset(sharedConfig.customArray);
          loadedArray = sharedConfig.customArray;
          newSize = sharedConfig.customArray.length;
          setSize(newSize);
        } else if (params?.cArray) {
          setIsCustomMode(true);
          setCustomArrayStr(params.cArray);
          const parsed = parseCustomArrayInput(params.cArray);
          setDataset(parsed);
          loadedArray = parsed;
          if (parsed.length > 0) newSize = parsed.length;
        }

        setToastMessage(`✨ Shared Benchmark Loaded: Search Arena (Target = ${newTarget}, N = ${newSize})`);
        setTimeout(() => setToastMessage(null), 4000);

        fetchSimulation(true, false, newTarget, newAlgos, newSize, loadedArray);
      } else {
        fetchSimulation(true, false);
      }
    }
  }, []);

  function handleShareRun() {
    setIsShareModalOpen(true);
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

    // A queued debounce, or a placeholder on screen, both mean the visible lanes
    // do not match the current inputs. Race real data instead.
    if (debouncedFetch.isPending() || isPlaceholder) {
      debouncedFetch.cancel();
      hasStartedPlaybackRef.current = true;
      await fetchSimulation(true, true);
      setHasFreshDataset(false);
      return;
    }

    if (response && response.lanes.length > 0) {
      winnerAnnouncedRef.current = false;
      hasStartedPlaybackRef.current = true;
      play('start');
      if (playback.frameIndex >= playback.maxFrames - 1) {
        playback.seek(0);
      }
      playback.setPlaying(true);
      setHasFreshDataset(false);
    } else {
      hasStartedPlaybackRef.current = true;
      await fetchSimulation(false, true);
      setHasFreshDataset(false);
    }
  }

  async function handleReset() {
    setValidationError(null);
    debouncedFetch.cancel();
    await fetchSimulation(true, false);
    setHasFreshDataset(true);
  }

  function handleTargetChange(newTarget: number) {
    setTarget(newTarget);
    if (Number.isNaN(newTarget)) {
      setValidationError('Please enter a valid target integer.');
      debouncedFetch.cancel();
      return;
    }
    setValidationError(null);

    if (dataset) {
      // Held arrow keys on the target stepper used to fire one simulation per step.
      load.markQueued('Waiting for you to finish…');
      debouncedFetch.run(false, false, newTarget, algorithms, dataset.length, dataset);
    }
  }

  function handleDatasetTypeChange(nextType: string) {
    setDatasetType(nextType);
    setDataset(null);
    // Discrete choice — no reason to make the user wait out a debounce.
    debouncedFetch.cancel();
    fetchSimulation(true, false, target, algorithms, size, undefined, nextType);
  }

  function handleSizeChange(newSize: number) {
    setSize(newSize);
    setIsCustomMode(false);
    setValidationError(null);
    load.markQueued('Waiting for you to finish…');
    debouncedFetch.run(true, false, target, algorithms, newSize, undefined);
  }

  function handleToggleCustomMode() {
    const nextMode = !isCustomMode;
    setIsCustomMode(nextMode);
    setValidationError(null);
    debouncedFetch.cancel();

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
      debouncedFetch.cancel();
    } else if (parsed.length === 0) {
      setValidationError('Custom Array is empty. Please enter comma-separated numbers.');
      debouncedFetch.cancel();
    } else {
      setValidationError(null);
      setDataset(parsed);
      setSize(parsed.length);
      // One simulation per keystroke was the single worst source of lag here.
      load.markQueued('Waiting for you to finish typing…');
      debouncedFetch.run(true, false, target, algorithms, parsed.length, parsed);
    }
  }

  function handleAlgorithmChange(index: number, nextAlgo: string) {
    const nextAlgos = algorithms.map((item, i) => (i === index ? nextAlgo : item));
    setAlgorithms(nextAlgos);
    debouncedFetch.cancel();
    fetchSimulation(false, false, target, nextAlgos, size, dataset ?? undefined);
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
        datasetType: isCustomMode ? 'Custom' : datasetType,
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
  }, [isCompleted, activeResponse, play, size, isCustomMode, datasetType, target, algorithms]);

  return (
    <main className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Search Arena</h1>
            {size >= 1000 && (
              <span className="worker-pill-badge" title="Simulations for N >= 1,000 are computed in a background Web Worker">
                <Cpu size={13} className="text-cyan-400" />
                <span>Web Worker Isolated</span>
              </span>
            )}
          </div>
          <p>Real-time comparative search benchmarking</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {load.showPill && (
            <div className="arena-status-pill" role="status" aria-live="polite">
              <span className="worker-pulse-dot" />
              <span>
                {load.state.label}
                {typeof load.state.progress === 'number' ? ` ${Math.round(load.state.progress)}%` : ''}
              </span>
            </div>
          )}
          {activeResponse?.target !== undefined && activeResponse?.target !== null && (
            <div className="winner-pill target-pill" style={{ margin: 0 }}>Target: {activeResponse.target}</div>
          )}
          <button className="btn btn-secondary" onClick={handleShareRun} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={16} className="text-cyan-400" /> Share Benchmark
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

      {/* Backend unreachable and no local fallback available */}
      {load.hasError && (
        <div className="validation-alert-banner">
          <span className="alert-icon">⚠️</span>
          <span>
            <strong>{load.state.label}.</strong> {load.state.detail}
          </span>
          <button type="button" className="btn btn-secondary arena-retry-btn" onClick={handleReset}>
            Retry
          </button>
        </div>
      )}

      {/* Result came from the browser, not the server — say so. */}
      {fallbackNotice && (
        <div className="arena-notice-banner" role="status">
          <Cpu size={16} className="arena-notice-icon" />
          <span>{fallbackNotice}</span>
          <button
            type="button"
            className="arena-notice-close"
            onClick={() => setFallbackNotice(null)}
            aria-label="Dismiss notice"
          >
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
          <>
            <SelectField
              label="Dataset Distribution"
              value={datasetType}
              options={availableDatasetTypes}
              onChange={handleDatasetTypeChange}
            />
            <label className="field">
              <span>Array Size</span>
              <input
                type="number"
                min={5}
                max={160}
                value={size}
                onChange={(event) => handleSizeChange(Number(event.target.value))}
              />
            </label>
          </>
        )}
      </section>

      <Controls
        playing={playback.playing}
        // Only lock the controls while there is genuinely nothing to play.
        disabled={load.showOverlay || (isCustomMode && (isCustomEmpty || hasInvalidTokens)) || isTargetInvalid}
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
        <ArenaLoadingOverlay visible={load.showOverlay} state={load.state} />
        {activeResponse.lanes.map((lane, index) => {
          const frame = activeFrames?.[index] ?? lane.frames[0];
          let laneState: LaneState;
          if (!response) laneState = 'ready';
          else if (isCompleted || (frame && frame.done)) laneState = 'finished';
          else if (!playback.playing && playback.frameIndex > 0) laneState = 'paused';
          else if (playback.playing) laneState = 'running';
          else laneState = 'ready';
          return (
            <LaneCard
              key={lane.name}
              lane={lane}
              frame={frame}
              laneState={laneState}
              arenaType="searching"
              skeleton={isPlaceholder}
            >
              <SearchCanvas frame={frame} algorithm={lane.name} />
            </LaneCard>
          );
        })}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        {/* Suppressed while placeholder data is on screen: these panels would
            otherwise chart a synthesized array as if it were a benchmark. */}
        {!isPlaceholder && activeResponse.lanes && activeResponse.lanes.length > 0 && (
          <StepExplanationCard
            lanes={activeResponse.lanes}
            activeFrames={activeFrames}
            frameIndex={playback.frameIndex}
            totalFrames={playback.maxFrames}
          />
        )}
        {!isPlaceholder && (
          <PerformanceComparison
            response={activeResponse}
            activeFrames={activeFrames}
            type="searching"
            isCompleted={isCompleted}
            catalog={catalog}
            playing={playback.playing}
            datasetType={isCustomMode ? 'Custom' : datasetType}
          />
        )}
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
        onApplyDataset={(generatedArr: number[], formulaTitle: string) => {
          setIsCustomMode(true);
          setCustomArrayStr(generatedArr.join(', '));
          setDataset(generatedArr);
          setSize(generatedArr.length);
          debouncedFetch.cancel();
          fetchSimulation(true, false, target, algorithms, generatedArr.length, generatedArr);
          setToastMessage(`⚡ Applied Preset: ${formulaTitle} (${generatedArr.length} elements)`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      <ShareBenchmarkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={{
          arena: 'searching',
          algorithms,
          datasetType: isCustomMode ? 'Custom' : datasetType,
          size: isCustomMode ? parsedCustomArray.length : size,
          target,
          customArray: isCustomMode ? parsedCustomArray : (dataset || undefined),
          speed,
        }}
      />
    </main>
  );
}