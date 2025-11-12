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
import { FileSystemCacheProvider } from './cache/filesystem'
import { SupabaseStorageCacheProvider } from './cache/supabase-storage'

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
 *
 * Object storage options store JSON blobs in cloud storage.
 * App fetches from cache, falls back to DB - users never access storage directly.
 */
function initializeCacheProvider() {
  const cacheType = process.env.CACHE_PROVIDER || 'disabled'

  switch (cacheType) {
    case 'filesystem':
      const cacheDir = process.env.CACHE_FILESYSTEM_DIR || './.cache'
      cacheProvider = new FileSystemCacheProvider(cacheDir)
      console.log(`  - Cache: filesystem (${cacheDir})`)
      break

    case 'supabase-storage':
      const bucketName = process.env.CACHE_STORAGE_BUCKET || 'cache'
      cacheProvider = new SupabaseStorageCacheProvider(bucketName)
      console.log(`  - Cache: Supabase Storage (bucket: ${bucketName})`)
      break

    case 'r2':
      try {
        const { R2CacheProvider } = require('@/lib/hosted/cache/r2-provider')

        const accountId = process.env.R2_ACCOUNT_ID
        const accessKeyId = process.env.R2_ACCESS_KEY_ID
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
        const bucketName = process.env.R2_BUCKET_NAME || 'cache'
        const cdnUrl = process.env.R2_CDN_URL

        if (!accountId || !accessKeyId || !secretAccessKey) {
          throw new Error('R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are required')
        }

        cacheProvider = new R2CacheProvider({
          accountId,
          accessKeyId,
          secretAccessKey,
          bucketName,
          cdnUrl,
        })
        console.log(`  - Cache: Cloudflare R2 (bucket: ${bucketName})`)
      } catch (err) {
        console.error('Failed to initialize R2 cache:', err)
        console.log('  - Cache: disabled (fallback)')
        cacheProvider = new DisabledCacheProvider()
      }
      break

    case 'vercel-blob':
      try {
        const { VercelBlobCacheProvider } = require('@/lib/hosted/cache/vercel-blob-provider')
        cacheProvider = new VercelBlobCacheProvider()
        console.log('  - Cache: Vercel Blob')
      } catch (err) {
        console.error('Failed to initialize Vercel Blob cache:', err)
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
