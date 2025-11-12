import type { ContextProvider } from './context/types'
import type { BillingProvider } from './billing/types'
import type { AnalyticsProvider } from './analytics/types'
import type { StorageProvider } from './storage/types'
import type { CacheProvider } from './cache/types'

// OSS implementations
import { UserContextProvider } from './context/user-context'
import { NoOpBillingProvider } from './billing/noop'
import { NoOpAnalyticsProvider } from './analytics/noop'
import { NoOpStorageProvider } from './storage/noop'
import { DisabledCacheProvider } from './cache/disabled'
import { MemoryCacheProvider } from './cache/memory'
import { FileSystemCacheProvider } from './cache/filesystem'

// Global provider instances
let contextProvider: ContextProvider | null = null
let billingProvider: BillingProvider | null = null
let analyticsProvider: AnalyticsProvider | null = null
let storageProvider: StorageProvider | null = null
let cacheProvider: CacheProvider | null = null

/**
 * Check if running in hosted mode
 */
export function isHostedMode(): boolean {
  return process.env.PAPERCLIP_HOSTED === 'true'
}

/**
 * Initialize all providers based on environment
 * Call this once at application startup
 */
export function initializeProviders() {
  if (isHostedMode()) {
    try {
      // Load hosted implementations dynamically
      // This allows the OSS build to work without the hosted code
      const { ProjectContextProvider } = require('@/lib/hosted/context/project-context')
      const { PolarBillingProvider } = require('@/lib/hosted/billing/polar-provider')
      const { PostHogAnalyticsProvider } = require('@/lib/hosted/analytics/posthog-provider')
      const { HostedStorageProvider } = require('@/lib/hosted/storage/storage-provider')

      contextProvider = new ProjectContextProvider()
      billingProvider = new PolarBillingProvider()
      analyticsProvider = new PostHogAnalyticsProvider()
      storageProvider = new HostedStorageProvider()

      console.log('✓ Hosted mode enabled')
      console.log('  - Projects: enabled')
      console.log('  - Billing: Polar')
      console.log('  - Analytics: PostHog')
    } catch (err) {
      console.error('Failed to load hosted providers:', err)
      console.error('Falling back to OSS mode')
      initializeOSSProviders()
    }
  } else {
    initializeOSSProviders()
  }

  // Initialize cache provider (opt-in for both OSS and hosted)
  initializeCacheProvider()
}

/**
 * Initialize OSS providers
 */
function initializeOSSProviders() {
  contextProvider = new UserContextProvider()
  billingProvider = new NoOpBillingProvider()
  analyticsProvider = new NoOpAnalyticsProvider()
  storageProvider = new NoOpStorageProvider()

  console.log('ℹ Self-hosted mode')
  console.log('  - User-owned collections')
  console.log('  - No billing or limits')
}

/**
 * Initialize cache provider based on configuration
 * Cache is opt-in for both OSS and hosted modes
 */
function initializeCacheProvider() {
  const cacheType = process.env.CACHE_PROVIDER || 'disabled'

  switch (cacheType) {
    case 'memory':
      cacheProvider = new MemoryCacheProvider()
      console.log('  - Cache: memory (in-process)')
      break

    case 'filesystem':
      const cacheDir = process.env.CACHE_FILESYSTEM_DIR || './.cache'
      cacheProvider = new FileSystemCacheProvider(cacheDir)
      console.log(`  - Cache: filesystem (${cacheDir})`)
      break

    case 'redis':
    case 'upstash':
      try {
        const { RedisCacheProvider } = require('@/lib/hosted/cache/redis-provider')
        const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL
        const redisToken = process.env.UPSTASH_REDIS_TOKEN

        if (!redisUrl) {
          throw new Error('REDIS_URL or UPSTASH_REDIS_URL is required')
        }

        cacheProvider = new RedisCacheProvider({
          url: redisUrl,
          token: redisToken,
          defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
        })
        console.log(`  - Cache: ${cacheType}`)
      } catch (err) {
        console.error('Failed to initialize Redis cache:', err)
        console.log('  - Cache: disabled (fallback)')
        cacheProvider = new DisabledCacheProvider()
      }
      break

    case 'disabled':
    default:
      cacheProvider = new DisabledCacheProvider()
      console.log('  - Cache: disabled')
      break
  }
}

/**
 * Get the context provider instance
 */
export function getContextProvider(): ContextProvider {
  if (!contextProvider) {
    initializeProviders()
  }
  return contextProvider!
}

/**
 * Get the billing provider instance
 */
export function getBillingProvider(): BillingProvider {
  if (!billingProvider) {
    initializeProviders()
  }
  return billingProvider!
}

/**
 * Get the analytics provider instance
 */
export function getAnalyticsProvider(): AnalyticsProvider {
  if (!analyticsProvider) {
    initializeProviders()
  }
  return analyticsProvider!
}

/**
 * Get the storage provider instance
 */
export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    initializeProviders()
  }
  return storageProvider!
}

/**
 * Get the cache provider instance
 */
export function getCacheProvider(): CacheProvider {
  if (!cacheProvider) {
    initializeProviders()
  }
  return cacheProvider!
}

// Re-export types for convenience
export type { ContextProvider, AppContext } from './context/types'
export type { BillingProvider, Subscription } from './billing/types'
export type { AnalyticsProvider, AnalyticsEvent } from './analytics/types'
export type { StorageProvider, StorageInfo } from './storage/types'
export type { CacheProvider, CacheKey } from './cache/types'
