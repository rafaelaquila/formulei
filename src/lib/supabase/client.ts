import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, publicEnv } from '@/lib/env'

let client: SupabaseClient | null = null

function getOrCreateClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    client = createClient(publicEnv.supabaseUrl!, publicEnv.supabaseAnonKey!)
  }
  return client
}

/** Cliente singleton; null se env não estiver definido (fallback local no app). */
export const supabase = getOrCreateClient()
