import { Fragment, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronRight, Pencil, Play, Plus, Save, Settings2, Sparkles, X } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { userById } from '../data/catalog'
import { planRequest } from '../lib/runs'
import { linearWorkflow } from '../lib/reuse'
import { matchScore, uid } from '../lib/utils'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { DeptBadge } from '../components/ui/Badge'
import EntityIcon from '../components/agents/EntityIcon'
import TypewriterHint from '../components/ui/TypewriterHint'
import WorkflowBuilder from './WorkflowBuilder'

const EXAMPLES = [
  'รับ requirement ลูกค้า แล้วร่าง proposal ให้ Review Agent ตรวจก่อนส่ง',
  'ดึงยอดขายรายเดือน วิเคราะห์ตัวเลข แล้วสรุปเป็นรายงานพร้อมกราฟ',
  'ค้นข้อมูลคู่แข่ง สรุปเป็นเอกสาร และทำภาพประกอบ',
]

const runLink = (w) => `/workspace?workflow=${w.id}`

/** Agents and skills in a workflow, in canvas order, for compact previews. */
function useSteps() {
  const { state } = useStore()
  return (w) => w.nodes
    .filter((n) => n.type === 'agent' || n.type === 'skill')
    .sort((a, b) => a.x - b.x)
    .map((n) => {
      const e = n.type === 'agent' ? state.agents.find((x) => x.id === n.ref) : state.skills.find((x) => x.id === n.ref)
      return { id: n.id, name: e?.name.replace(' Agent', '') ?? n.label, icon: n.type === 'agent' ? e?.kind : e?.icon, tone: n.type === 'agent' ? 'agent' : 'skill' }
    })
}

function StepTrail({ steps, max = 5 }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.slice(0, max).map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && <ChevronRight className="size-3 text-slate-300" aria-hidden />}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pr-2 pl-0.5 text-[11px] text-slate-600">
            <EntityIcon icon={s.icon} tone={s.tone} size="sm" className="!size-5 !rounded-full" />{s.name}
          </span>
        </Fragment>
      ))}
      {steps.length > max && <span className="text-[11px] text-slate-400">+{steps.length - max}</span>}
    </div>
  )
}

function WorkflowList({ title, items, empty }) {
  const steps = useSteps()
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-slate-900">{title}</h2>
      {items.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">{empty}</p> : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {items.map((w) => (
            <li key={w.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="truncate text-sm font-medium text-slate-800">{w.name}</span><DeptBadge dept={w.dept} /></div>
                <div className="mt-1.5"><StepTrail steps={steps(w)} max={4} /></div>
              </div>
              <Button size="icon" variant="ghost" icon={Pencil} to={`/workflows?id=${w.id}`} aria-label={`แก้ ${w.name}`} title="แก้สายงาน" />
              <Button size="sm" variant="primary" icon={Play} to={runLink(w)}>ใช้งาน</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** The AI's first draft as a plain list: remove, reorder or add agents, then save or try it. Loops and branches live in the canvas. */
function DraftEditor({ initial, onCancel }) {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const [name, setName] = useState(initial.name)
  const [refs, setRefs] = useState(initial.refs)
  const move = (i, d) => setRefs((r) => { const n = [...r]; [n[i], n[i + d]] = [n[i + d], n[i]]; return n })
  const entity = (r) => (r.type === 'agent' ? state.agents.find((a) => a.id === r.ref) : state.skills.find((s) => s.id === r.ref))

  const save = (then) => {
    const wf = linearWorkflow({ name: name.trim(), description: initial.prompt, dept: userById(state.userId).dept, owner: state.userId, refs })
    actions.saveWorkflow(wf)
    then(wf)
  }

  return (
    <Card className="rise p-5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-brand-700"><Sparkles className="size-3.5" /> AI ร่างสายงานให้แล้ว — ตรวจลำดับขั้นตอนด้านล่าง</p>
      <input value={name} onChange={(e) => setName(e.target.value)} aria-label="ชื่อสายงาน" className="mt-2 w-full rounded-lg border border-transparent px-2 py-1 text-lg font-semibold text-slate-900 hover:border-slate-200 focus:border-brand-400 focus:outline-none" />
      <p className="px-2 text-xs text-slate-400">จาก: {initial.prompt}</p>

      <ol className="mt-4 space-y-2">
        {refs.map((r, i) => {
          const e = entity(r)
          return (
            <li key={r.key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{i + 1}</span>
              <EntityIcon icon={r.type === 'agent' ? e?.kind : e?.icon} tone={r.type === 'agent' ? 'agent' : 'skill'} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-800">{e?.name ?? r.label}</div>
                <div className="truncate text-xs text-slate-500">{r.type === 'agent' ? e?.description : e?.purpose}</div>
              </div>
              <Button size="icon" variant="ghost" icon={ArrowUp} onClick={() => move(i, -1)} disabled={i === 0} aria-label="เลื่อนขึ้น" />
              <Button size="icon" variant="ghost" icon={ArrowDown} onClick={() => move(i, 1)} disabled={i === refs.length - 1} aria-label="เลื่อนลง" />
              <Button size="icon" variant="ghost" icon={X} onClick={() => setRefs(refs.filter((x) => x !== r))} disabled={refs.length === 1} aria-label={`เอา ${e?.name ?? r.label} ออก`} />
            </li>
          )
        })}
      </ol>
      <label className="mt-2 flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-700 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-300">
        <Plus className="size-4" /> เพิ่มผู้ช่วย
        <select
          value="" aria-label="เพิ่มผู้ช่วยในสายงาน" className="sr-only"
          onChange={(e) => e.target.value && setRefs([...refs, { key: uid('ref'), type: 'agent', ref: e.target.value }])}
        >
          <option value="">เลือกผู้ช่วย…</option>
          {state.agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Button variant="ghost" onClick={onCancel}>ยกเลิก</Button>
        <Button variant="ghost" size="sm" icon={Settings2} onClick={() => save((wf) => navigate(`/workflows?id=${wf.id}`))} disabled={!name.trim()}>แก้แบบละเอียด</Button>
        <div className="ml-auto flex gap-2">
          <Button icon={Save} disabled={!name.trim()} onClick={() => save((wf) => { actions.toast(`บันทึกสายงาน “${wf.name}” แล้ว`); onCancel() })}>บันทึก</Button>
          <Button variant="primary" icon={Play} disabled={!name.trim()} onClick={() => save((wf) => navigate(runLink(wf)))}>ลองรัน</Button>
        </div>
      </div>
    </Card>
  )
}

function Landing() {
  const { state } = useStore()
  const steps = useSteps()
  const [text, setText] = useState('')
  const [draft, setDraft] = useState(null)

  const used = new Set(state.runs.filter((r) => r.owner === state.userId).map((r) => r.workflowId))
  const mine = state.workflows.filter((w) => w.owner === state.userId || used.has(w.id))
  const shared = state.workflows.filter((w) => !mine.includes(w)).sort((a, b) => b.uses - a.uses)
  // While typing, surface workflows that already do this job so people reuse instead of rebuilding.
  const matches = text.trim()
    ? state.workflows.map((w) => ({ w, s: matchScore(`${w.name} ${w.description}`, text) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map((x) => x.w)
    : []

  const startDraft = () => {
    const prompt = text.trim()
    if (!prompt) return
    // Mock AI: reuse the request planner, keep only the agent/skill steps.
    const plan = planRequest(prompt, state)
    const refs = plan.steps.filter((s) => s.agentId || s.skillId).map((s) => ({ key: uid('ref'), type: s.agentId ? 'agent' : 'skill', ref: s.agentId ?? s.skillId, label: s.name }))
    setDraft({ prompt, name: prompt.length > 40 ? `${prompt.slice(0, 40)}…` : prompt, refs })
    setText('')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pt-2 lg:pt-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">อยากให้สายงานอัตโนมัติทำอะไร?</h1>
        <p className="mt-1 text-sm text-slate-500">เล่าขั้นตอนเป็นภาษาปกติ AI จะจัดผู้ช่วยให้ทำงานต่อกันเป็นสาย</p>
      </div>

      {draft ? <DraftEditor key={draft.prompt} initial={draft} onCancel={() => setDraft(null)} /> : (
        <div>
          <form onSubmit={(e) => { e.preventDefault(); startDraft() }} className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100" data-tour="wf-prompt">
            <div className="relative flex-1">
              <textarea
                value={text} onChange={(e) => setText(e.target.value)} rows={2} aria-label="อยากให้สายงานทำอะไร"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); startDraft() } }}
                className="block w-full resize-none bg-transparent px-2 py-1.5 text-[15px] focus:outline-none"
              />
              {!text && <TypewriterHint phrases={EXAMPLES} className="px-2 py-1.5 text-[15px]" />}
            </div>
            <button type="submit" disabled={!text.trim()} aria-label="ให้ AI ร่างสายงาน" title="ให้ AI ร่างสายงาน" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400"><Sparkles className="size-4" /></button>
          </form>
          {matches.length > 0 && (
            <div className="rise mt-3 rounded-2xl border border-slate-200 bg-white p-2">
              <p className="px-2 pt-1 pb-2 text-xs text-slate-500">มีสายงานที่ทำแบบนี้อยู่แล้ว — กดใช้งานได้เลย หรือกด <Sparkles className="inline size-3" /> เพื่อสร้างใหม่</p>
              {matches.map((w) => (
                <div key={w.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">{w.name}</div>
                    <div className="mt-1"><StepTrail steps={steps(w)} max={4} /></div>
                  </div>
                  <Button size="sm" variant="primary" icon={Play} to={runLink(w)}>ใช้งาน</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <WorkflowList title="สายงานของฉัน" items={mine} empty="ยังไม่มี — พิมพ์ด้านบนเพื่อสร้าง หรือกด “บันทึกไว้ใช้ซ้ำ” ใต้แชตที่ใช้ได้ผล" />
      <WorkflowList title="สายงานแนะนำจากเพื่อนร่วมงาน" items={shared} empty="ยังไม่มีสายงานที่แชร์ไว้" />
    </div>
  )
}

/** Landing by default; `?id=` opens that workflow in the canvas editor. */
export default function Workflows() {
  const [params] = useSearchParams()
  return params.get('id') ? <WorkflowBuilder key={params.get('id')} /> : <Landing />
}
