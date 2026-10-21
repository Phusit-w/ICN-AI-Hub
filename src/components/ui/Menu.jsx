import { useEffect, useId, useRef, useState } from 'react'
import { Check, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'

/**
 * A "⋯" button that opens a small menu of less-used actions (WAI-ARIA menu button pattern).
 * One click opens it. From the keyboard: Enter, Space or ↓ opens on the first item, ↑ on the last;
 * ↑/↓ move (wrapping), Home/End jump, Enter runs an item, Escape closes and returns focus, Tab closes.
 * `items` are `{ label, icon, onSelect }`, plus `checked` for a pick-one choice (shown as a menuitemradio with a tick).
 * The menu opens upwards since it sits at the bottom of a message or of the sidebar.
 * `children`, when given, replace the "⋯" icon inside the trigger, styled by `triggerClassName`.
 */
export default function Menu({ items, label = 'ตัวเลือกเพิ่มเติม', className, children, triggerClassName }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef(null)
  const trigger = useRef(null)
  const itemRefs = useRef([])
  const id = useId()

  useEffect(() => {
    if (!open) return undefined
    itemRefs.current[active]?.focus()
    return undefined
  }, [open, active])

  useEffect(() => {
    if (!open) return undefined
    const outside = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [open])

  const show = (at) => { setActive(at); setOpen(true) }
  const close = (refocus) => { setOpen(false); if (refocus) trigger.current?.focus() }
  const select = (item) => { close(true); item.onSelect() }

  const onTriggerKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(0) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); show(items.length - 1) }
  }
  const onMenuKey = (e) => {
    const n = items.length
    const move = { ArrowDown: active + 1, ArrowUp: active - 1 + n, Home: 0, End: n - 1 }[e.key]
    if (move !== undefined) { e.preventDefault(); setActive(move % n) }
    else if (e.key === 'Escape') { e.preventDefault(); close(true) }
    else if (e.key === 'Tab') close(false)
  }

  const triggerProps = {
    ref: trigger, 'aria-label': label, title: label, 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': open ? id : undefined,
    onClick: () => (open ? close(false) : show(0)), onKeyDown: onTriggerKey,
  }

  return (
    <div ref={box} className={cn('relative', className)}>
      {children
        ? <button type="button" {...triggerProps} className={triggerClassName}>{children}</button>
        : <Button {...triggerProps} size="icon" variant="ghost" icon={MoreHorizontal} />}
      {open && (
        <ul
          id={id} role="menu" aria-label={label} onKeyDown={onMenuKey}
          className="rise absolute bottom-full left-0 z-30 mb-1 min-w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <li key={item.label} role="none">
                <button
                  ref={(el) => { itemRefs.current[i] = el }} type="button" tabIndex={i === active ? 0 : -1}
                  role={item.checked === undefined ? 'menuitem' : 'menuitemradio'} aria-checked={item.checked}
                  onClick={() => select(item)} onMouseEnter={() => setActive(i)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                >
                  {Icon && <Icon className="size-4 text-slate-400" aria-hidden />}
                  <span className="flex-1">{item.label}</span>
                  {item.checked && <Check className="size-4 text-brand-600" aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
