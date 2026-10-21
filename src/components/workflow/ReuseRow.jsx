import { Link } from 'react-router-dom'
import { ArrowRight, Workflow } from 'lucide-react'
import { cn } from '../../lib/utils'
import EntityIcon from '../agents/EntityIcon'

const chip = 'flex items-center gap-2 rounded-full border bg-white py-1 pr-3.5 pl-1 text-sm transition'

/** "ใช้ซ้ำ": Favourite agents and the Workflows the user uses; one click fills one into the composer above. */
export default function ReuseRow({ items, pick, onPick, hasFavorites }) {
  const isPicked = ({ kind, item }) => (kind === 'agent' ? pick.agentId : pick.workflowId) === item.id
  return (
    <section data-tour="home-reuse" aria-labelledby="reuse-title" className="text-left">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="reuse-title" className="text-sm font-semibold text-slate-900">ใช้ซ้ำ</h2>
        <Link to="/agents" className="text-xs font-medium text-brand-700 hover:underline">ผู้ช่วยทั้งหมด</Link>
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => {
          const picked = isPicked(it)
          return (
            <li key={`${it.kind}:${it.item.id}`}>
              <button
                type="button" aria-pressed={picked} onClick={() => onPick(picked ? {} : it.pick)}
                className={cn(chip, picked ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-700 hover:border-brand-300')}
              >
                {it.kind === 'agent'
                  ? <EntityIcon icon={it.item.kind} size="sm" className="!rounded-full" />
                  : <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Workflow className="size-3.5" aria-hidden /></span>}
                <span className="sr-only">{it.kind === 'agent' ? 'ผู้ช่วย' : 'สายงาน'} </span>{it.item.name}
              </button>
            </li>
          )
        })}
      </ul>
      {!hasFavorites && (
        <p className="mt-2 text-[13px] text-slate-500">
          ยังไม่มีผู้ช่วยประจำ — กดดาวที่ผู้ช่วยใน<Link to="/agents" className="text-brand-700 hover:underline">คลังผู้ช่วย</Link> แล้วจะมาอยู่ตรงนี้ให้กดใช้ได้ทันที
        </p>
      )}
      <Link to="/agents/new" className="mt-3 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">อยากมีผู้ช่วยเฉพาะของแผนก? สร้างเองได้ไม่ต้องเขียนโค้ด <ArrowRight className="size-3.5" /></Link>
    </section>
  )
}
