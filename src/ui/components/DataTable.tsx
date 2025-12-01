/**
 * DataTable Component
 *
 * Renders a data table with fetching, pagination, sorting, and actions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { DataTableSpec, ButtonSpec, UISpec, ActionSpec } from '../types';
import { useHitUI } from '../context';
import { RenderChildren } from '../renderer';

interface DataTableProps extends DataTableSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function DataTable({
  endpoint,
  columns,
  selectable = false,
  pagination = true,
  pageSize = 10,
  searchable = false,
  rowActions,
  emptyMessage = 'No data available',
  sortable = true,
  registry,
  className,
  style,
}: DataTableProps) {
  const { apiBase, executeAction } = useHitUI();

  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

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
      const response = await fetch(fullUrl, {
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
      } else if (result.items) {
        setData(result.items);
        setTotalPages(result.total_pages || Math.ceil(result.total / pageSize) || 1);
      } else if (result.data) {
        setData(result.data);
        setTotalPages(result.total_pages || 1);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [endpoint, apiBase, page, pageSize, search, sortColumn, sortDirection, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (column: string) => {
    if (!sortable) return;
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRowAction = async (action: ActionSpec, row: Record<string, unknown>) => {
    await executeAction(action, row);
    // Refresh after action
    fetchData();
  };

  const formatValue = (value: unknown, type?: string): React.ReactNode => {
    if (value === null || value === undefined) return '-';

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
        return <span className="hit-badge">{String(value)}</span>;
      default:
        return String(value);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className={`hit-data-table hit-data-table-loading ${className || ''}`} style={style}>
        <div className="hit-table-skeleton">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`hit-data-table hit-data-table-error ${className || ''}`} style={style}>
        <div className="hit-table-error">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={`hit-data-table ${className || ''}`} style={style}>
      {searchable && (
        <div className="hit-table-search">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="hit-search-input"
          />
        </div>
      )}

      <div className="hit-table-wrapper">
        <table className="hit-table">
          <thead>
            <tr>
              {selectable && (
                <th className="hit-table-select">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(data.map((_, i) => i)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`hit-table-header ${col.sortable !== false && sortable ? 'hit-table-header-sortable' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  {col.label}
                  {sortColumn === col.key && (
                    <span className="hit-sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
              {rowActions && rowActions.length > 0 && (
                <th className="hit-table-actions">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="hit-table-empty"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={selectedRows.has(rowIndex) ? 'hit-row-selected' : ''}>
                  {selectable && (
                    <td className="hit-table-select">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedRows);
                          if (e.target.checked) {
                            newSelected.add(rowIndex);
                          } else {
                            newSelected.delete(rowIndex);
                          }
                          setSelectedRows(newSelected);
                        }}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? (
                        <RenderChildren
                          children={[col.render]}
                          registry={registry}
                        />
                      ) : (
                        formatValue(row[col.key], col.type)
                      )}
                    </td>
                  ))}
                  {rowActions && rowActions.length > 0 && (
                    <td className="hit-table-actions">
                      <div className="hit-action-buttons">
                        {rowActions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            className={`hit-btn hit-btn-${action.variant || 'secondary'} hit-btn-sm`}
                            onClick={() => action.onClick && handleRowAction(action.onClick, row)}
                            disabled={action.disabled}
                          >
                            {action.icon && <span className="hit-btn-icon">{action.icon}</span>}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="hit-table-pagination">
          <button
            className="hit-btn hit-btn-secondary hit-btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="hit-pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="hit-btn hit-btn-secondary hit-btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

