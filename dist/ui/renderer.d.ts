/**
 * Hit UI Renderer
 *
 * The main renderer that interprets UI specs and renders React components.
 */
import React from 'react';
import type { UISpec, HitUIRendererProps, FeaturePackPageProps } from './types';
/**
 * Render a single UI spec.
 */
export declare function RenderSpec({ spec, registry, }: {
    spec: UISpec;
    registry: Record<string, React.ComponentType<any>>;
}): import("react/jsx-runtime").JSX.Element | null;
/**
 * Render children specs.
 */
export declare function RenderChildren({ children, registry, }: {
    children?: UISpec[];
    registry: Record<string, React.ComponentType<any>>;
}): import("react/jsx-runtime").JSX.Element | null;
/**
 * Main Hit UI Renderer component.
 *
 * Renders a UI specification tree into React components.
 *
 * @example
 * ```tsx
 * import { HitUIRenderer } from '@hit/sdk';
 *
 * function AdminPage() {
 *   const { spec } = useHitUISpec('/admin/ui/dashboard', { apiBase: '/api' });
 *
 *   if (!spec) return <Loading />;
 *
 *   return (
 *     <HitUIRenderer
 *       spec={spec}
 *       apiBase="/api"
 *       onNavigate={(path) => router.push(path)}
 *     />
 *   );
 * }
 * ```
 */
export declare function HitUIRenderer({ spec, apiBase, components, customWidgets, onNavigate, onCustomAction, errorFallback, loadingFallback, }: HitUIRendererProps): import("react/jsx-runtime").JSX.Element;
/**
 * Render UI from an endpoint.
 *
 * Fetches the UI spec from the endpoint and renders it.
 */
export declare function HitUIFromEndpoint({ endpoint, apiBase, components, customWidgets, onNavigate, onCustomAction, loadingFallback, errorFallback, }: Omit<HitUIRendererProps, 'spec'> & {
    endpoint: string;
}): import("react/jsx-runtime").JSX.Element | null;
/**
 * Feature Pack Page Component
 *
 * Renders a page from a feature pack via the ui-render module.
 *
 * @example
 * ```tsx
 * <HitFeaturePackPage pack="auth-core" page="users" />
 * ```
 */
export declare function HitFeaturePackPage({ pack, page, params, apiBase, customWidgets, onNavigate, onCustomAction, loadingFallback, errorFallback, }: FeaturePackPageProps & Omit<HitUIRendererProps, 'spec'>): import("react/jsx-runtime").JSX.Element;
/**
 * Feature Pack Router Component
 *
 * Routes paths to feature pack pages.
 * Use as a catch-all route in your app.
 *
 * @example
 * ```tsx
 * // app/[[...path]]/page.tsx
 * export default function CatchAll({ params }) {
 *   return <HitFeaturePackRouter path={params.path} />;
 * }
 * ```
 */
export declare function HitFeaturePackRouter({ path, apiBase, customWidgets, onNavigate, onCustomAction, loadingFallback, errorFallback, fallback, }: {
    path?: string[];
    fallback?: React.ReactNode;
} & Omit<HitUIRendererProps, 'spec'>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=renderer.d.ts.map