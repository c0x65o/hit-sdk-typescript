/**
 * StatsGrid Component
 */

import React from 'react';
import type { StatsGridSpec } from '../types';
import { useHitUI } from '../context';

interface StatsGridProps extends StatsGridSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function StatsGrid({ items, columns = 4, className, style }: StatsGridProps) {
  const { executeAction } = useHitUI();

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '1rem',
    ...style,
  };

  return (
    <div className={`hit-stats-grid ${className || ''}`} style={gridStyle}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`hit-stat-card ${item.onClick ? 'hit-stat-card-clickable' : ''}`}
          onClick={() => item.onClick && executeAction(item.onClick)}
          role={item.onClick ? 'button' : undefined}
          tabIndex={item.onClick ? 0 : undefined}
        >
          {item.icon && <span className="hit-stat-icon">{item.icon}</span>}
          <div className="hit-stat-content">
            <div className="hit-stat-value">{item.value}</div>
            <div className="hit-stat-label">{item.label}</div>
            {item.change !== undefined && (
              <div
                className={`hit-stat-change hit-stat-change-${item.changeType || 'neutral'}`}
              >
                {item.changeType === 'increase' && '↑'}
                {item.changeType === 'decrease' && '↓'}
                {Math.abs(item.change)}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

