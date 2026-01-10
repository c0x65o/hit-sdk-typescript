import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DataTable Component
 *
 * Renders a data table with fetching, pagination, sorting, and actions.
 */
import { useState, useEffect, useCallback } from 'react';
import { useHitUI } from '../context';
import { RenderChildren } from '../renderer';
import { uiFetch } from '../http';
export function DataTable({ endpoint, columns, selectable = false, pagination = true, pageSize = 10, searchable = false, rowActions, emptyMessage = 'No data available', sortable = true, registry, className, style, }) {
    const { apiBase, executeAction } = useHitUI();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedRows, setSelectedRows] = useState(new Set());
    const fetchData = useCallback(async () => {
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${apiBase}${endpoint}`;
        const params = new URLSearchParams();
        if (pagination) {
            params.set('page', String(page));
            params.set('page_size', String(pageSize));
        }
        if (search) {
            params.set('search', search);
        }
        if (sortColumn) {
            params.set('sort', sortColumn);
            params.set('order', sortDirection);
        }
        const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
        try {
            setLoading(true);
            const response = await uiFetch(fullUrl, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const result = await response.json();
            // Handle both paginated and non-paginated responses
            if (Array.isArray(result)) {
                setData(result);
                setTotalPages(1);
            }
            else if (result.items) {
                setData(result.items);
                setTotalPages(result.total_pages || Math.ceil(result.total / pageSize) || 1);
            }
            else if (result.data) {
                setData(result.data);
                setTotalPages(result.total_pages || 1);
            }
            else {
                setData([]);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
            setLoading(false);
        }
    }, [endpoint, apiBase, page, pageSize, search, sortColumn, sortDirection, pagination]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleSort = (column) => {
        if (!sortable)
            return;
        if (sortColumn === column) {
            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        }
        else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };
    const handleRowAction = async (action, row) => {
        await executeAction(action, row);
        // Refresh after action
        fetchData();
    };
    const formatValue = (value, type) => {
        if (value === null || value === undefined)
            return '-';
        switch (type) {
            case 'boolean':
                return value ? '✓' : '✗';
            case 'datetime':
                return new Date(String(value)).toLocaleString();
            case 'date':
                return new Date(String(value)).toLocaleDateString();
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(Number(value));
            case 'badge':
                return _jsx("span", { className: "hit-badge", children: String(value) });
            default:
                return String(value);
        }
    };
    if (loading && data.length === 0) {
        return (_jsx("div", { className: `hit-data-table hit-data-table-loading ${className || ''}`, style: style, children: _jsx("div", { className: "hit-table-skeleton", children: "Loading..." }) }));
    }
    if (error) {
        return (_jsx("div", { className: `hit-data-table hit-data-table-error ${className || ''}`, style: style, children: _jsxs("div", { className: "hit-table-error", children: ["Error: ", error.message] }) }));
    }
    return (_jsxs("div", { className: `hit-data-table ${className || ''}`, style: style, children: [searchable && (_jsx("div", { className: "hit-table-search", children: _jsx("input", { type: "text", placeholder: "Search...", value: search, onChange: (e) => setSearch(e.target.value), className: "hit-search-input" }) })), _jsx("div", { className: "hit-table-wrapper", children: _jsxs("table", { className: "hit-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [selectable && (_jsx("th", { className: "hit-table-select", children: _jsx("input", { type: "checkbox", checked: selectedRows.size === data.length && data.length > 0, onChange: (e) => {
                                                if (e.target.checked) {
                                                    setSelectedRows(new Set(data.map((_, i) => i)));
                                                }
                                                else {
                                                    setSelectedRows(new Set());
                                                }
                                            } }) })), columns.map((col) => (_jsxs("th", { className: `hit-table-header ${col.sortable !== false && sortable ? 'hit-table-header-sortable' : ''}`, style: { width: col.width }, onClick: () => col.sortable !== false && handleSort(col.key), children: [col.label, sortColumn === col.key && (_jsx("span", { className: "hit-sort-indicator", children: sortDirection === 'asc' ? ' ↑' : ' ↓' }))] }, col.key))), rowActions && rowActions.length > 0 && (_jsx("th", { className: "hit-table-actions", children: "Actions" }))] }) }), _jsx("tbody", { children: data.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0), className: "hit-table-empty", children: emptyMessage }) })) : (data.map((row, rowIndex) => (_jsxs("tr", { className: selectedRows.has(rowIndex) ? 'hit-row-selected' : '', children: [selectable && (_jsx("td", { className: "hit-table-select", children: _jsx("input", { type: "checkbox", checked: selectedRows.has(rowIndex), onChange: (e) => {
                                                const newSelected = new Set(selectedRows);
                                                if (e.target.checked) {
                                                    newSelected.add(rowIndex);
                                                }
                                                else {
                                                    newSelected.delete(rowIndex);
                                                }
                                                setSelectedRows(newSelected);
                                            } }) })), columns.map((col) => (_jsx("td", { children: col.render ? (_jsx(RenderChildren, { children: [col.render], registry: registry })) : (formatValue(row[col.key], col.type)) }, col.key))), rowActions && rowActions.length > 0 && (_jsx("td", { className: "hit-table-actions", children: _jsx("div", { className: "hit-action-buttons", children: rowActions.map((action, actionIndex) => (_jsxs("button", { className: `hit-btn hit-btn-${action.variant || 'secondary'} hit-btn-sm`, onClick: () => action.onClick && handleRowAction(action.onClick, row), disabled: action.disabled, children: [action.icon && _jsx("span", { className: "hit-btn-icon", children: action.icon }), action.label] }, actionIndex))) }) }))] }, rowIndex)))) })] }) }), pagination && totalPages > 1 && (_jsxs("div", { className: "hit-table-pagination", children: [_jsx("button", { className: "hit-btn hit-btn-secondary hit-btn-sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, children: "Previous" }), _jsxs("span", { className: "hit-pagination-info", children: ["Page ", page, " of ", totalPages] }), _jsx("button", { className: "hit-btn hit-btn-secondary hit-btn-sm", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page === totalPages, children: "Next" })] }))] }));
}
