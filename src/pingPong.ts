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
 *
 * // Subscribe to real-time counter updates (Easy Button!)
 * const unsubscribe = await pingPong.subscribeCounter('test', (value) => {
 *   console.log('Counter updated:', value);
 * });
 * ```
 */

import { HitClient, HitClientOptions } from './client.js';
import { getApiKey, getNamespace, getServiceUrl, getWebSocketUrl } from './config.js';
import { HitEvents, EventMessage, EventSubscription } from './events.js';

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

  /**
   * Subscribe to real-time counter updates (Easy Button!).
   * 
   * This method:
   * 1. Gets the current counter value
   * 2. Sets up a WebSocket subscription for counter.* events
   * 3. Calls your callback whenever the counter changes
   * 
   * The event channel is automatically discovered from the ping-pong module's
   * /hit/config endpoint (settings.events.channel or database.namespace).
   *
   * @param counterId - Counter identifier
   * @param onUpdate - Callback called with new value whenever counter changes
   * @returns Promise resolving to unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = await pingPong.subscribeCounter('my-counter', (value) => {
   *   setCount(value);
   * });
   * 
   * // Later: stop listening
   * unsubscribe();
   * ```
   */
  async subscribeCounter(
    counterId: string,
    onUpdate: (value: number) => void
  ): Promise<() => void> {
    // 1. Get current value first
    const initialValue = await this.getCounter(counterId);
    onUpdate(initialValue);

    // 2. Get event channel from module config (hit.yaml settings)
    let eventChannel: string;
    try {
      const config = await this.getConfig() as { 
        settings?: { 
          events?: { channel?: string };
          database?: { namespace?: string };
        };
      };
      // Use settings.events.channel, fallback to database.namespace
      eventChannel = config.settings?.events?.channel 
        || config.settings?.database?.namespace 
        || 'shared-db';
    } catch {
      // If config fails, use default
      eventChannel = 'shared-db';
    }

    // 3. Set up WebSocket subscription for counter events
    const eventsUrl = getServiceUrl('events') || 'http://localhost:8098';
    const wsUrl = getWebSocketUrl('events') || eventsUrl.replace(/^http/, 'ws');
    
    const eventsClient = new HitEvents({
      baseUrl: eventsUrl,
      projectSlug: eventChannel,
    });

    const subscription = eventsClient.subscribe<{ counter_id?: string; value?: number }>(
      'counter.*',
      (event: EventMessage & { payload: { counter_id?: string; value?: number } }) => {
        if (event.payload.counter_id === counterId && event.payload.value !== undefined) {
          onUpdate(event.payload.value);
        }
      }
    );

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
      eventsClient.close();
    };
  }
}

// Create a fresh client for each call to ensure env vars are always current
// This avoids issues with Next.js bundling where different routes may have
// different module instances that were initialized at different times
function getClient(): PingPongClient {
  return new PingPongClient();
}

// Module-level convenience functions
/**
 * Get current counter value.
 *
 * @param counterId - Counter identifier
 * @returns Current counter value
 */
export async function getCounter(counterId: string): Promise<number> {
  return getClient().getCounter(counterId);
}

/**
 * Increment counter and return new value.
 *
 * @param counterId - Counter identifier
 * @returns New counter value
 */
export async function increment(counterId: string): Promise<number> {
  return getClient().increment(counterId);
}

/**
 * Reset counter to 0.
 *
 * @param counterId - Counter identifier
 * @returns Reset counter value (always 0)
 */
export async function reset(counterId: string): Promise<number> {
  return getClient().reset(counterId);
}

/**
 * Get ping-pong service configuration via /hit/config endpoint.
 *
 * @returns Configuration object including module settings
 */
export async function getConfig(): Promise<Record<string, unknown>> {
  return getClient().getConfig();
}

/**
 * Get ping-pong service version via /hit/version endpoint.
 *
 * @returns Version object with module name and version
 */
export async function version(): Promise<Record<string, unknown>> {
  return getClient().version();
}

/**
 * Subscribe to real-time counter updates (Easy Button!).
 * 
 * @param counterId - Counter identifier
 * @param onUpdate - Callback called with new value whenever counter changes
 * @returns Promise resolving to unsubscribe function
 */
export async function subscribeCounter(
  counterId: string,
  onUpdate: (value: number) => void
): Promise<() => void> {
  return getClient().subscribeCounter(counterId, onUpdate);
}

// Fresh client proxy - creates a new client for each call
// This ensures env vars are always current and avoids Next.js bundling issues
const pingPongProxy = {
  getCounter: (counterId: string) => getClient().getCounter(counterId),
  increment: (counterId: string) => getClient().increment(counterId),
  reset: (counterId: string) => getClient().reset(counterId),
  getConfig: () => getClient().getConfig(),
  version: () => getClient().version(),
  subscribeCounter: (counterId: string, onUpdate: (value: number) => void) =>
    getClient().subscribeCounter(counterId, onUpdate),
};

// Export proxy - fresh client created for each method call
export const pingPong = pingPongProxy;

