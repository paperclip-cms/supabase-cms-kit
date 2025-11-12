import type { StorageProvider, StorageInfo } from './types'

/**
 * No-Op Storage Provider (OSS Default)
 *
 * In self-hosted mode, storage is unlimited (within Supabase project limits).
 * No tracking or enforcement.
 */
export class NoOpStorageProvider implements StorageProvider {
  async getStorageInfo(_contextId: string): Promise<StorageInfo> {
    return {
      usedBytes: 0,
      limitBytes: null, // Unlimited
      withinLimits: true,
      usedGb: 0,
    }
  }

  async trackUpload(_contextId: string, _bytes: number, _fileType: string): Promise<void> {
    // Silent no-op
  }

  async canUpload(_contextId: string, _bytes: number): Promise<boolean> {
    // Always allow
    return true
  }
}
