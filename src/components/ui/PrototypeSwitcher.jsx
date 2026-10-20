// PROTOTYPE — throwaway. Floating bar that flips between ?variant= keys. Dev builds only.
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function useVariant(keys) {
  const [params] = useSearchParams()
  const v = params.get('variant')
  return keys.includes(v) ? v : keys[0]
}

export default function PrototypeSwitcher({ variants }) {
  const [params, setParams] = useSearchParams()
  const keys = Object.keys(variants)
  const current = useVariant(keys)
  const go = (step) => {
    const next = keys[(keys.indexOf(current) + step + keys.length) % keys.length]
    const p = new URLSearchParams(params)
    p.set('variant', next)
    setParams(p, { replace: true })
  }
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  if (!import.meta.env.DEV) return null
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900 p-1 text-white shadow-2xl ring-4 ring-amber-300">
      <button type="button" onClick={() => go(-1)} className="rounded-full p-2 hover:bg-white/10" aria-label="แบบก่อนหน้า"><ChevronLeft className="size-4" /></button>
      <span className="min-w-56 px-2 text-center text-sm"><b className="mr-1.5 text-amber-300">PROTOTYPE {current}</b>{variants[current]}</span>
      <button type="button" onClick={() => go(1)} className="rounded-full p-2 hover:bg-white/10" aria-label="แบบถัดไป"><ChevronRight className="size-4" /></button>
    </div>
  )
}
