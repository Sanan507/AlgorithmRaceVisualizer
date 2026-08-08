import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import type { CatalogResponse, RaceResponse, SimulationFrame } from '../models/types';
import { api } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { Controls } from '../components/Controls';
import { SelectField } from '../components/SelectField';
import { Share2 } from 'lucide-react';
import { usePlayback } from '../hooks/usePlayback';
import { HeadToHeadBattle } from '../components/HeadToHeadBattle';

export function BattlePage({ catalog }: { catalog: CatalogResponse }) {
  const { play } = useAudio();
  const [algorithms, setAlgorithms] = useState<[string, string]>(['Quick Sort', 'Bubble Sort']);
  const [size, setSize] = useState(50);
  const [datasetType, setDatasetType] = useState('Random');
  const [loading, setLoading] = useState(false);
  const [activeResponse, setActiveResponse] = useState<RaceResponse | null>(null);
  const [speed, setSpeed] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const playback = usePlayback(activeResponse, speed);
  const hasStartedPlaybackRef = useRef(false);
  const winnerAnnouncedRef = useRef(false);
  const requestIdRef = useRef(0);

  const fetchSimulation = useCallback(
    async (
      newDataset: boolean,
      autoplay = false,
      customParams?: { algos?: [string, string]; dType?: string; sz?: number }
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
      const useType = customParams?.dType ?? datasetType;
      const useSize = customParams?.sz ?? size;

      try {
        const data = await api.sorting({
          algorithms: useAlgos,
          datasetType: useType,
          size: useSize,
          newDataset,
        });

        if (requestId !== requestIdRef.current) return;
        setActiveResponse(data);
        const maxFrames = Math.max(...data.lanes.map((l) => l.frames.length), 0);
        playback.reset();

        if (autoplay) {
          playback.setPlaying(true);
        }
      } catch (error: any) {
        if (requestId === requestIdRef.current) {
           console.error("Battle simulation error:", error);
        }
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [algorithms, datasetType, size, playback]
  );

  useEffect(() => {
    if (catalog.sortingAlgorithms.length >= 2) {
      if (!algorithms[0] || !algorithms[1]) {
          setAlgorithms([catalog.sortingAlgorithms[0], catalog.sortingAlgorithms[1]]);
      }
      fetchSimulation(true, false, {
         algos: algorithms[0] && algorithms[1] ? algorithms : [catalog.sortingAlgorithms[0], catalog.sortingAlgorithms[1]] as [string, string]
      });
    }
  }, [catalog.sortingAlgorithms]);

  async function startRace() {
    play('start');
    if (!activeResponse || (playback.frameIndex >= playback.maxFrames - 1 && playback.maxFrames > 0)) {
      await fetchSimulation(true, true);
    } else {
      playback.setPlaying(true);
      hasStartedPlaybackRef.current = true;
    }
  }

  async function handleReset() {
    await fetchSimulation(true, false);
  }

  function handleAlgorithmChange(index: 0 | 1, nextAlgo: string) {
    const nextAlgos = [...algorithms] as [string, string];
    nextAlgos[index] = nextAlgo;
    setAlgorithms(nextAlgos);
    fetchSimulation(false, false, { algos: nextAlgos });
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

  const isCompleted = !!(activeResponse && playback.frameIndex === playback.maxFrames - 1 && playback.maxFrames > 0);
  const winnerLane = activeResponse?.lanes.find((l) => l.name === activeResponse.winner);

  let speedRatioStr = '';
  if (isCompleted && activeResponse && activeResponse.lanes.length === 2 && winnerLane) {
      const loserLane = activeResponse.lanes.find(l => l.name !== winnerLane.name);
      if (loserLane && winnerLane.stats.timeMs > 0) {
          const ratio = loserLane.stats.timeMs / winnerLane.stats.timeMs;
          speedRatioStr = `${ratio.toFixed(1)}x faster`;
      }
  }

  useEffect(() => {
    if (isCompleted && activeResponse && hasStartedPlaybackRef.current && !winnerAnnouncedRef.current) {
      winnerAnnouncedRef.current = true;
      hasStartedPlaybackRef.current = false;

      if (activeResponse.winner) {
        setTimeout(() => play('winner'), 120);
      } else {
        setTimeout(() => play('raceComplete'), 120);
      }
    }
  }, [isCompleted, activeResponse, play]);

  return (
    <main className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Head-to-Head 1v1 Battle</h1>
          <p>Direct showdown with differential live graph</p>
        </div>
      </header>

      {isCompleted && activeResponse?.winner && (
        <div className="winner-banner" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))', border: '1px solid var(--emerald-500)', marginBottom: '24px' }}>
          <div className="winner-trophy">🏆</div>
          <div className="winner-details">
            <h3 style={{ color: 'var(--emerald-400)' }}>{activeResponse.winner} Wins!</h3>
            <p>
              Completed sorting in <strong>{winnerLane?.stats.timeMs ?? 0} ms</strong>.
              {speedRatioStr && <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', background: 'var(--emerald-500)', color: '#fff', fontSize: '0.85rem' }}>{speedRatioStr}</span>}
            </p>
          </div>
        </div>
      )}

      <section className="panel config-panel">
        <SelectField
          label="Algorithm A (Lane 1)"
          value={algorithms[0]}
          options={catalog.sortingAlgorithms}
          onChange={(next) => handleAlgorithmChange(0, next)}
        />
        <SelectField
          label="Algorithm B (Lane 2)"
          value={algorithms[1]}
          options={catalog.sortingAlgorithms}
          onChange={(next) => handleAlgorithmChange(1, next)}
        />
        <label className="field">
          <span>Array Size</span>
          <input
            type="number"
            min={1}
            max={160}
            value={size}
            onChange={(e) => {
                setSize(Number(e.target.value));
                fetchSimulation(true, false, { sz: Number(e.target.value) });
            }}
          />
        </label>
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

      {activeResponse && activeFrames && activeFrames.length === 2 && (
         <HeadToHeadBattle
            response={activeResponse}
            frameA={activeFrames[0]!}
            frameB={activeFrames[1]!}
            algoA={algorithms[0]}
            algoB={algorithms[1]}
         />
      )}
    </main>
  );
}
