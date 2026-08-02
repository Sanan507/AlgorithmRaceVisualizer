import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

export interface CanvasVisualizerProps {
  array?: number[];
  frame?: SimulationFrame | null;
  height?: number;
  barColor?: string;
  compareColor?: string;
  swapColor?: string;
  sortedColor?: string;
}

export function CanvasVisualizer({
  array = [],
  frame = null,
  height = 240,
  barColor = '#818cf8',
  compareColor = '#ff9e00',
  swapColor = '#ff0055',
  sortedColor = '#10b981',
}: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0b0b1e';
    ctx.fillRect(0, 0, width, height);

    const values = frame?.array && frame.array.length > 0 ? frame.array : array;
    if (!values || values.length === 0) return;

    const count = values.length;
    const maxVal = Math.max(...values, 100);
    const padding = 1;
    const barWidth = Math.max(1, (width - padding * (count + 1)) / count);

    const activeHighlight = frame?.highlight || frame?.comparing || [];
    const isDone = frame?.done ?? false;

    for (let i = 0; i < count; i++) {
      const val = values[i];
      const barHeight = (val / maxVal) * (height - 20);
      const x = padding + i * (barWidth + padding);
      const y = height - barHeight - 10;

      let color = barColor;
      if (isDone) {
        color = sortedColor;
      } else if (activeHighlight.includes(i)) {
        color = (frame?.swaps ?? 0) > 0 ? swapColor : compareColor;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      if (barWidth > 4) {
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
      } else {
        ctx.fillRect(x, y, barWidth, barHeight);
      }
      ctx.fill();
    }
  }, [array, frame, height, barColor, compareColor, swapColor, sortedColor]);

  return (
    <div style={{ width: '100%', height: `${height}px`, overflow: 'hidden', borderRadius: '8px' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      />
    </div>
  );
}
