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

import { getServiceUrl } from './config.js';

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
export type EventHandler<T = Record<string, unknown>> = (event: EventMessage & { payload: T }) => void;

/**
 * Options for HitEvents client.
 */
export interface HitEventsOptions {
  /** Base URL for events gateway (default: auto-discovered) */
  baseUrl?: string;
  /** Reconnection delay in ms (default: 3000) */
  reconnectDelayMs?: number;
  /** Maximum reconnection attempts (default: Infinity) */
  maxReconnectAttempts?: number;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Connection status handler */
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  /** Use SSE instead of WebSocket (default: false) */
  useSSE?: boolean;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * HIT Events client for real-time event subscriptions.
 *
 * Provides WebSocket-based event subscriptions with automatic reconnection.
 */
export class HitEvents {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private subscriptions: Map<string, Set<EventHandler>> = new Map();
  private pendingPatterns: Set<string> = new Set();
  private baseUrl: string;
  private reconnectDelay: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private onError?: (error: Error) => void;
  private onStatusChange?: (status: ConnectionStatus) => void;
  private useSSE: boolean;
  private status: ConnectionStatus = 'disconnected';
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: HitEventsOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.reconnectDelay = options.reconnectDelayMs || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity;
    this.onError = options.onError;
    this.onStatusChange = options.onStatusChange;
    this.useSSE = options.useSSE || false;
  }

  private getBaseUrl(): string {
    if (this.baseUrl) {
      return this.baseUrl;
    }
    // Auto-discover from environment
    return getServiceUrl('events');
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.onStatusChange?.(status);
    }
  }

  private getAllPatterns(): string[] {
    const patterns = new Set<string>();
    for (const pattern of this.subscriptions.keys()) {
      patterns.add(pattern);
    }
    for (const pattern of this.pendingPatterns) {
      patterns.add(pattern);
    }
    return Array.from(patterns);
  }

  private connect(): void {
    if (this.status === 'connecting' || this.status === 'connected') {
      return;
    }

    this.setStatus('connecting');

    if (this.useSSE) {
      this.connectSSE();
    } else {
      this.connectWebSocket();
    }
  }

  private connectWebSocket(): void {
    const baseUrl = this.getBaseUrl();
    const patterns = this.getAllPatterns();
    const channelsParam = patterns.length > 0 ? patterns.join(',') : '*';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + `/ws/subscribe?channels=${encodeURIComponent(channelsParam)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;

        // Start ping interval
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send('ping');
          }
        }, 25000);
      };

      this.ws.onmessage = (event) => {
        if (event.data === 'pong' || event.data === 'ping') {
          return;
        }

        try {
          const data = JSON.parse(event.data) as EventMessage | { type: string; pattern: string };

          // Handle subscription confirmations
          if ('type' in data && (data.type === 'subscribed' || data.type === 'unsubscribed')) {
            return;
          }

          // Dispatch to handlers
          this.dispatchEvent(data as EventMessage);
        } catch (e) {
          // Ignore parse errors for non-JSON messages
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.cleanup();
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.setStatus('error');
        this.onError?.(new Error('WebSocket connection error'));
      };
    } catch (error) {
      this.setStatus('error');
      this.onError?.(error instanceof Error ? error : new Error(String(error)));
      this.scheduleReconnect();
    }
  }

  private connectSSE(): void {
    const baseUrl = this.getBaseUrl();
    const patterns = this.getAllPatterns();
    const channelsParam = patterns.length > 0 ? patterns.join(',') : '*';
    const sseUrl = `${baseUrl}/sse/subscribe?channels=${encodeURIComponent(channelsParam)}`;

    try {
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as EventMessage;
          this.dispatchEvent(data);
        } catch (e) {
          // Ignore parse errors
        }
      };

      this.eventSource.onerror = () => {
        this.setStatus('error');
        this.onError?.(new Error('SSE connection error'));
        this.eventSource?.close();
        this.eventSource = null;
        this.scheduleReconnect();
      };
    } catch (error) {
      this.setStatus('error');
      this.onError?.(error instanceof Error ? error : new Error(String(error)));
      this.scheduleReconnect();
    }
  }

  private dispatchEvent(event: EventMessage): void {
    // Extract event type from channel (hit:events:counter.updated -> counter.updated)
    const eventType = event.event_type || event.channel.split(':').pop() || '';

    for (const [pattern, handlers] of this.subscriptions) {
      if (this.matchesPattern(eventType, pattern)) {
        for (const handler of handlers) {
          try {
            handler(event);
          } catch (e) {
            console.error('Event handler error:', e);
          }
        }
      }
    }
  }

  private matchesPattern(eventType: string, pattern: string): boolean {
    // Wildcard matches all
    if (pattern === '*') {
      return true;
    }

    // Exact match
    if (pattern === eventType) {
      return true;
    }

    // Glob pattern (e.g., "counter.*" matches "counter.updated")
    if (pattern.endsWith('.*')) {
      const base = pattern.slice(0, -2);
      return eventType.startsWith(`${base}.`);
    }

    // Prefix match (e.g., "counter" matches "counter.updated")
    if (eventType.startsWith(`${pattern}.`)) {
      return true;
    }

    return false;
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('error');
      this.onError?.(new Error('Max reconnection attempts reached'));
      return;
    }

    if (this.subscriptions.size === 0 && this.pendingPatterns.size === 0) {
      // No active subscriptions, don't reconnect
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 30000);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

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
  subscribe<T = Record<string, unknown>>(
    pattern: string,
    handler: EventHandler<T>
  ): EventSubscription {
    // Add to subscriptions
    if (!this.subscriptions.has(pattern)) {
      this.subscriptions.set(pattern, new Set());

      // If already connected, dynamically subscribe
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(`subscribe:${pattern}`);
      } else {
        this.pendingPatterns.add(pattern);
      }
    }

    this.subscriptions.get(pattern)!.add(handler as EventHandler);

    // Start connection if not connected
    if (this.status === 'disconnected') {
      this.connect();
    }

    return {
      pattern,
      unsubscribe: () => {
        this.unsubscribeHandler(pattern, handler as EventHandler);
      },
    };
  }

  private unsubscribeHandler(pattern: string, handler: EventHandler): void {
    const handlers = this.subscriptions.get(pattern);
    if (handlers) {
      handlers.delete(handler);

      // If no more handlers for this pattern, unsubscribe from gateway
      if (handlers.size === 0) {
        this.subscriptions.delete(pattern);
        this.pendingPatterns.delete(pattern);

        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(`unsubscribe:${pattern}`);
        }
      }
    }

    // Close connection if no more subscriptions
    if (this.subscriptions.size === 0) {
      this.close();
    }
  }

  /**
   * Get current connection status.
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get active subscription patterns.
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Force reconnection.
   */
  reconnect(): void {
    this.close();
    this.reconnectAttempts = 0;
    if (this.subscriptions.size > 0) {
      this.connect();
    }
  }

  /**
   * Close connection and clean up.
   */
  close(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.cleanup();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.setStatus('disconnected');
  }
}

// Default global instance
let _globalEvents: HitEvents | null = null;

/**
 * Get or create the global events client instance.
 */
export function getEventsClient(): HitEvents {
  if (!_globalEvents) {
    _globalEvents = new HitEvents();
  }
  return _globalEvents;
}

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
export const events = {
  /**
   * Subscribe to events matching a pattern.
   */
  subscribe: <T = Record<string, unknown>>(
    pattern: string,
    handler: EventHandler<T>
  ): EventSubscription => {
    return getEventsClient().subscribe(pattern, handler);
  },

  /**
   * Get connection status.
   */
  getStatus: (): ConnectionStatus => {
    return getEventsClient().getStatus();
  },

  /**
   * Get active subscription patterns.
   */
  getSubscriptions: (): string[] => {
    return getEventsClient().getSubscriptions();
  },

  /**
   * Force reconnection.
   */
  reconnect: (): void => {
    getEventsClient().reconnect();
  },

  /**
   * Close connection.
   */
  close: (): void => {
    getEventsClient().close();
  },
};

