/**
 * Analytics event
 */
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  projectId?: string
}

/**
 * User traits for identification
 */
export interface UserTraits {
  email?: string
  name?: string
  createdAt?: Date
  [key: string]: any
}

/**
 * Analytics provider interface
 */
export interface AnalyticsProvider {
  /**
   * Track an event
   * OSS: No-op
   * Hosted: Sends to PostHog
   */
  track(event: AnalyticsEvent): Promise<void>

  /**
   * Identify a user
   * OSS: No-op
   * Hosted: Sends to PostHog
   */
  identify(userId: string, traits?: UserTraits): Promise<void>

  /**
   * Track a page view
   * OSS: No-op
   * Hosted: Sends to PostHog
   */
  page(userId: string, pageName: string, properties?: Record<string, any>): Promise<void>
}
