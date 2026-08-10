import { useState, useMemo } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';
import { Bot, BrainCircuit, Layers, HelpCircle, Zap, Code } from 'lucide-react';
import { algorithmMetadata } from '../data/algorithmMetadata';
import { fallbackCatalog } from '../data/fallbackCatalog';

export interface StepExplanationCardProps {
  lanes?: RaceLaneResponse[];
  activeFrames?: (Partial<SimulationFrame> | null | undefined)[];
  frameIndex: number;
  totalFrames: number;
  algorithmName?: string;
  frame?: Partial<SimulationFrame> | null;
}

type DetailMode = 'none' | 'why' | 'complexity';

interface ComplexityDetails {
  best: string | null;
  average: string | null;
  worst: string | null;
  space: string;
  timeSummary: string | null;
  theory: string | null;
}

/** Resolves rich complexity breakdown from fallbackCatalog or algorithmMetadata */
function getComplexityDetails(algoName: string): ComplexityDetails | null {
  const cat = fallbackCatalog.complexity?.[algoName];
  const meta = algorithmMetadata[algoName];

  if (cat || meta) {
    return {
      best: cat?.best ?? null,
      average: cat?.average ?? null,
      worst: cat?.worst ?? null,
      space: cat?.space ?? meta?.spaceComplexity ?? 'O(1)',
      timeSummary: meta?.timeComplexity ?? null,
      theory: cat?.theory ?? meta?.description ?? null,
    };
  }

  // Alias lookup checks
  if (algoName.includes('A*')) return getComplexityDetails('A* Search');
  if (algoName === 'BFS' || algoName.includes('Breadth-First')) return getComplexityDetails('BFS');
  if (algoName === 'DFS' || algoName.includes('Depth-First')) return getComplexityDetails('DFS');

  return null;
}

export function StepExplanationCard({
  lanes = [],
  activeFrames = [],
  frameIndex,
  totalFrames,
  algorithmName,
  frame,
}: StepExplanationCardProps) {
  const [selectedLane, setSelectedLane] = useState(0);
  const [activeDetail, setActiveDetail] = useState<DetailMode>('none');

  // Fallback if single lane passed
  const activeLaneObj = lanes[selectedLane] ?? (algorithmName ? { name: algorithmName } : null);
  const activeFrameObj = activeFrames[selectedLane] ?? frame ?? null;

  if (!activeFrameObj && !activeLaneObj) return null;

  const currentAlgoName = activeLaneObj?.name || algorithmName || 'Algorithm';

  // Retrieve exact detailed complexity metrics
  const compInfo = getComplexityDetails(currentAlgoName);

  // Dynamic, domain-accurate explanation generation
  const explanationText = useMemo(() => {
    if (activeFrameObj?.explanation) return activeFrameObj.explanation;
    if (!activeFrameObj) return `AlgoBot analyzing step ${frameIndex + 1} of ${totalFrames} for ${currentAlgoName}...`;

    // 1. Completion frame
    if (activeFrameObj.done) {
      if (activeFrameObj.comparisons !== undefined || activeFrameObj.swaps !== undefined) {
        return `🎉 ${currentAlgoName} has completed sorting all elements! Total workload: ${activeFrameObj.comparisons ?? 0} comparisons and ${activeFrameObj.swaps ?? 0} swaps.`;
      }
      return `🎉 ${currentAlgoName} has completed execution successfully.`;
    }

    // 2. Sorting array highlights (comparison / swap)
    if (activeFrameObj.highlight && activeFrameObj.highlight.length === 2 && activeFrameObj.array) {
      const idx1 = activeFrameObj.highlight[0];
      const idx2 = activeFrameObj.highlight[1];
      const val1 = activeFrameObj.array[idx1];
      const val2 = activeFrameObj.array[idx2];
      if (val1 !== undefined && val2 !== undefined) {
        if (val1 > val2) {
          return `⚡ ${currentAlgoName}: Comparing index ${idx1} (value ${val1}) with index ${idx2} (value ${val2}). Since ${val1} > ${val2}, swapping positions...`;
        }
        return `🔍 ${currentAlgoName}: Comparing index ${idx1} (value ${val1}) with index ${idx2} (value ${val2}). Order ${val1} ≤ ${val2} is correct; no swap required.`;
      }
      return `🔍 ${currentAlgoName}: Inspecting array elements at index ${idx1} and index ${idx2}.`;
    }

    // 3. Pivot selection (QuickSort / Partitioning)
    if (activeFrameObj.pivotIndex !== undefined && activeFrameObj.pivotIndex >= 0) {
      const pVal = activeFrameObj.array?.[activeFrameObj.pivotIndex];
      return `🎯 ${currentAlgoName}: Selected pivot element ${pVal !== undefined ? pVal : ''} at index ${activeFrameObj.pivotIndex}. Partitioning remaining subarray elements...`;
    }

    // 4. Search arena (Binary / Linear / Jump / Interpolation / Exponential search)
    if (activeFrameObj.foundIndex !== null && activeFrameObj?.foundIndex !== undefined) {
      if (activeFrameObj.foundIndex >= 0) {
        return `🎯 ${currentAlgoName}: Target match found at array index ${activeFrameObj.foundIndex}! Search terminates successfully.`;
      }
      return `🔍 ${currentAlgoName}: Target not yet located. Scanning active search window.`;
    }

    // 5. Pathfinding (Dijkstra, A*, BFS, DFS)
    if (activeFrameObj.path && activeFrameObj.path.length > 0) {
      return `📍 ${currentAlgoName}: Optimal path computed containing ${activeFrameObj.path.length} steps.`;
    }

    // 6. Tree / Graph / DP default step
    return `🔍 ${currentAlgoName}: Executing step ${frameIndex + 1} of ${totalFrames}.`;
  }, [activeFrameObj, frameIndex, totalFrames, currentAlgoName]);

  // Contextual "Why this step?" explanation text based on algorithm domain
  const whyThisStepText = useMemo(() => {
    if (activeFrameObj?.done) {
      return `All constraints have been satisfied and the algorithm state has reached a terminal condition.`;
    }
    if (activeFrameObj?.highlight && activeFrameObj.highlight.length === 2 && activeFrameObj.array) {
      const [i1, i2] = activeFrameObj.highlight;
      const v1 = activeFrameObj.array[i1];
      const v2 = activeFrameObj.array[i2];
      if (v1 !== undefined && v2 !== undefined && v1 > v2) {
        return `Comparing adjacent or partitioned elements ensures smaller values migrate left and larger values migrate right toward their sorted positions.`;
      }
      return `Comparing values verifies whether the current subarray maintains non-decreasing order before advancing pointers.`;
    }
    if (activeFrameObj?.pivotIndex !== undefined && activeFrameObj.pivotIndex >= 0) {
      return `Choosing a pivot divides the problem into two smaller independent subproblems (Divide and Conquer).`;
    }
    if (activeFrameObj?.foundIndex !== undefined) {
      return `Searching checks target value equality against midpoints or indices to eliminate unpromising halves of the array.`;
    }
    return `Each step reduces the remaining problem space or updates system invariants toward the target solution.`;
  }, [activeFrameObj]);

  // Smooth scroll to existing CodeViewer component on the page
  const scrollToCodeViewer = () => {
    const codeEl = document.querySelector('.cv-card, .pseudocode-viewer-card');
    if (codeEl) {
      codeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="algobot-card">
      {/* Header */}
      <div className="algobot-header">
        <div className="algobot-identity">
          <div className="algobot-avatar">
            <Bot size={22} className="algobot-icon" />
          </div>
          <div>
            <h4 className="algobot-title">AlgoBot — Live Step Tutor</h4>
            <span className="algobot-subtitle">Understand the current algorithm step</span>
          </div>
        </div>

        <div className="algobot-right-meta">
          {lanes.length > 1 && (
            <div className="algobot-lane-selector">
              <Layers size={13} style={{ color: 'var(--accent)' }} />
              <span>Lane:</span>
              {lanes.map((lane, index) => (
                <button
                  key={lane.name + index}
                  type="button"
                  className={`algobot-lane-btn ${selectedLane === index ? 'active' : ''}`}
                  onClick={() => setSelectedLane(index)}
                >
                  {lane.name}
                </button>
              ))}
            </div>
          )}

          <div className="algobot-badge">
            <BrainCircuit size={13} />
            <span>
              Frame {frameIndex + 1} / {totalFrames}
            </span>
          </div>
        </div>
      </div>

      {/* Main Explanation Bubble */}
      <div className="algobot-bubble">
        <p className="algobot-text">{explanationText}</p>
      </div>

      {/* Contextual Action Buttons */}
      <div className="algobot-actions-row">
        <button
          type="button"
          className="algobot-action-btn"
          onClick={() => setActiveDetail((prev) => (prev === 'why' ? 'none' : 'why'))}
        >
          <HelpCircle size={13} />
          Why this step?
        </button>

        <button
          type="button"
          className="algobot-action-btn"
          onClick={() => setActiveDetail((prev) => (prev === 'complexity' ? 'none' : 'complexity'))}
        >
          <Zap size={13} />
          Complexity
        </button>

        <button type="button" className="algobot-action-btn" onClick={scrollToCodeViewer}>
          <Code size={13} />
          View code
        </button>
      </div>

      {/* Detail Panel for "Why this step?" */}
      {activeDetail === 'why' && (
        <div className="algobot-detail-box">
          <strong>💡 Step Rationale:</strong> {whyThisStepText}
        </div>
      )}

      {/* Detail Panel for "Complexity" */}
      {activeDetail === 'complexity' && (
        <div className="algobot-detail-box">
          <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
            ⏱️ {currentAlgoName} Detailed Complexity Breakdown:
          </div>

          {compInfo ? (
            <>
              <div className="algobot-complexity-grid">
                {compInfo.best && (
                  <div className="algobot-complexity-chip">
                    <span className="algobot-chip-label">Best Case</span>
                    <strong className="algobot-chip-val">{compInfo.best}</strong>
                  </div>
                )}
                {compInfo.average && (
                  <div className="algobot-complexity-chip">
                    <span className="algobot-chip-label">Average Case</span>
                    <strong className="algobot-chip-val">{compInfo.average}</strong>
                  </div>
                )}
                {compInfo.worst && (
                  <div className="algobot-complexity-chip">
                    <span className="algobot-chip-label">Worst Case</span>
                    <strong className="algobot-chip-val">{compInfo.worst}</strong>
                  </div>
                )}
                {compInfo.timeSummary && !compInfo.best && (
                  <div className="algobot-complexity-chip">
                    <span className="algobot-chip-label">Time Complexity</span>
                    <strong className="algobot-chip-val">{compInfo.timeSummary}</strong>
                  </div>
                )}
                {compInfo.space && (
                  <div className="algobot-complexity-chip">
                    <span className="algobot-chip-label">Auxiliary Space</span>
                    <strong className="algobot-chip-val">{compInfo.space}</strong>
                  </div>
                )}
              </div>
              {compInfo.theory && (
                <div className="algobot-theory-text">
                  <strong>Theory:</strong> {compInfo.theory}
                </div>
              )}
            </>
          ) : (
            <span>Complexity metadata not available for this algorithm.</span>
          )}
        </div>
      )}
    </div>
  );
}
