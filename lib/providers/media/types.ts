/**
 * Media storage provider types
 *
 * For images, files, and other static media (not video).
 * Video has different requirements (transcoding, streaming) and uses VideoStorageProvider.
 */

export interface UploadResult {
  /** Public URL to access the uploaded file */
  url: string

  /** File size in bytes */
  size: number

  /** MIME type */
  contentType: string

  /** Optional: Storage provider's internal ID */
  id?: string

  /** Optional: CDN URL if different from storage URL */
  cdnUrl?: string
}

export interface MediaStorageProvider {
  /**
   * Upload an image
   * May perform optimization (compression, format conversion)
   */
  uploadImage(file: File, options?: UploadOptions): Promise<UploadResult>

  /**
   * Upload a file (PDF, document, etc.)
   */
  uploadFile(file: File, options?: UploadOptions): Promise<UploadResult>

  /**
   * Delete a file by URL or ID
   */
  delete(urlOrId: string): Promise<void>

  /**
   * Get storage info (used bytes, limits, etc.)
   */
  getStorageInfo(): Promise<StorageInfo>

  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean
}

export interface UploadOptions {
  /** Directory/path prefix (e.g., "avatars", "posts/123") */
  path?: string

  /** Whether file is publicly accessible */
  public?: boolean

  /** Custom filename (otherwise generates one) */
  filename?: string

  /** Content type override */
  contentType?: string

  /** Max file size in bytes (provider may have lower limit) */
  maxSize?: number
}

export interface StorageInfo {
  /** Bytes used */
  usedBytes: number

  /** Storage limit in bytes (null = unlimited) */
  limitBytes: number | null

  /** Within limits? */
  withinLimits: boolean

  /** Human-readable values */
  usedGb: number
  limitGb: number | null
}
