import type {
  HttpAdapter,
  HttpRequestConfig,
  HttpResponse,
  ResponseType,
} from "./types";
import { HttpError } from "./types";

/**
 * Body type accepted by the global `fetch`. Derived from its own signature so
 * it stays correct without depending on a global `BodyInit` name (which is not
 * exposed as a global by `@types/node`).
 */
type FetchBody = NonNullable<NonNullable<Parameters<typeof fetch>[1]>["body"]>;

/**
 * Join a base URL, a path, and serialized query parameters into a final URL.
 * Avoids duplicating the slash between `baseURL` and `url`.
 */
function buildUrl(config: HttpRequestConfig): string {
  const base = config.baseURL ?? "";
  const path = config.url;

  let full: string;
  if (!base) {
    full = path;
  } else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) {
    // `url` is already absolute; ignore the base.
    full = path;
  } else {
    const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const trimmedPath = path.startsWith("/") ? path : `/${path}`;
    full = `${trimmedBase}${trimmedPath}`;
  }

  const query = config.query;
  if (query) {
    const search = new URLSearchParams();
    for (const key of Object.keys(query)) {
      const value = query[key];
      if (value === null || value === undefined) continue;
      search.append(key, String(value));
    }
    const serialized = search.toString();
    if (serialized) {
      full += (full.includes("?") ? "&" : "?") + serialized;
    }
  }

  return full;
}

/**
 * Read a header value from an existing headers object in a case-insensitive
 * way without mutating it.
 */
function hasHeader(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) return true;
  }
  return false;
}

/**
 * Parse a `Response` body according to the requested {@link ResponseType}. When
 * JSON parsing fails on an empty body, `undefined` is returned instead of
 * throwing.
 */
async function parseBody<T>(
  response: Response,
  responseType: ResponseType
): Promise<T> {
  switch (responseType) {
    case "text":
      return (await response.text()) as T;
    case "blob":
      return (await response.blob()) as T;
    case "arrayBuffer":
      return (await response.arrayBuffer()) as T;
    case "json":
    default: {
      const raw = await response.text();
      if (raw.length === 0) return undefined as T;
      try {
        return JSON.parse(raw) as T;
      } catch {
        // Non-empty but invalid JSON: surface the raw text rather than throwing.
        return raw as T;
      }
    }
  }
}

/**
 * Default transport adapter built on the Fetch API.
 *
 * Implements the {@link HttpAdapter} contract so it can be swapped for any other
 * transport (Adapter pattern). It never throws on non-2xx/3xx statuses; that
 * decision is delegated to the caller. Network errors and timeouts are wrapped
 * in {@link HttpError}.
 *
 * @example
 * const adapter = new FetchAdapter();
 * const res = await adapter.request({ url: "https://api.example.com/health" });
 * console.log(res.status, res.data);
 */
export class FetchAdapter implements HttpAdapter {
  private readonly fetchImpl?: typeof fetch;

  /**
   * Create a {@link FetchAdapter}.
   *
   * @param fetchImpl - Custom `fetch` implementation. Defaults to
   * `globalThis.fetch`. When neither is available, an explanatory error is
   * thrown the first time {@link FetchAdapter.request} runs.
   */
  constructor(fetchImpl?: typeof fetch) {
    this.fetchImpl =
      fetchImpl ??
      (typeof globalThis.fetch === "function"
        ? globalThis.fetch.bind(globalThis)
        : undefined);
  }

  /**
   * Perform a single request using the configured `fetch` implementation.
   *
   * @typeParam T - The parsed body type.
   * @param config - The resolved request configuration.
   * @returns A normalized {@link HttpResponse}.
   * @throws {HttpError} On network failure or timeout.
   */
  async request<T = unknown>(
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const fetchImpl = this.fetchImpl;
    if (!fetchImpl) {
      throw new Error(
        "FetchAdapter: global fetch is unavailable. On Node <18, pass a fetch " +
          "implementation to `new FetchAdapter(fetchImpl)` or use a different adapter."
      );
    }

    const url = buildUrl(config);
    const method = config.method ?? "GET";
    const responseType = config.responseType ?? "json";

    // Build headers without mutating the caller's object.
    const headers: Record<string, string> = { ...(config.headers ?? {}) };

    // Serialize plain-object bodies to JSON when no content type is declared.
    let body: FetchBody | undefined;
    if (config.body !== undefined && config.body !== null) {
      if (isJsonSerializable(config.body)) {
        if (!hasHeader(headers, "content-type")) {
          headers["Content-Type"] = "application/json";
        }
        body = JSON.stringify(config.body);
      } else {
        body = config.body as FetchBody;
      }
    }

    // Combine the optional timeout with any externally supplied signal.
    const controller = new AbortController();
    const cleanups: Array<() => void> = [];

    if (config.signal) {
      const external = config.signal;
      if (external.aborted) {
        controller.abort(external.reason);
      } else {
        const onAbort = () => controller.abort(external.reason);
        external.addEventListener("abort", onAbort);
        cleanups.push(() => external.removeEventListener("abort", onAbort));
      }
    }

    let timedOut = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (config.timeout !== undefined && config.timeout > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, config.timeout);
      cleanups.push(() => clearTimeout(timer));
    }

    const runCleanups = () => {
      for (const fn of cleanups) fn();
    };

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
    } catch (error) {
      runCleanups();
      if (timedOut) {
        throw new HttpError(
          `Request to ${url} timed out after ${config.timeout}ms.`,
          config,
          undefined,
          { cause: error }
        );
      }
      throw new HttpError(
        `Network request to ${url} failed.`,
        config,
        undefined,
        { cause: error }
      );
    }

    let data: T;
    try {
      data = await parseBody<T>(response, responseType);
    } catch (error) {
      runCleanups();
      throw new HttpError(
        `Failed to read response body from ${url}.`,
        config,
        undefined,
        { cause: error }
      );
    }

    runCleanups();

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      ok: response.status < 400,
      config,
    };
  }
}

/**
 * Determine whether a body should be JSON-serialized. Excludes web body types
 * (strings, streams, form data, buffers) that `fetch` already understands.
 */
function isJsonSerializable(body: unknown): boolean {
  if (
    typeof body === "string" ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return false;
  }
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
    return false;
  }
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return false;
  }
  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return false;
  }
  if (
    typeof ReadableStream !== "undefined" &&
    body instanceof ReadableStream
  ) {
    return false;
  }
  return typeof body === "object" || Array.isArray(body);
}
