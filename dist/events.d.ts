/**
 * Real-time event subscriptions for HIT platform.
 *
 * Connects to the HIT Events Gateway via WebSocket or SSE.
 *
 * Example:
 * ```typescript
 * import { events } from '@hit/sdk';
 *
 * // Subscribe to counter events
 * const subscription = events.subscribe('counter.*', (event) => {
 *   console.log('Counter updated:', event.payload);
 * });
 *
 * // Later: unsubscribe
 * subscription.unsubscribe();
 * ```
 */
/**
 * Event message from the events gateway.
 */
export interface EventMessage {
    channel: string;
    event_type: string;
    payload: Record<string, unknown>;
    timestamp: string;
    source_module?: string;
    correlation_id?: string;
}
/**
 * Subscription handle returned by subscribe().
 */
export interface EventSubscription {
    /** The pattern this subscription is for */
    pattern: string;
    /** Unsubscribe from events */
    unsubscribe: () => void;
}
/**
 * Event handler function type.
 */
export type EventHandler<T = Record<string, unknown>> = (event: EventMessage & {
    payload: T;
}) => void;
/**
 * Options for HitEvents client.
 */
export interface HitEventsOptions {
    /** Base URL for events gateway (default: auto-discovered) */
    baseUrl?: string;
    /** Project slug for event channel isolation */
    projectSlug?: string;
    /** Reconnection delay in ms (default: 3000) */
    reconnectDelayMs?: number;
    /** Maximum reconnection attempts (default: Infinity) */
    maxReconnectAttempts?: number;
    /** Error handler */
    onError?: (error: Error) => void;
    /** Connection status handler */
    onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
    /** Use SSE instead of WebSocket (default: false - use WebSocket) */
    useSSE?: boolean;
}
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
/**
 * HIT Events client for real-time event subscriptions.
 *
 * Provides WebSocket-based event subscriptions with automatic reconnection.
 */
export declare class HitEvents {
    private ws;
    private eventSource;
    private subscriptions;
    private pendingPatterns;
    private baseUrl;
    private projectSlug;
    private reconnectDelay;
    private maxReconnectAttempts;
    private reconnectAttempts;
    private onError?;
    private onStatusChange?;
    private useSSE;
    private status;
    private reconnectTimeout;
    private pingInterval;
    constructor(options?: HitEventsOptions);
    /**
     * Get project slug from environment or use default.
     */
    private getProjectSlug;
    private getBaseUrl;
    private setStatus;
    private getAllPatterns;
    private connect;
    private connectWebSocket;
    private connectSSE;
    private dispatchEvent;
    private matchesPattern;
    private cleanup;
    private scheduleReconnect;
    /**
     * Subscribe to events matching a pattern.
     *
     * @param pattern - Event pattern (e.g., "counter.*", "user.created", "*")
     * @param handler - Function called when matching events arrive
     * @returns Subscription handle with unsubscribe method
     *
     * @example
     * ```typescript
     * const sub = events.subscribe('counter.*', (event) => {
     *   console.log('Counter:', event.payload);
     * });
     *
     * // Later:
     * sub.unsubscribe();
     * ```
     */
    subscribe<T = Record<string, unknown>>(pattern: string, handler: EventHandler<T>): EventSubscription;
    private unsubscribeHandler;
    /**
     * Get current connection status.
     */
    getStatus(): ConnectionStatus;
    /**
     * Get active subscription patterns.
     */
    getSubscriptions(): string[];
    /**
     * Force reconnection.
     */
    reconnect(): void;
    /**
     * Close connection and clean up.
     */
    close(): void;
}
/**
 * Get or create the global events client instance.
 */
export declare function getEventsClient(): HitEvents;
/**
 * Global events client instance.
 *
 * @example
 * ```typescript
 * import { events } from '@hit/sdk';
 *
 * events.subscribe('counter.*', (event) => {
 *   console.log(event.payload);
 * });
 * ```
 */
export declare const events: {
    /**
     * Subscribe to events matching a pattern.
     */
    subscribe: <T = Record<string, unknown>>(pattern: string, handler: EventHandler<T>) => EventSubscription;
    /**
     * Get connection status.
     */
    getStatus: () => ConnectionStatus;
    /**
     * Get active subscription patterns.
     */
    getSubscriptions: () => string[];
    /**
     * Force reconnection.
     */
    reconnect: () => void;
    /**
     * Close connection.
     */
    close: () => void;
};
export {};
//# sourceMappingURL=events.d.ts.map