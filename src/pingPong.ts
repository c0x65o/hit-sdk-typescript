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
}

// Default client instance
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

// Export singleton instance
export const pingPong = getDefaultClient();

