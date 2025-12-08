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
import React from 'react';
import { Route, MatchedRoute } from './route-matcher';
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
 * Dynamic router component that fetches routes and renders feature pack pages
 */
export declare function HitDynamicRouter({ apiBase, fallback, notFound, loadingFallback, errorFallback, customWidgets, onNavigate, onCustomAction, }: HitDynamicRouterProps): React.ReactElement;
/**
 * Force refresh routes from the server
 * Call this after adding/removing feature packs
 */
export declare function refreshRoutes(): void;
export type { Route, MatchedRoute };
//# sourceMappingURL=router.d.ts.map