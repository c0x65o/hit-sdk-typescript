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
      apiKey: options.apiKey || getApiKey('email'),
      timeout: options.timeout ?? 15000,
    });
  }

  async send(payload: SendEmailPayload): Promise<EmailResponse> {
    return this.client.post<EmailResponse>('/send', payload);
  }

  async config(): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>('/config');
  }
}

let defaultClient: EmailClient | null = null;

function getDefaultClient(): EmailClient {
  if (!defaultClient) {
    defaultClient = new EmailClient();
  }
  return defaultClient;
}

export async function sendEmail(payload: SendEmailPayload): Promise<EmailResponse> {
  return getDefaultClient().send(payload);
}

export const email = getDefaultClient();

