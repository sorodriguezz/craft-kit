/**
 * Sums a list of numbers.
 * @param values input values (not mutated)
 * @returns the sum, or `0` for an empty list
 */
function sum(values: readonly number[]): number {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

/**
 * Arithmetic mean (average) of a list of numbers.
 * @param values input values (not mutated)
 * @returns the mean, or `NaN` for an empty list
 */
function mean(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  return sum(values) / values.length;
}

/**
 * Median of a list of numbers. For an even-sized list the median is the average
 * of the two central values. The input is copied before sorting.
 * @param values input values (not mutated)
 * @returns the median, or `NaN` for an empty list
 */
function median(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Mode of a list of numbers: the value that occurs most frequently. When
 * several values tie for the highest frequency, the one encountered first in
 * the input is returned.
 * @param values input values (not mutated)
 * @returns the most frequent value, or `NaN` for an empty list
 */
function mode(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  const counts = new Map<number, number>();
  let best = values[0];
  let bestCount = 0;
  for (const value of values) {
    const count = (counts.get(value) ?? 0) + 1;
    counts.set(value, count);
    if (count > bestCount) {
      bestCount = count;
      best = value;
    }
  }
  return best;
}

/**
 * Population variance of a list of numbers (mean of squared deviations,
 * dividing by `N`).
 * @param values input values (not mutated)
 * @returns the population variance, or `NaN` for an empty list
 */
function variance(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  const avg = mean(values);
  let total = 0;
  for (const value of values) {
    const diff = value - avg;
    total += diff * diff;
  }
  return total / values.length;
}

/**
 * Population standard deviation of a list of numbers (square root of the
 * population variance).
 * @param values input values (not mutated)
 * @returns the population standard deviation, or `NaN` for an empty list
 */
function standardDeviation(values: readonly number[]): number {
  return Math.sqrt(variance(values));
}

/**
 * Percentile of a list of numbers using linear interpolation between closest
 * ranks (the same method as NumPy's default `linear` interpolation). The rank
 * is computed as `(p / 100) * (N - 1)`; when it falls between two indices the
 * result is linearly interpolated between the surrounding values. The input is
 * copied before sorting.
 * @param values input values (not mutated)
 * @param p percentile to compute, clamped to the range `[0, 100]`
 * @returns the interpolated percentile, or `NaN` for an empty list
 */
function percentile(values: readonly number[], p: number): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];

  const clamped = Math.min(100, Math.max(0, p));
  const rank = (clamped / 100) * (sorted.length - 1);
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  if (lowerIndex === upperIndex) return sorted[lowerIndex];
  const fraction = rank - lowerIndex;
  return sorted[lowerIndex] + (sorted[upperIndex] - sorted[lowerIndex]) * fraction;
}

/**
 * Range of a list of numbers: the difference between the maximum and minimum.
 * @param values input values (not mutated)
 * @returns the range, or `NaN` for an empty list
 */
function range(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  return max(values) - min(values);
}

/**
 * Smallest value in a list of numbers.
 * @param values input values (not mutated)
 * @returns the minimum, or `NaN` for an empty list
 */
function min(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  let smallest = values[0];
  for (const value of values) {
    if (value < smallest) smallest = value;
  }
  return smallest;
}

/**
 * Largest value in a list of numbers.
 * @param values input values (not mutated)
 * @returns the maximum, or `NaN` for an empty list
 */
function max(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  let largest = values[0];
  for (const value of values) {
    if (value > largest) largest = value;
  }
  return largest;
}

/**
 * Descriptive-statistics helpers operating on read-only arrays of numbers.
 * Every function leaves its input untouched and returns `NaN` for empty input
 * (except {@link stats.sum}, which returns `0`).
 */
export const stats = {
  mean,
  median,
  mode,
  variance,
  standardDeviation,
  percentile,
  range,
  sum,
  min,
  max,
} as const;
