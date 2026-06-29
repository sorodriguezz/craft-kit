/**
 * A strongly typed implementation of the observer pattern. Events and their
 * payload types are described by a map type, so listeners are checked against
 * the payload of the specific event they subscribe to.
 *
 * @typeParam TEvents - A map of event names to their payload types.
 *
 * @example
 * type Events = { login: { userId: string }; logout: void };
 * const emitter = new EventEmitter<Events>();
 * const off = emitter.on("login", ({ userId }) => console.log(userId));
 * emitter.emit("login", { userId: "42" });
 * off();
 */
export class EventEmitter<TEvents extends Record<string, unknown>> {
  private readonly listeners = new Map<
    keyof TEvents,
    Array<(payload: TEvents[keyof TEvents]) => void>
  >();

  /**
   * Subscribe to an event.
   *
   * @typeParam K - The event name.
   * @param event - The event to listen for.
   * @param listener - Called with the payload whenever the event is emitted.
   * @returns An unsubscribe function that removes this listener.
   */
  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): () => void {
    const handlers = this.listeners.get(event);
    const typed = listener as (payload: TEvents[keyof TEvents]) => void;
    if (handlers) {
      handlers.push(typed);
    } else {
      this.listeners.set(event, [typed]);
    }
    return () => this.off(event, listener);
  }

  /**
   * Subscribe to an event for a single emission. The listener is removed
   * automatically after it runs once.
   *
   * @typeParam K - The event name.
   * @param event - The event to listen for.
   * @param listener - Called once with the payload, then removed.
   * @returns An unsubscribe function that cancels the pending listener.
   */
  once<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): () => void {
    const wrapper = (payload: TEvents[K]): void => {
      this.off(event, wrapper);
      listener(payload);
    };
    return this.on(event, wrapper);
  }

  /**
   * Remove a previously registered listener for an event. Listeners are
   * compared by reference; passing a function that was not registered is a
   * no-op.
   *
   * @typeParam K - The event name.
   * @param event - The event the listener was registered for.
   * @param listener - The exact function reference to remove.
   */
  off<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    const typed = listener as (payload: TEvents[keyof TEvents]) => void;
    const index = handlers.indexOf(typed);
    if (index !== -1) handlers.splice(index, 1);
    if (handlers.length === 0) this.listeners.delete(event);
  }

  /**
   * Emit an event, invoking every registered listener with the payload.
   * Listeners are called synchronously in registration order over a snapshot,
   * so unsubscribing during emission does not skip other listeners.
   *
   * @typeParam K - The event name.
   * @param event - The event to emit.
   * @param payload - The payload passed to each listener.
   */
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers.slice()) {
      handler(payload as TEvents[keyof TEvents]);
    }
  }

  /**
   * Remove all listeners for a single event, or every listener for every
   * event when no event is provided.
   *
   * @param event - The event to clear; omit to clear all events.
   */
  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event === undefined) {
      this.listeners.clear();
    } else {
      this.listeners.delete(event);
    }
  }

  /**
   * Count the listeners currently registered for an event.
   *
   * @param event - The event to inspect.
   * @returns The number of registered listeners.
   */
  listenerCount<K extends keyof TEvents>(event: K): number {
    return this.listeners.get(event)?.length ?? 0;
  }
}
