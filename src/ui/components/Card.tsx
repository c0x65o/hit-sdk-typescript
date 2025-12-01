/**
 * Card Component
 */

import React from 'react';
import type { CardSpec, UISpec } from '../types';
import { RenderChildren } from '../renderer';

interface CardProps extends CardSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Card({ title, subtitle, children, footer, registry, className, style }: CardProps) {
  return (
    <div className={`hit-card ${className || ''}`} style={style}>
      {(title || subtitle) && (
        <div className="hit-card-header">
          {title && <h3 className="hit-card-title">{title}</h3>}
          {subtitle && <p className="hit-card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="hit-card-content">
        <RenderChildren children={children} registry={registry} />
      </div>
      {footer && footer.length > 0 && (
        <div className="hit-card-footer">
          <RenderChildren children={footer} registry={registry} />
        </div>
      )}
    </div>
  );
}

