import { HitClient, HitClientOptions } from './client.js';
import { getServiceUrl, getNamespace, getApiKey } from './config.js';

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template_id?: string;
  template_variables?: Record<string, unknown>;
  from_email?: string;
}

export interface EmailResponse {
  status: string;
  provider_message_id?: string;
  dry_run?: boolean;
}

export class EmailClient {
  private client: HitClient;

  constructor(options: HitClientOptions = {}) {
    this.client = new HitClient({
      baseUrl: options.baseUrl || getServiceUrl('email'),
      namespace: options.namespace || getNamespace(),
      apiKey: options.apiKey || getApiKey('email') || undefined,
      timeout: options.timeout ?? 15000,
    });
  }

  async send(payload: SendEmailPayload): Promise<EmailResponse> {
    return this.client.post<EmailResponse>('/send', payload);
  }

  async config(): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>('/config');
  }

  async features(): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>('/features');
  }
}

// Create a fresh client for each call to ensure env vars are always current
function getClient(): EmailClient {
  return new EmailClient();
}

export async function sendEmail(payload: SendEmailPayload): Promise<EmailResponse> {
  return getClient().send(payload);
}

// Fresh client proxy - creates a new client for each call
const emailProxy = {
  send: (payload: SendEmailPayload) => getClient().send(payload),
  config: () => getClient().config(),
  features: () => getClient().features(),
};

// Export proxy - fresh client created for each method call
export const email = emailProxy;

