/**
 * Token management for Hit SDK authentication.
 *
 * Handles fetching and caching service/project tokens from CAC for SDK requests.
 *
 * Token Resolution Order:
 * 1. HIT_SERVICE_TOKEN (new per-service tokens with module/database ACL)
 * 2. HIT_PROJECT_TOKEN (legacy project-wide tokens, for backward compatibility)
 * 3. Explicit token passed in constructor
 */

interface TokenManagerOptions {
  cacUrl?: string;
  projectSlug?: string;
  namespace?: string;
  projectToken?: string;
  serviceToken?: string;
}

class TokenManager {
  private cacUrl: string;
  private projectSlug: string;
  private namespace: string;
  private serviceToken?: string;
  private projectToken?: string;
  private cachedToken?: string;
  private tokenExpiresAt?: number;

  constructor(options: TokenManagerOptions = {}) {
    const isNode = typeof process !== 'undefined' && 
                   process.versions != null && 
                   process.versions.node != null;

    this.cacUrl = (options.cacUrl || (isNode ? process.env.HIT_CAC_URL : '') || '').replace(/\/$/, '');
    this.projectSlug = options.projectSlug || (isNode ? process.env.HIT_PROJECT_SLUG : '') || '';
    this.namespace = options.namespace || (isNode ? process.env.HIT_NAMESPACE : '') || 'shared';
    
    // Prefer service token over project token (service token has ACL)
    this.serviceToken = options.serviceToken || (isNode ? process.env.HIT_SERVICE_TOKEN : undefined);
    this.projectToken = options.projectToken || (isNode ? process.env.HIT_PROJECT_TOKEN : undefined);
  }

  /**
   * Get a valid service or project token.
   *
   * Token resolution order:
   * 1. Explicitly provided service token (HIT_SERVICE_TOKEN)
   * 2. Explicitly provided project token (HIT_PROJECT_TOKEN)
   * 3. Cached token from previous fetch
   * 4. Fetch from CAC (if configured)
   *
   * @returns Token string, or undefined if not available
   */
  async getToken(): Promise<string | undefined> {
    // Prefer service token (new per-service with ACL)
    if (this.serviceToken) {
      return this.serviceToken;
    }
    
    // Fall back to project token (legacy)
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

