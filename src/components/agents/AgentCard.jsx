import { Link } from 'react-router-dom'
import { Copy, Play, Star } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { userById } from '../../data/catalog'
import { cn, fmtCompact } from '../../lib/utils'
import EntityIcon from './EntityIcon'
import Button from '../ui/Button'
import { DeptBadge, ModelBadge, Rating, ShareBadge } from '../ui/Badge'

export function FavoriteButton({ id, className }) {
  const { state, actions } = useStore()
  const on = state.favorites.includes(id)
  return (
    <button
      type="button" onClick={() => actions.toggleFavorite(id)} aria-pressed={on} aria-label={on ? 'นำออกจาก Favorite' : 'เพิ่มใน Favorite'}
      className={cn('rounded-md p-1.5 transition hover:bg-slate-100', className)}
    >
      <Star className={cn('size-4', on ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
    </button>
  )
}

export default function AgentCard({ agent }) {
  return (
    <div data-tour="agent-card" className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <EntityIcon icon={agent.kind} />
        <div className="min-w-0 flex-1">
          <Link to={`/agents/${agent.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-700">{agent.name}</Link>
          <div className="mt-0.5 flex items-center gap-2"><DeptBadge dept={agent.dept} /><span className="text-xs text-slate-400">v{agent.version}</span></div>
        </div>
        <FavoriteButton id={agent.id} className="-mt-1 -mr-1" />
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-[13px] leading-relaxed text-slate-600">{agent.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <ModelBadge modelId={agent.model} />
        <ShareBadge share={agent.share} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="truncate">โดย {userById(agent.owner).name}</span>
        <span className="flex items-center gap-3"><Rating value={agent.rating} /><span>ใช้ {fmtCompact(agent.uses)} ครั้ง</span></span>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="primary" size="sm" icon={Play} to={`/workspace?agent=${agent.id}`} className="flex-1 justify-center">ใช้งาน</Button>
        <Button size="sm" to={`/agents/${agent.id}`}>รายละเอียด</Button>
        <Button size="sm" icon={Copy} to={`/agents/new?from=${agent.id}`} aria-label={`Clone ${agent.name}`} title="คัดลอกไปปรับใช้" />
      </div>
    </div>
  )
}

/** One-line row for side lists (Home, Detail). */
export function AgentRow({ agent, meta }) {
  return (
    <Link to={`/agents/${agent.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50">
      <EntityIcon icon={agent.kind} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-800">{agent.name}</div>
        <div className="truncate text-xs text-slate-500">{meta ?? agent.description}</div>
      </div>
    </Link>
  )
}
