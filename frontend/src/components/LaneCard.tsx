import type { ReactNode } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';

export function LaneCard({
  lane,
  frame,
  children
}: {
  lane: RaceLaneResponse;
  frame: SimulationFrame;
  children: ReactNode;
}) {
  return (
    <article className={`lane-card ${frame.done ? 'done' : ''}`}>
      <header className="lane-header">
        <div>
          <strong>{lane.name}</strong>
          <span>{lane.complexity}</span>
        </div>
        <em>{frame.done ? 'Done' : 'Ready'}</em>
      </header>
      {children}
      <footer className="lane-stats">
        <span><strong>{frame.swaps}</strong> Swaps</span>
        <span><strong>{frame.comparisons || frame.steps}</strong> {frame.steps ? 'Steps' : 'Comparisons'}</span>
        <span><strong>{frame.timeMs}</strong> ms</span>
      </footer>
    </article>
  );
}
