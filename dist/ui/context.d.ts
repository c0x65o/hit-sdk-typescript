/**
 * Hit UI Context
 *
 * Provides context for all Hit UI components including
 * action execution, navigation, and data access.
 */
import React from 'react';
import type { HitUIContext } from './types';
export declare function useHitUI(): HitUIContext;
interface HitUIProviderProps {
    apiBase: string;
    children: React.ReactNode;
    onNavigate?: (path: string, newTab?: boolean) => void;
    onCustomAction?: (name: string, payload?: Record<string, unknown>) => void;
}
export declare function HitUIProvider({ apiBase, children, onNavigate, onCustomAction, }: HitUIProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=context.d.ts.map