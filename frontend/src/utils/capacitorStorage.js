// Storage adapter for the Supabase JS client.
//
// On native (Capacitor) we persist the auth token via @capacitor/preferences,
// which is encrypted on iOS (Keychain) and uses EncryptedSharedPreferences on
// Android. On the web we fall back to localStorage so existing browser sessions
// keep working unchanged.
//
// Supabase's storage interface accepts sync OR async getItem/setItem/removeItem.
// We always return promises here — Supabase awaits them either way.

import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const isNative = () => Capacitor?.isNativePlatform?.() === true

const webStorage = {
  async getItem(key) {
    try { return globalThis.localStorage?.getItem(key) ?? null } catch { return null }
  },
  async setItem(key, value) {
    try { globalThis.localStorage?.setItem(key, value) } catch { /* quota / private mode */ }
  },
  async removeItem(key) {
    try { globalThis.localStorage?.removeItem(key) } catch { /* noop */ }
  },
}

const nativeStorage = {
  async getItem(key) {
    const { value } = await Preferences.get({ key })
    return value ?? null
  },
  async setItem(key, value) {
    await Preferences.set({ key, value })
  },
  async removeItem(key) {
    await Preferences.remove({ key })
  },
}

export const supabaseStorage = isNative() ? nativeStorage : webStorage
