/**
 * Next.js helpers for HIT SDK.
 * 
 * Routes that call external services (like HIT modules) should be dynamic
 * to ensure they're evaluated at request time, not build time.
 * 
 * Usage:
 * ```typescript
 * import { pingPong } from '@hit/sdk';
 * export { dynamic } from '@hit/sdk/next';
 * 
 * export async function GET() {
 *   const count = await pingPong.getCounter('test');
 *   return Response.json({ count });
 * }
 * ```
 */

/**
 * Force dynamic rendering for Next.js routes.
 * Re-export this from any route that calls HIT SDK methods.
 */
export const dynamic = 'force-dynamic' as const;

/**
 * Disable caching for Next.js routes.
 */
export const revalidate = 0;

/**
 * Disable fetch caching for Next.js routes.
 */
export const fetchCache = 'force-no-store' as const;

