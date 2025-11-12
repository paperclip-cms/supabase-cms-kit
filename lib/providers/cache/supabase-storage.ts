import type { CacheProvider, CacheKey } from './types'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase Storage Cache Provider (OSS)
 *
 * Stores cache as JSON blobs in Supabase Storage.
 * Free for OSS users (already have Supabase).
 * Persistent, globally distributed via CDN.
 *
 * Storage bucket: 'cache' (public, with CDN)
 * Path format: cache/{key}.json
 *
 * Your app fetches from storage, users never access directly.
 */
export class SupabaseStorageCacheProvider implements CacheProvider {
  private bucketName: string

  constructor(bucketName: string = 'cache') {
    this.bucketName = bucketName
  }

  async get<T = any>(key: CacheKey): Promise<T | null> {
    try {
      const supabase = await createClient()
      const filePath = this.getFilePath(key)

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filePath)

      if (error || !data) {
        return null
      }

      const text = await data.text()
      return JSON.parse(text) as T
    } catch (err) {
      console.error('Cache read error:', err)
      return null
    }
  }

  async set<T = any>(key: CacheKey, value: T): Promise<void> {
    try {
      const supabase = await createClient()
      const filePath = this.getFilePath(key)
      const json = JSON.stringify(value)

      // Upload (upsert if exists)
      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, json, {
          contentType: 'application/json',
          upsert: true,
          cacheControl: '3600', // Cache in CDN for 1 hour
        })

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Cache write error:', err)
      throw err
    }
  }

  async delete(key: CacheKey): Promise<void> {
    try {
      const supabase = await createClient()
      const filePath = this.getFilePath(key)

      await supabase.storage.from(this.bucketName).remove([filePath])
    } catch (err) {
      console.error('Cache delete error:', err)
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const supabase = await createClient()

      // List all files
      const { data: files } = await supabase.storage.from(this.bucketName).list()

      if (!files) return

      // Convert glob pattern to regex
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')

      // Find matching files
      const toDelete = files
        .map((f) => this.fileNameToKey(f.name))
        .filter((key) => regex.test(key))
        .map((key) => this.getFilePath(key))

      if (toDelete.length > 0) {
        await supabase.storage.from(this.bucketName).remove(toDelete)
      }
    } catch (err) {
      console.error('Cache pattern delete error:', err)
    }
  }

  isEnabled(): boolean {
    return true
  }

  async clear(): Promise<void> {
    try {
      const supabase = await createClient()

      // List all files
      const { data: files } = await supabase.storage.from(this.bucketName).list()

      if (!files || files.length === 0) return

      const filePaths = files.map((f) => f.name)
      await supabase.storage.from(this.bucketName).remove(filePaths)
    } catch (err) {
      console.error('Cache clear error:', err)
    }
  }

  getPublicUrl(key: CacheKey): string | null {
    // Note: This returns the CDN URL, but you probably won't use it directly
    // Your app should be the gateway
    const supabase = createClient()
    const filePath = this.getFilePath(key)

    const { data } = supabase.storage.from(this.bucketName).getPublicUrl(filePath)

    return data?.publicUrl || null
  }

  /**
   * Convert cache key to file path
   */
  private getFilePath(key: CacheKey): string {
    // Replace special characters to make it filesystem-safe
    const safeName = key.replace(/[^a-zA-Z0-9-_:]/g, '_')
    return `${safeName}.json`
  }

  /**
   * Convert file name back to cache key
   */
  private fileNameToKey(fileName: string): CacheKey {
    return fileName.replace(/\.json$/, '')
  }
}
