// Platform detection helpers.
//
// `isNative()`     — true inside a Capacitor WebView (iOS or Android shell).
// `useIsMobile()`  — React hook, true on small viewports OR on native.
//                    Subscribes to matchMedia so it reacts to browser resize
//                    (DevTools responsive mode, rotated tablet, etc.).
// `MOBILE_BREAKPOINT_PX` — single source of truth for the cutover; matches
//                    Tailwind's `lg` (1024px) so existing `lg:` utilities line up.

import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

export const MOBILE_BREAKPOINT_PX = 1024

export function isNative() {
  return Capacitor?.isNativePlatform?.() === true
}

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`

function _initialMatch() {
  if (isNative()) return true
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(MOBILE_QUERY).matches
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(_initialMatch)

  useEffect(() => {
    if (isNative()) {
      // Native shell — always mobile, no need to subscribe.
      setIsMobile(true)
      return
    }
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mq = window.matchMedia(MOBILE_QUERY)
    function onChange(e) { setIsMobile(e.matches) }

    // Modern browsers prefer addEventListener; old Safari needs addListener.
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  return isMobile
}
