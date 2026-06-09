import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const colors = {
  bg: '#0f172a',
  bar: '#4b8fd4',
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
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, rect.width, rect.height);

    const arr = frame.array ?? [];
    if (!arr.length) return;
    const max = Math.max(...arr, 100);
    const barW = Math.max(3, (rect.width - arr.length) / arr.length);
    const gap = Math.max(1, (rect.width - barW * arr.length) / (arr.length + 1));
    arr.forEach((value, index) => {
      const h = (value / max) * (rect.height - 16);
      const x = gap + index * (barW + gap);
      const y = rect.height - h - 8;
      let color = colors.bar;
      if (frame.done) color = colors.sorted;
      else if (index === frame.pivotIndex) color = colors.pivot;
      else if (index === frame.heapBoundary) color = colors.heap;
      else if (frame.highlight?.includes(index)) color = colors.compare;
      else if (index >= frame.mergeRegionStart && index <= frame.mergeRegionEnd) color = colors.merge;
      else if (index >= frame.sortedBoundary) color = colors.sorted;
      ctx.fillStyle = color;
      roundRect(ctx, x, y, barW, h, 4);
    });
  }, [frame]);

  return <canvas className="race-canvas" ref={ref} />;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
