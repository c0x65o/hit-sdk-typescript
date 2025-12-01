/**
 * Hit UI Renderer
 *
 * The main renderer that interprets UI specs and renders React components.
 */
import React from 'react';
import type { UISpec, HitUIRendererProps } from './types';
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
export declare function HitUIRenderer({ spec, apiBase, components, onNavigate, onCustomAction, errorFallback, loadingFallback, }: HitUIRendererProps): import("react/jsx-runtime").JSX.Element;
/**
 * Render UI from an endpoint.
 *
 * Fetches the UI spec from the endpoint and renders it.
 */
export declare function HitUIFromEndpoint({ endpoint, apiBase, components, onNavigate, onCustomAction, loadingFallback, errorFallback, }: Omit<HitUIRendererProps, 'spec'> & {
    endpoint: string;
}): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=renderer.d.ts.map