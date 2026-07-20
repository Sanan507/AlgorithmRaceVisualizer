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
  merge: '#00f2fe'
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
    const max = Math.max(...arr, 100);
    const barW = Math.max(3, (rect.width - arr.length) / arr.length);
    const gap = Math.max(1, (rect.width - barW * arr.length) / (arr.length + 1));
    
    arr.forEach((value, index) => {
      const h = Math.max(4, (value / max) * (rect.height - 28));
      const x = gap + index * (barW + gap);
      const y = rect.height - h - 12;
      
      let baseColor = colors.bar;
      let isGlow = false;
      let glowColor = '';

      if (frame.done) {
        baseColor = colors.sorted;
        isGlow = true;
        glowColor = 'rgba(16, 185, 129, 0.6)';
      } else if (index === frame.pivotIndex) {
        baseColor = colors.pivot;
        isGlow = true;
        glowColor = 'rgba(247, 37, 133, 0.8)';
      } else if (index === frame.heapBoundary) {
        baseColor = colors.heap;
        isGlow = true;
        glowColor = 'rgba(251, 146, 60, 0.8)';
      } else if (frame.highlight?.includes(index)) {
        baseColor = colors.compare;
        isGlow = true;
        glowColor = 'rgba(255, 158, 0, 0.85)';
      } else if (index >= frame.mergeRegionStart && index <= frame.mergeRegionEnd) {
        baseColor = colors.merge;
        isGlow = true;
        glowColor = 'rgba(0, 242, 254, 0.65)';
      } else if (index >= frame.sortedBoundary) {
        baseColor = colors.sorted;
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
          grad.addColorStop(0, '#22d3ee'); // Arctic Cyan top
          grad.addColorStop(1, '#006591'); // Deep Ocean Blue bottom
        } else {
          grad.addColorStop(0, '#a855f7'); // Violet top
          grad.addColorStop(1, '#4f46e5'); // Deep Indigo bottom
        }
      } else if (baseColor === colors.sorted) {
        grad.addColorStop(0, '#00f5d4'); // Cyber Cyan top
        grad.addColorStop(1, '#059669'); // Emerald bottom
      } else if (baseColor === colors.pivot) {
        grad.addColorStop(0, '#ff4d6d'); // Neon Red top
        grad.addColorStop(1, '#b5179e'); // Purple bottom
      } else if (baseColor === colors.heap) {
        grad.addColorStop(0, '#ffd166'); // Amber top
        grad.addColorStop(1, '#ea580c'); // Deep Orange
      } else if (baseColor === colors.compare) {
        grad.addColorStop(0, '#ffffff'); // White cap top
        grad.addColorStop(0.3, '#ff9e00'); // Neon Yellow/Amber
        grad.addColorStop(1, '#d97706');
      } else if (baseColor === colors.merge) {
        grad.addColorStop(0, '#70e000'); // Neon Green top
        grad.addColorStop(1, '#00f2fe'); // Cyan bottom
      } else {
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, baseColor);
      }

      ctx.fillStyle = grad;
      const cornerRadius = Math.min(barW / 2, 4);
      roundRect(ctx, x, y, barW, h, cornerRadius);
      ctx.shadowBlur = 0; // Reset shadow

      // Draw top glowing highlight line on active items
      if (isGlow) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barW, 2);
      }

      // Draw text label on top of bar if array length is small
      if (arr.length <= 40 && barW >= 12) {
        ctx.fillStyle = isGlow ? '#ffffff' : 'rgba(243, 244, 246, 0.7)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(value), x + barW / 2, y - 4);
      }
    });
  }, [frame]);

  return <canvas className="race-canvas" ref={ref} />;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
