export interface KnapsackItem {
  id: string;
  weight: number;
  value: number;
}

export interface KnapsackSelectedResult {
  totalValue: number;
  totalWeight: number;
  selectedItems: { itemIndex: number; weight: number; value: number }[];
}

export interface EditDistanceOperation {
  op: 'KEEP' | 'REPLACE' | 'INSERT' | 'DELETE';
  char1?: string;
  char2?: string;
  from?: string;
  to?: string;
  cost: number;
  explanation: string;
}

export const KNAPSACK_PRESETS = {
  classic: {
    capacity: 7,
    items: [
      { id: '1', weight: 2, value: 3 },
      { id: '2', weight: 3, value: 4 },
      { id: '3', weight: 4, value: 5 },
      { id: '4', weight: 5, value: 6 },
    ],
  },
  compact: {
    capacity: 6,
    items: [
      { id: '1', weight: 1, value: 1 },
      { id: '2', weight: 2, value: 6 },
      { id: '3', weight: 3, value: 10 },
    ],
  },
  heavy: {
    capacity: 10,
    items: [
      { id: '1', weight: 3, value: 7 },
      { id: '2', weight: 4, value: 9 },
      { id: '3', weight: 5, value: 12 },
      { id: '4', weight: 6, value: 15 },
    ],
  },
};

export const STRING_PRESETS = {
  lcs: [
    { label: 'Classic AGGTAB / GXTXAYB', s1: 'AGGTAB', s2: 'GXTXAYB' },
    { label: 'Short ABCD / ACBD', s1: 'ABCD', s2: 'ACBD' },
    { label: 'DNA ATCG / TACG', s1: 'ATCG', s2: 'TACG' },
  ],
  editDistance: [
    { label: 'KITTEN → SITTING', s1: 'KITTEN', s2: 'SITTING' },
    { label: 'INTENTION → EXECUTION', s1: 'INTENTION', s2: 'EXECUTION' },
    { label: 'CAT → CUT', s1: 'CAT', s2: 'CUT' },
  ],
};

// Validation helpers
export function validateKnapsackInputs(capacity: number, items: KnapsackItem[]): { valid: boolean; error?: string } {
  if (capacity < 1 || capacity > 15) {
    return { valid: false, error: 'Capacity must be between 1 and 15.' };
  }
  if (!items || items.length === 0) {
    return { valid: false, error: 'At least one item is required.' };
  }
  for (let i = 0; i < items.length; i++) {
    if (isNaN(items[i].weight) || items[i].weight < 1) {
      return { valid: false, error: `Item ${i + 1} weight must be at least 1.` };
    }
    if (isNaN(items[i].value) || items[i].value < 0) {
      return { valid: false, error: `Item ${i + 1} value cannot be negative.` };
    }
  }
  return { valid: true };
}

export function validateStringInputs(s1: string, s2: string): { valid: boolean; error?: string } {
  if (!s1 || s1.trim().length === 0 || !s2 || s2.trim().length === 0) {
    return { valid: false, error: 'Both strings must be non-empty.' };
  }
  if (s1.length > 12 || s2.length > 12) {
    return { valid: false, error: 'Maximum string length is 12 characters.' };
  }
  return { valid: true };
}

// Backtrack Knapsack result extraction
export function extractKnapsackResult(dp: number[][], items: KnapsackItem[], capacity: number): KnapsackSelectedResult {
  const selected: { itemIndex: number; weight: number; value: number }[] = [];
  let currI = items.length;
  let currW = capacity;
  let totalW = 0;

  while (currI > 0 && currW > 0) {
    if (dp[currI][currW] !== dp[currI - 1][currW]) {
      const item = items[currI - 1];
      selected.unshift({ itemIndex: currI, weight: item.weight, value: item.value });
      currW -= item.weight;
      totalW += item.weight;
    }
    currI -= 1;
  }

  return {
    totalValue: dp[items.length][capacity] || 0,
    totalWeight: totalW,
    selectedItems: selected,
  };
}

// Extract Edit Distance operations path
export function extractEditDistanceOperations(dp: number[][], s1: string, s2: string): EditDistanceOperation[] {
  const ops: EditDistanceOperation[] = [];
  let i = s1.length;
  let j = s2.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && s1[i - 1] === s2[j - 1]) {
      ops.unshift({
        op: 'KEEP',
        char1: s1[i - 1],
        char2: s2[j - 1],
        cost: 0,
        explanation: `Keep character '${s1[i - 1]}'`,
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.unshift({
        op: 'REPLACE',
        char1: s1[i - 1],
        char2: s2[j - 1],
        cost: 1,
        explanation: `Replace '${s1[i - 1]}' with '${s2[j - 1]}'`,
      });
      i--;
      j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      ops.unshift({
        op: 'INSERT',
        char2: s2[j - 1],
        cost: 1,
        explanation: `Insert '${s2[j - 1]}'`,
      });
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.unshift({
        op: 'DELETE',
        char1: s1[i - 1],
        cost: 1,
        explanation: `Delete '${s1[i - 1]}'`,
      });
      i--;
    } else {
      break;
    }
  }

  return ops;
}
