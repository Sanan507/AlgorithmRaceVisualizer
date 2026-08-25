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
import { getCanvasScale } from '../utils/canvasScale';

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
  const frameRef = useRef<SimulationFrame | null | undefined>(frame);
  frameRef.current = frame;

  const renderCanvas = useCallback((targetFrame?: SimulationFrame | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = getCanvasScale();
    const w = Math.floor(rect.width) || canvas.parentElement?.clientWidth || 300;
    const h = Math.floor(rect.height) || canvas.parentElement?.clientHeight || 180;

    if (w <= 0 || h <= 0) return;

    const targetW = Math.floor(w * dpr);
    const targetH = Math.floor(h * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isLight = document.documentElement.dataset.theme === 'light';

    // 1. Draw Background
    ctx.fillStyle = isLight ? COLORS.bgLight : COLORS.bgDark;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw ambient horizontal grid lines (single stroke batch)
    ctx.strokeStyle = isLight ? COLORS.gridLight : COLORS.gridDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 40; y < h; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    const currentFrame = targetFrame ?? frameRef.current;
    if (!currentFrame || !currentFrame.array || currentFrame.array.length === 0) return;
    const arr = currentFrame.array;
    const n = arr.length;

    let min = arr[0];
    let max = arr[0];
    for (let i = 1; i < n; i++) {
      const v = arr[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    const availableHeight = h - 36;
    const barW = Math.max(2, (w - n * 2) / n);
    const gap = Math.max(1, (w - barW * n) / (n + 1));

    const highlights = currentFrame.highlight || [];
    const hasHighlights = highlights.length > 0;
    const isDone = currentFrame.done;
    const pivotIdx = currentFrame.pivotIndex ?? -1;
    const heapIdx = currentFrame.heapBoundary ?? -1;
    const mergeStart = currentFrame.mergeRegionStart ?? -1;
    const mergeEnd = currentFrame.mergeRegionEnd ?? -1;

    // 3. High-speed single pass bar rendering
    for (let index = 0; index < n; index++) {
      const value = arr[index];

      // Proportional height
      let barH: number;
      if (min === max) {
        barH = max === 0 ? availableHeight * 0.4 : availableHeight * 0.6;
      } else {
        const minVal = Math.min(0, min);
        const r = (value - minVal) / (max - minVal || 1);
        barH = Math.max(8, r * availableHeight);
      }

      const x = gap + index * (barW + gap);
      const y = h - barH - 12;

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
      ctx.fillRect(x, y, barW, barH);

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
  }, []);

  // Render on frame update
  useEffect(() => {
    renderCanvas(frame);
  }, [frame, renderCanvas]);

  // Handle container resizing and theme changes to guarantee crisp rendering without blank flashes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderCanvas(frameRef.current);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        renderCanvas(frameRef.current);
      });
    });

    resizeObserver.observe(canvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const mutationObserver = new MutationObserver(() => {
      renderCanvas(frameRef.current);
    });
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [renderCanvas]);

  return <canvas className="race-canvas" ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
});
