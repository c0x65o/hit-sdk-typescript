/**
 * Async and Loading Components
 */
import React from 'react';
import type { AsyncSpec, LoadingSpec } from '../types';
interface AsyncProps extends AsyncSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Async({ endpoint, loading: loadingSpec, error: errorSpec, registry, className, style, }: AsyncProps): import("react/jsx-runtime").JSX.Element | null;
interface LoadingProps extends LoadingSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Loading({ text, variant, className, style, }: LoadingProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Async.d.ts.map