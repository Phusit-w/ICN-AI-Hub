// PROTOTYPE (branch prototype/workspace-layout): variant B's search. A quiet field in the sidebar head that, once pressed,
// spreads into a popup holding the real input and the results. Same motion as the agent menu (see ComposerPick): the press sinks,
// the shape spreads 60ms in with no overshoot, the rows rise one after another. Not for main.
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Search } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { skillLink } from '../../lib/routes'
import { threadsOf } from '../../lib/runs'
import { cn } from '../../lib/utils'
import EntityIcon from '../agents/EntityIcon'

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'
const WIDTH = 'min(22rem, calc(100vw - 1.5rem))'
const HEIGHT = 'min(22rem, 70dvh)'
const GUTTER = 12 // the sidebar's own padding: the popup lines up with it, not with the narrow field

/**
 * `compact` is the icon-only form for the collapsed sidebar rail. With nothing typed the popup lists the latest chats;
 * typing shows matching Agents, Skills and chats. ↑/↓ move, Enter opens, Esc closes; Ctrl/⌘+K opens it from anywhere.
 */
export default function SearchPopup({ compact = false, onNavigate }) {
  const { state } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [sink, setSink] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [dx, setDx] = useState(0)
  const box = useRef(null)
  const trigger = useRef(null)
  const input = useRef(null)
  const beat = useRef(0)
  const listId = useId()

  const threads = useMemo(() => threadsOf(state.runs), [state.runs])
  const term = q.trim().toLowerCase()
  const results = useMemo(() => {
    const match = (s) => s?.toLowerCase().includes(term)
    const chat = (t) => ({ id: `t-${t.id}`, label: t.title, sub: 'แชต', chat: true, to: `/workspace?run=${t.latest.id}` })
    if (!term) return threads.slice(0, 5).map(chat)
    return [
      ...state.agents.filter((a) => match(a.name) || match(a.description)).slice(0, 5).map((a) => ({ id: a.id, label: a.name, sub: 'Agent', icon: a.kind, to: `/agents/${a.id}` })),
      ...state.skills.filter((s) => match(s.name) || match(s.purpose)).slice(0, 4).map((s) => ({ id: s.id, label: s.name, sub: 'ทักษะ', icon: s.icon, skill: true, to: skillLink(s.id) })),
      ...threads.filter((t) => match(t.title)).slice(0, 4).map(chat),
    ]
  }, [term, threads, state.agents, state.skills])

  useEffect(() => () => window.clearTimeout(beat.current), [])

  // A press outside puts it away. Registered only while open, so the press that opened it cannot close it.
  useEffect(() => {
    if (!open) return undefined
    const away = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  useEffect(() => { if (open) input.current?.focus() }, [open])

  const show = () => {
    setDx(Math.max(0, (trigger.current?.getBoundingClientRect().left ?? GUTTER) - GUTTER))
    setSink(true)
    window.clearTimeout(beat.current)
    beat.current = window.setTimeout(() => { setSink(false); setOpen(true) }, 60)
  }
  const close = (refocus) => { setOpen(false); if (refocus) trigger.current?.focus() }

  // Ctrl/⌘+K. The sidebar is mounted twice (desktop, phone drawer); only the one that is on screen answers.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'k' || trigger.current?.offsetParent === null) return
      e.preventDefault()
      if (open) close(false); else show()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const go = (r) => { if (!r) return; setOpen(false); setQ(''); setActive(0); navigate(r.to); onNavigate?.() }
  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); close(true) }
    else if (e.key === 'Tab') close(false)
  }

  const rise = (i) => ({ transitionDelay: open ? `${30 + Math.min(i, 8) * 22}ms` : '0ms' })

  return (
    <span ref={box} data-tour="search" className={cn('relative flex', compact ? 'w-full' : 'min-w-0 flex-1')}>
      <button
        ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => (open ? close(false) : show())}
        aria-label="ค้นหาทั้งระบบ" title="ค้นหา (Ctrl K)"
        className={cn(
          'relative z-10 flex h-9 w-full min-w-0 items-center transition-[scale,background-color,border-color] focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none', EASE,
          compact ? 'justify-center rounded-lg text-slate-600 hover:bg-slate-100' : 'gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-400 hover:border-slate-300',
          sink ? 'scale-[0.94] duration-150 motion-reduce:scale-100' : 'duration-200',
        )}
      >
        <Search className={cn('shrink-0', compact ? 'size-[18px]' : 'size-4')} aria-hidden />
        {!compact && <span className="truncate">ค้นหา…</span>}
      </button>

      {/* The shape: exactly the field's size when shut, then it spreads down and right, lined up with the sidebar's padding. */}
      <div
        role="dialog" aria-label="ค้นหาทั้งระบบ" inert={!open}
        style={open ? { width: WIDTH, height: HEIGHT, left: -dx } : undefined}
        className={cn(
          'absolute top-0 left-0 z-50 overflow-hidden border bg-white shadow-xl transition-[width,height,left,border-radius,opacity,border-color] duration-[220ms] motion-reduce:duration-150', EASE,
          open ? 'rounded-2xl border-slate-200 opacity-100' : 'pointer-events-none h-full w-full rounded-xl border-transparent opacity-0',
        )}
      >
        <div style={{ width: WIDTH, height: HEIGHT }} className="absolute top-0 left-0 flex flex-col">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-slate-100 px-3.5">
            <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
            <input
              ref={input} type="search" value={q} onChange={(e) => { setQ(e.target.value); setActive(0) }} onKeyDown={onInputKey}
              role="combobox" aria-expanded={open} aria-controls={listId} aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              aria-label="ค้นหาทั้งระบบ" placeholder="ค้นหา Agent ทักษะ แชต…"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400">Esc</kbd>
          </div>
          <div id={listId} role="listbox" aria-label={term ? 'ผลการค้นหา' : 'แชตล่าสุด'} className="min-h-0 flex-1 overflow-y-auto p-2">
            {!term && results.length > 0 && <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-medium text-slate-400">แชตล่าสุด</p>}
            {results.length === 0 && (
              <p className="px-2.5 py-3 text-sm text-slate-500">{term ? `ไม่พบผลลัพธ์สำหรับ “${q}”` : 'ยังไม่มีแชต เริ่มแชตใหม่ได้เลย'}</p>
            )}
            {results.map((r, i) => (
              <div
                key={r.id} role="presentation" style={rise(i)}
                className={cn('transition-[opacity,translate] duration-200 motion-reduce:duration-150', EASE, open ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0')}
              >
                <div
                  id={`${listId}-${i}`} role="option" aria-selected={i === active} onMouseMove={() => setActive(i)} onClick={() => go(r)}
                  className={cn('flex h-10 cursor-pointer items-center gap-3 rounded-xl px-2.5 transition-colors duration-150', i === active && 'bg-slate-100')}
                >
                  {r.chat
                    ? <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><MessageSquare className="size-4" aria-hidden /></span>
                    : <EntityIcon icon={r.icon} size="sm" tone={r.skill ? 'skill' : 'agent'} />}
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{r.label}</span>
                  <span className="shrink-0 text-xs text-slate-400">{r.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </span>
  )
}
