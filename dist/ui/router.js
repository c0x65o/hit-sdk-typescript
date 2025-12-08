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
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { HitFeaturePackPage } from './renderer';
import { fetchRoutes, findMatchingRoute, clearRoutesCache } from './route-matcher';
/**
 * Hook to get the current pathname
 * Works with Next.js App Router
 */
function usePathname() {
    const [pathname, setPathname] = useState(() => {
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
export function HitDynamicRouter({ apiBase = '/api/ui', fallback, notFound, loadingFallback, errorFallback, customWidgets = {}, onNavigate, onCustomAction, }) {
    const pathname = usePathname();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
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
        return (_jsx(_Fragment, { children: loadingFallback || (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" }) })) }));
    }
    // Handle error state
    if (error) {
        return (_jsx(_Fragment, { children: errorFallback || (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center text-red-600 dark:text-red-400", children: [_jsx("p", { children: "Failed to load routes" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: error.message })] }) })) }));
    }
    // Handle root path - render fallback (home page)
    if (pathname === '/') {
        return _jsx(_Fragment, { children: fallback || null });
    }
    // Find matching route
    const match = findMatchingRoute(pathname, routes);
    // No match - render 404
    if (!match) {
        return (_jsx(_Fragment, { children: notFound || (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "404" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Page not found" }), _jsx("a", { href: "/", className: "text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block", children: "Go home" })] }) })) }));
    }
    // Render the matched feature pack page
    return (_jsx(HitFeaturePackPage, { pack: match.pack, page: match.page, params: match.params, apiBase: apiBase, customWidgets: customWidgets, onNavigate: onNavigate, onCustomAction: onCustomAction, loadingFallback: loadingFallback, errorFallback: errorFallback }));
}
/**
 * Force refresh routes from the server
 * Call this after adding/removing feature packs
 */
export function refreshRoutes() {
    clearRoutesCache();
}
