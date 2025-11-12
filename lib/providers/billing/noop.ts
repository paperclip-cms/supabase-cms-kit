import type { BillingProvider, Subscription } from './types'

/**
 * No-Op Billing Provider (OSS Default)
 *
 * In self-hosted mode, there is no billing.
 * All features are available, no subscriptions required.
 */
export class NoOpBillingProvider implements BillingProvider {
  async hasActiveSubscription(_contextId: string): Promise<boolean> {
    // Self-hosted = always active
    return true
  }

  async getSubscription(_contextId: string): Promise<Subscription | null> {
    return {
      id: 'self-hosted',
      status: 'active',
      provider: 'none',
    }
  }

  async createCheckoutUrl(_contextId: string, _userId: string): Promise<string> {
    throw new Error('Billing is not available in self-hosted mode')
  }

  async handleWebhook(_payload: any, _signature: string): Promise<void> {
    throw new Error('Billing webhooks are not available in self-hosted mode')
  }
}
