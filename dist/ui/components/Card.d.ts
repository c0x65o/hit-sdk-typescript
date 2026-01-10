/**
 * Card Component
 */
import React from 'react';
import type { CardSpec } from '../types';
interface CardProps extends CardSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Card({ title, subtitle, children, footer, registry, className, style }: CardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Card.d.ts.map