import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { runProgress } from '../../lib/runs'
import { cn, timeAgo } from '../../lib/utils'
import EntityIcon from '../agents/EntityIcon'
import { StatusPill } from '../ui/Badge'
import { ProgressBar } from '../ui/Card'

const DOT = { completed: 'bg-emerald-400', processing: 'bg-brand-500 animate-pulse', returned: 'bg-amber-400', waiting: 'bg-slate-200' }

/** Compact live view of a run — used on Home and in the Workspace history list. */
export default function RunRow({ run, active, compact }) {
  const current = run.steps[run.current]
  return (
    <Link
      to={`/workspace?run=${run.id}`}
      className={cn('block rounded-lg border px-3.5 py-3 transition', active ? 'border-brand-300 bg-brand-50/40' : 'border-slate-200 bg-white hover:border-slate-300')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-800">{run.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            {run.sensitive && <ShieldCheck className="size-3.5 text-emerald-600" aria-label="ประมวลผลบน Local AI" />}
            {run.status === 'running' && current ? <span className="truncate"><span className="font-medium text-brand-700">{current.name}</span> · {current.task}</span> : <span>{timeAgo(run.createdAt)}</span>}
          </div>
        </div>
        <StatusPill status={run.status} />
      </div>
      {!compact && (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1" aria-hidden>
            {run.steps.map((s) => <span key={s.id} className={cn('h-1.5 w-5 rounded-full', DOT[s.status])} />)}
          </div>
          {run.status === 'running' && <ProgressBar value={runProgress(run)} className="flex-1" />}
          {run.status !== 'running' && (
            <div className="flex -space-x-1">
              {run.steps.slice(0, 5).map((s) => <EntityIcon key={s.id} icon={s.kind} size="sm" className="ring-2 ring-white" />)}
            </div>
          )}
        </div>
      )}
    </Link>
  )
}
