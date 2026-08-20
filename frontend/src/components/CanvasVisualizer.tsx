/**
 * CanvasVisualizer.tsx
 * Lightweight, high-performance canvas bar visualizer.
 */

import React, { useEffect, useRef, memo, useCallback } from 'react';
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

export const CanvasVisualizer = memo(function CanvasVisualizer({
  array = [],
  frame = null,
  height = 240,
  barColor = '#818cf8',
  compareColor = '#ff9e00',
  swapColor = '#ff0055',
  sortedColor = '#10b981',
}: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef<{ width: number; height: number; dpr: number }>({ width: 0, height: 0, dpr: 1 });

  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width) || 600;
    const h = height;

    if (sizeRef.current.width !== w || sizeRef.current.height !== h || sizeRef.current.dpr !== dpr) {
      sizeRef.current = { width: w, height: h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
  }, [height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    updateCanvasDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [updateCanvasDimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: currentHeight } = sizeRef.current;
    if (width <= 0 || currentHeight <= 0) {
      updateCanvasDimensions();
    }

    const currentW = sizeRef.current.width || 600;
    const currentH = sizeRef.current.height || height;

    // Clear canvas background
    ctx.fillStyle = '#0b0b1e';
    ctx.fillRect(0, 0, currentW, currentH);

    const values = frame?.array && frame.array.length > 0 ? frame.array : array;
    if (!values || values.length === 0) return;

    const count = values.length;
    let maxVal = values[0] || 1;
    for (let i = 1; i < count; i++) {
      if (values[i] > maxVal) maxVal = values[i];
    }
    maxVal = Math.max(maxVal, 100);

    const padding = 1;
    const barWidth = Math.max(1, (currentW - padding * (count + 1)) / count);

    const activeHighlight = frame?.highlight || frame?.comparing || [];
    const isDone = frame?.done ?? false;
    const hasSwaps = (frame?.swaps ?? 0) > 0;

    for (let i = 0; i < count; i++) {
      const val = values[i];
      const barHeight = (val / maxVal) * (currentH - 20);
      const x = padding + i * (barWidth + padding);
      const y = currentH - barHeight - 10;

      let color = barColor;
      if (isDone) {
        color = sortedColor;
      } else if (activeHighlight.includes(i)) {
        color = hasSwaps ? swapColor : compareColor;
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [array, frame, height, barColor, compareColor, swapColor, sortedColor, updateCanvasDimensions]);

  return (
    <div style={{ width: '100%', height: `${height}px`, overflow: 'hidden', borderRadius: '8px' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      />
    </div>
  );
});
