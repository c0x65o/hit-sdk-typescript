/**
 * Hit UI Hooks
 *
 * React hooks for fetching and managing Hit UI specs.
 */
import { useState, useEffect, useCallback } from 'react';
/**
 * Fetch a UI spec from a component API.
 */
export function useHitUISpec(endpoint, options) {
    const { apiBase, initialSpec, refetchInterval = 0 } = options;
    const [spec, setSpec] = useState(initialSpec || null);
    const [loading, setLoading] = useState(!initialSpec);
    const [error, setError] = useState(null);
    const fetchSpec = useCallback(async () => {
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${apiBase}${endpoint}`;
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || response.statusText);
            }
            const data = await response.json();
            setSpec(data);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
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
export function useHitData(endpoint, options) {
    const { apiBase, skip = false } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        if (skip)
            return;
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${apiBase}${endpoint}`;
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || response.statusText);
            }
            const result = await response.json();
            setData(result);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
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
export function useHitMutation(endpoint, options) {
    const { apiBase, method = 'POST' } = options;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const mutate = useCallback(async (data) => {
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${apiBase}${endpoint}`;
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: data ? JSON.stringify(data) : undefined,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || response.statusText);
            }
            return await response.json();
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    }, [endpoint, apiBase, method]);
    return { mutate, loading, error };
}
