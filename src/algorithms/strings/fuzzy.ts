/**
 * Tests whether `query` is a (case-insensitive) subsequence of `target`: every
 * character of `query` appears in `target` in order, though not necessarily
 * contiguously. An empty query always matches.
 * @param query characters to look for, in order
 * @param target string to test against
 * @returns `true` if `query` is a subsequence of `target`
 */
export function fuzzyMatch(query: string, target: string): boolean {
  if (query.length === 0) return true;
  if (query.length > target.length) return false;

  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t.charCodeAt(ti) === q.charCodeAt(qi)) qi++;
  }
  return qi === q.length;
}

/**
 * Scores how well `query` matches `target` as a case-insensitive subsequence.
 * Higher scores indicate a tighter match. Returns `-Infinity` when `query` is
 * not a subsequence of `target`. The heuristic rewards consecutive matched
 * characters and matches occurring earlier in the target.
 * @param query characters to look for, in order
 * @param target string to score against
 * @returns a numeric score, or `-Infinity` for a non-match
 */
function fuzzyScore(query: string, target: string): number {
  if (query.length === 0) return 0;

  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let score = 0;
  let qi = 0;
  let previousIndex = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t.charCodeAt(ti) === q.charCodeAt(qi)) {
      // Reward adjacency to the previously matched character.
      if (previousIndex !== -1 && ti === previousIndex + 1) score += 5;
      else score += 1;
      // Reward matches near the start of the target.
      score += Math.max(0, 3 - ti) * 0.5;
      previousIndex = ti;
      qi++;
    }
  }
  if (qi !== q.length) return -Infinity;
  // Prefer shorter targets when scores are otherwise comparable.
  return score - (t.length - q.length) * 0.01;
}

/**
 * Filters `items` down to those whose key fuzzily matches `query` (see
 * {@link fuzzyMatch}) and returns them ordered from best to worst match. The
 * input array is not mutated. By default each item is coerced to a string with
 * `String(item)`; pass `keyFn` to match against a derived key instead.
 * @typeParam T item type
 * @param query search query
 * @param items items to search through (not mutated)
 * @param keyFn extracts the searchable string from an item
 * @returns a new array of matching items, best matches first
 */
export function fuzzySearch<T>(
  query: string,
  items: readonly T[],
  keyFn: (item: T) => string = (item) => String(item)
): T[] {
  const scored: Array<{ item: T; score: number; index: number }> = [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const key = keyFn(item);
    if (!fuzzyMatch(query, key)) continue;
    scored.push({ item, score: fuzzyScore(query, key), index });
  }
  // Sort by descending score, falling back to original order for stability.
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.map((entry) => entry.item);
}
