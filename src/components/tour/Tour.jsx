import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { TOUR_STEPS } from './steps'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'

const TourContext = createContext({ start: () => {}, sidebarStep: false })
export const useTour = () => useContext(TourContext)

const PAD = 6 // spotlight padding around the target
const GAP = 14 // space between spotlight and popover
const WIDTH = 320
const MAX_WAIT_TRIES = 20 // × 100ms for the target to render after navigation

function findVisible(id) {
  return [...document.querySelectorAll(`[data-tour="${id}"]`)].find((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
}

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

/** Below, above, beside, or — when the target fills the screen — floating near the bottom. */
function placePopover(rect) {
  const vw = window.innerWidth, vh = window.innerHeight
  const w = Math.min(WIDTH, vw - 32)
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2
  const left = clamp(cx - w / 2, 16, vw - w - 16)
  if (vh - rect.bottom > 230) return { w, style: { top: rect.bottom + PAD + GAP, left }, arrow: { side: 'top', at: clamp(cx - left, 18, w - 18) } }
  // Anchored by `bottom`, not a transform: the entrance animation owns `transform`.
  if (rect.top > 230) return { w, style: { bottom: vh - rect.top + PAD + GAP, left }, arrow: { side: 'bottom', at: clamp(cx - left, 18, w - 18) } }
  const top = clamp(cy - 28, 16, vh - 260)
  if (vw - rect.right > w + 40) return { w, style: { top, left: rect.right + PAD + GAP }, arrow: { side: 'left', at: clamp(cy - top, 18, 220) } }
  if (rect.left > w + 40) return { w, style: { top, left: rect.left - PAD - GAP - w }, arrow: { side: 'right', at: clamp(cy - top, 18, 220) } }
  return { w, style: { bottom: 24, left }, arrow: null }
}

const ARROW = {
  top: (at) => ({ top: -6, left: at - 6 }),
  bottom: (at) => ({ bottom: -6, left: at - 6 }),
  left: (at) => ({ left: -6, top: at - 6 }),
  right: (at) => ({ right: -6, top: at - 6 }),
}

export function TourProvider({ children }) {
  const [index, setIndex] = useState(-1)
  const [rect, setRect] = useState(null)
  const direction = useRef(1)
  const nextBtn = useRef(null)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const step = TOUR_STEPS[index]

  const end = useCallback(() => { setIndex(-1); setRect(null) }, [])
  const moveTo = useCallback((i) => {
    setRect(null)
    if (i < 0 || i >= TOUR_STEPS.length) end()
    else setIndex(i)
  }, [end])
  const start = useCallback(() => { direction.current = 1; moveTo(0) }, [moveTo])
  const go = useCallback((d) => { direction.current = d; moveTo(index + d) }, [index, moveTo])

  // Open the step's page, wait for its element, spotlight it; skip steps that never become visible.
  useEffect(() => {
    if (!step) return
    // A step whose route has a query (e.g. '/agents?filter=popular') matches the query too; other steps match the path only.
    if ((step.route.includes('?') ? pathname + search : pathname) !== step.route) { navigate(step.route); return }
    let tries = 0
    let timer
    const look = () => {
      const el = findVisible(step.target)
      if (el) {
        el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
        setRect(el.getBoundingClientRect())
      } else if (++tries > MAX_WAIT_TRIES) {
        moveTo(index + direction.current)
      } else {
        timer = setTimeout(look, 100)
      }
    }
    look()
    return () => clearTimeout(timer)
  }, [step, index, pathname, search, navigate, moveTo])

  // Live content and resizing move the target, so keep the spotlight on it.
  const located = rect !== null
  useEffect(() => {
    if (!step || !located) return
    const update = () => { const el = findVisible(step.target); if (el) setRect(el.getBoundingClientRect()) }
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    const id = setInterval(update, 500)
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); clearInterval(id) }
  }, [step, located])

  useEffect(() => {
    if (!step) return
    const onKey = (e) => {
      if (e.key === 'Escape') end()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft' && index > 0) go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, index, go, end])

  useEffect(() => { if (located) nextBtn.current?.focus({ preventScroll: true }) }, [located, index])

  const last = index === TOUR_STEPS.length - 1
  const pop = rect && placePopover(rect)

  return (
    <TourContext.Provider value={{ start, sidebarStep: Boolean(step?.sidebar) }}>
      {children}
      {step && (
        <div className="fixed inset-0 z-[80]" aria-live="polite">
          {/* Blocks the page while touring; the hole is drawn by the spotlight's huge shadow. */}
          <div className={cn('absolute inset-0', !rect && 'bg-slate-900/55')} />
          {rect && (
            <>
              <div
                className="pointer-events-none fixed rounded-xl ring-2 ring-white/90 transition-all duration-300 ease-out"
                style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, boxShadow: '0 0 0 9999px rgb(15 23 42 / 0.55)' }}
              />
              <div role="dialog" aria-modal="true" aria-labelledby="tour-title" className="rise fixed rounded-2xl bg-white p-4 shadow-2xl transition-[top,left] duration-300" style={{ ...pop.style, width: pop.w }} key={index}>
                {pop.arrow && <span className="absolute size-3 rotate-45 bg-white" style={ARROW[pop.arrow.side](pop.arrow.at)} aria-hidden />}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-medium text-brand-600">ขั้นที่ {index + 1} จาก {TOUR_STEPS.length}</p>
                  <button type="button" onClick={end} className="-mt-1 -mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="ปิดทัวร์"><X className="size-4" /></button>
                </div>
                <h2 id="tour-title" className="mt-1 text-[15px] font-semibold text-slate-900">{step.title}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{step.body}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300" style={{ width: `${((index + 1) / TOUR_STEPS.length) * 100}%` }} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" onClick={end} className="text-xs text-slate-400 hover:text-slate-600">ข้ามทัวร์</button>
                  <div className="ml-auto flex gap-2">
                    {index > 0 && <Button size="sm" variant="ghost" onClick={() => go(-1)}>ย้อนกลับ</Button>}
                    <Button size="sm" variant="primary" onClick={() => go(1)} ref={nextBtn}>{last ? 'เสร็จสิ้น' : 'ถัดไป'}</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </TourContext.Provider>
  )
}
