/**
 * Token management for Hit SDK authentication.
 *
 * Handles fetching and caching project tokens from CAC for SDK requests.
 */
class TokenManager {
    constructor(options = {}) {
        const isNode = typeof process !== 'undefined' &&
            process.versions != null &&
            process.versions.node != null;
        this.cacUrl = (options.cacUrl || (isNode ? process.env.HIT_CAC_URL : '') || '').replace(/\/$/, '');
        this.projectSlug = options.projectSlug || (isNode ? process.env.HIT_PROJECT_SLUG : '') || '';
        this.namespace = options.namespace || (isNode ? process.env.HIT_NAMESPACE : '') || 'shared';
        this.projectToken = options.projectToken || (isNode ? process.env.HIT_PROJECT_TOKEN : undefined);
    }
    /**
     * Get a valid project token.
     *
     * @returns Project token string, or undefined if not available
     */
    async getToken() {
        // If explicitly provided, use it
        if (this.projectToken) {
            return this.projectToken;
        }
        // Check cached token
        if (this.cachedToken && this.tokenExpiresAt) {
            const now = Date.now() / 1000;
            if (now < this.tokenExpiresAt - 60) { // Refresh 1 min before expiry
                return this.cachedToken;
            }
        }
        // Fetch from CAC if configured
        if (this.cacUrl && this.projectSlug) {
            try {
                const token = await this.fetchTokenFromCac();
                if (token) {
                    this.cachedToken = token;
                    // Assume 24 hour expiry (CAC default) - we'll refresh before then
                    this.tokenExpiresAt = Date.now() / 1000 + (24 * 3600) - 3600;
                    return token;
                }
            }
            catch (error) {
                // If CAC fetch fails, return undefined (SDK can work without token in local dev)
                console.warn('Failed to fetch token from CAC:', error);
            }
        }
        return undefined;
    }
    /**
     * Fetch project token from CAC.
     *
     * @returns Token string or undefined if fetch fails
     */
    async fetchTokenFromCac() {
        if (!this.cacUrl || !this.projectSlug) {
            return undefined;
        }
        // For now, we need CAC auth - in production this would use service account
        // For local dev, tokens should be set via env vars
        // TODO: Add service account auth for automated token fetching
        return undefined;
    }
}
// Global token manager instance
let tokenManager = null;
/**
 * Get or create global token manager instance.
 */
export function getTokenManager() {
    if (!tokenManager) {
        tokenManager = new TokenManager();
    }
    return tokenManager;
}
