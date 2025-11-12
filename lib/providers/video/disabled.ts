import type { VideoStorageProvider, VideoUploadResult, VideoInfo, VideoUploadOptions, VideoStorageInfo } from './types'

/**
 * Disabled Video Provider (Default)
 *
 * Video storage is disabled by default.
 * Enable by configuring a video provider (Cloudflare Stream, Bunny, Mux).
 */
export class DisabledVideoProvider implements VideoStorageProvider {
  async uploadVideo(_file: File, _options?: VideoUploadOptions): Promise<VideoUploadResult> {
    throw new Error('Video storage is not enabled. Configure VIDEO_PROVIDER environment variable.')
  }

  async getVideoInfo(_videoId: string): Promise<VideoInfo> {
    throw new Error('Video storage is not enabled.')
  }

  async delete(_videoId: string): Promise<void> {
    throw new Error('Video storage is not enabled.')
  }

  async getStorageInfo(): Promise<VideoStorageInfo> {
    return {
      minutesStored: 0,
      minutesDelivered: 0,
      storageLimitMinutes: null,
      deliveryLimitMinutes: null,
      withinLimits: true,
    }
  }

  isEnabled(): boolean {
    return false
  }
}
