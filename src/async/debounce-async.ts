/** A debounced or throttled async function with a `cancel` method. */
export type CancelableAsync<A extends unknown[], R> = ((
  ...args: A
) => Promise<R>) & {
  /** Cancels any pending invocation and rejects its outstanding promises. */
  cancel: () => void;
};

interface PendingResolver<R> {
  resolve: (value: R) => void;
  reject: (reason: unknown) => void;
}

/**
 * Wraps an async (or sync) function so that calls occurring within `waitMs` of
 * each other collapse into a single trailing invocation. Every pending caller
 * resolves (or rejects) with the result of that final invocation, which runs
 * with the most recent arguments.
 *
 * @typeParam A - The argument tuple of the wrapped function.
 * @typeParam R - The resolved result type of the wrapped function.
 * @param fn - The function to debounce.
 * @param waitMs - The debounce window in milliseconds.
 * @returns A debounced function exposing a `cancel` method.
 */
export function debounceAsync<A extends unknown[], R>(
  fn: (...args: A) => Promise<R> | R,
  waitMs: number,
): CancelableAsync<A, R> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Array<PendingResolver<R>> = [];
  let lastArgs: A | undefined;

  const flush = (): void => {
    timer = undefined;
    const waiters = pending;
    const args = lastArgs;
    pending = [];
    lastArgs = undefined;
    if (args === undefined) {
      return;
    }
    Promise.resolve()
      .then(() => fn(...args))
      .then(
        (result) => {
          for (const waiter of waiters) {
            waiter.resolve(result);
          }
        },
        (error: unknown) => {
          for (const waiter of waiters) {
            waiter.reject(error);
          }
        },
      );
  };

  const debounced = ((...args: A): Promise<R> => {
    lastArgs = args;
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    return new Promise<R>((resolve, reject) => {
      pending.push({ resolve, reject });
      timer = setTimeout(flush, waitMs);
    });
  }) as CancelableAsync<A, R>;

  debounced.cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    const waiters = pending;
    pending = [];
    lastArgs = undefined;
    for (const waiter of waiters) {
      waiter.reject(new Error("Debounced call canceled"));
    }
  };

  return debounced;
}

/**
 * Wraps an async (or sync) function so that it runs at most once per `waitMs`
 * window. The first call in a window triggers execution; subsequent calls
 * within the same window share that in-flight result rather than starting a
 * new run.
 *
 * @typeParam A - The argument tuple of the wrapped function.
 * @typeParam R - The resolved result type of the wrapped function.
 * @param fn - The function to throttle.
 * @param waitMs - The throttle window in milliseconds.
 * @returns A throttled function exposing a `cancel` method.
 */
export function throttleAsync<A extends unknown[], R>(
  fn: (...args: A) => Promise<R> | R,
  waitMs: number,
): CancelableAsync<A, R> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let inFlight: Promise<R> | undefined;

  const throttled = ((...args: A): Promise<R> => {
    if (inFlight !== undefined) {
      return inFlight;
    }

    const run = Promise.resolve().then(() => fn(...args));
    inFlight = run;

    timer = setTimeout(() => {
      timer = undefined;
      inFlight = undefined;
    }, waitMs);

    return run;
  }) as CancelableAsync<A, R>;

  throttled.cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    inFlight = undefined;
  };

  return throttled;
}
