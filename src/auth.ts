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
      apiKey: options.apiKey || getApiKey('auth'),
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

  async features(): Promise<FeatureConfig> {
    return this.client.get<FeatureConfig>('/config');
  }
}

let defaultClient: AuthClient | null = null;

function getDefaultClient(): AuthClient {
  if (!defaultClient) {
    defaultClient = new AuthClient();
  }
  return defaultClient;
}

export async function register(email: string, password: string): Promise<AuthTokenResponse> {
  return getDefaultClient().register(email, password);
}

export async function login(
  email: string,
  password?: string,
  twoFactorCode?: string,
): Promise<AuthTokenResponse> {
  return getDefaultClient().login(email, password, twoFactorCode);
}

export const auth = getDefaultClient();

