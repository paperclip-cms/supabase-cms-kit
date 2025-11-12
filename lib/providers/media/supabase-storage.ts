import type { MediaStorageProvider, UploadResult, UploadOptions, StorageInfo } from './types'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase Storage Media Provider (OSS Default)
 *
 * Uses Supabase Storage for images and files.
 * Free tier: 1GB storage, 2GB bandwidth/month
 * Good for OSS users who already have Supabase.
 */
export class SupabaseStorageMediaProvider implements MediaStorageProvider {
  private bucketName: string

  constructor(bucketName: string = 'media') {
    this.bucketName = bucketName
  }

  async uploadImage(file: File, options?: UploadOptions): Promise<UploadResult> {
    return this.upload(file, options)
  }

  async uploadFile(file: File, options?: UploadOptions): Promise<UploadResult> {
    return this.upload(file, options)
  }

  private async upload(file: File, options?: UploadOptions): Promise<UploadResult> {
    const supabase = await createClient()

    // Generate filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const ext = file.name.split('.').pop()
    const filename = options?.filename || `${timestamp}-${random}.${ext}`

    // Build path
    const path = options?.path ? `${options.path}/${filename}` : filename

    // Upload
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(path, file, {
        contentType: options?.contentType || file.type,
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      size: file.size,
      contentType: file.type,
      id: data.path,
      cdnUrl: urlData.publicUrl, // Supabase CDN URL
    }
  }

  async delete(urlOrId: string): Promise<void> {
    const supabase = await createClient()

    // Extract path from URL if it's a full URL
    let path = urlOrId
    if (urlOrId.startsWith('http')) {
      const url = new URL(urlOrId)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
      if (pathMatch) {
        path = pathMatch[1]
      }
    }

    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    // Note: Supabase doesn't provide easy way to get bucket usage
    // Would need to list all files and sum sizes, or use custom function
    // For now, return placeholder
    return {
      usedBytes: 0,
      limitBytes: 1024 * 1024 * 1024, // 1GB free tier
      withinLimits: true,
      usedGb: 0,
      limitGb: 1,
    }
  }

  isEnabled(): boolean {
    return true
  }
}
