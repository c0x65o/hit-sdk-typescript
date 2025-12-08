import { jsx as _jsx } from "react/jsx-runtime";
/**
 * HIT App Provider
 *
 * Top-level provider for HIT applications that exposes platform context
 * including module URLs, feature pack configuration, and theme.
 *
 * This provider reads from environment variables and optionally parses
 * JWT token claims to provide context to the entire app.
 */
import { createContext, useContext, useMemo, useEffect, useState } from 'react';
const HitContextInternal = createContext(null);
/**
 * Hook to access HIT platform context
 */
export function useHit() {
    const context = useContext(HitContextInternal);
    if (!context) {
        throw new Error('useHit must be used within a HitProvider');
    }
    return context;
}
/**
 * Hook to check if user has a specific role
 */
export function useHitRole(role) {
    const { user } = useHit();
    return user?.roles.includes(role) ?? false;
}
/**
 * Hook to check if user has any of the specified roles
 */
export function useHitRoles(roles) {
    const { user } = useHit();
    if (!user)
        return false;
    return roles.some((role) => user.roles.includes(role));
}
/**
 * Hook to get a module URL
 */
export function useModuleUrl(module) {
    const { moduleUrls } = useHit();
    return moduleUrls[module];
}
/**
 * HIT Platform Provider
 *
 * Provides platform context to the entire application.
 * Reads from environment variables and optionally JWT token.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { HitProvider } from '@hit/sdk';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <HitProvider>
 *           {children}
 *         </HitProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function HitProvider({ children, moduleUrls: moduleUrlsOverride, theme: themeOverride, token, }) {
    const [parsedToken, setParsedToken] = useState(null);
    // Parse token on mount (if provided)
    useEffect(() => {
        if (token) {
            try {
                const parsed = parseJWTClaims(token);
                setParsedToken(parsed);
            }
            catch (e) {
                console.warn('Failed to parse HIT token:', e);
            }
        }
    }, [token]);
    const context = useMemo(() => {
        // Read from environment variables
        const envModuleUrls = getEnvModuleUrls();
        const envTheme = getEnvTheme();
        const envFeaturePacks = getEnvFeaturePacks();
        // Merge with overrides and token claims
        const moduleUrls = {
            ...envModuleUrls,
            ...parsedToken?.moduleUrls,
            ...moduleUrlsOverride,
        };
        const featurePacks = {
            ...envFeaturePacks,
            ...parsedToken?.featurePacks,
        };
        const theme = {
            mode: 'dark',
            primaryColor: '#3b82f6',
            ...envTheme,
            ...parsedToken?.theme,
            ...themeOverride,
        };
        const uiRenderUrl = moduleUrls['ui-render'] ||
            moduleUrls['ui_render'] ||
            process.env.NEXT_PUBLIC_HIT_UI_RENDER_URL ||
            process.env.HIT_UI_RENDER_URL ||
            '/api/ui'; // Default to proxy route
        const projectSlug = parsedToken?.projectSlug ||
            process.env.NEXT_PUBLIC_HIT_PROJECT_SLUG ||
            process.env.HIT_PROJECT_SLUG ||
            'unknown';
        const environment = process.env.NEXT_PUBLIC_HIT_ENV ||
            process.env.HIT_ENV ||
            process.env.NODE_ENV ||
            'development';
        return {
            moduleUrls,
            uiRenderUrl,
            featurePacks,
            theme,
            user: parsedToken?.user || null,
            projectSlug,
            environment,
            hasFeaturePack: (name) => name in featurePacks,
            getPackOptions: (name) => featurePacks[name]?.options,
        };
    }, [moduleUrlsOverride, themeOverride, parsedToken]);
    return (_jsx(HitContextInternal.Provider, { value: context, children: children }));
}
/**
 * Parse JWT token claims
 */
function parseJWTClaims(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
    }
    // Decode payload (second part)
    const payload = JSON.parse(typeof atob !== 'undefined'
        ? atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        : Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return {
        featurePacks: payload.feature_packs || {},
        moduleUrls: payload.module_urls || {},
        theme: payload.project_theme || {},
        user: payload.sub
            ? {
                id: payload.sub,
                email: payload.email,
                roles: payload.roles || [],
            }
            : null,
        projectSlug: payload.project_slug || '',
    };
}
/**
 * Read module URLs from environment variables
 */
function getEnvModuleUrls() {
    const urls = {};
    // Check common module env vars
    const modules = ['auth', 'email', 'events', 'ping-pong', 'ui-render'];
    for (const module of modules) {
        const envKey = `HIT_${module.toUpperCase().replace(/-/g, '_')}_URL`;
        const publicEnvKey = `NEXT_PUBLIC_${envKey}`;
        const url = (typeof process !== 'undefined' && process.env?.[publicEnvKey]) ||
            (typeof process !== 'undefined' && process.env?.[envKey]);
        if (url) {
            urls[module] = url;
        }
    }
    return urls;
}
/**
 * Read theme from environment variables
 */
function getEnvTheme() {
    const theme = {};
    const mode = process.env.NEXT_PUBLIC_HIT_THEME_MODE || process.env.HIT_THEME_MODE;
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
        theme.mode = mode;
    }
    const primaryColor = process.env.NEXT_PUBLIC_HIT_PRIMARY_COLOR || process.env.HIT_PRIMARY_COLOR;
    if (primaryColor) {
        theme.primaryColor = primaryColor;
    }
    return theme;
}
/**
 * Read feature packs from environment variables (JSON format)
 */
function getEnvFeaturePacks() {
    const packsJson = process.env.NEXT_PUBLIC_HIT_FEATURE_PACKS || process.env.HIT_FEATURE_PACKS;
    if (packsJson) {
        try {
            return JSON.parse(packsJson);
        }
        catch {
            console.warn('Failed to parse HIT_FEATURE_PACKS env var');
        }
    }
    return {};
}
