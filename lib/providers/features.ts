'use client'

/**
 * Feature flags for conditional UI rendering
 * These are based on environment variables and determine what features are available
 */
export interface Features {
  /** Whether projects/teams are available (hosted only) */
  projects: boolean

  /** Whether billing is available (hosted only) */
  billing: boolean

  /** Whether analytics tracking is active (hosted only) */
  analytics: boolean

  /** Whether storage quotas are enforced (hosted only) */
  storageQuotas: boolean
}

/**
 * Get available features based on environment
 */
export function getFeatures(): Features {
  const isHosted = process.env.NEXT_PUBLIC_PAPERCLIP_HOSTED === 'true'

  return {
    projects: isHosted,
    billing: isHosted,
    analytics: isHosted,
    storageQuotas: isHosted,
  }
}

/**
 * React hook for accessing feature flags
 */
export function useFeatures(): Features {
  return getFeatures()
}

/**
 * Check if running in hosted mode
 */
export function isHostedMode(): boolean {
  return process.env.NEXT_PUBLIC_PAPERCLIP_HOSTED === 'true'
}
