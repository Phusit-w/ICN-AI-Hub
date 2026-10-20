import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { cn } from '../../lib/utils'
import EntityIcon from './EntityIcon'

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
