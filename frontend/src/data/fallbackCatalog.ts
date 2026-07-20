import type { CatalogResponse } from '../models/types';

export const fallbackCatalog: CatalogResponse = {
  sortingAlgorithms: [
    'Bubble Sort',
    'Selection Sort',
    'Insertion Sort',
    'Merge Sort',
    'Quick Sort',
    'Heap Sort',
    'Comb Sort'
  ],
  searchingAlgorithms: [
    'Linear Search',
    'Binary Search',
    'Jump Search'
  ],
  pathfindingAlgorithms: [
    'BFS',
    'DFS',
    'Dijkstra',
    'A* Search'
  ],
  datasetTypes: [
    'Random',
    'Nearly Sorted',
    'Reversed',
    'Few Unique',
    'Custom'
  ],
  mazeTypes: [
    'Random Noise',
    'Recursive Division',
    'Simple Spiral',
    'Clear Grid'
  ],
  complexity: {
    'Bubble Sort': {
      best: 'O(n)',
      average: 'O(n^2)',
      worst: 'O(n^2)',
      space: 'O(1)',
      theory: 'Repeatedly compares adjacent values and pushes the largest unsorted value to the end.',
      pseudocode: 'for i = 0 to n - 1:\n  for j = 0 to n - i - 2:\n    if a[j] > a[j + 1]: swap'
    },
    'Selection Sort': {
      best: 'O(n^2)',
      average: 'O(n^2)',
      worst: 'O(n^2)',
      space: 'O(1)',
      theory: 'Selects the minimum value from the unsorted region and places it at the front.',
      pseudocode: 'for i = 0 to n - 1:\n  min = i\n  scan rest of array\n  swap a[i], a[min]'
    },
    'Insertion Sort': {
      best: 'O(n)',
      average: 'O(n^2)',
      worst: 'O(n^2)',
      space: 'O(1)',
      theory: 'Builds a sorted prefix by inserting each value into its correct position.',
      pseudocode: 'for i = 1 to n - 1:\n  key = a[i]\n  shift larger values right\n  place key'
    },
    'Merge Sort': {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)',
      theory: 'Divides the array, sorts each half, then merges sorted runs back together.',
      pseudocode: 'split until size 1\nmerge sorted halves'
    },
    'Quick Sort': {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n^2)',
      space: 'O(log n)',
      theory: 'Partitions around a pivot so smaller values move left and larger values move right.',
      pseudocode: 'partition around pivot\nquickSort left\nquickSort right'
    },
    'Heap Sort': {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(1)',
      theory: 'Turns the data into a max heap, then repeatedly extracts the maximum.',
      pseudocode: 'build max heap\nswap root with end\nheapify'
    },
    'Comb Sort': {
      best: 'O(n log n)',
      average: 'O(n^2/2^p)',
      worst: 'O(n^2)',
      space: 'O(1)',
      theory: 'Improves Bubble Sort by comparing values with a shrinking gap before finishing with gap one.',
      pseudocode: 'gap = n\nshrink gap by 1.3\ncompare a[i] and a[i + gap]'
    },
    'Linear Search': {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(1)',
      theory: 'Checks each item in order until the target is found or the list ends.',
      pseudocode: 'for each value:\n  compare with target'
    },
    'Binary Search': {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(1)',
      theory: 'Requires sorted data and halves the remaining search range after every comparison.',
      pseudocode: 'low = 0, high = n - 1\nwhile low <= high:\n  compare middle'
    },
    'Jump Search': {
      best: 'O(1)',
      average: 'O(sqrt n)',
      worst: 'O(sqrt n)',
      space: 'O(1)',
      theory: 'Jumps by block size on sorted data, then scans linearly inside the matching block.',
      pseudocode: 'jump by sqrt(n)\nlinear scan inside block'
    },
    'BFS': {
      best: 'O(V+E)',
      average: 'O(V+E)',
      worst: 'O(V+E)',
      space: 'O(V)',
      theory: 'Explores evenly outward from the start and finds shortest paths in unweighted grids.',
      pseudocode: 'queue.add(start)\nvisit neighbors breadth-first'
    },
    'DFS': {
      best: 'O(V+E)',
      average: 'O(V+E)',
      worst: 'O(V+E)',
      space: 'O(V)',
      theory: 'Explores deeply down one route before backtracking. It is fast to demonstrate but not shortest-path focused.',
      pseudocode: 'stack.push(start)\nvisit neighbors depth-first'
    },
    'Dijkstra': {
      best: 'O(E log V)',
      average: 'O(E log V)',
      worst: 'O(E log V)',
      space: 'O(V)',
      theory: 'Always expands the currently cheapest known node and handles weighted shortest paths.',
      pseudocode: 'dist[start] = 0\nrelax cheapest frontier node'
    },
    'A* Search': {
      best: 'O(E)',
      average: 'O(E)',
      worst: 'O(b^d)',
      space: 'O(V)',
      theory: 'Combines travelled distance with a heuristic estimate to guide the search toward the goal.',
      pseudocode: 'choose lowest f = g + h\nrelax neighbors'
    }
  }
};
