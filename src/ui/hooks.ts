/**
 * Hit UI Hooks
 *
 * React hooks for fetching and managing Hit UI specs.
 */

import { useState, useEffect, useCallback } from 'react';
import type { UISpec } from './types';
import { uiFetch } from './http';

// Navigation item type (matches the feature pack types)
interface NavItem {
  id: string;
  label: string;
  path: string;
  slots: string[];
  permissions?: string[];
  order: number;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
}

interface UseHitUISpecOptions {
  /** API base URL */
  apiBase: string;
  /** Initial spec (skip fetching) */
  initialSpec?: UISpec;
  /** Refetch interval in ms (0 = no refetch) */
  refetchInterval?: number;
}

interface UseHitUISpecResult {
  /** The UI specification */
  spec: UISpec | null;
  /** Loading state */
  loading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Refetch the spec */
  refetch: () => Promise<void>;
}

/**
 * Fetch a UI spec from a component API.
 */
export function useHitUISpec(
  endpoint: string,
  options: UseHitUISpecOptions
): UseHitUISpecResult {
  const { apiBase, initialSpec, refetchInterval = 0 } = options;

  const [spec, setSpec] = useState<UISpec | null>(initialSpec || null);
  const [loading, setLoading] = useState(!initialSpec);
  const [error, setError] = useState<Error | null>(null);

  const fetchSpec = useCallback(async () => {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${apiBase}${endpoint}`;

    try {
      setLoading(true);
      setError(null);

      const response = await uiFetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || response.statusText);
      }

      const data = await response.json();
      setSpec(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [endpoint, apiBase]);

  useEffect(() => {
    if (!initialSpec) {
      fetchSpec();
    }
  }, [fetchSpec, initialSpec]);

  useEffect(() => {
    if (refetchInterval > 0) {
      const interval = setInterval(fetchSpec, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, fetchSpec]);

  return { spec, loading, error, refetch: fetchSpec };
}

/**
 * Fetch data from an API endpoint.
 */
export function useHitData<T = unknown>(
  endpoint: string,
  options: { apiBase: string; skip?: boolean }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { apiBase, skip = false } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (skip) return;

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${apiBase}${endpoint}`;

    try {
      setLoading(true);
      setError(null);

      const response = await uiFetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [endpoint, apiBase, skip]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Submit data to an API endpoint.
 */
export function useHitMutation<T = unknown, R = unknown>(
  endpoint: string,
  options: { apiBase: string; method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' }
): {
  mutate: (data?: T) => Promise<R>;
  loading: boolean;
  error: Error | null;
} {
  const { apiBase, method = 'POST' } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (data?: T): Promise<R> => {
      const url = endpoint.startsWith('http')
        ? endpoint
        : `${apiBase}${endpoint}`;

      try {
        setLoading(true);
        setError(null);

        const response = await uiFetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || response.statusText);
        }

        return await response.json();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, apiBase, method]
  );

  return { mutate, loading, error };
}

/**
 * Fetch navigation from the ui-render module.
 */
export function useNavigation(options: {
  apiBase: string;
  slot?: string;
  refetchInterval?: number;
}): {
  items: NavItem[];
  slots: Record<string, NavItem[]>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { apiBase, slot, refetchInterval = 0 } = options;

  const [slots, setSlots] = useState<Record<string, NavItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNav = useCallback(async () => {
    const url = slot
      ? `${apiBase}/ui/nav?slot=${encodeURIComponent(slot)}`
      : `${apiBase}/ui/nav`;

    try {
      setLoading(true);
      setError(null);

      const response = await uiFetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();

      if (slot && data.items) {
        // Single slot response
        setSlots({ [slot]: data.items });
      } else if (data.slots) {
        // All slots response
        setSlots(data.slots);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [apiBase, slot]);

  useEffect(() => {
    fetchNav();
  }, [fetchNav]);

  useEffect(() => {
    if (refetchInterval > 0) {
      const interval = setInterval(fetchNav, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, fetchNav]);

  // Get items for the requested slot (or empty array)
  const items = slot ? (slots[slot] || []) : [];

  return { items, slots, loading, error, refetch: fetchNav };
}

/**
 * Hook for feature pack operations.
 */
export function useFeaturePack(options: {
  apiBase: string;
  pack: string;
}): {
  /** Load a page spec from the feature pack */
  loadPage: (page: string, params?: Record<string, string>) => Promise<UISpec>;
  /** Get the base URL for the pack */
  packUrl: string;
  loading: boolean;
  error: Error | null;
} {
  const { apiBase, pack } = options;
  const packUrl = `${apiBase}/ui/${pack}`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(
    async (page: string, params?: Record<string, string>): Promise<UISpec> => {
      const queryString = params
        ? `?${new URLSearchParams(params).toString()}`
        : '';
      const url = `${packUrl}/${page}${queryString}`;

      try {
        setLoading(true);
        setError(null);

        const response = await uiFetch(url, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || response.statusText);
        }

        return await response.json();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [packUrl]
  );

  return { loadPage, packUrl, loading, error };
}

