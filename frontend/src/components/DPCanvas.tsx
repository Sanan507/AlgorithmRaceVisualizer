/**
 * DPCanvas.tsx
 * High-performance Dynamic Programming 2D state matrix table renderer.
 * 
 * Performance Optimizations:
 * - O(1) cell lookup indexing: replaces O(N*M*D) nested linear searches with pre-indexed Set/Map lookups.
 * - React.memo component wrapper to prevent redundant re-renders.
 * - Sub-millisecond table layout updates during rapid step walkthroughs.
 */

import React, { useMemo, memo } from 'react';
import { HelpCircle, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export interface DPStep {
  matrix: number[][];
  activeRow: number;
  activeCol: number;
  dependentCells?: { row: number; col: number; label?: string }[];
  backtrackPath?: { row: number; col: number }[];
  explanation: string;
  codeLine: number;
  decisionFormula?: string;
  resultValue?: string | number;
}

interface DPCanvasProps {
  rowLabels: string[];
  colLabels: string[];
  step: DPStep | null;
  algoType: 'knapsack' | 'lcs' | 'edit_distance';
}

export const DPCanvas = memo(function DPCanvas({
  rowLabels,
  colLabels,
  step,
  algoType,
}: DPCanvasProps) {
  // Pre-index dependent and backtrack cells for instantaneous O(1) lookups per cell
  const { depMap, backtrackSet } = useMemo(() => {
    const dMap = new Map<string, string | undefined>();
    const bSet = new Set<string>();

    if (step) {
      if (step.dependentCells) {
        for (let i = 0; i < step.dependentCells.length; i++) {
          const cell = step.dependentCells[i];
          dMap.set(`${cell.row}:${cell.col}`, cell.label);
        }
      }
      if (step.backtrackPath) {
        for (let i = 0; i < step.backtrackPath.length; i++) {
          const cell = step.backtrackPath[i];
          bSet.add(`${cell.row}:${cell.col}`);
        }
      }
    }

    return { depMap: dMap, backtrackSet: bSet };
  }, [step]);

  if (!step) {
    return (
      <div className="dp-canvas-placeholder flex-center">
        <HelpCircle size={48} className="text-muted" />
        <p>Select an algorithm and click Start Simulation to generate the DP matrix table.</p>
      </div>
    );
  }

  const { matrix, activeRow, activeCol, decisionFormula, explanation } = step;

  return (
    <div className="dp-canvas-container">
      {/* Decision Formula Callout */}
      {decisionFormula && (
        <div className="dp-formula-banner">
          <span className="formula-badge">Active State Formula</span>
          <code className="formula-text">{decisionFormula}</code>
        </div>
      )}

      {/* 2D Matrix Table Grid */}
      <div className="dp-grid-wrapper">
        <table className="dp-matrix-table">
          <thead>
            <tr>
              <th className="dp-corner-header">{algoType === 'knapsack' ? 'Items \\ Cap' : 'S1 \\ S2'}</th>
              {colLabels.map((col, idx) => (
                <th
                  key={idx}
                  className={`dp-col-header ${activeCol === idx ? 'dp-header-highlight' : ''}`}
                >
                  {col}
                  <span className="dp-header-idx">[{idx}]</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rIdx) => (
              <tr key={rIdx}>
                <th className={`dp-row-header ${activeRow === rIdx ? 'dp-header-highlight' : ''}`}>
                  {rowLabels[rIdx] || `[${rIdx}]`}
                  <span className="dp-header-idx">[{rIdx}]</span>
                </th>
                {row.map((val, cIdx) => {
                  const cellKey = `${rIdx}:${cIdx}`;
                  const isActive = activeRow === rIdx && activeCol === cIdx;
                  const isDep = depMap.has(cellKey);
                  const inBacktrack = backtrackSet.has(cellKey);
                  const depLabel = depMap.get(cellKey);

                  let cellClass = 'dp-cell';
                  if (isActive) cellClass += ' dp-cell-active';
                  else if (inBacktrack) cellClass += ' dp-cell-backtrack';
                  else if (isDep) cellClass += ' dp-cell-dependent';

                  return (
                    <td key={cIdx} className={cellClass}>
                      <div className="dp-cell-content">
                        <span className="dp-cell-value">{val < 0 ? '-' : val}</span>
                        {depLabel && <span className="dp-dep-tag">{depLabel}</span>}
                        {isActive && <div className="dp-active-pulse" />}
                        {inBacktrack && <CheckCircle2 className="dp-backtrack-icon" size={12} />}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live Context & Compact Inline Legend */}
      <div className="dp-canvas-footer-compact">
        <div className="dp-explanation-card">
          <ArrowDownRight className="text-accent" size={16} />
          <p className="explanation-text">{explanation}</p>
        </div>
        <div className="dp-legend-inline">
          <span className="dp-legend-chip"><span className="dp-legend-dot box-active" /> Active</span>
          <span className="dp-legend-chip"><span className="dp-legend-dot box-dep" /> Source</span>
          <span className="dp-legend-chip"><span className="dp-legend-dot box-backtrack" /> Optimal Path</span>
        </div>
      </div>
    </div>
  );
});
