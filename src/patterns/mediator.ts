/**
 * A mediator that decouples senders from receivers. Handlers are registered by
 * name and invoked through {@link send}, so callers depend only on the
 * mediator rather than on each other.
 *
 * @example
 * const mediator = new Mediator()
 *   .register("sum", (nums) => (nums as number[]).reduce((a, b) => a + b, 0));
 * const total = mediator.send<number[], number>("sum", [1, 2, 3]); // 6
 */
export class Mediator {
  private readonly handlers = new Map<
    string,
    (payload: unknown) => unknown
  >();

  /**
   * Register a handler under a name, replacing any existing handler with the
   * same name.
   *
   * @param name - The channel name.
   * @param handler - The handler invoked for this name.
   * @returns This mediator, for fluent chaining.
   */
  register(name: string, handler: (payload: unknown) => unknown): this {
    this.handlers.set(name, handler);
    return this;
  }

  /**
   * Send a payload to the handler registered under a name and return its
   * result.
   *
   * @typeParam T - The payload type.
   * @typeParam R - The result type.
   * @param name - The channel name to invoke.
   * @param payload - The payload passed to the handler.
   * @returns The handler's return value, cast to `R`.
   * @throws Error if no handler is registered for the name.
   */
  send<T = unknown, R = unknown>(name: string, payload?: T): R {
    const handler = this.handlers.get(name);
    if (handler === undefined) {
      throw new Error(`No handler registered for "${name}"`);
    }
    return handler(payload) as R;
  }

  /**
   * Check whether a handler is registered under a name.
   *
   * @param name - The channel name to check.
   * @returns `true` if a handler exists for the name.
   */
  has(name: string): boolean {
    return this.handlers.has(name);
  }
}
