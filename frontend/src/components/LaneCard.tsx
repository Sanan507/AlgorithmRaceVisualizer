/**
 * LaneCard.tsx
 * High-performance contender lane container card with live telemetry HUD.
 * 
 * Performance Optimizations:
 * - Wrapped in React.memo to prevent unnecessary DOM updates.
 * - Memoized metric and status calculations.
 * - Sub-millisecond layout stability during high-frequency simulation playback.
 */

import React, { useState, useMemo, memo, type ReactNode } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';
import { Clock, Activity, RotateCw, CheckCircle2, AlertCircle, Percent, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { PseudocodeViewer } from './PseudocodeViewer';

export type LaneState = 'ready' | 'running' | 'paused' | 'finished';
export type ArenaType = 'sorting' | 'searching' | 'pathfinding';

interface LaneCardProps {
  lane: RaceLaneResponse;
  frame: SimulationFrame;
  laneState?: LaneState;
  arenaType: ArenaType;
  weights?: number[][] | null;
  children: ReactNode;
}

const SORTING_STATUS_LABELS: Record<LaneState, string> = {
  ready: 'Ready',
  running: 'Sorting',
  paused: 'Paused',
  finished: 'Completed',
};

const DEFAULT_STATUS_LABELS: Record<LaneState, string> = {
  ready: 'READY',
  running: 'RUNNING',
  paused: 'PAUSED',
  finished: 'FINISHED',
};

export const LaneCard = memo(function LaneCard({
  lane,
  frame,
  laneState = 'ready',
  arenaType,
  weights,
  children,
}: LaneCardProps) {
  const [showCode, setShowCode] = useState(false);

  const totalFrames = lane?.frames?.length ?? 0;
  const frameNum = frame?.frame ?? 0;
  const progress = totalFrames > 1 ? Math.min(100, Math.round((frameNum / (totalFrames - 1)) * 100)) : 0;

  const laneFinished = frame?.done ?? false;

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

  const badgeLabel = arenaType === 'sorting'
    ? SORTING_STATUS_LABELS[badgeState]
    : DEFAULT_STATUS_LABELS[badgeState];

  const isPathfinding = arenaType === 'pathfinding';
  const isSearching = arenaType === 'searching';
  const isSorting = arenaType === 'sorting';

  let opLabel = 'Comparisons';
  let opValue = frame?.comparisons || 0;

  if (isPathfinding) {
    opLabel = 'Explored Steps';
    opValue = frame?.steps || 0;
  } else if (isSearching) {
    opLabel = 'Comparisons';
    opValue = frame?.comparisons || 0;
  }

  let actionLabel = 'Swaps';
  let actionValue: string | number = frame?.swaps ?? 0;
  let ActionIcon = RotateCw;

  if (isPathfinding) {
    actionLabel = 'Path Result';
    ActionIcon = CheckCircle2;
    if (frame?.pathFound && frame?.path && frame.path.length > 0) {
      const pSteps = frame.path.length;
      const pCost = weights
        ? frame.path.reduce((sum, pt) => sum + (weights?.[pt.row]?.[pt.col] ?? 1), 0)
        : pSteps;
      actionValue = pCost !== pSteps ? `Cost: ${pCost} (${pSteps} steps)` : `${pSteps} steps`;
    } else if (frame?.done) {
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
    if (frame?.foundIndex !== null && frame?.foundIndex !== undefined && frame.foundIndex >= 0) {
      actionValue = `Found @ ${frame.foundIndex}`;
    } else if (frame?.done) {
      actionValue = 'Not Found';
      ActionIcon = AlertCircle;
    } else if (laneState === 'ready') {
      actionValue = 'Ready';
    } else {
      actionValue = 'Searching';
    }
  } else if (isSorting) {
    actionLabel = 'Status';
    actionValue = SORTING_STATUS_LABELS[badgeState];
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
              onClick={() => setShowCode((prev) => !prev)}
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
        <div style={{ margin: '8px 0' }}>
          <PseudocodeViewer
            algorithmName={lane.name}
            pseudocode={pseudocodeText}
            currentFrame={frame}
            onToggleCollapse={() => setShowCode(false)}
          />
        </div>
      )}

      <footer className="lane-stats-grid">
        <div className="metric-card">
          <span className="metric-label">
            <Clock size={12} /> Time
          </span>
          <strong className="metric-value tabular-nums">{frame.timeMs} ms</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            <Activity size={12} /> {opLabel}
          </span>
          <strong className="metric-value tabular-nums">{opValue.toLocaleString()}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            <ActionIcon size={12} /> {actionLabel}
          </span>
          <strong className="metric-value tabular-nums" style={{ fontSize: '0.8rem' }}>
            {actionValue}
          </strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            <Percent size={12} /> Progress
          </span>
          <strong className="metric-value tabular-nums">{progress}%</strong>
        </div>
      </footer>
    </article>
  );
});
