import { jsx as _jsx } from "react/jsx-runtime";
import { RenderChildren } from '../renderer';
export function Row({ gap, align, justify, children, registry, className, style }) {
    const rowStyle = {
        display: 'flex',
        flexDirection: 'row',
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        alignItems: align === 'start' ? 'flex-start' :
            align === 'end' ? 'flex-end' :
                align === 'stretch' ? 'stretch' :
                    align === 'center' ? 'center' : undefined,
        justifyContent: justify === 'start' ? 'flex-start' :
            justify === 'end' ? 'flex-end' :
                justify === 'center' ? 'center' :
                    justify === 'between' ? 'space-between' :
                        justify === 'around' ? 'space-around' : undefined,
        ...style,
    };
    return (_jsx("div", { className: `hit-row ${className || ''}`, style: rowStyle, children: _jsx(RenderChildren, { children: children, registry: registry }) }));
}
export function Column({ gap, align, children, registry, className, style }) {
    const colStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        alignItems: align === 'start' ? 'flex-start' :
            align === 'end' ? 'flex-end' :
                align === 'stretch' ? 'stretch' :
                    align === 'center' ? 'center' : undefined,
        ...style,
    };
    return (_jsx("div", { className: `hit-column ${className || ''}`, style: colStyle, children: _jsx(RenderChildren, { children: children, registry: registry }) }));
}
export function Grid({ columns = 3, gap, children, registry, className, style }) {
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        ...style,
    };
    return (_jsx("div", { className: `hit-grid ${className || ''}`, style: gridStyle, children: _jsx(RenderChildren, { children: children, registry: registry }) }));
}
