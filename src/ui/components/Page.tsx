/**
 * Page Component
 */

import React from 'react';
import type { PageSpec, UISpec, ButtonSpec } from '../types';
import { RenderChildren } from '../renderer';

interface PageProps extends PageSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Page({ title, description, children, actions, registry, className, style }: PageProps) {
  return (
    <div className={`hit-page ${className || ''}`} style={style}>
      {(title || description || actions) && (
        <header className="hit-page-header">
          <div className="hit-page-header-text">
            {title && <h1 className="hit-page-title">{title}</h1>}
            {description && <p className="hit-page-description">{description}</p>}
          </div>
          {actions && actions.length > 0 && (
            <div className="hit-page-actions">
              <RenderChildren 
                children={actions as UISpec[]} 
                registry={registry} 
              />
            </div>
          )}
        </header>
      )}
      <div className="hit-page-content">
        <RenderChildren children={children} registry={registry} />
      </div>
    </div>
  );
}

