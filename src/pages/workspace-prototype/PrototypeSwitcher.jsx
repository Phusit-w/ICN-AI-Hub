// PROTOTYPE (branch prototype/workspace-layout): switches every page between design variants. Not for main.
import { useEffect, useSyncExternalStore } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, ChevronLeft, ChevronRight } from 'lucide-react'

export const VARIANTS = [
  { key: 'A', name: 'Clean Minimal' },
  { key: 'B', name: 'Minimal+Animation' },
]

const STORAGE_KEY = 'icn-ws-variant'
const isVariant = (k) => VARIANTS.some((v) => v.key === k)
const readStored = () => { try { return sessionStorage.getItem(STORAGE_KEY) } catch { return null } }

// Variant B's Cube (EyeTracker) can be switched off; one module-level value, so every page and the bar agree.
const CUBE_KEY = 'icn-cube'
const readCube = () => { try { return localStorage.getItem(CUBE_KEY) !== 'off' } catch { return true } }
let cubeOn = readCube()
const cubeListeners = new Set()
export function useCube() {
  const on = useSyncExternalStore((fn) => { cubeListeners.add(fn); return () => cubeListeners.delete(fn) }, () => cubeOn)
  const set = (next) => {
    cubeOn = next
    try { localStorage.setItem(CUBE_KEY, next ? 'on' : 'off') } catch { /* ignore */ }
    cubeListeners.forEach((fn) => fn())
  }
  return [on, set]
}

/** Shown in the dev server, or in a build made with VITE_PROTOTYPE=1; a normal build never shows the bar. */
export const PROTOTYPE_ON = import.meta.env.DEV || import.meta.env.VITE_PROTOTYPE === '1'

/**
 * The variant comes from `?variant=`; session storage remembers it because Workspace and the sidebar
 * navigate with their own params (`?run=`) that would otherwise drop it.
 */
export function useVariant() {
  const [params, setParams] = useSearchParams()
  const fromUrl = params.get('variant')
  const current = isVariant(fromUrl) ? fromUrl : isVariant(readStored()) ? readStored() : 'A'

  useEffect(() => { if (isVariant(fromUrl)) { try { sessionStorage.setItem(STORAGE_KEY, fromUrl) } catch { /* ignore */ } } }, [fromUrl])

  const setVariant = (key) => {
    try { sessionStorage.setItem(STORAGE_KEY, key) } catch { /* ignore */ }
    setParams((p) => { const next = new URLSearchParams(p); next.set('variant', key); return next }, { replace: true })
  }
  return [current, setVariant]
}

export default function PrototypeSwitcher({ current, onChange }) {
  const index = VARIANTS.findIndex((v) => v.key === current)
  const go = (delta) => onChange(VARIANTS[(index + delta + VARIANTS.length) % VARIANTS.length].key)

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t instanceof HTMLElement && (t.closest('input, textarea, select') || t.isContentEditable)) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const v = VARIANTS[index]
  const [cube, setCube] = useCube()
  return (
    <div role="group" aria-label="สลับแบบ A/B (prototype)" className="fixed top-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900 px-1.5 py-1 text-xs text-white shadow-lg ring-1 ring-white/20">
      <button type="button" onClick={() => go(-1)} aria-label="แบบก่อนหน้า" className="rounded-full p-1.5 hover:bg-white/15"><ChevronLeft className="size-4" /></button>
      <span className="min-w-52 px-1 text-center font-medium" aria-live="polite">{v.key} · {v.name}</span>
      <button type="button" onClick={() => go(1)} aria-label="แบบถัดไป" className="rounded-full p-1.5 hover:bg-white/15"><ChevronRight className="size-4" /></button>
      {current === 'B' && (
        <button
          type="button" aria-pressed={cube} onClick={() => setCube(!cube)} aria-label="เปิดหรือปิดตัว Cube"
          className={`ml-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 hover:bg-white/15 ${cube ? 'bg-white/20' : 'text-white/60'}`}
        ><Box className="size-3.5" /> Cube {cube ? 'เปิด' : 'ปิด'}</button>
      )}
    </div>
  )
}
