import { Fragment, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronRight, Pencil, Play, Plus, Save, Settings2, Sparkles, X } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { userById } from '../data/catalog'
import { planRequest } from '../lib/runs'
import { linearWorkflow, stepRef } from '../lib/reuse'
import { rankByMatch, truncate, uid } from '../lib/utils'
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
const SHOWN_SUGGESTIONS = 4
// When the description gives the planner nothing to go on, start from the most common chain.
const FALLBACK_AGENTS = ['agent-research', 'agent-document']

const runLink = (w) => `/workspace?workflow=${w.id}`

/** Display info for an agent or skill reference in a workflow. */
function lookupRef({ type, ref, label }, { agents, skills }) {
  if (type === 'agent') {
    const a = agents.find((x) => x.id === ref)
    return { name: a?.name ?? label, detail: a?.description, icon: a?.kind, tone: 'agent' }
  }
  const s = skills.find((x) => x.id === ref)
  return { name: s?.name ?? label, detail: s?.purpose, icon: s?.icon, tone: 'skill' }
}

/** Returns `stepsOf(workflow)`: its agents and skills in canvas order, ready for compact previews. */
function useStepsOf() {
  const { state } = useStore()
  return (w) => w.nodes
    .filter((n) => n.type === 'agent' || n.type === 'skill')
    .sort((a, b) => a.x - b.x)
    .map((n) => ({ id: n.id, ...lookupRef(n, state) }))
}

function StepTrail({ steps, max = 4 }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.slice(0, max).map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && <ChevronRight className="size-3 text-slate-300" aria-hidden />}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pr-2 pl-0.5 text-[11px] text-slate-600">
            <EntityIcon icon={s.icon} tone={s.tone} size="sm" className="!size-5 !rounded-full" />{s.name.replace(' Agent', '')}
          </span>
        </Fragment>
      ))}
      {steps.length > max && <span className="text-[11px] text-slate-400">+{steps.length - max}</span>}
    </div>
  )
}

function WorkflowRows({ items }) {
  const stepsOf = useStepsOf()
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {items.map((w) => (
        <li key={w.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="truncate text-sm font-medium text-slate-800">{w.name}</span><DeptBadge dept={w.dept} /></div>
            <div className="mt-1.5"><StepTrail steps={stepsOf(w)} /></div>
          </div>
          <Button size="icon" variant="ghost" icon={Pencil} to={`/workflows?id=${w.id}`} aria-label={`แก้ ${w.name}`} title="แก้สายงาน" />
          <Button size="sm" variant="primary" icon={Play} to={runLink(w)}>ใช้งาน</Button>
        </li>
      ))}
    </ul>
  )
}

/** Shared workflows people can use as-is (GLOSSARY: not "templates"). A few cards, the rest on request. */
function Suggestions({ items }) {
  const stepsOf = useStepsOf()
  const [showAll, setShowAll] = useState(false)
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-900">สายงานแนะนำจากเพื่อนร่วมงาน</h2>
        {items.length > SHOWN_SUGGESTIONS && (
          <button type="button" onClick={() => setShowAll(!showAll)} className="text-xs font-medium text-brand-700 hover:underline">{showAll ? 'ย่อ' : `ดูทั้งหมด (${items.length})`}</button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(showAll ? items : items.slice(0, SHOWN_SUGGESTIONS)).map((w) => (
          <div key={w.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300">
            <div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold text-slate-900">{w.name}</span><DeptBadge dept={w.dept} /></div>
            <p className="mt-1 line-clamp-2 flex-1 text-xs text-slate-500">{w.description}</p>
            <div className="mt-3"><StepTrail steps={stepsOf(w)} max={3} /></div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="primary" icon={Play} to={runLink(w)} className="flex-1 justify-center">ใช้งาน</Button>
              <Button size="icon" variant="ghost" icon={Pencil} to={`/workflows?id=${w.id}`} aria-label={`ดูหรือแก้ ${w.name}`} title="ดู / แก้" />
            </div>
          </div>
        ))}
      </div>
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
  const canSave = name.trim() && refs.length > 0

  const save = (then) => {
    const wf = linearWorkflow({ name: name.trim(), description: initial.prompt, dept: userById(state.userId).dept, owner: state.userId, refs })
    actions.saveWorkflow(wf)
    then(wf)
  }

  return (
    <Card className="rise p-5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-brand-700"><Sparkles className="size-4" /> AI ร่างสายงานให้แล้ว — ตรวจลำดับขั้นตอนด้านล่าง</p>
      <input value={name} onChange={(e) => setName(e.target.value)} aria-label="ชื่อสายงาน" className="mt-2 w-full rounded-lg border border-transparent px-2 py-1 text-lg font-semibold text-slate-900 hover:border-slate-200 focus:border-brand-400 focus:outline-none" />
      <p className="px-2 text-xs text-slate-400">จาก: {initial.prompt}</p>

      <ol className="mt-4 space-y-2">
        {refs.map((r, i) => {
          const item = lookupRef(r, state)
          return (
            <li key={r.key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{i + 1}</span>
              <EntityIcon icon={item.icon} tone={item.tone} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-800">{item.name}</div>
                <div className="truncate text-xs text-slate-500">{item.detail}</div>
              </div>
              <Button size="icon" variant="ghost" icon={ArrowUp} onClick={() => move(i, -1)} disabled={i === 0} aria-label="เลื่อนขึ้น" />
              <Button size="icon" variant="ghost" icon={ArrowDown} onClick={() => move(i, 1)} disabled={i === refs.length - 1} aria-label="เลื่อนลง" />
              <Button size="icon" variant="ghost" icon={X} onClick={() => setRefs(refs.filter((x) => x !== r))} disabled={refs.length === 1} aria-label={`เอา ${item.name} ออก`} />
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
        <Button variant="ghost" size="sm" icon={Settings2} onClick={() => save((wf) => navigate(`/workflows?id=${wf.id}`))} disabled={!canSave}>แก้แบบละเอียด</Button>
        <div className="ml-auto flex gap-2">
          <Button icon={Save} disabled={!canSave} onClick={() => save((wf) => { actions.toast(`บันทึกสายงาน “${wf.name}” แล้ว`); onCancel() })}>บันทึก</Button>
          <Button variant="primary" icon={Play} disabled={!canSave} onClick={() => save((wf) => navigate(runLink(wf)))}>ลองรัน</Button>
        </div>
      </div>
    </Card>
  )
}

function Landing() {
  const { state } = useStore()
  const stepsOf = useStepsOf()
  const [text, setText] = useState('')
  const [draft, setDraft] = useState(null)

  // "Mine" = workflows I made, or ones I chose to run myself (not ones the planner matched for me).
  const picked = new Set(state.runs.filter((r) => r.owner === state.userId && r.workflowPicked).map((r) => r.workflowId))
  const mine = state.workflows.filter((w) => w.owner === state.userId || picked.has(w.id))
  const shared = state.workflows.filter((w) => !mine.includes(w)).sort((a, b) => b.uses - a.uses)
  // While typing, surface workflows that already do this job so people reuse instead of rebuilding.
  const matches = text.trim() ? rankByMatch(state.workflows, (w) => `${w.name} ${w.description}`, text).slice(0, 3) : []

  const startDraft = () => {
    const prompt = text.trim()
    if (!prompt) return
    // Mock AI: reuse the request planner and keep only its agent/skill steps.
    let refs = planRequest(prompt, state).steps.filter((s) => s.agentId || s.skillId).map(stepRef)
    if (!refs.length) refs = FALLBACK_AGENTS.map((ref) => ({ type: 'agent', ref }))
    setDraft({ prompt, name: truncate(prompt, 40), refs: refs.map((r) => ({ ...r, key: uid('ref') })) })
    setText('')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pt-2 lg:pt-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">อยากให้สายงานทำอะไรให้คุณ?</h1>
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
            <div className="rise mt-3 rounded-xl border border-slate-200 bg-white p-2">
              <p className="px-2 pt-1 pb-2 text-xs text-slate-500">มีสายงานที่ทำแบบนี้อยู่แล้ว — กดใช้งานได้เลย หรือกด <Sparkles className="inline size-3" /> เพื่อสร้างใหม่</p>
              {matches.map((w) => (
                <div key={w.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">{w.name}</div>
                    <div className="mt-1"><StepTrail steps={stepsOf(w)} /></div>
                  </div>
                  <Button size="sm" variant="primary" icon={Play} to={runLink(w)}>ใช้งาน</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {shared.length > 0 && <Suggestions items={shared} />}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">สายงานของฉัน</h2>
        {mine.length
          ? <WorkflowRows items={mine} />
          : <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">ยังไม่มี — พิมพ์ด้านบนเพื่อสร้าง กด “ใช้งาน” สายงานแนะนำ หรือกด “บันทึกไว้ใช้ซ้ำ” ใต้แชตที่ใช้ได้ผล</p>}
      </section>
    </div>
  )
}

/** Landing by default; `?id=` opens that workflow in the canvas editor. */
export default function Workflows() {
  const [params] = useSearchParams()
  return params.get('id') ? <WorkflowBuilder key={params.get('id')} /> : <Landing />
}
