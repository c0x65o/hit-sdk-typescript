import { HitClient } from './client.js';
import { getServiceUrl, getNamespace, getApiKey } from './config.js';
export class EmailClient {
    constructor(options = {}) {
        this.client = new HitClient({
            baseUrl: options.baseUrl || getServiceUrl('email'),
            namespace: options.namespace || getNamespace(),
            apiKey: options.apiKey || getApiKey('email') || undefined,
            timeout: options.timeout ?? 15000,
        });
    }
    async send(payload) {
        return this.client.post('/send', payload);
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
        defaultClient = new EmailClient();
    }
    return defaultClient;
}
export async function sendEmail(payload) {
    return getDefaultClient().send(payload);
}
// Lazy proxy that creates the client on first property access
// This ensures env vars are available when the client is actually used
const lazyEmail = {
    send: (payload) => getDefaultClient().send(payload),
    config: () => getDefaultClient().config(),
    features: () => getDefaultClient().features(),
};
// Export lazy singleton - client is created on first method call, not at import time
export const email = lazyEmail;
