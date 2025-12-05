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
export class HitEvents {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private subscriptions: Map<string, Set<EventHandler>> = new Map();
  private pendingPatterns: Set<string> = new Set();
  private baseUrl: string;
  private projectSlug: string;
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
    this.projectSlug = options.projectSlug || this.getProjectSlug();
    this.reconnectDelay = options.reconnectDelayMs || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity;
    this.onError = options.onError;
    this.onStatusChange = options.onStatusChange;
    // Default to WebSocket for real-time, fall back to SSE if explicitly requested
    this.useSSE = options.useSSE ?? false;
  }

  /**
   * Get project slug from environment or use default.
   */
  private getProjectSlug(): string {
    // Check environment variables (browser-safe)
    if (typeof process !== 'undefined' && process.env) {
      return (
        process.env.NEXT_PUBLIC_HIT_EVENTS_PROJECT ||
        process.env.HIT_EVENTS_PROJECT ||
        process.env.NEXT_PUBLIC_HIT_PROJECT_SLUG ||
        process.env.HIT_PROJECT_SLUG ||
        'demo-shared'
      );
    }
    return 'demo-shared';
  }

  private getBaseUrl(): string {
    if (this.baseUrl) {
      return this.baseUrl;
    }
    // Auto-discover from environment
    const url = getServiceUrl('events');
    
    // If URL is relative (e.g., /api/events), it's going through a proxy
    // Keep it as-is for the frontend to resolve
    return url;
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
    
    // Build WebSocket URL
    // Local: ws://localhost:8098/ws?project=demo-shared&channels=chat.*
    // Deployed: wss://events.hello-world.domain.com/ws?channels=chat.*
    const wsBase = baseUrl.replace(/^http/, 'ws');
    const params = new URLSearchParams();
    params.set('channels', channelsParam);
    
    // Add project slug for local development (in prod, it's extracted from subdomain)
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      params.set('project', this.projectSlug);
    }
    
    const wsUrl = `${wsBase}/ws?${params.toString()}`;
    console.log('[HIT Events] Connecting to WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[HIT Events] WebSocket connected');
        this.setStatus('connected');
        this.reconnectAttempts = 0;

        // Send any pending patterns that were added after connect() was called
        // but before the WebSocket actually opened
        const allPatterns = this.getAllPatterns();
        if (allPatterns.length > 0) {
          console.log('[HIT Events] Sending patterns to server:', allPatterns);
          this.ws?.send(JSON.stringify({
            type: 'subscribe',
            patterns: allPatterns,
          }));
        }
        // Clear pending patterns - they're now sent
        this.pendingPatterns.clear();

        // Start ping interval to keep connection alive
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as EventMessage | { type: string; patterns?: string[] };

          // Handle connection and subscription confirmations
          if ('type' in data) {
            if (data.type === 'connected') {
              console.log('[HIT Events] Connection confirmed:', data);
              return;
            }
            if (data.type === 'subscribed' || data.type === 'unsubscribed') {
              console.log('[HIT Events] Subscription updated:', data);
              return;
            }
            if (data.type === 'pong') {
              return;
            }
          }

          // Dispatch event to handlers
          this.dispatchEvent(data as EventMessage);
        } catch (e) {
          // Ignore parse errors for non-JSON messages
        }
      };

      this.ws.onclose = (event) => {
        console.log('[HIT Events] WebSocket closed:', event.code, event.reason);
        this.setStatus('disconnected');
        this.cleanup();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[HIT Events] WebSocket error:', error);
        this.setStatus('error');
        this.onError?.(new Error('WebSocket connection error'));
      };
    } catch (error) {
      console.error('[HIT Events] Failed to create WebSocket:', error);
      this.setStatus('error');
      this.onError?.(error instanceof Error ? error : new Error(String(error)));
      this.scheduleReconnect();
    }
  }

  private connectSSE(): void {
    const baseUrl = this.getBaseUrl();
    const patterns = this.getAllPatterns();
    const channelsParam = patterns.length > 0 ? patterns.join(',') : '*';
    
    // Handle both direct events service URL and proxy URL patterns
    // Direct: http://events:8098/sse/subscribe
    // Proxy: /api/events/stream (Next.js route handler)
    let sseUrl: string;
    if (baseUrl.includes('/api/events')) {
      // Using proxy route - use /stream endpoint
      sseUrl = `${baseUrl}/stream?channels=${encodeURIComponent(channelsParam)}`;
    } else {
      // Direct connection to events service
      sseUrl = `${baseUrl}/sse/subscribe?channels=${encodeURIComponent(channelsParam)}`;
    }

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
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          patterns: this.getAllPatterns(),
        }));
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
          this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            patterns: [pattern],
          }));
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

