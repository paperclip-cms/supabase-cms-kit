import type { CacheProvider, CacheKey } from './types'

/**
 * Disabled Cache Provider (Default for OSS)
 *
 * This provider does nothing - caching is disabled.
 * OSS users can opt-in to caching by configuring a cache provider.
 */
export class DisabledCacheProvider implements CacheProvider {
  async get<T = any>(_key: CacheKey): Promise<T | null> {
    return null
  }

  async set<T = any>(_key: CacheKey, _value: T, _ttl?: number): Promise<void> {
    // No-op
  }

  async delete(_key: CacheKey): Promise<void> {
    // No-op
  }

  async deletePattern(_pattern: string): Promise<void> {
    // No-op
  }

  isEnabled(): boolean {
    return false
  }

  async clear(): Promise<void> {
    // No-op
  }
}
