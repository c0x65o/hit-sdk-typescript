/**
 * Hit UI Hooks
 *
 * React hooks for fetching and managing Hit UI specs.
 */
import type { UISpec } from './types';
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
export declare function useHitUISpec(endpoint: string, options: UseHitUISpecOptions): UseHitUISpecResult;
/**
 * Fetch data from an API endpoint.
 */
export declare function useHitData<T = unknown>(endpoint: string, options: {
    apiBase: string;
    skip?: boolean;
}): {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
};
/**
 * Submit data to an API endpoint.
 */
export declare function useHitMutation<T = unknown, R = unknown>(endpoint: string, options: {
    apiBase: string;
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}): {
    mutate: (data?: T) => Promise<R>;
    loading: boolean;
    error: Error | null;
};
export {};
//# sourceMappingURL=hooks.d.ts.map