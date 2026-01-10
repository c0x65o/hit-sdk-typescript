/**
 * UI HTTP helpers
 *
 * The UI renderer/hooks run in the browser and frequently call back into the
 * host app's Next.js API routes (e.g. /api/*). In many deployments, the user JWT
 * is stored in localStorage (hit_token) and is NOT always present as a cookie.
 *
 * If we don't attach Authorization, APIs that enforce ACLs (metrics, admin pages, etc.)
 * will fail closed and the UI will look like data is "missing".
 */
export declare function uiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
//# sourceMappingURL=http.d.ts.map