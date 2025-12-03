import { HitClientOptions } from './client.js';
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
export declare class AuthClient {
    private client;
    constructor(options?: HitClientOptions);
    register(email: string, password: string): Promise<AuthTokenResponse>;
    login(email: string, password?: string, twoFactorCode?: string): Promise<AuthTokenResponse>;
    verifyEmail(email: string, code: string): Promise<Record<string, unknown>>;
    enableTwoFactor(email: string): Promise<Record<string, unknown>>;
    verifyTwoFactor(email: string, code: string): Promise<Record<string, unknown>>;
    oauthUrl(provider: string): Promise<Record<string, unknown>>;
    oauthCallback(provider: string, oauthCode: string): Promise<AuthTokenResponse>;
    config(): Promise<FeatureConfig>;
    features(): Promise<FeatureConfig>;
}
export declare function register(email: string, password: string): Promise<AuthTokenResponse>;
export declare function login(email: string, password?: string, twoFactorCode?: string): Promise<AuthTokenResponse>;
export declare function verifyEmail(email: string, code: string): Promise<Record<string, unknown>>;
export declare function enableTwoFactor(email: string): Promise<Record<string, unknown>>;
export declare function verifyTwoFactor(email: string, code: string): Promise<Record<string, unknown>>;
export declare function oauthUrl(provider: string): Promise<Record<string, unknown>>;
export declare function oauthCallback(provider: string, oauthCode: string): Promise<AuthTokenResponse>;
export declare function config(): Promise<FeatureConfig>;
export declare function features(): Promise<FeatureConfig>;
export declare const auth: {
    register: (email: string, password: string) => Promise<AuthTokenResponse>;
    login: (email: string, password?: string, twoFactorCode?: string) => Promise<AuthTokenResponse>;
    verifyEmail: (email: string, code: string) => Promise<Record<string, unknown>>;
    enableTwoFactor: (email: string) => Promise<Record<string, unknown>>;
    verifyTwoFactor: (email: string, code: string) => Promise<Record<string, unknown>>;
    oauthUrl: (provider: string) => Promise<Record<string, unknown>>;
    oauthCallback: (provider: string, oauthCode: string) => Promise<AuthTokenResponse>;
    config: () => Promise<FeatureConfig>;
    features: () => Promise<FeatureConfig>;
};
//# sourceMappingURL=auth.d.ts.map