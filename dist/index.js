/**
 * Hit SDK for TypeScript.
 *
 * Strongly-typed client for Hit platform microservices.
 *
 * Example:
 * ```typescript
 * import { pingPong } from '@hit/sdk';
 *
 * const count = await pingPong.getCounter('test');
 * const newCount = await pingPong.increment('test');
 * ```
 */
export { HitClient, HitAPIError } from './client.js';
export { getServiceUrl, getNamespace, getApiKey, getWebSocketUrl } from './config.js';
export { PingPongClient, pingPong, getCounter, increment, reset, getConfig, version, subscribeCounter, } from './pingPong.js';
export { EmailClient, email, sendEmail } from './email.js';
export { AuthClient, auth, register, login, verifyEmail, enableTwoFactor, verifyTwoFactor, oauthUrl, oauthCallback, config as authConfig, features as authFeatures, } from './auth.js';
// Events - Real-time subscriptions via WebSocket/SSE
export { HitEvents, events, getEventsClient, } from './events.js';
// HIT Provider - Top-level context provider for HIT apps
export { HitProvider, useHit, useHitRole, useHitRoles, useModuleUrl, } from './provider.js';
