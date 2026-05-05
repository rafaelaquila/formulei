export const publicEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
} as const

export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl?.trim() && publicEnv.supabaseAnonKey?.trim())
}
