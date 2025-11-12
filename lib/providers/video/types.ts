/**
 * Video storage provider types
 *
 * For video content that requires transcoding, adaptive streaming, and thumbnails.
 * Separate from MediaStorageProvider because video has different requirements.
 */

export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'error'

export interface VideoUploadResult {
  /** Unique video ID from provider */
  id: string

  /** Video status */
  status: VideoStatus

  /** Playback URL (HLS/DASH) - available when status is 'ready' */
  playbackUrl?: string

  /** Thumbnail/poster image URL */
  thumbnailUrl?: string

  /** Duration in seconds (available after processing) */
  duration?: number

  /** Original file size in bytes */
  size: number

  /** Progress percentage (0-100) */
  progress?: number
}

export interface VideoInfo {
  id: string
  status: VideoStatus
  playbackUrl?: string
  thumbnailUrl?: string
  duration?: number
  createdAt: Date

  /** Optional: Different quality variants */
  qualities?: Array<{
    quality: string // '1080p', '720p', '480p', etc.
    url: string
  }>
}

export interface VideoStorageProvider {
  /**
   * Upload a video file
   * Returns immediately with 'uploading' or 'processing' status
   * Use getVideoInfo() to poll for completion
   */
  uploadVideo(file: File, options?: VideoUploadOptions): Promise<VideoUploadResult>

  /**
   * Get video info and status
   */
  getVideoInfo(videoId: string): Promise<VideoInfo>

  /**
   * Delete a video
   */
  delete(videoId: string): Promise<void>

  /**
   * Get storage/usage info
   */
  getStorageInfo(): Promise<VideoStorageInfo>

  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean
}

export interface VideoUploadOptions {
  /** Video title/name */
  title?: string

  /** Whether video is publicly accessible */
  public?: boolean

  /** Custom thumbnail (otherwise auto-generated) */
  thumbnailTime?: number // Seconds into video for thumbnail

  /** Max file size in bytes */
  maxSize?: number

  /** Webhook URL for processing completion */
  webhookUrl?: string
}

export interface VideoStorageInfo {
  /** Total minutes of video stored */
  minutesStored: number

  /** Total minutes delivered (watched) this month */
  minutesDelivered: number

  /** Storage limit in minutes (null = unlimited) */
  storageLimitMinutes: number | null

  /** Delivery limit in minutes (null = unlimited) */
  deliveryLimitMinutes: number | null

  /** Within limits? */
  withinLimits: boolean
}
