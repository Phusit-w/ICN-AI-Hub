import { useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'

const thumb = 'flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700'

/**
 * 👍/👎 under a finished Artifact. 👎 opens a short, optional reason; either verdict can be changed later.
 */
export default function Feedback({ run }) {
  const { state, actions } = useStore()
  const given = state.feedback[run.id]
  const [asking, setAsking] = useState(false)
  const [reason, setReason] = useState(given?.reason ?? '')

  const up = () => { setAsking(false); actions.giveFeedback(run.id, 'up') }
  // Pressing 👎 again reopens the reason box without dropping a reason already given.
  const down = () => { setAsking(true); if (given?.verdict !== 'down') actions.giveFeedback(run.id, 'down') }
  const sendReason = () => { actions.giveFeedback(run.id, 'down', reason.trim()); setAsking(false) }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button type="button" aria-label="มีประโยชน์" aria-pressed={given?.verdict === 'up'} onClick={up} className={cn(thumb, given?.verdict === 'up' && 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700')}>
        <ThumbsUp className="size-4" aria-hidden />
      </button>
      <button type="button" aria-label="ไม่มีประโยชน์" aria-pressed={given?.verdict === 'down'} onClick={down} className={cn(thumb, given?.verdict === 'down' && 'bg-rose-50 text-rose-600 hover:bg-rose-50 hover:text-rose-700')}>
        <ThumbsDown className="size-4" aria-hidden />
      </button>
      {asking ? (
        <form onSubmit={(e) => { e.preventDefault(); sendReason() }} className="flex items-center gap-1.5">
          <input
            autoFocus value={reason} onChange={(e) => setReason(e.target.value)} aria-label="เหตุผล (ไม่บังคับ)" placeholder="บอกสั้นๆ ว่าอะไรยังไม่ดี (ไม่บังคับ)"
            className="h-8 w-56 rounded-lg border border-slate-200 px-2.5 text-xs focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <Button type="submit" size="sm" variant="subtle">ส่งเหตุผล</Button>
        </form>
      ) : given && <span className="text-xs text-slate-400">ขอบคุณสำหรับ Feedback</span>}
    </div>
  )
}
