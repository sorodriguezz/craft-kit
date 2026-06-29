import { retry } from "../async/retry";
import { FetchAdapter } from "./fetch-adapter";
import type {
  HttpAdapter,
  HttpMethod,
  HttpRequestConfig,
  HttpResponse,
  RequestInterceptor,
  ResponseInterceptor,
} from "./types";
import { HttpError } from "./types";

/**
 * Construction options for {@link HttpClient}.
 */
export interface HttpClientOptions {
  /** Base URL prepended to relative request URLs. */
  baseURL?: string;
  /** Default headers merged into every request. */
  headers?: Record<string, string>;
  /** Transport adapter. Defaults to a new {@link FetchAdapter}. */
  adapter?: HttpAdapter;
  /** Default timeout in milliseconds. */
  timeout?: number;
  /** Default number of retries on network failure. */
  retries?: number;
}

/**
 * High-level, framework-agnostic HTTP client.
 *
 * Combines three patterns:
 * - **Adapter**: the network layer is an injectable {@link HttpAdapter}, so the
 *   transport (fetch, XHR, mock, etc.) is interchangeable.
 * - **Chain of Responsibility**: request/response interceptors run in order,
 *   each able to inspect or transform the value before passing it along.
 * - **Strategy**: response parsing is selected per request via `responseType`.
 *
 * @example
 * const api = new HttpClient({ baseURL: "https://api.example.com", retries: 2 });
 * api.useRequestInterceptor((cfg) => ({
 *   ...cfg,
 *   headers: { ...cfg.headers, Authorization: "Bearer token" },
 * }));
 * const { data } = await api.get<User[]>("/users");
 */
export class HttpClient {
  private readonly baseURL?: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly adapter: HttpAdapter;
  private readonly defaultTimeout?: number;
  private readonly defaultRetries: number;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  /**
   * Create an {@link HttpClient}.
   *
   * @param options - Client-wide defaults. See {@link HttpClientOptions}.
   */
  constructor(options?: HttpClientOptions) {
    this.baseURL = options?.baseURL;
    this.defaultHeaders = { ...(options?.headers ?? {}) };
    this.adapter = options?.adapter ?? new FetchAdapter();
    this.defaultTimeout = options?.timeout;
    this.defaultRetries = options?.retries ?? 0;
  }

  /**
   * Register a request interceptor. Interceptors run in registration order
   * before the request reaches the adapter.
   *
   * @param fn - Interceptor to add.
   * @returns The client instance for chaining.
   */
  useRequestInterceptor(fn: RequestInterceptor): this {
    this.requestInterceptors.push(fn);
    return this;
  }

  /**
   * Register a response interceptor. Interceptors run in registration order
   * after the adapter returns and before the client checks `ok`.
   *
   * @param fn - Interceptor to add.
   * @returns The client instance for chaining.
   */
  useResponseInterceptor(fn: ResponseInterceptor): this {
    this.responseInterceptors.push(fn);
    return this;
  }

  /**
   * Perform a request, applying defaults, interceptors, and retries.
   *
   * The merged configuration is computed without mutating the input. Network
   * failures are retried using {@link retry}; a non-`ok` response (status
   * `>= 400`) is surfaced as an {@link HttpError} carrying the response.
   *
   * @typeParam T - The parsed body type.
   * @param config - Per-request configuration.
   * @returns The normalized {@link HttpResponse}.
   * @throws {HttpError} On network failure, timeout, or a non-`ok` response.
   */
  async request<T = unknown>(
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    // Merge defaults without mutating the caller's config.
    let resolved: HttpRequestConfig = {
      ...config,
      baseURL: config.baseURL ?? this.baseURL,
      headers: { ...this.defaultHeaders, ...(config.headers ?? {}) },
      timeout: config.timeout ?? this.defaultTimeout,
      retries: config.retries ?? this.defaultRetries,
    };

    // Chain of Responsibility: request interceptors in order.
    for (const interceptor of this.requestInterceptors) {
      resolved = await interceptor(resolved);
    }

    const retries = resolved.retries ?? 0;

    // Retry only network/transport failures; an HttpError without a response
    // means the request never produced a response, so it is safe to retry.
    let response = await retry(() => this.adapter.request<T>(resolved), {
      retries,
    });

    // Chain of Responsibility: response interceptors in order.
    for (const interceptor of this.responseInterceptors) {
      response = (await interceptor(response)) as HttpResponse<T>;
    }

    if (!response.ok) {
      throw new HttpError<T>(
        `Request to ${resolved.url} failed with status ${response.status}.`,
        resolved,
        response
      );
    }

    return response;
  }

  /**
   * Perform a `GET` request.
   *
   * @typeParam T - The parsed body type.
   * @param url - Target URL (absolute or relative to `baseURL`).
   * @param config - Optional per-request overrides.
   */
  get<T = unknown>(
    url: string,
    config?: Omit<HttpRequestConfig, "url" | "method" | "body">
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: "GET" });
  }

  /**
   * Perform a `DELETE` request.
   *
   * @typeParam T - The parsed body type.
   * @param url - Target URL (absolute or relative to `baseURL`).
   * @param config - Optional per-request overrides.
   */
  delete<T = unknown>(
    url: string,
    config?: Omit<HttpRequestConfig, "url" | "method">
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }

  /**
   * Perform a `HEAD` request.
   *
   * @typeParam T - The parsed body type.
   * @param url - Target URL (absolute or relative to `baseURL`).
   * @param config - Optional per-request overrides.
   */
  head<T = unknown>(
    url: string,
    config?: Omit<HttpRequestConfig, "url" | "method" | "body">
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: "HEAD" });
  }

  /**
   * Perform a `POST` request.
   *
   * @typeParam T - The parsed body type.
   * @param url - Target URL (absolute or relative to `baseURL`).
   * @param body - Request body. Plain objects are JSON-serialized.
   * @param config - Optional per-request overrides.
   */
  post<T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<HttpRequestConfig, "url" | "method" | "body">
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: "POST", body });
  }

  /**
   * Perform a `PUT` request.
   *
   * @typeParam T - The parsed body type.
   * @param url - Target URL (absolute or relative to `baseURL`).
   * @param body - Request body. Plain objects are JSON-serialized.
   * @param config - Optional per-request overrides.
   */
  put<T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<HttpRequestConfig, "url" | "method" | "body">
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: "PUT", body });
  }

  /**
   * Perform a `PATCH` request.
   *
   * @typeParam T - The parsed body type.
   * @param url - Target URL (absolute or relative to `baseURL`).
   * @param body - Request body. Plain objects are JSON-serialized.
   * @param config - Optional per-request overrides.
   */
  patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<HttpRequestConfig, "url" | "method" | "body">
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: "PATCH", body });
  }
}

/** Re-exported for convenience when narrowing method values. */
export type { HttpMethod };
