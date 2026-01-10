import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useHitUI } from '../context';
import { useHitUISpec } from '../hooks';
import { RenderSpec } from '../renderer';
export function Async({ endpoint, loading: loadingSpec, error: errorSpec, registry, className, style, }) {
    const { apiBase } = useHitUI();
    const { spec, loading, error } = useHitUISpec(endpoint, { apiBase });
    if (loading) {
        if (loadingSpec) {
            return _jsx(RenderSpec, { spec: loadingSpec, registry: registry });
        }
        return (_jsx("div", { className: `hit-async-loading ${className || ''}`, style: style, children: _jsx(Loading, { type: "Loading", variant: "spinner", registry: registry }) }));
    }
    if (error) {
        if (errorSpec) {
            return _jsx(RenderSpec, { spec: errorSpec, registry: registry });
        }
        return (_jsxs("div", { className: `hit-async-error ${className || ''}`, style: style, children: ["Error: ", error.message] }));
    }
    if (!spec)
        return null;
    return (_jsx("div", { className: `hit-async ${className || ''}`, style: style, children: _jsx(RenderSpec, { spec: spec, registry: registry }) }));
}
export function Loading({ text = 'Loading...', variant = 'spinner', className, style, }) {
    return (_jsxs("div", { className: `hit-loading hit-loading-${variant} ${className || ''}`, style: style, children: [variant === 'spinner' && (_jsx("div", { className: "hit-spinner", children: _jsx("div", { className: "hit-spinner-circle" }) })), variant === 'skeleton' && (_jsxs("div", { className: "hit-skeleton", children: [_jsx("div", { className: "hit-skeleton-line hit-skeleton-line-lg" }), _jsx("div", { className: "hit-skeleton-line" }), _jsx("div", { className: "hit-skeleton-line" })] })), variant === 'dots' && (_jsxs("div", { className: "hit-dots", children: [_jsx("span", { className: "hit-dot" }), _jsx("span", { className: "hit-dot" }), _jsx("span", { className: "hit-dot" })] })), text && _jsx("span", { className: "hit-loading-text", children: text })] }));
}
