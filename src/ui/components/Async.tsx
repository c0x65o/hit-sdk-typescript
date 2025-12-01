/**
 * Async and Loading Components
 */

import React from 'react';
import type { AsyncSpec, LoadingSpec, UISpec } from '../types';
import { useHitUI } from '../context';
import { useHitUISpec } from '../hooks';
import { RenderSpec, RenderChildren } from '../renderer';

interface AsyncProps extends AsyncSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Async({
  endpoint,
  loading: loadingSpec,
  error: errorSpec,
  registry,
  className,
  style,
}: AsyncProps) {
  const { apiBase } = useHitUI();
  const { spec, loading, error } = useHitUISpec(endpoint, { apiBase });

  if (loading) {
    if (loadingSpec) {
      return <RenderSpec spec={loadingSpec} registry={registry} />;
    }
    return (
      <div className={`hit-async-loading ${className || ''}`} style={style}>
        <Loading type="Loading" variant="spinner" registry={registry} />
      </div>
    );
  }

  if (error) {
    if (errorSpec) {
      return <RenderSpec spec={errorSpec} registry={registry} />;
    }
    return (
      <div className={`hit-async-error ${className || ''}`} style={style}>
        Error: {error.message}
      </div>
    );
  }

  if (!spec) return null;

  return (
    <div className={`hit-async ${className || ''}`} style={style}>
      <RenderSpec spec={spec} registry={registry} />
    </div>
  );
}

interface LoadingProps extends LoadingSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Loading({
  text = 'Loading...',
  variant = 'spinner',
  className,
  style,
}: LoadingProps) {
  return (
    <div className={`hit-loading hit-loading-${variant} ${className || ''}`} style={style}>
      {variant === 'spinner' && (
        <div className="hit-spinner">
          <div className="hit-spinner-circle" />
        </div>
      )}
      {variant === 'skeleton' && (
        <div className="hit-skeleton">
          <div className="hit-skeleton-line hit-skeleton-line-lg" />
          <div className="hit-skeleton-line" />
          <div className="hit-skeleton-line" />
        </div>
      )}
      {variant === 'dots' && (
        <div className="hit-dots">
          <span className="hit-dot" />
          <span className="hit-dot" />
          <span className="hit-dot" />
        </div>
      )}
      {text && <span className="hit-loading-text">{text}</span>}
    </div>
  );
}

