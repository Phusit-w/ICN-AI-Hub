import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { stepsLabel } from '../../lib/steps'
import EntityIcon from '../agents/EntityIcon'

const chip = 'flex items-center gap-2 rounded-full border bg-white py-1 pr-3.5 pl-1 text-sm transition'

/** "ใช้ซ้ำ": the Agents the user reuses (`agents`), with or without Steps; one click fills one into the composer above. */
export default function ReuseRow({ agents, pick, onPick, hasFavorites }) {
  return (
    <section data-tour="home-reuse" aria-labelledby="reuse-title" className="text-left">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="reuse-title" className="text-sm font-semibold text-slate-900">ใช้ซ้ำ</h2>
        <Link to="/agents" className="text-xs font-medium text-brand-700 hover:underline">Agent ทั้งหมด</Link>
      </div>
      <ul className="flex flex-wrap gap-2">
        {agents.map((agent) => {
          const picked = pick.agentId === agent.id
          return (
            <li key={agent.id}>
              <button
                type="button" aria-pressed={picked} onClick={() => onPick(picked ? {} : { agentId: agent.id })}
                className={cn(chip, picked ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-700 hover:border-brand-300')}
              >
                <EntityIcon icon={agent.kind} size="sm" className="!rounded-full" />
                <span className="sr-only">Agent </span>{agent.name}
                {stepsLabel(agent) && <span className="text-xs text-slate-500">· {stepsLabel(agent)}</span>}
              </button>
            </li>
          )
        })}
      </ul>
      {!hasFavorites && (
        <p className="mt-2 text-[13px] text-slate-500">
          ยังไม่มี Agent ประจำ — กดดาวที่ Agent ใน<Link to="/agents" className="text-brand-700 hover:underline">คลัง Agent</Link> แล้วจะมาอยู่ตรงนี้ให้กดใช้ได้ทันที
        </p>
      )}
      <Link to="/agents/new" className="mt-3 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">อยากมี Agent เฉพาะของแผนก? สร้างเองได้ไม่ต้องเขียนโค้ด <ArrowRight className="size-3.5" /></Link>
    </section>
  )
}
