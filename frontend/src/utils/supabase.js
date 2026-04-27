import { createClient } from '@supabase/supabase-js'
import { supabaseStorage } from './capacitorStorage'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Missing Supabase env vars. ' +
    'Create frontend/.env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

// Storage adapter: localStorage on web, encrypted Capacitor Preferences on native.
// Keeps existing browser sessions identical while moving the JWT into the
// platform keystore (iOS Keychain / Android EncryptedSharedPreferences) on device.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
