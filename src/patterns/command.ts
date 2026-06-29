/**
 * A reversible action. Implementations apply an effect in {@link execute} and
 * reverse exactly that effect in {@link undo}.
 */
export interface Command {
  /** Apply the command's effect. */
  execute(): void;
  /** Reverse the effect previously applied by {@link execute}. */
  undo(): void;
}

/**
 * Manages execution of {@link Command} instances with undo/redo history. Each
 * executed command is pushed onto the undo stack; executing a new command
 * clears any pending redo history, mirroring typical editor behaviour.
 *
 * @example
 * const manager = new CommandManager();
 * manager.execute(command);
 * manager.undo();
 * manager.redo();
 */
export class CommandManager {
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];

  /**
   * Execute a command and push it onto the undo stack. Any redo history is
   * discarded.
   *
   * @param command - The command to execute and record.
   */
  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack.length = 0;
  }

  /**
   * Undo the most recent command, moving it to the redo stack.
   *
   * @returns `true` if a command was undone, `false` if there was nothing to
   * undo.
   */
  undo(): boolean {
    const command = this.undoStack.pop();
    if (command === undefined) return false;
    command.undo();
    this.redoStack.push(command);
    return true;
  }

  /**
   * Re-execute the most recently undone command, moving it back to the undo
   * stack.
   *
   * @returns `true` if a command was redone, `false` if there was nothing to
   * redo.
   */
  redo(): boolean {
    const command = this.redoStack.pop();
    if (command === undefined) return false;
    command.execute();
    this.undoStack.push(command);
    return true;
  }

  /**
   * Whether there is at least one command available to undo.
   *
   * @returns `true` if the undo stack is non-empty.
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Whether there is at least one command available to redo.
   *
   * @returns `true` if the redo stack is non-empty.
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Clear both the undo and redo history. */
  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}
