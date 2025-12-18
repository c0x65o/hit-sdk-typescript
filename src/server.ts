/**
 * HIT SDK (server-safe entrypoint)
 *
 * This entrypoint intentionally does NOT export the React provider/hooks.
 * Use this from Next.js Route Handlers / Server Components.
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

export { HitEvents, events, getEventsClient } from './events.js';
export type {
  EventMessage,
  EventSubscription,
  EventHandler,
  HitEventsOptions,
} from './events.js';

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


