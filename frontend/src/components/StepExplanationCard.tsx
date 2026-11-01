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

interface StepDetails {
  badge: string;
  badgeType: 'init' | 'swap' | 'compare' | 'pivot' | 'merge' | 'heap' | 'search' | 'path' | 'done' | 'step';
  action: string;
  reason: string;
  contextPills: Array<{ label: string; value: string }>;
}

/**
 * Returns balanced, informative step details: the concrete action, the mechanical reason,
 * and key contextual pointers without cluttering or duplicating dashboard statistics.
 */
function getStepDetails(
  algoName: string,
  curr: Partial<SimulationFrame> | null,
  prev: Partial<SimulationFrame> | null,
  frameIndex: number,
  totalFrames: number,
  target?: number
): StepDetails {
  // If frame has an explicit custom explanation (e.g. from DP or Tree arenas):
  if (curr?.explanation) {
    const isTree = /tree/i.test(algoName);
    const isDP = /dp/i.test(algoName) || /knapsack|lcs|edit/i.test(algoName);
    return {
      badge: isTree ? 'Tree Operation' : isDP ? 'DP Recurrence' : 'State Evaluation',
      badgeType: 'step',
      action: curr.explanation,
      reason: isTree
        ? 'Updating tree structure to maintain binary search order and height-balance.'
        : 'Evaluating subproblem state by combining previously memoized optimal values.',
      contextPills: [
        { label: 'Algorithm', value: algoName },
        { label: 'Step', value: `${frameIndex + 1} of ${totalFrames}` },
      ],
    };
  }

  // 1. Initial State (Step 1 / Frame 0)
  if (
    frameIndex === 0 ||
    curr?.frame === 0 ||
    (curr?.comparisons === 0 && curr?.swaps === 0 && (curr?.highlight?.length ?? 0) === 0)
  ) {
    const size = curr?.array?.length ?? 0;
    if (/sort/i.test(algoName)) {
      return {
        badge: 'Initialize',
        badgeType: 'init',
        action: `Ready to sort ${size} elements with ${algoName}.`,
        reason: 'Initial dataset is loaded in memory. Starting pointers and loop bounds are initialized.',
        contextPills: [
          { label: 'Dataset', value: `${size} elements` },
          { label: 'Status', value: 'Ready to run' },
        ],
      };
    }
    if (/search/i.test(algoName)) {
      return {
        badge: 'Initialize',
        badgeType: 'init',
        action: `Ready to search for ${target !== undefined ? target : 'target'} in ${size} elements with ${algoName}.`,
        reason: 'Dataset and search interval loaded. Pointers set to initial bounds.',
        contextPills: [
          { label: 'Dataset', value: `${size} elements` },
          { label: 'Target', value: String(target ?? '') },
        ],
      };
    }
    return {
      badge: 'Initialize',
      badgeType: 'init',
      action: `Ready to run ${algoName}.`,
      reason: 'Algorithmic state initialized and primed for execution.',
      contextPills: [{ label: 'Algorithm', value: algoName }],
    };
  }

  // 2. Completed State
  if (curr?.done || (totalFrames > 0 && frameIndex >= totalFrames - 1)) {
    if (/sort/i.test(algoName)) {
      return {
        badge: 'Completed',
        badgeType: 'done',
        action: `${algoName} finished execution.`,
        reason: 'All elements are fully verified in non-decreasing sorted order.',
        contextPills: [
          { label: 'Total Steps', value: String(totalFrames) },
          { label: 'Final State', value: 'Sorted' },
        ],
      };
    }
    if (/search/i.test(algoName)) {
      const found = curr?.foundIndex !== null && curr?.foundIndex !== undefined && curr.foundIndex >= 0;
      return {
        badge: found ? 'Match Found' : 'Completed',
        badgeType: 'done',
        action: found
          ? `Found target ${target !== undefined ? target : ''} at index ${curr?.foundIndex}.`
          : `Search finished. Target ${target !== undefined ? target : ''} was not found.`,
        reason: found
          ? 'Equality check passed; search terminates immediately with success.'
          : 'All candidate elements in the search range were inspected or eliminated.',
        contextPills: [
          { label: 'Result', value: found ? `Index ${curr?.foundIndex}` : 'Not found' },
          { label: 'Target', value: String(target ?? '') },
        ],
      };
    }
    if (curr?.pathFound) {
      return {
        badge: 'Path Found',
        badgeType: 'done',
        action: `Destination reached! Shortest path contains ${curr.path?.length ?? 0} steps.`,
        reason: 'Optimal route reconstructed by following parent pointers from target back to start.',
        contextPills: [{ label: 'Path Length', value: `${curr.path?.length ?? 0} steps` }],
      };
    }
    return {
      badge: 'Completed',
      badgeType: 'done',
      action: `${algoName} completed execution.`,
      reason: 'All termination conditions and loop bounds have been satisfied.',
      contextPills: [{ label: 'Status', value: 'Finished' }],
    };
  }

  // 3. Sorting: In-Place Swap
  const swapsIncreased =
    curr?.swaps !== undefined && prev?.swaps !== undefined && curr.swaps > prev.swaps;
  const isSwap = swapsIncreased || curr?.status?.toLowerCase().includes('swap');

  if (isSwap && curr?.highlight && curr.highlight.length >= 2) {
    const [i, j] = curr.highlight;
    const valA = curr.array?.[i];
    const valB = curr.array?.[j];
    const oldA = prev?.array?.[i] ?? valB;
    const oldB = prev?.array?.[j] ?? valA;

    let swapReason = 'Exchanged elements to resolve inversion and restore non-decreasing order.';
    if (algoName.includes('Bubble')) {
      swapReason = `Because ${oldA} > ${oldB}, swapping bubbles the larger element (${oldA}) one position rightward.`;
    } else if (algoName.includes('Quick')) {
      swapReason = 'Swapped smaller element into the lower partition window and larger element into the upper window.';
    } else if (algoName.includes('Selection')) {
      swapReason = 'Placed the identified minimum value into its final sorted boundary position.';
    } else if (algoName.includes('Heap')) {
      swapReason = 'Exchanged elements to restore the Max-Heap property where parent must be greater than children.';
    }

    const pills: Array<{ label: string; value: string }> = [
      { label: 'Swapped', value: `${oldA} ↔ ${oldB}` },
      { label: 'Indices', value: `[${i}, ${j}]` },
    ];
    if (curr.pivotIndex !== undefined && curr.pivotIndex >= 0 && curr.array) {
      pills.push({ label: 'Pivot', value: String(curr.array[curr.pivotIndex]) });
    }

    return {
      badge: 'In-Place Swap',
      badgeType: 'swap',
      action: `Swapped ${oldA} and ${oldB} at indices ${i} and ${j}.`,
      reason: swapReason,
      contextPills: pills,
    };
  }

  // 4. QuickSort: Pivot Selection / Partitioning
  if (curr?.pivotIndex !== undefined && curr.pivotIndex >= 0 && curr.array) {
    const pVal = curr.array[curr.pivotIndex];
    return {
      badge: 'Pivot Partition',
      badgeType: 'pivot',
      action: `Partitioning around pivot ${pVal} (index ${curr.pivotIndex}).`,
      reason: `Comparing subarray elements against pivot ${pVal}: smaller values move left, larger values move right.`,
      contextPills: [
        { label: 'Pivot Value', value: String(pVal) },
        { label: 'Pivot Index', value: String(curr.pivotIndex) },
      ],
    };
  }

  // 5. MergeSort: Merge Range
  if (
    curr?.mergeRegionStart !== undefined &&
    curr.mergeRegionStart >= 0 &&
    curr?.mergeRegionEnd !== undefined &&
    curr.mergeRegionEnd >= 0
  ) {
    return {
      badge: 'Subarray Merge',
      badgeType: 'merge',
      action: `Merging sorted segments from index ${curr.mergeRegionStart} to ${curr.mergeRegionEnd}.`,
      reason: 'Combining two adjacent pre-sorted halves into one sorted sequence by picking the smaller head element.',
      contextPills: [
        { label: 'Merge Window', value: `[${curr.mergeRegionStart} ... ${curr.mergeRegionEnd}]` },
      ],
    };
  }

  // 6. HeapSort: Max-Heap Sift
  if (curr?.heapBoundary !== undefined && curr.heapBoundary >= 0) {
    return {
      badge: 'Max-Heap',
      badgeType: 'heap',
      action: `Rebuilding max-heap structure (heap boundary at index ${curr.heapBoundary}).`,
      reason: 'Ensuring parent elements are greater than child elements so the maximum element rises to the root.',
      contextPills: [
        { label: 'Heap Boundary', value: `Index ${curr.heapBoundary}` },
      ],
    };
  }

  // 7. Sorting: Pairwise Comparison
  if (curr?.highlight && curr.highlight.length === 2 && curr.array && /sort/i.test(algoName)) {
    const [i, j] = curr.highlight;
    const v1 = curr.array[i];
    const v2 = curr.array[j];
    if (v1 !== undefined && v2 !== undefined) {
      if (v1 > v2) {
        return {
          badge: 'Comparison',
          badgeType: 'compare',
          action: `Comparing index ${i} (${v1}) and index ${j} (${v2}): Inversion detected.`,
          reason: `Because ${v1} is greater than ${v2}, they violate sorted order and will be swapped on the next step.`,
          contextPills: [
            { label: 'Testing', value: `${v1} > ${v2}` },
            { label: 'Condition', value: 'Swap required' },
          ],
        };
      }
      return {
        badge: 'Comparison',
        badgeType: 'compare',
        action: `Comparing index ${i} (${v1}) and index ${j} (${v2}): Correct order.`,
        reason: `Since ${v1} ≤ ${v2}, their relative order already satisfies non-decreasing sort. No swap needed.`,
        contextPills: [
          { label: 'Testing', value: `${v1} ≤ ${v2}` },
          { label: 'Condition', value: 'Order holds' },
        ],
      };
    }
  }

  // 8. Search: Binary Search
  if (/search/i.test(algoName)) {
    if (curr?.foundIndex !== null && curr?.foundIndex !== undefined && curr.foundIndex >= 0) {
      return {
        badge: 'Match Found',
        badgeType: 'done',
        action: `Found target ${target !== undefined ? target : ''} at index ${curr.foundIndex}.`,
        reason: 'Target value matches element at current index; search terminates successfully.',
        contextPills: [
          { label: 'Index', value: String(curr.foundIndex) },
          { label: 'Target', value: String(target ?? '') },
        ],
      };
    }
    if (curr?.highlight && curr.highlight.length > 0 && curr.array) {
      const idx = curr.highlight[0];
      const val = curr.array[idx];
      if (algoName.includes('Binary') && target !== undefined && val !== undefined) {
        if (target < val) {
          return {
            badge: 'Binary Search',
            badgeType: 'search',
            action: `Midpoint index ${idx} (${val}) > target (${target}).`,
            reason: `Because the array is sorted, every element at index ≥ ${idx} is also > target. Discarding the right half.`,
            contextPills: [
              { label: 'Midpoint', value: `${val} (idx ${idx})` },
              { label: 'Target', value: String(target) },
              { label: 'Discarded', value: 'Right half' },
            ],
          };
        }
        if (target > val) {
          return {
            badge: 'Binary Search',
            badgeType: 'search',
            action: `Midpoint index ${idx} (${val}) < target (${target}).`,
            reason: `Because the array is sorted, every element at index ≤ ${idx} is also < target. Discarding the left half.`,
            contextPills: [
              { label: 'Midpoint', value: `${val} (idx ${idx})` },
              { label: 'Target', value: String(target) },
              { label: 'Discarded', value: 'Left half' },
            ],
          };
        }
      }
      return {
        badge: 'Sequential Scan',
        badgeType: 'search',
        action: `Inspecting index ${idx} (value ${val}) against target ${target !== undefined ? target : ''}.`,
        reason: `Value ${val} does not match target. Advancing to next candidate index.`,
        contextPills: [
          { label: 'Inspecting', value: `${val} (idx ${idx})` },
          { label: 'Target', value: String(target ?? '') },
        ],
      };
    }
  }

  // 9. Pathfinding Step
  if (curr?.path && curr.path.length > 0) {
    return {
      badge: 'Path Found',
      badgeType: 'done',
      action: `Shortest path reconstructed (${curr.path.length} steps).`,
      reason: 'Destination node finalized; traced parent connections back to origin.',
      contextPills: [{ label: 'Path Length', value: `${curr.path.length} cells` }],
    };
  }

  return {
    badge: 'Step',
    badgeType: 'step',
    action: `Step ${frameIndex + 1} of ${totalFrames} for ${algoName}.`,
    reason: 'Executing algorithmic step and evaluating state transitions.',
    contextPills: [{ label: 'Algorithm', value: algoName }],
  };
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

  const details = useMemo(() => {
    return getStepDetails(
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
      {/* Header Row */}
      <div className="step-inspector-header">
        <div className="step-inspector-title-group">
          <span className="step-inspector-title">Step Explanation</span>
          <span className="step-inspector-counter">
            Step {frameIndex + 1} of {totalFrames}
          </span>
          <span className={`step-inspector-op-pill op-${details.badgeType}`}>
            {details.badge}
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

      {/* Main Action and Explanation */}
      <div className="step-inspector-content">
        <div className="step-inspector-action">{details.action}</div>
        <div className="step-inspector-reason">{details.reason}</div>
      </div>

      {/* Context Pills Strip */}
      {details.contextPills.length > 0 && (
        <div className="step-inspector-context-strip">
          {details.contextPills.map((pill, i) => (
            <div key={pill.label + i} className="step-inspector-pill">
              <span className="step-inspector-pill-k">{pill.label}:</span>
              <span className="step-inspector-pill-v">{pill.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const LiveStepInspector = StepExplanationCard;
