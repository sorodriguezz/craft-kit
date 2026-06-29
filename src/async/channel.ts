/**
 * The result of a {@link Channel.receive} call: either a delivered value or a
 * signal that the channel is closed and drained.
 */
export type ChannelResult<T> =
  | { value: T; done: false }
  | { value: undefined; done: true };

interface PendingSend<T> {
  value: T;
  resolve: () => void;
  reject: (reason: unknown) => void;
}

interface PendingReceive<T> {
  resolve: (result: ChannelResult<T>) => void;
}

/**
 * Error thrown when sending on a closed {@link Channel}.
 */
export class ChannelClosedError extends Error {
  constructor(message = "Cannot send on a closed channel") {
    super(message);
    this.name = "ChannelClosedError";
  }
}

/**
 * A CSP-style communication channel with optional bounded capacity and
 * backpressure.
 *
 * Values are buffered up to `capacity`. On a bounded channel {@link send}
 * waits when the buffer is full until a receiver makes room; on an unbounded
 * channel (the default) sends never block. Waiting receivers are handed values
 * directly without buffering. Once {@link close} is called sends are rejected
 * and {@link receive} drains the remaining buffer before reporting `done`.
 */
export class Channel<T> {
  private readonly capacity: number;
  private readonly buffer: T[] = [];
  private readonly sendQueue: Array<PendingSend<T>> = [];
  private readonly receiveQueue: Array<PendingReceive<T>> = [];
  private closed = false;

  /**
   * Creates a new channel.
   * @param capacity - Maximum number of buffered values; defaults to Infinity (unbounded).
   */
  constructor(capacity: number = Infinity) {
    this.capacity = capacity;
  }

  /**
   * Sends a value into the channel.
   * @param value - The value to enqueue.
   * @returns A promise that resolves once the value is buffered or delivered.
   * @throws {ChannelClosedError} If the channel is closed.
   */
  send(value: T): Promise<void> {
    if (this.closed) {
      return Promise.reject(new ChannelClosedError());
    }

    const receiver = this.receiveQueue.shift();
    if (receiver !== undefined) {
      receiver.resolve({ value, done: false });
      return Promise.resolve();
    }

    if (this.buffer.length < this.capacity) {
      this.buffer.push(value);
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      this.sendQueue.push({ value, resolve, reject });
    });
  }

  /**
   * Receives the next value from the channel.
   * @returns A promise resolving to a value (`done: false`) or, once the
   * channel is closed and drained, a `done: true` result.
   */
  receive(): Promise<ChannelResult<T>> {
    if (this.buffer.length > 0) {
      const value = this.buffer.shift() as T;
      this.pullFromSendQueue();
      return Promise.resolve({ value, done: false });
    }

    const pendingSend = this.sendQueue.shift();
    if (pendingSend !== undefined) {
      pendingSend.resolve();
      return Promise.resolve({ value: pendingSend.value, done: false });
    }

    if (this.closed) {
      return Promise.resolve({ value: undefined, done: true });
    }

    return new Promise<ChannelResult<T>>((resolve) => {
      this.receiveQueue.push({ resolve });
    });
  }

  /**
   * Closes the channel. Pending sends are rejected, waiting receivers are
   * signalled `done`, and subsequent sends throw.
   */
  close(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;

    while (this.sendQueue.length > 0) {
      const pending = this.sendQueue.shift();
      if (pending !== undefined) {
        pending.reject(new ChannelClosedError());
      }
    }

    while (this.receiveQueue.length > 0) {
      const receiver = this.receiveQueue.shift();
      if (receiver !== undefined) {
        receiver.resolve({ value: undefined, done: true });
      }
    }
  }

  /**
   * Async iterator over received values; ends when the channel is closed and
   * drained.
   */
  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: async (): Promise<IteratorResult<T>> => {
        const result = await this.receive();
        if (result.done) {
          return { value: undefined, done: true };
        }
        return { value: result.value, done: false };
      },
    };
  }

  /**
   * After a buffer slot frees up, promote the oldest blocked sender (if any)
   * into the buffer so its `send` promise resolves.
   */
  private pullFromSendQueue(): void {
    if (this.buffer.length >= this.capacity) {
      return;
    }
    const pending = this.sendQueue.shift();
    if (pending === undefined) {
      return;
    }
    this.buffer.push(pending.value);
    pending.resolve();
  }
}
