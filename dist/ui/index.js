/**
 * Hit UI Module
 *
 * Server-Driven UI system for Hit components.
 *
 * @example
 * ```tsx
 * import { HitUIRenderer, useHitUISpec } from '@hit/sdk/ui';
 *
 * function AdminPage() {
 *   const { spec, loading } = useHitUISpec('/admin/ui/dashboard', {
 *     apiBase: '/api'
 *   });
 *
 *   if (loading) return <Loading />;
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
// Context
export { useHitUI, HitUIProvider } from './context';
// Hooks
export { useHitUISpec, useHitData, useHitMutation } from './hooks';
// Renderer
export { HitUIRenderer, HitUIFromEndpoint, RenderSpec, RenderChildren } from './renderer';
// Components (for custom overrides)
export { Page } from './components/Page';
export { Card } from './components/Card';
export { Row, Column, Grid } from './components/Layout';
export { Tabs } from './components/Tabs';
export { DataTable } from './components/DataTable';
export { StatsGrid } from './components/StatsGrid';
export { Text, Badge, Icon } from './components/Typography';
export { Form } from './components/Form';
export { Button, Link } from './components/Actions';
export { Modal, Alert } from './components/Modal';
export { Async, Loading } from './components/Async';
// Styles - users should import this in their app
// import '@hit/sdk/ui/styles.css';
