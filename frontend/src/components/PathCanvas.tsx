import { useEffect, useRef, useState } from 'react';
import type { SimulationFrame } from '../models/types';

const stateColor: Record<string, string> = {
  EMPTY: '#0b0b1e',
  WALL: '#1e1e31',
  START: '#10b981',
  END: '#ff0055',
  VISITED: '#1e1b4b',
  FRONTIER: '#6366f1',
  PATH: '#ffd166',
  VISITED_FORWARD: '#1e1b4b',
  VISITED_BACKWARD: '#4c1d95',
  FRONTIER_FORWARD: '#6366f1',
  FRONTIER_BACKWARD: '#a855f7'
};

export function PathCanvas({
  frame,
  editable = false,
  onGridClick
}: {
  frame: SimulationFrame;
  editable?: boolean;
  onGridClick?: (row: number, col: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const lastDrawnCellRef = useRef<string | null>(null);
  const [canvasSizeVersion, setCanvasSizeVersion] = useState(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      setCanvasSizeVersion((currentVersion) => currentVersion + 1);
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !frame || !frame.grid) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    
    const isLight = document.documentElement.dataset.theme === 'light';
    
    ctx.fillStyle = isLight ? '#f2f7ff' : '#0b0b1e';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    const rows = frame.grid.length;
    const cols = frame.grid[0]?.length ?? 0;
    const cellW = rect.width / cols;
    const cellH = rect.height / rows;

    frame.grid.forEach((row, r) => {
      row.forEach((state, c) => {
        let isGlow = false;
        let glowColor = '';

        if (state === 'START') {
          isGlow = true;
          glowColor = 'rgba(16, 185, 129, 0.9)';
        } else if (state === 'END') {
          isGlow = true;
          glowColor = 'rgba(255, 0, 85, 0.9)';
        } else if (state === 'PATH') {
          isGlow = true;
          glowColor = 'rgba(255, 209, 102, 0.9)';
        } else if (state === 'FRONTIER') {
          isGlow = true;
          glowColor = 'rgba(14, 165, 233, 0.5)';
        } else if (state === 'FRONTIER_FORWARD') {
          isGlow = true;
          glowColor = 'rgba(14, 165, 233, 0.5)';
        } else if (state === 'FRONTIER_BACKWARD') {
          isGlow = true;
          glowColor = 'rgba(168, 85, 247, 0.5)';
        }

        if (isGlow) {
          ctx.shadowBlur = state === 'PATH' ? 14 : 10;
          ctx.shadowColor = glowColor;
        } else {
          ctx.shadowBlur = 0;
        }

        let cellColor = stateColor[state] ?? stateColor.EMPTY;
        if (isLight) {
          if (state === 'EMPTY') cellColor = '#f2f7ff';
          else if (state === 'WALL') cellColor = '#dae2fd';
          else if (state === 'VISITED' || state === 'VISITED_FORWARD') cellColor = '#c0e8ff';
          else if (state === 'VISITED_BACKWARD') cellColor = '#e9d5ff';
          else if (state === 'FRONTIER' || state === 'FRONTIER_FORWARD') cellColor = '#0ea5e9';
          else if (state === 'FRONTIER_BACKWARD') cellColor = '#a855f7';
        }

        ctx.fillStyle = cellColor;
        ctx.beginPath();
        ctx.roundRect(
          c * cellW + 1.5,
          r * cellH + 1.5,
          Math.max(1, cellW - 3),
          Math.max(1, cellH - 3),
          Math.min(cellW / 3, 4)
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    });
  }, [frame, canvasSizeVersion]);

  function getGridPos(clientX: number, clientY: number) {
    const canvas = ref.current;
    if (!canvas || !frame.grid) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const rows = frame.grid.length;
    const cols = frame.grid[0]?.length ?? 0;
    const col = Math.floor((x / rect.width) * cols);
    const row = Math.floor((y / rect.height) * rows);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      return { row, col };
    }
    return null;
  }

  function drawAt(clientX: number, clientY: number) {
    const pos = getGridPos(clientX, clientY);
    if (!pos) return;

    const cellKey = `${pos.row}:${pos.col}`;
    if (cellKey === lastDrawnCellRef.current) return;

    lastDrawnCellRef.current = cellKey;
    onGridClick?.(pos.row, pos.col);
  }

  function stopDrawing() {
    drawingRef.current = false;
    activePointerIdRef.current = null;
    lastDrawnCellRef.current = null;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!editable || !onGridClick) return;
    event.preventDefault();
    drawingRef.current = true;
    activePointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawAt(event.clientX, event.clientY);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!editable || !onGridClick || !drawingRef.current || activePointerIdRef.current !== event.pointerId) return;
    event.preventDefault();
    drawAt(event.clientX, event.clientY);
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activePointerIdRef.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    stopDrawing();
  }

  return (
    <canvas
      className="path-canvas"
      ref={ref}
      style={{ cursor: editable ? 'crosshair' : 'default' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={stopDrawing}
    />
  );
}
