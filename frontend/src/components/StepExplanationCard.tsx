import { useState, useMemo } from 'react';
import type { RaceLaneResponse, SimulationFrame } from '../models/types';
import { Terminal, Activity, Layers, Zap, Code, Clock, HelpCircle } from 'lucide-react';
import { algorithmMetadata, SORTING_META } from '../data/algorithmMetadata';
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

type DetailMode = 'none' | 'complexity';

interface ComplexityDetails {
  best: string | null;
  average: string | null;
  worst: string | null;
  space: string;
  timeSummary: string | null;
  theory: string | null;
}

/** Resolves detailed asymptotic complexity breakdown */
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

  if (algoName.includes('A*')) return getComplexityDetails('A* Search');
  if (algoName === 'BFS' || algoName.includes('Breadth-First')) return getComplexityDetails('BFS');
  if (algoName === 'DFS' || algoName.includes('Depth-First')) return getComplexityDetails('DFS');

  return null;
}

interface StepAnalysis {
  operationType:
    | 'INITIALIZE'
    | 'COMPARE_INVERSION'
    | 'COMPARE_ORDERED'
    | 'SWAP'
    | 'PIVOT'
    | 'MERGE'
    | 'HEAPIFY'
    | 'SEARCH_MATCH'
    | 'SEARCH_DISCARD_RIGHT'
    | 'SEARCH_DISCARD_LEFT'
    | 'SEARCH_SCAN'
    | 'PATH_FOUND'
    | 'PATH_EXPAND'
    | 'SUBPROBLEM'
    | 'TREE_OP'
    | 'DONE';
  operationLabel: string;
  badgeClass: string;
  headline: string;
  description: string;
  why: string;
  invariant: string;
  chips: Array<{ label: string; value: string }>;
}

/**
 * Deep deterministic state analyzer: inspects current and previous frames to produce
 * mathematically accurate, human-readable execution tracing.
 */
function analyzeStepState(
  algoName: string,
  curr: Partial<SimulationFrame> | null,
  prev: Partial<SimulationFrame> | null,
  frameIndex: number,
  totalFrames: number,
  target?: number
): StepAnalysis {
  const isSorting = Boolean(
    SORTING_META[algoName] ||
      fallbackCatalog.sortingAlgorithms?.includes(algoName) ||
      /sort/i.test(algoName)
  );
  const isSearching = Boolean(
    fallbackCatalog.searchingAlgorithms?.includes(algoName) || /search/i.test(algoName)
  );

  // 1. Completion / Done State
  if (curr?.done || (totalFrames > 0 && frameIndex >= totalFrames - 1)) {
    let doneHeadline = `${algoName}: Execution completed successfully`;
    let doneDesc = `All termination conditions and loop bounds have been satisfied.`;
    let doneWhy = `The algorithm has processed all candidate states and reached its verified termination post-condition.`;

    if (isSorting) {
      doneHeadline = `🎉 ${algoName}: Sorting completed`;
      doneDesc = `The entire array of ${curr?.array?.length ?? 0} elements is fully sorted in non-decreasing order (A[0] ≤ A[1] ≤ ... ≤ A[N-1]).`;
      doneWhy = `Total workload: ${curr?.comparisons ?? 0} comparisons and ${curr?.swaps ?? 0} swaps. No remaining inversions exist.`;
    } else if (isSearching) {
      if (curr?.foundIndex !== null && curr?.foundIndex !== undefined && curr.foundIndex >= 0) {
        doneHeadline = `🎯 Target found at index ${curr.foundIndex}`;
        doneDesc = `Target element ${target !== undefined ? target : ''} was located at array index ${curr.foundIndex}.`;
        doneWhy = `Equality check passed; search terminates immediately with success.`;
      } else {
        doneHeadline = `🔍 Search complete: Target not in array`;
        doneDesc = `Exhausted the search range without finding a matching element.`;
        doneWhy = `All candidate positions were evaluated or safely eliminated based on search bounds.`;
      }
    } else if (curr?.pathFound) {
      doneHeadline = `📍 Path found: Destination reached`;
      doneDesc = `Optimal path constructed with ${curr.path?.length ?? 0} steps.`;
      doneWhy = `Destination node was extracted with minimum tentative cost from the priority queue.`;
    }

    return {
      operationType: 'DONE',
      operationLabel: 'Execution Completed',
      badgeClass: 'badge-completed',
      headline: doneHeadline,
      description: doneDesc,
      why: doneWhy,
      invariant: 'Terminal invariant satisfied: Algorithm post-condition holds across entire dataset.',
      chips: [
        { label: 'Status', value: 'Completed' },
        { label: 'Total Comparisons', value: String(curr?.comparisons ?? 0) },
        { label: 'Total Swaps', value: String(curr?.swaps ?? 0) },
      ],
    };
  }

  // 2. Initial State (Step 1 / Frame 0)
  if (
    frameIndex === 0 ||
    curr?.frame === 0 ||
    (curr?.comparisons === 0 && curr?.swaps === 0 && (curr?.highlight?.length ?? 0) === 0)
  ) {
    const size = curr?.array?.length ?? 0;
    return {
      operationType: 'INITIALIZE',
      operationLabel: 'Initialization',
      badgeClass: 'badge-init',
      headline: `${algoName}: Dataset loaded (${size} elements)`,
      description: `Initial sequence loaded in memory. Loop pointers (pass counter and comparison pointers) are initialized at the start of the array.`,
      why: `Before pairwise comparisons or partitioning can occur, the algorithm sets up initial array bounds and memory state.`,
      invariant: `Unsorted array spans indices [0 ... ${Math.max(0, size - 1)}].`,
      chips: [
        { label: 'Dataset Size', value: `${size} elements` },
        { label: 'Comparisons', value: '0' },
        { label: 'Swaps', value: '0' },
        { label: 'Status', value: 'Ready to run' },
      ],
    };
  }

  // 3. Tree / DP Custom Explanations (when explicit explanation is attached)
  if (curr?.explanation && !isSorting && !isSearching) {
    return {
      operationType: 'SUBPROBLEM',
      operationLabel: 'State Evaluation',
      badgeClass: 'badge-subproblem',
      headline: curr.explanation,
      description: `Evaluating active subproblem recurrence. Transition updates cell state and memoizes optimal sub-results.`,
      why: `Dynamic Programming and Tree algorithms decompose problems into optimal subproblems, caching verified states to avoid redundant recomputations.`,
      invariant: `Optimal substructure: all prior subproblems are permanently solved and available in the state matrix.`,
      chips: [
        { label: 'Algorithm', value: algoName },
        { label: 'Step', value: `${frameIndex + 1} / ${totalFrames}` },
        { label: 'Status', value: curr.status || 'Active' },
      ],
    };
  }

  // 4. Sorting: Swap detection
  const swapsIncreased =
    curr?.swaps !== undefined && prev?.swaps !== undefined && curr.swaps > prev.swaps;
  const isSwapStatus = curr?.status?.toLowerCase().includes('swap');

  if (isSorting && (swapsIncreased || isSwapStatus)) {
    const idxA = curr?.highlight?.[0] ?? 0;
    const idxB = curr?.highlight?.[1] ?? 1;

    // Detect swapped values between prev and curr
    const valAAfter = curr?.array?.[idxA];
    const valBAfter = curr?.array?.[idxB];
    const valABefore = prev?.array?.[idxA] ?? valBAfter;
    const valBBefore = prev?.array?.[idxB] ?? valAAfter;

    let swapWhy = `Swapping adjacent out-of-order elements eliminates the inversion, moving the larger value toward the sorted suffix.`;
    if (algoName.includes('Quick')) {
      swapWhy = `Quick Sort partitions values around the pivot. An element less than the pivot is swapped into the lower partition window.`;
    } else if (algoName.includes('Selection')) {
      swapWhy = `The minimum element found in the unsorted suffix is swapped into the current boundary index.`;
    } else if (algoName.includes('Insertion')) {
      swapWhy = `Elements greater than the key are shifted rightward to clear an insertion slot for the key.`;
    } else if (algoName.includes('Heap')) {
      swapWhy = `Elements are swapped to maintain or restore the Max-Heap property where parent ≥ children.`;
    }

    return {
      operationType: 'SWAP',
      operationLabel: 'In-Place Swap',
      badgeClass: 'badge-swap',
      headline: `Swapped index ${idxA} (${valABefore}) with index ${idxB} (${valBBefore})`,
      description: `Exchanged elements between indices ${idxA} and ${idxB}. Position ${idxA} now holds ${valAAfter}; position ${idxB} now holds ${valBAfter}.`,
      why: swapWhy,
      invariant: `Local non-decreasing order established: A[${idxA}] (${valAAfter}) ≤ A[${idxB}] (${valBAfter}).`,
      chips: [
        { label: `Index ${idxA}`, value: `Now ${valAAfter} (was ${valABefore})` },
        { label: `Index ${idxB}`, value: `Now ${valBAfter} (was ${valBBefore})` },
        { label: 'Total Swaps', value: String(curr?.swaps ?? 0) },
        { label: 'Total Comparisons', value: String(curr?.comparisons ?? 0) },
      ],
    };
  }

  // 5. Sorting: Pivot Selection (Quick Sort)
  if (isSorting && curr?.pivotIndex !== undefined && curr.pivotIndex >= 0) {
    const pIdx = curr.pivotIndex;
    const pVal = curr.array?.[pIdx];
    return {
      operationType: 'PIVOT',
      operationLabel: 'Pivot Partition',
      badgeClass: 'badge-pivot',
      headline: `Partitioning subarray around pivot element ${pVal} (index ${pIdx})`,
      description: `Subarray values are tested against pivot ${pVal}. Values strictly smaller than ${pVal} migrate left; values greater or equal remain on the right.`,
      why: `Divide-and-Conquer partitioning places the pivot in its permanent sorted location in linear O(N) time without moving again.`,
      invariant: `Partitioning invariant: [Elements ≤ ${pVal} | PIVOT (${pVal}) | Elements > ${pVal}].`,
      chips: [
        { label: 'Pivot Index', value: String(pIdx) },
        { label: 'Pivot Value', value: String(pVal) },
        { label: 'Partition Status', value: 'Active Partition' },
      ],
    };
  }

  // 6. Sorting: Merge Range (Merge Sort)
  if (
    isSorting &&
    ((curr?.mergeRegionStart !== undefined && curr.mergeRegionStart >= 0) ||
      (curr?.mergeRegionEnd !== undefined && curr.mergeRegionEnd >= 0))
  ) {
    const start = curr.mergeRegionStart ?? 0;
    const end = curr.mergeRegionEnd ?? (curr.array?.length ?? 1) - 1;
    return {
      operationType: 'MERGE',
      operationLabel: 'Subarray Merge',
      badgeClass: 'badge-merge',
      headline: `Merging sorted range [${start} ... ${end}]`,
      description: `Two independently sorted adjacent subarrays within [${start}..${end}] are being merged into a single sorted sequence by choosing the smaller head element.`,
      why: `Merging two sorted lists of length K takes linear O(K) time, guaranteeing Merge Sort's optimal O(N log N) worst-case time complexity.`,
      invariant: `Subarrays [${start}..mid] and [mid+1..${end}] are internally sorted.`,
      chips: [
        { label: 'Merge Window', value: `[${start} ... ${end}]` },
        { label: 'Comparisons', value: String(curr.comparisons ?? 0) },
        { label: 'Status', value: 'Merging Subarrays' },
      ],
    };
  }

  // 7. Sorting: Heapify / Max-Heap
  if (isSorting && curr?.heapBoundary !== undefined && curr.heapBoundary >= 0) {
    const boundary = curr.heapBoundary;
    return {
      operationType: 'HEAPIFY',
      operationLabel: 'Max-Heap Operation',
      badgeClass: 'badge-heap',
      headline: `Active binary max-heap over range [0 ... ${boundary}]`,
      description: `Ensuring max-heap property (parent ≥ children). Extracted root elements are placed into index ${boundary} as the sorted suffix grows from right to left.`,
      why: `The root of a max-heap is guaranteed to be the largest element in the active range, enabling in-place O(N log N) sorting.`,
      invariant: `Max-heap invariant: A[parent] ≥ A[children] for all indices in [0..${boundary}].`,
      chips: [
        { label: 'Heap Boundary', value: `Index ${boundary}` },
        { label: 'Total Swaps', value: String(curr.swaps ?? 0) },
      ],
    };
  }

  // 8. Sorting: Pairwise Comparison
  if (isSorting && curr?.highlight && curr.highlight.length === 2 && curr.array) {
    const [idx1, idx2] = curr.highlight;
    const val1 = curr.array[idx1];
    const val2 = curr.array[idx2];

    if (val1 !== undefined && val2 !== undefined) {
      if (val1 > val2) {
        return {
          operationType: 'COMPARE_INVERSION',
          operationLabel: 'Comparison (Inversion)',
          badgeClass: 'badge-compare-inversion',
          headline: `Comparing index ${idx1} (${val1}) with index ${idx2} (${val2}): Inversion detected`,
          description: `Testing order of A[${idx1}] = ${val1} against A[${idx2}] = ${val2}. Because ${val1} > ${val2}, an inversion exists and a swap is required.`,
          why: `Sorting requires non-decreasing order. Finding ${val1} > ${val2} violates the sorted invariant, necessitating an exchange.`,
          invariant: `Inversion found: A[${idx1}] (${val1}) > A[${idx2}] (${val2}).`,
          chips: [
            { label: `A[${idx1}]`, value: String(val1) },
            { label: `A[${idx2}]`, value: String(val2) },
            { label: 'Evaluation', value: `${val1} > ${val2} (Out of order)` },
            { label: 'Comparisons', value: String(curr.comparisons ?? 0) },
          ],
        };
      }

      return {
        operationType: 'COMPARE_ORDERED',
        operationLabel: 'Comparison (In Order)',
        badgeClass: 'badge-compare-ordered',
        headline: `Comparing index ${idx1} (${val1}) with index ${idx2} (${val2}): In correct order`,
        description: `Testing order of A[${idx1}] = ${val1} against A[${idx2}] = ${val2}. Because ${val1} ≤ ${val2}, their relative order is correct. No swap needed.`,
        why: `Adjacent elements already satisfy non-decreasing order, allowing the scan to advance without memory writes.`,
        invariant: `Order holds: A[${idx1}] (${val1}) ≤ A[${idx2}] (${val2}).`,
        chips: [
          { label: `A[${idx1}]`, value: String(val1) },
          { label: `A[${idx2}]`, value: String(val2) },
          { label: 'Evaluation', value: `${val1} ≤ ${val2} (Order holds)` },
          { label: 'Comparisons', value: String(curr.comparisons ?? 0) },
        ],
      };
    }
  }

  // 9. Searching Arena Operations
  if (isSearching) {
    if (curr?.foundIndex !== null && curr?.foundIndex !== undefined && curr.foundIndex >= 0) {
      return {
        operationType: 'SEARCH_MATCH',
        operationLabel: 'Target Match',
        badgeClass: 'badge-completed',
        headline: `Target ${target !== undefined ? target : ''} found at index ${curr.foundIndex}!`,
        description: `Element at index ${curr.foundIndex} matches search target. The algorithm terminates with success.`,
        why: `Key identified; search space successfully resolved.`,
        invariant: `A[${curr.foundIndex}] === target.`,
        chips: [
          { label: 'Found Index', value: String(curr.foundIndex) },
          { label: 'Operations', value: String(curr.comparisons ?? curr.steps ?? frameIndex + 1) },
        ],
      };
    }

    if (curr?.highlight && curr.highlight.length > 0 && curr.array) {
      const inspectIdx = curr.highlight[0];
      const inspectVal = curr.array[inspectIdx];

      if (algoName.includes('Binary') && target !== undefined && inspectVal !== undefined) {
        if (target < inspectVal) {
          return {
            operationType: 'SEARCH_DISCARD_RIGHT',
            operationLabel: 'Binary Search (Narrow Left)',
            badgeClass: 'badge-search',
            headline: `Midpoint A[${inspectIdx}] (${inspectVal}) > target (${target}): Narrowing left`,
            description: `Since the array is sorted, all elements at index ≥ ${inspectIdx} are ≥ ${inspectVal} > target. Discarding right window.`,
            why: `Binary search halves the remaining search interval in O(1) per step, guaranteeing O(log N) runtime.`,
            invariant: `Target cannot exist in [${inspectIdx} ... end]. Search window restricted to left half.`,
            chips: [
              { label: 'Midpoint Index', value: String(inspectIdx) },
              { label: 'Midpoint Value', value: String(inspectVal) },
              { label: 'Target', value: String(target) },
              { label: 'Decision', value: 'Discard Right Half' },
            ],
          };
        }

        if (target > inspectVal) {
          return {
            operationType: 'SEARCH_DISCARD_LEFT',
            operationLabel: 'Binary Search (Narrow Right)',
            badgeClass: 'badge-search',
            headline: `Midpoint A[${inspectIdx}] (${inspectVal}) < target (${target}): Narrowing right`,
            description: `Since the array is sorted, all elements at index ≤ ${inspectIdx} are ≤ ${inspectVal} < target. Discarding left window.`,
            why: `Monotonic ordering guarantees the target cannot exist in the left half of the array.`,
            invariant: `Target cannot exist in [0 ... ${inspectIdx}]. Search window restricted to right half.`,
            chips: [
              { label: 'Midpoint Index', value: String(inspectIdx) },
              { label: 'Midpoint Value', value: String(inspectVal) },
              { label: 'Target', value: String(target) },
              { label: 'Decision', value: 'Discard Left Half' },
            ],
          };
        }
      }

      return {
        operationType: 'SEARCH_SCAN',
        operationLabel: 'Sequential Inspection',
        badgeClass: 'badge-search',
        headline: `Inspecting index ${inspectIdx} (value ${inspectVal})`,
        description: `Testing element at index ${inspectIdx} against target ${target !== undefined ? target : ''}. Value does not match; advancing to next candidate.`,
        why: `Sequential linear scan inspects elements sequentially in O(N) time without requiring a sorted distribution.`,
        invariant: `Indices [0 ... ${inspectIdx}] examined without match.`,
        chips: [
          { label: 'Index', value: String(inspectIdx) },
          { label: 'Value', value: String(inspectVal) },
          { label: 'Target', value: String(target ?? 'N/A') },
        ],
      };
    }
  }

  // 10. Pathfinding Arena Operations
  if (curr?.path && curr.path.length > 0) {
    return {
      operationType: 'PATH_FOUND',
      operationLabel: 'Path Reconstructed',
      badgeClass: 'badge-completed',
      headline: `Shortest path reconstructed (${curr.path.length} steps)`,
      description: `Destination cell reached. Tracing parent pointers from destination back to start to form the optimal path.`,
      why: `Priority queue extraction guarantees the first time destination is settled, optimal path cost is known.`,
      invariant: `Optimal shortest path established.`,
      chips: [
        { label: 'Path Length', value: `${curr.path.length} cells` },
        { label: 'Explored Nodes', value: String(curr.steps ?? frameIndex + 1) },
      ],
    };
  }

  // 11. Generic Step Fallback with Clear Domain Context
  return {
    operationType: 'PATH_EXPAND',
    operationLabel: 'Execution Step',
    badgeClass: 'badge-step',
    headline: `${algoName}: Step ${frameIndex + 1} of ${totalFrames}`,
    description: `Executing step ${frameIndex + 1}. Updating algorithmic state and evaluating invariants.`,
    why: `Each execution step reduces the remaining problem space toward the termination criteria.`,
    invariant: `Active execution state advancing deterministically.`,
    chips: [
      { label: 'Algorithm', value: algoName },
      { label: 'Step Progress', value: `${frameIndex + 1} / ${totalFrames}` },
      { label: 'Status', value: curr?.status || 'Active' },
    ],
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
  const [activeDetail, setActiveDetail] = useState<DetailMode>('none');

  // Fallback for single lane or single algorithm usage
  const activeLaneObj = lanes[selectedLane] ?? (algorithmName ? { name: algorithmName } : null);
  const activeFrameObj = activeFrames[selectedLane] ?? frame ?? null;

  if (!activeFrameObj && !activeLaneObj) return null;

  const currentAlgoName = activeLaneObj?.name || algorithmName || 'Algorithm';

  // Retrieve prior frame for deep delta state diffing
  const prevFrameObj = useMemo(() => {
    if (activeLaneObj?.frames && activeLaneObj.frames.length > 0) {
      const prevIdx = Math.max(0, Math.min(frameIndex - 1, activeLaneObj.frames.length - 1));
      return activeLaneObj.frames[prevIdx];
    }
    return null;
  }, [activeLaneObj, frameIndex]);

  // Deep deterministic state analysis
  const analysis = useMemo(() => {
    return analyzeStepState(
      currentAlgoName,
      activeFrameObj,
      prevFrameObj,
      frameIndex,
      totalFrames,
      target
    );
  }, [currentAlgoName, activeFrameObj, prevFrameObj, frameIndex, totalFrames, target]);

  // Asymptotic complexity details
  const compInfo = getComplexityDetails(currentAlgoName);

  // Smooth scroll to CodeViewer or trigger callback
  const handleOpenCodeInspector = () => {
    if (onOpenCodeInspector) {
      onOpenCodeInspector(currentAlgoName);
    }
    const codeEl = document.querySelector('.arena-code-inspector, .cv-card, .pseudocode-viewer-card');
    if (codeEl) {
      codeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const progressPercent = totalFrames > 0 ? Math.round(((frameIndex + 1) / totalFrames) * 100) : 0;

  return (
    <div className="step-inspector-card algobot-card">
      {/* Header Bar */}
      <div className="step-inspector-header algobot-header">
        <div className="step-inspector-identity algobot-identity">
          <div className="step-inspector-icon-wrap algobot-avatar">
            <Terminal size={18} className="step-inspector-icon algobot-icon" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 className="step-inspector-title algobot-title">Execution Step Inspector</h4>
              <span className="step-inspector-live-tag">
                <span className="step-inspector-pulse-dot" />
                LIVE TRACE
              </span>
            </div>
            <span className="step-inspector-subtitle algobot-subtitle">
              Deterministic state analysis, operation invariants & execution mechanics
            </span>
          </div>
        </div>

        <div className="step-inspector-right algobot-right-meta">
          {lanes.length > 1 && (
            <div className="step-inspector-lanes algobot-lane-selector">
              <Layers size={13} style={{ color: 'var(--accent, #6366f1)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Lane:</span>
              {lanes.map((lane, index) => (
                <button
                  key={lane.name + index}
                  type="button"
                  className={`step-inspector-lane-btn algobot-lane-btn ${selectedLane === index ? 'active' : ''}`}
                  onClick={() => setSelectedLane(index)}
                >
                  {lane.name}
                </button>
              ))}
            </div>
          )}

          <div className="step-inspector-badge algobot-badge">
            <Clock size={13} />
            <span>
              Step {frameIndex + 1} / {totalFrames} ({progressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Step Banner */}
      <div className="step-inspector-main-panel algobot-bubble">
        <div className="step-inspector-op-row">
          <span className={`step-inspector-op-badge ${analysis.badgeClass}`}>
            {analysis.operationLabel}
          </span>
          <span className="step-inspector-algo-tag">{currentAlgoName}</span>
        </div>

        <h3 className="step-inspector-headline">{analysis.headline}</h3>
        <p className="step-inspector-description algobot-text">{analysis.description}</p>
      </div>

      {/* Two-Column State & Rationale Grid */}
      <div className="step-inspector-grid">
        {/* Left Sub-card: Active State Chips */}
        <div className="step-inspector-subcard">
          <div className="step-inspector-subcard-title">
            <Activity size={13} />
            <span>Active Inspection State</span>
          </div>
          <div className="step-inspector-chips-row">
            {analysis.chips.map((chip, i) => (
              <div key={chip.label + i} className="step-inspector-chip">
                <span className="step-inspector-chip-k">{chip.label}</span>
                <strong className="step-inspector-chip-v">{chip.value}</strong>
              </div>
            ))}
          </div>
          <div className="step-inspector-invariant-box">
            <span className="step-inspector-invariant-k">Invariant:</span>{' '}
            <span className="step-inspector-invariant-v">{analysis.invariant}</span>
          </div>
        </div>

        {/* Right Sub-card: Algorithmic Rationale */}
        <div className="step-inspector-subcard">
          <div className="step-inspector-subcard-title">
            <HelpCircle size={13} />
            <span>Algorithmic Rationale (Why this step?)</span>
          </div>
          <p className="step-inspector-rationale-text">{analysis.why}</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="step-inspector-actions algobot-actions-row">
        <button
          type="button"
          className={`step-inspector-btn algobot-action-btn ${activeDetail === 'complexity' ? 'active' : ''}`}
          onClick={() => setActiveDetail((prev) => (prev === 'complexity' ? 'none' : 'complexity'))}
        >
          <Zap size={13} />
          {activeDetail === 'complexity' ? 'Hide Complexity' : 'Complexity Specs'}
        </button>

        <button
          type="button"
          className="step-inspector-btn algobot-action-btn"
          onClick={handleOpenCodeInspector}
        >
          <Code size={13} />
          Trace in Code Viewer
        </button>
      </div>

      {/* Complexity Breakdown Details Panel */}
      {activeDetail === 'complexity' && (
        <div className="step-inspector-complexity-box algobot-detail-box">
          <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
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

// Export backwards-compatible alias
export const LiveStepInspector = StepExplanationCard;
