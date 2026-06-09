import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const colors = {
  bg: '#0f172a',
  bar: '#4b8fd4',
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
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, rect.width, rect.height);

    const arr = frame.array ?? [];
    const max = Math.max(...arr, 100);
    const barW = Math.max(3, (rect.width - arr.length) / arr.length);
    const gap = Math.max(1, (rect.width - barW * arr.length) / (arr.length + 1));
    arr.forEach((value, index) => {
      const h = (value / max) * (rect.height - 26);
      const x = gap + index * (barW + gap);
      const y = rect.height - h - 8;
      let color = colors.bar;
      if (index === frame.foundIndex) color = colors.found;
      else if (frame.highlight?.includes(index)) color = colors.current;
      else if (frame.searchPath?.includes(index)) color = colors.visit;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, 4);
      ctx.fill();
    });
  }, [frame]);

  return <canvas className="race-canvas" ref={ref} />;
}
