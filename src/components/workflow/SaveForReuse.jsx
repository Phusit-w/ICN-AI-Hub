import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkCheck, BookmarkPlus, Workflow } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { userById } from '../../data/catalog'
import { agentFromRun, defaultReuseName, reuseTarget, workflowFromRun } from '../../lib/reuse'
import Button from '../ui/Button'

const KIND_LABEL = { agent: 'ผู้ช่วย', workflow: 'สายงาน' }

/**
 * "บันทึกไว้ใช้ซ้ำ" under a finished run: one click opens a small panel with a prefilled name,
 * a second click saves it as an Agent or a Workflow (whichever fits) and the user stays in the chat.
 */
export default function SaveForReuse({ run }) {
  const { state, actions } = useStore()
  const [open, setOpen] = useState(false)
  const kind = reuseTarget(run)
  const [name, setName] = useState(() => (kind ? defaultReuseName(run, kind) : ''))
  const box = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const close = (e) => { if (e.type === 'keydown' ? e.key === 'Escape' : !box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close) }
  }, [open])

  if (run.workflowId) {
    const wf = state.workflows.find((w) => w.id === run.workflowId)
    return wf ? (
      <Link to={`/workflows?id=${wf.id}`} className="inline-flex h-8 items-center gap-1.5 px-2 text-xs text-slate-400 hover:text-brand-700"><Workflow className="size-3.5" />จากสายงาน {wf.name}</Link>
    ) : null
  }
  if (run.savedAs) {
    const to = run.savedAs.kind === 'agent' ? `/agents/${run.savedAs.id}` : `/workflows?id=${run.savedAs.id}`
    return <Link to={to} className="inline-flex h-8 items-center gap-1.5 px-2 text-xs font-medium text-emerald-700 hover:underline"><BookmarkCheck className="size-3.5" />บันทึกเป็น{KIND_LABEL[run.savedAs.kind]}แล้ว</Link>
  }
  if (!kind) return null

  const save = () => {
    const n = name.trim()
    if (!n) return
    const owner = state.userId
    if (kind === 'agent') {
      const agent = agentFromRun(run, { name: n, owner, agents: state.agents })
      actions.addAgent(agent)
      actions.annotateRun(run.id, { savedAs: { kind, id: agent.id } })
      actions.toast(`บันทึกเป็นผู้ช่วย “${n}” แล้ว`, { action: { label: 'เปิดดู', to: `/agents/${agent.id}` } })
    } else {
      const wf = workflowFromRun(run, { name: n, owner, dept: userById(owner).dept })
      actions.saveWorkflow(wf)
      actions.annotateRun(run.id, { savedAs: { kind, id: wf.id } })
      actions.toast(`บันทึกเป็นสายงาน “${n}” แล้ว`, { action: { label: 'เปิดดู', to: `/workflows?id=${wf.id}` } })
    }
    setOpen(false)
  }

  return (
    <div ref={box} className="relative">
      <Button size="sm" variant="ghost" icon={BookmarkPlus} onClick={() => setOpen(!open)} aria-expanded={open}>บันทึกไว้ใช้ซ้ำ</Button>
      {open && (
        <form
          onSubmit={(e) => { e.preventDefault(); save() }}
          className="rise absolute bottom-10 left-0 z-30 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <p className="text-xs text-slate-500">
            บันทึกเป็น<b className="font-semibold text-brand-700">{KIND_LABEL[kind]}</b>
            {kind === 'agent' ? ' — เรียกใช้ซ้ำได้จากคลังผู้ช่วย' : ' — รันขั้นตอนเดิมกับงานใหม่ได้ทันที'}
          </p>
          <input
            autoFocus value={name} onChange={(e) => setName(e.target.value)} aria-label={`ชื่อ${KIND_LABEL[kind]}`}
            className="mt-2 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">แชร์: เฉพาะฉัน · แก้รายละเอียดได้ภายหลัง</span>
            <Button type="submit" size="sm" variant="primary" disabled={!name.trim()}>บันทึก</Button>
          </div>
        </form>
      )}
    </div>
  )
}
