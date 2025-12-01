/**
 * Typography Components (Text, Badge, Icon)
 */

import React from 'react';
import type { TextSpec, BadgeSpec, IconSpec } from '../types';

interface TextProps extends TextSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Text({ content, variant = 'body', className, style }: TextProps) {
  const Tag = variant.startsWith('h') ? (variant as keyof JSX.IntrinsicElements) : 'p';

  return (
    <Tag className={`hit-text hit-text-${variant} ${className || ''}`} style={style}>
      {content}
    </Tag>
  );
}

interface BadgeProps extends BadgeSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Badge({ text, color = 'default', className, style }: BadgeProps) {
  return (
    <span className={`hit-badge hit-badge-${color} ${className || ''}`} style={style}>
      {text}
    </span>
  );
}

interface IconProps extends IconSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Icon({ name, size = 'md', className, style }: IconProps) {
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  const pixelSize = typeof size === 'number' ? size : sizeMap[size];

  // Simple icon implementation - could be extended to use icon libraries
  return (
    <span
      className={`hit-icon ${className || ''}`}
      style={{
        fontSize: pixelSize,
        width: pixelSize,
        height: pixelSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* For now, just render the icon name as text or emoji */}
      {name}
    </span>
  );
}

