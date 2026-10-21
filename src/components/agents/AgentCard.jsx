import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'
import EntityIcon from './EntityIcon'

/** `reveal`: hidden until its card is hovered or has keyboard focus (stays shown once starred). */
export function FavoriteButton({ id, reveal = false, className }) {
  const { state, actions } = useStore()
  const on = state.favorites.includes(id)
  return (
    <button
      type="button" onClick={() => actions.toggleFavorite(id)} aria-pressed={on} aria-label={on ? 'นำออกจาก Favorite' : 'เพิ่มใน Favorite'}
      className={cn('rounded-md p-1.5 transition hover:bg-slate-100', reveal && !on && 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100', className)}
    >
      <Star className={cn('size-4', on ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
    </button>
  )
}

/**
 * The one card shape for Agents and Workflows: icon, name, one line of description and "ใช้งาน".
 * The name's link stretches over the whole card, so clicking anywhere but the controls opens the details.
 * Pass `favoriteId` for an Agent to get its Favourite star. `primary` makes "ใช้งาน" the page's one brand button.
 */
export function ItemCard({ icon, tone, name, description, to, useTo, favoriteId, primary = false, className, ...props }) {
  return (
    <li className={cn('group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm', className)} {...props}>
      <div className="flex items-start justify-between gap-2">
        <EntityIcon icon={icon} tone={tone} />
        {favoriteId && <FavoriteButton id={favoriteId} reveal className="relative z-10 -mt-1 -mr-1" />}
      </div>
      <Link
        to={to}
        className="mt-3 truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700 after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-300"
      >{name}</Link>
      <p className="mt-0.5 truncate text-[13px] text-slate-500">{description}</p>
      <Button size="sm" variant={primary ? 'primary' : 'subtle'} icon={Play} to={useTo} className="relative z-10 mt-3 self-start">ใช้งาน</Button>
    </li>
  )
}
