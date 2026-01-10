/**
 * Tabs Component
 */
import React from 'react';
import type { TabsSpec } from '../types';
interface TabsProps extends TabsSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Tabs({ tabs, defaultTab, registry, className, style }: TabsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Tabs.d.ts.map