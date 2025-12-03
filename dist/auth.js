import { HitClient } from './client.js';
import { getServiceUrl, getNamespace, getApiKey } from './config.js';
export class AuthClient {
    constructor(options = {}) {
        this.client = new HitClient({
            baseUrl: options.baseUrl || getServiceUrl('auth'),
            namespace: options.namespace || getNamespace(),
            apiKey: options.apiKey || getApiKey('auth') || undefined,
            timeout: options.timeout ?? 15000,
        });
    }
    async register(email, password) {
        return this.client.post('/register', { email, password });
    }
    async login(email, password, twoFactorCode) {
        return this.client.post('/login', {
            email,
            password,
            two_factor_code: twoFactorCode,
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
        return this.client.post('/oauth/callback', {
            provider,
            oauth_code: oauthCode,
        });
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
export async function register(email, password) {
    return getClient().register(email, password);
}
export async function login(email, password, twoFactorCode) {
    return getClient().login(email, password, twoFactorCode);
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
    return getClient().oauthCallback(provider, oauthCode);
}
export async function config() {
    return getClient().config();
}
export async function features() {
    return getClient().features();
}
// Fresh client proxy - creates a new client for each call
const authProxy = {
    register: (email, password) => getClient().register(email, password),
    login: (email, password, twoFactorCode) => getClient().login(email, password, twoFactorCode),
    verifyEmail: (email, code) => getClient().verifyEmail(email, code),
    enableTwoFactor: (email) => getClient().enableTwoFactor(email),
    verifyTwoFactor: (email, code) => getClient().verifyTwoFactor(email, code),
    oauthUrl: (provider) => getClient().oauthUrl(provider),
    oauthCallback: (provider, oauthCode) => getClient().oauthCallback(provider, oauthCode),
    config: () => getClient().config(),
    features: () => getClient().features(),
};
// Export proxy - fresh client created for each method call
export const auth = authProxy;
