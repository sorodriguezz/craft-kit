/**
 * Map over an iterable with an async (or sync) mapper while bounding how many
 * mappings run at once. Results are returned in the same order as the input,
 * regardless of completion order. If any mapping rejects, the returned promise
 * rejects with the first such error.
 *
 * @typeParam T - The input item type.
 * @typeParam U - The mapped result type.
 * @param items - The values to map over.
 * @param mapper - Receives each item and its zero-based index.
 * @param options - Optional settings. `concurrency` defaults to `Infinity`.
 * @returns A promise resolving with the mapped results in input order.
 *
 * @example
 * const sizes = await pMap(urls, (url) => fetchSize(url), { concurrency: 4 });
 */
export async function pMap<T, U>(
  items: Iterable<T>,
  mapper: (item: T, index: number) => Promise<U> | U,
  options?: { concurrency?: number }
): Promise<U[]> {
  const concurrency = options?.concurrency ?? Infinity;
  if (concurrency < 1) {
    throw new Error("pMap: concurrency must be at least 1.");
  }

  const entries: T[] = [...items];
  const results = new Array<U>(entries.length);
  if (entries.length === 0) return results;

  const limit = Math.min(concurrency, entries.length);
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    for (;;) {
      const index = nextIndex++;
      if (index >= entries.length) return;
      results[index] = await mapper(entries[index], index);
    }
  };

  const workers: Array<Promise<void>> = [];
  for (let i = 0; i < limit; i++) workers.push(worker());
  await Promise.all(workers);

  return results;
}

/**
 * Run a collection of task factories with bounded concurrency, resolving with
 * their results in input order. Rejects with the first error encountered.
 *
 * @typeParam T - The result type produced by each task.
 * @param tasks - Functions that each start and return a task.
 * @param options - Optional settings. `concurrency` defaults to `Infinity`.
 * @returns A promise resolving with each task's result in input order.
 *
 * @example
 * const results = await pAll([() => a(), () => b()], { concurrency: 1 });
 */
export function pAll<T>(
  tasks: Iterable<() => Promise<T> | T>,
  options?: { concurrency?: number }
): Promise<T[]> {
  return pMap([...tasks], (task) => task(), options);
}

/** Outcome of a settled task produced by {@link pSettle}. */
export type SettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

/**
 * Run a collection of task factories with bounded concurrency and report each
 * outcome without short-circuiting on failure. Results are in input order.
 *
 * @typeParam T - The result type produced by each task.
 * @param tasks - Functions that each start and return a task.
 * @param options - Optional settings. `concurrency` defaults to `Infinity`.
 * @returns A promise resolving with one settled result per task, in order.
 *
 * @example
 * const outcomes = await pSettle([() => ok(), () => boom()]);
 * // [{ status: "fulfilled", value: ... }, { status: "rejected", reason: ... }]
 */
export function pSettle<T>(
  tasks: Iterable<() => Promise<T> | T>,
  options?: { concurrency?: number }
): Promise<Array<SettledResult<T>>> {
  return pMap(
    [...tasks],
    async (task): Promise<SettledResult<T>> => {
      try {
        return { status: "fulfilled", value: await task() };
      } catch (reason) {
        return { status: "rejected", reason };
      }
    },
    options
  );
}
