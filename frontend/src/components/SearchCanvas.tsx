/**
 * SearchCanvas.tsx
 * High-performance HTML5 Canvas renderer for Searching Arena algorithms.
 * 
 * Performance Optimizations:
 * - Dimension caching prevents canvas re-allocations during simulation playback.
 * - Single-pass batched bar rendering without expensive runtime gradients or shadow convolutions.
 * - Hardware sub-pixel alignment for crisp target hit, probe, and search path highlights.
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
  visit: '#7c3aed',
  current: '#ff9e00',
  found: '#00f5d4',
};

interface SearchCanvasProps {
  frame?: SimulationFrame | null;
  algorithm?: string;
}

export const SearchCanvas = memo(function SearchCanvas({
  frame,
  algorithm,
}: SearchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef<{ width: number; height: number; dpr: number }>({ width: 0, height: 0, dpr: 1 });

  // Update canvas resolution only on physical layout changes
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

    // 1. Draw background
    ctx.fillStyle = isLight ? COLORS.bgLight : COLORS.bgDark;
    ctx.fillRect(0, 0, currentW, currentH);

    // 2. Draw horizontal ambient grid lines
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

    const isMultiBoundSearch =
      algorithm?.includes('Binary') ||
      algorithm?.includes('Exponential') ||
      algorithm?.includes('Interpolation');

    let activeProbe = -1;
    if (frame.highlight && frame.highlight.length === 3) {
      activeProbe = frame.highlight[1];
    } else if (frame.highlight && frame.highlight.length === 1) {
      activeProbe = frame.highlight[0];
    }

    const highlights = frame.highlight || [];
    const searchPath = frame.searchPath || [];
    const foundIndex = frame.foundIndex;

    // 3. Single-pass bar rendering
    for (let index = 0; index < n; index++) {
      const value = arr[index];

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
      let isGlow = false;

      if (index === foundIndex) {
        fillColor = COLORS.found;
        isGlow = true;
      } else if (highlights.includes(index) && (!isMultiBoundSearch || index === activeProbe)) {
        fillColor = COLORS.current;
        isGlow = true;
      } else if (searchPath.includes(index)) {
        fillColor = COLORS.visit;
      }

      // Bar rect
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, barW, h);

      // Top glowing accent cap
      if (isGlow) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barW, 2);
      }

      // Value label
      if (barW >= 8 || n <= 45) {
        ctx.fillStyle = isGlow
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
  }, [frame, algorithm, updateCanvasDimensions]);

  return <canvas className="race-canvas" ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
});
