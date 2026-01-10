/**
 * Action Components (Button, Link)
 */
import React from 'react';
import type { ButtonSpec, LinkSpec } from '../types';
interface ButtonProps extends ButtonSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Button({ label, variant, size, icon, iconRight, disabled, loading, onClick, className, style, }: ButtonProps): import("react/jsx-runtime").JSX.Element;
interface LinkProps extends LinkSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Link({ label, href, newTab, className, style }: LinkProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Actions.d.ts.map