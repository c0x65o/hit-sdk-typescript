/**
 * Modal and Alert Components
 */
import React from 'react';
import type { ModalSpec, AlertSpec } from '../types';
interface ModalProps extends ModalSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Modal({ id, title, size, children, footer, closeOnBackdrop, registry, className, style, }: ModalProps): import("react/jsx-runtime").JSX.Element;
interface AlertProps extends AlertSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Alert({ title, message, variant, dismissible, className, style, }: AlertProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=Modal.d.ts.map