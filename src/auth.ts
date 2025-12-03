import { HitClient, HitClientOptions } from './client.js';
import { getServiceUrl, getNamespace, getApiKey } from './config.js';

export interface AuthTokenResponse {
  token: string;
  email_verified: boolean;
  two_factor_required?: boolean;
}

export interface FeatureConfig {
  features: {
    email_verification: boolean;
    two_factor_auth: boolean;
    password_login: boolean;
    oauth_providers: string[];
  };
}

export class AuthClient {
  private client: HitClient;

  constructor(options: HitClientOptions = {}) {
    this.client = new HitClient({
      baseUrl: options.baseUrl || getServiceUrl('auth'),
      namespace: options.namespace || getNamespace(),
      apiKey: options.apiKey || getApiKey('auth') || undefined,
      timeout: options.timeout ?? 15000,
    });
  }

  async register(email: string, password: string): Promise<AuthTokenResponse> {
    return this.client.post<AuthTokenResponse>('/register', { email, password });
  }

  async login(
    email: string,
    password?: string,
    twoFactorCode?: string,
  ): Promise<AuthTokenResponse> {
    return this.client.post<AuthTokenResponse>('/login', {
      email,
      password,
      two_factor_code: twoFactorCode,
    });
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
    return this.client.post<AuthTokenResponse>('/oauth/callback', {
      provider,
      oauth_code: oauthCode,
    });
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

export async function register(email: string, password: string): Promise<AuthTokenResponse> {
  return getClient().register(email, password);
}

export async function login(
  email: string,
  password?: string,
  twoFactorCode?: string,
): Promise<AuthTokenResponse> {
  return getClient().login(email, password, twoFactorCode);
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
  return getClient().oauthCallback(provider, oauthCode);
}

export async function config(): Promise<FeatureConfig> {
  return getClient().config();
}

export async function features(): Promise<FeatureConfig> {
  return getClient().features();
}

// Fresh client proxy - creates a new client for each call
const authProxy = {
  register: (email: string, password: string) => getClient().register(email, password),
  login: (email: string, password?: string, twoFactorCode?: string) => 
    getClient().login(email, password, twoFactorCode),
  verifyEmail: (email: string, code: string) => getClient().verifyEmail(email, code),
  enableTwoFactor: (email: string) => getClient().enableTwoFactor(email),
  verifyTwoFactor: (email: string, code: string) => getClient().verifyTwoFactor(email, code),
  oauthUrl: (provider: string) => getClient().oauthUrl(provider),
  oauthCallback: (provider: string, oauthCode: string) => 
    getClient().oauthCallback(provider, oauthCode),
  config: () => getClient().config(),
  features: () => getClient().features(),
};

// Export proxy - fresh client created for each method call
export const auth = authProxy;

