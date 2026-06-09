import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const colors = {
  bg: '#0f172a',
  bar: '#4f46e5',
  visit: '#7c3aed',
  current: '#f59e0b',
  found: '#10b981'
};

export function SearchCanvas({ frame }: { frame: SimulationFrame }) {
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
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const arr = frame.array ?? [];
    if (!arr.length) return;
    const max = Math.max(...arr, 100);
    const barW = Math.max(3, (rect.width - arr.length) / arr.length);
    const gap = Math.max(1, (rect.width - barW * arr.length) / (arr.length + 1));
    
    arr.forEach((value, index) => {
      const h = (value / max) * (rect.height - 30);
      const x = gap + index * (barW + gap);
      const y = rect.height - h - 12;
      
      let color = colors.bar;
      let isGlow = false;
      let glowColor = '';

      if (index === frame.foundIndex) {
        color = colors.found;
        isGlow = true;
        glowColor = colors.found;
      } else if (frame.highlight?.includes(index)) {
        color = colors.current;
        isGlow = true;
        glowColor = colors.current;
      } else if (frame.searchPath?.includes(index)) {
        color = colors.visit;
      }

      if (isGlow) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = glowColor;
      } else {
        ctx.shadowBlur = 0;
      }

      // Create Linear Gradients for premium styling
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      if (color === colors.bar) {
        grad.addColorStop(0, '#818cf8'); // Indigo top
        grad.addColorStop(1, '#4f46e5');
      } else if (color === colors.visit) {
        grad.addColorStop(0, '#a78bfa'); // Purple top
        grad.addColorStop(1, '#7c3aed');
      } else if (color === colors.current) {
        grad.addColorStop(0, '#fbbf24'); // Amber top
        grad.addColorStop(1, '#d97706');
      } else if (color === colors.found) {
        grad.addColorStop(0, '#34d399'); // Emerald top
        grad.addColorStop(1, '#059669');
      } else {
        grad.addColorStop(0, color);
        grad.addColorStop(1, color);
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, Math.min(barW / 2, 5));
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow
    });
  }, [frame]);

  return <canvas className="race-canvas" ref={ref} />;
}
