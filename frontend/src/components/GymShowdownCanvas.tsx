/**
 * GymShowdownCanvas.tsx
 * High-performance embedded multi-lane canvas renderer for AlgoGym race showdowns.
 */

import React, { useEffect, useRef, useState } from 'react';
import { workerSimulationService } from '../services/workerSimulationService';
import { RaceResponse, SimulationFrame } from '../models/types';
import { Trophy, Play, RotateCcw } from 'lucide-react';

interface GymShowdownCanvasProps {
  algorithms: string[];
  dataset: number[];
  autoPlay?: boolean;
  onFinish?: (winner: string, stats: Record<string, { comparisons: number; swaps: number; timeMs: number }>) => void;
}

export const GymShowdownCanvas: React.FC<GymShowdownCanvasProps> = ({
  algorithms,
  dataset,
  autoPlay = false,
  onFinish,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  
  const [simulationData, setSimulationData] = useState<RaceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  const animFrameIdRef = useRef<number | null>(null);
  const finishNotifiedRef = useRef(false);

  // Compute simulation frames on dataset or algorithms change
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setSimulationData(null);
    setFrameIndex(0);
    setIsPlaying(false);
    setWinnerName(null);
    finishNotifiedRef.current = false;

    workerSimulationService
      .runSimulation({
        type: 'sorting',
        algorithms,
        array: [...dataset],
      })
      .then((resp: RaceResponse) => {
        if (isCancelled) return;
        setSimulationData(resp);
        setLoading(false);
        if (autoPlay) {
          setIsPlaying(true);
        }
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        console.warn('Gym worker simulation fallback:', err);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [algorithms, dataset, autoPlay]);

  // Max frames across lanes
  const maxFrames = simulationData?.lanes.reduce((max, l) => Math.max(max, l.frames.length), 0) || 0;

  // Playback animation loop
  useEffect(() => {
    if (!isPlaying || !simulationData || maxFrames === 0) return;

    let lastTime = performance.now();
    const frameInterval = 28; // ~35 FPS playback in Gym

    const tick = (now: number) => {
      if (now - lastTime >= frameInterval) {
        lastTime = now;
        setFrameIndex((prev) => {
          if (prev >= maxFrames - 1) {
            setIsPlaying(false);
            const winner = simulationData.winner || simulationData.lanes[0]?.name || 'Tie';
            setWinnerName(winner);

            if (!finishNotifiedRef.current && onFinish) {
              finishNotifiedRef.current = true;
              const statsMap: Record<string, { comparisons: number; swaps: number; timeMs: number }> = {};
              simulationData.lanes.forEach((lane) => {
                statsMap[lane.name] = {
                  comparisons: lane.stats.comparisons || 0,
                  swaps: lane.stats.swaps || 0,
                  timeMs: lane.stats.timeMs || 0,
                };
              });
              onFinish(winner, statsMap);
            }
            return prev;
          }
          return prev + 1;
        });
      }
      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, simulationData, maxFrames, onFinish]);

  // Render canvas bars per lane
  useEffect(() => {
    if (!simulationData) return;

    const maxValue = Math.max(...dataset, 1);

    simulationData.lanes.forEach((lane) => {
      const canvas = canvasRefs.current[lane.name];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Current frame or last available frame
      const currentFrameIndex = Math.min(frameIndex, lane.frames.length - 1);
      const frame: SimulationFrame | undefined = lane.frames[currentFrameIndex];
      const arr = frame?.array || dataset;
      const highlight = frame?.highlight || [];
      const isDone = frame?.done || false;

      const n = arr.length;
      const barWidth = Math.max(1, (width - (n - 1) * 1) / n);

      for (let i = 0; i < n; i++) {
        const val = arr[i];
        const barHeight = Math.max(2, (val / maxValue) * (height - 6));
        const x = i * (barWidth + 1);
        const y = height - barHeight;

        let fillStyle = '#38bdf8'; // Default cyan
        if (isDone) {
          fillStyle = '#10b981'; // Emerald done
        } else if (frame?.pivotIndex !== undefined && frame.pivotIndex >= 0 && i === frame.pivotIndex) {
          fillStyle = '#f72585'; // Pivot
        } else if (highlight.includes(i)) {
          fillStyle = '#f59e0b'; // Amber compare/highlight
        } else if (winnerName && winnerName === lane.name && frameIndex >= maxFrames - 1) {
          fillStyle = '#10b981'; // Emerald winner
        }

        ctx.fillStyle = fillStyle;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      ctx.restore();
    });
  }, [simulationData, frameIndex, dataset, winnerName]);

  const handleTogglePlay = () => {
    if (frameIndex >= maxFrames - 1) {
      setFrameIndex(0);
      setWinnerName(null);
      finishNotifiedRef.current = false;
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setFrameIndex(0);
    setWinnerName(null);
    finishNotifiedRef.current = false;
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="gym-canvas-loading-box">
        <div className="worker-pulse-dot" style={{ width: 14, height: 14 }} />
        <span>Pre-calculating algorithm simulation frames...</span>
      </div>
    );
  }

  return (
    <div className="gym-showdown-canvas-wrapper" ref={containerRef}>
      {/* Contender Lanes Grid */}
      <div className="gym-lanes-grid">
        {simulationData?.lanes.map((lane) => {
          const isWinner = winnerName === lane.name;
          const currentFrame = lane.frames[Math.min(frameIndex, lane.frames.length - 1)];

          return (
            <div key={lane.name} className={`gym-lane-card ${isWinner ? 'winner-lane' : ''}`}>
              <div className="gym-lane-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isWinner && <Trophy size={14} className="text-amber-400" />}
                  <span className="gym-lane-name">{lane.name}</span>
                </div>
                <div className="gym-lane-live-stats">
                  <span>C: <strong>{currentFrame?.comparisons || 0}</strong></span>
                  <span>S: <strong>{currentFrame?.swaps || 0}</strong></span>
                </div>
              </div>

              <div className="gym-canvas-container">
                <canvas
                  ref={(el) => {
                    canvasRefs.current[lane.name] = el;
                  }}
                  className="gym-lane-canvas"
                  style={{ width: '100%', height: '110px', display: 'block' }}
                />
              </div>

              {isWinner && (
                <div className="gym-lane-winner-badge">
                  <span>🏆 Finished First!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Playback Mini Bar */}
      <div className="gym-playback-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={handleTogglePlay}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            <Play size={13} className={isPlaying ? 'text-amber-400' : ''} />
            <span>{isPlaying ? 'Pause' : frameIndex >= maxFrames - 1 ? 'Replay' : 'Play'}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={handleRestart}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        <div className="gym-progress-track">
          <div
            className="gym-progress-fill"
            style={{ width: maxFrames > 0 ? `${(frameIndex / (maxFrames - 1)) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
};
