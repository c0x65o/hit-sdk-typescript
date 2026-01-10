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
function getUserToken() {
    // Prefer the host-app token convention.
    try {
        if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'hit_token' && value)
                    return decodeURIComponent(value);
            }
        }
    }
    catch {
        // ignore
    }
    try {
        if (typeof localStorage !== 'undefined') {
            // Host app token
            const direct = localStorage.getItem('hit_token');
            if (direct)
                return direct;
            // SDK auth token (legacy/alternate)
            const sdk = localStorage.getItem('hit_auth_token');
            if (sdk)
                return sdk;
        }
    }
    catch {
        // ignore
    }
    return null;
}
export function uiFetch(input, init) {
    const headers = new Headers(init?.headers || undefined);
    const token = getUserToken();
    if (token && !headers.get('authorization') && !headers.get('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    // Always include credentials to support cookie-based auth too.
    return fetch(input, { ...init, headers, credentials: init?.credentials ?? 'include' });
}
