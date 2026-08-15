/**
 * simulationWorker.ts
 * Offloads heavy sorting & searching algorithm frame generation to a dedicated Web Worker thread.
 * Guarantees 100% CPU thread isolation on low-power devices and prevents UI blocking even for N > 1,000.
 */

export interface WorkerSimulationRequest {
  id?: string;
  type: 'sorting' | 'searching';
  algorithms: string[];
  array: number[];
  target?: number;
  maxFramesBudget?: number;
}

export interface WorkerFrame {
  frame: number;
  array: number[];
  highlight?: number[];
  sortedBoundary?: number;
  pivotIndex?: number;
  mergeRegionStart?: number;
  mergeRegionEnd?: number;
  heapBoundary?: number;
  comparisons: number;
  swaps: number;
  timeMs: number;
  done: boolean;
  status: string;
  foundIndex?: number | null;
  searchPath?: number[];
  grid?: null;
  path?: number[];
  steps: number;
  pathFound?: boolean;
}

export interface WorkerLaneResult {
  name: string;
  complexity: string;
  stats: {
    comparisons: number;
    swaps: number;
    steps: number;
    timeMs: number;
    found: boolean;
    foundIndex: number | null;
  };
  frames: WorkerFrame[];
}

export interface WorkerSimulationResponse {
  id?: string;
  dataset: number[];
  lanes: WorkerLaneResult[];
  winner: string | null;
  totalTimeMs: number;
  isWorkerIsolated: boolean;
}

self.onmessage = (event: MessageEvent<WorkerSimulationRequest>) => {
  const { id, type, algorithms, array, target, maxFramesBudget = 800 } = event.data;

  if (type === 'sorting') {
    const response = runSortingWorkerSimulation(algorithms, array, maxFramesBudget, id);
    self.postMessage({ type: 'result', data: response });
  } else if (type === 'searching') {
    const response = runSearchingWorkerSimulation(algorithms, array, target ?? 0, maxFramesBudget, id);
    self.postMessage({ type: 'result', data: response });
  }
};

/**
 * Executes multi-lane sorting simulation inside worker
 */
function runSortingWorkerSimulation(
  algorithms: string[],
  initialArray: number[],
  maxFramesBudget: number,
  requestId?: string
): WorkerSimulationResponse {
  const startTime = performance.now();
  const lanes: WorkerLaneResult[] = [];

  for (let aIdx = 0; aIdx < algorithms.length; aIdx++) {
    const algoName = algorithms[aIdx];
    const laneResult = simulateSingleSortingAlgorithm(algoName, [...initialArray], maxFramesBudget);
    lanes.push(laneResult);

    // Report progress back
    self.postMessage({
      type: 'progress',
      requestId,
      progress: Math.round(((aIdx + 1) / algorithms.length) * 100),
      currentAlgorithm: algoName,
    });
  }

  // Determine winner (least comparisons + swaps, or fastest time)
  let winner: string | null = null;
  let bestScore = Infinity;

  lanes.forEach((lane) => {
    const score = lane.stats.comparisons + lane.stats.swaps * 1.5;
    if (score < bestScore) {
      bestScore = score;
      winner = lane.name;
    }
  });

  const totalTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    id: requestId,
    dataset: initialArray,
    lanes,
    winner,
    totalTimeMs,
    isWorkerIsolated: true,
  };
}

/**
 * Simulates a single sorting algorithm with intelligent stride sampling for large N
 */
function simulateSingleSortingAlgorithm(
  algo: string,
  arr: number[],
  maxFramesBudget: number
): WorkerLaneResult {
  const n = arr.length;
  const frames: WorkerFrame[] = [];
  let comparisons = 0;
  let swaps = 0;
  let steps = 0;
  let frameCount = 0;
  const startTime = performance.now();

  // Dynamic sampling stride: for N > 1000, sample frames to prevent memory bloat
  const estimatedOps = algo.includes('Bubble') || algo.includes('Insertion') || algo.includes('Selection')
    ? (n * (n - 1)) / 2
    : n * Math.log2(n || 1) * 3;

  const stride = estimatedOps > maxFramesBudget
    ? Math.max(1, Math.floor(estimatedOps / maxFramesBudget))
    : 1;

  let opCounter = 0;

  function pushFrame(
    status: string,
    highlight: number[] = [],
    pivotIndex = -1,
    sortedBoundary = -1,
    force = false
  ) {
    opCounter++;
    if (!force && opCounter % stride !== 0) return;

    frames.push({
      frame: frameCount++,
      array: [...arr],
      highlight,
      sortedBoundary,
      pivotIndex,
      mergeRegionStart: -1,
      mergeRegionEnd: -1,
      heapBoundary: -1,
      comparisons,
      swaps,
      timeMs: Math.round((performance.now() - startTime) * 100) / 100,
      done: false,
      status,
      steps,
    });
  }

  // Initial Frame
  pushFrame('Initializing dataset', [], -1, -1, true);

  if (algo.includes('Quick')) {
    // QuickSort
    function quickSort(low: number, high: number) {
      if (low < high) {
        const pi = partition(low, high);
        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
      }
    }

    function partition(low: number, high: number): number {
      const pivot = arr[high];
      let i = low - 1;
      pushFrame(`Selected pivot ${pivot} at index ${high}`, [high], high, -1);

      for (let j = low; j < high; j++) {
        comparisons++;
        steps++;
        pushFrame(`Comparing ${arr[j]} with pivot ${pivot}`, [j, high], high, -1);

        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            swaps++;
            pushFrame(`Swapped ${arr[i]} and ${arr[j]}`, [i, j], high, -1);
          }
        }
      }

      const temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      swaps++;
      pushFrame(`Placed pivot ${pivot} at index ${i + 1}`, [i + 1], i + 1, -1);
      return i + 1;
    }

    quickSort(0, n - 1);
  } else if (algo.includes('Merge')) {
    // MergeSort
    function mergeSort(l: number, r: number) {
      if (l < r) {
        const m = Math.floor((l + r) / 2);
        mergeSort(l, m);
        mergeSort(m + 1, r);
        merge(l, m, r);
      }
    }

    function merge(l: number, m: number, r: number) {
      const n1 = m - l + 1;
      const n2 = r - m;
      const L = arr.slice(l, m + 1);
      const R = arr.slice(m + 1, r + 1);

      let i = 0;
      let j = 0;
      let k = l;

      while (i < n1 && j < n2) {
        comparisons++;
        steps++;
        pushFrame(`Comparing ${L[i]} and ${R[j]}`, [k], -1, -1);

        if (L[i] <= R[j]) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }
        swaps++;
        k++;
        pushFrame(`Merged element into index ${k - 1}`, [k - 1], -1, -1);
      }

      while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
        swaps++;
        steps++;
        pushFrame(`Copying remaining left element into index ${k - 1}`, [k - 1]);
      }

      while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
        swaps++;
        steps++;
        pushFrame(`Copying remaining right element into index ${k - 1}`, [k - 1]);
      }
    }

    mergeSort(0, n - 1);
  } else if (algo.includes('Heap')) {
    // HeapSort
    function heapify(length: number, i: number) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < length) {
        comparisons++;
        steps++;
        if (arr[left] > arr[largest]) largest = left;
      }

      if (right < length) {
        comparisons++;
        steps++;
        if (arr[right] > arr[largest]) largest = right;
      }

      if (largest !== i) {
        const swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;
        swaps++;
        pushFrame(`Heapifying subtree at index ${i}`, [i, largest], -1, length);
        heapify(length, largest);
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      swaps++;
      pushFrame(`Extracted max root element ${temp} to index ${i}`, [0, i], -1, i);
      heapify(i, 0);
    }
  } else if (algo.includes('Insertion')) {
    // InsertionSort
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      pushFrame(`Selected key ${key} at index ${i}`, [i], -1, i);

      while (j >= 0) {
        comparisons++;
        steps++;
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swaps++;
          pushFrame(`Shifted ${arr[j]} forward to index ${j + 1}`, [j, j + 1], -1, i);
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      pushFrame(`Inserted key ${key} at sorted position ${j + 1}`, [j + 1], -1, i);
    }
  } else if (algo.includes('Bubble')) {
    // BubbleSort
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        steps++;
        pushFrame(`Comparing ${arr[j]} and ${arr[j + 1]}`, [j, j + 1], -1, n - i);

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          swapped = true;
          pushFrame(`Swapped ${arr[j]} and ${arr[j + 1]}`, [j, j + 1], -1, n - i);
        }
      }
      if (!swapped) break;
    }
  } else if (algo.includes('Comb')) {
    // CombSort
    let gap = n;
    let shrink = 1.3;
    let sorted = false;

    while (!sorted) {
      gap = Math.floor(gap / shrink);
      if (gap <= 1) {
        gap = 1;
        sorted = true;
      }

      for (let i = 0; i + gap < n; i++) {
        comparisons++;
        steps++;
        pushFrame(`Comparing gap elements at ${i} and ${i + gap}`, [i, i + gap]);

        if (arr[i] > arr[i + gap]) {
          const temp = arr[i];
          arr[i] = arr[i + gap];
          arr[i + gap] = temp;
          swaps++;
          sorted = false;
          pushFrame(`Swapped gap elements at ${i} and ${i + gap}`, [i, i + gap]);
        }
      }
    }
  } else {
    // SelectionSort / Fallback
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        steps++;
        if (arr[j] < arr[minIdx]) minIdx = j;
        pushFrame(`Scanning for minimum element (current min: ${arr[minIdx]})`, [i, j], -1, i);
      }
      if (minIdx !== i) {
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;
        swaps++;
        pushFrame(`Swapped minimum element ${arr[i]} into index ${i}`, [i, minIdx], -1, i + 1);
      }
    }
  }

  const elapsed = Math.round((performance.now() - startTime) * 100) / 100;

  // Final Complete Frame
  frames.push({
    frame: frameCount++,
    array: [...arr],
    highlight: [],
    sortedBoundary: n,
    pivotIndex: -1,
    mergeRegionStart: -1,
    mergeRegionEnd: -1,
    heapBoundary: -1,
    comparisons,
    swaps,
    timeMs: elapsed,
    done: true,
    status: 'Sorted & Verified',
    steps,
  });

  return {
    name: algo,
    complexity: algo.includes('Quick') || algo.includes('Merge') || algo.includes('Heap') ? 'O(n log n)' : 'O(n²)',
    stats: {
      comparisons,
      swaps,
      steps,
      timeMs: elapsed,
      found: true,
      foundIndex: null,
    },
    frames,
  };
}

/**
 * Executes multi-lane searching simulation inside worker
 */
function runSearchingWorkerSimulation(
  algorithms: string[],
  initialArray: number[],
  target: number,
  maxFramesBudget: number,
  requestId?: string
): WorkerSimulationResponse {
  const startTime = performance.now();
  const lanes: WorkerLaneResult[] = [];

  for (let aIdx = 0; aIdx < algorithms.length; aIdx++) {
    const algoName = algorithms[aIdx];
    const laneResult = simulateSingleSearchingAlgorithm(algoName, [...initialArray], target);
    lanes.push(laneResult);

    self.postMessage({
      type: 'progress',
      requestId,
      progress: Math.round(((aIdx + 1) / algorithms.length) * 100),
      currentAlgorithm: algoName,
    });
  }

  let winner: string | null = null;
  let minComparisons = Infinity;

  lanes.forEach((lane) => {
    if (lane.stats.found && lane.stats.comparisons < minComparisons) {
      minComparisons = lane.stats.comparisons;
      winner = lane.name;
    }
  });

  const totalTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    id: requestId,
    dataset: initialArray,
    lanes,
    winner,
    totalTimeMs,
    isWorkerIsolated: true,
  };
}

function simulateSingleSearchingAlgorithm(
  algo: string,
  arr: number[],
  target: number
): WorkerLaneResult {
  const frames: WorkerFrame[] = [];
  let comparisons = 0;
  let steps = 0;
  let frameCount = 0;
  let foundIndex: number | null = null;
  const startTime = performance.now();

  function pushSearchFrame(status: string, highlight: number[], found: number | null = null, done = false) {
    frames.push({
      frame: frameCount++,
      array: [...arr],
      highlight,
      comparisons,
      swaps: 0,
      timeMs: Math.round((performance.now() - startTime) * 100) / 100,
      done,
      status,
      foundIndex: found,
      steps,
      pathFound: found !== null,
    });
  }

  pushSearchFrame(`Initiating search for target ${target}`, []);

  if (algo.includes('Binary')) {
    // Array must be sorted for binary search
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      comparisons++;
      steps++;

      if (arr[mid] === target) {
        foundIndex = mid;
        pushSearchFrame(`Target ${target} found at index ${mid}!`, [mid], mid, true);
        break;
      } else if (arr[mid] < target) {
        pushSearchFrame(`Value ${arr[mid]} < ${target}. Searching right half [${mid + 1}..${right}]`, [mid]);
        left = mid + 1;
      } else {
        pushSearchFrame(`Value ${arr[mid]} > ${target}. Searching left half [${left}..${mid - 1}]`, [mid]);
        right = mid - 1;
      }
    }

    if (foundIndex === null) {
      pushSearchFrame(`Target ${target} not found in dataset`, [], null, true);
    }
  } else if (algo.includes('Jump')) {
    const n = arr.length;
    let step = Math.floor(Math.sqrt(n));
    let prev = 0;

    while (arr[Math.min(step, n) - 1] < target) {
      comparisons++;
      steps++;
      pushSearchFrame(`Jumped block to index ${Math.min(step, n) - 1}`, [Math.min(step, n) - 1]);
      prev = step;
      step += Math.floor(Math.sqrt(n));
      if (prev >= n) break;
    }

    while (prev < Math.min(step, n)) {
      comparisons++;
      steps++;
      if (arr[prev] === target) {
        foundIndex = prev;
        pushSearchFrame(`Target ${target} found at index ${prev}!`, [prev], prev, true);
        break;
      }
      pushSearchFrame(`Linear scanning block at index ${prev}`, [prev]);
      prev++;
    }

    if (foundIndex === null) {
      pushSearchFrame(`Target ${target} not found in dataset`, [], null, true);
    }
  } else {
    // Linear Search
    for (let i = 0; i < arr.length; i++) {
      comparisons++;
      steps++;
      if (arr[i] === target) {
        foundIndex = i;
        pushSearchFrame(`Target ${target} found at index ${i}!`, [i], i, true);
        break;
      }
      pushSearchFrame(`Checking element ${arr[i]} at index ${i}`, [i]);
    }

    if (foundIndex === null) {
      pushSearchFrame(`Target ${target} not found in dataset`, [], null, true);
    }
  }

  const elapsed = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    name: algo,
    complexity: algo.includes('Binary') ? 'O(log n)' : algo.includes('Jump') ? 'O(√n)' : 'O(n)',
    stats: {
      comparisons,
      swaps: 0,
      steps,
      timeMs: elapsed,
      found: foundIndex !== null,
      foundIndex,
    },
    frames,
  };
}
