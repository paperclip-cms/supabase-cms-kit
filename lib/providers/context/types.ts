import { Collection } from '@/lib/types'

/**
 * Application context - represents the current user's scope
 * OSS: Just userId
 * Hosted: userId + projectId + role
 */
export interface AppContext {
  userId: string

  // Hosted-only fields
  projectId?: string
  projectSlug?: string
  role?: 'owner' | 'admin' | 'member'
}

/**
 * Context provider - abstracts ownership model
 * OSS: User owns collections directly
 * Hosted: User accesses collections via project membership
 */
export interface ContextProvider {
  /**
   * Get the current application context for a user
   */
  getContext(userId: string): Promise<AppContext>

  /**
   * Get collections accessible to the user
   */
  getOwnedCollections(userId: string): Promise<Collection[]>

  /**
   * Check if user can create a collection
   * OSS: Always true
   * Hosted: Checks role + subscription status
   */
  canCreateCollection(userId: string): Promise<boolean>

  /**
   * Check if user can edit a specific collection
   * OSS: Checks user_id ownership
   * Hosted: Checks project membership
   */
  canEditCollection(userId: string, collectionId: string): Promise<boolean>

  /**
   * Check if user can delete a specific collection
   * OSS: Checks user_id ownership
   * Hosted: Checks role (owner/admin only)
   */
  canDeleteCollection(userId: string, collectionId: string): Promise<boolean>
}
