import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const colors = {
  bg: '#0b0b1e',
  gridLine: 'rgba(255, 255, 255, 0.03)',
  bar: '#4f46e5',
  visit: '#7c3aed',
  current: '#ff9e00',
  found: '#00f5d4',
  eliminated: '#475569'
};

export function SearchCanvas({ frame, algorithm }: { frame?: SimulationFrame | null; algorithm?: string }) {
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
    
    ctx.fillStyle = isLight ? '#f2f7ff' : colors.bg;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw ambient horizontal grid lines
    ctx.strokeStyle = isLight ? 'rgba(0, 101, 145, 0.08)' : colors.gridLine;
    ctx.lineWidth = 1;
    for (let y = 40; y < rect.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    if (!frame) return;

    const arr = frame.array ?? [];
    if (!arr.length) return;
    const max = Math.max(...arr, 100);
    const barW = Math.max(3, (rect.width - arr.length) / arr.length);
    const gap = Math.max(1, (rect.width - barW * arr.length) / (arr.length + 1));

    const isBinarySearch = algorithm?.includes('Binary');
    let low = 0;
    let mid = -1;
    let high = arr.length - 1;

    if (isBinarySearch && frame.highlight && frame.highlight.length === 3) {
      [low, mid, high] = frame.highlight;
    }
    
    arr.forEach((value, index) => {
      const h = Math.max(4, (value / max) * (rect.height - 32));
      const x = gap + index * (barW + gap);
      const y = rect.height - h - 12;
      
      let baseColor = colors.bar;
      let isGlow = false;
      let glowColor = '';
      let isEliminated = false;

      if (isBinarySearch && frame.highlight && frame.highlight.length === 3 && !frame.done) {
        if (index < low || index > high) {
          isEliminated = true;
        }
      }

      if (index === frame.foundIndex) {
        baseColor = colors.found;
        isGlow = true;
        glowColor = 'rgba(0, 245, 212, 0.9)';
      } else if (frame.highlight?.includes(index) && (!isBinarySearch || index === mid)) {
        baseColor = colors.current;
        isGlow = true;
        glowColor = 'rgba(255, 158, 0, 0.9)';
      } else if (isEliminated) {
        baseColor = colors.eliminated;
      } else if (frame.searchPath?.includes(index)) {
        baseColor = colors.visit;
      }

      if (isGlow) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = glowColor;
      } else {
        ctx.shadowBlur = 0;
      }

      // Linear Gradients
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      if (baseColor === colors.bar) {
        if (isLight) {
          grad.addColorStop(0, '#818cf8'); // Soft Royal Indigo top
          grad.addColorStop(1, '#3730a3'); // Deep Indigo bottom
        } else {
          grad.addColorStop(0, '#818cf8'); // Indigo top
          grad.addColorStop(1, '#4f46e5'); // Deep Indigo bottom
        }
      } else if (baseColor === colors.visit) {
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(1, '#7c3aed');
      } else if (baseColor === colors.current) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ff9e00');
        grad.addColorStop(1, '#d97706');
      } else if (baseColor === colors.found) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#00f5d4');
        grad.addColorStop(1, '#059669');
      } else if (baseColor === colors.eliminated) {
        if (isLight) {
          grad.addColorStop(0, '#94a3b8'); // Muted Slate Gray top
          grad.addColorStop(1, '#64748b'); // Darker Slate bottom
        } else {
          grad.addColorStop(0, '#475569');
          grad.addColorStop(1, '#1e293b');
        }
      } else {
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, baseColor);
      }

      ctx.fillStyle = grad;
      ctx.globalAlpha = isEliminated ? 0.45 : 1.0;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, Math.min(barW / 2, 4));
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Draw top glowing highlight line on active items
      if (isGlow) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barW, 2);
      }

      // Draw text label on top of bar only if bars are wide enough to prevent overlap
      if (barW >= 14 || arr.length <= 20) {
        if (isLight) {
          ctx.fillStyle = isGlow ? '#006591' : '#131b2e';
        } else {
          ctx.fillStyle = isGlow ? '#ffffff' : 'rgba(243, 244, 246, 0.85)';
        }
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(value), x + barW / 2, y - 4);
      }
    });
  }, [frame, algorithm]);

  return <canvas className="race-canvas" ref={ref} />;
}
