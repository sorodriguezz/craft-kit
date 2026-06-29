/**
 * A small generic registry backed by a Map.
 * Useful for registering named strategies, factories or utilities.
 */
export class UtilsRegistry<K, T> {
  private readonly registry: Map<K, T> = new Map();

  /** Registers a value under a key (overwrites if it already exists). */
  register(name: K, util: T): void {
    this.registry.set(name, util);
  }

  /** Returns true if a value is registered under the key. */
  has(name: K): boolean {
    return this.registry.has(name);
  }

  /** Returns the value registered under the key, or throws if missing. */
  get(name: K): T {
    const util = this.registry.get(name);
    if (util === undefined) {
      throw new Error(`The utility '${String(name)}' is not registered.`);
    }
    return util;
  }

  /** Returns the value registered under the key, or undefined if missing. */
  find(name: K): T | undefined {
    return this.registry.get(name);
  }

  /** Removes a registration. Returns true if it existed. */
  unregister(name: K): boolean {
    return this.registry.delete(name);
  }

  /** Returns the underlying map of all registrations. */
  getAll(): Map<K, T> {
    return this.registry;
  }
}
