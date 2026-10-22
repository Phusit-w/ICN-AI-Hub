import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, BookmarkCheck, BookmarkPlus } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { agentFromRun, canSaveForReuse, defaultReuseName } from '../../lib/reuse'
import { hasSteps } from '../../lib/steps'
import Button from '../ui/Button'

const agentHref = (id) => `/agents/${id}`

/**
 * "บันทึกไว้ใช้ซ้ำ" under a finished run: one click opens a small panel with a prefilled name,
 * a second click saves it as an Agent and the user stays in the chat.
 */
export default function SaveForReuse({ run }) {
  const { state, actions } = useStore()
  const [open, setOpen] = useState(false)
  const withSteps = state.agents.find((a) => a.id === run.agentId && hasSteps(a))
  const canSave = !withSteps && canSaveForReuse(run)
  // Saving captures the whole conversation, not just its last message.
  const thread = state.runs.filter((r) => r.threadId === run.threadId).sort((a, b) => a.createdAt - b.createdAt)
  const [name, setName] = useState(() => (canSave ? defaultReuseName(thread) : ''))
  const box = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const close = (e) => { if (e.type === 'keydown' ? e.key === 'Escape' : !box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close) }
  }, [open])

  // The Run already used a reusable Agent with Steps: point at it instead of saving a copy.
  if (withSteps) {
    return <Link to={agentHref(withSteps.id)} className="inline-flex h-8 items-center gap-1.5 px-2 text-xs text-slate-400 hover:text-brand-700"><Bot className="size-4" />ใช้ Agent {withSteps.name} ที่มีอยู่แล้ว</Link>
  }
  if (run.savedAs) {
    return <Link to={agentHref(run.savedAs.id)} className="inline-flex h-8 items-center gap-1.5 px-2 text-xs font-medium text-emerald-700 hover:underline"><BookmarkCheck className="size-4" />บันทึกเป็น Agent แล้ว</Link>
  }
  if (!canSave) return null

  const save = () => {
    const n = name.trim()
    if (!n) return
    const agent = agentFromRun(run, thread, { name: n, owner: state.userId, agents: state.agents })
    actions.addAgent(agent)
    actions.annotateRun(run.id, { savedAs: { id: agent.id } })
    actions.toast(`บันทึกเป็น Agent “${n}” แล้ว`, { action: { label: 'เปิดดู', to: agentHref(agent.id) } })
    setOpen(false)
  }

  return (
    <div ref={box} className="relative">
      <Button size="sm" icon={BookmarkPlus} onClick={() => setOpen(!open)} aria-expanded={open}>บันทึกไว้ใช้ซ้ำ</Button>
      {open && (
        <form
          onSubmit={(e) => { e.preventDefault(); save() }}
          className="rise absolute bottom-10 left-0 z-30 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <p className="text-xs text-slate-500">
            บันทึกเป็น<b className="font-semibold text-brand-700">Agent</b> — เรียกใช้ซ้ำได้จากคลัง Agent
          </p>
          <input
            autoFocus value={name} onChange={(e) => setName(e.target.value)} aria-label="ชื่อ Agent"
            className="mt-2 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">แชร์: เฉพาะฉัน · แก้รายละเอียดได้ภายหลัง</span>
            <Button type="submit" size="sm" variant="subtle" disabled={!name.trim()}>บันทึก</Button>
          </div>
        </form>
      )}
    </div>
  )
}
