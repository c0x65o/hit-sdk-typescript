/**
 * Base HTTP client for Hit SDK.
 *
 * Provides common functionality for all service clients:
 * - Error handling
 * - Request/response handling
 * - Common headers
 */
export declare class HitAPIError extends Error {
    statusCode: number;
    response?: unknown;
    constructor(message: string, statusCode: number, response?: unknown);
}
export interface HitClientOptions {
    baseUrl?: string;
    namespace?: string;
    apiKey?: string;
    timeout?: number;
}
/**
 * Base HTTP client for Hit services.
 *
 * Provides error handling and common headers.
 */
export declare class HitClient {
    private baseUrl;
    private namespace?;
    private apiKey?;
    private timeout;
    constructor(options?: HitClientOptions);
    private getHeaders;
    /**
     * Make GET request.
     *
     * @param path - API path (e.g., "/counter/test")
     * @param params - Query parameters
     * @returns Response JSON
     * @throws HitAPIError on API error
     */
    get<T = unknown>(path: string, params?: Record<string, string>): Promise<T>;
    /**
     * Make POST request.
     *
     * @param path - API path
     * @param body - JSON body
     * @returns Response JSON
     * @throws HitAPIError on API error
     */
    post<T = unknown>(path: string, body?: unknown): Promise<T>;
    private handleError;
}
//# sourceMappingURL=client.d.ts.map