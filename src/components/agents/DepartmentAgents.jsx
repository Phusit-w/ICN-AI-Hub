import { Link } from 'react-router-dom'
import { useStore } from '../../store/AppStore'
import { deptById, userById } from '../../data/catalog'
import { cn } from '../../lib/utils'
import EntityIcon from './EntityIcon'

/**
 * "ผู้ช่วยของแผนกคุณ": the agents the user's department already uses, ready on day one,
 * so nobody has to build an agent or a skill before getting value. One click fills one into the composer.
 */
export default function DepartmentAgents({ pick, onPick, max = 4 }) {
  const { state } = useStore()
  const dept = deptById(userById(state.userId).dept)
  const agents = state.agents.filter((a) => a.dept === dept.id).sort((a, b) => b.uses - a.uses).slice(0, max)
  if (agents.length === 0) return null
  return (
    <section aria-labelledby="dept-agents-title" className="text-left">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="dept-agents-title" className="text-sm font-semibold text-slate-900">ผู้ช่วยของแผนกคุณ <span className="font-normal text-slate-500">· {dept.th}</span></h2>
        <Link to="/agents" className="text-xs font-medium text-brand-700 hover:underline">ดูทุกแผนก</Link>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {agents.map((a) => {
          const picked = pick.agentId === a.id
          return (
            <li key={a.id}>
              <button
                type="button" aria-pressed={picked} onClick={() => onPick(picked ? {} : { agentId: a.id })}
                className={cn(
                  'flex h-full w-full items-start gap-3 rounded-xl border bg-white p-3 text-left transition',
                  picked ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-brand-300',
                )}
              >
                <EntityIcon icon={a.kind} size="sm" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900">{a.name}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">{a.description}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
