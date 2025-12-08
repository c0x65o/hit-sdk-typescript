/**
 * HIT App Provider
 *
 * Top-level provider for HIT applications that exposes platform context
 * including module URLs, feature pack configuration, and theme.
 *
 * This provider reads from environment variables and optionally parses
 * JWT token claims to provide context to the entire app.
 */
import React from 'react';
/**
 * Theme configuration
 */
export interface HitTheme {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    borderRadius?: string;
}
/**
 * Feature pack claim from token
 */
export interface FeaturePackClaim {
    version: string;
    options: Record<string, unknown>;
    mount_base?: string;
}
/**
 * User information from token
 */
export interface HitUser {
    id: string;
    email?: string;
    roles: string[];
}
/**
 * HIT Platform context
 */
export interface HitContext {
    /** Module URLs for SDK calls */
    moduleUrls: Record<string, string>;
    /** Feature packs enabled for this app */
    featurePacks: Record<string, FeaturePackClaim>;
    /** Project theme */
    theme: HitTheme;
    /** Current user (if authenticated) */
    user: HitUser | null;
    /** Project identifier */
    projectSlug: string;
    /** Environment (dev, staging, prod) */
    environment: string;
    /** Check if a feature pack is enabled */
    hasFeaturePack: (name: string) => boolean;
    /** Get options for a feature pack */
    getPackOptions: <T = Record<string, unknown>>(name: string) => T | undefined;
}
/**
 * Hook to access HIT platform context
 */
export declare function useHit(): HitContext;
/**
 * Hook to check if user has a specific role
 */
export declare function useHitRole(role: string): boolean;
/**
 * Hook to check if user has any of the specified roles
 */
export declare function useHitRoles(roles: string[]): boolean;
/**
 * Hook to get a module URL
 */
export declare function useModuleUrl(module: string): string | undefined;
export interface HitProviderProps {
    children: React.ReactNode;
    /**
     * Override module URLs (for testing or custom setups)
     */
    moduleUrls?: Record<string, string>;
    /**
     * Override theme (merged with env/token theme)
     */
    theme?: Partial<HitTheme>;
    /**
     * JWT token to parse for claims (optional, will use env if not provided)
     */
    token?: string;
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
export declare function HitProvider({ children, moduleUrls: moduleUrlsOverride, theme: themeOverride, token, }: HitProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=provider.d.ts.map