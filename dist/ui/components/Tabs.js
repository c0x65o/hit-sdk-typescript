import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Tabs Component
 */
import { useState } from 'react';
import { RenderChildren } from '../renderer';
export function Tabs({ tabs, defaultTab, registry, className, style }) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
    const activeTabContent = tabs.find((t) => t.id === activeTab);
    return (_jsxs("div", { className: `hit-tabs ${className || ''}`, style: style, children: [_jsx("div", { className: "hit-tabs-list", role: "tablist", children: tabs.map((tab) => (_jsxs("button", { role: "tab", "aria-selected": activeTab === tab.id, className: `hit-tab ${activeTab === tab.id ? 'hit-tab-active' : ''}`, onClick: () => setActiveTab(tab.id), children: [tab.icon && _jsx("span", { className: "hit-tab-icon", children: tab.icon }), tab.label] }, tab.id))) }), _jsx("div", { className: "hit-tabs-content", role: "tabpanel", children: activeTabContent && (_jsx(RenderChildren, { children: activeTabContent.children, registry: registry })) })] }));
}
