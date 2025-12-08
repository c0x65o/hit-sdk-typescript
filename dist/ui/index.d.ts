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
export type { BaseSpec, UISpec, ComponentRegistry, HitUIContext, HitUIRendererProps, ActionSpec, NavigateAction, ApiCallAction, SubmitAction, OpenModalAction, CloseModalAction, RefreshAction, CustomAction, PageSpec, CardSpec, RowSpec, ColumnSpec, GridSpec, TabsSpec, TabItemSpec, DataTableSpec, ColumnDef, StatsGridSpec, StatItemSpec, TextSpec, BadgeSpec, IconSpec, FormSpec, FieldSpec, TextFieldSpec, TextAreaFieldSpec, NumberFieldSpec, SelectFieldSpec, CheckboxFieldSpec, DateFieldSpec, HiddenFieldSpec, ValidationRule, SelectOption, ButtonSpec, LinkSpec, ModalSpec, AlertSpec, AsyncSpec, LoadingSpec, CustomWidgetSpec, CustomWidgetRegistry, FeaturePackContext, FeaturePackPageProps, } from './types';
export { useHitUI, HitUIProvider, useCustomWidgets, useCustomWidget } from './context';
export { useHitUISpec, useHitData, useHitMutation, useNavigation, useFeaturePack } from './hooks';
export { HitUIRenderer, HitUIFromEndpoint, HitFeaturePackPage, HitFeaturePackRouter, RenderSpec, RenderChildren, } from './renderer';
export { HitDynamicRouter, refreshRoutes, type HitDynamicRouterProps, } from './router';
export { matchRoute, findMatchingRoute, fetchRoutes, clearRoutesCache, type Route, type MatchedRoute, type RoutesResponse, } from './route-matcher';
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
//# sourceMappingURL=index.d.ts.map