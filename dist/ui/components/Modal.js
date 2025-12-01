import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Modal and Alert Components
 */
import React, { useEffect, useRef } from 'react';
import { useHitUI } from '../context';
import { RenderChildren } from '../renderer';
export function Modal({ id, title, size = 'md', children, footer, closeOnBackdrop = true, registry, className, style, }) {
    const { closeModal } = useHitUI();
    const modalRef = useRef(null);
    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeModal]);
    // Handle click outside
    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            closeModal();
        }
    };
    const sizeClasses = {
        sm: 'hit-modal-sm',
        md: 'hit-modal-md',
        lg: 'hit-modal-lg',
        xl: 'hit-modal-xl',
        full: 'hit-modal-full',
    };
    return (_jsx("div", { className: "hit-modal-backdrop", onClick: handleBackdropClick, role: "dialog", "aria-modal": "true", "aria-labelledby": title ? `${id}-title` : undefined, children: _jsxs("div", { ref: modalRef, className: `hit-modal ${sizeClasses[size]} ${className || ''}`, style: style, children: [title && (_jsxs("div", { className: "hit-modal-header", children: [_jsx("h2", { id: `${id}-title`, className: "hit-modal-title", children: title }), _jsx("button", { className: "hit-modal-close", onClick: () => closeModal(), "aria-label": "Close modal", children: "\u00D7" })] })), _jsx("div", { className: "hit-modal-body", children: _jsx(RenderChildren, { children: children, registry: registry }) }), footer && footer.length > 0 && (_jsx("div", { className: "hit-modal-footer", children: _jsx(RenderChildren, { children: footer, registry: registry }) }))] }) }));
}
export function Alert({ title, message, variant = 'info', dismissible = false, className, style, }) {
    const [dismissed, setDismissed] = React.useState(false);
    if (dismissed)
        return null;
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
    };
    return (_jsxs("div", { className: `hit-alert hit-alert-${variant} ${className || ''}`, style: style, role: "alert", children: [_jsx("span", { className: "hit-alert-icon", children: icons[variant] }), _jsxs("div", { className: "hit-alert-content", children: [title && _jsx("div", { className: "hit-alert-title", children: title }), _jsx("div", { className: "hit-alert-message", children: message })] }), dismissible && (_jsx("button", { className: "hit-alert-dismiss", onClick: () => setDismissed(true), "aria-label": "Dismiss", children: "\u00D7" }))] }));
}
