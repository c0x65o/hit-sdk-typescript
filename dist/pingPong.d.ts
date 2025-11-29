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
export declare const pingPong: PingPongClient;
//# sourceMappingURL=pingPong.d.ts.map