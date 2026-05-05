import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export async function getDashboardSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function loginDashboard(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase não configurado.')
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function logoutDashboard() {
  if (!supabase) return
  await supabase.auth.signOut()
}
