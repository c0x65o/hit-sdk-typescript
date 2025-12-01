import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RenderChildren } from '../renderer';
export function Page({ title, description, children, actions, registry, className, style }) {
    return (_jsxs("div", { className: `hit-page ${className || ''}`, style: style, children: [(title || description || actions) && (_jsxs("header", { className: "hit-page-header", children: [_jsxs("div", { className: "hit-page-header-text", children: [title && _jsx("h1", { className: "hit-page-title", children: title }), description && _jsx("p", { className: "hit-page-description", children: description })] }), actions && actions.length > 0 && (_jsx("div", { className: "hit-page-actions", children: _jsx(RenderChildren, { children: actions, registry: registry }) }))] })), _jsx("div", { className: "hit-page-content", children: _jsx(RenderChildren, { children: children, registry: registry }) })] }));
}
