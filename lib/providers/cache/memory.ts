import type { CacheProvider, CacheKey, CacheEntry } from './types'

/**
 * Memory Cache Provider (OSS Opt-in)
 *
 * Simple in-memory cache using a Map.
 * Fast but not persistent across restarts.
 * Good for development or single-instance deployments.
 *
 * WARNING: Not suitable for multi-instance deployments (cache will be per-instance).
 */
export class MemoryCacheProvider implements CacheProvider {
  private cache: Map<CacheKey, CacheEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired()
    }, 60000)
  }

  async get<T = any>(key: CacheKey): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  async set<T = any>(key: CacheKey, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
    }

    this.cache.set(key, entry)
  }

  async delete(key: CacheKey): Promise<void> {
    this.cache.delete(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    // Convert glob pattern to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')

    const keysToDelete: CacheKey[] = []
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  isEnabled(): boolean {
    return true
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  private cleanupExpired(): void {
    const now = Date.now()
    const keysToDelete: CacheKey[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Clean up interval on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}
