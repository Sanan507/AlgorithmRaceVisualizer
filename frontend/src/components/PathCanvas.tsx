import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const stateColor: Record<string, string> = {
  EMPTY: '#0b0b1e',
  WALL: '#1e1e31',
  START: '#10b981',
  END: '#ff0055',
  VISITED: '#1e1b4b',
  FRONTIER: '#6366f1',
  PATH: '#ffd166'
};

export function PathCanvas({ frame }: { frame: SimulationFrame }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !frame.grid) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    
    const isLight = document.documentElement.dataset.theme === 'light';
    
    // Draw canvas container base
    ctx.fillStyle = isLight ? '#f2f7ff' : '#0b0b1e';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    const rows = frame.grid.length;
    const cols = frame.grid[0]?.length ?? 0;
    const cellW = rect.width / cols;
    const cellH = rect.height / rows;

    frame.grid.forEach((row, r) => {
      row.forEach((state, c) => {
        let isGlow = false;
        let glowColor = '';

        if (state === 'START') {
          isGlow = true;
          glowColor = 'rgba(16, 185, 129, 0.9)';
        } else if (state === 'END') {
          isGlow = true;
          glowColor = 'rgba(255, 0, 85, 0.9)';
        } else if (state === 'PATH') {
          isGlow = true;
          glowColor = 'rgba(255, 209, 102, 0.9)';
        } else if (state === 'FRONTIER') {
          isGlow = true;
          glowColor = 'rgba(14, 165, 233, 0.5)';
        }

        if (isGlow) {
          ctx.shadowBlur = state === 'PATH' ? 14 : 10;
          ctx.shadowColor = glowColor;
        } else {
          ctx.shadowBlur = 0;
        }

        let cellColor = stateColor[state] ?? stateColor.EMPTY;
        if (isLight) {
          if (state === 'EMPTY') cellColor = '#f2f7ff';
          else if (state === 'WALL') cellColor = '#dae2fd';
          else if (state === 'VISITED') cellColor = '#c0e8ff';
          else if (state === 'FRONTIER') cellColor = '#0ea5e9';
        }

        ctx.fillStyle = cellColor;
        ctx.beginPath();
        ctx.roundRect(
          c * cellW + 1.5,
          r * cellH + 1.5,
          Math.max(1, cellW - 3),
          Math.max(1, cellH - 3),
          Math.min(cellW / 3, 4)
        );
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      });
    });
  }, [frame]);

  return <canvas className="path-canvas" ref={ref} />;
}
