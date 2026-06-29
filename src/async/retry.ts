import { sleep } from "./sleep";

/**
 * Configuration for {@link retry}.
 */
export interface RetryOptions {
  /** Number of retries after the first attempt. Defaults to `3`. */
  retries?: number;
  /** Base delay between attempts, in milliseconds. Defaults to `100`. */
  delayMs?: number;
  /** Exponential growth factor applied to the delay. Defaults to `2`. */
  factor?: number;
  /** Upper bound for the computed delay, in milliseconds. */
  maxDelayMs?: number;
  /** Invoked before each retry with the failure and the next attempt index. */
  onRetry?: (error: unknown, attempt: number) => void;
}

/**
 * Run an async (or sync) function and retry it on failure using exponential
 * backoff. The delay before the n-th retry is `delayMs * factor^n`, capped at
 * `maxDelayMs` when provided. After exhausting all retries, the most recent
 * error is re-thrown.
 *
 * @typeParam T - The resolved value type of `fn`.
 * @param fn - Operation to execute; receives the zero-based attempt index.
 * @param options - Retry behavior overrides. See {@link RetryOptions}.
 * @returns A promise resolving with the first successful result.
 *
 * @example
 * const data = await retry((attempt) => fetchPage(attempt), {
 *   retries: 5,
 *   delayMs: 200,
 * });
 */
export async function retry<T>(
  fn: (attempt: number) => Promise<T> | T,
  options?: RetryOptions
): Promise<T> {
  const retries = options?.retries ?? 3;
  const delayMs = options?.delayMs ?? 100;
  const factor = options?.factor ?? 2;
  const maxDelayMs = options?.maxDelayMs;
  const onRetry = options?.onRetry;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      if (attempt === retries) break;

      const nextAttempt = attempt + 1;
      onRetry?.(error, nextAttempt);

      let wait = delayMs * Math.pow(factor, attempt);
      if (maxDelayMs !== undefined) wait = Math.min(wait, maxDelayMs);
      if (wait > 0) await sleep(wait);
    }
  }

  throw lastError;
}
