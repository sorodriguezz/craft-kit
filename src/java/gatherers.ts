/**
 * Custom intermediate stream operations, inspired by Java's Stream Gatherers
 * (JEP 485). A Gatherer has an optional initializer (state), an integrator that
 * consumes elements and pushes results downstream (returning `false` to stop),
 * and an optional finisher that emits trailing results.
 */
export interface Gatherer<T, S, R> {
  initializer?: () => S;
  integrator: (state: S, element: T, push: (value: R) => void) => boolean | void;
  finisher?: (state: S, push: (value: R) => void) => void;
}

/** Built-in gatherers, mirroring java.util.stream.Gatherers. */
export const Gatherers = {
  /** Groups elements into consecutive, non-overlapping windows of `size`. */
  windowFixed<T>(size: number): Gatherer<T, T[], T[]> {
    if (size <= 0) throw new Error("Gatherers.windowFixed: size must be > 0.");
    return {
      initializer: () => [],
      integrator: (state, element, push) => {
        state.push(element);
        if (state.length === size) {
          push([...state]);
          state.length = 0;
        }
      },
      finisher: (state, push) => {
        if (state.length > 0) push([...state]);
      },
    };
  },

  /** Emits overlapping windows of exactly `size` (sliding by one). */
  windowSliding<T>(size: number): Gatherer<T, T[], T[]> {
    if (size <= 0) throw new Error("Gatherers.windowSliding: size must be > 0.");
    return {
      initializer: () => [],
      integrator: (state, element, push) => {
        state.push(element);
        if (state.length === size) {
          push([...state]);
          state.shift();
        }
      },
    };
  },

  /** Reduces to a single value emitted at the end. */
  fold<T, R>(initializer: () => R, folder: (accumulator: R, element: T) => R): Gatherer<T, { acc: R }, R> {
    return {
      initializer: () => ({ acc: initializer() }),
      integrator: (state, element) => {
        state.acc = folder(state.acc, element);
      },
      finisher: (state, push) => {
        push(state.acc);
      },
    };
  },

  /** Emits the running accumulation after each element. */
  scan<T, R>(initializer: () => R, scanner: (accumulator: R, element: T) => R): Gatherer<T, { acc: R }, R> {
    return {
      initializer: () => ({ acc: initializer() }),
      integrator: (state, element, push) => {
        state.acc = scanner(state.acc, element);
        push(state.acc);
      },
    };
  },

  /** Emits only the first element for each distinct key. */
  distinctBy<T, K>(keyFn: (element: T) => K): Gatherer<T, Set<K>, T> {
    return {
      initializer: () => new Set<K>(),
      integrator: (seen, element, push) => {
        const key = keyFn(element);
        if (!seen.has(key)) {
          seen.add(key);
          push(element);
        }
      },
    };
  },

  /** Short-circuits after emitting `maxSize` elements. */
  limit<T>(maxSize: number): Gatherer<T, { count: number }, T> {
    return {
      initializer: () => ({ count: 0 }),
      integrator: (state, element, push) => {
        if (state.count >= maxSize) return false;
        push(element);
        state.count++;
        return state.count < maxSize;
      },
    };
  },
} as const;
