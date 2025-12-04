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
class TokenManager {
    constructor(options = {}) {
        const isNode = typeof process !== 'undefined' &&
            process.versions != null &&
            process.versions.node != null;
        this.cacUrl = (options.cacUrl || (isNode ? process.env.HIT_CAC_URL : '') || '').replace(/\/$/, '');
        this.projectSlug = options.projectSlug || (isNode ? process.env.HIT_PROJECT_SLUG : '') || '';
        this.namespace = options.namespace || (isNode ? process.env.HIT_NAMESPACE : '') || 'shared';
        // Get service name to look up service-specific token
        this.serviceName = options.serviceName || (isNode ? process.env.HIT_SERVICE_NAME : undefined);
        // Token resolution:
        // 1. Per-service token (HIT_SERVICE_{NAME}_TOKEN) - contains method-level ACL
        // 2. Generic service token (HIT_SERVICE_TOKEN)
        // 3. Legacy project token (HIT_PROJECT_TOKEN)
        if (isNode && this.serviceName) {
            const serviceTokenVar = `HIT_SERVICE_${this.serviceName.toUpperCase()}_TOKEN`;
            this.serviceToken = options.serviceToken || process.env[serviceTokenVar] || process.env.HIT_SERVICE_TOKEN;
        }
        else {
            this.serviceToken = options.serviceToken || (isNode ? process.env.HIT_SERVICE_TOKEN : undefined);
        }
        this.projectToken = options.projectToken || (isNode ? process.env.HIT_PROJECT_TOKEN : undefined);
    }
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
    async getToken() {
        // Prefer service token (has per-service ACL)
        if (this.serviceToken) {
            return this.serviceToken;
        }
        // Fall back to project token (legacy, no method-level ACL)
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
