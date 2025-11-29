/**
 * Configuration and service discovery for Hit SDK.
 *
 * Discovers service URLs in priority order:
 * 1. Environment variables (HIT_<SERVICE>_URL)
 * 2. hit.yaml file (hit_services section) - Node.js only
 * 3. Default ports from service manifests
 */
/**
 * Get service URL with auto-discovery.
 *
 * Priority:
 * 1. Environment variable: HIT_<SERVICE>_URL
 * 2. hit.yaml configuration (Node.js only)
 * 3. Default localhost with default port
 *
 * @param serviceName - Service name (e.g., "ping-pong", "auth")
 * @returns Service URL (e.g., "http://localhost:8099")
 */
export declare function getServiceUrl(serviceName: string): string;
/**
 * Get namespace for multi-tenancy.
 *
 * @returns Namespace from HIT_NAMESPACE env var or "default"
 */
export declare function getNamespace(): string;
/**
 * Get API key for service authentication.
 *
 * @param serviceName - Service name
 * @returns API key or null if not set
 */
export declare function getApiKey(serviceName: string): string | null;
//# sourceMappingURL=config.d.ts.map