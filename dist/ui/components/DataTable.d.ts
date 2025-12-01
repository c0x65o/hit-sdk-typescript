/**
 * DataTable Component
 *
 * Renders a data table with fetching, pagination, sorting, and actions.
 */
import React from 'react';
import type { DataTableSpec } from '../types';
interface DataTableProps extends DataTableSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function DataTable({ endpoint, columns, selectable, pagination, pageSize, searchable, rowActions, emptyMessage, sortable, registry, className, style, }: DataTableProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DataTable.d.ts.map