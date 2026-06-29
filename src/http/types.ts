/**
 * HTTP methods supported by the client.
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

/**
 * Strategy used to parse a response body. Maps to the matching method on the
 * `Response` object (`json`, `text`, `blob`, `arrayBuffer`).
 */
export type ResponseType = "json" | "text" | "blob" | "arrayBuffer";

/**
 * Per-request configuration accepted by adapters and the high-level client.
 */
export interface HttpRequestConfig {
  /** Target URL. May be absolute or relative to `baseURL`. */
  url: string;
  /** HTTP method. Defaults to `"GET"`. */
  method?: HttpMethod;
  /** Prefix prepended to relative `url` values. */
  baseURL?: string;
  /** Request headers as a plain object. */
  headers?: Record<string, string>;
  /** Query parameters appended to the URL. `null`/`undefined` are omitted. */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Request body. Plain objects are serialized to JSON when no body type is set. */
  body?: unknown;
  /** Timeout in milliseconds. When elapsed the request is aborted. */
  timeout?: number;
  /** External abort signal combined with the internal timeout signal. */
  signal?: AbortSignal;
  /** How to parse the response body. Defaults to `"json"`. */
  responseType?: ResponseType;
  /** Number of retries on network failure. Defaults to `0`. */
  retries?: number;
}

/**
 * Normalized response returned by every adapter.
 *
 * @typeParam T - The parsed body type.
 */
export interface HttpResponse<T = unknown> {
  /** Parsed response body. */
  data: T;
  /** HTTP status code. */
  status: number;
  /** HTTP status text. */
  statusText: string;
  /** Response headers as a plain object (lower-cased keys). */
  headers: Record<string, string>;
  /** `true` when `status` is below `400`. */
  ok: boolean;
  /** The resolved configuration used to perform the request. */
  config: HttpRequestConfig;
}

/**
 * Error thrown for network failures, timeouts, or non-2xx/3xx responses.
 *
 * @typeParam T - The parsed body type of the associated response, if any.
 */
export class HttpError<T = unknown> extends Error {
  /** The resolved configuration used to perform the request. */
  readonly config: HttpRequestConfig;
  /** The response that triggered the error, when one was received. */
  readonly response?: HttpResponse<T>;

  /**
   * Create an {@link HttpError}.
   *
   * @param message - Human-readable description of the failure.
   * @param config - The resolved request configuration.
   * @param response - The associated response, when available.
   * @param options - Optional error options, e.g. an underlying `cause`.
   */
  constructor(
    message: string,
    config: HttpRequestConfig,
    response?: HttpResponse<T>,
    options?: { cause?: unknown }
  ) {
    super(message);
    this.name = "HttpError";
    this.config = config;
    this.response = response;
    // Assign `cause` manually for compatibility with ES2020 targets, whose
    // Error constructor does not accept an options object.
    if (options && "cause" in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

/**
 * Pluggable transport abstraction (Adapter pattern). Swapping the adapter lets
 * the same client run on `fetch`, XHR, a mock, or any custom transport without
 * touching call sites.
 */
export interface HttpAdapter {
  /**
   * Perform a single request and resolve with a normalized response.
   *
   * @typeParam T - The parsed body type.
   * @param config - The resolved request configuration.
   */
  request<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
}

/**
 * Interceptor that may inspect or transform a request configuration before it
 * reaches the adapter. Part of a Chain of Responsibility executed in order.
 */
export type RequestInterceptor = (
  config: HttpRequestConfig
) => HttpRequestConfig | Promise<HttpRequestConfig>;

/**
 * Interceptor that may inspect or transform a response after it leaves the
 * adapter. Part of a Chain of Responsibility executed in order.
 */
export type ResponseInterceptor = (
  response: HttpResponse
) => HttpResponse | Promise<HttpResponse>;
