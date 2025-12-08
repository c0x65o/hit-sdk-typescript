/**
 * HIT App Provider
 *
 * Top-level provider for HIT applications that exposes platform context
 * including module URLs, feature pack configuration, and theme.
 *
 * This provider reads from environment variables and optionally parses
 * JWT token claims to provide context to the entire app.
 */

import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';

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

const HitContextInternal = createContext<HitContext | null>(null);

/**
 * Hook to access HIT platform context
 */
export function useHit(): HitContext {
  const context = useContext(HitContextInternal);
  if (!context) {
    throw new Error('useHit must be used within a HitProvider');
  }
  return context;
}

/**
 * Hook to check if user has a specific role
 */
export function useHitRole(role: string): boolean {
  const { user } = useHit();
  return user?.roles.includes(role) ?? false;
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHitRoles(roles: string[]): boolean {
  const { user } = useHit();
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

/**
 * Hook to get a module URL
 */
export function useModuleUrl(module: string): string | undefined {
  const { moduleUrls } = useHit();
  return moduleUrls[module];
}

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
export function HitProvider({
  children,
  moduleUrls: moduleUrlsOverride,
  theme: themeOverride,
  token,
}: HitProviderProps) {
  const [parsedToken, setParsedToken] = useState<{
    featurePacks: Record<string, FeaturePackClaim>;
    moduleUrls: Record<string, string>;
    theme: Partial<HitTheme>;
    user: HitUser | null;
    projectSlug: string;
  } | null>(null);

  // Parse token on mount (if provided)
  useEffect(() => {
    if (token) {
      try {
        const parsed = parseJWTClaims(token);
        setParsedToken(parsed);
      } catch (e) {
        console.warn('Failed to parse HIT token:', e);
      }
    }
  }, [token]);

  const context = useMemo<HitContext>(() => {
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

    const theme: HitTheme = {
      mode: 'dark',
      primaryColor: '#3b82f6',
      ...envTheme,
      ...parsedToken?.theme,
      ...themeOverride,
    };

    const projectSlug =
      parsedToken?.projectSlug ||
      process.env.NEXT_PUBLIC_HIT_PROJECT_SLUG ||
      process.env.HIT_PROJECT_SLUG ||
      'unknown';

    const environment =
      process.env.NEXT_PUBLIC_HIT_ENV ||
      process.env.HIT_ENV ||
      process.env.NODE_ENV ||
      'development';

    return {
      moduleUrls,
      featurePacks,
      theme,
      user: parsedToken?.user || null,
      projectSlug,
      environment,
      hasFeaturePack: (name: string) => name in featurePacks,
      getPackOptions: <T = Record<string, unknown>>(name: string) =>
        featurePacks[name]?.options as T | undefined,
    };
  }, [moduleUrlsOverride, themeOverride, parsedToken]);

  return (
    <HitContextInternal.Provider value={context}>
      {children}
    </HitContextInternal.Provider>
  );
}

/**
 * Parse JWT token claims
 */
function parseJWTClaims(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  // Decode payload (second part)
  const payload = JSON.parse(
    typeof atob !== 'undefined'
      ? atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      : Buffer.from(parts[1], 'base64url').toString('utf-8')
  );

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
function getEnvModuleUrls(): Record<string, string> {
  const urls: Record<string, string> = {};

  // Check common module env vars
  const modules = ['auth', 'email', 'events', 'ping-pong'];

  for (const module of modules) {
    const envKey = `HIT_${module.toUpperCase().replace(/-/g, '_')}_URL`;
    const publicEnvKey = `NEXT_PUBLIC_${envKey}`;

    const url =
      (typeof process !== 'undefined' && process.env?.[publicEnvKey]) ||
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
function getEnvTheme(): Partial<HitTheme> {
  const theme: Partial<HitTheme> = {};

  const mode = process.env.NEXT_PUBLIC_HIT_THEME_MODE || process.env.HIT_THEME_MODE;
  if (mode === 'light' || mode === 'dark' || mode === 'system') {
    theme.mode = mode;
  }

  const primaryColor =
    process.env.NEXT_PUBLIC_HIT_PRIMARY_COLOR || process.env.HIT_PRIMARY_COLOR;
  if (primaryColor) {
    theme.primaryColor = primaryColor;
  }

  return theme;
}

/**
 * Read feature packs from environment variables (JSON format)
 */
function getEnvFeaturePacks(): Record<string, FeaturePackClaim> {
  const packsJson =
    process.env.NEXT_PUBLIC_HIT_FEATURE_PACKS || process.env.HIT_FEATURE_PACKS;

  if (packsJson) {
    try {
      return JSON.parse(packsJson);
    } catch {
      console.warn('Failed to parse HIT_FEATURE_PACKS env var');
    }
  }

  return {};
}
