/**
 * Configuration and service discovery for Hit SDK.
 *
 * Discovers service URLs in priority order:
 * 1. Environment variables (HIT_<SERVICE>_URL)
 * 2. hit.yaml file (hit_services section) - Node.js only
 * 3. Default ports from service manifests
 */
const DEFAULT_PORTS = {
    'ping-pong': 8099,
    'auth': 8001,
    'email': 8002,
};
// Detect if we're running in Node.js or browser
const isNode = typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;
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
export function getServiceUrl(serviceName) {
    // Normalize service name for env var (ping-pong -> PING_PONG)
    // Replace all dashes with underscores
    const normalizedName = serviceName.toUpperCase().replace(/-/g, '_');
    const envKey = `HIT_${normalizedName}_URL`;
    // 1. Check environment variable (try both with and without underscores for compatibility)
    if (isNode) {
        // Try HIT_PING_PONG_URL first (with underscores)
        if (process.env[envKey]) {
            return process.env[envKey];
        }
        // Also try HIT_PINGPONG_URL (without underscores) for backward compatibility
        const compactKey = `HIT_${serviceName.toUpperCase().replace(/-/g, '')}_URL`;
        if (process.env[compactKey]) {
            return process.env[compactKey];
        }
    }
    // In browser, check if env var was injected by bundler
    if (typeof window !== 'undefined') {
        // Next.js and other bundlers can inject NEXT_PUBLIC_ vars
        const publicEnvKey = `NEXT_PUBLIC_HIT_${normalizedName}_URL`;
        // @ts-ignore - dynamic env access
        if (typeof process !== 'undefined' && process.env && process.env[publicEnvKey]) {
            // @ts-ignore
            return process.env[publicEnvKey];
        }
        // Also try compact version
        const compactPublicKey = `NEXT_PUBLIC_HIT_${serviceName.toUpperCase().replace(/-/g, '')}_URL`;
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env && process.env[compactPublicKey]) {
            // @ts-ignore
            return process.env[compactPublicKey];
        }
    }
    // 2. Check hit.yaml (Node.js only)
    if (isNode) {
        const yamlUrl = getUrlFromYaml(serviceName);
        if (yamlUrl) {
            return yamlUrl;
        }
    }
    // 3. Default localhost with default port
    const defaultPort = DEFAULT_PORTS[serviceName] || 8000;
    return `http://localhost:${defaultPort}`;
}
/**
 * Get service URL from hit.yaml configuration.
 * Only works in Node.js environment.
 *
 * @param serviceName - Service name
 * @returns Service URL or null if not found
 */
function getUrlFromYaml(serviceName) {
    if (!isNode) {
        return null;
    }
    try {
        // Dynamic import for Node.js-only modules
        const fs = require('fs');
        const path = require('path');
        // Look for hit.yaml in current directory or parent directories
        let currentDir = process.cwd();
        for (let i = 0; i < 5; i++) {
            const hitYamlPath = path.join(currentDir, 'hit.yaml');
            try {
                const content = fs.readFileSync(hitYamlPath, 'utf-8');
                const config = parseYaml(content);
                // Check modules section for service port
                const modules = config?.modules || [];
                for (const module of modules) {
                    if (module?.name === serviceName && module?.port) {
                        return `http://localhost:${module.port}`;
                    }
                }
            }
            catch {
                // File doesn't exist or can't be parsed, continue
            }
            // Move up one directory
            const parent = path.dirname(currentDir);
            if (parent === currentDir) {
                break; // Reached filesystem root
            }
            currentDir = parent;
        }
    }
    catch {
        // Require failed or other error
    }
    return null;
}
/**
 * Simple YAML parser for hit.yaml (basic implementation).
 * Only handles the specific structure we need.
 */
function parseYaml(content) {
    try {
        // Simple regex-based parser for basic YAML structure
        // This is a minimal implementation - for production, use a proper YAML parser
        const modules = [];
        const lines = content.split('\n');
        let inModules = false;
        let currentModule = null;
        let indentLevel = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue; // Skip empty lines and comments
            }
            // Check if we're entering modules section
            if (trimmed === 'modules:' || trimmed.startsWith('modules:')) {
                inModules = true;
                indentLevel = line.length - line.trimStart().length;
                continue;
            }
            // Check if we've left the modules section
            const currentIndent = line.length - line.trimStart().length;
            if (inModules && currentIndent <= indentLevel && !trimmed.startsWith('-')) {
                if (trimmed && !trimmed.startsWith(' ')) {
                    // New top-level key, stop parsing modules
                    break;
                }
            }
            if (inModules) {
                // Start of a new module item
                if (trimmed.startsWith('-')) {
                    currentModule = {};
                    modules.push(currentModule);
                    // Check if name is on the same line
                    const nameMatch = trimmed.match(/-\s*name:\s*(.+)/);
                    if (nameMatch) {
                        currentModule.name = nameMatch[1].trim().replace(/['"]/g, '');
                    }
                }
                else if (trimmed.startsWith('name:')) {
                    const nameMatch = trimmed.match(/name:\s*(.+)/);
                    if (nameMatch) {
                        currentModule = currentModule || {};
                        if (!modules.includes(currentModule)) {
                            modules.push(currentModule);
                        }
                        currentModule.name = nameMatch[1].trim().replace(/['"]/g, '');
                    }
                }
                else if (trimmed.startsWith('port:')) {
                    const portMatch = trimmed.match(/port:\s*(\d+)/);
                    if (portMatch) {
                        currentModule = currentModule || {};
                        if (!modules.includes(currentModule)) {
                            modules.push(currentModule);
                        }
                        currentModule.port = parseInt(portMatch[1], 10);
                    }
                }
            }
        }
        return { modules };
    }
    catch {
        return null;
    }
}
/**
 * Get namespace for multi-tenancy.
 *
 * @returns Namespace from HIT_NAMESPACE env var or "default"
 */
export function getNamespace() {
    if (isNode && process.env.HIT_NAMESPACE) {
        return process.env.HIT_NAMESPACE;
    }
    // Check for Next.js public env var
    if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        const publicNamespace = process.env.NEXT_PUBLIC_HIT_NAMESPACE;
        if (publicNamespace) {
            return publicNamespace;
        }
    }
    return 'default';
}
/**
 * Get API key for service authentication.
 *
 * @param serviceName - Service name
 * @returns API key or null if not set
 */
export function getApiKey(serviceName) {
    // Normalize service name (replace all dashes with underscores)
    const normalizedName = serviceName.toUpperCase().replace(/-/g, '_');
    const envKey = `HIT_${normalizedName}_API_KEY`;
    if (isNode && process.env[envKey]) {
        return process.env[envKey];
    }
    // Check for Next.js public env var (though API keys should not be public)
    if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        const publicKey = process.env[`NEXT_PUBLIC_${envKey}`];
        if (publicKey) {
            return publicKey;
        }
    }
    return null;
}
