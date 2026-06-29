import { Result } from "./result";

/** Runs `fn`, capturing a thrown error into a Result instead of throwing. */
export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return Result.ok<T, Error>(fn());
  } catch (error) {
    return Result.err<T, Error>(error instanceof Error ? error : new Error(String(error)));
  }
}

/** Async variant of {@link tryCatch}; awaits `fn` and never rejects. */
export async function tryCatchAsync<T>(fn: () => Promise<T> | T): Promise<Result<T, Error>> {
  try {
    return Result.ok<T, Error>(await fn());
  } catch (error) {
    return Result.err<T, Error>(error instanceof Error ? error : new Error(String(error)));
  }
}
