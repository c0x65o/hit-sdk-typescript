/**
 * Layout Components (Row, Column, Grid)
 */

import React from 'react';
import type { RowSpec, ColumnSpec, GridSpec } from '../types';
import { RenderChildren } from '../renderer';

interface RowProps extends RowSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Row({ gap, align, justify, children, registry, className, style }: RowProps) {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    alignItems: align === 'start' ? 'flex-start' : 
                align === 'end' ? 'flex-end' : 
                align === 'stretch' ? 'stretch' : 
                align === 'center' ? 'center' : undefined,
    justifyContent: justify === 'start' ? 'flex-start' :
                    justify === 'end' ? 'flex-end' :
                    justify === 'center' ? 'center' :
                    justify === 'between' ? 'space-between' :
                    justify === 'around' ? 'space-around' : undefined,
    ...style,
  };

  return (
    <div className={`hit-row ${className || ''}`} style={rowStyle}>
      <RenderChildren children={children} registry={registry} />
    </div>
  );
}

interface ColumnProps extends ColumnSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Column({ gap, align, children, registry, className, style }: ColumnProps) {
  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    alignItems: align === 'start' ? 'flex-start' : 
                align === 'end' ? 'flex-end' : 
                align === 'stretch' ? 'stretch' : 
                align === 'center' ? 'center' : undefined,
    ...style,
  };

  return (
    <div className={`hit-column ${className || ''}`} style={colStyle}>
      <RenderChildren children={children} registry={registry} />
    </div>
  );
}

interface GridProps extends GridSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Grid({ columns = 3, gap, children, registry, className, style }: GridProps) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    ...style,
  };

  return (
    <div className={`hit-grid ${className || ''}`} style={gridStyle}>
      <RenderChildren children={children} registry={registry} />
    </div>
  );
}

