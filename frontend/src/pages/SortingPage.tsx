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
import type { CatalogResponse, RaceLaneResponse, RaceResponse, SimulationFrame } from '../models/types';
import { api } from '../services/api';
import { createSimulationStream } from '../services/sseClient';
import { parseCustomArrayInput } from '../utils/arrayParser';
import { StepExplanationCard } from '../components/StepExplanationCard';
import { CustomDatasetModal } from '../components/CustomDatasetModal';
import { ShareBenchmarkModal } from '../components/ShareBenchmarkModal';
import { CsvUploader } from '../components/CsvUploader';
import { appendHistory } from '../utils/historyStorage';
import { Share2, Cpu, Zap, Sparkles, Video } from 'lucide-react';
import { getUrlParams } from '../utils/urlParams';
import { parseCurrentShareableConfig } from '../utils/shareableBenchmark';
import { workerSimulationService } from '../services/workerSimulationService';
import { generateDataset } from '../utils/datasetGenerator';
import { useCanvasRecorder } from '../hooks/useCanvasRecorder';

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isWorkerActive, setIsWorkerActive] = useState(false);
  const [workerProgress, setWorkerProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isRecording, formattedTime, toggleRecording } = useCanvasRecorder('sorting');

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

  // Instant 0ms Preview & Fallback Response Generator
  const activeResponse: RaceResponse = useMemo(() => {
    if (isCustomMode && parsedCustomArray.length > 0) {
      if (response?.dataset && response.dataset.join(',') === parsedCustomArray.join(',')) {
        return response;
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
      return {
        type: 'sorting',
        dataset: parsedCustomArray,
        target: null,
        walls: null,
        weights: null,
        lanes: previewLanes,
        winner: null,
      };
    }

    if (response && response.dataset?.length === size) return response;

    // Guaranteed Non-Null Fallback so screen never goes blank during API fetch
    const fallbackArr = Array.from({ length: size }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 80) + 10);
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

    return {
      type: 'sorting',
      dataset: fallbackArr,
      target: null,
      walls: null,
      weights: null,
      lanes: fallbackLanes,
      winner: null,
    };
  }, [isCustomMode, parsedCustomArray, response, algorithms, catalog, size]);

  const onFrame = useCallback((event: 'compare' | 'swap' | 'hit' | 'miss' | 'step') => {
    // Audio is now handled centrally in usePlayback hook
  }, []);

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

      const useSize = customParams?.sz ?? (useType === 'Custom' && sendCustomArray ? Math.max(1, sendCustomArray.length) : size);

      // Web Worker Offloading for Massive Datasets (N >= 1,000) or client offloading
      if (useSize >= 1000 && workerSimulationService.isWorkerAvailable()) {
        setIsWorkerActive(true);
        setWorkerProgress(0);

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
              if (requestId === requestIdRef.current) {
                setWorkerProgress(percent);
              }
            }
          );

          if (requestId === requestIdRef.current) {
            setResponse(workerRes);
            setDataset(workerRes.dataset);
            setHasFreshDataset(true);
            playback.reset();
            if (autoplay) {
              play('start');
              playback.setPlaying(true);
              setHasFreshDataset(false);
            }
          }
          return;
        } catch (workerErr) {
          console.warn('Worker offloading warning, falling back to SSE stream:', workerErr);
        } finally {
          if (requestId === requestIdRef.current) {
            setIsWorkerActive(false);
            setLoading(false);
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
            if (requestId !== requestIdRef.current) {
              cancelStream();
              return;
            }
            setResponse(startData);
            if (startData.dataset) {
              setDataset(startData.dataset);
            }
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
            console.error('SSE Error, generating fallback simulation via Web Worker:', err);
            // Fallback to Web Worker for client simulation
            let arrayFallback = sendCustomArray || dataset || generateDataset(useSize, useType);
            workerSimulationService.runSimulation({
              type: 'sorting',
              algorithms: useAlgos,
              array: arrayFallback,
            }).then((fallbackRes) => {
              if (requestId === requestIdRef.current) {
                setResponse(fallbackRes);
                setDataset(fallbackRes.dataset);
                setHasFreshDataset(true);
                playback.reset();
              }
            }).catch(console.error);
          }
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [algorithms, datasetType, isCustomMode, size, customArrayStr, dataset, play, playback]
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

  function handleAlgorithmChange(index: number, nextAlgo: string) {
    const nextAlgos = algorithms.map((item, i) => (i === index ? nextAlgo : item));
    setAlgorithms(nextAlgos);
    fetchSimulation(false, false, { algos: nextAlgos });
  }

  function handleDatasetTypeChange(nextType: string) {
    setIsCustomMode(false);
    setDataset(null);
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
        datasetSize: size,
        datasetType: isCustomMode ? 'Custom' : datasetType,
        replayParams: {
          page: 'sorting',
          algos: algorithms.join(','),
          mode: 'Custom',
          cArray: datasetArrayStr || '',
          size: (activeResponse.dataset?.length || size).toString()
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
            {size >= 1000 && (
              <span className="worker-pill-badge" title="Simulations for N >= 1,000 are computed in a background Web Worker">
                <Cpu size={13} className="text-cyan-400" />
                <span>Web Worker Isolated</span>
              </span>
            )}
          </div>
          <p>Real-time benchmarking of sorting algorithms</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isWorkerActive && (
            <div className="worker-progress-pill">
              <span className="worker-pulse-dot" />
              <span>Worker Computing: {workerProgress}%</span>
            </div>
          )}
          <button
            type="button"
            className={`btn ${isRecording ? 'btn-danger rec-active-btn' : 'btn-secondary'}`}
            onClick={() => toggleRecording('canvas')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            title={isRecording ? 'Stop and download video recording' : 'Record canvas visualizer as WebM video'}
          >
            {isRecording ? (
              <>
                <span className="rec-pulse-dot" />
                <span>REC {formattedTime}</span>
              </>
            ) : (
              <>
                <Video size={16} className="text-rose-400" />
                <span>Record Video</span>
              </>
            )}
          </button>
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
          else if (isCompleted || (frame && frame.done)) laneState = 'finished';
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
          type="sorting"
          isCompleted={isCompleted}
          catalog={catalog}
          playing={playback.playing}
          datasetType={isCustomMode ? 'Custom' : datasetType}
        />
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
        currentSize={size}
        onApplyDataset={(parsedArray, label) => {
          setIsCustomMode(true);
          setCustomArrayStr(parsedArray.join(', '));
          setSize(parsedArray.length);
          setDataset(parsedArray);
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
          size: isCustomMode ? parsedCustomArray.length : size,
          customArray: isCustomMode ? parsedCustomArray : (dataset || undefined),
          speed,
        }}
      />
    </main>
  );
}