/** Returns its argument unchanged. */
export function identity<T>(x: T): T {
  return x;
}

/** A function that accepts any arguments and does nothing. */
export function noop(): void {
  /* intentionally empty */
}

/**
 * Composes functions left-to-right: `pipe(f, g)(x)` is `g(f(x))`.
 * With no functions, the input is returned unchanged.
 * @typeParam T type of the initial input
 */
export function pipe<T>(...fns: Array<(arg: any) => any>): (input: T) => any {
  return (input: T): any => fns.reduce((acc, fn) => fn(acc), input as unknown);
}

/**
 * Composes functions right-to-left: `compose(f, g)(x)` is `f(g(x))`.
 * With no functions, the input is returned unchanged.
 */
export function compose(...fns: Array<(arg: any) => any>): (input: any) => any {
  return (input: any): any => fns.reduceRight((acc, fn) => fn(acc), input);
}

/**
 * Curries a function based on its declared arity (`fn.length`). The returned
 * function collects arguments across calls until enough are supplied, then
 * invokes the original function.
 */
export function curry(fn: (...args: any[]) => any): any {
  const arity = fn.length;
  function collect(collected: any[]): any {
    return (...next: any[]): any => {
      const combined = collected.concat(next);
      if (combined.length >= arity) {
        return fn(...combined);
      }
      return collect(combined);
    };
  }
  return collect([]);
}

/**
 * Partially applies `fn` by fixing its leading arguments to `preset`.
 * @typeParam A tuple of remaining argument types
 * @typeParam R return type of `fn`
 */
export function partial<A extends any[], R>(
  fn: (...args: any[]) => R,
  ...preset: any[]
): (...rest: any[]) => R {
  return (...rest: any[]): R => fn(...preset, ...rest);
}

/**
 * Wraps `fn` so repeated calls with the same arguments return a cached result.
 * Cache keys are derived by `keyResolver`, defaulting to `JSON.stringify`.
 * @typeParam A tuple of argument types
 * @typeParam R return type of `fn`
 */
export function memoize<A extends any[], R>(
  fn: (...args: A) => R,
  keyResolver?: (...args: A) => string,
): (...args: A) => R {
  const cache = new Map<string, R>();
  const resolve = keyResolver ?? ((...args: A): string => JSON.stringify(args));
  return (...args: A): R => {
    const key = resolve(...args);
    if (cache.has(key)) {
      return cache.get(key) as R;
    }
    const value = fn(...args);
    cache.set(key, value);
    return value;
  };
}

/**
 * Returns a debounced version of `fn` that postpones invocation until
 * `waitMs` have elapsed since the last call. The returned function exposes a
 * `cancel` method to discard any pending invocation.
 * @typeParam A tuple of argument types
 */
export function debounce<A extends any[]>(
  fn: (...args: A) => void,
  waitMs: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  };
  debounced.cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
  return debounced;
}

/**
 * Returns a throttled version of `fn` that invokes it at most once per
 * `waitMs`. The leading call runs immediately; subsequent calls within the
 * window are coalesced into a single trailing call. The returned function
 * exposes a `cancel` method to discard any pending trailing invocation.
 * @typeParam A tuple of argument types
 */
export function throttle<A extends any[]>(
  fn: (...args: A) => void,
  waitMs: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: A | undefined;
  let lastInvocation = 0;

  const invoke = (args: A): void => {
    lastInvocation = Date.now();
    fn(...args);
  };

  const throttled = (...args: A): void => {
    const now = Date.now();
    const remaining = waitMs - (now - lastInvocation);
    if (remaining <= 0) {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      invoke(args);
    } else {
      lastArgs = args;
      if (timer === undefined) {
        timer = setTimeout(() => {
          timer = undefined;
          if (lastArgs !== undefined) {
            const pending = lastArgs;
            lastArgs = undefined;
            invoke(pending);
          }
        }, remaining);
      }
    }
  };

  throttled.cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    lastArgs = undefined;
    lastInvocation = 0;
  };

  return throttled;
}

/**
 * Wraps `fn` so it runs only on the first call; later calls return the cached
 * result of that first invocation.
 * @typeParam A tuple of argument types
 * @typeParam R return type of `fn`
 */
export function once<A extends any[], R>(
  fn: (...args: A) => R,
): (...args: A) => R {
  let called = false;
  let result: R | undefined;
  return (...args: A): R => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result as R;
  };
}

/**
 * Runs a side effect `fn` against `value` and returns `value` unchanged,
 * useful for inspecting values inside a pipeline.
 * @typeParam T type of the value
 */
export function tap<T>(value: T, fn: (value: T) => void): T {
  fn(value);
  return value;
}
