import { useState, useMemo } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';
import { Code } from 'lucide-react';

export interface StepExplanationCardProps {
  lanes?: RaceLaneResponse[];
  activeFrames?: (Partial<SimulationFrame> | null | undefined)[];
  frameIndex: number;
  totalFrames: number;
  algorithmName?: string;
  frame?: Partial<SimulationFrame> | null;
  target?: number;
  onOpenCodeInspector?: (algoName?: string) => void;
}

/**
 * Returns a concise, natural description of what is happening at the current step and why.
 */
function getStepDescription(
  algoName: string,
  curr: Partial<SimulationFrame> | null,
  prev: Partial<SimulationFrame> | null,
  frameIndex: number,
  totalFrames: number,
  target?: number
): string {
  // If frame has an explicit custom explanation (e.g. from DP or Tree arenas):
  if (curr?.explanation) {
    return curr.explanation;
  }

  // 1. Initial State (Step 1 / Frame 0)
  if (
    frameIndex === 0 ||
    curr?.frame === 0 ||
    (curr?.comparisons === 0 && curr?.swaps === 0 && (curr?.highlight?.length ?? 0) === 0)
  ) {
    const size = curr?.array?.length ?? 0;
    if (/sort/i.test(algoName)) {
      return `Ready to sort ${size} elements with ${algoName}.`;
    }
    if (/search/i.test(algoName)) {
      return `Ready to search for ${target !== undefined ? target : 'target'} in ${size} elements with ${algoName}.`;
    }
    return `Ready to run ${algoName}.`;
  }

  // 2. Completed State
  if (curr?.done || (totalFrames > 0 && frameIndex >= totalFrames - 1)) {
    if (/sort/i.test(algoName)) {
      return `${algoName} finished. All elements are sorted in ascending order.`;
    }
    if (/search/i.test(algoName)) {
      if (curr?.foundIndex !== null && curr?.foundIndex !== undefined && curr.foundIndex >= 0) {
        return `Found target ${target !== undefined ? target : ''} at index ${curr.foundIndex}.`;
      }
      return `Search finished. Target ${target !== undefined ? target : ''} was not found.`;
    }
    if (curr?.pathFound) {
      return `Target reached. Reconstructed shortest path (${curr.path?.length ?? 0} steps).`;
    }
    return `${algoName} completed execution.`;
  }

  // 3. Sorting In-Place Swap
  const swapsIncreased =
    curr?.swaps !== undefined && prev?.swaps !== undefined && curr.swaps > prev.swaps;
  const isSwap = swapsIncreased || curr?.status?.toLowerCase().includes('swap');

  if (isSwap && curr?.highlight && curr.highlight.length >= 2) {
    const [i, j] = curr.highlight;
    const valA = curr.array?.[i];
    const valB = curr.array?.[j];
    const oldA = prev?.array?.[i] ?? valB;
    const oldB = prev?.array?.[j] ?? valA;
    return `Swapped ${oldA} and ${oldB} at indices ${i} and ${j} to put them in order.`;
  }

  // 4. QuickSort Pivot
  if (curr?.pivotIndex !== undefined && curr.pivotIndex >= 0 && curr.array) {
    const pVal = curr.array[curr.pivotIndex];
    return `Partitioning around pivot ${pVal} (index ${curr.pivotIndex}): elements smaller than ${pVal} move left, larger move right.`;
  }

  // 5. MergeSort Subarray
  if (
    curr?.mergeRegionStart !== undefined &&
    curr.mergeRegionStart >= 0 &&
    curr?.mergeRegionEnd !== undefined &&
    curr.mergeRegionEnd >= 0
  ) {
    return `Merging sorted sections from index ${curr.mergeRegionStart} to ${curr.mergeRegionEnd}.`;
  }

  // 6. HeapSort Boundary
  if (curr?.heapBoundary !== undefined && curr.heapBoundary >= 0) {
    return `Restoring max-heap structure (sorted boundary at index ${curr.heapBoundary}).`;
  }

  // 7. Sorting Comparison
  if (curr?.highlight && curr.highlight.length === 2 && curr.array && /sort/i.test(algoName)) {
    const [i, j] = curr.highlight;
    const v1 = curr.array[i];
    const v2 = curr.array[j];
    if (v1 !== undefined && v2 !== undefined) {
      if (v1 > v2) {
        return `Comparing index ${i} (${v1}) and index ${j} (${v2}). Since ${v1} > ${v2}, they will swap.`;
      }
      return `Comparing index ${i} (${v1}) and index ${j} (${v2}). They are already in sorted order.`;
    }
  }

  // 8. Search: Binary Search or Linear Search
  if (/search/i.test(algoName)) {
    if (curr?.foundIndex !== null && curr?.foundIndex !== undefined && curr.foundIndex >= 0) {
      return `Found target ${target !== undefined ? target : ''} at index ${curr.foundIndex}.`;
    }
    if (curr?.highlight && curr.highlight.length > 0 && curr.array) {
      const idx = curr.highlight[0];
      const val = curr.array[idx];
      if (algoName.includes('Binary') && target !== undefined && val !== undefined) {
        if (target < val) {
          return `Checking midpoint index ${idx} (${val}). Target ${target} is smaller, so discarding the right half.`;
        }
        if (target > val) {
          return `Checking midpoint index ${idx} (${val}). Target ${target} is larger, so discarding the left half.`;
        }
        return `Checking midpoint index ${idx} (${val}). Target matches!`;
      }
      return `Checking index ${idx} (${val}) against target ${target !== undefined ? target : ''}.`;
    }
  }

  // 9. Pathfinding Step
  if (curr?.path && curr.path.length > 0) {
    return `Shortest path found (${curr.path.length} steps).`;
  }

  return `Step ${frameIndex + 1} of ${totalFrames} for ${algoName}.`;
}

export function StepExplanationCard({
  lanes = [],
  activeFrames = [],
  frameIndex,
  totalFrames,
  algorithmName,
  frame,
  target,
  onOpenCodeInspector,
}: StepExplanationCardProps) {
  const [selectedLane, setSelectedLane] = useState(0);

  const activeLaneObj = lanes[selectedLane] ?? (algorithmName ? { name: algorithmName } : null);
  const activeFrameObj = activeFrames[selectedLane] ?? frame ?? null;

  if (!activeFrameObj && !activeLaneObj) return null;

  const currentAlgoName = activeLaneObj?.name || algorithmName || 'Algorithm';

  const prevFrameObj = useMemo(() => {
    if (activeLaneObj?.frames && activeLaneObj.frames.length > 0) {
      const prevIdx = Math.max(0, Math.min(frameIndex - 1, activeLaneObj.frames.length - 1));
      return activeLaneObj.frames[prevIdx];
    }
    return null;
  }, [activeLaneObj, frameIndex]);

  const explanation = useMemo(() => {
    return getStepDescription(
      currentAlgoName,
      activeFrameObj,
      prevFrameObj,
      frameIndex,
      totalFrames,
      target
    );
  }, [currentAlgoName, activeFrameObj, prevFrameObj, frameIndex, totalFrames, target]);

  const handleOpenCodeInspector = () => {
    if (onOpenCodeInspector) {
      onOpenCodeInspector(currentAlgoName);
    }
    const codeEl = document.querySelector('.arena-code-inspector, .cv-card, .pseudocode-viewer-card');
    if (codeEl) {
      codeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="step-inspector-card algobot-card">
      <div className="step-inspector-header">
        <div className="step-inspector-title-group">
          <span className="step-inspector-title">Step Explanation</span>
          <span className="step-inspector-counter">
            Step {frameIndex + 1} of {totalFrames}
          </span>
        </div>

        <div className="step-inspector-controls">
          {lanes.length > 1 && (
            <div className="step-inspector-lanes">
              {lanes.map((lane, index) => (
                <button
                  key={lane.name + index}
                  type="button"
                  className={`step-inspector-lane-btn ${selectedLane === index ? 'active' : ''}`}
                  onClick={() => setSelectedLane(index)}
                >
                  {lane.name}
                </button>
              ))}
            </div>
          )}

          {onOpenCodeInspector && (
            <button
              type="button"
              className="step-inspector-code-btn"
              onClick={handleOpenCodeInspector}
            >
              <Code size={13} />
              View Code
            </button>
          )}
        </div>
      </div>

      <div className="step-inspector-body">
        <p className="step-inspector-text">{explanation}</p>
      </div>
    </div>
  );
}

export const LiveStepInspector = StepExplanationCard;
