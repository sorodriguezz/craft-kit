/**
 * A minimal publish/subscribe hub keyed by string topics. Unlike
 * {@link EventEmitter}, topics are dynamic strings rather than a fixed typed
 * map, which suits loosely coupled messaging where topics are not known ahead
 * of time.
 *
 * @typeParam T - The message type shared across all topics.
 *
 * @example
 * const bus = new PubSub<string>();
 * const off = bus.subscribe("news", (msg) => console.log(msg));
 * bus.publish("news", "hello");
 * off();
 */
export class PubSub<T = unknown> {
  private readonly topics = new Map<string, Array<(msg: T) => void>>();

  /**
   * Subscribe a handler to a topic.
   *
   * @param topic - The topic to listen on.
   * @param handler - Called with each message published to the topic.
   * @returns An unsubscribe function that removes this handler.
   */
  subscribe(topic: string, handler: (msg: T) => void): () => void {
    const handlers = this.topics.get(topic);
    if (handlers) {
      handlers.push(handler);
    } else {
      this.topics.set(topic, [handler]);
    }
    return () => {
      const current = this.topics.get(topic);
      if (!current) return;
      const index = current.indexOf(handler);
      if (index !== -1) current.splice(index, 1);
      if (current.length === 0) this.topics.delete(topic);
    };
  }

  /**
   * Publish a message to every handler subscribed to a topic. Handlers run
   * synchronously over a snapshot taken before dispatch.
   *
   * @param topic - The topic to publish to.
   * @param message - The message delivered to each handler.
   */
  publish(topic: string, message: T): void {
    const handlers = this.topics.get(topic);
    if (!handlers) return;
    for (const handler of handlers.slice()) {
      handler(message);
    }
  }

  /**
   * Remove all handlers for a single topic, or every handler for every topic
   * when no topic is provided.
   *
   * @param topic - The topic to clear; omit to clear all topics.
   */
  clear(topic?: string): void {
    if (topic === undefined) {
      this.topics.clear();
    } else {
      this.topics.delete(topic);
    }
  }
}
