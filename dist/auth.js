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
import { HitClient } from './client.js';
import { getServiceUrl, getNamespace, getApiKey } from './config.js';
/**
 * Browser localStorage token storage.
 */
class LocalStorageTokenStorage {
    constructor() {
        this.prefix = 'hit_auth_';
    }
    get(key) {
        if (typeof localStorage === 'undefined')
            return null;
        return localStorage.getItem(this.prefix + key);
    }
    set(key, value) {
        if (typeof localStorage === 'undefined')
            return;
        localStorage.setItem(this.prefix + key, value);
    }
    remove(key) {
        if (typeof localStorage === 'undefined')
            return;
        localStorage.removeItem(this.prefix + key);
    }
}
/**
 * In-memory token storage (for SSR/testing).
 */
class MemoryTokenStorage {
    constructor() {
        this.store = {};
    }
    get(key) {
        return this.store[key] ?? null;
    }
    set(key, value) {
        this.store[key] = value;
    }
    remove(key) {
        delete this.store[key];
    }
}
export class AuthClient {
    constructor(options = {}) {
        this.client = new HitClient({
            baseUrl: options.baseUrl || getServiceUrl('auth'),
            namespace: options.namespace || getNamespace(),
            apiKey: options.apiKey || getApiKey('auth') || undefined,
            timeout: options.timeout ?? 15000,
        });
        // Use localStorage in browser, memory in Node
        this.tokenStorage = options.tokenStorage ??
            (typeof localStorage !== 'undefined' ? new LocalStorageTokenStorage() : new MemoryTokenStorage());
    }
    /**
     * Get stored access token.
     */
    getToken() {
        return this.tokenStorage.get('token');
    }
    /**
     * Get stored refresh token.
     */
    getRefreshToken() {
        return this.tokenStorage.get('refresh_token');
    }
    /**
     * Store access and refresh tokens.
     */
    setTokens(token, refreshToken) {
        this.tokenStorage.set('token', token);
        if (refreshToken) {
            this.tokenStorage.set('refresh_token', refreshToken);
        }
    }
    /**
     * Clear stored tokens.
     */
    clearTokens() {
        this.tokenStorage.remove('token');
        this.tokenStorage.remove('refresh_token');
    }
    /**
     * Check if user is authenticated (has token).
     */
    isAuthenticated() {
        return !!this.getToken();
    }
    async register(email, password) {
        const response = await this.client.post('/register', { email, password });
        // Auto-store tokens
        if (response.token) {
            this.setTokens(response.token, response.refresh_token);
        }
        return response;
    }
    async login(email, password, twoFactorCode) {
        const response = await this.client.post('/login', {
            email,
            password,
            two_factor_code: twoFactorCode,
        });
        // Auto-store tokens
        if (response.token) {
            this.setTokens(response.token, response.refresh_token);
        }
        return response;
    }
    /**
     * Refresh access token using stored refresh token.
     */
    async refresh(refreshToken) {
        const token = refreshToken ?? this.getRefreshToken();
        if (!token) {
            throw new Error('No refresh token available');
        }
        const response = await this.client.post('/refresh', {
            refresh_token: token,
        });
        // Update stored tokens
        if (response.token) {
            this.setTokens(response.token, response.refresh_token);
        }
        return response;
    }
    /**
     * Logout and revoke refresh token.
     */
    async logout() {
        const refreshToken = this.getRefreshToken();
        const response = await this.client.post('/logout', {
            refresh_token: refreshToken,
        });
        this.clearTokens();
        return response;
    }
    /**
     * Logout from all sessions.
     */
    async logoutAll() {
        const token = this.getToken();
        if (!token) {
            throw new Error('No access token available');
        }
        const response = await this.client.post('/logout-all', {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        this.clearTokens();
        return response;
    }
    /**
     * Validate a token (for server-side use).
     */
    async validate(token) {
        const tokenToValidate = token ?? this.getToken();
        if (!tokenToValidate) {
            return { valid: false, error: 'No token provided' };
        }
        return this.client.post('/validate', { token: tokenToValidate });
    }
    /**
     * Get current user profile.
     */
    async getMe() {
        const token = this.getToken();
        if (!token) {
            throw new Error('No access token available');
        }
        return this.client.get('/me', {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
    async verifyEmail(email, code) {
        return this.client.post('/verify-email', { email, code });
    }
    async enableTwoFactor(email) {
        return this.client.post('/enable-2fa', { email });
    }
    async verifyTwoFactor(email, code) {
        return this.client.post('/verify-2fa', { email, code });
    }
    async oauthUrl(provider) {
        return this.client.post('/oauth/url', { provider });
    }
    async oauthCallback(provider, oauthCode) {
        const response = await this.client.post('/oauth/callback', {
            provider,
            oauth_code: oauthCode,
        });
        // Auto-store tokens
        if (response.token) {
            this.setTokens(response.token, response.refresh_token);
        }
        return response;
    }
    async config() {
        return this.client.get('/config');
    }
    async features() {
        return this.client.get('/features');
    }
}
// Create a fresh client for each call to ensure env vars are always current
function getClient() {
    return new AuthClient();
}
// Singleton for token storage persistence
let _persistentClient = null;
/**
 * Get a persistent auth client that maintains token state.
 * Use this in browser applications for automatic token management.
 */
export function getAuthClient() {
    if (!_persistentClient) {
        _persistentClient = new AuthClient();
    }
    return _persistentClient;
}
export async function register(email, password) {
    return getAuthClient().register(email, password);
}
export async function login(email, password, twoFactorCode) {
    return getAuthClient().login(email, password, twoFactorCode);
}
export async function refresh(refreshToken) {
    return getAuthClient().refresh(refreshToken);
}
export async function logout() {
    return getAuthClient().logout();
}
export async function logoutAll() {
    return getAuthClient().logoutAll();
}
export async function validate(token) {
    return getAuthClient().validate(token);
}
export async function getMe() {
    return getAuthClient().getMe();
}
export async function verifyEmail(email, code) {
    return getClient().verifyEmail(email, code);
}
export async function enableTwoFactor(email) {
    return getClient().enableTwoFactor(email);
}
export async function verifyTwoFactor(email, code) {
    return getClient().verifyTwoFactor(email, code);
}
export async function oauthUrl(provider) {
    return getClient().oauthUrl(provider);
}
export async function oauthCallback(provider, oauthCode) {
    return getAuthClient().oauthCallback(provider, oauthCode);
}
export async function config() {
    return getClient().config();
}
export async function features() {
    return getClient().features();
}
/**
 * Check if user is authenticated.
 */
export function isAuthenticated() {
    return getAuthClient().isAuthenticated();
}
/**
 * Get stored access token.
 */
export function getToken() {
    return getAuthClient().getToken();
}
/**
 * Set tokens (for manual token management).
 */
export function setTokens(token, refreshToken) {
    getAuthClient().setTokens(token, refreshToken);
}
/**
 * Clear stored tokens.
 */
export function clearTokens() {
    getAuthClient().clearTokens();
}
// Fresh client proxy - creates a new client for each call
// Uses persistent client for token-related operations
const authProxy = {
    register,
    login,
    refresh,
    logout,
    logoutAll,
    validate,
    getMe,
    verifyEmail,
    enableTwoFactor,
    verifyTwoFactor,
    oauthUrl,
    oauthCallback,
    config,
    features,
    isAuthenticated,
    getToken,
    setTokens,
    clearTokens,
    getAuthClient,
};
// Export proxy - fresh client created for each method call
export const auth = authProxy;
