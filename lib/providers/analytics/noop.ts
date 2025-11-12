import type { AnalyticsProvider, AnalyticsEvent, UserTraits } from './types'

/**
 * No-Op Analytics Provider (OSS Default)
 *
 * In self-hosted mode, we don't track analytics.
 * All methods are silent no-ops.
 */
export class NoOpAnalyticsProvider implements AnalyticsProvider {
  async track(_event: AnalyticsEvent): Promise<void> {
    // Silent no-op
  }

  async identify(_userId: string, _traits?: UserTraits): Promise<void> {
    // Silent no-op
  }

  async page(_userId: string, _pageName: string, _properties?: Record<string, any>): Promise<void> {
    // Silent no-op
  }
}
