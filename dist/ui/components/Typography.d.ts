/**
 * Typography Components (Text, Badge, Icon)
 */
import React from 'react';
import type { TextSpec, BadgeSpec, IconSpec } from '../types';
interface TextProps extends TextSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Text({ content, variant, className, style }: TextProps): import("react/jsx-runtime").JSX.Element;
interface BadgeProps extends BadgeSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Badge({ text, color, className, style }: BadgeProps): import("react/jsx-runtime").JSX.Element;
interface IconProps extends IconSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Icon({ name, size, className, style }: IconProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Typography.d.ts.map