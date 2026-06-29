/**
 * Resolve after the given number of milliseconds.
 *
 * @param ms - Delay duration in milliseconds. Non-positive values resolve on
 * the next timer tick.
 * @returns A promise that resolves once the delay has elapsed.
 *
 * @example
 * await sleep(200); // pause for ~200ms
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Alias for {@link sleep}.
 *
 * @example
 * await delay(50);
 */
export const delay = sleep;
