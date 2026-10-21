import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return <div className={cn('rounded-xl border border-slate-200 bg-white', className)} {...props}>{children}</div>
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-4 pb-3', className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          {Icon && <Icon className="size-4 text-slate-400" aria-hidden />}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint, icon: Icon, trend, ...props }) {
  return (
    <Card className="p-4" {...props}>
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        {label}
        {Icon && <Icon className="size-4 text-slate-400" aria-hidden />}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      {(hint || trend) && (
        <div className="mt-1 text-xs text-slate-500">
          {trend && <span className="mr-1 font-medium text-emerald-600">{trend}</span>}
          {hint}
        </div>
      )}
    </Card>
  )
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
      {Icon && <Icon className="mb-3 size-8 text-slate-300" aria-hidden />}
      <p className="font-medium text-slate-700">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-slate-500">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ProgressBar({ value, className }) {
  return (
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-slate-100', className)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand-500 transition-[width] duration-500" style={{ width: `${value * 100}%` }} />
    </div>
  )
}
