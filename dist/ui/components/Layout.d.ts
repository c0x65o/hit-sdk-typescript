/**
 * Layout Components (Row, Column, Grid)
 */
import React from 'react';
import type { RowSpec, ColumnSpec, GridSpec } from '../types';
interface RowProps extends RowSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Row({ gap, align, justify, children, registry, className, style }: RowProps): import("react/jsx-runtime").JSX.Element;
interface ColumnProps extends ColumnSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Column({ gap, align, children, registry, className, style }: ColumnProps): import("react/jsx-runtime").JSX.Element;
interface GridProps extends GridSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Grid({ columns, gap, children, registry, className, style }: GridProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Layout.d.ts.map