// PROTOTYPE — throwaway. Three landing layouts for /workflows?variant=A|B|C (no ?id).
// Behaviour fixed by the grilling session (Q4, Q10, Q14, Q15): plain-language prompt first,
// shared "สายงานแนะนำ" + "สายงานของฉัน", one-click "ใช้งาน". Opening a workflow (?id=) still shows the builder.
// Stubs: submitting a prompt only toasts — the AI-drafted step list (Q11) is not part of this prototype.
import { Fragment, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowUp, ChevronRight, Pencil, Play, Plus, Sparkles, Star } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { deptById, userById } from '../data/catalog'
import { cn, fmtCompact } from '../lib/utils'
import Button from '../components/ui/Button'
import { DeptBadge, Rating } from '../components/ui/Badge'
import EntityIcon from '../components/agents/EntityIcon'
import PrototypeSwitcher, { useVariant } from '../components/ui/PrototypeSwitcher'
import { useTypewriter } from './Home'
import WorkflowBuilder from './WorkflowBuilder'

const EXAMPLES = [
  'รับ requirement ลูกค้า → ร่าง proposal → ให้ Review Agent ตรวจก่อนส่ง',
  'ทุกสิ้นเดือน ดึงยอดขาย สรุปเป็นรายงาน แล้วส่งให้หัวหน้า',
  'พนักงานใหม่เข้ามา → ทำแผน onboarding และอีเมลต้อนรับ',
]
const NEEDS = ['ทำ Proposal', 'ปิดงบรายเดือน', 'รับพนักงานใหม่', 'แก้ปัญหา IT']

function useWorkflows() {
  const { state, actions } = useStore()
  const usedIds = new Set(state.runs.map((r) => r.workflowId).filter(Boolean))
  const mine = state.workflows.filter((w) => w.owner === state.userId || usedIds.has(w.id))
  const shared = state.workflows.filter((w) => !mine.includes(w)).sort((a, b) => b.uses - a.uses)
  const steps = (w) => w.nodes.filter((n) => n.type === 'agent' || n.type === 'skill').map((n) => {
    const a = n.type === 'agent' ? state.agents.find((x) => x.id === n.ref) : state.skills.find((x) => x.id === n.ref)
    return { id: n.id, name: a?.name?.replace(' Agent', '') ?? '?', icon: n.type === 'agent' ? a?.kind : a?.icon, tone: n.type === 'agent' ? 'agent' : 'skill' }
  })
  const draft = (text) => actions.toast(`(prototype) AI จะร่างสายงานจาก: “${text}”`)
  return { mine, shared, all: state.workflows, steps, draft }
}

const runLink = (w) => `/workspace?workflow=${w.id}`

function PromptBox({ onSubmit, big }) {
  const [text, setText] = useState('')
  const typed = useTypewriter(EXAMPLES, !text)
  const submit = () => text.trim() && (onSubmit(text.trim()), setText(''))
  return (
    <form onSubmit={(e) => { e.preventDefault(); submit() }} className={cn('relative flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100', big && 'p-3')}>
      <div className="relative flex-1">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={big ? 2 : 1} aria-label="อยากให้สายงานทำอะไร"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          className="block w-full resize-none bg-transparent px-2 py-1.5 text-[15px] focus:outline-none" />
        {!text && <p aria-hidden className="pointer-events-none absolute inset-0 truncate px-2 py-1.5 text-[15px] text-slate-400">เช่น {typed}</p>}
      </div>
      <button type="submit" disabled={!text.trim()} aria-label="ให้ AI ร่างสายงาน" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400"><ArrowUp className="size-5" /></button>
    </form>
  )
}

function StepTrail({ steps, max = 5 }) {
  const shown = steps.slice(0, max)
  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && <ChevronRight className="size-3 text-slate-300" aria-hidden />}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pr-2 pl-0.5 text-[11px] text-slate-600"><EntityIcon icon={s.icon} tone={s.tone} size="sm" className="!size-5 !rounded-full" />{s.name}</span>
        </Fragment>
      ))}
      {steps.length > max && <span className="text-[11px] text-slate-400">+{steps.length - max}</span>}
    </div>
  )
}

/* ───────────── A: prompt-first — big box, two plain lists ───────────── */
function WorkflowList({ title, items, steps, empty }) {
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

function VariantA() {
  const { mine, shared, steps, draft } = useWorkflows()
  return (
    <div className="mx-auto max-w-3xl space-y-8 pt-4 lg:pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">อยากให้สายงานอัตโนมัติทำอะไร?</h1>
        <p className="mt-1 text-sm text-slate-500">เล่าขั้นตอนเป็นภาษาปกติ AI จะจัดผู้ช่วยให้ทำต่อกันเป็นสาย</p>
      </div>
      <PromptBox big onSubmit={draft} />
      <WorkflowList title="สายงานของฉัน" items={mine} steps={steps} empty="ยังไม่มี — บันทึกจากแชตที่ใช้ได้ผล หรือพิมพ์ด้านบนเพื่อสร้าง" />
      <WorkflowList title="สายงานแนะนำจากเพื่อนร่วมงาน" items={shared} steps={steps} />
    </div>
  )
}

/* ───────────── B: gallery — visual cards, "create" is the first tile ───────────── */
function VariantB() {
  const { mine, shared, steps, draft } = useWorkflows()
  const [creating, setCreating] = useState(false)
  const Card = ({ w }) => (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div><h3 className="font-semibold text-slate-900">{w.name}</h3><p className="mt-0.5 text-xs text-slate-400">โดย {userById(w.owner).name} · ใช้ {fmtCompact(w.uses)} ครั้ง</p></div>
        <DeptBadge dept={w.dept} />
      </div>
      <p className="mt-3 line-clamp-2 text-[13px] text-slate-600">{w.description}</p>
      {/* the chain itself is the visual */}
      <div className="mt-4 flex items-center rounded-xl bg-gradient-to-r from-slate-50 to-brand-50/60 px-3 py-4">
        {steps(w).slice(0, 5).map((s, i) => (
          <Fragment key={s.id}>
            {i > 0 && <span className="h-0.5 flex-1 bg-brand-200" aria-hidden />}
            <EntityIcon icon={s.icon} tone={s.tone} className="!rounded-full shadow-sm" />
          </Fragment>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="primary" icon={Play} to={runLink(w)} className="flex-1 justify-center">ใช้งาน</Button>
        <Button icon={Pencil} to={`/workflows?id=${w.id}`}>แก้</Button>
      </div>
    </div>
  )
  return (
    <div className="space-y-10">
      <div><h1 className="text-3xl font-semibold tracking-tight text-slate-900">สายงานอัตโนมัติ</h1><p className="mt-1 text-slate-500">ให้ผู้ช่วยหลายตัวทำงานต่อกันจนเสร็จ — เลือกใช้ หรือสร้างใหม่</p></div>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">ของฉัน</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className={cn('flex flex-col justify-center rounded-2xl border-2 border-dashed p-5', creating ? 'border-brand-300 bg-brand-50/40' : 'border-slate-200')}>
            {creating ? (
              <>
                <p className="mb-2 text-sm font-medium text-slate-700">อยากให้สายงานทำอะไร?</p>
                <PromptBox onSubmit={(t) => { draft(t); setCreating(false) }} />
              </>
            ) : (
              <button type="button" onClick={() => setCreating(true)} className="flex flex-col items-center gap-2 py-6 text-slate-500 hover:text-brand-700">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Plus className="size-6" /></span>
                <span className="text-sm font-medium">สร้างสายงานใหม่</span><span className="text-xs text-slate-400">พิมพ์บอก AI แล้วมันจัดให้</span>
              </button>
            )}
          </div>
          {mine.map((w) => <Card key={w.id} w={w} />)}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">สายงานแนะนำ</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shared.map((w) => <Card key={w.id} w={w} />)}</div>
      </section>
    </div>
  )
}

/* ───────────── C: recommender — ask the job, suggest the best match or offer to build one ───────────── */
function VariantC() {
  const { all, mine, steps, draft } = useWorkflows()
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const words = term.split(/\s+/).filter((w) => w.length > 1)
  const ranked = term
    ? all.map((w) => ({ w, s: words.filter((x) => `${w.name} ${w.description}`.toLowerCase().includes(x)).length })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.w)
    : [...mine, ...all.filter((w) => !mine.includes(w)).sort((a, b) => b.uses - a.uses)]
  const top = ranked.slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl pt-4 lg:pt-8">
      <div className="text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Sparkles className="size-6" /></span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">งานไหนที่คุณทำซ้ำบ่อย ๆ?</h1>
        <p className="mt-1 text-sm text-slate-500">บอกมา เราจะหาสายงานที่มีอยู่แล้ว หรือสร้างใหม่ให้</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="เช่น ทำ proposal ให้ลูกค้า" aria-label="งานที่ทำซ้ำบ่อย"
          className="mx-auto mt-5 block h-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-5 text-[15px] shadow-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none" />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {NEEDS.map((n) => <button key={n} type="button" onClick={() => setQ(n)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[13px] text-slate-600 hover:border-brand-300">{n}</button>)}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-sm font-medium text-slate-500">{term ? 'สายงานที่ตรงกับงานนี้' : 'ใช้บ่อย / แนะนำสำหรับคุณ'}</p>
        {top.map((w, i) => (
          <div key={w.id} className={cn('flex flex-col gap-3 rounded-2xl border bg-white p-5 sm:flex-row sm:items-center', i === 0 ? 'border-brand-300 shadow-md ring-4 ring-brand-50' : 'border-slate-200')}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {i === 0 && <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white"><Star className="size-3 fill-white" /> แนะนำ</span>}
                <h3 className="font-semibold text-slate-900">{w.name}</h3>
                {mine.includes(w) && <span className="text-[11px] text-emerald-600">● ของคุณ</span>}
              </div>
              <p className="mt-1 text-[13px] text-slate-500">{w.description}</p>
              <div className="mt-2.5"><StepTrail steps={steps(w)} /></div>
            </div>
            <div className="flex shrink-0 gap-2 sm:flex-col">
              <Button variant="primary" icon={Play} to={runLink(w)} className="justify-center">ใช้งาน</Button>
              <Button size="sm" variant="ghost" to={`/workflows?id=${w.id}`}>ดู / แก้</Button>
            </div>
          </div>
        ))}
        {term && (
          <button type="button" onClick={() => draft(q.trim())} className="flex w-full items-center justify-between rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 px-5 py-4 text-left hover:bg-brand-50">
            <span><span className="block text-sm font-medium text-brand-800">{top.length ? 'ไม่ตรงใจ?' : 'ยังไม่มีสายงานนี้'} ให้ AI สร้างสายงานจาก “{q.trim()}”</span><span className="text-xs text-slate-500">AI ร่างขั้นตอนให้ คุณแค่ตรวจแล้วกดบันทึก</span></span>
            <ArrowRight className="size-5 text-brand-600" />
          </button>
        )}
      </div>
    </div>
  )
}

const VARIANTS = { A: 'แนวพิมพ์สั่งเป็นหลัก', B: 'แนวแกลเลอรี', C: 'แนวผู้ช่วยแนะนำ' }

export default function WorkflowsPrototype() {
  const [params] = useSearchParams()
  const v = useVariant(Object.keys(VARIANTS))
  if (params.get('id')) return <WorkflowBuilder />
  return (
    <>
      {v === 'A' && <VariantA />}
      {v === 'B' && <VariantB />}
      {v === 'C' && <VariantC />}
      <PrototypeSwitcher variants={VARIANTS} />
    </>
  )
}
