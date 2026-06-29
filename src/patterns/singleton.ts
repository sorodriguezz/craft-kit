/**
 * Wrap a factory so that it is invoked at most once. The first call to the
 * returned accessor creates and caches the instance; every subsequent call
 * returns the same cached value. The cached value may legitimately be
 * `undefined` or `null`, and that result is still memoized.
 *
 * @typeParam T - The instance type produced by the factory.
 * @param factory - Creates the instance on first access.
 * @returns An accessor that always returns the same instance.
 *
 * @example
 * const getConfig = singleton(() => loadConfigOnce());
 * getConfig() === getConfig(); // true
 */
export function singleton<T>(factory: () => T): () => T {
  let initialized = false;
  let instance: T;
  return (): T => {
    if (!initialized) {
      instance = factory();
      initialized = true;
    }
    return instance;
  };
}
