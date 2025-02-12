export class UtilsRegistry<K, T> {
  private registry: Map<K, T> = new Map();

  register(name: K, util: T): void {
    this.registry.set(name, util);
  }

  get(name: K): T {
    const util = this.registry.get(name);

    if (!util) {
      throw new Error(`The utility '${name}' is not registered.`);
    }

    return util;
  }

  getAll(): Map<K, T> {
    return this.registry;
  }
}
