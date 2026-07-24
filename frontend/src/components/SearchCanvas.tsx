import { useEffect, useRef } from 'react';
import type { SimulationFrame } from '../models/types';

const colors = {
  bg: '#0b0b1e',
  gridLine: 'rgba(255, 255, 255, 0.03)',
  bar: '#4f46e5',
  visit: '#7c3aed',
  current: '#ff9e00',
  found: '#00f5d4',
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

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const availableHeight = rect.height - 36; // Space for text and bottom padding

    const barW = Math.max(3, (rect.width - arr.length * 2) / arr.length);
    const gap = Math.max(1, (rect.width - barW * arr.length) / (arr.length + 1));

    const isMultiBoundSearch = algorithm?.includes('Binary') || algorithm?.includes('Exponential') || algorithm?.includes('Interpolation');
    let activeProbe = -1;

    if (frame.highlight && frame.highlight.length === 3) {
      activeProbe = frame.highlight[1];
    } else if (frame.highlight && frame.highlight.length === 1) {
      activeProbe = frame.highlight[0];
    }

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

      if (index === frame.foundIndex) {
        baseColor = colors.found;
        isGlow = true;
        glowColor = 'rgba(0, 245, 212, 0.9)';
      } else if (frame.highlight?.includes(index) && (!isMultiBoundSearch || index === activeProbe)) {
        baseColor = colors.current;
        isGlow = true;
        glowColor = 'rgba(255, 158, 0, 0.9)';
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
          grad.addColorStop(0, '#818cf8');
          grad.addColorStop(1, '#3730a3');
        } else {
          grad.addColorStop(0, '#818cf8');
          grad.addColorStop(1, '#4f46e5');
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
      } else {
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, baseColor);
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, Math.min(barW / 2, 4));
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw top glowing highlight line on active items
      if (isGlow) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barW, 2);
      }

      // Draw text label on top of bar for easy target checking (both custom and random datasets up to 60 items)
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
  }, [frame, algorithm]);

  return <canvas className="race-canvas" ref={ref} />;
}
