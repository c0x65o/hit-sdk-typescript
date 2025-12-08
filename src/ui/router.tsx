/**
 * HitDynamicRouter
 *
 * Dynamic router that fetches routes from ui-render and routes to feature pack pages.
 * Use this instead of static route mappings in your app.
 *
 * @example
 * ```tsx
 * // app/[[...path]]/page.tsx
 * import { HitDynamicRouter } from '@hit/sdk/ui';
 * import HomePage from '@/components/HomePage';
 *
 * export default function CatchAllPage() {
 *   return (
 *     <HitDynamicRouter
 *       fallback={<HomePage />}
 *       notFound={<NotFoundPage />}
 *     />
 *   );
 * }
 * ```
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HitFeaturePackPage } from './renderer';
import { fetchRoutes, findMatchingRoute, clearRoutesCache, Route, MatchedRoute } from './route-matcher';
import type { CustomWidgetRegistry } from './types';

/**
 * Props for HitDynamicRouter
 */
export interface HitDynamicRouterProps {
  /** Base URL for the UI API (default: '/api/ui') */
  apiBase?: string;
  /** Component to render for the root path ('/') */
  fallback?: React.ReactNode;
  /** Component to render when no route matches (404) */
  notFound?: React.ReactNode;
  /** Component to render while loading routes */
  loadingFallback?: React.ReactNode;
  /** Component to render when routes fail to load */
  errorFallback?: React.ReactNode;
  /** Custom widgets to pass to HitFeaturePackPage */
  customWidgets?: CustomWidgetRegistry;
  /** Navigate handler */
  onNavigate?: (path: string, newTab?: boolean) => void;
  /** Custom action handler */
  onCustomAction?: (name: string, payload?: Record<string, unknown>) => void;
}

/**
 * Hook to get the current pathname
 * Works with Next.js App Router
 */
function usePathname(): string {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    // Update pathname on navigation
    const handleNavigation = () => {
      setPathname(window.location.pathname);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleNavigation);

    // Set initial pathname
    setPathname(window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  return pathname;
}

/**
 * Dynamic router component that fetches routes and renders feature pack pages
 */
export function HitDynamicRouter({
  apiBase = '/api/ui',
  fallback,
  notFound,
  loadingFallback,
  errorFallback,
  customWidgets = {},
  onNavigate,
  onCustomAction,
}: HitDynamicRouterProps): React.ReactElement {
  const pathname = usePathname();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch routes on mount
  useEffect(() => {
    let mounted = true;

    async function loadRoutes() {
      try {
        const fetchedRoutes = await fetchRoutes(apiBase);
        if (mounted) {
          setRoutes(fetchedRoutes);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch routes'));
          setLoading(false);
        }
      }
    }

    loadRoutes();

    return () => {
      mounted = false;
    };
  }, [apiBase]);

  // Handle loading state
  if (loading) {
    return (
      <>
        {loadingFallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
          </div>
        )}
      </>
    );
  }

  // Handle error state
  if (error) {
    return (
      <>
        {errorFallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center text-red-600 dark:text-red-400">
              <p>Failed to load routes</p>
              <p className="text-sm text-gray-500 mt-2">{error.message}</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Handle root path - render fallback (home page)
  if (pathname === '/') {
    return <>{fallback || null}</>;
  }

  // Find matching route
  const match = findMatchingRoute(pathname, routes);

  // No match - render 404
  if (!match) {
    return (
      <>
        {notFound || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                404
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Page not found</p>
              <a
                href="/"
                className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block"
              >
                Go home
              </a>
            </div>
          </div>
        )}
      </>
    );
  }

  // Render the matched feature pack page
  return (
    <HitFeaturePackPage
      pack={match.pack}
      page={match.page}
      params={match.params}
      apiBase={apiBase}
      customWidgets={customWidgets}
      onNavigate={onNavigate}
      onCustomAction={onCustomAction}
      loadingFallback={loadingFallback}
      errorFallback={errorFallback}
    />
  );
}

/**
 * Force refresh routes from the server
 * Call this after adding/removing feature packs
 */
export function refreshRoutes(): void {
  clearRoutesCache();
}

export type { Route, MatchedRoute };
