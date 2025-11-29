/**
 * Base HTTP client for Hit SDK.
 *
 * Provides common functionality for all service clients:
 * - Error handling
 * - Request/response handling
 * - Common headers
 */
export class HitAPIError extends Error {
    constructor(message, statusCode, response) {
        super(message);
        this.name = 'HitAPIError';
        this.statusCode = statusCode;
        this.response = response;
    }
}
/**
 * Base HTTP client for Hit services.
 *
 * Provides error handling and common headers.
 */
export class HitClient {
    constructor(options = {}) {
        this.baseUrl = (options.baseUrl || '').replace(/\/$/, '');
        this.namespace = options.namespace;
        this.apiKey = options.apiKey;
        this.timeout = options.timeout || 30000;
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'hit-sdk-typescript/1.0.0',
        };
        if (this.namespace) {
            headers['X-Hit-Namespace'] = this.namespace;
        }
        if (this.apiKey) {
            headers['X-Hit-API-Key'] = this.apiKey;
        }
        return headers;
    }
    /**
     * Make GET request.
     *
     * @param path - API path (e.g., "/counter/test")
     * @param params - Query parameters
     * @returns Response JSON
     * @throws HitAPIError on API error
     */
    async get(path, params) {
        const urlPath = path.startsWith('/') ? path : `/${path}`;
        const url = new URL(urlPath, this.baseUrl);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getHeaders(),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                await this.handleError(response);
            }
            return (await response.json());
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new HitAPIError(`Request timeout after ${this.timeout}ms`, 0);
            }
            throw new HitAPIError(`Request failed: ${error}`, 0);
        }
    }
    /**
     * Make POST request.
     *
     * @param path - API path
     * @param body - JSON body
     * @returns Response JSON
     * @throws HitAPIError on API error
     */
    async post(path, body) {
        const urlPath = path.startsWith('/') ? path : `/${path}`;
        const url = new URL(urlPath, this.baseUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: this.getHeaders(),
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                await this.handleError(response);
            }
            return (await response.json());
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new HitAPIError(`Request timeout after ${this.timeout}ms`, 0);
            }
            throw new HitAPIError(`Request failed: ${error}`, 0);
        }
    }
    async handleError(response) {
        let message;
        let responseData;
        try {
            responseData = await response.json();
            if (typeof responseData === 'object' && responseData !== null && 'detail' in responseData) {
                message = String(responseData.detail);
            }
            else {
                message = response.statusText;
            }
        }
        catch {
            message = response.statusText;
        }
        throw new HitAPIError(message, response.status, responseData);
    }
}
