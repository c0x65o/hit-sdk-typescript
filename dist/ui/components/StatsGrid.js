import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useHitUI } from '../context';
export function StatsGrid({ items, columns = 4, className, style }) {
    const { executeAction } = useHitUI();
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1rem',
        ...style,
    };
    return (_jsx("div", { className: `hit-stats-grid ${className || ''}`, style: gridStyle, children: items.map((item, index) => (_jsxs("div", { className: `hit-stat-card ${item.onClick ? 'hit-stat-card-clickable' : ''}`, onClick: () => item.onClick && executeAction(item.onClick), role: item.onClick ? 'button' : undefined, tabIndex: item.onClick ? 0 : undefined, children: [item.icon && _jsx("span", { className: "hit-stat-icon", children: item.icon }), _jsxs("div", { className: "hit-stat-content", children: [_jsx("div", { className: "hit-stat-value", children: item.value }), _jsx("div", { className: "hit-stat-label", children: item.label }), item.change !== undefined && (_jsxs("div", { className: `hit-stat-change hit-stat-change-${item.changeType || 'neutral'}`, children: [item.changeType === 'increase' && '↑', item.changeType === 'decrease' && '↓', Math.abs(item.change), "%"] }))] })] }, index))) }));
}
