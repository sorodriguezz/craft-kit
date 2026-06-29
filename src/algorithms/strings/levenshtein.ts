/**
 * Computes the Levenshtein (edit) distance between two strings: the minimum
 * number of single-character insertions, deletions or substitutions required to
 * transform `a` into `b`. Uses a single-row dynamic-programming table for
 * `O(n * m)` time and `O(min(n, m))` extra space. Characters are compared by
 * UTF-16 code unit.
 * @param a first string
 * @param b second string
 * @returns the edit distance (a non-negative integer)
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Iterate over the shorter string to keep the row small.
  let source = a;
  let target = b;
  if (source.length > target.length) {
    source = b;
    target = a;
  }

  const rowLength = source.length + 1;
  let previousRow = new Array<number>(rowLength);
  let currentRow = new Array<number>(rowLength);
  for (let i = 0; i < rowLength; i++) previousRow[i] = i;

  for (let j = 1; j <= target.length; j++) {
    currentRow[0] = j;
    const targetChar = target.charCodeAt(j - 1);
    for (let i = 1; i <= source.length; i++) {
      const cost = source.charCodeAt(i - 1) === targetChar ? 0 : 1;
      const deletion = previousRow[i] + 1;
      const insertion = currentRow[i - 1] + 1;
      const substitution = previousRow[i - 1] + cost;
      currentRow[i] = Math.min(deletion, insertion, substitution);
    }
    const swap = previousRow;
    previousRow = currentRow;
    currentRow = swap;
  }

  return previousRow[source.length];
}

/**
 * Measures the similarity of two strings as a value in the closed range
 * `[0, 1]`, defined as `1 - distance / maxLength` where `distance` is the
 * Levenshtein distance and `maxLength` is the length of the longer string. Two
 * empty strings are considered identical and yield `1`.
 * @param a first string
 * @param b second string
 * @returns similarity score from `0` (completely different) to `1` (identical)
 */
export function similarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  return 1 - levenshtein(a, b) / maxLength;
}
