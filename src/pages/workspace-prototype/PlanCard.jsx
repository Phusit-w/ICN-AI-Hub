// PROTOTYPE (branch prototype/workspace-layout): the Plan and its progress as one module, so confirming the Plan
// turns the same card into progress instead of swapping in an unrelated block.
import { CircleCheck, CircleDashed, ListChecks, LoaderCircle, Play, Undo2, X } from 'lucide-react'
import { cn, truncate } from '../../lib/utils'
import { useStore } from '../../store/AppStore'
import AgentCube from '../../components/agents/AgentCube'
import { useCube, useVariant } from './PrototypeSwitcher'
import Button from '../../components/ui/Button'

const STATUS = {
  completed: { Icon: CircleCheck, tone: 'text-emerald-500', text: 'เสร็จแล้ว' },
  processing: { Icon: LoaderCircle, tone: 'animate-spin text-brand-500', text: 'กำลังทำ' },
  returned: { Icon: Undo2, tone: 'text-amber-500', text: 'ส่งกลับไปแก้' },
  waiting: { Icon: CircleDashed, tone: 'text-slate-300', text: 'รอคิว' },
}

function heading(run) {
  const n = run.steps.length
  if (run.status === 'planned') return `งานนี้มี ${n} ขั้นตอน`
  if (run.status === 'running') return `กำลังทำงาน · ขั้นตอน ${Math.min(run.current + 1, n)} จาก ${n}`
  return `เสร็จแล้ว · ${n} ขั้นตอน`
}

/**
 * Variant B while a Run is under way: one Cube per step, each the Agent's own. The one working glances about and keeps
 * the task in its bubble, the ones waiting doze, the finished ones squint happily, and a finished one beside the
 * working one looks across at it as the work is handed over.
 */
function CubeTeam({ run }) {
  const { state } = useStore()
  const solo = run.steps.length === 1
  return (
    <div className="mb-4 flex items-start gap-3 pb-7" aria-hidden>
      {run.steps.map((s, i) => {
        const agent = state.agents.find((a) => a.id === s.agentId) ?? { id: s.agentId ?? s.kind }
        const working = s.status === 'processing'
        const next = run.steps[i + 1]
        return (
          <AgentCube
            key={s.id} agent={agent} size={solo ? 72 : 48} thinking={working}
            mood={s.status === 'completed' ? 'done' : s.status === 'waiting' ? 'sleep' : undefined}
            gaze={s.status === 'completed' && next?.status === 'processing' ? [0.7, 0] : undefined}
            message={working ? truncate(s.task, 28) : undefined}
          />
        )
      })}
    </div>
  )
}

/** `bare` drops the border and padding when the card already sits on a surface of its own. */
export default function PlanCard({ run, onRemove, onStart, onShowSteps, bare }) {
  const [variant] = useVariant()
  const [cubeOn] = useCube()
  const planned = run.status === 'planned'
  const canRemove = planned && run.steps.length > 1 && onRemove
  return (
    <section aria-label="แผนงาน" className={cn(!bare && 'rounded-xl border border-slate-200 bg-white p-4')}>
      {variant === 'B' && cubeOn && !planned && <CubeTeam run={run} />}
      <h3 className="text-sm font-semibold text-slate-900" aria-live="polite">{heading(run)}</h3>
      <ol className="mt-3 space-y-2">
        {run.steps.map((s, i) => {
          const { Icon, tone, text } = STATUS[s.status] ?? STATUS.waiting
          return (
            <li key={s.id} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center"><Icon className={cn('size-[18px]', tone)} aria-hidden /></span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm', s.status === 'waiting' ? 'text-slate-500' : 'font-medium text-slate-800')}>{i + 1}. {s.task}</span>
                <span className="block text-xs text-slate-400">{s.name.replace(' Agent', '')}{!planned && ` · ${text}`}</span>
              </span>
              {canRemove && (
                <button type="button" onClick={() => onRemove(s.id)} aria-label={`ลบขั้นตอน ${s.task} ออกจากแผน`} title="เอาขั้นตอนนี้ออก" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500">
                  <X className="size-4" />
                </button>
              )}
            </li>
          )
        })}
      </ol>
      {(planned || (run.status === 'running' && onShowSteps)) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {planned && <Button variant="primary" icon={Play} onClick={onStart}>เริ่มทำงาน</Button>}
          {onShowSteps && <Button variant={planned ? 'secondary' : 'ghost'} size={planned ? 'md' : 'sm'} icon={ListChecks} onClick={onShowSteps}>ดูขั้นตอน</Button>}
        </div>
      )}
    </section>
  )
}
