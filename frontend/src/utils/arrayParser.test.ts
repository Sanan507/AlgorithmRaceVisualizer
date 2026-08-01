<<<<<<< HEAD
import { describe, it, expect } from 'vitest';
import { parseCustomArrayInput } from './arrayParser';

describe('parseCustomArrayInput', () => {
  it('should parse a typical comma-separated input', () => {
    expect(parseCustomArrayInput("1, 2, 3")).toEqual([1, 2, 3]);
  });

  it('should handle trailing commas', () => {
    expect(parseCustomArrayInput("5, 8,")).toEqual([5, 8]);
  });

  it('should handle empty middle commas', () => {
    expect(parseCustomArrayInput("5,, 8")).toEqual([5, 8]);
  });

  it('should handle a single element', () => {
    expect(parseCustomArrayInput("5")).toEqual([5]);
  });

  it('should handle a zero element', () => {
    expect(parseCustomArrayInput("0")).toEqual([0]);
  });

  it('should handle duplicate elements', () => {
    expect(parseCustomArrayInput("5, 5, 5")).toEqual([5, 5, 5]);
  });

  it('should ignore invalid non-numeric entries', () => {
    expect(parseCustomArrayInput("5, abc, 8")).toEqual([5, 8]);
  });

  it('should parse negative numbers', () => {
    expect(parseCustomArrayInput("-5, 0, 10")).toEqual([-5, 0, 10]);
  });

  it('should return an empty array for an empty string', () => {
    expect(parseCustomArrayInput("")).toEqual([]);
  });

  it('should return an empty array for null/undefined/non-string input', () => {
    // @ts-expect-error testing invalid input types
    expect(parseCustomArrayInput(null)).toEqual([]);
    // @ts-expect-error testing invalid input types
    expect(parseCustomArrayInput(undefined)).toEqual([]);
    // @ts-expect-error testing invalid input types
    expect(parseCustomArrayInput(123)).toEqual([]);
=======
import { parseCustomArrayInput } from './arrayParser';

describe('parseCustomArrayInput', () => {
  it('parses valid comma-separated numbers correctly', () => {
    expect(parseCustomArrayInput('5, 10, 15, 20')).toEqual([5, 10, 15, 20]);
  });

  it('handles negative numbers', () => {
    expect(parseCustomArrayInput('-5, 0, 10')).toEqual([-5, 0, 10]);
  });

  it('handles empty spaces and trailing commas', () => {
    expect(parseCustomArrayInput('5,, 8,')).toEqual([5, 8]);
  });

  it('filters out non-numeric tokens', () => {
    expect(parseCustomArrayInput('5, abc, 8')).toEqual([5, 8]);
  });

  it('returns empty array for invalid or empty inputs', () => {
    expect(parseCustomArrayInput('')).toEqual([]);
    expect(parseCustomArrayInput('abc, def')).toEqual([]);
>>>>>>> d017228 (Fix RateLimitFilter IP spoofing, race condition, and add unit tests for arrayParser)
  });
});
