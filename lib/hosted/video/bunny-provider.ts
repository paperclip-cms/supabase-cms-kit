import type { VideoStorageProvider, VideoUploadResult, VideoInfo, VideoUploadOptions, VideoStorageInfo } from '@/lib/providers/video/types'

/**
 * Bunny.net Stream Video Provider (Hosted)
 *
 * Uses Bunny.net Stream for video hosting.
 * Pricing: $0.005/GB stored, $0.01/GB delivered (cheapest option!)
 * Includes: Transcoding, adaptive streaming, thumbnails
 *
 * Requires: Bunny.net account with Stream enabled
 */
export class BunnyStreamProvider implements VideoStorageProvider {
  private apiKey: string
  private libraryId: string
  private cdnHostname: string

  constructor(config: { apiKey: string; libraryId: string; cdnHostname: string }) {
    this.apiKey = config.apiKey
    this.libraryId = config.libraryId
    this.cdnHostname = config.cdnHostname
  }

  async uploadVideo(file: File, options?: VideoUploadOptions): Promise<VideoUploadResult> {
    // Create video object first
    const createResponse = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: options?.title || file.name,
        }),
      }
    )

    if (!createResponse.ok) {
      throw new Error(`Failed to create video: ${createResponse.statusText}`)
    }

    const createData = await createResponse.json()
    const videoId = createData.guid

    // Upload file
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
      {
        method: 'PUT',
        headers: {
          AccessKey: this.apiKey,
        },
        body: file,
      }
    )

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload video: ${uploadResponse.statusText}`)
    }

    return {
      id: videoId,
      status: 'processing',
      thumbnailUrl: `https://${this.cdnHostname}/${videoId}/thumbnail.jpg`,
      size: file.size,
      progress: 25,
    }
  }

  async getVideoInfo(videoId: string): Promise<VideoInfo> {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
      {
        headers: {
          AccessKey: this.apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get video info: ${response.statusText}`)
    }

    const video = await response.json()

    return {
      id: video.guid,
      status: this.mapStatus(video.status),
      playbackUrl:
        video.status === 4 ? `https://${this.cdnHostname}/${video.guid}/playlist.m3u8` : undefined,
      thumbnailUrl: `https://${this.cdnHostname}/${video.guid}/thumbnail.jpg`,
      duration: video.length,
      createdAt: new Date(video.dateUploaded),
    }
  }

  async delete(videoId: string): Promise<void> {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          AccessKey: this.apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.statusText}`)
    }
  }

  async getStorageInfo(): Promise<VideoStorageInfo> {
    // Would need to get statistics from Bunny API
    // https://docs.bunny.net/reference/videolibrarypublic_getvideolibrary
    const response = await fetch(`https://video.bunnycdn.com/library/${this.libraryId}/statistics`, {
      headers: {
        AccessKey: this.apiKey,
      },
    })

    if (!response.ok) {
      return {
        minutesStored: 0,
        minutesDelivered: 0,
        storageLimitMinutes: null,
        deliveryLimitMinutes: null,
        withinLimits: true,
      }
    }

    const stats = await response.json()

    return {
      minutesStored: Math.round((stats.storageUsed || 0) / (1024 * 1024 * 1024)), // Rough estimate
      minutesDelivered: Math.round((stats.bandwidth || 0) / (1024 * 1024 * 1024)),
      storageLimitMinutes: null,
      deliveryLimitMinutes: null,
      withinLimits: true,
    }
  }

  isEnabled(): boolean {
    return true
  }

  private mapStatus(bunnyStatus: number): 'uploading' | 'processing' | 'ready' | 'error' {
    // Bunny status codes:
    // 0 = Queued
    // 1 = Processing
    // 2 = Encoding
    // 3 = Finished
    // 4 = Resolution finished
    // 5 = Error
    switch (bunnyStatus) {
      case 0:
        return 'uploading'
      case 1:
      case 2:
      case 3:
        return 'processing'
      case 4:
        return 'ready'
      case 5:
        return 'error'
      default:
        return 'uploading'
    }
  }
}
