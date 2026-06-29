/**
 * Builds the longest-proper-prefix-which-is-also-suffix (LPS) table for a
 * pattern, the preprocessing step of the Knuth-Morris-Pratt algorithm.
 * `lps[i]` is the length of the longest proper prefix of `pattern[0..i]` that
 * is also a suffix of it.
 * @param pattern non-empty pattern to preprocess
 * @returns the LPS table, one entry per pattern character
 */
function buildLps(pattern: string): number[] {
  const lps = new Array<number>(pattern.length).fill(0);
  let length = 0;
  let i = 1;
  while (i < pattern.length) {
    if (pattern.charCodeAt(i) === pattern.charCodeAt(length)) {
      length++;
      lps[i] = length;
      i++;
    } else if (length !== 0) {
      // Fall back to the previous border without advancing `i`.
      length = lps[length - 1];
    } else {
      lps[i] = 0;
      i++;
    }
  }
  return lps;
}

/**
 * Finds the first occurrence of `pattern` within `text` using the
 * Knuth-Morris-Pratt algorithm in `O(n + m)` time. An empty pattern matches at
 * index `0`.
 * @param text text to search in
 * @param pattern pattern to search for
 * @returns the index of the first match, or `-1` if the pattern is absent
 */
export function kmpSearch(text: string, pattern: string): number {
  if (pattern.length === 0) return 0;
  if (pattern.length > text.length) return -1;

  const lps = buildLps(pattern);
  let i = 0; // index into text
  let j = 0; // index into pattern
  while (i < text.length) {
    if (text.charCodeAt(i) === pattern.charCodeAt(j)) {
      i++;
      j++;
      if (j === pattern.length) return i - j;
    } else if (j !== 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  return -1;
}

/**
 * Finds every occurrence of `pattern` within `text` using the
 * Knuth-Morris-Pratt algorithm in `O(n + m)` time. Overlapping matches are all
 * reported. An empty pattern yields an empty result.
 * @param text text to search in
 * @param pattern pattern to search for
 * @returns the start indices of all matches in ascending order
 */
export function kmpSearchAll(text: string, pattern: string): number[] {
  const matches: number[] = [];
  if (pattern.length === 0 || pattern.length > text.length) return matches;

  const lps = buildLps(pattern);
  let i = 0;
  let j = 0;
  while (i < text.length) {
    if (text.charCodeAt(i) === pattern.charCodeAt(j)) {
      i++;
      j++;
      if (j === pattern.length) {
        matches.push(i - j);
        // Continue from the next possible overlapping match.
        j = lps[j - 1];
      }
    } else if (j !== 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  return matches;
}
