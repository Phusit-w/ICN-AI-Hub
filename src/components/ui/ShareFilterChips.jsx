import { useSearchParams } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { SHARE_FILTERS, shareFilterFrom } from '../../lib/sharing'

/** One row of toggle chips ("ยอดนิยมในองค์กร", "แชร์ให้ฉัน") kept in `?filter=`. Clicking the active chip clears it. */
export default function ShareFilterChips({ className }) {
  const [params, setParams] = useSearchParams()
  const active = shareFilterFrom(params)
  const toggle = (id) => {
    const next = new URLSearchParams(params)
    if (active === id) next.delete('filter')
    else next.set('filter', id)
    setParams(next)
  }
  return (
    <div role="group" aria-label="แสดงเฉพาะ" className={cn('flex gap-2', className)}>
      {SHARE_FILTERS.map((f) => (
        <button
          key={f.id} type="button" aria-pressed={active === f.id} onClick={() => toggle(f.id)}
          className={cn('h-8 shrink-0 rounded-full border px-3 text-[13px] transition', active === f.id ? 'border-brand-400 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')}
        >{f.label}</button>
      ))}
    </div>
  )
}
