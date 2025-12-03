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
export declare const pingPong: {
    getCounter: (counterId: string) => Promise<number>;
    increment: (counterId: string) => Promise<number>;
    reset: (counterId: string) => Promise<number>;
    getConfig: () => Promise<Record<string, unknown>>;
    version: () => Promise<Record<string, unknown>>;
};
//# sourceMappingURL=pingPong.d.ts.map