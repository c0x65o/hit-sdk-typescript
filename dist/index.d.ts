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
export type { HitClientOptions } from './client.js';
export { getServiceUrl, getNamespace, getApiKey } from './config.js';
export { PingPongClient, pingPong, getCounter, increment, reset, getConfig, version, } from './pingPong.js';
export type { CounterResponse } from './pingPong.js';
export { EmailClient, email, sendEmail } from './email.js';
export type { SendEmailPayload, EmailResponse } from './email.js';
export { AuthClient, auth, register, login, verifyEmail, enableTwoFactor, verifyTwoFactor, oauthUrl, oauthCallback, config as authConfig, features as authFeatures, } from './auth.js';
export type { AuthTokenResponse, FeatureConfig } from './auth.js';
export { HitEvents, events, getEventsClient, } from './events.js';
export type { EventMessage, EventSubscription, EventHandler, HitEventsOptions, } from './events.js';
export { HitUIRenderer, HitUIFromEndpoint, HitUIProvider, useHitUI, useHitUISpec, useHitData, useHitMutation, } from './ui/index.js';
export type { UISpec, ActionSpec, HitUIRendererProps, ComponentRegistry, } from './ui/index.js';
//# sourceMappingURL=index.d.ts.map