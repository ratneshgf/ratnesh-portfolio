/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const PerformanceContext = createContext(null)

function readProfile() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 800px)').matches
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0
  const lowHardware = (navigator.hardwareConcurrency || 8) <= 4
  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4
  const lowPower = lowHardware || lowMemory
  const simplified = reducedMotion || isMobile || isTouch || lowPower
  return {
    reducedMotion,
    isMobile,
    isTouch,
    lowPower,
    simplified,
    enableCursor: !simplified,
    enableTilt: !simplified,
    continuousMotion: !reducedMotion && !lowPower,
    particleCount: isMobile || lowPower ? 34 : 95,
    networkNodes: isMobile || lowPower ? 8 : 12,
    enableBlur: !simplified,
  }
}

export function PerformanceProvider({ children }) {
  const [profile, setProfile] = useState(readProfile)
  useEffect(() => {
    const update = () => setProfile(readProfile())
    const queries = ['(prefers-reduced-motion: reduce)', '(max-width: 800px)', '(hover: none)', '(pointer: coarse)'].map((query) => window.matchMedia(query))
    queries.forEach((query) => query.addEventListener?.('change', update))
    window.addEventListener('resize', update, { passive: true })
    return () => { queries.forEach((query) => query.removeEventListener?.('change', update)); window.removeEventListener('resize', update) }
  }, [])
  const value = useMemo(() => profile, [profile])
  return <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>
}

export function usePerformanceMode() {
  const context = useContext(PerformanceContext)
  if (!context) throw new Error('usePerformanceMode must be used inside PerformanceProvider')
  return context
}
