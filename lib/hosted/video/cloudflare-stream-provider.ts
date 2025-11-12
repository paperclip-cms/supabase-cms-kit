import type { VideoStorageProvider, VideoUploadResult, VideoInfo, VideoUploadOptions, VideoStorageInfo } from '@/lib/providers/video/types'

/**
 * Cloudflare Stream Video Provider (Hosted)
 *
 * Uses Cloudflare Stream for video hosting.
 * Pricing: $5/1000 min stored, $1/1000 min delivered
 * Includes: Transcoding, adaptive streaming, thumbnails
 *
 * Requires: Cloudflare account with Stream enabled
 */
export class CloudflareStreamProvider implements VideoStorageProvider {
  private apiToken: string
  private accountId: string

  constructor(config: { apiToken: string; accountId: string }) {
    this.apiToken = config.apiToken
    this.accountId = config.accountId
  }

  async uploadVideo(file: File, options?: VideoUploadOptions): Promise<VideoUploadResult> {
    // Upload to Cloudflare Stream
    // https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/

    const formData = new FormData()
    formData.append('file', file)

    if (options?.title) {
      formData.append('meta', JSON.stringify({ name: options.title }))
    }

    if (options?.thumbnailTime) {
      formData.append('thumbnailTimestampPct', String(options.thumbnailTime))
    }

    if (options?.webhookUrl) {
      formData.append('webhookUrl', options.webhookUrl)
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Upload failed: ${error.errors?.[0]?.message || response.statusText}`)
    }

    const data = await response.json()
    const video = data.result

    return {
      id: video.uid,
      status: this.mapStatus(video.status?.state),
      playbackUrl: video.status?.state === 'ready' ? this.getPlaybackUrl(video.uid) : undefined,
      thumbnailUrl: video.thumbnail,
      duration: video.duration,
      size: file.size,
      progress: this.getProgress(video.status?.state),
    }
  }

  async getVideoInfo(videoId: string): Promise<VideoInfo> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get video info: ${response.statusText}`)
    }

    const data = await response.json()
    const video = data.result

    return {
      id: video.uid,
      status: this.mapStatus(video.status?.state),
      playbackUrl: video.status?.state === 'ready' ? this.getPlaybackUrl(video.uid) : undefined,
      thumbnailUrl: video.thumbnail,
      duration: video.duration,
      createdAt: new Date(video.created),
    }
  }

  async delete(videoId: string): Promise<void> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.statusText}`)
    }
  }

  async getStorageInfo(): Promise<VideoStorageInfo> {
    // Cloudflare doesn't provide easy usage stats via API
    // Would need to list all videos and calculate, or use Analytics API
    return {
      minutesStored: 0,
      minutesDelivered: 0,
      storageLimitMinutes: null,
      deliveryLimitMinutes: null,
      withinLimits: true,
    }
  }

  isEnabled(): boolean {
    return true
  }

  private getPlaybackUrl(videoId: string): string {
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`
  }

  private mapStatus(cfStatus?: string): 'uploading' | 'processing' | 'ready' | 'error' {
    switch (cfStatus) {
      case 'queued':
      case 'inprogress':
        return 'processing'
      case 'ready':
        return 'ready'
      case 'error':
        return 'error'
      default:
        return 'uploading'
    }
  }

  private getProgress(cfStatus?: string): number {
    switch (cfStatus) {
      case 'queued':
        return 25
      case 'inprogress':
        return 50
      case 'ready':
        return 100
      case 'error':
        return 0
      default:
        return 0
    }
  }
}
