/**
 * gymProceduralGenerator.ts
 * Generates infinite procedural algorithm showdown scenarios with dynamic mathematical datasets.
 */

import { RacePredictionChallenge, ShowdownContender } from '../models/gymTypes';

export type DistributionPattern = 'organ-pipe' | 'sawtooth' | 'gaussian' | 'step-staircase' | 'heavy-duplicates';

export function generateMathematicalDataset(size: number, pattern: DistributionPattern): number[] {
  const n = Math.max(20, Math.min(300, size));
  const arr: number[] = [];

  switch (pattern) {
    case 'organ-pipe': {
      // Ascends to middle, then descends
      const mid = Math.floor(n / 2);
      for (let i = 0; i < mid; i++) {
        arr.push(Math.floor((i / mid) * 800) + 50);
      }
      for (let i = mid; i < n; i++) {
        arr.push(Math.floor(((n - i) / (n - mid)) * 800) + 50);
      }
      break;
    }

    case 'sawtooth': {
      // 4 ascending ramps
      const ramps = 4;
      const rampSize = Math.floor(n / ramps);
      for (let r = 0; r < ramps; r++) {
        for (let i = 0; i < rampSize; i++) {
          arr.push(Math.floor((i / rampSize) * 600) + 100);
        }
      }
      while (arr.length < n) arr.push(300);
      break;
    }

    case 'gaussian': {
      // Box-Muller transform for normal distribution around mean 450, stdDev 120
      for (let i = 0; i < n; i++) {
        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        const val = Math.max(20, Math.min(950, Math.floor(450 + z * 120)));
        arr.push(val);
      }
      break;
    }

    case 'step-staircase': {
      // Step plateaus of width 10
      const steps = Math.ceil(n / 10);
      for (let s = 0; s < steps; s++) {
        for (let i = 0; i < 10 && arr.length < n; i++) {
          arr.push((s + 1) * 80);
        }
      }
      break;
    }

    case 'heavy-duplicates':
    default: {
      const vals = [100, 250, 500, 750];
      for (let i = 0; i < n; i++) {
        arr.push(vals[Math.floor(Math.random() * vals.length)]);
      }
      break;
    }
  }

  return arr;
}

const CANDIDATE_ALGORITHMS: ShowdownContender[] = [
  {
    name: 'Quick Sort',
    algorithmKey: 'Quick Sort',
    timeComplexity: 'O(N log N) avg',
    spaceComplexity: 'O(log N)',
    color: '#38bdf8',
    expectedBehavior: 'High-speed in-place partitioning with pivot swaps.',
  },
  {
    name: 'Merge Sort',
    algorithmKey: 'Merge Sort',
    timeComplexity: 'O(N log N) guaranteed',
    spaceComplexity: 'O(N)',
    color: '#818cf8',
    expectedBehavior: 'Stable divide-and-conquer auxiliary buffer merging.',
  },
  {
    name: 'Heap Sort',
    algorithmKey: 'Heap Sort',
    timeComplexity: 'O(N log N) guaranteed',
    spaceComplexity: 'O(1)',
    color: '#34d399',
    expectedBehavior: 'In-place binary heap extraction with O(1) extra space.',
  },
  {
    name: 'Insertion Sort',
    algorithmKey: 'Insertion Sort',
    timeComplexity: 'O(N + K) adaptive',
    spaceComplexity: 'O(1)',
    color: '#fbbf24',
    expectedBehavior: 'Fast for small/near-sorted arrays, quadratic for reverse/random.',
  },
  {
    name: 'Bubble Sort',
    algorithmKey: 'Bubble Sort',
    timeComplexity: 'O(N^2) baseline',
    spaceComplexity: 'O(1)',
    color: '#f87171',
    expectedBehavior: 'Adjacent pairwise swaps with high comparison count.',
  },
];

export function generateProceduralChallenge(seed?: number): RacePredictionChallenge {
  const seedVal = seed !== undefined ? seed : Date.now();
  const patterns: DistributionPattern[] = ['organ-pipe', 'sawtooth', 'gaussian', 'step-staircase', 'heavy-duplicates'];
  const pattern = patterns[Math.abs(seedVal) % patterns.length];

  const size = 60 + (Math.abs(seedVal * 7) % 80);
  const dataset = generateMathematicalDataset(size, pattern);

  // Pick 3 algorithms
  const contenderKeys = ['Quick Sort', 'Merge Sort', 'Heap Sort'];
  if (pattern === 'step-staircase' || pattern === 'heavy-duplicates') {
    contenderKeys[1] = 'Insertion Sort';
  }

  const contenders = CANDIDATE_ALGORITHMS.filter((c) => contenderKeys.includes(c.algorithmKey));

  const patternTitles: Record<DistributionPattern, string> = {
    'organ-pipe': 'Procedural Arena: The Organ-Pipe Peak Distribution',
    'sawtooth': 'Procedural Arena: Periodic Sawtooth Ramps',
    'gaussian': 'Procedural Arena: Gaussian Normal Distribution',
    'step-staircase': 'Procedural Arena: Discrete Plateau Staircase',
    'heavy-duplicates': 'Procedural Arena: Quad-Value Duplicate Array',
  };

  const patternDescriptions: Record<DistributionPattern, string> = {
    'organ-pipe': `An array of N=${size} structured as a symmetrical V-peak (ascending then descending). Tests pivot partition balance.`,
    'sawtooth': `An array of N=${size} containing 4 repeating ascending ramps. Tests multi-run exploitation.`,
    'gaussian': `An array of N=${size} elements sampled from a Gaussian Normal curve (mean 450, stdDev 120).`,
    'step-staircase': `An array of N=${size} arranged in equal-value plateau steps.`,
    'heavy-duplicates': `An array of N=${size} containing only 4 unique quantized values.`,
  };

  const expectedWinner = pattern === 'step-staircase' ? 'Insertion Sort' : 'Quick Sort';

  return {
    id: `procedural-${seedVal}`,
    title: patternTitles[pattern],
    category: 'sorting',
    difficulty: 'Intermediate',
    scenarioDescription: patternDescriptions[pattern],
    datasetType: pattern,
    datasetSize: size,
    datasetPreview: dataset.slice(0, 12),
    contenders,
    correctWinner: expectedWinner,
    wagerQuestion: `Given this ${pattern} mathematical distribution of ${size} elements, which algorithm will optimize comparisons and finish first?`,
    options: [
      {
        id: 'opt-1',
        label: `${contenders[0]?.name || 'Quick Sort'} — Dominates cache efficiency and pivot partitioning on this dataset.`,
        isCorrect: expectedWinner === (contenders[0]?.algorithmKey || 'Quick Sort'),
        explanation: 'QuickSort thrives when partition elements divide work near the median.',
      },
      {
        id: 'opt-2',
        label: `${contenders[1]?.name || 'Merge Sort'} — Guarantees perfect divide-and-conquer balanced sub-problems.`,
        isCorrect: expectedWinner === (contenders[1]?.algorithmKey || 'Merge Sort'),
        explanation: 'MergeSort provides rock-solid O(N log N) runtime irrespective of distribution anomalies.',
      },
      {
        id: 'opt-3',
        label: `${contenders[2]?.name || 'Heap Sort'} — Minimal memory footprint with fixed tree depth extractions.`,
        isCorrect: expectedWinner === (contenders[2]?.algorithmKey || 'Heap Sort'),
        explanation: 'HeapSort never degrades, guaranteeing O(N log N) execution.',
      },
    ],
    postMortem: {
      theoreticalWinner: expectedWinner,
      whyWinnerWon: `On ${pattern} data, cache-locality and low overhead give ${expectedWinner} the decisive edge over competing contenders.`,
      whyLosersFailed: 'Algorithms with auxiliary allocation or high constant factors spend more memory cycles per comparison.',
      realWorldLesson: 'Mathematical distributions in real databases (timestamps, user IDs, sensor readings) frequently exhibit these exact curves.',
      leetCodeRelevance: 'Recognizing dataset shapes allows selecting the optimal standard library sort or partition strategy.',
    },
  };
}
