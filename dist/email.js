import { HitClient } from './client.js';
import { getServiceUrl, getNamespace, getApiKey } from './config.js';
/**
 * Get EMAIL_DEFAULT_FROM from environment if available.
 * Works in Node.js and Next.js server-side environments.
 */
function getDefaultFrom() {
    if (typeof process !== 'undefined' && process.env) {
        return process.env.EMAIL_DEFAULT_FROM;
    }
    return undefined;
}
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
        // Auto-provide from_email from EMAIL_DEFAULT_FROM env if not specified
        const enrichedPayload = { ...payload };
        if (!enrichedPayload.from_email) {
            const defaultFrom = getDefaultFrom();
            if (defaultFrom) {
                enrichedPayload.from_email = defaultFrom;
            }
        }
        return this.client.post('/send', enrichedPayload);
    }
    async config() {
        const moduleConfig = await this.client.get('/config');
        // Enrich with local environment config if available
        const localDefaultFrom = getDefaultFrom();
        if (localDefaultFrom) {
            // Local env takes precedence (it's already calculated with correct domain)
            moduleConfig.default_from = localDefaultFrom;
        }
        return moduleConfig;
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
