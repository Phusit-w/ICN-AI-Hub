import { Search, Check, Lock, Users, Building2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { SHARE_LEVELS } from '../../data/catalog'

const control = 'w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-xs transition focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-100'

export function Field({ label, hint, required, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-slate-700">
          {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export const Input = ({ className, ...p }) => <input className={cn(control, 'h-9', className)} {...p} />
export const Textarea = ({ className, ...p }) => <textarea className={cn(control, 'py-2 leading-relaxed', className)} {...p} />
export const Select = ({ className, children, ...p }) => <select className={cn(control, 'h-9 pr-8', className)} {...p}>{children}</select>

export function SearchInput({ className, ...p }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input type="search" className={cn(control, 'h-9 pl-9')} {...p} />
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-slate-300')}
    >
      <span className={cn('inline-block size-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4.5' : 'translate-x-0.5')} />
    </button>
  )
}

/** Pill tabs used for department filters and view switches. */
export function Segmented({ options, value, onChange, className }) {
  return (
    <div className={cn('inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1', className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cn('rounded-md px-3 py-1 text-[13px] font-medium transition', value === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
        >
          {o.label}
          {o.count != null && <span className="ml-1.5 text-xs text-slate-400">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

/** Large selectable card — used where a non-technical user picks one option with an explanation. */
export function ChoiceCard({ selected, onClick, title, description, icon: Icon, aside, multi }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={selected}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition',
        selected ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500' : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      {Icon && <Icon className={cn('mt-0.5 size-5 shrink-0', selected ? 'text-brand-600' : 'text-slate-400')} aria-hidden />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-800">{title}{aside}</div>
        {description && <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</div>}
      </div>
      <span className={cn('mt-0.5 flex size-4.5 shrink-0 items-center justify-center border', multi ? 'rounded' : 'rounded-full', selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300')}>
        {selected && <Check className="size-3" strokeWidth={3} aria-hidden />}
      </span>
    </button>
  )
}

const SHARE_ICONS = { private: Lock, department: Users, company: Building2 }

/**
 * Who can use what is being created: private, department or company.
 * `companyNeedsApproval` says up front that company-wide sharing waits for the Admin (the User view).
 */
export function ShareChoice({ label = 'ใครใช้ได้บ้าง', value, onChange, companyNeedsApproval }) {
  return (
    <Field label={label}>
      <div className="grid gap-2 sm:grid-cols-3">
        {SHARE_LEVELS.map((sl) => (
          <ChoiceCard key={sl.id} selected={value === sl.id} onClick={() => onChange(sl.id)} icon={SHARE_ICONS[sl.id]} title={sl.name} description={sl.id === 'company' && companyNeedsApproval ? `${sl.th} — แชร์ในแผนกก่อนจนแอดมินอนุมัติ` : sl.th} />
        ))}
      </div>
    </Field>
  )
}
