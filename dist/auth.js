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
let defaultClient = null;
function getDefaultClient() {
    if (!defaultClient) {
        defaultClient = new AuthClient();
    }
    return defaultClient;
}
export async function register(email, password) {
    return getDefaultClient().register(email, password);
}
export async function login(email, password, twoFactorCode) {
    return getDefaultClient().login(email, password, twoFactorCode);
}
export async function verifyEmail(email, code) {
    return getDefaultClient().verifyEmail(email, code);
}
export async function enableTwoFactor(email) {
    return getDefaultClient().enableTwoFactor(email);
}
export async function verifyTwoFactor(email, code) {
    return getDefaultClient().verifyTwoFactor(email, code);
}
export async function oauthUrl(provider) {
    return getDefaultClient().oauthUrl(provider);
}
export async function oauthCallback(provider, oauthCode) {
    return getDefaultClient().oauthCallback(provider, oauthCode);
}
export async function config() {
    return getDefaultClient().config();
}
export async function features() {
    return getDefaultClient().features();
}
export const auth = getDefaultClient();
