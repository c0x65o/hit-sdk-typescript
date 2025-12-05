/**
 * Auth module client for HIT SDK.
 *
 * Provides authentication for HIT applications:
 * - Password login with email verification
 * - OAuth providers (Google, Azure AD, GitHub)
 * - Two-factor authentication (TOTP, email)
 * - Session management with refresh tokens
 * - Token validation and storage
 *
 * @example
 * ```typescript
 * import { auth } from '@hit/sdk';
 *
 * // Register and login
 * const result = await auth.register('user@example.com', 'Password123');
 * auth.setTokens(result.token, result.refresh_token);
 *
 * // Get current user
 * const user = await auth.getMe();
 *
 * // Refresh token when access token expires
 * await auth.refresh();
 *
 * // Logout
 * await auth.logout();
 * ```
 */
import { HitClientOptions } from './client.js';
export interface AuthTokenResponse {
    token: string;
    refresh_token?: string;
    email_verified: boolean;
    two_factor_required?: boolean;
    expires_in?: number;
}
export interface FeatureConfig {
    features: {
        email_verification: boolean;
        two_factor_auth: boolean;
        password_login: boolean;
        oauth_providers: string[];
    };
}
export interface ValidateResponse {
    valid: boolean;
    claims?: Record<string, unknown>;
    error?: string;
}
export interface UserProfile {
    email: string;
    email_verified: boolean;
    two_factor_enabled: boolean;
    roles: string[];
    metadata: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}
export interface TokenStorage {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
}
export declare class AuthClient {
    private client;
    private tokenStorage;
    constructor(options?: HitClientOptions & {
        tokenStorage?: TokenStorage;
    });
    /**
     * Get stored access token.
     */
    getToken(): string | null;
    /**
     * Get stored refresh token.
     */
    getRefreshToken(): string | null;
    /**
     * Store access and refresh tokens.
     */
    setTokens(token: string, refreshToken?: string): void;
    /**
     * Clear stored tokens.
     */
    clearTokens(): void;
    /**
     * Check if user is authenticated (has token).
     */
    isAuthenticated(): boolean;
    register(email: string, password: string): Promise<AuthTokenResponse>;
    login(email: string, password?: string, twoFactorCode?: string): Promise<AuthTokenResponse>;
    /**
     * Refresh access token using stored refresh token.
     */
    refresh(refreshToken?: string): Promise<AuthTokenResponse>;
    /**
     * Logout and revoke refresh token.
     */
    logout(): Promise<Record<string, unknown>>;
    /**
     * Logout from all sessions.
     */
    logoutAll(): Promise<Record<string, unknown>>;
    /**
     * Validate a token (for server-side use).
     */
    validate(token?: string): Promise<ValidateResponse>;
    /**
     * Get current user profile.
     */
    getMe(): Promise<UserProfile>;
    verifyEmail(email: string, code: string): Promise<Record<string, unknown>>;
    enableTwoFactor(email: string): Promise<Record<string, unknown>>;
    verifyTwoFactor(email: string, code: string): Promise<Record<string, unknown>>;
    oauthUrl(provider: string): Promise<Record<string, unknown>>;
    oauthCallback(provider: string, oauthCode: string): Promise<AuthTokenResponse>;
    config(): Promise<FeatureConfig>;
    features(): Promise<FeatureConfig>;
}
/**
 * Get a persistent auth client that maintains token state.
 * Use this in browser applications for automatic token management.
 */
export declare function getAuthClient(): AuthClient;
export declare function register(email: string, password: string): Promise<AuthTokenResponse>;
export declare function login(email: string, password?: string, twoFactorCode?: string): Promise<AuthTokenResponse>;
export declare function refresh(refreshToken?: string): Promise<AuthTokenResponse>;
export declare function logout(): Promise<Record<string, unknown>>;
export declare function logoutAll(): Promise<Record<string, unknown>>;
export declare function validate(token?: string): Promise<ValidateResponse>;
export declare function getMe(): Promise<UserProfile>;
export declare function verifyEmail(email: string, code: string): Promise<Record<string, unknown>>;
export declare function enableTwoFactor(email: string): Promise<Record<string, unknown>>;
export declare function verifyTwoFactor(email: string, code: string): Promise<Record<string, unknown>>;
export declare function oauthUrl(provider: string): Promise<Record<string, unknown>>;
export declare function oauthCallback(provider: string, oauthCode: string): Promise<AuthTokenResponse>;
export declare function config(): Promise<FeatureConfig>;
export declare function features(): Promise<FeatureConfig>;
/**
 * Check if user is authenticated.
 */
export declare function isAuthenticated(): boolean;
/**
 * Get stored access token.
 */
export declare function getToken(): string | null;
/**
 * Set tokens (for manual token management).
 */
export declare function setTokens(token: string, refreshToken?: string): void;
/**
 * Clear stored tokens.
 */
export declare function clearTokens(): void;
export declare const auth: {
    register: typeof register;
    login: typeof login;
    refresh: typeof refresh;
    logout: typeof logout;
    logoutAll: typeof logoutAll;
    validate: typeof validate;
    getMe: typeof getMe;
    verifyEmail: typeof verifyEmail;
    enableTwoFactor: typeof enableTwoFactor;
    verifyTwoFactor: typeof verifyTwoFactor;
    oauthUrl: typeof oauthUrl;
    oauthCallback: typeof oauthCallback;
    config: typeof config;
    features: typeof features;
    isAuthenticated: typeof isAuthenticated;
    getToken: typeof getToken;
    setTokens: typeof setTokens;
    clearTokens: typeof clearTokens;
    getAuthClient: typeof getAuthClient;
};
//# sourceMappingURL=auth.d.ts.map