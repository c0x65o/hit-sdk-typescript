import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useHitUI } from '../context';
export function Button({ label, variant = 'primary', size = 'md', icon, iconRight, disabled = false, loading = false, onClick, className, style, }) {
    const { executeAction } = useHitUI();
    const handleClick = async () => {
        if (disabled || loading)
            return;
        if (onClick) {
            await executeAction(onClick);
        }
    };
    return (_jsxs("button", { className: `hit-btn hit-btn-${variant} hit-btn-${size} ${loading ? 'hit-btn-loading' : ''} ${className || ''}`, style: style, onClick: handleClick, disabled: disabled || loading, children: [loading && _jsx("span", { className: "hit-btn-spinner" }), icon && !loading && _jsx("span", { className: "hit-btn-icon", children: icon }), _jsx("span", { className: "hit-btn-label", children: label }), iconRight && _jsx("span", { className: "hit-btn-icon-right", children: iconRight })] }));
}
export function Link({ label, href, newTab = false, className, style }) {
    const { navigate } = useHitUI();
    const handleClick = (e) => {
        // Let external links work normally
        if (href.startsWith('http://') || href.startsWith('https://')) {
            return;
        }
        e.preventDefault();
        navigate(href, newTab);
    };
    return (_jsx("a", { href: href, className: `hit-link ${className || ''}`, style: style, onClick: handleClick, target: newTab ? '_blank' : undefined, rel: newTab ? 'noopener noreferrer' : undefined, children: label }));
}
