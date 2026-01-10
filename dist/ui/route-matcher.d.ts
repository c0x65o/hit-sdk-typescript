/**
 * Route Matcher Utility
 *
 * Matches URL paths against route patterns with dynamic segments.
 * Supports patterns like '/notepad/:id' matching '/notepad/abc123'.
 */
/**
 * Route definition from the routes API
 */
export interface Route {
    /** URL path pattern (e.g., '/notepad', '/notepad/:id') */
    path: string;
    /** Feature pack name */
    pack: string;
    /** Page generator name */
    page: string;
    /** Route priority (lower = higher priority) */
    priority: number;
}
/**
 * Matched route with extracted parameters
 */
export interface MatchedRoute {
    /** Feature pack name */
    pack: string;
    /** Page generator name */
    page: string;
    /** Extracted route parameters (e.g., { id: 'abc123' }) */
    params: Record<string, string>;
}
/**
 * Match a pathname against a route pattern
 * @param pathname Current URL pathname (e.g., '/notepad/abc123')
 * @param route Route to match against
 * @returns Matched route with params, or null if no match
 */
export declare function matchRoute(pathname: string, route: Route): MatchedRoute | null;
/**
 * Find the first matching route for a pathname
 * Routes are assumed to be pre-sorted by priority
 * @param pathname Current URL pathname
 * @param routes Array of routes to match against
 * @returns Matched route with params, or null if no match
 */
export declare function findMatchingRoute(pathname: string, routes: Route[]): MatchedRoute | null;
/**
 * Routes response from /api/ui/routes
 */
export interface RoutesResponse {
    routes: Route[];
    generated_at: string;
}
/**
 * Fetch routes from the ui-render module
 * Results are cached for 5 minutes
 * @param apiBase Base URL for the UI API (e.g., '/api/ui')
 * @returns Array of routes
 */
export declare function fetchRoutes(apiBase: string): Promise<Route[]>;
/**
 * Clear the routes cache
 * Useful when feature packs change
 */
export declare function clearRoutesCache(): void;
//# sourceMappingURL=route-matcher.d.ts.map