import { HitClientOptions } from './client.js';
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
export declare class EmailClient {
    private client;
    constructor(options?: HitClientOptions);
    send(payload: SendEmailPayload): Promise<EmailResponse>;
    config(): Promise<Record<string, unknown>>;
    features(): Promise<Record<string, unknown>>;
}
export declare function sendEmail(payload: SendEmailPayload): Promise<EmailResponse>;
export declare const email: {
    send: (payload: SendEmailPayload) => Promise<EmailResponse>;
    config: () => Promise<Record<string, unknown>>;
    features: () => Promise<Record<string, unknown>>;
};
//# sourceMappingURL=email.d.ts.map