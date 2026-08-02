/**
 * simulationWorker.ts
 * Offloads heavy sorting & searching algorithm frame generation to a Web Worker thread,
 * ensuring the main UI thread remains responsive at 60 FPS even for large datasets.
 */

export interface WorkerSimulationRequest {
  type: 'sorting' | 'searching';
  algorithm: string;
  array: number[];
  target?: number;
}

export interface WorkerSimulationResponse {
  algorithm: string;
  frames: Array<{
    frame: number;
    array?: number[];
    comparing?: number[];
    swaps?: number;
    comparisons?: number;
    done?: boolean;
    foundIndex?: number | null;
  }>;
}

self.onmessage = (event: MessageEvent<WorkerSimulationRequest>) => {
  const { type, algorithm, array, target } = event.data;

  if (type === 'sorting') {
    const frames = simulateSortingWorker(algorithm, [...array]);
    self.postMessage({ algorithm, frames });
  } else if (type === 'searching') {
    const frames = simulateSearchingWorker(algorithm, [...array], target ?? 0);
    self.postMessage({ algorithm, frames });
  }
};

function simulateSortingWorker(algorithm: string, arr: number[]) {
  const frames: WorkerSimulationResponse['frames'] = [];
  let comparisons = 0;
  let swaps = 0;
  let frameCount = 0;

  // Record initial frame
  frames.push({
    frame: frameCount++,
    array: [...arr],
    comparing: [],
    swaps: 0,
    comparisons: 0,
    done: false,
  });

  const n = arr.length;

  if (algorithm.includes('Bubble')) {
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        frames.push({
          frame: frameCount++,
          array: [...arr],
          comparing: [j, j + 1],
          swaps,
          comparisons,
          done: false,
        });

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          frames.push({
            frame: frameCount++,
            array: [...arr],
            comparing: [j, j + 1],
            swaps,
            comparisons,
            done: false,
          });
        }
      }
    }
  } else {
    // Standard Selection Sort fallback for worker simulation
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
        frames.push({
          frame: frameCount++,
          array: [...arr],
          comparing: [i, j],
          swaps,
          comparisons,
          done: false,
        });
      }
      if (minIdx !== i) {
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;
        swaps++;
        frames.push({
          frame: frameCount++,
          array: [...arr],
          comparing: [i, minIdx],
          swaps,
          comparisons,
          done: false,
        });
      }
    }
  }

  // Final frame
  frames.push({
    frame: frameCount++,
    array: [...arr],
    comparing: [],
    swaps,
    comparisons,
    done: true,
  });

  return frames;
}

function simulateSearchingWorker(algorithm: string, arr: number[], target: number) {
  const frames: WorkerSimulationResponse['frames'] = [];
  let comparisons = 0;
  let frameCount = 0;
  let foundIndex: number | null = null;

  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    const match = arr[i] === target;
    if (match) foundIndex = i;

    frames.push({
      frame: frameCount++,
      array: [...arr],
      comparing: [i],
      comparisons,
      done: match || i === arr.length - 1,
      foundIndex,
    });

    if (match) break;
  }

  return frames;
}
