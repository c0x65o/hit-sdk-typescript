/**
 * Hit UI Renderer
 *
 * The main renderer that interprets UI specs and renders React components.
 */

import React from 'react';
import type { UISpec, ComponentRegistry, HitUIRendererProps, CustomWidgetSpec, FeaturePackPageProps } from './types';
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
function CustomWidget({
  widget,
  props = {},
  fallback,
  registry,
}: CustomWidgetSpec & { registry: Record<string, React.ComponentType<any>> }) {
  const customWidgets = useCustomWidgets();
  const WidgetComponent = customWidgets[widget];

  if (!WidgetComponent) {
    // Render fallback if widget not registered
    if (fallback) {
      return <RenderSpec spec={fallback} registry={registry} />;
    }
    console.warn(`CustomWidget "${widget}" not registered`);
    return (
      <div className="hit-widget-missing">
        Widget "{widget}" not registered
      </div>
    );
  }

  return <WidgetComponent {...props} />;
}

/** Default component registry */
const DEFAULT_REGISTRY: Record<UISpec['type'], React.ComponentType<any>> = {
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
export function RenderSpec({
  spec,
  registry,
}: {
  spec: UISpec;
  registry: Record<string, React.ComponentType<any>>;
}) {
  // Handle visibility
  if (spec.visible === false) {
    return null;
  }

  const Component = registry[spec.type];

  if (!Component) {
    console.warn(`Unknown component type: ${spec.type}`);
    return (
      <div className="hit-unknown-component">
        Unknown component: {spec.type}
      </div>
    );
  }

  return <Component {...spec} registry={registry} />;
}

/**
 * Render children specs.
 */
export function RenderChildren({
  children,
  registry,
}: {
  children?: UISpec[];
  registry: Record<string, React.ComponentType<any>>;
}) {
  if (!children || children.length === 0) {
    return null;
  }

  return (
    <>
      {children.map((child, index) => (
        <RenderSpec
          key={child.key || `child-${index}`}
          spec={child}
          registry={registry}
        />
      ))}
    </>
  );
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
export function HitUIRenderer({
  spec,
  apiBase,
  components = {},
  customWidgets = {},
  onNavigate,
  onCustomAction,
  errorFallback,
  loadingFallback,
}: HitUIRendererProps) {
  // Merge custom components with defaults
  const registry = { ...DEFAULT_REGISTRY, ...components };

  return (
    <HitUIProvider
      apiBase={apiBase}
      customWidgets={customWidgets}
      onNavigate={onNavigate}
      onCustomAction={onCustomAction}
    >
      <div className="hit-ui-root">
        <RenderSpec spec={spec} registry={registry} />
      </div>
    </HitUIProvider>
  );
}

/**
 * Render UI from an endpoint.
 *
 * Fetches the UI spec from the endpoint and renders it.
 */
export function HitUIFromEndpoint({
  endpoint,
  apiBase,
  components = {},
  customWidgets = {},
  onNavigate,
  onCustomAction,
  loadingFallback,
  errorFallback,
}: Omit<HitUIRendererProps, 'spec'> & { endpoint: string }) {
  const [spec, setSpec] = React.useState<UISpec | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${apiBase}${endpoint}`;

    fetch(url, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setSpec)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [endpoint, apiBase]);

  if (loading) {
    return <>{loadingFallback || <div className="hit-loading">Loading...</div>}</>;
  }

  if (error) {
    return (
      <>
        {errorFallback || (
          <div className="hit-error">Error: {error.message}</div>
        )}
      </>
    );
  }

  if (!spec) {
    return null;
  }

  return (
    <HitUIRenderer
      spec={spec}
      apiBase={apiBase}
      components={components}
      customWidgets={customWidgets}
      onNavigate={onNavigate}
      onCustomAction={onCustomAction}
    />
  );
}

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
export function HitFeaturePackPage({
  pack,
  page,
  params = {},
  apiBase = '/api/ui',
  customWidgets = {},
  onNavigate,
  onCustomAction,
  loadingFallback,
  errorFallback,
}: FeaturePackPageProps & Omit<HitUIRendererProps, 'spec'>) {
  const queryString = new URLSearchParams(params).toString();
  // Build full endpoint - already includes apiBase so pass empty string to HitUIFromEndpoint
  const endpoint = `${apiBase}/${pack}/${page}${queryString ? `?${queryString}` : ''}`;

  return (
    <HitUIFromEndpoint
      endpoint={endpoint}
      apiBase=""  // Endpoint is already fully formed
      customWidgets={customWidgets}
      onNavigate={onNavigate}
      onCustomAction={onCustomAction}
      loadingFallback={loadingFallback}
      errorFallback={errorFallback}
    />
  );
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
export function HitFeaturePackRouter({
  path,
  apiBase = '/api/ui',
  customWidgets = {},
  onNavigate,
  onCustomAction,
  loadingFallback,
  errorFallback,
  fallback,
}: {
  path?: string[];
  fallback?: React.ReactNode;
} & Omit<HitUIRendererProps, 'spec'>) {
  // Parse path into pack and page
  if (!path || path.length < 2) {
    // Not a feature pack route
    return <>{fallback || null}</>;
  }

  const [pack, page, ...rest] = path;

  return (
    <HitFeaturePackPage
      pack={pack}
      page={page}
      params={rest.length > 0 ? { subpath: rest.join('/') } : {}}
      apiBase={apiBase}
      customWidgets={customWidgets}
      onNavigate={onNavigate}
      onCustomAction={onCustomAction}
      loadingFallback={loadingFallback}
      errorFallback={errorFallback}
    />
  );
}

