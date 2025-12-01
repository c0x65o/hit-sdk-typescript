/**
 * Action Components (Button, Link)
 */

import React from 'react';
import type { ButtonSpec, LinkSpec } from '../types';
import { useHitUI } from '../context';

interface ButtonProps extends ButtonSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  loading = false,
  onClick,
  className,
  style,
}: ButtonProps) {
  const { executeAction } = useHitUI();

  const handleClick = async () => {
    if (disabled || loading) return;
    if (onClick) {
      await executeAction(onClick);
    }
  };

  return (
    <button
      className={`hit-btn hit-btn-${variant} hit-btn-${size} ${loading ? 'hit-btn-loading' : ''} ${className || ''}`}
      style={style}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading && <span className="hit-btn-spinner" />}
      {icon && !loading && <span className="hit-btn-icon">{icon}</span>}
      <span className="hit-btn-label">{label}</span>
      {iconRight && <span className="hit-btn-icon-right">{iconRight}</span>}
    </button>
  );
}

interface LinkProps extends LinkSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Link({ label, href, newTab = false, className, style }: LinkProps) {
  const { navigate } = useHitUI();

  const handleClick = (e: React.MouseEvent) => {
    // Let external links work normally
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return;
    }

    e.preventDefault();
    navigate(href, newTab);
  };

  return (
    <a
      href={href}
      className={`hit-link ${className || ''}`}
      style={style}
      onClick={handleClick}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
    >
      {label}
    </a>
  );
}

