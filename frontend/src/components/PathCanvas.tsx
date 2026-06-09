import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const stateColor: Record<string, string> = {
  EMPTY: '#1e293b',
  WALL: '#475569',
  START: '#10b981',
  END: '#ef4444',
  VISITED: '#3730a3',
  FRONTIER: '#7c3aed',
  PATH: '#f59e0b'
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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);
    const rows = frame.grid.length;
    const cols = frame.grid[0]?.length ?? 0;
    const cellW = rect.width / cols;
    const cellH = rect.height / rows;
    frame.grid.forEach((row, r) => {
      row.forEach((state, c) => {
        ctx.fillStyle = stateColor[state] ?? stateColor.EMPTY;
        ctx.beginPath();
        ctx.roundRect(c * cellW + 1, r * cellH + 1, Math.max(1, cellW - 2), Math.max(1, cellH - 2), 3);
        ctx.fill();
      });
    });
  }, [frame]);

  return <canvas className="path-canvas" ref={ref} />;
}
