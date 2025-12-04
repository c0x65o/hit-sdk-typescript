/**
 * Token management for Hit SDK authentication.
 *
 * Handles fetching and caching service/project tokens from CAC for SDK requests.
 *
 * Token Resolution Order (for local development):
 * 1. HIT_SERVICE_{SERVICE_NAME}_TOKEN (per-service token with method-level ACL)
 *    Example: HIT_SERVICE_WEB_TOKEN, HIT_SERVICE_API_TOKEN
 * 2. HIT_SERVICE_TOKEN (generic service token)
 * 3. HIT_PROJECT_TOKEN (legacy project-wide tokens)
 * 4. Explicit token passed in constructor
 *
 * The HIT_SERVICE_NAME environment variable determines which service token to use.
 */
interface TokenManagerOptions {
    cacUrl?: string;
    projectSlug?: string;
    namespace?: string;
    projectToken?: string;
    serviceToken?: string;
    serviceName?: string;
}
declare class TokenManager {
    private cacUrl;
    private projectSlug;
    private namespace;
    private serviceName?;
    private serviceToken?;
    private projectToken?;
    private cachedToken?;
    private tokenExpiresAt?;
    constructor(options?: TokenManagerOptions);
    /**
     * Get a valid service or project token.
     *
     * Token resolution order:
     * 1. Per-service token (HIT_SERVICE_{NAME}_TOKEN with ACL)
     * 2. Generic service token (HIT_SERVICE_TOKEN)
     * 3. Legacy project token (HIT_PROJECT_TOKEN)
     * 4. Cached token from previous fetch
     * 5. Fetch from CAC (if configured)
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