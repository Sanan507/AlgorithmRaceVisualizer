import type { ReactNode } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';
import { Clock, Activity, RotateCw, CheckCircle2, AlertCircle, Percent } from 'lucide-react';

export function LaneCard({
  lane,
  frame,
  children
}: {
  lane: RaceLaneResponse;
  frame: SimulationFrame;
  children: ReactNode;
}) {
  const totalFrames = lane.frames.length;
  const progress = totalFrames > 1 ? Math.min(100, Math.round((frame.frame / (totalFrames - 1)) * 100)) : 0;

  // Determine operations label & value
  const opLabel = frame.steps !== undefined && frame.steps > 0 ? 'Steps' : 'Comparisons';
  const opValue = frame.comparisons || frame.steps || 0;

  // Determine action status based on simulation content
  let actionLabel = 'Swaps';
  let actionValue: string | number = frame.swaps ?? 0;
  let ActionIcon = RotateCw;

  // Check if this is pathfinding (has grid state)
  const isPathfinding = frame.grid !== undefined && frame.grid !== null;
  // Check if this is searching (has foundIndex property)
  const isSearching = frame.foundIndex !== undefined;

  if (isPathfinding) {
    actionLabel = 'Status';
    ActionIcon = CheckCircle2;
    if (frame.pathFound) {
      actionValue = 'Found';
    } else if (frame.done) {
      actionValue = 'No Path';
      ActionIcon = AlertCircle;
    } else {
      actionValue = 'Searching';
    }
  } else if (isSearching) {
    actionLabel = 'Status';
    ActionIcon = CheckCircle2;
    if (frame.foundIndex !== null && frame.foundIndex >= 0) {
      actionValue = `Found @ ${frame.foundIndex}`;
    } else if (frame.done) {
      actionValue = 'Not Found';
      ActionIcon = AlertCircle;
    } else {
      actionValue = 'Searching';
    }
  }

  return (
    <article className={`lane-card ${frame.done ? 'done' : ''}`}>
      <header className="lane-header">
        <div>
          <strong>{lane.name}</strong>
          <span>{lane.complexity}</span>
        </div>
        <em>{frame.done ? 'Done' : 'Running'}</em>
      </header>

      <div className="lane-canvas-container">
        {children}
      </div>

      <div className="lane-progress-container" title={`Progress: ${progress}%`}>
        <div className="lane-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <footer className="lane-stats-grid">
        <div className="metric-card">
          <span className="metric-label">
            <Clock size={12} /> Time
          </span>
          <strong className="metric-value">{frame.timeMs} ms</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            <Activity size={12} /> {opLabel}
          </span>
          <strong className="metric-value">{opValue}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            <ActionIcon size={12} /> {actionLabel}
          </span>
          <strong className="metric-value">{actionValue}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            <Percent size={12} /> Progress
          </span>
          <strong className="metric-value">{progress}%</strong>
        </div>
      </footer>
    </article>
  );
}
