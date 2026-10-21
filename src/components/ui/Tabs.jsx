import { useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation).
 * `tabs`: [{ id, label, content }]. Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
 * Only the selected panel is rendered, so keep state that must survive a tab switch in the parent.
 * Keyboard: ArrowLeft/ArrowRight (wrapping), Home, End.
 */
export default function Tabs({ tabs, label, value, defaultValue, onChange, className }) {
  const [own, setOwn] = useState(defaultValue ?? tabs[0]?.id)
  const selected = value ?? own
  const base = useId()
  const refs = useRef({})
  const tabId = (id) => `${base}-tab-${id}`
  const panelId = (id) => `${base}-panel-${id}`

  const select = (id) => {
    if (value === undefined) setOwn(id)
    onChange?.(id)
  }

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === selected)
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const id = tabs[(next + tabs.length) % tabs.length].id
    select(id)
    refs.current[id]?.focus()
  }

  const current = tabs.find((t) => t.id === selected)

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => {
          const on = t.id === selected
          return (
            <button
              key={t.id} ref={(el) => { refs.current[t.id] = el }}
              type="button" role="tab" id={tabId(t.id)} aria-selected={on} aria-controls={on ? panelId(t.id) : undefined}
              tabIndex={on ? 0 : -1} onClick={() => select(t.id)}
              className={cn(
                '-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-brand-500',
                on ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {current && (
        <div role="tabpanel" id={panelId(current.id)} aria-labelledby={tabId(current.id)} tabIndex={0} className="pt-5 focus-visible:outline-none">
          {current.content}
        </div>
      )}
    </div>
  )
}
