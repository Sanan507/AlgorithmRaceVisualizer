import { describe, it, expect } from 'vitest';
import { parseCustomArrayInput } from './arrayParser';

describe('parseCustomArrayInput', () => {
  it('should parse standard comma-separated integers', () => {
    expect(parseCustomArrayInput('5, 8, 10')).toEqual([5, 8, 10]);
  });

  it('should handle trailing commas', () => {
    expect(parseCustomArrayInput('5, 8,')).toEqual([5, 8]);
  });

  it('should handle empty middle commas', () => {
    expect(parseCustomArrayInput('5,, 8')).toEqual([5, 8]);
  });

  it('should parse a single element', () => {
    expect(parseCustomArrayInput('5')).toEqual([5]);
  });

  it('should parse a zero element', () => {
    expect(parseCustomArrayInput('0')).toEqual([0]);
  });

  it('should handle duplicate elements', () => {
    expect(parseCustomArrayInput('5, 5, 5')).toEqual([5, 5, 5]);
  });

  it('should ignore invalid non-numeric entries', () => {
    expect(parseCustomArrayInput('5, abc, 8')).toEqual([5, 8]);
    expect(parseCustomArrayInput('abc, def')).toEqual([]);
    expect(parseCustomArrayInput('1, 2.5, 3')).toEqual([1, 3]); // ignores floats based on regex /^-?\d+$/
  });

  it('should handle negative numbers', () => {
    expect(parseCustomArrayInput('-5, 0, 10')).toEqual([-5, 0, 10]);
  });

  it('should return empty array for empty string', () => {
    expect(parseCustomArrayInput('')).toEqual([]);
    expect(parseCustomArrayInput('   ')).toEqual([]);
  });

  it('should return empty array for non-string inputs', () => {
    // @ts-expect-error Testing invalid input type
    expect(parseCustomArrayInput(null)).toEqual([]);
    // @ts-expect-error Testing invalid input type
    expect(parseCustomArrayInput(undefined)).toEqual([]);
    // @ts-expect-error Testing invalid input type
    expect(parseCustomArrayInput(123)).toEqual([]);
  });
});
