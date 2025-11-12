# Cache Provider - Usage Guide

## Architecture

```
User Request
    ↓
Next.js API Route
    ↓
Cache Provider (check cache)
    ├─ Cache HIT → Return cached JSON
    └─ Cache MISS → Query DB → Cache result → Return
```

**Key Points:**
- All requests go through your Next.js app (not direct CDN access)
- You control URLs, routing, authentication, rate limiting
- Cache is transparent to users
- CDN accelerates object storage reads

## Usage Example

### 1. Publishing Flow (Write to Cache)

```typescript
// app/api/collections/[slug]/items/[itemSlug]/publish/route.ts
import { getCacheProvider } from '@/lib/providers'
import { getAnalyticsProvider } from '@/lib/providers'

export async function POST(
  req: Request,
  { params }: { params: { slug: string; itemSlug: string } }
) {
  const cache = getCacheProvider()
  const analytics = getAnalyticsProvider()

  // 1. Update database
  const { data: item } = await supabase
    .from('items')
    .update({ published_at: new Date().toISOString() })
    .eq('slug', params.itemSlug)
    .select()
    .single()

  // 2. Cache the published item
  const cacheKey = `item:${params.slug}:${params.itemSlug}`
  await cache.set(cacheKey, item)

  // 3. Track analytics
  await analytics.track({
    event: 'item_published',
    properties: { collection: params.slug, item: params.itemSlug },
  })

  return Response.json({ success: true })
}
```

### 2. Reading Flow (Read from Cache)

```typescript
// app/api/public/collections/[slug]/items/[itemSlug]/route.ts
import { getCacheProvider } from '@/lib/providers'

export async function GET(
  req: Request,
  { params }: { params: { slug: string; itemSlug: string } }
) {
  const cache = getCacheProvider()
  const cacheKey = `item:${params.slug}:${params.itemSlug}`

  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) {
    return Response.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=60', // Browser cache for 1 min
      },
    })
  }

  // Cache miss - query database
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('slug', params.itemSlug)
    .eq('published_at', 'not.null') // Only published items
    .single()

  if (!item) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  // Cache for next time
  await cache.set(cacheKey, item)

  return Response.json(item, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
```

### 3. Invalidation Flow (Update/Unpublish)

```typescript
// app/api/collections/[slug]/items/[itemSlug]/route.ts
import { getCacheProvider } from '@/lib/providers'

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string; itemSlug: string } }
) {
  const cache = getCacheProvider()
  const body = await req.json()

  // Update database
  const { data: item } = await supabase
    .from('items')
    .update(body)
    .eq('slug', params.itemSlug)
    .select()
    .single()

  // Invalidate cache
  const cacheKey = `item:${params.slug}:${params.itemSlug}`
  await cache.delete(cacheKey)

  // If still published, re-cache
  if (item.published_at) {
    await cache.set(cacheKey, item)
  }

  return Response.json(item)
}
```

### 4. Bulk Invalidation (Collection Updates)

```typescript
// app/api/collections/[slug]/route.ts
import { getCacheProvider } from '@/lib/providers'

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const cache = getCacheProvider()

  // Update collection metadata
  await supabase.from('collections').update(...).eq('slug', params.slug)

  // Invalidate all cached items in this collection
  await cache.deletePattern(`item:${params.slug}:*`)

  return Response.json({ success: true })
}
```

## Cache Providers

### Supabase Storage (Free for OSS)

```bash
CACHE_PROVIDER=supabase-storage
CACHE_STORAGE_BUCKET=cache
```

**Setup:**
1. Create a public bucket named 'cache' in Supabase dashboard
2. Disable RLS on the bucket (or set permissive policies)
3. Optionally configure CDN in Supabase settings

**Pros:**
- FREE (included with Supabase)
- Globally distributed via CDN
- No extra dependencies

**Cons:**
- Requires Supabase instance
- May have rate limits on free tier

### Cloudflare R2 (Cheap for Production)

```bash
CACHE_PROVIDER=r2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET_NAME=cache
R2_CDN_URL=https://cache.yourdomain.com (optional)
```

**Setup:**
1. Install: `npm install @aws-sdk/client-s3`
2. Create R2 bucket in Cloudflare dashboard
3. Generate API tokens (Access Key ID + Secret)
4. Optional: Configure custom domain with CDN

**Pros:**
- Cheapest ($0.015/GB storage, FREE egress)
- Fast globally (Cloudflare network)
- No rate limits

**Cons:**
- Requires AWS SDK dependency
- Cloudflare account needed

### Vercel Blob (Simple for Vercel)

```bash
CACHE_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=vercel_blob_... (auto-set by Vercel)
```

**Setup:**
1. Install: `npm install @vercel/blob`
2. Enable Blob Storage in Vercel dashboard
3. Token is automatically set in production

**Pros:**
- Dead simple on Vercel
- Globally distributed
- No config needed

**Cons:**
- Only works on Vercel
- More expensive than R2
- Requires Vercel account

### File System (Dev/Testing)

```bash
CACHE_PROVIDER=filesystem
CACHE_FILESYSTEM_DIR=./.cache
```

**Pros:**
- No external dependencies
- Works anywhere
- Good for development

**Cons:**
- Not shared across instances
- Lost on serverless deployments
- No CDN acceleration

## Metrics & Monitoring

Track cache performance:

```typescript
import { getCacheProvider, getAnalyticsProvider } from '@/lib/providers'

export async function GET(req: Request) {
  const cache = getCacheProvider()
  const analytics = getAnalyticsProvider()

  const cacheKey = 'item:...'
  const cached = await cache.get(cacheKey)

  // Track cache hit/miss
  await analytics.track({
    event: cached ? 'cache_hit' : 'cache_miss',
    properties: { key: cacheKey },
  })

  // ... rest of handler
}
```

## Best Practices

1. **Cache published content only** - Don't cache draft/private content
2. **Use descriptive keys** - `item:blog:my-post`, not `abc123`
3. **Invalidate on updates** - Delete cache when content changes
4. **Set browser cache** - Add `Cache-Control` headers for CDN
5. **Monitor hit rate** - Track cache effectiveness with analytics
6. **Graceful degradation** - If cache fails, fall back to DB
7. **Use patterns for bulk ops** - `deletePattern('item:blog:*')`

## Security

**Important:** Cache is for PUBLIC content only.

- Never cache authenticated/private data
- Never cache user-specific data
- Cache storage should be public (object storage)
- Your app enforces auth before serving cached data

Example:

```typescript
export async function GET(req: Request) {
  // 1. Check authentication FIRST
  const user = await getUser(req)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Then check cache for PUBLIC data
  const cache = getCacheProvider()
  const cached = await cache.get('item:...')

  // Your app controls access, not the cache
}
```

## Troubleshooting

### Cache not working?

1. Check `cache.isEnabled()` returns true
2. Verify env vars are set correctly
3. Check bucket/storage exists and is accessible
4. Look for errors in console logs

### High cache miss rate?

1. Verify cache keys are consistent
2. Check if cache is being invalidated too often
3. Ensure cache writes are completing successfully
4. Monitor object storage for actual files

### Slow cache reads?

1. Enable CDN for your object storage
2. Consider geographic distribution
3. Check network latency to storage provider
4. May need to upgrade storage tier
