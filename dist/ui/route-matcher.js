/**
 * Route Matcher Utility
 *
 * Matches URL paths against route patterns with dynamic segments.
 * Supports patterns like '/notepad/:id' matching '/notepad/abc123'.
 */
/**
 * Convert a route path pattern to a regex and extract param names
 * @param pattern Route pattern like '/notepad/:id'
 * @returns Object with regex and parameter names
 */
function patternToRegex(pattern) {
    const paramNames = [];
    // Escape special regex characters except : for params
    let regexStr = pattern
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        // Replace :paramName with a capture group
        .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
    });
    // Ensure exact match
    const regex = new RegExp(`^${regexStr}$`);
    return { regex, paramNames };
}
/**
 * Match a pathname against a route pattern
 * @param pathname Current URL pathname (e.g., '/notepad/abc123')
 * @param route Route to match against
 * @returns Matched route with params, or null if no match
 */
export function matchRoute(pathname, route) {
    const { regex, paramNames } = patternToRegex(route.path);
    const match = pathname.match(regex);
    if (!match) {
        return null;
    }
    // Extract params from capture groups
    const params = {};
    paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1]);
    });
    return {
        pack: route.pack,
        page: route.page,
        params,
    };
}
/**
 * Find the first matching route for a pathname
 * Routes are assumed to be pre-sorted by priority
 * @param pathname Current URL pathname
 * @param routes Array of routes to match against
 * @returns Matched route with params, or null if no match
 */
export function findMatchingRoute(pathname, routes) {
    // Normalize pathname (remove trailing slash except for root)
    const normalizedPath = pathname === '/' ? pathname : pathname.replace(/\/$/, '');
    for (const route of routes) {
        const match = matchRoute(normalizedPath, route);
        if (match) {
            return match;
        }
    }
    return null;
}
// Cache for routes
let routesCache = null;
let routesCacheExpiry = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
/**
 * Fetch routes from the ui-render module
 * Results are cached for 5 minutes
 * @param apiBase Base URL for the UI API (e.g., '/api/ui')
 * @returns Array of routes
 */
export async function fetchRoutes(apiBase) {
    const now = Date.now();
    // Return cached routes if still valid
    if (routesCache && now < routesCacheExpiry) {
        return routesCache;
    }
    try {
        const { uiFetch } = await import('./http');
        const response = await uiFetch(`${apiBase}/routes`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch routes: ${response.statusText}`);
        }
        const data = await response.json();
        routesCache = data.routes;
        routesCacheExpiry = now + CACHE_DURATION_MS;
        return data.routes;
    }
    catch (error) {
        console.error('Error fetching routes:', error);
        // Return cached routes if available, even if expired
        if (routesCache) {
            return routesCache;
        }
        throw error;
    }
}
/**
 * Clear the routes cache
 * Useful when feature packs change
 */
export function clearRoutesCache() {
    routesCache = null;
    routesCacheExpiry = 0;
}
