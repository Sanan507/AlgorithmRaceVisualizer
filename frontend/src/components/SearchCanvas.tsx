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
import { getCanvasScale } from '../utils/canvasScale';

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
  const frameRef = useRef<SimulationFrame | null | undefined>(frame);
  const algoRef = useRef<string | undefined>(algorithm);
  frameRef.current = frame;
  algoRef.current = algorithm;

  const renderCanvas = useCallback((targetFrame?: SimulationFrame | null, targetAlgo?: string) => {
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

    // 1. Draw background
    ctx.fillStyle = isLight ? COLORS.bgLight : COLORS.bgDark;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw horizontal ambient grid lines
    ctx.strokeStyle = isLight ? COLORS.gridLight : COLORS.gridDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 40; y < h; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    const currentFrame = targetFrame ?? frameRef.current;
    const currentAlgo = targetAlgo ?? algoRef.current;
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

    const isMultiBoundSearch =
      currentAlgo?.includes('Binary') ||
      currentAlgo?.includes('Exponential') ||
      currentAlgo?.includes('Interpolation');

    let activeProbe = -1;
    if (currentFrame.highlight && currentFrame.highlight.length === 3) {
      activeProbe = currentFrame.highlight[1];
    } else if (currentFrame.highlight && currentFrame.highlight.length === 1) {
      activeProbe = currentFrame.highlight[0];
    }

    const highlights = currentFrame.highlight || [];
    const searchPath = currentFrame.searchPath || [];
    const foundIndex = currentFrame.foundIndex;

    // 3. Single-pass bar rendering
    for (let index = 0; index < n; index++) {
      const value = arr[index];

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
      ctx.fillRect(x, y, barW, barH);

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
  }, []);

  // Render on frame update
  useEffect(() => {
    renderCanvas(frame, algorithm);
  }, [frame, algorithm, renderCanvas]);

  // Handle container resizing and theme changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderCanvas(frameRef.current, algoRef.current);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        renderCanvas(frameRef.current, algoRef.current);
      });
    });

    resizeObserver.observe(canvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const mutationObserver = new MutationObserver(() => {
      renderCanvas(frameRef.current, algoRef.current);
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
