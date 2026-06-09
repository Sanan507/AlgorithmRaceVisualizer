import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const colors = {
  bg: '#090b12',
  bar: '#4f46e5',
  compare: '#f59e0b',
  sorted: '#10b981',
  pivot: '#d946ef',
  heap: '#f97316',
  merge: '#06b6d4'
};

export function SortingCanvas({ frame }: { frame: SimulationFrame }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    
    // Sleek background color matching dashboard panels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const arr = frame.array ?? [];
    if (!arr.length) return;
    const max = Math.max(...arr, 100);
    const barW = Math.max(3, (rect.width - arr.length) / arr.length);
    const gap = Math.max(1, (rect.width - barW * arr.length) / (arr.length + 1));
    
    arr.forEach((value, index) => {
      const h = (value / max) * (rect.height - 24);
      const x = gap + index * (barW + gap);
      const y = rect.height - h - 12;
      
      let color = colors.bar;
      let isGlow = false;
      let glowColor = '';

      if (frame.done) {
        color = colors.sorted;
        isGlow = true;
        glowColor = 'rgba(16, 185, 129, 0.4)';
      } else if (index === frame.pivotIndex) {
        color = colors.pivot;
        isGlow = true;
        glowColor = colors.pivot;
      } else if (index === frame.heapBoundary) {
        color = colors.heap;
        isGlow = true;
        glowColor = colors.heap;
      } else if (frame.highlight?.includes(index)) {
        color = colors.compare;
        isGlow = true;
        glowColor = colors.compare;
      } else if (index >= frame.mergeRegionStart && index <= frame.mergeRegionEnd) {
        color = colors.merge;
        isGlow = true;
        glowColor = colors.merge;
      } else if (index >= frame.sortedBoundary) {
        color = colors.sorted;
      }

      // Configure premium glow shadows
      if (isGlow) {
        ctx.shadowBlur = frame.done ? 8 : 14;
        ctx.shadowColor = glowColor;
      } else {
        ctx.shadowBlur = 0;
      }

      // Create Linear Gradients for premium styling
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      if (color === colors.bar) {
        grad.addColorStop(0, '#818cf8'); // Bright Indigo top
        grad.addColorStop(1, '#4f46e5'); // Indigo base
      } else if (color === colors.sorted) {
        grad.addColorStop(0, '#34d399'); // Emerald top
        grad.addColorStop(1, '#059669');
      } else if (color === colors.pivot) {
        grad.addColorStop(0, '#f472b6'); // Pink top
        grad.addColorStop(1, '#db2777');
      } else if (color === colors.heap) {
        grad.addColorStop(0, '#fb923c'); // Orange top
        grad.addColorStop(1, '#ea580c');
      } else if (color === colors.compare) {
        grad.addColorStop(0, '#fbbf24'); // Amber top
        grad.addColorStop(1, '#d97706');
      } else if (color === colors.merge) {
        grad.addColorStop(0, '#22d3ee'); // Cyan top
        grad.addColorStop(1, '#0891b2');
      } else {
        grad.addColorStop(0, color);
        grad.addColorStop(1, color);
      }

      ctx.fillStyle = grad;
      roundRect(ctx, x, y, barW, h, Math.min(barW / 2, 5));
      ctx.shadowBlur = 0; // Reset shadow
    });
  }, [frame]);

  return <canvas className="race-canvas" ref={ref} />;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
