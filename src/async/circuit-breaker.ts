/**
 * Error thrown when the circuit breaker is open and rejects a call
 * without invoking the wrapped function.
 */
export class CircuitOpenError extends Error {
  constructor(message = "Circuit breaker is open") {
    super(message);
    this.name = "CircuitOpenError";
  }
}

/** The current operational state of a {@link CircuitBreaker}. */
export type CircuitState = "closed" | "open" | "half-open";

/** Configuration options for a {@link CircuitBreaker}. */
export interface CircuitBreakerOptions {
  /** Number of consecutive failures that trips the breaker to "open". Defaults to 5. */
  failureThreshold?: number;
  /** Time in milliseconds to stay "open" before transitioning to "half-open". Defaults to 30000. */
  resetTimeoutMs?: number;
  /** Number of trial calls allowed while "half-open". Defaults to 1. */
  halfOpenMax?: number;
  /** Optional callback invoked on every state transition. */
  onStateChange?: (state: CircuitState) => void;
}

/**
 * Implements the Circuit Breaker pattern to protect a downstream resource
 * from repeated failing calls.
 *
 * In the "closed" state calls flow through and consecutive failures are
 * counted; reaching {@link CircuitBreakerOptions.failureThreshold} trips the
 * breaker to "open", where calls are rejected with {@link CircuitOpenError}.
 * After {@link CircuitBreakerOptions.resetTimeoutMs} the breaker moves to
 * "half-open" and allows up to {@link CircuitBreakerOptions.halfOpenMax} trial
 * calls; if they all succeed the breaker returns to "closed", otherwise it
 * returns to "open" and the timer restarts.
 */
export class CircuitBreaker {
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenMax: number;
  private readonly onStateChange?: (state: CircuitState) => void;

  private currentState: CircuitState = "closed";
  private failureCount = 0;
  private openedAt = 0;
  private halfOpenInFlight = 0;
  private halfOpenSuccesses = 0;

  /**
   * Creates a new circuit breaker.
   * @param options - Optional configuration overriding the defaults.
   */
  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30000;
    this.halfOpenMax = options.halfOpenMax ?? 1;
    this.onStateChange = options.onStateChange;
  }

  /** The current state of the circuit breaker. */
  get state(): CircuitState {
    return this.currentState;
  }

  /**
   * Executes the supplied function subject to the circuit breaker policy.
   * @typeParam T - The resolved value type of the wrapped function.
   * @param fn - The asynchronous operation to guard.
   * @returns The resolved value of `fn`.
   * @throws {CircuitOpenError} When the breaker is open or the half-open trial quota is exhausted.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.currentState === "open") {
      if (Date.now() - this.openedAt >= this.resetTimeoutMs) {
        this.transitionTo("half-open");
      } else {
        throw new CircuitOpenError();
      }
    }

    if (this.currentState === "half-open") {
      if (this.halfOpenInFlight >= this.halfOpenMax) {
        throw new CircuitOpenError();
      }
      this.halfOpenInFlight++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.currentState === "half-open") {
      this.halfOpenInFlight = Math.max(0, this.halfOpenInFlight - 1);
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.halfOpenMax) {
        this.transitionTo("closed");
      }
      return;
    }
    this.failureCount = 0;
  }

  private onFailure(): void {
    if (this.currentState === "half-open") {
      this.halfOpenInFlight = Math.max(0, this.halfOpenInFlight - 1);
      this.transitionTo("open");
      return;
    }
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.transitionTo("open");
    }
  }

  private transitionTo(next: CircuitState): void {
    if (next === this.currentState) {
      return;
    }
    this.currentState = next;
    if (next === "open") {
      this.openedAt = Date.now();
      this.halfOpenInFlight = 0;
      this.halfOpenSuccesses = 0;
    } else if (next === "half-open") {
      this.halfOpenInFlight = 0;
      this.halfOpenSuccesses = 0;
    } else {
      this.failureCount = 0;
      this.halfOpenInFlight = 0;
      this.halfOpenSuccesses = 0;
    }
    this.onStateChange?.(next);
  }
}
