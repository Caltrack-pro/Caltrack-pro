// Thin wrapper around @capacitor-mlkit/barcode-scanning.
//
// The ML Kit scan() call opens a fullscreen native scanner UI — there is no
// React surface to render here, so this lives as a utility function rather
// than a component. Returns the raw scanned string, or null if the user
// cancelled. Throws on permission denial so the caller can toast.

import { isNative } from './platform'

const SUPPORTED_FORMATS = [
  'QR_CODE',
  'CODE_128',
  'CODE_39',
  'CODE_93',
  'DATA_MATRIX',
  'EAN_13',
  'EAN_8',
  'ITF',
  'UPC_A',
  'UPC_E',
]

export class CameraPermissionDeniedError extends Error {
  constructor() {
    super('Camera permission denied')
    this.name = 'CameraPermissionDeniedError'
  }
}

export async function isScanSupported() {
  if (!isNative()) return false
  const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')
  const { supported } = await BarcodeScanner.isSupported()
  return supported === true
}

async function ensurePermission(BarcodeScanner) {
  const status = await BarcodeScanner.checkPermissions()
  if (status.camera === 'granted' || status.camera === 'limited') return
  const requested = await BarcodeScanner.requestPermissions()
  if (requested.camera !== 'granted' && requested.camera !== 'limited') {
    throw new CameraPermissionDeniedError()
  }
}

// On Android, ML Kit may need to install its scan module on first use.
// Kick it off opportunistically; safe to no-op on iOS.
async function ensureModuleInstalled(BarcodeScanner) {
  try {
    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
    if (!available) {
      await BarcodeScanner.installGoogleBarcodeScannerModule()
    }
  } catch {
    // Method only exists on Android; ignore on iOS or older plugin versions.
  }
}

export async function scanBarcode() {
  if (!isNative()) {
    throw new Error('Barcode scanning is only available in the mobile app')
  }
  const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')

  await ensurePermission(BarcodeScanner)
  await ensureModuleInstalled(BarcodeScanner)

  const { barcodes } = await BarcodeScanner.scan({ formats: SUPPORTED_FORMATS })
  if (!barcodes || barcodes.length === 0) return null

  const raw = barcodes[0].rawValue ?? barcodes[0].displayValue ?? null
  return raw ? raw.trim() : null
}
