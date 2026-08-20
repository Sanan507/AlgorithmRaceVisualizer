/**
 * SortingCanvas.tsx
 * Ultra-high-performance HTML5 Canvas renderer for multi-lane sorting visualizers.
 * 
 * Performance Optimizations:
 * - Eliminates layout thrashing: zero getComputedStyle or getBoundingClientRect calls during frame playback.
 * - Zero GPU buffer churn: canvas resolution is cached and resized strictly on container dimension changes.
 * - High-speed bar rendering: avoids per-bar gradient allocations and shadow convolutions.
 * - Hardware sub-pixel bar scaling with crisp active element highlights.
 */

import React, { useEffect, useRef, memo, useCallback } from 'react';
import type { SimulationFrame } from '../models/types';

const COLORS = {
  bgDark: '#0b0b1e',
  bgLight: '#f2f7ff',
  gridDark: 'rgba(255, 255, 255, 0.03)',
  gridLight: 'rgba(0, 101, 145, 0.08)',
  barDark: '#4f46e5',
  barLight: '#6366f1',
  compare: '#ff9e00',
  sorted: '#10b981',
  pivot: '#f72585',
  heap: '#fb923c',
  merge: '#00f2fe',
};

interface SortingCanvasProps {
  frame: SimulationFrame;
  algorithm?: string;
}

export const SortingCanvas = memo(function SortingCanvas({
  frame,
}: SortingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef<{ width: number; height: number; dpr: number }>({ width: 0, height: 0, dpr: 1 });

  // Update canvas backing resolution strictly on container size changes
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w <= 0 || h <= 0) return;

    if (sizeRef.current.width !== w || sizeRef.current.height !== h || sizeRef.current.dpr !== dpr) {
      sizeRef.current = { width: w, height: h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
  }, []);

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

  // High-speed render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = sizeRef.current;
    if (width <= 0 || height <= 0) {
      updateCanvasDimensions();
    }

    const currentW = sizeRef.current.width;
    const currentH = sizeRef.current.height;
    if (currentW <= 0 || currentH <= 0) return;

    const isLight = document.documentElement.dataset.theme === 'light';

    // 1. Draw Background
    ctx.fillStyle = isLight ? COLORS.bgLight : COLORS.bgDark;
    ctx.fillRect(0, 0, currentW, currentH);

    // 2. Draw ambient horizontal grid lines (single stroke batch)
    ctx.strokeStyle = isLight ? COLORS.gridLight : COLORS.gridDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 40; y < currentH; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(currentW, y);
    }
    ctx.stroke();

    if (!frame || !frame.array || frame.array.length === 0) return;
    const arr = frame.array;
    const n = arr.length;

    let min = arr[0];
    let max = arr[0];
    for (let i = 1; i < n; i++) {
      const v = arr[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    const availableHeight = currentH - 36;
    const barW = Math.max(2, (currentW - n * 2) / n);
    const gap = Math.max(1, (currentW - barW * n) / (n + 1));
    const range = max - min || 1;

    const highlights = frame.highlight || [];
    const hasHighlights = highlights.length > 0;
    const isDone = frame.done;
    const pivotIdx = frame.pivotIndex ?? -1;
    const heapIdx = frame.heapBoundary ?? -1;
    const mergeStart = frame.mergeRegionStart ?? -1;
    const mergeEnd = frame.mergeRegionEnd ?? -1;

    // 3. High-speed single pass bar rendering
    for (let index = 0; index < n; index++) {
      const value = arr[index];

      // Proportional height
      let h: number;
      if (min === max) {
        h = max === 0 ? availableHeight * 0.4 : availableHeight * 0.6;
      } else {
        const minVal = Math.min(0, min);
        const r = (value - minVal) / (max - minVal || 1);
        h = Math.max(8, r * availableHeight);
      }

      const x = gap + index * (barW + gap);
      const y = currentH - h - 12;

      let fillColor = isLight ? COLORS.barLight : COLORS.barDark;
      let isSpecial = false;

      if (isDone) {
        fillColor = COLORS.sorted;
      } else if (index === pivotIdx && pivotIdx >= 0) {
        fillColor = COLORS.pivot;
        isSpecial = true;
      } else if (index === heapIdx && heapIdx >= 0) {
        fillColor = COLORS.heap;
        isSpecial = true;
      } else if (hasHighlights && highlights.includes(index)) {
        fillColor = COLORS.compare;
        isSpecial = true;
      } else if (mergeStart >= 0 && mergeEnd >= 0 && index >= mergeStart && index <= mergeEnd) {
        fillColor = COLORS.merge;
        isSpecial = true;
      }

      // Draw Bar Rect
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, barW, h);

      // Top glowing highlight cap for active elements
      if (isSpecial) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barW, 2);
      }

      // Numerical label for small/medium datasets
      if (barW >= 8 || n <= 45) {
        ctx.fillStyle = isSpecial
          ? '#ffffff'
          : isLight
          ? '#1e293b'
          : 'rgba(243, 244, 246, 0.85)';
        const fontSize = barW < 12 ? 8 : 10;
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(String(value), x + barW / 2, Math.max(10, y - 4));
      }
    }
  }, [frame, updateCanvasDimensions]);

  return <canvas className="race-canvas" ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
});
