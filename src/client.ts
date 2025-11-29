/**
 * Base HTTP client for Hit SDK.
 *
 * Provides common functionality for all service clients:
 * - Error handling
 * - Request/response handling
 * - Common headers
 */

export class HitAPIError extends Error {
  statusCode: number;
  response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'HitAPIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export interface HitClientOptions {
  baseUrl?: string;
  namespace?: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Base HTTP client for Hit services.
 *
 * Provides error handling and common headers.
 */
export class HitClient {
  private baseUrl: string;
  private namespace?: string;
  private apiKey?: string;
  private timeout: number;

  constructor(options: HitClientOptions = {}) {
    this.baseUrl = (options.baseUrl || '').replace(/\/$/, '');
    this.namespace = options.namespace;
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || 30000;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'hit-sdk-typescript/1.0.0',
    };

    if (this.namespace) {
      headers['X-Hit-Namespace'] = this.namespace;
    }

    if (this.apiKey) {
      headers['X-Hit-API-Key'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Make GET request.
   *
   * @param path - API path (e.g., "/counter/test")
   * @param params - Query parameters
   * @returns Response JSON
   * @throws HitAPIError on API error
   */
  async get<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
    const urlPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(urlPath, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HitAPIError(`Request timeout after ${this.timeout}ms`, 0);
      }
      // Provide more helpful error messages for connection failures
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('connection')) {
        throw new HitAPIError(
          `Cannot connect to service at ${this.baseUrl}. Make sure the service is running. ` +
          `For Hit modules, start with: hit services run <module-name>`,
          0
        );
      }
      throw new HitAPIError(`Request failed: ${errorMessage}`, 0);
    }
  }

  /**
   * Make POST request.
   *
   * @param path - API path
   * @param body - JSON body
   * @returns Response JSON
   * @throws HitAPIError on API error
   */
  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    const urlPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(urlPath, this.baseUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HitAPIError(`Request timeout after ${this.timeout}ms`, 0);
      }
      // Provide more helpful error messages for connection failures
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('connection')) {
        throw new HitAPIError(
          `Cannot connect to service at ${this.baseUrl}. Make sure the service is running. ` +
          `For Hit modules, start with: hit services run <module-name>`,
          0
        );
      }
      throw new HitAPIError(`Request failed: ${errorMessage}`, 0);
    }
  }

  private async handleError(response: Response): Promise<never> {
    let message: string;
    let responseData: unknown;

    try {
      responseData = await response.json();
      if (typeof responseData === 'object' && responseData !== null && 'detail' in responseData) {
        message = String(responseData.detail);
      } else {
        message = response.statusText;
      }
    } catch {
      message = response.statusText;
    }

    throw new HitAPIError(message, response.status, responseData);
  }
}

