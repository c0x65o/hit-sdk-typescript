import { jsx as _jsx } from "react/jsx-runtime";
export function Text({ content, variant = 'body', className, style }) {
    const Tag = variant.startsWith('h') ? variant : 'p';
    return (_jsx(Tag, { className: `hit-text hit-text-${variant} ${className || ''}`, style: style, children: content }));
}
export function Badge({ text, color = 'default', className, style }) {
    return (_jsx("span", { className: `hit-badge hit-badge-${color} ${className || ''}`, style: style, children: text }));
}
export function Icon({ name, size = 'md', className, style }) {
    const sizeMap = { sm: 16, md: 24, lg: 32 };
    const pixelSize = typeof size === 'number' ? size : sizeMap[size];
    // Simple icon implementation - could be extended to use icon libraries
    return (_jsx("span", { className: `hit-icon ${className || ''}`, style: {
            fontSize: pixelSize,
            width: pixelSize,
            height: pixelSize,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
        }, children: name }));
}
