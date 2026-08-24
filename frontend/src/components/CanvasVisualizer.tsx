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
  const frameRef = useRef<SimulationFrame | null | undefined>(frame);
  const arrayRef = useRef<number[]>(array);
  frameRef.current = frame;
  arrayRef.current = array;

  const renderCanvas = useCallback((targetFrame?: SimulationFrame | null, targetArray?: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width) || canvas.parentElement?.clientWidth || 600;
    const h = height;

    if (w <= 0 || h <= 0) return;

    const targetW = Math.floor(w * dpr);
    const targetH = Math.floor(h * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear canvas background
    ctx.fillStyle = '#0b0b1e';
    ctx.fillRect(0, 0, w, h);

    const currentF = targetFrame ?? frameRef.current;
    const currentA = targetArray ?? arrayRef.current;
    const values = currentF?.array && currentF.array.length > 0 ? currentF.array : currentA;
    if (!values || values.length === 0) return;

    const count = values.length;
    let maxVal = values[0] || 1;
    for (let i = 1; i < count; i++) {
      if (values[i] > maxVal) maxVal = values[i];
    }
    maxVal = Math.max(maxVal, 100);

    const padding = 1;
    const barWidth = Math.max(1, (w - padding * (count + 1)) / count);

    const activeHighlight = currentF?.highlight || currentF?.comparing || [];
    const isDone = currentF?.done ?? false;
    const hasSwaps = (currentF?.swaps ?? 0) > 0;

    for (let i = 0; i < count; i++) {
      const val = values[i];
      const barHeight = (val / maxVal) * (h - 20);
      const x = padding + i * (barWidth + padding);
      const y = h - barHeight - 10;

      let color = barColor;
      if (isDone) {
        color = sortedColor;
      } else if (activeHighlight.includes(i)) {
        color = hasSwaps ? swapColor : compareColor;
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [height, barColor, compareColor, swapColor, sortedColor]);

  // Render on frame or array update
  useEffect(() => {
    renderCanvas(frame, array);
  }, [frame, array, renderCanvas]);

  // Handle container resizing and theme changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderCanvas(frameRef.current, arrayRef.current);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        renderCanvas(frameRef.current, arrayRef.current);
      });
    });

    resizeObserver.observe(canvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [renderCanvas]);

  return (
    <div style={{ width: '100%', height: `${height}px`, overflow: 'hidden', borderRadius: '8px' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      />
    </div>
  );
});
