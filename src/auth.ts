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

import { HitClient, HitClientOptions } from './client.js';
import { getServiceUrl, getNamespace, getApiKey } from './config.js';

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

/**
 * Browser localStorage token storage.
 */
class LocalStorageTokenStorage implements TokenStorage {
  private prefix = 'hit_auth_';
  
  get(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.prefix + key);
  }
  
  set(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.prefix + key, value);
  }
  
  remove(key: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }
}

/**
 * In-memory token storage (for SSR/testing).
 */
class MemoryTokenStorage implements TokenStorage {
  private store: Record<string, string> = {};
  
  get(key: string): string | null {
    return this.store[key] ?? null;
  }
  
  set(key: string, value: string): void {
    this.store[key] = value;
  }
  
  remove(key: string): void {
    delete this.store[key];
  }
}

export class AuthClient {
  private client: HitClient;
  private tokenStorage: TokenStorage;

  constructor(options: HitClientOptions & { tokenStorage?: TokenStorage } = {}) {
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
  getToken(): string | null {
    return this.tokenStorage.get('token');
  }

  /**
   * Get stored refresh token.
   */
  getRefreshToken(): string | null {
    return this.tokenStorage.get('refresh_token');
  }

  /**
   * Store access and refresh tokens.
   */
  setTokens(token: string, refreshToken?: string): void {
    this.tokenStorage.set('token', token);
    if (refreshToken) {
      this.tokenStorage.set('refresh_token', refreshToken);
    }
  }

  /**
   * Clear stored tokens.
   */
  clearTokens(): void {
    this.tokenStorage.remove('token');
    this.tokenStorage.remove('refresh_token');
  }

  /**
   * Check if user is authenticated (has token).
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async register(email: string, password: string): Promise<AuthTokenResponse> {
    const response = await this.client.post<AuthTokenResponse>('/register', { email, password });
    // Auto-store tokens
    if (response.token) {
      this.setTokens(response.token, response.refresh_token);
    }
    return response;
  }

  async login(
    email: string,
    password?: string,
    twoFactorCode?: string,
  ): Promise<AuthTokenResponse> {
    const response = await this.client.post<AuthTokenResponse>('/login', {
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
  async refresh(refreshToken?: string): Promise<AuthTokenResponse> {
    const token = refreshToken ?? this.getRefreshToken();
    if (!token) {
      throw new Error('No refresh token available');
    }
    
    const response = await this.client.post<AuthTokenResponse>('/refresh', {
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
  async logout(): Promise<Record<string, unknown>> {
    const refreshToken = this.getRefreshToken();
    const response = await this.client.post<Record<string, unknown>>('/logout', {
      refresh_token: refreshToken,
    });
    this.clearTokens();
    return response;
  }

  /**
   * Logout from all sessions.
   */
  async logoutAll(): Promise<Record<string, unknown>> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No access token available');
    }
    
    const response = await this.client.post<Record<string, unknown>>('/logout-all', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    this.clearTokens();
    return response;
  }

  /**
   * Validate a token (for server-side use).
   */
  async validate(token?: string): Promise<ValidateResponse> {
    const tokenToValidate = token ?? this.getToken();
    if (!tokenToValidate) {
      return { valid: false, error: 'No token provided' };
    }
    return this.client.post<ValidateResponse>('/validate', { token: tokenToValidate });
  }

  /**
   * Get current user profile.
   */
  async getMe(): Promise<UserProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No access token available');
    }
    return this.client.get<UserProfile>('/me', {
      headers: { Authorization: `Bearer ${token}` },
    } as { headers: Record<string, string> });
  }

  async verifyEmail(email: string, code: string): Promise<Record<string, unknown>> {
    return this.client.post('/verify-email', { email, code });
  }

  async enableTwoFactor(email: string): Promise<Record<string, unknown>> {
    return this.client.post('/enable-2fa', { email });
  }

  async verifyTwoFactor(email: string, code: string): Promise<Record<string, unknown>> {
    return this.client.post('/verify-2fa', { email, code });
  }

  async oauthUrl(provider: string): Promise<Record<string, unknown>> {
    return this.client.post('/oauth/url', { provider });
  }

  async oauthCallback(provider: string, oauthCode: string): Promise<AuthTokenResponse> {
    const response = await this.client.post<AuthTokenResponse>('/oauth/callback', {
      provider,
      oauth_code: oauthCode,
    });
    // Auto-store tokens
    if (response.token) {
      this.setTokens(response.token, response.refresh_token);
    }
    return response;
  }

  async config(): Promise<FeatureConfig> {
    return this.client.get<FeatureConfig>('/config');
  }

  async features(): Promise<FeatureConfig> {
    return this.client.get<FeatureConfig>('/features');
  }
}

// Create a fresh client for each call to ensure env vars are always current
function getClient(): AuthClient {
  return new AuthClient();
}

// Singleton for token storage persistence
let _persistentClient: AuthClient | null = null;

/**
 * Get a persistent auth client that maintains token state.
 * Use this in browser applications for automatic token management.
 */
export function getAuthClient(): AuthClient {
  if (!_persistentClient) {
    _persistentClient = new AuthClient();
  }
  return _persistentClient;
}

export async function register(email: string, password: string): Promise<AuthTokenResponse> {
  return getAuthClient().register(email, password);
}

export async function login(
  email: string,
  password?: string,
  twoFactorCode?: string,
): Promise<AuthTokenResponse> {
  return getAuthClient().login(email, password, twoFactorCode);
}

export async function refresh(refreshToken?: string): Promise<AuthTokenResponse> {
  return getAuthClient().refresh(refreshToken);
}

export async function logout(): Promise<Record<string, unknown>> {
  return getAuthClient().logout();
}

export async function logoutAll(): Promise<Record<string, unknown>> {
  return getAuthClient().logoutAll();
}

export async function validate(token?: string): Promise<ValidateResponse> {
  return getAuthClient().validate(token);
}

export async function getMe(): Promise<UserProfile> {
  return getAuthClient().getMe();
}

export async function verifyEmail(email: string, code: string): Promise<Record<string, unknown>> {
  return getClient().verifyEmail(email, code);
}

export async function enableTwoFactor(email: string): Promise<Record<string, unknown>> {
  return getClient().enableTwoFactor(email);
}

export async function verifyTwoFactor(email: string, code: string): Promise<Record<string, unknown>> {
  return getClient().verifyTwoFactor(email, code);
}

export async function oauthUrl(provider: string): Promise<Record<string, unknown>> {
  return getClient().oauthUrl(provider);
}

export async function oauthCallback(provider: string, oauthCode: string): Promise<AuthTokenResponse> {
  return getAuthClient().oauthCallback(provider, oauthCode);
}

export async function config(): Promise<FeatureConfig> {
  return getClient().config();
}

export async function features(): Promise<FeatureConfig> {
  return getClient().features();
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(): boolean {
  return getAuthClient().isAuthenticated();
}

/**
 * Get stored access token.
 */
export function getToken(): string | null {
  return getAuthClient().getToken();
}

/**
 * Set tokens (for manual token management).
 */
export function setTokens(token: string, refreshToken?: string): void {
  getAuthClient().setTokens(token, refreshToken);
}

/**
 * Clear stored tokens.
 */
export function clearTokens(): void {
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
