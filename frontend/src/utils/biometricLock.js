// Biometric unlock — Face ID / Touch ID / Android BiometricPrompt.
//
// Usage:
//   const ok = await isBiometricAvailable()       // hardware + enrolment check
//   const name = await getBiometryName()          // 'Face ID' / 'Touch ID' / 'Fingerprint' / 'Biometric'
//   await enableBiometric()                       // confirms with a prompt, then saves the flag
//   await disableBiometric()                      // clears the flag
//   const enabled = await isBiometricEnabled()    // reads the saved flag
//   const unlocked = await verifyBiometric()      // prompts; resolves true on success, false on cancel/fail
//
// Web is a no-op: every check returns false. Native (iOS / Android) talks to
// `@aparajita/capacitor-biometric-auth`. The plugin is lazy-imported so the
// web bundle doesn't drag native code through Vite.
//
// Storage: a single boolean flag at Preferences key `biometric_enabled`.
// We do NOT store the JWT under biometric — the Supabase session lives in
// `@capacitor/preferences` via the storage adapter and is already
// OS-encrypted (Keychain / EncryptedSharedPreferences). Biometric is a
// re-auth gate on app resume, not a key-wrapping mechanism.

import { Preferences } from '@capacitor/preferences'
import { isNative } from './platform'

const STORAGE_KEY = 'biometric_enabled'

let _pluginPromise = null
function _loadPlugin() {
  if (!isNative()) return Promise.resolve(null)
  if (!_pluginPromise) {
    _pluginPromise = import('@aparajita/capacitor-biometric-auth')
      .then((m) => m.BiometricAuth)
      .catch((err) => {
        console.warn('[biometricLock] plugin import failed:', err)
        return null
      })
  }
  return _pluginPromise
}

// `BiometryType` enum from the plugin (kept inline so we don't have to import it):
//   none = 0, touchId = 1, faceId = 2, fingerprint = 3, faceAuthentication = 4, iris = 5
const BIOMETRY_NAME = {
  1: 'Touch ID',
  2: 'Face ID',
  3: 'Fingerprint',
  4: 'Face authentication',
  5: 'Iris',
}

export async function isBiometricAvailable() {
  const plugin = await _loadPlugin()
  if (!plugin) return false
  try {
    const result = await plugin.checkBiometry()
    // plugin returns { isAvailable, biometryType, reason, code, strongBiometryIsAvailable, ... }
    return result?.isAvailable === true
  } catch {
    return false
  }
}

export async function getBiometryName() {
  const plugin = await _loadPlugin()
  if (!plugin) return 'Biometric'
  try {
    const result = await plugin.checkBiometry()
    return BIOMETRY_NAME[result?.biometryType] || 'Biometric'
  } catch {
    return 'Biometric'
  }
}

export async function isBiometricEnabled() {
  if (!isNative()) return false
  const { value } = await Preferences.get({ key: STORAGE_KEY })
  return value === 'true'
}

// Run the biometric prompt. Returns true on success, false on cancel / wrong
// finger / face mismatch. Throws only if something is genuinely broken
// (plugin missing on a native build, etc).
export async function verifyBiometric(reason = 'Unlock CalCheq') {
  const plugin = await _loadPlugin()
  if (!plugin) return false
  try {
    await plugin.authenticate({
      reason,
      cancelTitle: 'Sign out',
      allowDeviceCredential: true,            // fall back to PIN/passcode
      androidTitle: 'CalCheq',
      androidSubtitle: reason,
      androidConfirmationRequired: false,     // skip the extra Confirm tap on Android
    })
    return true
  } catch (err) {
    // Plugin throws BiometryError with a `code` property. Anything that
    // isn't a hard "not available" — user cancelled, biometry failed, locked
    // out — is treated as "not unlocked".
    console.warn('[biometricLock] authenticate failed:', err?.code, err?.message)
    return false
  }
}

// Enable biometric for this device + user. We confirm intent with a prompt
// before we write the flag, so users don't accidentally lock themselves out
// of an account where biometric isn't actually working.
export async function enableBiometric() {
  if (!isNative()) throw new Error('Biometric is only available on the mobile app')
  const ok = await verifyBiometric('Confirm to enable biometric unlock')
  if (!ok) return false
  await Preferences.set({ key: STORAGE_KEY, value: 'true' })
  return true
}

export async function disableBiometric() {
  await Preferences.remove({ key: STORAGE_KEY })
}
