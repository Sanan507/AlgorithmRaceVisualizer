import { useState, type ReactNode } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';
import { Clock, Activity, RotateCw, CheckCircle2, AlertCircle, Percent, Code, ChevronDown, ChevronUp } from 'lucide-react';

export type LaneState = 'ready' | 'running' | 'paused' | 'finished';
export type ArenaType = 'sorting' | 'searching' | 'pathfinding';

export function LaneCard({
  lane,
  frame,
  laneState = 'ready',
  arenaType,
  children
}: {
  lane: RaceLaneResponse;
  frame: SimulationFrame;
  laneState?: LaneState;
  arenaType: ArenaType;
  children: ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);
  const totalFrames = lane.frames.length;
  const progress = totalFrames > 1 ? Math.min(100, Math.round((frame.frame / (totalFrames - 1)) * 100)) : 0;

  const laneFinished = frame.done;

  let badgeState: LaneState;
  if (laneState === 'ready') {
    badgeState = 'ready';
  } else if (laneState === 'finished' || laneFinished) {
    badgeState = 'finished';
  } else if (laneState === 'paused') {
    badgeState = 'paused';
  } else {
    badgeState = 'running';
  }

  const sortingStatusLabels: Record<LaneState, string> = {
    ready: 'Ready',
    running: 'Sorting',
    paused: 'Paused',
    finished: 'Completed',
  };

  const defaultStatusLabels: Record<LaneState, string> = {
    ready: 'READY',
    running: 'RUNNING',
    paused: 'PAUSED',
    finished: 'FINISHED',
  };

  const badgeLabel = arenaType === 'sorting'
    ? sortingStatusLabels[badgeState]
    : defaultStatusLabels[badgeState];

  const opLabel = frame.steps !== undefined && frame.steps > 0 ? 'Steps' : 'Comparisons';
  const opValue = frame.comparisons || frame.steps || 0;

  let actionLabel = 'Swaps';
  let actionValue: string | number = frame.swaps ?? 0;
  let ActionIcon = RotateCw;

  const isPathfinding = arenaType === 'pathfinding';
  const isSearching = arenaType === 'searching';
  const isSorting = arenaType === 'sorting';

  if (isPathfinding) {
    actionLabel = 'Status';
    ActionIcon = CheckCircle2;
    if (frame.pathFound) {
      actionValue = 'Path Found';
    } else if (frame.done) {
      actionValue = 'No Path';
      ActionIcon = AlertCircle;
    } else if (laneState === 'ready') {
      actionValue = 'Ready';
    } else {
      actionValue = 'Exploring';
    }
  } else if (isSearching) {
    actionLabel = 'Status';
    ActionIcon = CheckCircle2;
    if (frame.foundIndex !== null && frame.foundIndex >= 0) {
      actionValue = `Found @ ${frame.foundIndex}`;
    } else if (frame.done) {
      actionValue = 'Not Found';
      ActionIcon = AlertCircle;
    } else if (laneState === 'ready') {
      actionValue = 'Ready';
    } else {
      actionValue = 'Searching';
    }
  }

  if (isSorting) {
    actionLabel = 'Status';
    actionValue = sortingStatusLabels[badgeState];
    ActionIcon = badgeState === 'finished' ? CheckCircle2 : Activity;
  }

  const pseudocodeText = lane.complexityInfo?.pseudocode ?? '';

  return (
    <article className={`lane-card ${badgeState === 'finished' ? 'done' : ''}`}>
      <header className="lane-header">
        <div>
          <strong>{lane.name}</strong>
          <span>{lane.complexity}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {pseudocodeText && (
            <button
              className="btn ghost icon-btn"
              onClick={() => setShowCode(!showCode)}
              title={showCode ? 'Hide Code Inspector' : 'Show Code Inspector'}
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              <Code size={13} /> {showCode ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
          <em className={`status-badge status-badge--${badgeState}`}>
            {badgeLabel}
          </em>
        </div>
      </header>

      <div className="lane-canvas-container">
        {children}
      </div>

      <div className="lane-progress-container" title={`Progress: ${progress}%`}>
        <div
          className={`lane-progress-bar ${badgeState === 'running' ? 'lane-progress-bar--animated' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {showCode && pseudocodeText && (
        <div className="code-inspector-box" style={{ background: 'var(--bg-card-alt, rgba(0,0,0,0.2))', padding: '10px 14px', borderRadius: '8px', margin: '8px 0', fontSize: '12px', borderLeft: '3px solid var(--accent, #6366f1)' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code size={12} /> Pseudocode Logic
          </div>
          <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', opacity: 0.9 }}>
            {pseudocodeText}
          </pre>
        </div>
      )}

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
          <strong className="metric-value">{opValue.toLocaleString()}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            <ActionIcon size={12} /> {actionLabel}
          </span>
          <strong className="metric-value">
            {actionValue}
          </strong>
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
