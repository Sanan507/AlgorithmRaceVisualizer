import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const colors = {
  bg: '#0b0b1e',
  gridLine: 'rgba(255, 255, 255, 0.03)',
  bar: '#4f46e5',
  compare: '#ff9e00',
  sorted: '#10b981',
  pivot: '#f72585',
  heap: '#fb923c',
  merge: '#00f2fe',
};

export function SortingCanvas({ frame }: { frame: SimulationFrame; algorithm?: string }) {
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

    const isLight = document.documentElement.dataset.theme === 'light';

    // Canvas background
    ctx.fillStyle = isLight ? '#f2f7ff' : colors.bg;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw ambient horizontal grid lines
    ctx.strokeStyle = isLight ? 'rgba(0, 101, 145, 0.08)' : colors.gridLine;
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let y = gridSpacing; y < rect.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    const arr = frame.array ?? [];
    if (!arr.length) return;

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const availableHeight = rect.height - 36; // Space for bar top text and bottom padding

    const barW = Math.max(3, (rect.width - arr.length * 2) / arr.length);
    const gap = Math.max(1, (rect.width - barW * arr.length) / (arr.length + 1));

    arr.forEach((value, index) => {
      // Calculate bar height proportionally for all edge cases (single value, zeros, duplicates)
      let h: number;
      if (min === max) {
        h = max === 0 ? availableHeight * 0.4 : availableHeight * 0.6;
      } else {
        const minVal = Math.min(0, min);
        const r = (value - minVal) / (max - minVal);
        h = Math.max(12, r * availableHeight);
      }

      const x = gap + index * (barW + gap);
      const y = rect.height - h - 12;

      let baseColor = colors.bar;
      let isGlow = false;
      let glowColor = '';

      if (frame.done) {
        baseColor = colors.sorted;
        isGlow = true;
        glowColor = 'rgba(16, 185, 129, 0.6)';
      } else if (index === frame.pivotIndex && frame.pivotIndex >= 0) {
        baseColor = colors.pivot;
        isGlow = true;
        glowColor = 'rgba(247, 37, 133, 0.8)';
      } else if (index === frame.heapBoundary && frame.heapBoundary >= 0) {
        baseColor = colors.heap;
        isGlow = true;
        glowColor = 'rgba(251, 146, 60, 0.8)';
      } else if (frame.highlight?.includes(index)) {
        baseColor = colors.compare;
        isGlow = true;
        glowColor = 'rgba(255, 158, 0, 0.85)';
      } else if (
        frame.mergeRegionStart >= 0 &&
        frame.mergeRegionEnd >= 0 &&
        index >= frame.mergeRegionStart &&
        index <= frame.mergeRegionEnd
      ) {
        baseColor = colors.merge;
        isGlow = true;
        glowColor = 'rgba(0, 242, 254, 0.65)';
      }

      if (isGlow) {
        ctx.shadowBlur = frame.done ? 10 : 16;
        ctx.shadowColor = glowColor;
      } else {
        ctx.shadowBlur = 0;
      }

      // Linear Gradient for bars
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      if (baseColor === colors.bar) {
        if (isLight) {
          grad.addColorStop(0, '#818cf8');
          grad.addColorStop(1, '#3730a3');
        } else {
          grad.addColorStop(0, '#818cf8');
          grad.addColorStop(1, '#4f46e5');
        }
      } else if (baseColor === colors.sorted) {
        grad.addColorStop(0, '#00f5d4');
        grad.addColorStop(1, '#059669');
      } else if (baseColor === colors.pivot) {
        grad.addColorStop(0, '#ff4d6d');
        grad.addColorStop(1, '#b5179e');
      } else if (baseColor === colors.heap) {
        grad.addColorStop(0, '#ffd166');
        grad.addColorStop(1, '#ea580c');
      } else if (baseColor === colors.compare) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ff9e00');
        grad.addColorStop(1, '#d97706');
      } else if (baseColor === colors.merge) {
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
      } else {
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, baseColor);
      }

      ctx.fillStyle = grad;
      const cornerRadius = Math.min(barW / 2, 4);
      roundRect(ctx, x, y, barW, h, cornerRadius);
      ctx.shadowBlur = 0;

      // Draw top glowing highlight line on active items
      if (isGlow) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barW, 2);
      }

      // Draw text label on top of bar if space permits
      if (barW >= 6 || arr.length <= 60) {
        if (isLight) {
          ctx.fillStyle = isGlow ? '#006591' : '#131b2e';
        } else {
          ctx.fillStyle = isGlow ? '#ffffff' : 'rgba(243, 244, 246, 0.85)';
        }
        const fontSize = barW < 12 ? 8 : 10;
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(String(value), x + barW / 2, Math.max(10, y - 4));
      }
    });
  }, [frame]);

  return <canvas className="race-canvas" ref={ref} />;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
