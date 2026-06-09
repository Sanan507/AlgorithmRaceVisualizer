import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const stateColor: Record<string, string> = {
  EMPTY: '#0f172a',
  WALL: '#1e293b',
  START: '#10b981',
  END: '#ef4444',
  VISITED: '#312e81',
  FRONTIER: '#4c1d95',
  PATH: '#fbbf24'
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
    
    // Draw canvas container base
    ctx.fillStyle = '#0f172a';
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
          glowColor = '#10b981';
        } else if (state === 'END') {
          isGlow = true;
          glowColor = '#ef4444';
        } else if (state === 'PATH') {
          isGlow = true;
          glowColor = '#fbbf24';
        }

        if (isGlow) {
          ctx.shadowBlur = state === 'PATH' ? 12 : 8;
          ctx.shadowColor = glowColor;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = stateColor[state] ?? stateColor.EMPTY;
        ctx.beginPath();
        // Give cells round borders for modern dashboard styling
        ctx.roundRect(
          c * cellW + 1.5,
          r * cellH + 1.5,
          Math.max(1, cellW - 3),
          Math.max(1, cellH - 3),
          4
        );
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      });
    });
  }, [frame]);

  return <canvas className="path-canvas" ref={ref} />;
}
