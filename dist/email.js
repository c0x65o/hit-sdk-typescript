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
// Create a fresh client for each call to ensure env vars are always current
function getClient() {
    return new EmailClient();
}
export async function sendEmail(payload) {
    return getClient().send(payload);
}
// Fresh client proxy - creates a new client for each call
const emailProxy = {
    send: (payload) => getClient().send(payload),
    config: () => getClient().config(),
    features: () => getClient().features(),
};
// Export proxy - fresh client created for each method call
export const email = emailProxy;
