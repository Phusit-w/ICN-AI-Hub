import { useSearchParams } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { SHARE_FILTERS, shareFilterFrom } from '../../lib/sharing'

/**
 * One scrollable row of toggle chips ("ยอดนิยมในองค์กร", "แชร์ให้ฉัน") kept in `?filter=`; clicking the active chip clears it.
 * `children` (more chips) follow after a divider in the same row.
 */
export default function ShareFilterChips({ className, children }) {
  const [params, setParams] = useSearchParams()
  const active = shareFilterFrom(params)
  const toggle = (id) => {
    const next = new URLSearchParams(params)
    if (active === id) next.delete('filter')
    else next.set('filter', id)
    setParams(next)
  }
  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="mx-auto flex w-max items-center gap-2">
        {SHARE_FILTERS.map((f) => (
          <button
            key={f.id} type="button" aria-pressed={active === f.id} onClick={() => toggle(f.id)}
            className={cn('h-8 shrink-0 rounded-full border px-3 text-[13px] transition', active === f.id ? 'border-brand-400 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')}
          >{f.label}</button>
        ))}
        {children && <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-slate-200" />}
        {children}
      </div>
    </div>
  )
}
