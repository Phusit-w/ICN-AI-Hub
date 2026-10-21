import { Fragment } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import EntityIcon from '../agents/EntityIcon'
import { ModelBadge, StatusPill } from '../ui/Badge'
import { ProgressBar } from '../ui/Card'
import { cn } from '../../lib/utils'

function Connector({ active, done, vertical }) {
  return (
    <div className={cn('flex shrink-0 items-center justify-center py-1', !vertical && 'lg:w-8 lg:py-0')} aria-hidden>
      {!vertical && (
        <svg className="hidden lg:block" width="32" height="12" viewBox="0 0 32 12">
          <line x1="0" y1="6" x2="26" y2="6" strokeWidth="2" className={cn(active ? 'flow-line stroke-brand-500' : done ? 'stroke-emerald-400' : 'stroke-slate-300')} />
          <path d="M24 2 L30 6 L24 10" fill="none" strokeWidth="2" className={cn(active ? 'stroke-brand-500' : done ? 'stroke-emerald-400' : 'stroke-slate-300')} />
        </svg>
      )}
      <ArrowRight className={cn('size-4 rotate-90', !vertical && 'lg:hidden', active ? 'text-brand-500' : done ? 'text-emerald-400' : 'text-slate-300')} />
    </div>
  )
}

/**
 * Visual chain of agents for one run: which agent is working, which are waiting, which are done.
 * It runs left to right on wide screens unless `vertical`, e.g. inside a narrow side panel.
 */
export default function Pipeline({ steps, selectedId, onSelect, vertical = false }) {
  return (
    <div className={cn('flex flex-col', !vertical && 'lg:flex-row lg:items-stretch lg:overflow-x-auto lg:pb-2')}>
      {steps.map((s, i) => {
        const processing = s.status === 'processing'
        const prev = steps[i - 1]
        return (
          <Fragment key={s.id}>
            {i > 0 && <Connector vertical={vertical} done={prev.status === 'completed'} active={prev.status === 'completed' && processing} />}
            <div
              role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined}
              onClick={onSelect ? () => onSelect(s.id) : undefined}
              onKeyDown={onSelect ? (e) => e.key === 'Enter' && onSelect(s.id) : undefined}
              className={cn(
                'relative flex min-w-0 flex-col rounded-xl border bg-white p-3 transition',
                !vertical && 'lg:w-52 lg:shrink-0',
                processing ? 'pulse-ring border-brand-400' : s.status === 'completed' ? 'border-emerald-200' : s.status === 'returned' ? 'border-amber-300' : 'border-slate-200',
                selectedId === s.id && 'ring-2 ring-brand-500',
                onSelect && 'cursor-pointer hover:border-slate-300',
              )}
            >
              <div className="flex items-start gap-2.5">
                <EntityIcon icon={s.kind} size="sm" tone={s.kind === 'skill' || s.kind === 'condition' ? 'skill' : 'agent'} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-slate-800">{s.name}</div>
                  <div className="truncate text-[11.5px] text-slate-500">{s.task}</div>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <StatusPill status={s.status} />
                {s.model ? <ModelBadge modelId={s.model} showName={false} /> : <span className="text-[11px] text-slate-400">Rule</span>}
              </div>
              {processing && <ProgressBar value={Math.min(s.elapsed / s.duration, 1)} className="mt-2.5" />}
              {s.loopBackTo != null && s.loopsLeft > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-700">
                  <RotateCcw className="size-3" aria-hidden /> ถ้าไม่ผ่าน → กลับไป {steps[s.loopBackTo]?.name}
                </div>
              )}
              {s.loops > 0 && s.kind !== 'condition' && s.status !== 'returned' && (
                <div className="mt-2 text-[11px] text-slate-500">รอบที่ {s.loops + 1}</div>
              )}
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
