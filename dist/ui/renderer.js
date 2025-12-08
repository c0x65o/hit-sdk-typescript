import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Hit UI Renderer
 *
 * The main renderer that interprets UI specs and renders React components.
 */
import React from 'react';
import { HitUIProvider, useCustomWidgets } from './context';
// Import all components
import { Page } from './components/Page';
import { Card } from './components/Card';
import { Row, Column, Grid } from './components/Layout';
import { Tabs } from './components/Tabs';
import { DataTable } from './components/DataTable';
import { StatsGrid } from './components/StatsGrid';
import { Text, Badge, Icon } from './components/Typography';
import { Form } from './components/Form';
import { Button, Link } from './components/Actions';
import { Modal, Alert } from './components/Modal';
import { Async, Loading } from './components/Async';
/**
 * CustomWidget component - renders app-registered widgets
 */
function CustomWidget({ widget, props = {}, fallback, registry, }) {
    const customWidgets = useCustomWidgets();
    const WidgetComponent = customWidgets[widget];
    if (!WidgetComponent) {
        // Render fallback if widget not registered
        if (fallback) {
            return _jsx(RenderSpec, { spec: fallback, registry: registry });
        }
        console.warn(`CustomWidget "${widget}" not registered`);
        return (_jsxs("div", { className: "hit-widget-missing", children: ["Widget \"", widget, "\" not registered"] }));
    }
    return _jsx(WidgetComponent, { ...props });
}
/** Default component registry */
const DEFAULT_REGISTRY = {
    // Layout
    Page,
    Card,
    Row,
    Column,
    Grid,
    Tabs,
    // Data Display
    DataTable,
    StatsGrid,
    Text,
    Badge,
    Icon,
    // Forms
    Form,
    // Actions
    Button,
    Link,
    // Modal & Overlay
    Modal,
    Alert,
    // Async
    Async,
    Loading,
    // Custom
    CustomWidget,
};
/**
 * Render a single UI spec.
 */
export function RenderSpec({ spec, registry, }) {
    // Handle visibility
    if (spec.visible === false) {
        return null;
    }
    const Component = registry[spec.type];
    if (!Component) {
        console.warn(`Unknown component type: ${spec.type}`);
        return (_jsxs("div", { className: "hit-unknown-component", children: ["Unknown component: ", spec.type] }));
    }
    return _jsx(Component, { ...spec, registry: registry });
}
/**
 * Render children specs.
 */
export function RenderChildren({ children, registry, }) {
    if (!children || children.length === 0) {
        return null;
    }
    return (_jsx(_Fragment, { children: children.map((child, index) => (_jsx(RenderSpec, { spec: child, registry: registry }, child.key || `child-${index}`))) }));
}
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
export function HitUIRenderer({ spec, apiBase, components = {}, customWidgets = {}, onNavigate, onCustomAction, errorFallback, loadingFallback, }) {
    // Merge custom components with defaults
    const registry = { ...DEFAULT_REGISTRY, ...components };
    return (_jsx(HitUIProvider, { apiBase: apiBase, customWidgets: customWidgets, onNavigate: onNavigate, onCustomAction: onCustomAction, children: _jsx("div", { className: "hit-ui-root", children: _jsx(RenderSpec, { spec: spec, registry: registry }) }) }));
}
/**
 * Render UI from an endpoint.
 *
 * Fetches the UI spec from the endpoint and renders it.
 */
export function HitUIFromEndpoint({ endpoint, apiBase, components = {}, customWidgets = {}, onNavigate, onCustomAction, loadingFallback, errorFallback, }) {
    const [spec, setSpec] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${apiBase}${endpoint}`;
        fetch(url, { headers: { 'Content-Type': 'application/json' } })
            .then((res) => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res.json();
        })
            .then(setSpec)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [endpoint, apiBase]);
    if (loading) {
        return _jsx(_Fragment, { children: loadingFallback || _jsx("div", { className: "hit-loading", children: "Loading..." }) });
    }
    if (error) {
        return (_jsx(_Fragment, { children: errorFallback || (_jsxs("div", { className: "hit-error", children: ["Error: ", error.message] })) }));
    }
    if (!spec) {
        return null;
    }
    return (_jsx(HitUIRenderer, { spec: spec, apiBase: apiBase, components: components, customWidgets: customWidgets, onNavigate: onNavigate, onCustomAction: onCustomAction }));
}
/**
 * Feature Pack Page Component
 *
 * Renders a page from a feature pack via the ui-render module.
 *
 * @example
 * ```tsx
 * <HitFeaturePackPage pack="auth-admin" page="users" />
 * ```
 */
export function HitFeaturePackPage({ pack, page, params = {}, apiBase = '/api/ui', customWidgets = {}, onNavigate, onCustomAction, loadingFallback, errorFallback, }) {
    const queryString = new URLSearchParams(params).toString();
    // Build full endpoint - already includes apiBase so pass empty string to HitUIFromEndpoint
    const endpoint = `${apiBase}/${pack}/${page}${queryString ? `?${queryString}` : ''}`;
    return (_jsx(HitUIFromEndpoint, { endpoint: endpoint, apiBase: "" // Endpoint is already fully formed
        , customWidgets: customWidgets, onNavigate: onNavigate, onCustomAction: onCustomAction, loadingFallback: loadingFallback, errorFallback: errorFallback }));
}
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
export function HitFeaturePackRouter({ path, apiBase = '/api/ui', customWidgets = {}, onNavigate, onCustomAction, loadingFallback, errorFallback, fallback, }) {
    // Parse path into pack and page
    if (!path || path.length < 2) {
        // Not a feature pack route
        return _jsx(_Fragment, { children: fallback || null });
    }
    const [pack, page, ...rest] = path;
    return (_jsx(HitFeaturePackPage, { pack: pack, page: page, params: rest.length > 0 ? { subpath: rest.join('/') } : {}, apiBase: apiBase, customWidgets: customWidgets, onNavigate: onNavigate, onCustomAction: onCustomAction, loadingFallback: loadingFallback, errorFallback: errorFallback }));
}
