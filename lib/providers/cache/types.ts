/**
 * Cache provider types
 *
 * Used for caching published content in object storage for fast queries without DB hits.
 *
 * Architecture:
 * User → Next.js API → Object Storage Cache → DB (if miss)
 *
 * All requests go through your app (not direct CDN access):
 * - Control URLs, routing, auth
 * - Track metrics and analytics
 * - Cache is transparent to users
 * - CDN accelerates object storage reads
 */

export type CacheKey = string

/**
 * Cache provider interface
 *
 * Stores JSON blobs in object storage (R2, Vercel Blob, Supabase Storage)
 * App fetches from cache, falls back to DB
 */
export interface CacheProvider {
  /**
   * Get a value from cache
   * Returns null if not found
   */
  get<T = any>(key: CacheKey): Promise<T | null>

  /**
   * Set a value in cache
   * @param key Cache key (e.g., "collection:blog:my-post")
   * @param value Value to cache (will be JSON stringified)
   */
  set<T = any>(key: CacheKey, value: T): Promise<void>

  /**
   * Delete a value from cache
   */
  delete(key: CacheKey): Promise<void>

  /**
   * Delete multiple keys matching a pattern
   * Example: deletePattern('collection:blog:*')
   */
  deletePattern(pattern: string): Promise<void>

  /**
   * Check if cache is enabled/available
   */
  isEnabled(): boolean

  /**
   * Clear all cache entries (use with caution)
   */
  clear(): Promise<void>

  /**
   * Get a public URL for direct access (optional)
   * Most implementations won't use this - app is the gateway
   */
  getPublicUrl?(key: CacheKey): string | null
}
