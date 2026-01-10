/**
 * Token management for Hit SDK authentication.
 *
 * Handles fetching and caching service tokens from CAC for SDK requests.
 *
 * Token Resolution Order:
 * 1. HIT_SERVICE_TOKEN (service token with method-level ACL and service name in claims)
 * 2. Explicit token passed in constructor
 *
 * Service tokens encode the service name in their 'svc' claim, so modules can
 * reverse-lookup which service is making the request.
 */
interface TokenManagerOptions {
    cacUrl?: string;
    projectSlug?: string;
    namespace?: string;
    serviceToken?: string;
    serviceName?: string;
}
declare class TokenManager {
    private cacUrl;
    private projectSlug;
    private namespace;
    private serviceName?;
    private serviceToken?;
    private cachedToken?;
    private tokenExpiresAt?;
    constructor(options?: TokenManagerOptions);
    /**
     * Get a valid service token.
     *
     * Token resolution order:
     * 1. Service token (HIT_SERVICE_TOKEN with ACL and service name in claims)
     * 2. Cached token from previous fetch
     * 3. Fetch from CAC (if configured)
     *
     * @returns Token string, or undefined if not available
     */
    getToken(): Promise<string | undefined>;
    /**
     * Fetch project token from CAC.
     *
     * @returns Token string or undefined if fetch fails
     */
    private fetchTokenFromCac;
}
/**
 * Get or create global token manager instance.
 */
export declare function getTokenManager(): TokenManager;
export {};
//# sourceMappingURL=token.d.ts.map