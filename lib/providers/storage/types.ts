/**
 * Storage usage information
 */
export interface StorageInfo {
  usedBytes: number
  limitBytes: number | null  // null = unlimited
  withinLimits: boolean
  usedGb: number  // Convenience field
}

/**
 * Storage provider interface
 */
export interface StorageProvider {
  /**
   * Get storage usage information
   * OSS: Returns unlimited
   * Hosted: Returns actual usage from Supabase
   */
  getStorageInfo(contextId: string): Promise<StorageInfo>

  /**
   * Track an upload (for analytics/monitoring)
   * OSS: No-op
   * Hosted: Sends to analytics
   */
  trackUpload(contextId: string, bytes: number, fileType: string): Promise<void>

  /**
   * Check if an upload is allowed
   * OSS: Always true
   * Hosted: Checks against soft limits (doesn't block yet)
   */
  canUpload(contextId: string, bytes: number): Promise<boolean>
}
