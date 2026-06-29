/**
 * A reactive container holding a single value. Subscribers are notified
 * whenever the value changes (by `Object.is` comparison), making it a small
 * building block for signal-style reactivity.
 *
 * @typeParam T - The held value type.
 *
 * @example
 * const count = new Signal(0);
 * const off = count.subscribe((v) => console.log(v));
 * count.set(1); // logs 1
 * count.update((n) => n + 1); // logs 2
 * off();
 */
export class Signal<T> {
  private currentValue: T;
  private readonly listeners = new Set<(value: T) => void>();

  /**
   * Create a signal with an initial value.
   *
   * @param initial - The starting value.
   */
  constructor(initial: T) {
    this.currentValue = initial;
  }

  /** The current value. */
  get value(): T {
    return this.currentValue;
  }

  /**
   * Replace the value. Subscribers are notified only when the new value
   * differs from the current one.
   *
   * @param value - The new value.
   */
  set(value: T): void {
    if (Object.is(value, this.currentValue)) return;
    this.currentValue = value;
    for (const listener of [...this.listeners]) {
      listener(value);
    }
  }

  /**
   * Derive a new value from the current one and store it.
   *
   * @param fn - Maps the previous value to the next value.
   */
  update(fn: (prev: T) => T): void {
    this.set(fn(this.currentValue));
  }

  /**
   * Subscribe to value changes.
   *
   * @param listener - Called with the new value on each change.
   * @returns An unsubscribe function.
   */
  subscribe(listener: (value: T) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/**
 * Create a derived {@link Signal} that recomputes whenever any of its
 * dependency signals change. The computed value is recalculated eagerly on
 * each dependency change.
 *
 * @typeParam T - The computed value type.
 * @param compute - Produces the derived value from current dependency state.
 * @param deps - The signals whose changes trigger recomputation.
 * @returns A signal holding the computed value.
 *
 * @example
 * const a = new Signal(1);
 * const b = new Signal(2);
 * const sum = computed(() => a.value + b.value, [a, b]);
 * sum.value; // 3
 * a.set(10); // sum.value becomes 12
 */
export function computed<T>(
  compute: () => T,
  deps: Signal<unknown>[],
): Signal<T> {
  const result = new Signal<T>(compute());
  for (const dep of deps) {
    dep.subscribe(() => {
      result.set(compute());
    });
  }
  return result;
}

/**
 * An observer used to push values out of an {@link Observable}.
 *
 * @typeParam T - The emitted value type.
 */
export interface Observer<T> {
  /** Emit the next value. */
  next: (value: T) => void;
  /** Signal that no further values will be emitted. */
  complete: () => void;
  /** Signal that the stream terminated with an error. */
  error: (err: unknown) => void;
}

/**
 * A subscription returned by {@link Observable.subscribe}.
 */
export interface Subscription {
  /** Cancel the subscription and run any teardown logic. */
  unsubscribe: () => void;
}

/**
 * A minimal cold observable. The subscriber function runs anew for every
 * subscription and may return a teardown function that is invoked on
 * unsubscribe or after completion/error.
 *
 * @typeParam T - The emitted value type.
 *
 * @example
 * const source = new Observable<number>((observer) => {
 *   observer.next(1);
 *   observer.next(2);
 *   observer.complete();
 * });
 * const sub = source
 *   .map((n) => n * 10)
 *   .filter((n) => n > 10)
 *   .subscribe({ next: (v) => console.log(v) });
 * sub.unsubscribe();
 */
export class Observable<T> {
  private readonly subscriber: (
    observer: Observer<T>,
  ) => void | (() => void);

  /**
   * Create an observable from a subscriber function.
   *
   * @param subscriber - Receives an observer and optionally returns teardown.
   */
  constructor(
    subscriber: (observer: Observer<T>) => void | (() => void),
  ) {
    this.subscriber = subscriber;
  }

  /**
   * Subscribe to the observable. Each subscription independently runs the
   * subscriber function. After `complete` or `error`, further emissions are
   * ignored and teardown runs once.
   *
   * @param observer - A full or partial observer.
   * @returns A subscription handle.
   */
  subscribe(observer: Partial<Observer<T>>): Subscription {
    let closed = false;
    let teardown: void | (() => void);

    const finalize = (): void => {
      closed = true;
      if (typeof teardown === "function") {
        const fn = teardown;
        teardown = undefined;
        fn();
      }
    };

    const safeObserver: Observer<T> = {
      next: (value: T): void => {
        if (closed) return;
        observer.next?.(value);
      },
      complete: (): void => {
        if (closed) return;
        observer.complete?.();
        finalize();
      },
      error: (err: unknown): void => {
        if (closed) return;
        observer.error?.(err);
        finalize();
      },
    };

    teardown = this.subscriber(safeObserver);
    if (closed && typeof teardown === "function") {
      // Source completed synchronously before teardown was captured.
      const fn = teardown;
      teardown = undefined;
      fn();
    }

    return {
      unsubscribe: (): void => {
        if (closed) return;
        finalize();
      },
    };
  }

  /**
   * Create a new observable whose values are transformed by `fn`.
   *
   * @typeParam U - The mapped value type.
   * @param fn - Maps each emitted value.
   * @returns A mapped observable.
   */
  map<U>(fn: (value: T) => U): Observable<U> {
    return new Observable<U>((observer) =>
      this.subscribe({
        next: (value) => observer.next(fn(value)),
        complete: () => observer.complete(),
        error: (err) => observer.error(err),
      }).unsubscribe,
    );
  }

  /**
   * Create a new observable that emits only values passing the predicate.
   *
   * @param fn - Predicate deciding which values pass through.
   * @returns A filtered observable.
   */
  filter(fn: (value: T) => boolean): Observable<T> {
    return new Observable<T>((observer) =>
      this.subscribe({
        next: (value) => {
          if (fn(value)) observer.next(value);
        },
        complete: () => observer.complete(),
        error: (err) => observer.error(err),
      }).unsubscribe,
    );
  }
}
