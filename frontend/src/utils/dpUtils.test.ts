import { describe, it, expect } from 'vitest';
import {
  validateKnapsackInputs,
  validateStringInputs,
  extractKnapsackResult,
  extractEditDistanceOperations,
  KnapsackItem,
} from './dpUtils';

describe('DP Utilities & Input Validation', () => {
  describe('validateKnapsackInputs', () => {
    it('should pass valid capacity and items', () => {
      const items: KnapsackItem[] = [
        { id: '1', weight: 2, value: 3 },
        { id: '2', weight: 3, value: 4 },
      ];
      const res = validateKnapsackInputs(7, items);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('should reject capacity out of bounds (< 1 or > 15)', () => {
      const items: KnapsackItem[] = [{ id: '1', weight: 2, value: 3 }];
      expect(validateKnapsackInputs(0, items).valid).toBe(false);
      expect(validateKnapsackInputs(20, items).valid).toBe(false);
    });

    it('should reject empty items array', () => {
      expect(validateKnapsackInputs(5, []).valid).toBe(false);
    });

    it('should reject invalid item weights or values', () => {
      const invalidWeight: KnapsackItem[] = [{ id: '1', weight: 0, value: 5 }];
      expect(validateKnapsackInputs(5, invalidWeight).valid).toBe(false);

      const invalidValue: KnapsackItem[] = [{ id: '1', weight: 2, value: -1 }];
      expect(validateKnapsackInputs(5, invalidValue).valid).toBe(false);
    });
  });

  describe('validateStringInputs', () => {
    it('should pass valid strings under 12 characters', () => {
      expect(validateStringInputs('AGGTAB', 'GXTXAYB').valid).toBe(true);
    });

    it('should reject empty strings', () => {
      expect(validateStringInputs('', 'GXTXAYB').valid).toBe(false);
      expect(validateStringInputs('AGGTAB', '  ').valid).toBe(false);
    });

    it('should reject strings exceeding 12 characters', () => {
      expect(validateStringInputs('VERYLONGSTRING123', 'SHORT').valid).toBe(false);
    });
  });

  describe('extractKnapsackResult', () => {
    it('should correctly extract total value, weight, and selected items', () => {
      const items: KnapsackItem[] = [
        { id: '1', weight: 2, value: 3 },
        { id: '2', weight: 3, value: 4 },
        { id: '3', weight: 4, value: 5 },
      ];
      // Hand-crafted DP table for capacity 5
      // DP table dimensions: (3+1) x (5+1)
      const dp = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3],
        [0, 0, 3, 4, 4, 7],
        [0, 0, 3, 4, 5, 7],
      ];
      const result = extractKnapsackResult(dp, items, 5);
      expect(result.totalValue).toBe(7);
      expect(result.totalWeight).toBe(5);
      expect(result.selectedItems.map((i) => i.itemIndex)).toEqual([1, 2]);
    });
  });

  describe('extractEditDistanceOperations', () => {
    it('should extract correct operations path for CAT -> CUT', () => {
      // DP table for CAT (rows 0-3) vs CUT (cols 0-3)
      const dp = [
        [0, 1, 2, 3],
        [1, 0, 1, 2],
        [2, 1, 1, 2],
        [3, 2, 2, 1],
      ];
      const ops = extractEditDistanceOperations(dp, 'CAT', 'CUT');
      expect(ops.length).toBe(3);
      expect(ops[0].op).toBe('KEEP');     // C -> C
      expect(ops[1].op).toBe('REPLACE');  // A -> U
      expect(ops[2].op).toBe('KEEP');     // T -> T
    });
  });
});
