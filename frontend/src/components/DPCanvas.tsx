import React from 'react';
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

export const DPCanvas: React.FC<DPCanvasProps> = ({
  rowLabels,
  colLabels,
  step,
  algoType,
}) => {
  if (!step) {
    return (
      <div className="dp-canvas-placeholder flex-center">
        <HelpCircle size={48} className="text-muted" />
        <p>Select an algorithm and click Start Simulation to generate the DP matrix table.</p>
      </div>
    );
  }

  const { matrix, activeRow, activeCol, dependentCells = [], backtrackPath = [], decisionFormula, explanation } = step;

  const isDependent = (r: number, c: number) => {
    return dependentCells.some((cell) => cell.row === r && cell.col === c);
  };

  const isBacktrack = (r: number, c: number) => {
    return backtrackPath.some((cell) => cell.row === r && cell.col === c);
  };

  const getCellLabel = (r: number, c: number) => {
    const dep = dependentCells.find((cell) => cell.row === r && cell.col === c);
    return dep?.label;
  };

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
                  const isActive = activeRow === rIdx && activeCol === cIdx;
                  const dep = isDependent(rIdx, cIdx);
                  const inBacktrack = isBacktrack(rIdx, cIdx);
                  const depLabel = getCellLabel(rIdx, cIdx);

                  let cellClass = 'dp-cell';
                  if (isActive) cellClass += ' dp-cell-active';
                  else if (inBacktrack) cellClass += ' dp-cell-backtrack';
                  else if (dep) cellClass += ' dp-cell-dependent';

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
};
