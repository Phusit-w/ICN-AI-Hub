import { cn, fmtCompact } from '../../lib/utils'
import { Rating } from '../ui/Badge'

/** Uses, rating and version: shown where a Workflow is opened, not on its card. */
export default function WorkflowStats({ workflow, className }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500', className)}>
      <span>v{workflow.version}</span>
      {workflow.rating > 0 && <Rating value={workflow.rating} />}
      <span>ใช้ {fmtCompact(workflow.uses)} ครั้ง</span>
    </p>
  )
}
