import type { CacheProvider, CacheKey } from '@/lib/providers/cache/types'

/**
 * Cloudflare R2 Cache Provider (Hosted)
 *
 * Stores cache as JSON blobs in Cloudflare R2.
 * Cheap ($0.015/GB storage, FREE egress), fast, globally distributed.
 * Perfect for production/hosted deployments.
 *
 * Requires: @cloudflare/workers-types or aws-sdk/client-s3 (S3-compatible API)
 *
 * Setup:
 * 1. Create R2 bucket in Cloudflare dashboard
 * 2. Get Access Key ID and Secret Access Key
 * 3. Optional: Configure custom domain with CDN
 */
export class R2CacheProvider implements CacheProvider {
  private s3Client: any
  private bucketName: string
  private cdnUrl?: string

  constructor(config: {
    accountId: string
    accessKeyId: string
    secretAccessKey: string
    bucketName: string
    cdnUrl?: string // Optional: Custom domain for R2 bucket
  }) {
    this.bucketName = config.bucketName
    this.cdnUrl = config.cdnUrl

    // Initialize S3-compatible client for R2
    // Requires: npm install @aws-sdk/client-s3
    // const { S3Client } = require('@aws-sdk/client-s3')

    // this.s3Client = new S3Client({
    //   region: 'auto',
    //   endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    //   credentials: {
    //     accessKeyId: config.accessKeyId,
    //     secretAccessKey: config.secretAccessKey,
    //   },
    // })

    throw new Error('R2 provider not yet implemented. Install @aws-sdk/client-s3 and uncomment.')
  }

  async get<T = any>(key: CacheKey): Promise<T | null> {
    try {
      // const { GetObjectCommand } = require('@aws-sdk/client-s3')
      // const filePath = this.getFilePath(key)

      // const command = new GetObjectCommand({
      //   Bucket: this.bucketName,
      //   Key: filePath,
      // })

      // const response = await this.s3Client.send(command)
      // const text = await response.Body.transformToString()

      // return JSON.parse(text) as T

      return null
    } catch (err: any) {
      if (err?.name === 'NoSuchKey') {
        return null
      }
      console.error('R2 cache read error:', err)
      return null
    }
  }

  async set<T = any>(key: CacheKey, value: T): Promise<void> {
    try {
      // const { PutObjectCommand } = require('@aws-sdk/client-s3')
      // const filePath = this.getFilePath(key)
      // const json = JSON.stringify(value)

      // const command = new PutObjectCommand({
      //   Bucket: this.bucketName,
      //   Key: filePath,
      //   Body: json,
      //   ContentType: 'application/json',
      //   CacheControl: 'public, max-age=3600', // CDN cache for 1 hour
      // })

      // await this.s3Client.send(command)
    } catch (err) {
      console.error('R2 cache write error:', err)
      throw err
    }
  }

  async delete(key: CacheKey): Promise<void> {
    try {
      // const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
      // const filePath = this.getFilePath(key)

      // const command = new DeleteObjectCommand({
      //   Bucket: this.bucketName,
      //   Key: filePath,
      // })

      // await this.s3Client.send(command)
    } catch (err) {
      console.error('R2 cache delete error:', err)
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      // const { ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3')

      // // List all objects
      // const listCommand = new ListObjectsV2Command({
      //   Bucket: this.bucketName,
      // })

      // const response = await this.s3Client.send(listCommand)
      // if (!response.Contents) return

      // // Convert glob pattern to regex
      // const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')

      // // Find matching keys
      // const toDelete = response.Contents
      //   .map((obj: any) => this.fileNameToKey(obj.Key))
      //   .filter((key: string) => regex.test(key))
      //   .map((key: string) => ({ Key: this.getFilePath(key) }))

      // if (toDelete.length > 0) {
      //   const deleteCommand = new DeleteObjectsCommand({
      //     Bucket: this.bucketName,
      //     Delete: { Objects: toDelete },
      //   })

      //   await this.s3Client.send(deleteCommand)
      // }
    } catch (err) {
      console.error('R2 cache pattern delete error:', err)
    }
  }

  isEnabled(): boolean {
    return true
  }

  async clear(): Promise<void> {
    try {
      // const { ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3')

      // const listCommand = new ListObjectsV2Command({
      //   Bucket: this.bucketName,
      // })

      // const response = await this.s3Client.send(listCommand)
      // if (!response.Contents || response.Contents.length === 0) return

      // const toDelete = response.Contents.map((obj: any) => ({ Key: obj.Key }))

      // const deleteCommand = new DeleteObjectsCommand({
      //   Bucket: this.bucketName,
      //   Delete: { Objects: toDelete },
      // })

      // await this.s3Client.send(deleteCommand)
    } catch (err) {
      console.error('R2 cache clear error:', err)
    }
  }

  getPublicUrl(key: CacheKey): string | null {
    if (!this.cdnUrl) return null

    const filePath = this.getFilePath(key)
    return `${this.cdnUrl}/${filePath}`
  }

  /**
   * Convert cache key to file path
   */
  private getFilePath(key: CacheKey): string {
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
