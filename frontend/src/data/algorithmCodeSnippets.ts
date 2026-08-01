export type SupportedLanguage = 'typescript' | 'java' | 'python' | 'cpp';
export type StepOperation = 'compare' | 'swap' | 'pivot' | 'region' | 'done' | 'loop' | 'found' | 'notfound' | 'visit' | 'idle';

export interface LineHighlight {
  line: number;        // 0-indexed line to highlight
  operation: StepOperation; // operation type for color coding
}

export interface CodeSnippet {
  language: SupportedLanguage;
  displayName: string;
  code: string;
  /**
   * Returns both the highlighted line index AND the operation type.
   * The operation type drives distinct color-coding in the UI.
   */
  getHighlight: (
    stepType: StepOperation,
    extra?: { frame?: any; totalFrames?: number }
  ) => LineHighlight;
}

export interface AlgorithmCodeCollection {
  algorithmId: string;
  algorithmName: string;
  languages: Record<SupportedLanguage, CodeSnippet>;
}

/* ─── Helper: create a highlight builder for common sorting patterns ─── */
function sortHighlight(lines: {
  fnDecl: number;
  outerLoop: number;
  innerLoop: number;
  compare: number;
  swap: number;
  doneReturn: number;
}) {
  return (type: StepOperation, extra?: any): LineHighlight => {
    const f = extra?.frame?.frame ?? 0;
    switch (type) {
      case 'done':    return { line: lines.doneReturn, operation: 'done' };
      case 'swap':    return { line: lines.swap, operation: 'swap' };
      case 'compare': return { line: lines.compare, operation: 'compare' };
      case 'pivot':   return { line: lines.compare, operation: 'pivot' };
      case 'region':  return { line: lines.innerLoop, operation: 'region' };
      case 'loop':    return { line: f % 2 === 0 ? lines.innerLoop : lines.outerLoop, operation: 'loop' };
      default:        return { line: lines.fnDecl, operation: 'idle' };
    }
  };
}

/* ─── Helper: create a highlight builder for search patterns ─── */
function searchHighlight(lines: {
  init: number;
  loopHead: number;
  checkTarget: number;
  narrow: number;
  found: number;
  notFound: number;
}) {
  return (type: StepOperation, extra?: any): LineHighlight => {
    switch (type) {
      case 'found':    return { line: lines.found, operation: 'found' };
      case 'notfound': return { line: lines.notFound, operation: 'notfound' };
      case 'done': {
        const foundIdx = extra?.frame?.foundIndex;
        return (foundIdx !== null && foundIdx !== undefined && foundIdx >= 0)
          ? { line: lines.found, operation: 'found' }
          : { line: lines.notFound, operation: 'notfound' };
      }
      case 'compare':  return { line: lines.checkTarget, operation: 'compare' };
      case 'loop':     return { line: lines.loopHead, operation: 'loop' };
      default:         return { line: lines.init, operation: 'idle' };
    }
  };
}

/* ─── Helper: create a highlight builder for pathfinding patterns ─── */
function pathHighlight(lines: {
  init: number;
  dequeue: number;
  checkTarget: number;
  expand: number;
  addNeighbor: number;
  found: number;
  notFound: number;
}) {
  return (type: StepOperation, extra?: any): LineHighlight => {
    switch (type) {
      case 'found':    return { line: lines.found, operation: 'found' };
      case 'notfound': return { line: lines.notFound, operation: 'notfound' };
      case 'done':
        return extra?.frame?.pathFound
          ? { line: lines.found, operation: 'found' }
          : { line: lines.notFound, operation: 'notfound' };
      case 'visit':    return { line: lines.dequeue, operation: 'visit' };
      case 'compare':  return { line: lines.checkTarget, operation: 'compare' };
      case 'loop':     return { line: lines.expand, operation: 'loop' };
      default:         return { line: lines.init, operation: 'idle' };
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ALGORITHM CODE SNIPPETS — Complete, Production-Grade Implementations
   ═══════════════════════════════════════════════════════════════════════════ */

export const ALGORITHM_CODE_SNIPPETS: Record<string, AlgorithmCodeCollection> = {

  /* ────────────────── BUBBLE SORT ────────────────── */
  bubblesort: {
    algorithmId: 'bubblesort',
    algorithmName: 'Bubble Sort',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {           // compare
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // swap
      }
    }
  }
  return arr;
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 2, innerLoop: 3, compare: 4, swap: 5, doneReturn: 9 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {      // compare
                int temp = arr[j];
                arr[j] = arr[j + 1];         // swap
                arr[j + 1] = temp;
            }
        }
    }
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 2, innerLoop: 3, compare: 4, swap: 6, doneReturn: 10 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:          # compare
                arr[j], arr[j + 1] = arr[j + 1], arr[j]  # swap
    return arr`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 2, innerLoop: 3, compare: 4, swap: 5, doneReturn: 6 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {       // compare
                std::swap(arr[j], arr[j + 1]); // swap
            }
        }
    }
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 2, innerLoop: 3, compare: 4, swap: 5, doneReturn: 8 }),
      },
    },
  },

  /* ────────────────── SELECTION SORT ────────────────── */
  selectionsort: {
    algorithmId: 'selectionsort',
    algorithmName: 'Selection Sort',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function selectionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {            // compare
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; // swap
    }
  }
  return arr;
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 2, innerLoop: 4, compare: 5, swap: 10, doneReturn: 13 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j; // compare
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];                 // swap
        arr[i] = temp;
    }
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 2, innerLoop: 4, compare: 5, swap: 8, doneReturn: 10 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:         # compare
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]  # swap
    return arr`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 2, innerLoop: 4, compare: 5, swap: 7, doneReturn: 8 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `void selectionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j; // compare
        }
        std::swap(arr[i], arr[minIdx]);       // swap
    }
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 2, innerLoop: 4, compare: 5, swap: 7, doneReturn: 8 }),
      },
    },
  },

  /* ────────────────── INSERTION SORT ────────────────── */
  insertionsort: {
    algorithmId: 'insertionsort',
    algorithmName: 'Insertion Sort',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function insertionSort(arr: number[]): number[] {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {         // compare
      arr[j + 1] = arr[j];                   // shift (swap)
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 1, innerLoop: 3, compare: 4, swap: 5, doneReturn: 9 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {     // compare
            arr[j + 1] = arr[j];             // shift
            j--;
        }
        arr[j + 1] = key;
    }
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 1, innerLoop: 3, compare: 4, swap: 5, doneReturn: 9 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:       # compare
            arr[j + 1] = arr[j]              # shift
            j -= 1
        arr[j + 1] = key
    return arr`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 1, innerLoop: 3, compare: 4, swap: 5, doneReturn: 8 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `void insertionSort(std::vector<int>& arr) {
    for (size_t i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {     // compare
            arr[j + 1] = arr[j];             // shift
            j--;
        }
        arr[j + 1] = key;
    }
}`,
        getHighlight: sortHighlight({ fnDecl: 0, outerLoop: 1, innerLoop: 3, compare: 4, swap: 5, doneReturn: 9 }),
      },
    },
  },

  /* ────────────────── QUICK SORT ────────────────── */
  quicksort: {
    algorithmId: 'quicksort',
    algorithmName: 'Quick Sort',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function quickSort(arr: number[], lo = 0, hi = arr.length - 1) {
  if (lo < hi) {
    const pi = partition(arr, lo, hi);        // partition
    quickSort(arr, lo, pi - 1);               // recurse left
    quickSort(arr, pi + 1, hi);               // recurse right
  }
  return arr;
}

function partition(arr: number[], lo: number, hi: number) {
  const pivot = arr[hi];                      // choose pivot
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {                     // compare
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];   // swap
    }
  }
  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]]; // place pivot
  return i + 1;
}`,
        getHighlight: (type, extra) => {
          const f = extra?.frame?.frame ?? 0;
          switch (type) {
            case 'done':    return { line: 6, operation: 'done' };
            case 'pivot':   return { line: 10, operation: 'pivot' };
            case 'swap':    return { line: 15, operation: 'swap' };
            case 'compare': return { line: 13, operation: 'compare' };
            case 'loop':    return { line: f % 2 === 0 ? 12 : 2, operation: 'loop' };
            default:        return { line: 0, operation: 'idle' };
          }
        },
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `public static void quickSort(int[] arr, int lo, int hi) {
    if (lo < hi) {
        int pi = partition(arr, lo, hi);
        quickSort(arr, lo, pi - 1);
        quickSort(arr, pi + 1, hi);
    }
}

static int partition(int[] arr, int lo, int hi) {
    int pivot = arr[hi];                      // choose pivot
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (arr[j] < pivot) {                 // compare
            i++;
            int t = arr[i]; arr[i] = arr[j]; arr[j] = t; // swap
        }
    }
    int t = arr[i+1]; arr[i+1] = arr[hi]; arr[hi] = t;
    return i + 1;
}`,
        getHighlight: (type, extra) => {
          const f = extra?.frame?.frame ?? 0;
          switch (type) {
            case 'done':    return { line: 5, operation: 'done' };
            case 'pivot':   return { line: 9, operation: 'pivot' };
            case 'swap':    return { line: 14, operation: 'swap' };
            case 'compare': return { line: 12, operation: 'compare' };
            case 'loop':    return { line: f % 2 === 0 ? 11 : 2, operation: 'loop' };
            default:        return { line: 0, operation: 'idle' };
          }
        },
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def quick_sort(arr, lo=0, hi=None):
    if hi is None: hi = len(arr) - 1
    if lo < hi:
        pi = partition(arr, lo, hi)
        quick_sort(arr, lo, pi - 1)
        quick_sort(arr, pi + 1, hi)
    return arr

def partition(arr, lo, hi):
    pivot = arr[hi]                           # choose pivot
    i = lo - 1
    for j in range(lo, hi):
        if arr[j] < pivot:                    # compare
            i += 1
            arr[i], arr[j] = arr[j], arr[i]  # swap
    arr[i+1], arr[hi] = arr[hi], arr[i+1]
    return i + 1`,
        getHighlight: (type, extra) => {
          const f = extra?.frame?.frame ?? 0;
          switch (type) {
            case 'done':    return { line: 6, operation: 'done' };
            case 'pivot':   return { line: 9, operation: 'pivot' };
            case 'swap':    return { line: 14, operation: 'swap' };
            case 'compare': return { line: 12, operation: 'compare' };
            case 'loop':    return { line: f % 2 === 0 ? 11 : 3, operation: 'loop' };
            default:        return { line: 0, operation: 'idle' };
          }
        },
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `void quickSort(vector<int>& arr, int lo, int hi) {
    if (lo < hi) {
        int pi = partition(arr, lo, hi);
        quickSort(arr, lo, pi - 1);
        quickSort(arr, pi + 1, hi);
    }
}

int partition(vector<int>& arr, int lo, int hi) {
    int pivot = arr[hi];                      // choose pivot
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (arr[j] < pivot) {                 // compare
            i++;
            swap(arr[i], arr[j]);             // swap
        }
    }
    swap(arr[i + 1], arr[hi]);
    return i + 1;
}`,
        getHighlight: (type, extra) => {
          const f = extra?.frame?.frame ?? 0;
          switch (type) {
            case 'done':    return { line: 5, operation: 'done' };
            case 'pivot':   return { line: 9, operation: 'pivot' };
            case 'swap':    return { line: 14, operation: 'swap' };
            case 'compare': return { line: 12, operation: 'compare' };
            case 'loop':    return { line: f % 2 === 0 ? 11 : 2, operation: 'loop' };
            default:        return { line: 0, operation: 'idle' };
          }
        },
      },
    },
  },

  /* ────────────────── MERGE SORT ────────────────── */
  mergesort: {
    algorithmId: 'mergesort',
    algorithmName: 'Merge Sort',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));  // split left
  const right = mergeSort(arr.slice(mid));    // split right
  return merge(left, right);                  // merge
}

function merge(L: number[], R: number[]): number[] {
  const result: number[] = [];
  while (L.length && R.length) {
    if (L[0] <= R[0]) result.push(L.shift()!);  // compare & pick
    else result.push(R.shift()!);
  }
  return [...result, ...L, ...R];
}`,
        getHighlight: (type, extra) => {
          const f = extra?.frame?.frame ?? 0;
          switch (type) {
            case 'done':    return { line: 5, operation: 'done' };
            case 'region':  return { line: 2, operation: 'region' };
            case 'compare': return { line: 11, operation: 'compare' };
            case 'swap':    return { line: 12, operation: 'swap' };
            case 'loop':    return { line: f % 2 === 0 ? 10 : 3, operation: 'loop' };
            default:        return { line: 0, operation: 'idle' };
          }
        },
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `public static void mergeSort(int[] a, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(a, l, m);                   // split left
        mergeSort(a, m + 1, r);               // split right
        merge(a, l, m, r);                    // merge
    }
}`,
        getHighlight: (type, extra) => {
          const f = extra?.frame?.frame ?? 0;
          switch (type) {
            case 'done':    return { line: 6, operation: 'done' };
            case 'region':  return { line: 2, operation: 'region' };
            case 'compare': return { line: 5, operation: 'compare' };
            case 'loop':    return { line: f % 2 === 0 ? 3 : 4, operation: 'loop' };
            default:        return { line: 0, operation: 'idle' };
          }
        },
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])              # split left
    right = merge_sort(arr[mid:])             # split right
    return merge(left, right)                 # merge`,
        getHighlight: (type, extra) => {
          const f = extra?.frame?.frame ?? 0;
          switch (type) {
            case 'done':    return { line: 5, operation: 'done' };
            case 'region':  return { line: 2, operation: 'region' };
            case 'compare': return { line: 5, operation: 'compare' };
            case 'loop':    return { line: f % 2 === 0 ? 3 : 4, operation: 'loop' };
            default:        return { line: 0, operation: 'idle' };
          }
        },
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `void mergeSort(vector<int>& a, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(a, l, m);                   // split left
        mergeSort(a, m + 1, r);               // split right
        merge(a, l, m, r);                    // merge
    }
}`,
        getHighlight: (type, extra) => {
          const f = extra?.frame?.frame ?? 0;
          switch (type) {
            case 'done':    return { line: 6, operation: 'done' };
            case 'region':  return { line: 2, operation: 'region' };
            case 'compare': return { line: 5, operation: 'compare' };
            case 'loop':    return { line: f % 2 === 0 ? 3 : 4, operation: 'loop' };
            default:        return { line: 0, operation: 'idle' };
          }
        },
      },
    },
  },

  /* ────────────────── LINEAR SEARCH ────────────────── */
  linearsearch: {
    algorithmId: 'linearsearch',
    algorithmName: 'Linear Search',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {      // iterate
    if (arr[i] === target) {                   // compare
      return i;                                // found!
    }
  }
  return -1;                                   // not found
}`,
        getHighlight: searchHighlight({ init: 0, loopHead: 1, checkTarget: 2, narrow: 1, found: 3, notFound: 6 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {    // iterate
        if (arr[i] == target) {               // compare
            return i;                         // found!
        }
    }
    return -1;                                // not found
}`,
        getHighlight: searchHighlight({ init: 0, loopHead: 1, checkTarget: 2, narrow: 1, found: 3, notFound: 6 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def linear_search(arr, target):
    for i in range(len(arr)):                 # iterate
        if arr[i] == target:                  # compare
            return i                          # found!
    return -1                                 # not found`,
        getHighlight: searchHighlight({ init: 0, loopHead: 1, checkTarget: 2, narrow: 1, found: 3, notFound: 4 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `int linearSearch(const vector<int>& arr, int target) {
    for (size_t i = 0; i < arr.size(); i++) { // iterate
        if (arr[i] == target) {               // compare
            return i;                         // found!
        }
    }
    return -1;                                // not found
}`,
        getHighlight: searchHighlight({ init: 0, loopHead: 1, checkTarget: 2, narrow: 1, found: 3, notFound: 6 }),
      },
    },
  },

  /* ────────────────── BINARY SEARCH ────────────────── */
  binarysearch: {
    algorithmId: 'binarysearch',
    algorithmName: 'Binary Search',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {                          // loop
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;       // found!
    if (arr[mid] < target) lo = mid + 1;      // narrow right
    else hi = mid - 1;                        // narrow left
  }
  return -1;                                  // not found
}`,
        getHighlight: searchHighlight({ init: 1, loopHead: 2, checkTarget: 4, narrow: 5, found: 4, notFound: 8 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `public static int binarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi) {                        // loop
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;   // found!
        if (arr[mid] < target) lo = mid + 1; // narrow right
        else hi = mid - 1;                   // narrow left
    }
    return -1;                               // not found
}`,
        getHighlight: searchHighlight({ init: 1, loopHead: 2, checkTarget: 4, narrow: 5, found: 4, notFound: 8 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:                           # loop
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid     # found!
        elif arr[mid] < target: lo = mid + 1  # narrow right
        else: hi = mid - 1                   # narrow left
    return -1                                # not found`,
        getHighlight: searchHighlight({ init: 1, loopHead: 2, checkTarget: 4, narrow: 5, found: 4, notFound: 7 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `int binarySearch(const vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {                        // loop
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;   // found!
        if (arr[mid] < target) lo = mid + 1; // narrow right
        else hi = mid - 1;                   // narrow left
    }
    return -1;                               // not found
}`,
        getHighlight: searchHighlight({ init: 1, loopHead: 2, checkTarget: 4, narrow: 5, found: 4, notFound: 8 }),
      },
    },
  },

  /* ────────────────── BFS ────────────────── */
  bfs: {
    algorithmId: 'bfs',
    algorithmName: 'BFS',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function bfs(grid: Grid, start: Node, target: Node): Path {
  const queue: Node[] = [start];
  const visited = new Set<string>([start.id]);
  while (queue.length > 0) {                  // process queue
    const curr = queue.shift()!;              // dequeue
    if (curr === target) return getPath(curr); // found!
    for (const nb of neighbors(curr, grid)) { // expand
      if (!visited.has(nb.id)) {
        visited.add(nb.id);
        queue.push(nb);                       // enqueue
      }
    }
  }
  return [];                                  // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 9, found: 5, notFound: 12 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `List<Node> bfs(Grid grid, Node start, Node target) {
    Queue<Node> q = new LinkedList<>(List.of(start));
    Set<Node> visited = new HashSet<>(Set.of(start));
    while (!q.isEmpty()) {                    // process queue
        Node curr = q.poll();                 // dequeue
        if (curr.equals(target)) return getPath(curr);
        for (Node nb : grid.neighbors(curr)) {  // expand
            if (!visited.contains(nb)) {
                visited.add(nb);
                q.add(nb);                    // enqueue
            }
        }
    }
    return Collections.emptyList();           // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 9, found: 5, notFound: 13 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def bfs(grid, start, target):
    queue = deque([start])
    visited = {start}
    while queue:                              # process queue
        curr = queue.popleft()                # dequeue
        if curr == target: return get_path(curr)  # found!
        for nb in grid.neighbors(curr):       # expand
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)              # enqueue
    return []                                 # no path`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 9, found: 5, notFound: 10 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `vector<Node> bfs(Grid& grid, Node start, Node target) {
    queue<Node> q; q.push(start);
    unordered_set<Node> visited = {start};
    while (!q.empty()) {                      // process queue
        Node curr = q.front(); q.pop();       // dequeue
        if (curr == target) return getPath(curr);
        for (auto& nb : grid.neighbors(curr)) { // expand
            if (!visited.count(nb)) {
                visited.insert(nb);
                q.push(nb);                   // enqueue
            }
        }
    }
    return {};                                // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 9, found: 5, notFound: 13 }),
      },
    },
  },

  /* ────────────────── DIJKSTRA ────────────────── */
  dijkstra: {
    algorithmId: 'dijkstra',
    algorithmName: "Dijkstra's Algorithm",
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function dijkstra(grid: Grid, start: Node, target: Node): Path {
  const dist = new Map([[start, 0]]);
  const pq = new MinHeap<Node>(); pq.push(start);
  while (!pq.isEmpty()) {                     // process queue
    const curr = pq.pop()!;                   // dequeue min
    if (curr === target) return getPath(curr); // found!
    for (const nb of neighbors(curr, grid)) { // relax edges
      const alt = dist.get(curr)! + nb.weight;
      if (alt < (dist.get(nb) ?? Infinity)) {
        dist.set(nb, alt);
        pq.push(nb);                         // enqueue
      }
    }
  }
  return [];                                  // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 10, found: 5, notFound: 13 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `List<Node> dijkstra(Grid grid, Node start, Node target) {
    Map<Node, Integer> dist = new HashMap<>(); dist.put(start, 0);
    PriorityQueue<Node> pq = new PriorityQueue<>(comparingInt(dist::get));
    pq.add(start);
    while (!pq.isEmpty()) {                   // process queue
        Node curr = pq.poll();                // dequeue min
        if (curr.equals(target)) return getPath(curr);
        for (Node nb : grid.neighbors(curr)) {  // relax edges
            int alt = dist.get(curr) + nb.weight;
            if (alt < dist.getOrDefault(nb, MAX_VALUE)) {
                dist.put(nb, alt);
                pq.add(nb);                  // enqueue
            }
        }
    }
    return Collections.emptyList();           // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 5, checkTarget: 6, expand: 7, addNeighbor: 11, found: 6, notFound: 15 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def dijkstra(grid, start, target):
    dist = {start: 0}
    pq = [(0, start)]
    while pq:                                 # process queue
        d, curr = heapq.heappop(pq)           # dequeue min
        if curr == target: return get_path(curr)  # found!
        for nb in grid.neighbors(curr):       # relax edges
            alt = d + nb.weight
            if alt < dist.get(nb, float('inf')):
                dist[nb] = alt
                heapq.heappush(pq, (alt, nb)) # enqueue
    return []                                 # no path`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 10, found: 5, notFound: 11 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `vector<Node> dijkstra(Grid& grid, Node start, Node target) {
    unordered_map<Node, int> dist; dist[start] = 0;
    priority_queue<pair<int,Node>> pq; pq.push({0, start});
    while (!pq.empty()) {                     // process queue
        auto [d, curr] = pq.top(); pq.pop();  // dequeue min
        if (curr == target) return getPath(curr);
        for (auto& nb : grid.neighbors(curr)) { // relax edges
            int alt = -d + nb.weight;
            if (alt < dist[nb]) {
                dist[nb] = alt;
                pq.push({-alt, nb});          // enqueue
            }
        }
    }
    return {};                                // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 10, found: 5, notFound: 14 }),
      },
    },
  },

  /* ────────────────── DFS ────────────────── */
  dfs: {
    algorithmId: 'dfs',
    algorithmName: 'DFS',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function dfs(grid: Grid, start: Node, target: Node): Path {
  const stack: Node[] = [start];
  const visited = new Set<string>();
  while (stack.length > 0) {                  // process stack
    const curr = stack.pop()!;                // pop node
    if (curr === target) return getPath(curr); // found!
    if (!visited.has(curr.id)) {
      visited.add(curr.id);
      for (const nb of neighbors(curr, grid)) { // expand
        stack.push(nb);                       // push
      }
    }
  }
  return [];                                  // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 8, addNeighbor: 9, found: 5, notFound: 13 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `List<Node> dfs(Grid grid, Node start, Node target) {
    Stack<Node> stack = new Stack<>(); stack.push(start);
    Set<Node> visited = new HashSet<>();
    while (!stack.isEmpty()) {                // process stack
        Node curr = stack.pop();              // pop node
        if (curr.equals(target)) return getPath(curr);
        if (!visited.contains(curr)) {
            visited.add(curr);
            for (Node nb : grid.neighbors(curr)) stack.push(nb);
        }
    }
    return Collections.emptyList();           // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 8, addNeighbor: 8, found: 5, notFound: 11 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def dfs(grid, start, target):
    stack = [start]
    visited = set()
    while stack:                              # process stack
        curr = stack.pop()                    # pop node
        if curr == target: return get_path(curr)  # found!
        if curr not in visited:
            visited.add(curr)
            for nb in grid.neighbors(curr): stack.append(nb)
    return []                                 # no path`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 8, addNeighbor: 8, found: 5, notFound: 9 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `vector<Node> dfs(Grid& grid, Node start, Node target) {
    vector<Node> stack = {start};
    unordered_set<Node> visited;
    while (!stack.empty()) {                  // process stack
        Node curr = stack.back(); stack.pop_back();
        if (curr == target) return getPath(curr);
        if (!visited.count(curr)) {
            visited.insert(curr);
            for (auto& nb : grid.neighbors(curr)) stack.push_back(nb);
        }
    }
    return {};                                // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 8, addNeighbor: 8, found: 5, notFound: 11 }),
      },
    },
  },

  /* ────────────────── A* SEARCH ────────────────── */
  astar: {
    algorithmId: 'astar',
    algorithmName: 'A* Search',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function aStar(grid: Grid, start: Node, target: Node): Path {
  const gScore = new Map([[start, 0]]);
  const fScore = new Map([[start, heuristic(start, target)]]);
  const openSet = new MinHeap<Node>((a, b) => fScore.get(a)! - fScore.get(b)!);
  openSet.push(start);
  while (!openSet.isEmpty()) {                // process priority queue
    const curr = openSet.pop()!;              // dequeue best f(x)
    if (curr === target) return getPath(curr); // found!
    for (const nb of neighbors(curr, grid)) { // expand
      const tentG = gScore.get(curr)! + weight(curr, nb);
      if (tentG < (gScore.get(nb) ?? Infinity)) {
        gScore.set(nb, tentG);
        fScore.set(nb, tentG + heuristic(nb, target));
        openSet.push(nb);                     // enqueue
      }
    }
  }
  return [];                                  // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 6, checkTarget: 7, expand: 8, addNeighbor: 12, found: 7, notFound: 16 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `List<Node> aStar(Grid grid, Node start, Node target) {
    Map<Node, Integer> gScore = new HashMap<>(); gScore.put(start, 0);
    PriorityQueue<Node> open = new PriorityQueue<>(comparingInt(n -> f(n, target)));
    open.add(start);
    while (!open.isEmpty()) {                 // process queue
        Node curr = open.poll();              // dequeue best
        if (curr.equals(target)) return getPath(curr);
        for (Node nb : grid.neighbors(curr)) { // expand
            int tentG = gScore.get(curr) + dist(curr, nb);
            if (tentG < gScore.getOrDefault(nb, MAX_VALUE)) {
                gScore.put(nb, tentG);
                open.add(nb);                 // enqueue
            }
        }
    }
    return Collections.emptyList();           // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 5, checkTarget: 6, expand: 7, addNeighbor: 10, found: 6, notFound: 14 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def a_star(grid, start, target):
    g_score = {start: 0}
    open_set = [(heuristic(start, target), start)]
    while open_set:                           # process queue
        _, curr = heapq.heappop(open_set)     # dequeue best
        if curr == target: return get_path(curr)  # found!
        for nb in grid.neighbors(curr):       # expand
            tent_g = g_score[curr] + dist(curr, nb)
            if tent_g < g_score.get(nb, float('inf')):
                g_score[nb] = tent_g
                heapq.heappush(open_set, (tent_g + heuristic(nb, target), nb))
    return []                                 # no path`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 10, found: 5, notFound: 11 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `vector<Node> aStar(Grid& grid, Node start, Node target) {
    unordered_map<Node, int> gScore; gScore[start] = 0;
    priority_queue<pair<int,Node>> open; open.push({-h(start, target), start});
    while (!open.empty()) {                   // process queue
        auto [f, curr] = open.top(); open.pop();
        if (curr == target) return getPath(curr);
        for (auto& nb : grid.neighbors(curr)) { // expand
            int tentG = gScore[curr] + dist(curr, nb);
            if (tentG < gScore[nb]) {
                gScore[nb] = tentG;
                open.push({-(tentG + h(nb, target)), nb});
            }
        }
    }
    return {};                                // no path
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 4, checkTarget: 5, expand: 6, addNeighbor: 10, found: 5, notFound: 14 }),
      },
    },
  },

  /* ────────────────── BELLMAN-FORD ────────────────── */
  bellmanford: {
    algorithmId: 'bellmanford',
    algorithmName: 'Bellman-Ford',
    languages: {
      typescript: {
        language: 'typescript', displayName: 'TypeScript',
        code: `function bellmanFord(edges: Edge[], numVertices: number, start: Node): Map<Node, number> {
  const dist = new Map([[start, 0]]);
  for (let i = 0; i < numVertices - 1; i++) { // V - 1 passes
    for (const { u, v, weight } of edges) {    // relax all edges
      if ((dist.get(u) ?? Infinity) + weight < (dist.get(v) ?? Infinity)) {
        dist.set(v, dist.get(u)! + weight);
      }
    }
  }
  return dist;
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 2, checkTarget: 4, expand: 3, addNeighbor: 5, found: 8, notFound: 8 }),
      },
      java: {
        language: 'java', displayName: 'Java',
        code: `int[] bellmanFord(int[][] edges, int V, int start) {
    int[] dist = new int[V]; Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;
    for (int i = 0; i < V - 1; i++) {         // V - 1 passes
        for (int[] e : edges) {               // relax edges
            if (dist[e[0]] != MAX_VALUE && dist[e[0]] + e[2] < dist[e[1]]) {
                dist[e[1]] = dist[e[0]] + e[2];
            }
        }
    }
    return dist;
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 3, checkTarget: 5, expand: 4, addNeighbor: 6, found: 9, notFound: 9 }),
      },
      python: {
        language: 'python', displayName: 'Python',
        code: `def bellman_ford(edges, V, start):
    dist = {i: float('inf') for i in range(V)}
    dist[start] = 0
    for _ in range(V - 1):                    # V - 1 passes
        for u, v, w in edges:                 # relax edges
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    return dist`,
        getHighlight: pathHighlight({ init: 1, dequeue: 3, checkTarget: 5, expand: 4, addNeighbor: 6, found: 7, notFound: 7 }),
      },
      cpp: {
        language: 'cpp', displayName: 'C++',
        code: `vector<int> bellmanFord(const vector<Edge>& edges, int V, int start) {
    vector<int> dist(V, INT_MAX); dist[start] = 0;
    for (int i = 0; i < V - 1; i++) {         // V - 1 passes
        for (const auto& e : edges) {         // relax edges
            if (dist[e.u] != INT_MAX && dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
            }
        }
    }
    return dist;
}`,
        getHighlight: pathHighlight({ init: 1, dequeue: 3, checkTarget: 5, expand: 4, addNeighbor: 6, found: 9, notFound: 9 }),
      },
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════════════════ */

export function getAlgorithmCodeSnippet(
  algorithmName: string,
  language: SupportedLanguage = 'typescript'
): CodeSnippet | null {
  const clean = (algorithmName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const key of Object.keys(ALGORITHM_CODE_SNIPPETS)) {
    if (clean.includes(key)) {
      return (
        ALGORITHM_CODE_SNIPPETS[key].languages[language] ??
        ALGORITHM_CODE_SNIPPETS[key].languages['typescript']
      );
    }
  }
  return null;
}
