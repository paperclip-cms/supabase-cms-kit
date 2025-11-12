import { createClient } from '@/lib/supabase/server'
import type { AppContext, ContextProvider } from './types'
import type { Database } from '@/lib/supabase/types'

type Collection = Database['public']['Tables']['collections']['Row']

/**
 * User Context Provider (OSS Default)
 *
 * In self-hosted mode, users own collections directly.
 * No projects, no team collaboration - just simple user → collection ownership.
 */
export class UserContextProvider implements ContextProvider {
  async getContext(userId: string): Promise<AppContext> {
    return {
      userId,
    }
  }

  async getOwnedCollections(userId: string): Promise<Collection[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching collections:', error)
      return []
    }

    return data || []
  }

  async canCreateCollection(userId: string): Promise<boolean> {
    // OSS: No limits, always allow
    return true
  }

  async canEditCollection(userId: string, collectionId: string): Promise<boolean> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', collectionId)
      .single()

    // User can edit if they own the collection
    return data?.user_id === userId
  }

  async canDeleteCollection(userId: string, collectionId: string): Promise<boolean> {
    // Same as edit - user must own it
    return this.canEditCollection(userId, collectionId)
  }
}
