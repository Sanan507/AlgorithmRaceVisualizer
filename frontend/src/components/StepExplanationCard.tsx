import { useState, useMemo } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';
import { Code } from 'lucide-react';
import { SORTING_META } from '../data/algorithmMetadata';
import { fallbackCatalog } from '../data/fallbackCatalog';

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
  badgeType: 'init' | 'swap' | 'compare' | 'pivot' | 'merge' | 'heap' | 'search' | 'path' | 'done' | 'step' | 'dp' | 'tree';
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
  const isPathfinding = Boolean(
    /bfs|dfs|dijkstra|a\*|astar|greedy|path/i.test(algoName) ||
      (curr?.grid !== undefined && curr?.grid !== null) ||
      (curr?.path !== undefined && curr?.path !== null)
  );
  const isSorting = Boolean(
    SORTING_META[algoName] ||
      fallbackCatalog.sortingAlgorithms?.includes(algoName) ||
      /sort/i.test(algoName)
  );
  const isSearching = Boolean(
    fallbackCatalog.searchingAlgorithms?.includes(algoName) ||
      /search/i.test(algoName)
  );

  // 1. Explicit Domain Explanations (DP and Tree arenas)
  if (curr?.explanation && !isPathfinding && !isSorting && !isSearching) {
    const isTree = /tree/i.test(algoName);
    const isDP = /dp/i.test(algoName) || /knapsack|lcs|edit/i.test(algoName);

    let badge = isTree ? 'Tree Operation' : isDP ? 'DP Recurrence' : 'State Evaluation';
    let badgeType: StepDetails['badgeType'] = isTree ? 'tree' : isDP ? 'dp' : 'step';

    if (curr.done) {
      badge = 'Solution Ready';
      badgeType = 'done';
    } else if (frameIndex === 0 || curr.explanation.toLowerCase().includes('initial')) {
      badge = 'Initialize';
      badgeType = 'init';
    } else if (/rotat/i.test(curr.explanation)) {
      badge = 'Tree Rotation';
      badgeType = 'tree';
    } else if (/not found/i.test(curr.explanation)) {
      badge = 'Not Found';
      badgeType = 'done';
    } else if (/found/i.test(curr.explanation)) {
      badge = 'Match Found';
      badgeType = 'done';
    } else if (/traversal/i.test(curr.explanation)) {
      badge = 'Tree Traversal';
      badgeType = 'tree';
    } else if (/insert/i.test(curr.explanation)) {
      badge = 'Tree Insertion';
      badgeType = 'tree';
    }

    let reason = isTree
      ? 'Updating tree structure to maintain binary search order and height balance.'
      : 'Evaluating subproblem state by combining previously memoized optimal values.';

    if (/rotat/i.test(curr.explanation)) {
      reason = 'Rebalancing subtree via local pointer manipulation to maintain O(log N) depth.';
    } else if (isDP && /knapsack/i.test(algoName)) {
      reason = 'Comparing taking vs skipping current item: dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt] + val).';
    } else if (isDP && /lcs/i.test(algoName)) {
      reason = 'Matching characters extend subsequence length by 1; mismatches inherit max from adjacent cells.';
    } else if (isDP && /edit/i.test(algoName)) {
      reason = 'Choosing minimum operations between insertion, deletion, and replacement for prefix substrings.';
    }

    return {
      badge,
      badgeType,
      action: curr.explanation,
      reason,
      contextPills: [
        { label: 'Algorithm', value: algoName },
        { label: 'Step', value: `${frameIndex + 1} of ${totalFrames}` },
      ],
    };
  }

  // 2. Initial State (Frame 0 only)
  if (frameIndex === 0) {
    if (isSorting) {
      const size = curr?.array?.length ?? 0;
      return {
        badge: 'Initialize',
        badgeType: 'init',
        action: `Ready to sort ${size} elements with ${algoName}.`,
        reason: 'Initial dataset is loaded in memory. Starting pointers and loop bounds are initialized.',
        contextPills: [
          { label: 'Dataset', value: `${size} elements` },
          { label: 'Status', value: 'Ready to race' },
        ],
      };
    }

    if (isSearching) {
      const size = curr?.array?.length ?? 0;
      return {
        badge: 'Initialize',
        badgeType: 'init',
        action: `Ready to search for ${target !== undefined ? target : 'target'} across ${size} elements with ${algoName}.`,
        reason: 'Dataset and search interval loaded. Pointers set to initial bounds.',
        contextPills: [
          { label: 'Dataset', value: `${size} elements` },
          { label: 'Target', value: String(target ?? '') },
        ],
      };
    }

    if (isPathfinding) {
      return {
        badge: 'Initialize',
        badgeType: 'init',
        action: `Ready to find path with ${algoName}.`,
        reason: 'Start node and target destination primed. Frontier queue initialized at start coordinates.',
        contextPills: [
          { label: 'Algorithm', value: algoName },
          { label: 'Status', value: 'Ready to race' },
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

  // 3. Pathfinding Arena
  if (isPathfinding) {
    if (curr?.pathFound || (curr?.path && curr.path.length > 0)) {
      return {
        badge: 'Path Found',
        badgeType: 'done',
        action: `Target reached! Shortest path contains ${curr.path?.length ?? 0} steps.`,
        reason: 'Optimal route reconstructed by following parent pointers from target back to start.',
        contextPills: [
          { label: 'Path Length', value: `${curr.path?.length ?? 0} cells` },
          { label: 'Explored', value: `${curr.steps ?? frameIndex + 1} cells` },
          { label: 'Algorithm', value: algoName },
        ],
      };
    }

    if (curr?.done && !curr?.pathFound) {
      return {
        badge: 'No Path',
        badgeType: 'done',
        action: 'Destination unreachable: all routes blocked by walls.',
        reason: 'Search frontier was exhausted without finding an accessible route to the target.',
        contextPills: [
          { label: 'Explored', value: `${curr.steps ?? frameIndex + 1} cells` },
          { label: 'Result', value: 'Blocked' },
          { label: 'Algorithm', value: algoName },
        ],
      };
    }

    // Active pathfinding search
    let visitedCount = 0;
    let frontierCount = 0;
    if (curr?.grid) {
      for (let r = 0; r < curr.grid.length; r++) {
        for (let c = 0; c < curr.grid[r].length; c++) {
          const cell = curr.grid[r][c];
          if (cell === 'VISITED' || cell === 'VISITED_FORWARD' || cell === 'VISITED_BACKWARD') visitedCount++;
          if (cell === 'FRONTIER' || cell === 'FRONTIER_FORWARD' || cell === 'FRONTIER_BACKWARD') frontierCount++;
        }
      }
    }

    const exploredNum = visitedCount || curr?.steps || frameIndex + 1;
    const isAStar = /a\*|astar/i.test(algoName);
    const isDijkstra = /dijkstra/i.test(algoName);
    const isBidi = /bidirectional/i.test(algoName);
    const isGreedy = /greedy/i.test(algoName);
    const isDFS = /dfs/i.test(algoName);
    const isBFS = /bfs/i.test(algoName);

    let badge = 'Frontier Step';
    let reason = 'Expanding frontier node and evaluating orthogonal neighbors.';
    if (isAStar) {
      badge = 'A* Expansion';
      reason = 'Selecting cell with lowest f(n) = g(n) + h(n), balancing traveled distance with goal heuristic.';
    } else if (isDijkstra) {
      badge = 'Dijkstra Step';
      reason = 'Settling unvisited cell with minimal cumulative edge weight g(n).';
    } else if (isBidi) {
      badge = 'Bidirectional BFS';
      reason = 'Simultaneously expanding search frontiers from both start and target until frontiers intersect.';
    } else if (isGreedy) {
      badge = 'Greedy Step';
      reason = 'Expanding node with lowest heuristic distance h(n) directly toward the target.';
    } else if (isBFS) {
      badge = 'BFS Wavefront';
      reason = 'Exploring neighbor cells level by level in concentric wavefronts for fewest grid hops.';
    } else if (isDFS) {
      badge = 'DFS Exploration';
      reason = 'Deeply traversing active corridor until a wall or dead end is reached.';
    }

    let action = `Exploring grid: ${exploredNum} cells evaluated.`;
    if (curr?.status && !curr.status.startsWith('Ready') && curr.status !== 'Running') {
      action = curr.status;
    }

    const pills: Array<{ label: string; value: string }> = [
      { label: 'Explored', value: `${exploredNum} cells` },
    ];
    if (frontierCount > 0) {
      pills.push({ label: 'Frontier', value: `${frontierCount} cells` });
    }
    pills.push({ label: 'Algorithm', value: algoName });

    return {
      badge,
      badgeType: 'path',
      action,
      reason,
      contextPills: pills,
    };
  }

  // 4. Completed State (General)
  if (curr?.done || (totalFrames > 0 && frameIndex >= totalFrames - 1)) {
    if (isSorting) {
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
    if (isSearching) {
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
    return {
      badge: 'Completed',
      badgeType: 'done',
      action: `${algoName} completed execution.`,
      reason: 'All termination conditions and loop bounds have been satisfied.',
      contextPills: [{ label: 'Status', value: 'Finished' }],
    };
  }

  // 5. Sorting: In-Place Swap
  const swapsIncreased =
    curr?.swaps !== undefined && prev?.swaps !== undefined && curr.swaps > prev.swaps;
  const isSwap = swapsIncreased || curr?.status?.toLowerCase().includes('swap');

  if (isSorting && isSwap && curr?.highlight && curr.highlight.length >= 2) {
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

  // 6. QuickSort: Pivot Selection / Partitioning
  if (isSorting && curr?.pivotIndex !== undefined && curr.pivotIndex >= 0 && curr.array) {
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

  // 7. MergeSort: Merge Range
  if (
    isSorting &&
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

  // 8. HeapSort: Max-Heap Sift
  if (isSorting && curr?.heapBoundary !== undefined && curr.heapBoundary >= 0) {
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

  // 9. Sorting: Pairwise Comparison
  if (isSorting && curr?.highlight && curr.highlight.length === 2 && curr.array) {
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

  // 10. Sorting: Fallback with live status
  if (isSorting && curr?.status && !curr.status.startsWith('Ready') && curr.status !== 'Running') {
    return {
      badge: /compare/i.test(curr.status)
        ? 'Comparison'
        : /swap/i.test(curr.status)
        ? 'In-Place Swap'
        : /insert/i.test(curr.status)
        ? 'Shift & Insert'
        : 'Pass Step',
      badgeType: /compare/i.test(curr.status)
        ? 'compare'
        : /swap/i.test(curr.status)
        ? 'swap'
        : 'step',
      action: curr.status,
      reason: 'Iterating through array sequence to verify order and maintain loop invariants.',
      contextPills: [
        ...(curr.comparisons !== undefined ? [{ label: 'Comparisons', value: String(curr.comparisons) }] : []),
        ...(curr.swaps !== undefined ? [{ label: 'Swaps', value: String(curr.swaps) }] : []),
        { label: 'Algorithm', value: algoName },
      ],
    };
  }

  // 11. Searching: Binary or Linear Search
  if (isSearching) {
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
      const isBinary = /binary/i.test(algoName);
      const isJump = /jump/i.test(algoName);
      const isInterpolation = /interpolation/i.test(algoName);
      const isExponential = /exponential/i.test(algoName);
      const isTernary = /ternary/i.test(algoName);

      if (isBinary && target !== undefined && val !== undefined) {
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

      let searchBadge = 'Sequential Scan';
      let searchReason = `Value ${val} does not match target. Advancing to next candidate index.`;
      if (isJump) {
        searchBadge = 'Jump Step';
        searchReason = 'Jumping ahead by fixed block size √N to find the interval containing target.';
      } else if (isInterpolation) {
        searchBadge = 'Interpolation Probe';
        searchReason = 'Probing position estimated by key distribution.';
      } else if (isExponential) {
        searchBadge = 'Exponential Range';
        searchReason = 'Doubling range bounds [2^k ... 2^(k+1)] to locate interval containing target.';
      } else if (isTernary) {
        searchBadge = 'Ternary Search';
        searchReason = 'Dividing range into three parts with two midpoints to narrow the search space.';
      }

      return {
        badge: searchBadge,
        badgeType: 'search',
        action: `Inspecting index ${idx} (value ${val}) against target ${target !== undefined ? target : ''}.`,
        reason: searchReason,
        contextPills: [
          { label: 'Inspecting', value: `${val} (idx ${idx})` },
          { label: 'Target', value: String(target ?? '') },
        ],
      };
    }
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
