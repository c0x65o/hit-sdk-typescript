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
 * Convert a route path pattern to a regex and extract param names
 * @param pattern Route pattern like '/notepad/:id'
 * @returns Object with regex and parameter names
 */
function patternToRegex(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];

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
export function matchRoute(pathname: string, route: Route): MatchedRoute | null {
  const { regex, paramNames } = patternToRegex(route.path);
  const match = pathname.match(regex);

  if (!match) {
    return null;
  }

  // Extract params from capture groups
  const params: Record<string, string> = {};
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
export function findMatchingRoute(
  pathname: string,
  routes: Route[]
): MatchedRoute | null {
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

/**
 * Routes response from /api/ui/routes
 */
export interface RoutesResponse {
  routes: Route[];
  generated_at: string;
}

// Cache for routes
let routesCache: Route[] | null = null;
let routesCacheExpiry: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch routes from the ui-render module
 * Results are cached for 5 minutes
 * @param apiBase Base URL for the UI API (e.g., '/api/ui')
 * @returns Array of routes
 */
export async function fetchRoutes(apiBase: string): Promise<Route[]> {
  const now = Date.now();

  // Return cached routes if still valid
  if (routesCache && now < routesCacheExpiry) {
    return routesCache;
  }

  try {
    const response = await fetch(`${apiBase}/routes`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch routes: ${response.statusText}`);
    }

    const data: RoutesResponse = await response.json();
    routesCache = data.routes;
    routesCacheExpiry = now + CACHE_DURATION_MS;

    return data.routes;
  } catch (error) {
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
export function clearRoutesCache(): void {
  routesCache = null;
  routesCacheExpiry = 0;
}
