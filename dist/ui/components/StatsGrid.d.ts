/**
 * StatsGrid Component
 */
import React from 'react';
import type { StatsGridSpec } from '../types';
interface StatsGridProps extends StatsGridSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function StatsGrid({ items, columns, className, style }: StatsGridProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StatsGrid.d.ts.map