/**
 * Ping-pong service client.
 *
 * Example:
 * ```typescript
 * import { pingPong } from '@hit/sdk';
 *
 * // Get counter
 * const count = await pingPong.getCounter('test');
 *
 * // Increment
 * const newCount = await pingPong.increment('test');
 *
 * // Reset
 * await pingPong.reset('test');
 * ```
 */

import { HitClient, HitClientOptions } from './client.js';
import { getApiKey, getNamespace, getServiceUrl } from './config.js';

export interface CounterResponse {
  id: string;
  value: number;
}

/**
 * Client for ping-pong counter service.
 */
export class PingPongClient {
  private client: HitClient;

  constructor(options: HitClientOptions = {}) {
    const baseUrl = options.baseUrl || getServiceUrl('ping-pong');
    const namespace = options.namespace || getNamespace();
    const apiKey = options.apiKey || getApiKey('ping-pong') || undefined;

    // Debug logging in development
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      console.debug('[Hit SDK] PingPongClient initialized:', {
        baseUrl,
        namespace,
        hasApiKey: !!apiKey,
      });
    }

    this.client = new HitClient({
      baseUrl,
      namespace,
      apiKey,
      timeout: options.timeout,
    });
  }

  /**
   * Get current counter value.
   *
   * @param counterId - Counter identifier
   * @returns Current counter value
   */
  async getCounter(counterId: string): Promise<number> {
    const response = await this.client.get<CounterResponse>(`/counter/${counterId}`);
    return response.value;
  }

  /**
   * Increment counter and return new value.
   *
   * @param counterId - Counter identifier
   * @returns New counter value
   */
  async increment(counterId: string): Promise<number> {
    const response = await this.client.post<CounterResponse>(`/counter/${counterId}/increment`);
    return response.value;
  }

  /**
   * Reset counter to 0.
   *
   * @param counterId - Counter identifier
   * @returns Reset counter value (always 0)
   */
  async reset(counterId: string): Promise<number> {
    const response = await this.client.post<CounterResponse>(`/counter/${counterId}/reset`);
    return response.value;
  }

  /**
   * Get ping-pong service configuration via /hit/config endpoint.
   *
   * @returns Configuration object including module settings
   */
  async getConfig(): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>('/hit/config');
  }

  /**
   * Get ping-pong service version via /hit/version endpoint.
   *
   * @returns Version object with module name and version
   */
  async version(): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>('/hit/version');
  }
}

// Default client instance - created lazily on first use to ensure env vars are available
let defaultClient: PingPongClient | null = null;

function getDefaultClient(): PingPongClient {
  if (!defaultClient) {
    defaultClient = new PingPongClient();
  }
  return defaultClient;
}

// Module-level convenience functions
/**
 * Get current counter value.
 *
 * @param counterId - Counter identifier
 * @returns Current counter value
 */
export async function getCounter(counterId: string): Promise<number> {
  return getDefaultClient().getCounter(counterId);
}

/**
 * Increment counter and return new value.
 *
 * @param counterId - Counter identifier
 * @returns New counter value
 */
export async function increment(counterId: string): Promise<number> {
  return getDefaultClient().increment(counterId);
}

/**
 * Reset counter to 0.
 *
 * @param counterId - Counter identifier
 * @returns Reset counter value (always 0)
 */
export async function reset(counterId: string): Promise<number> {
  return getDefaultClient().reset(counterId);
}

/**
 * Get ping-pong service configuration via /hit/config endpoint.
 *
 * @returns Configuration object including module settings
 */
export async function getConfig(): Promise<Record<string, unknown>> {
  return getDefaultClient().getConfig();
}

/**
 * Get ping-pong service version via /hit/version endpoint.
 *
 * @returns Version object with module name and version
 */
export async function version(): Promise<Record<string, unknown>> {
  return getDefaultClient().version();
}

// Lazy proxy that creates the client on first property access
// This ensures env vars are available when the client is actually used
const lazyPingPong = {
  getCounter: (counterId: string) => getDefaultClient().getCounter(counterId),
  increment: (counterId: string) => getDefaultClient().increment(counterId),
  reset: (counterId: string) => getDefaultClient().reset(counterId),
  getConfig: () => getDefaultClient().getConfig(),
  version: () => getDefaultClient().version(),
};

// Export lazy singleton - client is created on first method call, not at import time
export const pingPong = lazyPingPong;

