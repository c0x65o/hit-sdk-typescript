import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RenderChildren } from '../renderer';
export function Card({ title, subtitle, children, footer, registry, className, style }) {
    return (_jsxs("div", { className: `hit-card ${className || ''}`, style: style, children: [(title || subtitle) && (_jsxs("div", { className: "hit-card-header", children: [title && _jsx("h3", { className: "hit-card-title", children: title }), subtitle && _jsx("p", { className: "hit-card-subtitle", children: subtitle })] })), _jsx("div", { className: "hit-card-content", children: _jsx(RenderChildren, { children: children, registry: registry }) }), footer && footer.length > 0 && (_jsx("div", { className: "hit-card-footer", children: _jsx(RenderChildren, { children: footer, registry: registry }) }))] }));
}
