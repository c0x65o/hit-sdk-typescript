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

export { getServiceUrl, getNamespace, getApiKey, getWebSocketUrl } from './config.js';

export {
  PingPongClient,
  pingPong,
  getCounter,
  increment,
  reset,
  getConfig,
  version,
  subscribeCounter,
} from './pingPong.js';
export type { CounterResponse } from './pingPong.js';

export { EmailClient, email, sendEmail } from './email.js';
export type { SendEmailPayload, EmailResponse } from './email.js';

export {
  AuthClient,
  auth,
  register,
  login,
  verifyEmail,
  enableTwoFactor,
  verifyTwoFactor,
  oauthUrl,
  oauthCallback,
  config as authConfig,
  features as authFeatures,
} from './auth.js';
export type { AuthTokenResponse, FeatureConfig } from './auth.js';

// Events - Real-time subscriptions via WebSocket/SSE
export {
  HitEvents,
  events,
  getEventsClient,
} from './events.js';
export type {
  EventMessage,
  EventSubscription,
  EventHandler,
  HitEventsOptions,
} from './events.js';

// HIT Provider - Top-level context provider for HIT apps
export {
  HitProvider,
  useHit,
  useHitRole,
  useHitRoles,
  useModuleUrl,
} from './provider.js';
export type {
  HitContext,
  HitTheme,
  HitUser,
  FeaturePackClaim,
  HitProviderProps,
} from './provider.js';

// Date utilities - Browser timezone localization
export {
  parseDate,
  formatDate,
  formatDateTime,
  formatDateShort,
  formatTime,
  formatRelativeTime,
  formatISO,
  formatSmart,
} from './date-utils.js';

