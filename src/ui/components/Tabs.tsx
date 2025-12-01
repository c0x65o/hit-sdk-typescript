/**
 * Tabs Component
 */

import React, { useState } from 'react';
import type { TabsSpec } from '../types';
import { RenderChildren } from '../renderer';

interface TabsProps extends TabsSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Tabs({ tabs, defaultTab, registry, className, style }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find((t) => t.id === activeTab);

  return (
    <div className={`hit-tabs ${className || ''}`} style={style}>
      <div className="hit-tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`hit-tab ${activeTab === tab.id ? 'hit-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="hit-tab-icon">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="hit-tabs-content" role="tabpanel">
        {activeTabContent && (
          <RenderChildren children={activeTabContent.children} registry={registry} />
        )}
      </div>
    </div>
  );
}

