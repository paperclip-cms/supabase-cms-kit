# Provider Architecture

This directory contains the provider pattern implementation that enables the split between open-source (self-hosted) and hosted (paid) versions of Paperclip CMS.

## Overview

The provider pattern allows the same codebase to support two deployment modes:

- **OSS Mode** (default): User-owned collections, no limits, no billing
- **Hosted Mode**: Project-based multi-tenancy, billing, analytics, team collaboration

## How It Works

### Environment-Based Activation

Providers are initialized based on the `PAPERCLIP_HOSTED` environment variable:

```bash
# OSS Mode (default)
# No environment variable needed

# Hosted Mode
PAPERCLIP_HOSTED=true
NEXT_PUBLIC_PAPERCLIP_HOSTED=true
```

### Provider Types

#### 1. Context Provider

Abstracts the ownership model (user-owned vs project-owned).

**OSS**: Collections belong directly to users
**Hosted**: Collections belong to projects, users access via membership

```typescript
import { getContextProvider } from '@/lib/providers'

const context = getContextProvider()
const collections = await context.getOwnedCollections(userId)
const canCreate = await context.canCreateCollection(userId)
```

#### 2. Billing Provider

Manages subscriptions and payment processing.

**OSS**: No-op, always returns active
**Hosted**: Integrates with Polar/Flowglad/Stripe

```typescript
import { getBillingProvider } from '@/lib/providers'

const billing = getBillingProvider()
const isActive = await billing.hasActiveSubscription(projectId)
```

#### 3. Analytics Provider

Tracks user behavior and usage metrics.

**OSS**: Silent no-op
**Hosted**: PostHog integration

```typescript
import { getAnalyticsProvider } from '@/lib/providers'

const analytics = getAnalyticsProvider()
await analytics.track({
  event: 'collection_created',
  userId,
  projectId,
  properties: { collection_name: 'Blog Posts' }
})
```

#### 4. Storage Provider

Monitors storage usage and enforces limits.

**OSS**: Unlimited, no tracking
**Hosted**: Tracks usage, soft limits

```typescript
import { getStorageProvider } from '@/lib/providers'

const storage = getStorageProvider()
const info = await storage.getStorageInfo(projectId)
const canUpload = await storage.canUpload(projectId, fileSizeBytes)
```

#### 5. Cache Provider (Opt-in for Both Modes)

Caches published content for fast queries.

**OSS**: Disabled by default, can opt-in to memory/filesystem/Redis
**Hosted**: Redis/Upstash for distributed caching

Unlike other providers, cache is **opt-in for both OSS and hosted**. OSS users can enable caching by setting environment variables.

```typescript
import { getCacheProvider } from '@/lib/providers'

const cache = getCacheProvider()

// Cache a published item
await cache.set(`item:${slug}`, itemData, 3600) // 1 hour TTL

// Retrieve from cache
const cachedItem = await cache.get(`item:${slug}`)

// Invalidate cache
await cache.delete(`item:${slug}`)

// Invalidate pattern (e.g., all blog posts)
await cache.deletePattern('collection:blog:*')
```

**Cache Options:**

| Provider | OSS | Hosted | Persistent | Distributed | External Deps |
|----------|-----|--------|------------|-------------|---------------|
| `disabled` | ✓ (default) | - | - | - | None |
| `memory` | ✓ | ✓ | ❌ | ❌ | None |
| `filesystem` | ✓ | - | ✓ | ❌ | None |
| `redis` | ✓ | ✓ | ✓ | ✓ | ioredis |
| `upstash` | ✓ | ✓ (recommended) | ✓ | ✓ | @upstash/redis |

**Configuration:**

```bash
# Disabled (default)
CACHE_PROVIDER=disabled

# Memory cache (good for dev)
CACHE_PROVIDER=memory

# File system cache (good for single-instance)
CACHE_PROVIDER=filesystem
CACHE_FILESYSTEM_DIR=./.cache

# Redis cache (good for production)
CACHE_PROVIDER=redis
REDIS_URL=redis://localhost:6379

# Upstash (serverless-friendly)
CACHE_PROVIDER=upstash
UPSTASH_REDIS_URL=your-url
UPSTASH_REDIS_TOKEN=your-token
```

## Directory Structure

```
/lib/providers/
├── context/
│   ├── types.ts              # ContextProvider interface
│   └── user-context.ts       # OSS: User-owned collections
├── billing/
│   ├── types.ts              # BillingProvider interface
│   └── noop.ts              # OSS: No billing
├── analytics/
│   ├── types.ts              # AnalyticsProvider interface
│   └── noop.ts              # OSS: No analytics
├── storage/
│   ├── types.ts              # StorageProvider interface
│   └── noop.ts              # OSS: No limits
├── cache/
│   ├── types.ts              # CacheProvider interface
│   ├── disabled.ts           # OSS default: No caching
│   ├── memory.ts             # Opt-in: In-memory cache
│   └── filesystem.ts         # Opt-in: File system cache
├── index.ts                  # Provider registry
├── features.ts               # Client-side feature flags
└── README.md                 # This file

/lib/hosted/                  # Hosted implementations (BSL/proprietary)
├── context/
│   └── project-context.ts    # Hosted: Project-owned collections
├── billing/
│   ├── polar-provider.ts     # Polar.sh integration
│   ├── flowglad-provider.ts  # Flowglad integration
│   └── stripe-provider.ts    # Stripe integration
├── analytics/
│   └── posthog-provider.ts   # PostHog integration
├── storage/
│   └── storage-provider.ts   # Storage tracking & limits
└── cache/
    └── redis-provider.ts     # Redis/Upstash cache
```

## Database Schema

### OSS Mode

```sql
collections (
  id, slug, name, config,
  user_id NOT NULL,  -- Direct ownership
  project_id NULL
)
```

### Hosted Mode

```sql
projects (
  id, name, slug,
  subscription_id, subscription_status, subscription_provider
)

project_members (
  project_id, user_id, role
)

collections (
  id, slug, name, config,
  user_id NULL,
  project_id NOT NULL  -- Project ownership
)
```

Both modes coexist in the same database - a collection must have either `user_id` OR `project_id` (enforced by check constraint).

## Usage in Application Code

### API Routes

```typescript
// app/api/collections/route.ts
import { getContextProvider, getAnalyticsProvider } from '@/lib/providers'

export async function POST(req: Request) {
  const user = await getUser(req)
  const context = getContextProvider()
  const analytics = getAnalyticsProvider()

  // Check permissions (mode-aware)
  const canCreate = await context.canCreateCollection(user.id)
  if (!canCreate) {
    return Response.json({ error: 'Upgrade required' }, { status: 402 })
  }

  // Get context (OSS: {userId}, Hosted: {userId, projectId, role})
  const appContext = await context.getContext(user.id)

  // Create collection
  const { data } = await supabase.from('collections').insert({
    ...body,
    user_id: appContext.projectId ? null : appContext.userId,
    project_id: appContext.projectId || null
  })

  // Track event (OSS: no-op, Hosted: PostHog)
  await analytics.track({
    event: 'collection_created',
    userId: user.id,
    projectId: appContext.projectId,
    properties: { collection_id: data.id }
  })

  return Response.json(data)
}
```

### Components

```typescript
// components/settings/settings-page.tsx
import { useFeatures } from '@/lib/providers/features'

export function SettingsPage() {
  const features = useFeatures()

  return (
    <div>
      <h1>Settings</h1>

      {/* Always shown */}
      <ProfileSettings />

      {/* Hosted-only */}
      {features.projects && <ProjectSettings />}
      {features.billing && <BillingSettings />}
      {features.analytics && <AnalyticsDashboard />}
    </div>
  )
}
```

## Adding New Hosted Features

1. **Define the interface** in `/lib/providers/{feature}/types.ts`
2. **Create no-op implementation** in `/lib/providers/{feature}/noop.ts`
3. **Implement hosted version** in `/lib/hosted/{feature}/{provider}.ts`
4. **Register in provider registry** (`/lib/providers/index.ts`)
5. **Add feature flag** to `/lib/providers/features.ts`
6. **Use in application** via `get{Feature}Provider()`

## Licensing

- `/lib/providers/` → MIT (open source interfaces)
- `/lib/hosted/` → BSL 1.1 or Proprietary (hosted implementations)

## Environment Variables

See `.env.example` for full configuration options:

```bash
# Hosted Mode
PAPERCLIP_HOSTED=true
NEXT_PUBLIC_PAPERCLIP_HOSTED=true

# Billing (choose one)
POLAR_API_KEY=...
POLAR_WEBHOOK_SECRET=...
POLAR_PRODUCT_ID=...

# Analytics
POSTHOG_API_KEY=...
POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Testing Both Modes

### Test OSS Mode

```bash
# No PAPERCLIP_HOSTED variable
npm run dev
```

### Test Hosted Mode

```bash
# Set environment variable
PAPERCLIP_HOSTED=true npm run dev
```

Note: Hosted mode requires the `/lib/hosted/` implementations to be present.

## Next Steps

To complete the hosted implementation:

1. **Implement hosted providers** in `/lib/hosted/`
2. **Add API routes** for billing webhooks (`/api/billing/webhook`)
3. **Build settings UI** for project/billing management
4. **Create onboarding flow** for new hosted users
5. **Add project creation** on first signup (hosted mode)
6. **Implement team invitation** system

## Questions?

See the main architecture document or open an issue.
