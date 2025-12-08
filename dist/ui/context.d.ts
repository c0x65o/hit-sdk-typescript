/**
 * Hit UI Context
 *
 * Provides context for all Hit UI components including
 * action execution, navigation, and data access.
 */
import React from 'react';
import type { HitUIContext, CustomWidgetRegistry } from './types';
export declare function useHitUI(): HitUIContext;
export declare function useCustomWidgets(): CustomWidgetRegistry;
export declare function useCustomWidget(name: string): React.ComponentType<any> | null;
interface HitUIProviderProps {
    apiBase: string;
    children: React.ReactNode;
    customWidgets?: CustomWidgetRegistry;
    onNavigate?: (path: string, newTab?: boolean) => void;
    onCustomAction?: (name: string, payload?: Record<string, unknown>) => void;
}
export declare function HitUIProvider({ apiBase, children, customWidgets, onNavigate, onCustomAction, }: HitUIProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=context.d.ts.map