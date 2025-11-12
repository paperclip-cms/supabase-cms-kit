/**
 * Cache provider types
 *
 * Used for caching published content for fast queries without hitting the database.
 * Example: When an item is published, cache the serialized version for public API access.
 */

export type CacheKey = string

export interface CacheEntry<T = any> {
  value: T
  expiresAt?: number // Unix timestamp in milliseconds
}

/**
 * Cache provider interface
 */
export interface CacheProvider {
  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get<T = any>(key: CacheKey): Promise<T | null>

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  set<T = any>(key: CacheKey, value: T, ttl?: number): Promise<void>

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
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean
  provider: 'disabled' | 'memory' | 'filesystem' | 'redis' | 'upstash' | 'vercel-kv'

  // Redis/Upstash configuration
  redis?: {
    url: string
    token?: string
  }

  // File system configuration
  filesystem?: {
    directory: string
  }

  // Default TTL in seconds
  defaultTtl?: number
}
