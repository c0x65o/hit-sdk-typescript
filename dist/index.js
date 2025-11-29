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
export { getServiceUrl, getNamespace, getApiKey } from './config.js';
export { PingPongClient, pingPong, getCounter, increment, reset, } from './pingPong.js';
