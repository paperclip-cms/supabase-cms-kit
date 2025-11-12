import type { CacheProvider, CacheKey, CacheEntry } from './types'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * File System Cache Provider (OSS Opt-in)
 *
 * Stores cache entries as JSON files on disk.
 * Persistent across restarts, no external dependencies.
 * Good for single-instance deployments with disk access.
 *
 * WARNING: Not suitable for serverless environments or multi-instance deployments.
 */
export class FileSystemCacheProvider implements CacheProvider {
  private cacheDir: string

  constructor(cacheDir: string = './.cache') {
    this.cacheDir = path.resolve(cacheDir)
  }

  async get<T = any>(key: CacheKey): Promise<T | null> {
    try {
      const filePath = this.getFilePath(key)
      const data = await fs.readFile(filePath, 'utf-8')
      const entry: CacheEntry<T> = JSON.parse(data)

      // Check if expired
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        await this.delete(key)
        return null
      }

      return entry.value
    } catch (err) {
      // File doesn't exist or read error
      return null
    }
  }

  async set<T = any>(key: CacheKey, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
    }

    const filePath = this.getFilePath(key)

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    // Write to temp file then rename (atomic operation)
    const tempPath = `${filePath}.tmp`
    await fs.writeFile(tempPath, JSON.stringify(entry), 'utf-8')
    await fs.rename(tempPath, filePath)
  }

  async delete(key: CacheKey): Promise<void> {
    try {
      const filePath = this.getFilePath(key)
      await fs.unlink(filePath)
    } catch (err) {
      // File doesn't exist - that's fine
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    // Convert glob pattern to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')

    try {
      await this.walkDir(this.cacheDir, async (filePath: string) => {
        const relativePath = path.relative(this.cacheDir, filePath)
        const key = this.filePathToKey(relativePath)

        if (regex.test(key)) {
          await fs.unlink(filePath)
        }
      })
    } catch (err) {
      // Directory might not exist
    }
  }

  isEnabled(): boolean {
    return true
  }

  async clear(): Promise<void> {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true })
    } catch (err) {
      // Directory might not exist
    }
  }

  /**
   * Convert cache key to file path
   */
  private getFilePath(key: CacheKey): string {
    // Replace special characters to make it filesystem-safe
    const safeName = key.replace(/[^a-zA-Z0-9-_:]/g, '_')
    return path.join(this.cacheDir, `${safeName}.json`)
  }

  /**
   * Convert file path back to cache key
   */
  private filePathToKey(filePath: string): CacheKey {
    return path.basename(filePath, '.json')
  }

  /**
   * Recursively walk directory
   */
  private async walkDir(dir: string, callback: (filePath: string) => Promise<void>): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await this.walkDir(fullPath, callback)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        await callback(fullPath)
      }
    }
  }
}
