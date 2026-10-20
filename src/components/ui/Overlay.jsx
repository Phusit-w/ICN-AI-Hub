import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { CircleCheck, Info, X } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { cn } from '../../lib/utils'

export function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  // Portal to <body>: an ancestor with backdrop-filter (the sticky header) would otherwise trap `fixed` inside it.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className={cn('rise flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="ปิด">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Toaster() {
  const { state, actions } = useStore()
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {state.toasts.map((t) => (
        <div key={t.id} className="rise pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          {t.tone === 'success' ? <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" /> : <Info className="mt-0.5 size-5 shrink-0 text-brand-500" />}
          <p className="flex-1 text-sm text-slate-700">
            {t.message}
            {t.action && <Link to={t.action.to} onClick={() => actions.dismissToast(t.id)} className="ml-1.5 font-medium text-brand-700 hover:underline">{t.action.label}</Link>}
          </p>
          <button type="button" onClick={() => actions.dismissToast(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="ปิด">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function Avatar({ name, size = 'md' }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600', size === 'sm' ? 'size-6 text-[10px]' : 'size-8 text-xs')} aria-hidden>
      {initials}
    </span>
  )
}
