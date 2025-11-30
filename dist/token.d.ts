/**
 * Token management for Hit SDK authentication.
 *
 * Handles fetching and caching project tokens from CAC for SDK requests.
 */
interface TokenManagerOptions {
    cacUrl?: string;
    projectSlug?: string;
    namespace?: string;
    projectToken?: string;
}
declare class TokenManager {
    private cacUrl;
    private projectSlug;
    private namespace;
    private projectToken?;
    private cachedToken?;
    private tokenExpiresAt?;
    constructor(options?: TokenManagerOptions);
    /**
     * Get a valid project token.
     *
     * @returns Project token string, or undefined if not available
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