import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Bot, Check, ChevronDown, X } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { DEPARTMENTS, deptById, userById } from '../../data/catalog'
import { cn } from '../../lib/utils'

// A pick is what the user chose for a request: { agentId } (with or without Steps), or {} when the system chooses.
// The composer and the "ใช้ซ้ำ" row share it.

const toPick = (agentId) => (agentId ? { agentId } : {})

/** Pick state that follows `agentId` whenever it changes (e.g. from the URL). */
export function usePick(agentId) {
  const [pick, setPick] = useState(() => toPick(agentId))
  useEffect(() => { setPick(toPick(agentId)) }, [agentId])
  return [pick, setPick]
}

/** The pick carried in a URL's `?agent=`. */
export const pickFromParams = (params) => toPick(params.get('agent'))

const pillClass = 'flex h-8 min-w-0 items-center gap-1.5 rounded-full bg-brand-50 pr-1 pl-2.5 text-xs text-brand-700'
const clearClass = 'rounded-full p-1 hover:bg-brand-100'

// The dropdown's motion follows Bencho's "Create menu": one shape that spreads from the pill into the panel, with no overshoot.
// The press sinks (scale .94) and the spread starts 60ms in, so there is never a still frame. Width, height and corner run the
// same curve for the same time; the rows then rise in one after another (30ms + 22ms each), and the pill's own label steps aside.
// Closing runs the same move backwards, and a press anywhere outside puts the panel away. Plain CSS transitions, no spring library.
const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'
const SHAPE = 'transition-[width,height,border-radius,opacity,border-color] duration-[220ms] motion-reduce:duration-150'

/**
 * The "อัตโนมัติ" dropdown, a listbox opening upwards from its button. `groups` is [{ id, name, list: [agent] }].
 * Keys: ↑/↓ open it; inside, ↑/↓ move (stopping at the ends), Home/End jump, Enter or Space picks, Escape closes
 * and returns focus, Tab closes.
 */
function AgentPicker({ value, label, groups, onChange }) {
  const [open, setOpen] = useState(false)
  const [sink, setSink] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef(null)
  const trigger = useRef(null)
  const optionRefs = useRef([])
  const beat = useRef(0)
  const listId = useId()

  // Option 0 is "อัตโนมัติ"; the agents follow in department order, numbered so the keyboard can walk them.
  const { rows, count } = useMemo(() => {
    let n = 1
    return { rows: groups.map((g) => ({ ...g, list: g.list.map((a) => ({ id: a.id, name: a.name, i: n++ })) })), count: n }
  }, [groups])
  const selected = Math.max(0, rows.flatMap((g) => g.list).find((a) => a.id === value)?.i ?? 0)

  useEffect(() => () => window.clearTimeout(beat.current), [])

  // A press outside puts the panel away. Registered only while open, so the press that opened it cannot close it.
  useEffect(() => {
    if (!open) return undefined
    const away = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  useEffect(() => {
    if (!open) return
    const el = optionRefs.current[active]
    el?.focus({ preventScroll: true })
    el?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const show = (at) => {
    setActive(at)
    setSink(true)
    window.clearTimeout(beat.current)
    beat.current = window.setTimeout(() => { setSink(false); setOpen(true) }, 60)
  }
  const close = (refocus) => { setOpen(false); if (refocus) trigger.current?.focus() }
  const choose = (v) => { onChange(v); close(true) }

  const onTriggerKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); show(selected) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); show(count - 1) }
  }
  const onListKey = (e) => {
    const move = { ArrowDown: Math.min(active + 1, count - 1), ArrowUp: Math.max(active - 1, 0), Home: 0, End: count - 1 }[e.key]
    if (move !== undefined) { e.preventDefault(); setActive(move) }
    else if (e.key === 'Escape') { e.preventDefault(); close(true) }
    else if (e.key === 'Tab') close(false)
  }

  // A row with `i` waits its turn to rise in; on the way out they all leave together.
  const rise = (i) => ({ transitionDelay: open ? `${30 + Math.min(i, 8) * 22}ms` : '0ms' })
  const rowClass = (i) => cn('transition-[opacity,translate] duration-200 motion-reduce:duration-150', EASE, open ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0')
  const optionClass = (on) => cn(
    'flex h-9 w-full items-center gap-2 rounded-xl px-3 text-left text-[13px] transition-colors duration-150 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none',
    on ? 'font-medium text-brand-700' : 'text-slate-700',
  )
  const option = (i, v, text) => (
    <div role="presentation" style={rise(i)} className={rowClass(i)}>
      <button
        ref={(el) => { optionRefs.current[i] = el }} type="button" role="option" aria-selected={v === value}
        tabIndex={i === active ? 0 : -1} onClick={() => choose(v)} className={optionClass(v === value)}
      >
        <span className="min-w-0 flex-1 truncate">{text}</span>
        {v === value && <Check className="size-4 shrink-0" aria-hidden />}
      </button>
    </div>
  )

  return (
    <span ref={box} className="relative flex">
      <button
        ref={trigger} type="button" aria-label="เลือกผู้ช่วย" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
        onClick={() => (open ? close(false) : show(selected))} onKeyDown={onTriggerKey}
        className={cn(
          'relative z-10 flex h-8 min-w-0 items-center gap-1 rounded-full px-2.5 text-xs transition-[color,background-color,opacity,scale] focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none',
          EASE, value ? 'text-brand-700' : 'text-slate-500 hover:bg-slate-100',
          // held at full strength through the press, then out of the way once the shape has spread; back in as it lands
          sink ? 'scale-[0.94] duration-150 motion-reduce:scale-100' : open ? 'pointer-events-none opacity-0 duration-150' : 'duration-200 delay-100',
        )}
      >
        <span className="max-w-40 truncate">{label}</span>
        <ChevronDown className="size-3 shrink-0" aria-hidden />
      </button>
      {/* The shape: exactly the button's size when shut, and anchored to its bottom-right corner so it spreads up and to the left. */}
      <div
        inert={!open}
        className={cn(
          'absolute right-0 bottom-0 z-20 overflow-hidden border bg-white shadow-lg', SHAPE, EASE,
          open ? 'h-[min(22rem,60dvh)] w-72 rounded-[20px] border-slate-200 opacity-100' : 'pointer-events-none h-full w-full rounded-2xl border-transparent opacity-0',
        )}
      >
        <div id={listId} role="listbox" aria-label="เลือกผู้ช่วย" onKeyDown={onListKey} className="absolute right-0 bottom-0 h-[min(22rem,60dvh)] w-72 overflow-y-auto p-2">
          {option(0, '', 'อัตโนมัติ — ระบบเลือกให้ (แนะนำ)')}
          {rows.map((g) => (
            <div key={g.id} role="group" aria-label={g.name}>
              <p aria-hidden className="px-3 pt-3 pb-1 text-[11px] font-medium text-slate-400">{g.name}</p>
              {g.list.map((a) => <Fragment key={a.id}>{option(a.i, a.id, a.name)}</Fragment>)}
            </div>
          ))}
        </div>
      </div>
    </span>
  )
}

/**
 * Shows the picked Agent inside a composer, with a one-click clear.
 * `chooseAgent` adds a quiet "อัตโนมัติ" dropdown for picking any Agent when nothing is picked.
 */
export default function ComposerPick({ pick, onChange, chooseAgent = false }) {
  const { state } = useStore()
  const agent = pick.agentId && state.agents.find((a) => a.id === pick.agentId)
  const clear = () => onChange({})
  const myDept = userById(state.userId).dept

  const clearAgent = agent && (
    <button type="button" onClick={clear} aria-label="กลับไปเลือกผู้ช่วยอัตโนมัติ" title="กลับไปเลือกอัตโนมัติ" className={clearClass}><X className="size-3" /></button>
  )
  if (!chooseAgent) {
    return agent ? (
      <span className={pillClass}>
        <Bot className="size-3.5 shrink-0" aria-hidden />
        <span className="max-w-56 truncate">ผู้ช่วย: {agent.name}</span>
        {clearAgent}
      </span>
    ) : null
  }
  const groups = [...DEPARTMENTS]
    .sort((a, b) => (b.id === myDept) - (a.id === myDept)) // the user's own department first: the agents they most likely want
    .map((d) => ({ id: d.id, name: d.id === myDept ? `แผนกของคุณ · ${d.th}` : d.th, list: state.agents.filter((a) => deptById(a.dept).id === d.id) }))
    .filter((g) => g.list.length > 0)
  return (
    <span className={cn('flex min-w-0 items-center rounded-full', agent && 'bg-brand-50 pr-1')}>
      <AgentPicker value={pick.agentId ?? ''} label={agent ? agent.name : 'อัตโนมัติ'} groups={groups} onChange={(v) => onChange(toPick(v))} />
      {clearAgent}
    </span>
  )
}
