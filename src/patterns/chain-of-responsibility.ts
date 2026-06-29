/**
 * A middleware-style handler. Each handler receives a shared context and a
 * `next` callback; calling `next()` passes control to the following handler in
 * the chain. Not calling `next()` stops the chain.
 *
 * @typeParam TContext - The context object threaded through the chain.
 */
export type Handler<TContext> = (context: TContext, next: () => void) => void;

/**
 * A chain of responsibility that runs registered handlers in order, Express
 * middleware style. Each handler decides whether to delegate to the next one.
 *
 * @typeParam TContext - The context object threaded through the chain.
 *
 * @example
 * const chain = new Chain<{ value: number }>()
 *   .use((ctx, next) => { ctx.value += 1; next(); })
 *   .use((ctx) => { ctx.value *= 2; });
 * const ctx = { value: 1 };
 * chain.handle(ctx); // ctx.value === 4
 */
export class Chain<TContext> {
  private readonly handlers: Array<Handler<TContext>> = [];

  /**
   * Append a handler to the chain.
   *
   * @param handler - The handler to add.
   * @returns This chain, for fluent chaining.
   */
  use(handler: Handler<TContext>): this {
    this.handlers.push(handler);
    return this;
  }

  /**
   * Run the chain against a context. Handlers execute in registration order;
   * the chain advances only when a handler invokes its `next` callback. A
   * handler that calls `next()` more than once advances only once.
   *
   * @param context - The context passed to every handler.
   */
  handle(context: TContext): void {
    let index = -1;
    const dispatch = (i: number): void => {
      if (i <= index) return;
      index = i;
      const handler = this.handlers[i];
      if (handler === undefined) return;
      handler(context, () => dispatch(i + 1));
    };
    dispatch(0);
  }
}
