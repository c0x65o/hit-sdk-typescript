/**
 * Base HTTP client for Hit SDK.
 *
 * Provides common functionality for all service clients:
 * - Error handling
 * - Request/response handling
 * - Common headers
 * - Automatic token injection
 */
import { getTokenManager } from './token';
export class HitAPIError extends Error {
    constructor(message, statusCode, response) {
        super(message);
        this.name = 'HitAPIError';
        this.statusCode = statusCode;
        this.response = response;
    }
    /** Returns true if this is a server error (5xx status code) */
    isServerError() {
        return this.statusCode >= 500 && this.statusCode < 600;
    }
    /** Returns true if this is a client error (4xx status code) */
    isClientError() {
        return this.statusCode >= 400 && this.statusCode < 500;
    }
    /** Returns true if this error might be resolved by retrying (5xx, timeout, network) */
    isRetryable() {
        return this.statusCode === 0 || this.isServerError();
    }
    /** Clean string representation without stack trace, suitable for logging */
    toLogString() {
        return `HitAPIError [${this.statusCode}]: ${this.message}`;
    }
    /** Structured representation for JSON logging */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            response: this.response,
        };
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
    async getHeaders() {
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
        else {
            // Try to get project token automatically
            const tokenManager = getTokenManager();
            const token = await tokenManager.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
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
        if (!this.baseUrl) {
            throw new HitAPIError('Base URL is not set. Configure service URL via HIT_<SERVICE>_URL environment variable or hit.yaml', 0);
        }
        const urlPath = path.startsWith('/') ? path : `/${path}`;
        let url;
        try {
            url = new URL(urlPath, this.baseUrl);
        }
        catch (error) {
            throw new HitAPIError(`Invalid base URL: ${this.baseUrl}. Make sure it's a valid URL (e.g., http://localhost:8099)`, 0);
        }
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const headers = await this.getHeaders();
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers,
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
            // Re-throw HitAPIError as-is to preserve status code and response data
            if (error instanceof HitAPIError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new HitAPIError(`Request timeout after ${this.timeout}ms`, 0);
            }
            // Provide more helpful error messages for connection failures
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('connection')) {
                throw new HitAPIError(`Cannot connect to service at ${this.baseUrl}. Make sure the service is running. ` +
                    `For Hit modules, start with: hit services run <module-name>`, 0);
            }
            throw new HitAPIError(`Request failed: ${errorMessage}`, 0);
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
        if (!this.baseUrl) {
            throw new HitAPIError('Base URL is not set. Configure service URL via HIT_<SERVICE>_URL environment variable or hit.yaml', 0);
        }
        const urlPath = path.startsWith('/') ? path : `/${path}`;
        let url;
        try {
            url = new URL(urlPath, this.baseUrl);
        }
        catch (error) {
            throw new HitAPIError(`Invalid base URL: ${this.baseUrl}. Make sure it's a valid URL (e.g., http://localhost:8099)`, 0);
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const headers = await this.getHeaders();
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers,
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
            // Re-throw HitAPIError as-is to preserve status code and response data
            if (error instanceof HitAPIError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new HitAPIError(`Request timeout after ${this.timeout}ms`, 0);
            }
            // Provide more helpful error messages for connection failures
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('connection')) {
                throw new HitAPIError(`Cannot connect to service at ${this.baseUrl}. Make sure the service is running. ` +
                    `For Hit modules, start with: hit services run <module-name>`, 0);
            }
            throw new HitAPIError(`Request failed: ${errorMessage}`, 0);
        }
    }
    async handleError(response) {
        let detail;
        let responseData;
        try {
            responseData = await response.json();
            if (typeof responseData === 'object' && responseData !== null && 'detail' in responseData) {
                detail = String(responseData.detail);
            }
        }
        catch {
            // Response wasn't JSON, that's fine
        }
        // Provide helpful error messages based on status code category
        let message;
        if (response.status >= 500) {
            // Server errors - indicate the service had an issue
            message = detail
                ? `Server error (${response.status}): ${detail}`
                : `Server error (${response.status}): ${response.statusText}. The service encountered an internal error.`;
        }
        else if (response.status === 401) {
            message = detail || 'Authentication required. Check your API key or token.';
        }
        else if (response.status === 403) {
            message = detail || 'Access denied. You do not have permission to access this resource.';
        }
        else if (response.status === 404) {
            message = detail || 'Resource not found.';
        }
        else if (response.status === 422) {
            message = detail || 'Invalid request data.';
        }
        else {
            // Other client errors
            message = detail || response.statusText;
        }
        throw new HitAPIError(message, response.status, responseData);
    }
}
