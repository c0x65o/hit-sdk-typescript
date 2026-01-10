import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Hit UI Context
 *
 * Provides context for all Hit UI components including
 * action execution, navigation, and data access.
 */
import { createContext, useContext, useCallback, useState } from 'react';
import { uiFetch } from './http';
const HitUIContextInternal = createContext(null);
// Custom widgets context
const CustomWidgetsContext = createContext({});
export function useHitUI() {
    const context = useContext(HitUIContextInternal);
    if (!context) {
        throw new Error('useHitUI must be used within a HitUIProvider');
    }
    return context;
}
export function useCustomWidgets() {
    return useContext(CustomWidgetsContext);
}
export function useCustomWidget(name) {
    const widgets = useCustomWidgets();
    return widgets[name] || null;
}
export function HitUIProvider({ apiBase, children, customWidgets = {}, onNavigate, onCustomAction, }) {
    const [modals, setModals] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useCallback((path, newTab = false) => {
        if (onNavigate) {
            onNavigate(path, newTab);
        }
        else if (newTab) {
            window.open(path, '_blank');
        }
        else {
            window.location.href = path;
        }
    }, [onNavigate]);
    const openModal = useCallback((spec) => {
        setModals((prev) => [...prev, spec]);
    }, []);
    const closeModal = useCallback(() => {
        setModals((prev) => prev.slice(0, -1));
    }, []);
    const refresh = useCallback((targetId) => {
        // For now, refresh everything. Could be optimized later.
        setRefreshKey((k) => k + 1);
    }, []);
    const interpolate = useCallback((template, data) => {
        return template.replace(/\{(\w+)\}/g, (_, key) => {
            const value = data[key];
            return value !== undefined ? String(value) : `{${key}}`;
        });
    }, []);
    const executeAction = useCallback(async (action, context = {}) => {
        switch (action.type) {
            case 'navigate': {
                const path = interpolate(action.to, context);
                navigate(path, action.newTab);
                break;
            }
            case 'api': {
                if (action.confirm) {
                    const confirmed = window.confirm(action.confirm);
                    if (!confirmed)
                        return;
                }
                const endpoint = interpolate(action.endpoint, context);
                const url = endpoint.startsWith('http')
                    ? endpoint
                    : `${apiBase}${endpoint}`;
                try {
                    const response = await uiFetch(url, {
                        method: action.method,
                        headers: { 'Content-Type': 'application/json' },
                        body: action.body ? JSON.stringify(action.body) : undefined,
                    });
                    if (!response.ok) {
                        const error = await response.json().catch(() => ({}));
                        throw new Error(error.detail || response.statusText);
                    }
                    if (action.onSuccess) {
                        await executeAction(action.onSuccess, context);
                    }
                }
                catch (error) {
                    console.error('API action failed:', error);
                    if (action.onError) {
                        await executeAction(action.onError, context);
                    }
                }
                break;
            }
            case 'submit': {
                // Form submission is handled by the Form component
                break;
            }
            case 'openModal': {
                if (typeof action.modal === 'string') {
                    // Modal ID - would need a registry
                    console.warn('Modal by ID not yet supported');
                }
                else {
                    openModal(action.modal);
                }
                break;
            }
            case 'closeModal': {
                closeModal();
                break;
            }
            case 'refresh': {
                if (action.targets && action.targets.length > 0) {
                    action.targets.forEach((t) => refresh(t));
                }
                else {
                    refresh();
                }
                break;
            }
            case 'custom': {
                if (onCustomAction) {
                    onCustomAction(action.name, action.payload);
                }
                else {
                    console.warn(`Custom action "${action.name}" not handled`);
                }
                break;
            }
        }
    }, [apiBase, navigate, openModal, closeModal, refresh, interpolate, onCustomAction]);
    const contextValue = {
        apiBase,
        executeAction,
        refresh,
        openModal,
        closeModal,
        navigate,
    };
    return (_jsx(HitUIContextInternal.Provider, { value: contextValue, children: _jsxs(CustomWidgetsContext.Provider, { value: customWidgets, children: [children, modals.map((modalSpec, index) => (_jsx(ModalPortal, { spec: modalSpec, onClose: closeModal }, index)))] }) }, refreshKey));
}
// Simple modal portal - will be replaced by actual Modal component
function ModalPortal({ spec, onClose, }) {
    // This is a placeholder - the actual Modal component will handle rendering
    return null;
}
