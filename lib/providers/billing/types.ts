/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

/**
 * Payment provider type
 */
export type PaymentProvider = 'polar' | 'flowglad' | 'stripe' | 'none'

/**
 * Subscription information
 */
export interface Subscription {
  id: string
  status: SubscriptionStatus
  provider: PaymentProvider

  // Optional fields
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
}

/**
 * Billing provider interface
 */
export interface BillingProvider {
  /**
   * Check if a project/user has an active subscription
   * OSS: Always returns true
   * Hosted: Checks actual subscription status
   */
  hasActiveSubscription(contextId: string): Promise<boolean>

  /**
   * Get subscription details
   * OSS: Returns 'none' provider
   * Hosted: Returns actual subscription
   */
  getSubscription(contextId: string): Promise<Subscription | null>

  /**
   * Create a checkout URL for subscribing
   * OSS: Throws error
   * Hosted: Returns Polar/Flowglad/Stripe checkout URL
   */
  createCheckoutUrl(contextId: string, userId: string): Promise<string>

  /**
   * Handle webhook from payment provider
   * OSS: Throws error
   * Hosted: Processes subscription events
   */
  handleWebhook(payload: any, signature: string): Promise<void>
}
