/**
 * Page Component
 */
import React from 'react';
import type { PageSpec } from '../types';
interface PageProps extends PageSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Page({ title, description, children, actions, registry, className, style }: PageProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Page.d.ts.map