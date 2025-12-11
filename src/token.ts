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

class TokenManager {
  private cacUrl: string;
  private projectSlug: string;
  private namespace: string;
  private serviceName?: string;
  private serviceToken?: string;
  private cachedToken?: string;
  private tokenExpiresAt?: number;

  constructor(options: TokenManagerOptions = {}) {
    const isNode = typeof process !== 'undefined' && 
                   process.versions != null && 
                   process.versions.node != null;

    this.cacUrl = (options.cacUrl || (isNode ? process.env.HIT_CAC_URL : '') || '').replace(/\/$/, '');
    this.projectSlug = options.projectSlug || (isNode ? process.env.HIT_PROJECT_SLUG : '') || '';
    this.namespace = options.namespace || (isNode ? process.env.HIT_NAMESPACE : '') || 'shared';
    
    // Get service name (encoded in token claims for reverse lookup)
    this.serviceName = options.serviceName || (isNode ? process.env.HIT_SERVICE_NAME : undefined);
    
    // Token resolution: Use HIT_SERVICE_TOKEN (service name encoded in token claims)
      this.serviceToken = options.serviceToken || (isNode ? process.env.HIT_SERVICE_TOKEN : undefined);
  }

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
  async getToken(): Promise<string | undefined> {
    // Use service token (contains ACL and service name in claims)
    if (this.serviceToken) {
      return this.serviceToken;
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
      } catch (error) {
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
  private async fetchTokenFromCac(): Promise<string | undefined> {
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
let tokenManager: TokenManager | null = null;

/**
 * Get or create global token manager instance.
 */
export function getTokenManager(): TokenManager {
  if (!tokenManager) {
    tokenManager = new TokenManager();
  }
  return tokenManager;
}

