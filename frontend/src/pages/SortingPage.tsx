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
import { useArenaLoadState } from '../hooks/useArenaLoadState';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { ArenaLoadingOverlay } from '../components/ArenaLoadingOverlay';
import type { CatalogResponse, RaceLaneResponse, RaceResponse, SimulationFrame } from '../models/types';
import { createSimulationStream, STREAM_TIMEOUT_EVENT } from '../services/sseClient';
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
 * backend. The worker does not implement every catalog algorithm — Radix,
 * Counting, Cocktail and Shell Sort all render as Selection Sort — so a local
 * result must never be presented as an authoritative benchmark.
 */
const APPROXIMATION_NOTICE =
  'Computed in your browser instead of on the server. Timings are approximate, and a few algorithms fall back to a similar one.';

export function SortingPage({ catalog }: { catalog: CatalogResponse }) {
  const [algorithms, setAlgorithms] = useState(['Bubble Sort', 'Quick Sort', 'Merge Sort']);
  const [datasetType, setDatasetType] = useState('Random');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [size, setSize] = useState<number | ''>(30);
  const [customArrayStr, setCustomArrayStr] = useState('5, 3, 8, 1, 9, 2');
  const [dataset, setDataset] = useState<number[] | null>(null);
  const [hasFreshDataset, setHasFreshDataset] = useState(true);
  const [response, setResponse] = useState<RaceResponse | null>(null);
  const [speed, setSpeed] = useState(6);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  /** Set when a result came from the local worker instead of the backend. */
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useArenaLoadState();

  const { play } = useAudio();
  const winnerAnnouncedRef = useRef(false);
  const hasStartedPlaybackRef = useRef(false);
  const requestIdRef = useRef(0);
  const initialized = useRef(false);

  // Filter out "Custom" from Dataset selection dropdown options
  const predefinedOptions = useMemo(
    () => (catalog?.datasetTypes ?? []).filter((d) => d !== 'Custom'),
    [catalog?.datasetTypes]
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

  // Instant 0ms Preview & Fallback Response Generator.
  // Also reports whether what we are about to render is synthesized rather than
  // measured, so the lanes can show a skeleton instead of convincing fake bars.
  const activeView: { response: RaceResponse; isPlaceholder: boolean } = useMemo(() => {
    if (isCustomMode && parsedCustomArray.length > 0) {
      if (response?.dataset && response.dataset.join(',') === parsedCustomArray.join(',')) {
        return { response, isPlaceholder: false };
      }
      const previewLanes: RaceLaneResponse[] = algorithms.map((name) => ({
        name,
        complexity: catalog?.complexity?.[name]?.worst || 'O(n²)',
        complexityInfo: catalog?.complexity?.[name] || {
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
      // Not a placeholder: frame 0 holds the numbers the user actually typed.
      return {
        response: {
          type: 'sorting',
          dataset: parsedCustomArray,
          target: null,
          walls: null,
          weights: null,
          lanes: previewLanes,
          winner: null,
        },
        isPlaceholder: false,
      };
    }

    const effectiveSize = typeof size === 'number' ? size : (response?.dataset?.length || 30);

    if (response && response.dataset?.length === effectiveSize && response.lanes && response.lanes.length === algorithms.length) {
      return { response, isPlaceholder: false };
    }

    // Guaranteed Non-Null Fallback so screen never goes blank during API fetch
    const fallbackArr = response?.dataset && response.dataset.length === effectiveSize
      ? response.dataset
      : Array.from({ length: effectiveSize }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 80) + 10);
    const fallbackLanes: RaceLaneResponse[] = algorithms.map((name) => ({
      name,
      complexity: catalog?.complexity?.[name]?.worst || 'O(n log n)',
      complexityInfo: catalog?.complexity?.[name] || {
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

    // Nothing real to show yet. The lanes below render a skeleton over this,
    // so the synthesized numbers are never mistaken for a measurement.
    return {
      response: {
        type: 'sorting',
        dataset: fallbackArr,
        target: null,
        walls: null,
        weights: null,
        lanes: fallbackLanes,
        winner: null,
      },
      isPlaceholder: true,
    };
  }, [isCustomMode, parsedCustomArray, response, algorithms, catalog, size]);

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
      customParams?: { algos?: string[]; dType?: string; sz?: number | ''; cArray?: string }
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
      const useAlgos = customParams?.algos ?? algorithms;
      const useType = customParams?.dType ?? (isCustomMode ? 'Custom' : datasetType);
      const useCArrayStr = customParams?.cArray ?? customArrayStr;

      let sendCustomArray: number[] | undefined;
      if (useType === 'Custom') {
        sendCustomArray = parseCustomArrayInput(useCArrayStr);
      } else if (!newDataset && dataset) {
        sendCustomArray = dataset;
      }

      const currentNumericSize = typeof size === 'number' ? size : 30;
      const customNumericSize = typeof customParams?.sz === 'number' ? customParams.sz : undefined;
      const useSize = customNumericSize ?? (useType === 'Custom' && sendCustomArray ? Math.max(1, sendCustomArray.length) : currentNumericSize);

      // Web Worker Offloading for Massive Datasets (N >= 1,000) or client offloading
      if (useSize >= 1000 && workerSimulationService.isWorkerAvailable()) {
        const workerDetail = `N = ${useSize.toLocaleString()} — computed in a background worker so the page stays responsive.`;
        load.markComputing('Simulating locally…', 0, workerDetail);

        let arrayToSimulate: number[];
        if (sendCustomArray && sendCustomArray.length > 0) {
          arrayToSimulate = sendCustomArray;
        } else if (!newDataset && dataset && dataset.length === useSize) {
          arrayToSimulate = dataset;
        } else {
          arrayToSimulate = generateDataset(useSize, useType);
        }

        try {
          const workerRes = await workerSimulationService.runSimulation(
            {
              type: 'sorting',
              algorithms: useAlgos,
              array: arrayToSimulate,
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
          console.warn('Worker offloading warning, falling back to SSE stream:', workerErr);
          // Fall through to the backend stream below, which owns the load state
          // from here on.
          if (isCurrent()) {
            load.markWaiting('Asking the backend instead…', 'The local worker could not finish this run.');
          }
        }
      }

      try {
        const params = {
          algorithms: useAlgos,
          datasetType: useType,
          size: useSize,
          customArray: sendCustomArray,
        };

        const cancelStream = createSimulationStream('/api/simulations/stream/sorting', params,
          (startData: any) => {
            if (!isCurrent()) {
              cancelStream();
              return;
            }
            const initialLanes: RaceLaneResponse[] = useAlgos.map((name) => ({
              name,
              complexity: catalog?.complexity?.[name]?.worst || 'O(n log n)',
              complexityInfo: catalog?.complexity?.[name] || {
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
                  array: startData.dataset || [],
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

            setResponse({
              ...startData,
              lanes: initialLanes,
            });
            if (startData.dataset) {
              setDataset(startData.dataset);
            }
            setHasFreshDataset(true);
            playback.reset();
            // Real bars are on screen now — downgrade from the blocking overlay
            // to the quiet header pill for the rest of the stream.
            load.markStreaming('Receiving frames…');
            if (autoplay) {
              play('start');
              playback.setPlaying(true);
              setHasFreshDataset(false);
            }
          },
          (frameEvent: any) => {
             if (!isCurrent()) {
                cancelStream();
                return;
             }
             setResponse((prev) => {
                if (!prev) return prev;
                let foundLane = false;
                const newLanes = prev.lanes.map(lane => {
                   if (lane.name === frameEvent.laneName) {
                      foundLane = true;
                      if (lane.frames.length === 1 && frameEvent.frame.frame === 0) {
                        return { ...lane, frames: [frameEvent.frame] };
                      }
                      return { ...lane, frames: [...lane.frames, frameEvent.frame] };
                   }
                   return lane;
                });
                if (!foundLane) {
                   newLanes.push({
                      name: frameEvent.laneName,
                      complexity: catalog?.complexity?.[frameEvent.laneName]?.worst || '',
                      complexityInfo: catalog?.complexity?.[frameEvent.laneName] || ({} as any),
                      stats: { comparisons: 0, swaps: 0, steps: 0, timeMs: 0, found: false, foundIndex: null },
                      frames: [frameEvent.frame]
                   });
                }
                return { ...prev, lanes: newLanes };
             });
          },
          (endData: any) => {
            if (!isCurrent()) return;
            setResponse(prev => prev ? { ...prev, winner: endData.winner } : endData);
            load.markReady();
          },
          (err: any) => {
            const timedOut = err?.type === STREAM_TIMEOUT_EVENT;
            console.error('SSE Error, generating fallback simulation via Web Worker:', err);
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

            // Fallback to Web Worker for client simulation
            let arrayFallback = sendCustomArray || dataset || generateDataset(useSize, useType);
            workerSimulationService.runSimulation(
              {
                type: 'sorting',
                algorithms: useAlgos,
                array: arrayFallback,
              },
              (percent) => {
                if (isCurrent()) load.markComputing('Simulating locally…', percent);
              }
            ).then((fallbackRes) => {
              if (!isCurrent()) return;
              setResponse(fallbackRes);
              setDataset(fallbackRes.dataset);
              setHasFreshDataset(true);
              playback.reset();
              load.markReady();
              setFallbackNotice(APPROXIMATION_NOTICE);
            }).catch((fallbackErr) => {
              console.error(fallbackErr);
              if (!isCurrent()) return;
              load.markError(
                timedOut ? 'The backend did not respond in time' : 'Could not reach the backend',
                'The local fallback failed too. Check that the backend is running, then retry.'
              );
            });
          }
        );
      } catch (streamErr) {
        console.error('Could not open the simulation stream:', streamErr);
        if (isCurrent()) {
          load.markError('Could not start the simulation', 'The browser refused to open the stream. Retry in a moment.');
        }
      }
    },
    [algorithms, datasetType, isCustomMode, size, customArrayStr, dataset, play, playback, load]
  );

  // Only the request is debounced; the callers update local state immediately so
  // typing and the size stepper stay responsive.
  const debouncedFetch = useDebouncedCallback(
    (
      newDataset: boolean,
      autoplay: boolean,
      customParams?: { algos?: string[]; dType?: string; sz?: number | ''; cArray?: string }
    ) => {
      void fetchSimulation(newDataset, autoplay, customParams);
    },
    350
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const sharedConfig = parseCurrentShareableConfig();
      const params = getUrlParams();

      if (sharedConfig && (sharedConfig.arena === 'sorting' || (params && params.page === 'sorting'))) {
        const urlAlgos = sharedConfig.algorithms || params?.algos;
        const urlSize = sharedConfig.size || params?.size;
        const urlMode = sharedConfig.datasetType || params?.mode;

        let newAlgos = [...algorithms];
        let newMode = datasetType;
        let newSize = size;
        let loadedCustomArrayStr = customArrayStr;

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
        if (sharedConfig.customArray && sharedConfig.customArray.length > 0) {
          newMode = 'Custom';
          setIsCustomMode(true);
          loadedCustomArrayStr = sharedConfig.customArray.join(', ');
          setCustomArrayStr(loadedCustomArrayStr);
          setDataset(sharedConfig.customArray);
          newSize = sharedConfig.customArray.length;
          setSize(newSize);
        } else if (params?.cArray) {
          newMode = 'Custom';
          setIsCustomMode(true);
          loadedCustomArrayStr = params.cArray;
          setCustomArrayStr(params.cArray);
          const parsed = parseCustomArrayInput(params.cArray);
          setDataset(parsed);
          if (parsed.length > 0) newSize = parsed.length;
        } else if (urlMode) {
           newMode = urlMode;
           setDatasetType(urlMode);
        }

        setToastMessage(`✨ Shared Benchmark Loaded: Sorting Arena (${newMode} Dataset, N = ${newSize})`);
        setTimeout(() => setToastMessage(null), 4000);

        fetchSimulation(true, false, {
          algos: newAlgos,
          dType: newMode,
          sz: newSize,
          cArray: newMode === 'Custom' ? loadedCustomArrayStr : undefined,
        });
      } else {
        fetchSimulation(true, false);
      }
    }
  }, []);

  function handleShareRun() {
    setIsShareModalOpen(true);
  }

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

    // A queued debounce, or a placeholder on screen, both mean the visible bars
    // do not match the current inputs. Race real data instead.
    if (debouncedFetch.isPending() || isPlaceholder) {
      debouncedFetch.cancel();
      hasStartedPlaybackRef.current = true;
      await fetchSimulation(true, true);
      setHasFreshDataset(false);
      return;
    }

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
    debouncedFetch.cancel();
    await fetchSimulation(true, false);
    setHasFreshDataset(true);
  }

  function handleAlgorithmChange(index: number, nextAlgo: string) {
    const nextAlgos = algorithms.map((item, i) => (i === index ? nextAlgo : item));
    setAlgorithms(nextAlgos);
    // Discrete choice — no reason to make the user wait out a debounce.
    debouncedFetch.cancel();
    fetchSimulation(false, false, { algos: nextAlgos });
  }

  function handleDatasetTypeChange(nextType: string) {
    setIsCustomMode(false);
    setDataset(null);
    setValidationError(null);
    setDatasetType(nextType);
    debouncedFetch.cancel();
    fetchSimulation(true, false, { dType: nextType });
  }

  function handleToggleCustomMode() {
    const nextMode = !isCustomMode;
    setIsCustomMode(nextMode);
    setValidationError(null);
    debouncedFetch.cancel();

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
    // Holding the number input's arrow key used to fire one full simulation per
    // step; queue a single trailing request instead.
    load.markQueued('Waiting for you to finish…');
    debouncedFetch.run(true, false, { sz: nextSize });
  }

  function handleCustomArrayTextChange(text: string) {
    setCustomArrayStr(text);
    const parsed = parseCustomArrayInput(text);
    const invalid = text
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !/^-?\d+$/.test(t));

    if (invalid.length > 0) {
      setValidationError(`Invalid entry "${invalid[0]}". Please enter numbers only.`);
      debouncedFetch.cancel();
    } else if (parsed.length === 0) {
      setValidationError('Custom Array is empty. Please enter comma-separated numbers.');
      debouncedFetch.cancel();
    } else {
      setValidationError(null);
      setSize(parsed.length);
      setDataset(parsed);
      // One simulation per keystroke was the single worst source of lag here.
      load.markQueued('Waiting for you to finish typing…');
      debouncedFetch.run(true, false, { dType: 'Custom', cArray: text, sz: parsed.length });
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
        arenaType: 'sorting',
        winner: activeResponse.winner || 'Tie',
        datasetSize: typeof size === 'number' ? size : (activeResponse.dataset?.length || 30),
        datasetType: isCustomMode ? 'Custom' : datasetType,
        replayParams: {
          page: 'sorting',
          algos: algorithms.join(','),
          mode: 'Custom',
          cArray: datasetArrayStr || '',
          size: (activeResponse.dataset?.length || (typeof size === 'number' ? size : 30)).toString()
        },
        lanes: activeResponse.lanes.map(l => ({
          name: l.name,
          comparisons: l.stats.comparisons,
          swaps: l.stats.swaps,
          timeMs: l.stats.timeMs
        }))
      });

      if (activeResponse.winner) {
        setTimeout(() => play('winner'), 120);
      } else {
        setTimeout(() => play('raceComplete'), 120);
      }
    }
  }, [isCompleted, activeResponse, play, size, isCustomMode, datasetType, algorithms]);

  return (
    <main className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Sorting Arena</h1>
            {typeof size === 'number' && size >= 1000 && (
              <span className="worker-pill-badge" title="Simulations for N >= 1,000 are computed in a background Web Worker">
                <Cpu size={13} className="text-cyan-400" />
                <span>Web Worker Isolated</span>
              </span>
            )}
          </div>
          <p>Real-time benchmarking of sorting algorithms</p>
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
                placeholder="e.g. 5, 3, 8, 1, 9, 2"
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
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === '') {
                  setSize('');
                  debouncedFetch.cancel();
                  return;
                }
                const parsed = parseInt(raw, 10);
                if (!Number.isNaN(parsed)) {
                  handleSizeChange(parsed);
                }
              }}
              onBlur={() => {
                if (size === '' || size < 1) {
                  const fallback = 30;
                  setSize(fallback);
                  handleSizeChange(fallback);
                } else if (size > 160) {
                  const clamped = 160;
                  setSize(clamped);
                  handleSizeChange(clamped);
                }
              }}
            />
          </label>
        )}
      </section>

      <Controls
        playing={playback.playing}
        // Only lock the controls while there is genuinely nothing to play. During
        // streaming the frames already on screen are scrubbable.
        disabled={load.showOverlay || (isCustomMode && (isCustomEmpty || hasInvalidTokens))}
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
        {activeResponse?.lanes.map((lane, index) => {
          const frame = activeFrames?.[index] ?? lane.frames[0];
          let laneState: LaneState;
          if (!activeResponse) laneState = 'ready';
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
              arenaType="sorting"
              skeleton={isPlaceholder}
            >
              <SortingCanvas frame={frame} algorithm={lane.name} />
            </LaneCard>
          );
        })}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        {/* Suppressed while placeholder data is on screen: these panels would
            otherwise chart a synthesized array as if it were a benchmark. */}
        {!isPlaceholder && activeResponse?.lanes && activeResponse.lanes.length > 0 && (
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
            type="sorting"
            isCompleted={isCompleted}
            catalog={catalog}
            playing={playback.playing}
            datasetType={isCustomMode ? 'Custom' : datasetType}
          />
        )}
        <AlgorithmComparisonCenter
          algorithms={catalog.sortingAlgorithms}
          type="sorting"
          catalog={catalog}
          activeFrames={activeFramesMap}
          prevFrames={prevFramesMap}
          maxFrames={playback.maxFrames}
        />
        <VisualizationLegend type="sorting" />
      </div>

      <CustomDatasetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentSize={typeof size === 'number' ? size : 30}
        onApplyDataset={(parsedArray, label) => {
          setIsCustomMode(true);
          setCustomArrayStr(parsedArray.join(', '));
          setSize(parsedArray.length);
          setDataset(parsedArray);
          debouncedFetch.cancel();
          fetchSimulation(true, false, { dType: 'Custom', cArray: parsedArray.join(', '), sz: parsedArray.length });
          setToastMessage(`Applied ${label} dataset (${parsedArray.length} elements)!`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      <ShareBenchmarkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={{
          arena: 'sorting',
          algorithms,
          datasetType: isCustomMode ? 'Custom' : datasetType,
          size: isCustomMode ? parsedCustomArray.length : (typeof size === 'number' ? size : 30),
          customArray: isCustomMode ? parsedCustomArray : (dataset || undefined),
          speed,
        }}
      />
    </main>
  );
}