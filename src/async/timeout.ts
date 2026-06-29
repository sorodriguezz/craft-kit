/**
 * Error thrown when a promise wrapped by {@link timeout} does not settle
 * within the allotted time.
 */
export class TimeoutError extends Error {
  constructor(message = "Operation timed out.") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Race a promise against a timer, rejecting with a {@link TimeoutError} if the
 * promise does not settle within `ms` milliseconds. The internal timer is
 * always cleared once the race resolves, so it never keeps the event loop
 * alive after settling.
 *
 * @typeParam T - The resolved value type of the wrapped promise.
 * @param promise - The promise to guard with a deadline.
 * @param ms - Maximum time to wait, in milliseconds.
 * @param message - Optional message for the {@link TimeoutError}.
 * @returns A promise that mirrors `promise` but rejects on timeout.
 *
 * @example
 * await timeout(fetchData(), 1000, "fetchData took too long");
 */
export function timeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(message));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (reason) => {
        clearTimeout(timer);
        reject(reason);
      }
    );
  });
}
