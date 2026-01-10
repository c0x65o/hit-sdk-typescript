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
import { HitClient } from './client.js';
import { getApiKey, getNamespace, getServiceUrl, getWebSocketUrl } from './config.js';
import { HitEvents } from './events.js';
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
     * In deployed environments, uses HIT_EVENTS_WS_URL which should be
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
    async subscribeCounter(counterId, onUpdate, options) {
        // 1. Get current value first
        const initialValue = await this.getCounter(counterId);
        onUpdate(initialValue);
        // 2. Get event channel from module config (hit.yaml settings)
        // Priority: options.projectSlug > config.settings.events.channel > config.settings.database.namespace
        let eventChannel;
        if (options?.projectSlug) {
            eventChannel = options.projectSlug;
        }
        else {
            try {
                const config = await this.getConfig();
                // Use settings.events.channel, fallback to database.namespace
                eventChannel = config.settings?.events?.channel
                    || config.settings?.database?.namespace
                    || getProjectSlug();
            }
            catch {
                // If config fails, use project slug from environment
                eventChannel = getProjectSlug();
            }
        }
        // 3. Get WebSocket URL
        // Priority: options.wsUrl > HIT_EVENTS_WS_URL > HIT_EVENTS_URL (transformed to ws)
        // For deployed environments, HIT_EVENTS_WS_URL should be the project-specific
        // WSS endpoint like: wss://events.hit-hello-world-ts.dev.hit-cac.hcents.com
        const wsUrl = options?.wsUrl || getWebSocketUrl('events');
        const httpUrl = getServiceUrl('events');
        console.log('[PingPong] Setting up counter subscription:', {
            counterId,
            eventChannel,
            wsUrl,
            initialValue,
        });
        const eventsClient = new HitEvents({
            baseUrl: httpUrl,
            projectSlug: eventChannel,
            // HitEvents will use wsUrl internally when connecting
        });
        const subscription = eventsClient.subscribe('counter.*', (event) => {
            if (event.payload.counter_id === counterId && event.payload.value !== undefined) {
                console.log('[PingPong] Counter event received:', event.payload);
                onUpdate(event.payload.value);
            }
        });
        // Return unsubscribe function
        return () => {
            console.log('[PingPong] Unsubscribing from counter:', counterId);
            subscription.unsubscribe();
            eventsClient.close();
        };
    }
}
/**
 * Get project slug from environment.
 * This is the project identifier used for event channel isolation.
 */
function getProjectSlug() {
    // Check various env var patterns
    if (typeof process !== 'undefined' && process.env) {
        return (process.env.NEXT_PUBLIC_HIT_PROJECT_SLUG ||
            process.env.HIT_PROJECT_SLUG ||
            process.env.NEXT_PUBLIC_HIT_EVENTS_PROJECT ||
            process.env.HIT_EVENTS_PROJECT ||
            'default');
    }
    return 'default';
}
// Create a fresh client for each call to ensure env vars are always current
// This avoids issues with Next.js bundling where different routes may have
// different module instances that were initialized at different times
function getClient() {
    return new PingPongClient();
}
// Module-level convenience functions
/**
 * Get current counter value.
 *
 * @param counterId - Counter identifier
 * @returns Current counter value
 */
export async function getCounter(counterId) {
    return getClient().getCounter(counterId);
}
/**
 * Increment counter and return new value.
 *
 * @param counterId - Counter identifier
 * @returns New counter value
 */
export async function increment(counterId) {
    return getClient().increment(counterId);
}
/**
 * Reset counter to 0.
 *
 * @param counterId - Counter identifier
 * @returns Reset counter value (always 0)
 */
export async function reset(counterId) {
    return getClient().reset(counterId);
}
/**
 * Get ping-pong service configuration via /hit/config endpoint.
 *
 * @returns Configuration object including module settings
 */
export async function getConfig() {
    return getClient().getConfig();
}
/**
 * Get ping-pong service version via /hit/version endpoint.
 *
 * @returns Version object with module name and version
 */
export async function version() {
    return getClient().version();
}
/**
 * Subscribe to real-time counter updates (Easy Button!).
 *
 * @param counterId - Counter identifier
 * @param onUpdate - Callback called with new value whenever counter changes
 * @param options - Optional configuration overrides
 * @returns Promise resolving to unsubscribe function
 */
export async function subscribeCounter(counterId, onUpdate, options) {
    return getClient().subscribeCounter(counterId, onUpdate, options);
}
// Fresh client proxy - creates a new client for each call
// This ensures env vars are always current and avoids Next.js bundling issues
const pingPongProxy = {
    getCounter: (counterId) => getClient().getCounter(counterId),
    increment: (counterId) => getClient().increment(counterId),
    reset: (counterId) => getClient().reset(counterId),
    getConfig: () => getClient().getConfig(),
    version: () => getClient().version(),
    subscribeCounter: (counterId, onUpdate, options) => getClient().subscribeCounter(counterId, onUpdate, options),
};
// Export proxy - fresh client created for each method call
export const pingPong = pingPongProxy;
