# Storage Providers

Architecture for media (images/files) and video storage.

## Overview

Two separate provider systems:

1. **Media Storage** - Images, PDFs, documents, etc.
2. **Video Storage** - Video files with transcoding and streaming

They're separate because video has fundamentally different requirements (transcoding, adaptive streaming, thumbnails).

## Media Storage (Images & Files)

### Providers

**Supabase Storage** (OSS Default)
- Uses existing Supabase instance
- FREE tier: 1GB storage, 2GB bandwidth/month
- Good for: OSS users, small-medium sites
- Setup: Create 'media' bucket in Supabase dashboard

**Cloudflare R2** (Hosted)
- $0.015/GB storage, FREE egress
- Best for: High-traffic hosted deployments
- Setup: Requires @aws-sdk/client-s3, Cloudflare account

### Usage (Not Yet Implemented)

```typescript
import { getMediaStorageProvider } from '@/lib/providers'

const storage = getMediaStorageProvider()

// Upload image
const result = await storage.uploadImage(file, {
  path: 'avatars',
  public: true,
})
console.log(result.url) // Public URL

// Upload file
const result = await storage.uploadFile(pdfFile, {
  path: 'documents',
})

// Delete
await storage.delete(result.url)

// Get usage
const info = await storage.getStorageInfo()
console.log(`${info.usedGb} GB used of ${info.limitGb} GB`)
```

## Video Storage

### Providers

**Disabled** (Default)
- Video support is opt-in
- Most CMSes don't need video

**Cloudflare Stream** (Hosted)
- $5 per 1,000 minutes stored
- $1 per 1,000 minutes delivered
- Includes: Transcoding, thumbnails, adaptive streaming (HLS)
- Good for: Small-medium video usage

**Bunny.net Stream** (Hosted - Cheapest!)
- $0.005/GB stored (~$0.15/hour of video)
- $0.01/GB delivered
- Same features as Cloudflare Stream
- Good for: Cost-conscious deployments, high traffic

### Usage (Not Yet Implemented)

```typescript
import { getVideoStorageProvider } from '@/lib/providers'

const video = getVideoStorageProvider()

// Upload video
const result = await video.uploadVideo(videoFile, {
  title: 'My Video',
  public: true,
})
console.log(result.id) // Video ID
console.log(result.status) // 'processing'

// Check status
const info = await video.getVideoInfo(result.id)
if (info.status === 'ready') {
  console.log(info.playbackUrl) // HLS URL for player
  console.log(info.thumbnailUrl) // Poster image
}

// Delete
await video.delete(result.id)
```

## Implementation Status

✅ **Created:**
- Provider interfaces and types
- Supabase Storage media provider
- R2 media provider (stub)
- Cloudflare Stream video provider
- Bunny.net Stream video provider
- Disabled video provider (default)

❌ **Not Yet Implemented:**
- Integration with existing upload code
- Provider registry initialization
- Frontend UI for provider selection
- Migration from current Supabase Storage usage

## Next Steps

To integrate these providers:

1. **Add to provider registry** (`lib/providers/index.ts`)
   - Initialize media storage provider based on env vars
   - Initialize video storage provider based on env vars

2. **Update existing upload logic** to use providers
   - Currently uses Supabase Storage directly
   - Replace with `getMediaStorageProvider().uploadImage()`

3. **Add video upload UI** (optional)
   - New field type: "Video"
   - Upload component with progress tracking
   - Video player for previewing

4. **Add usage tracking** (hosted)
   - Track storage bytes per project
   - Track video minutes per project
   - Enforce limits based on plan

## Cost Comparison

### 100 hours of video storage + 10,000 views

**Cloudflare Stream:**
- Storage: 100 hours × $5/1000 = $0.50
- Delivery: 100 hours × 10,000 views = 1,000,000 min × $1/1000 = $1,000
- **Total: $1,000.50/month**

**Bunny.net Stream:**
- Storage: 100 hours × 3GB/hour = 300GB × $0.005 = $1.50
- Delivery: 1,000,000 min × 1GB/10min = 100TB × $0.01/GB = $1,000
- **Total: $1,001.50/month**

(Both are similar - Bunny is slightly cheaper on storage, similar on delivery)

### 10 hours of video storage + 1,000 views

**Cloudflare Stream:**
- Storage: $0.05
- Delivery: $10
- **Total: $10.05/month**

**Bunny.net Stream:**
- Storage: $0.15
- Delivery: $10
- **Total: $10.15/month**

For your $10/mo hosted plan, you could support:
- ~10 hours of video per user
- ~1,000 views per month
- More if you impose limits or charge extra for video

## Recommendations

**For Now:**
- Keep Supabase Storage for images/files (already works)
- Add provider pattern but don't switch yet
- Disable video by default

**For Hosted (When Ready):**
- Media: Switch to R2 (cheaper egress)
- Video: Start with Cloudflare Stream (simpler)
- Consider Bunny if costs grow

**For Future:**
- Add video limits (e.g., 5 videos per user, 100 views/month)
- Charge extra for more video usage
- Or make video a premium feature only
