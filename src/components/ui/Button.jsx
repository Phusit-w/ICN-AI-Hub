import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:bg-brand-300',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-300',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  danger: 'text-rose-600 hover:bg-rose-50',
}
const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-8 w-8 justify-center',
}

/** Renders a router Link when `to` is given, otherwise a button. */
export default function Button({ variant = 'secondary', size = 'md', to, icon: Icon, className, children, ...props }) {
  const classes = cn(
    'inline-flex shrink-0 items-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed whitespace-nowrap',
    VARIANTS[variant], SIZES[size], className,
  )
  const content = (
    <>
      {Icon && <Icon className={size === 'sm' || size === 'icon' ? 'size-4' : 'size-[18px]'} aria-hidden />}
      {children}
    </>
  )
  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>
  return <button type="button" className={classes} {...props}>{content}</button>
}
