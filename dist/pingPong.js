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
import { HitClient } from './client.js';
import { getApiKey, getNamespace, getServiceUrl } from './config.js';
/**
 * Client for ping-pong counter service.
 */
export class PingPongClient {
    constructor(options = {}) {
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
    async getCounter(counterId) {
        const response = await this.client.get(`/counter/${counterId}`);
        return response.value;
    }
    /**
     * Increment counter and return new value.
     *
     * @param counterId - Counter identifier
     * @returns New counter value
     */
    async increment(counterId) {
        const response = await this.client.post(`/counter/${counterId}/increment`);
        return response.value;
    }
    /**
     * Reset counter to 0.
     *
     * @param counterId - Counter identifier
     * @returns Reset counter value (always 0)
     */
    async reset(counterId) {
        const response = await this.client.post(`/counter/${counterId}/reset`);
        return response.value;
    }
    /**
     * Get ping-pong service configuration via /hit/config endpoint.
     *
     * @returns Configuration object including module settings
     */
    async getConfig() {
        return this.client.get('/hit/config');
    }
    /**
     * Get ping-pong service version via /hit/version endpoint.
     *
     * @returns Version object with module name and version
     */
    async version() {
        return this.client.get('/hit/version');
    }
}
// Default client instance
let defaultClient = null;
function getDefaultClient() {
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
export async function getCounter(counterId) {
    return getDefaultClient().getCounter(counterId);
}
/**
 * Increment counter and return new value.
 *
 * @param counterId - Counter identifier
 * @returns New counter value
 */
export async function increment(counterId) {
    return getDefaultClient().increment(counterId);
}
/**
 * Reset counter to 0.
 *
 * @param counterId - Counter identifier
 * @returns Reset counter value (always 0)
 */
export async function reset(counterId) {
    return getDefaultClient().reset(counterId);
}
/**
 * Get ping-pong service configuration via /hit/config endpoint.
 *
 * @returns Configuration object including module settings
 */
export async function getConfig() {
    return getDefaultClient().getConfig();
}
/**
 * Get ping-pong service version via /hit/version endpoint.
 *
 * @returns Version object with module name and version
 */
export async function version() {
    return getDefaultClient().version();
}
// Export singleton instance
export const pingPong = getDefaultClient();
