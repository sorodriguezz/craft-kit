/**
 * Configuration describing a finite state machine: the initial state, the
 * transition table mapping each state to the events it accepts, and an
 * optional hook fired on every successful transition.
 *
 * @typeParam S - The union of state names.
 * @typeParam E - The union of event names.
 */
export interface StateMachineConfig<S extends string, E extends string> {
  /** The state the machine starts in. */
  initial: S;
  /**
   * For each state, a partial map from accepted events to the resulting
   * state. Events absent from a state's entry are rejected in that state.
   */
  transitions: Record<S, Partial<Record<E, S>>>;
  /** Optional callback invoked after each successful transition. */
  onTransition?: (from: S, event: E, to: S) => void;
}

/**
 * A deterministic finite state machine driven by a static transition table.
 *
 * @typeParam S - The union of state names.
 * @typeParam E - The union of event names.
 *
 * @example
 * const machine = new StateMachine({
 *   initial: "idle",
 *   transitions: {
 *     idle: { start: "running" },
 *     running: { stop: "idle" },
 *   },
 * });
 * machine.send("start"); // true, now "running"
 */
export class StateMachine<S extends string, E extends string> {
  private currentState: S;
  private readonly config: StateMachineConfig<S, E>;

  /**
   * Create a state machine from a configuration.
   *
   * @param config - The initial state, transition table and optional hook.
   */
  constructor(config: StateMachineConfig<S, E>) {
    this.config = config;
    this.currentState = config.initial;
  }

  /** The machine's current state. */
  get state(): S {
    return this.currentState;
  }

  /**
   * Check whether an event would cause a transition from the current state.
   *
   * @param event - The event to test.
   * @returns `true` if the event is accepted in the current state.
   */
  can(event: E): boolean {
    const available = this.config.transitions[this.currentState];
    return available[event] !== undefined;
  }

  /**
   * Send an event to the machine. If the current state accepts the event the
   * machine transitions and the optional `onTransition` hook fires.
   *
   * @param event - The event to dispatch.
   * @returns `true` if a transition occurred, `false` if the event was
   * rejected in the current state.
   */
  send(event: E): boolean {
    const available = this.config.transitions[this.currentState];
    const next = available[event];
    if (next === undefined) return false;
    const from = this.currentState;
    this.currentState = next;
    this.config.onTransition?.(from, event, next);
    return true;
  }

  /** Reset the machine back to its configured initial state. */
  reset(): void {
    this.currentState = this.config.initial;
  }
}
