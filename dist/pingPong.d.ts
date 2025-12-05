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
import { HitClientOptions } from './client.js';
export interface CounterResponse {
    id: string;
    value: number;
}
/**
 * Client for ping-pong counter service.
 */
export declare class PingPongClient {
    private client;
    constructor(options?: HitClientOptions);
    /**
     * Get current counter value.
     *
     * @param counterId - Counter identifier
     * @returns Current counter value
     */
    getCounter(counterId: string): Promise<number>;
    /**
     * Increment counter and return new value.
     *
     * @param counterId - Counter identifier
     * @returns New counter value
     */
    increment(counterId: string): Promise<number>;
    /**
     * Reset counter to 0.
     *
     * @param counterId - Counter identifier
     * @returns Reset counter value (always 0)
     */
    reset(counterId: string): Promise<number>;
    /**
     * Get ping-pong service configuration via /hit/config endpoint.
     *
     * @returns Configuration object including module settings
     */
    getConfig(): Promise<Record<string, unknown>>;
    /**
     * Get ping-pong service version via /hit/version endpoint.
     *
     * @returns Version object with module name and version
     */
    version(): Promise<Record<string, unknown>>;
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
     * In deployed environments, uses HIT_EVENTS_WEBSOCKET_URL which should be
     * the project-specific WSS endpoint (e.g., wss://events.hit-hello-world-ts.dev.domain.com)
     *
     * @param counterId - Counter identifier
     * @param onUpdate - Callback called with new value whenever counter changes
     * @param options - Optional configuration overrides
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
    subscribeCounter(counterId: string, onUpdate: (value: number) => void, options?: {
        /** Override the WebSocket URL (defaults to HIT_EVENTS_WEBSOCKET_URL) */
        wsUrl?: string;
        /** Override the project slug (defaults to config discovery) */
        projectSlug?: string;
    }): Promise<() => void>;
}
/**
 * Get current counter value.
 *
 * @param counterId - Counter identifier
 * @returns Current counter value
 */
export declare function getCounter(counterId: string): Promise<number>;
/**
 * Increment counter and return new value.
 *
 * @param counterId - Counter identifier
 * @returns New counter value
 */
export declare function increment(counterId: string): Promise<number>;
/**
 * Reset counter to 0.
 *
 * @param counterId - Counter identifier
 * @returns Reset counter value (always 0)
 */
export declare function reset(counterId: string): Promise<number>;
/**
 * Get ping-pong service configuration via /hit/config endpoint.
 *
 * @returns Configuration object including module settings
 */
export declare function getConfig(): Promise<Record<string, unknown>>;
/**
 * Get ping-pong service version via /hit/version endpoint.
 *
 * @returns Version object with module name and version
 */
export declare function version(): Promise<Record<string, unknown>>;
/**
 * Subscribe to real-time counter updates (Easy Button!).
 *
 * @param counterId - Counter identifier
 * @param onUpdate - Callback called with new value whenever counter changes
 * @param options - Optional configuration overrides
 * @returns Promise resolving to unsubscribe function
 */
export declare function subscribeCounter(counterId: string, onUpdate: (value: number) => void, options?: {
    wsUrl?: string;
    projectSlug?: string;
}): Promise<() => void>;
export declare const pingPong: {
    getCounter: (counterId: string) => Promise<number>;
    increment: (counterId: string) => Promise<number>;
    reset: (counterId: string) => Promise<number>;
    getConfig: () => Promise<Record<string, unknown>>;
    version: () => Promise<Record<string, unknown>>;
    subscribeCounter: (counterId: string, onUpdate: (value: number) => void, options?: {
        wsUrl?: string;
        projectSlug?: string;
    }) => Promise<() => void>;
};
//# sourceMappingURL=pingPong.d.ts.map