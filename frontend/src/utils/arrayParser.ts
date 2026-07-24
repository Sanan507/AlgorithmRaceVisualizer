/**
 * Helper to robustly parse comma-separated integer strings into number arrays.
 * Handles edge cases like:
 * - Trailing commas: "5, 8," -> [5, 8] (prevents ghost 0)
 * - Empty middle commas: "5,, 8" -> [5, 8]
 * - Single element: "5" -> [5]
 * - Zero element: "0" -> [0]
 * - Duplicate elements: "5, 5, 5" -> [5, 5, 5]
 * - Invalid non-numeric entries: "5, abc, 8" -> [5, 8]
 * - Negative numbers: "-5, 0, 10" -> [-5, 0, 10]
 */
export function parseCustomArrayInput(text: string): number[] {
  if (!text || typeof text !== 'string') return [];
  const parts = text.split(',');
  const numbers: number[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed === '') continue; // Ignore empty parts caused by trailing or extra commas
    if (/^-?\d+$/.test(trimmed)) {
      numbers.push(Number(trimmed));
    }
  }

  return numbers;
}
