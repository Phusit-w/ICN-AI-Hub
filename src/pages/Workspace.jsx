import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, ArrowUp, Bot, ChevronDown, ChevronsLeft, CircleCheck, CircleDashed, Copy, Download, History, LoaderCircle, MessageSquare,
  Play, Plus, Save, Share2, ShieldCheck, Sparkles, Trash2, Undo2, Workflow, X,
} from 'lucide-react'
import { useStore } from '../store/AppStore'
import { DEPARTMENTS, deptById } from '../data/catalog'
import { AttachButton, AttachmentList } from '../components/ui/Attachments'
import { ACTIVITIES } from '../lib/mockOutputs'
import { runProgress } from '../lib/runs'
import { clockTime, cn, timeAgo, uid } from '../lib/utils'
import { Card, CardHeader, ProgressBar } from '../components/ui/Card'
import Button from '../components/ui/Button'
import EntityIcon from '../components/agents/EntityIcon'
import Pipeline from '../components/workflow/Pipeline'
import ArtifactView from '../components/workflow/ArtifactView'
import logo from '../assets/icn-logo.png'

const MODE_KEY = 'icn.workspace.mode'
const readMode = () => { try { return localStorage.getItem(MODE_KEY) === 'workflow' ? 'workflow' : 'chat' } catch { return 'chat' } }
const writeMode = (m) => { try { localStorage.setItem(MODE_KEY, m) } catch { /* storage unavailable — mode resets on reload */ } }
const HISTORY_KEY = 'icn.workspace.historyCollapsed'
const readHistoryCollapsed = () => { try { return localStorage.getItem(HISTORY_KEY) === '1' } catch { return false } }
const writeHistoryCollapsed = (v) => { try { localStorage.setItem(HISTORY_KEY, v ? '1' : '0') } catch { /* storage unavailable — resets on reload */ } }

const SUGGESTIONS = [
  'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Siam Logistics',
  'ช่วยค้นข้อมูลตลาด EV Charger สรุปเป็นรายงาน และสร้างภาพประกอบ',
  'นโยบายวันลาพักร้อนสะสมได้กี่วัน',
  'VPN ต่อไม่ได้ตั้งแต่เช้า',
]

const isChatRun = (run) => run.steps.length === 1 && run.steps[0].kind === 'chat'

/** The deliverable to show first: the document if there is one, otherwise the last real output. */
function finalStep(run) {
  const outputs = run.steps.filter((s) => s.output)
  return outputs.find((s) => s.output.type === 'doc') ?? outputs.filter((s) => s.output.type !== 'checklist').at(-1) ?? outputs.at(-1)
}

function ModeToggle({ mode, onChange }) {
  const opts = [
    { value: 'chat', label: 'แชต', icon: MessageSquare },
    { value: 'workflow', label: 'Workflow', icon: Workflow },
  ]
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1" role="tablist" aria-label="รูปแบบการแสดงผล">
      {opts.map((o) => (
        <button
          key={o.value} type="button" role="tab" aria-selected={mode === o.value} onClick={() => onChange(o.value)}
          className={cn('flex items-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium transition', mode === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
        >
          <o.icon className="size-3.5" />{o.label}
        </button>
      ))}
    </div>
  )
}

function ThreadList({ threads, activeThread, onNew }) {
  const navigate = useNavigate()
  const [collapsed, setCollapsedState] = useState(readHistoryCollapsed)
  const setCollapsed = (v) => { setCollapsedState(v); writeHistoryCollapsed(v) }

  if (collapsed) {
    return (
      <aside data-tour="ws-threads" className="hidden shrink-0 flex-col items-center gap-1 lg:flex">
        <Button variant="ghost" size="icon" icon={History} onClick={() => setCollapsed(false)} aria-label="แสดงประวัติการสั่งงาน" title="แสดงประวัติการสั่งงาน" />
        <Button variant="ghost" size="icon" icon={Plus} onClick={onNew} aria-label="แชตใหม่" title="แชตใหม่" />
      </aside>
    )
  }
  return (
    <aside data-tour="ws-threads" className="hidden w-64 shrink-0 flex-col lg:flex">
      <Button icon={Plus} onClick={onNew} className="justify-center">แชตใหม่</Button>
      <div className="mt-5 mb-1.5 flex items-center justify-between pl-2">
        <p className="text-[11px] font-medium text-slate-400">ประวัติการสั่งงาน</p>
        <Button variant="ghost" size="icon" icon={ChevronsLeft} onClick={() => setCollapsed(true)} aria-label="ซ่อนประวัติการสั่งงาน" title="ซ่อนประวัติการสั่งงาน" className="!size-6 text-slate-400" />
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto">
        {threads.map((t) => (
          <li key={t.id}>
            <button
              type="button" onClick={() => navigate(`/workspace?run=${t.latest.id}`)}
              className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition', t.id === activeThread ? 'bg-slate-900/[0.06]' : 'hover:bg-slate-100')}
            >
              <span className={cn('size-1.5 shrink-0 rounded-full', { running: 'animate-pulse bg-brand-500', completed: 'bg-emerald-400', planned: 'bg-slate-300' }[t.latest.status])} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-slate-700">{t.title}</span>
                <span className="block text-[11px] text-slate-400">{timeAgo(t.latest.createdAt)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function Composer({ onSend, initialAgentId, mode }) {
  const { state } = useStore()
  const [text, setText] = useState('')
  const [agentId, setAgentId] = useState(initialAgentId ?? '')
  const [files, setFiles] = useState([])
  const ref = useRef(null)
  useEffect(() => { setAgentId(initialAgentId ?? '') }, [initialAgentId])
  useEffect(() => { ref.current?.focus() }, [])
  const agent = state.agents.find((a) => a.id === agentId)
  const send = () => {
    if (!text.trim()) return
    onSend(text.trim(), agentId || undefined, files)
    setText('')
    setFiles([])
  }
  return (
    <div className="mx-auto w-full max-w-3xl">
      <form data-tour="ws-composer" onSubmit={(e) => { e.preventDefault(); send() }} className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        <textarea
          ref={ref} value={text} onChange={(e) => setText(e.target.value)} rows={1} aria-label="ข้อความ"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="พิมพ์งานหรือคำถามที่ต้องการ…"
          className="block max-h-40 min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-[15px] placeholder:text-slate-400 focus:outline-none [field-sizing:content]"
        />
        <AttachmentList files={files} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
        <div className="flex items-center gap-1 px-1">
          <AttachButton onAdd={(added) => setFiles((fs) => [...fs, ...added])} />
          {/* Quiet pill over a native select: compact when automatic, highlighted once an agent is picked. */}
          <label className={cn(
            'relative flex h-8 min-w-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-300',
            agent ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-100',
          )}>
            <Bot className="size-3.5 shrink-0" aria-hidden />
            <span className="max-w-40 truncate">{agent ? agent.name : 'อัตโนมัติ'}</span>
            <ChevronDown className="size-3 shrink-0" aria-hidden />
            <select
              value={agentId} onChange={(e) => setAgentId(e.target.value)} aria-label="เลือกผู้ช่วย"
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              <option value="">อัตโนมัติ — ระบบเลือกให้ (แนะนำ)</option>
              {DEPARTMENTS.map((d) => {
                const list = state.agents.filter((a) => deptById(a.dept).id === d.id)
                return list.length > 0 && (
                  <optgroup key={d.id} label={d.th}>
                    {list.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </optgroup>
                )
              })}
            </select>
          </label>
          {agent && (
            <button type="button" onClick={() => setAgentId('')} aria-label="กลับไปเลือกผู้ช่วยอัตโนมัติ" title="กลับไปเลือกอัตโนมัติ" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="size-3.5" />
            </button>
          )}
          <button type="submit" disabled={!text.trim()} aria-label="ส่ง" className="ml-auto flex size-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400">
            <ArrowUp className="size-5" />
          </button>
        </div>
      </form>
      <p className="mt-1.5 text-center text-[11px] text-slate-400">
        {mode === 'workflow' ? 'โหมด Workflow: ระบบจะเสนอแผนให้ตรวจก่อนเริ่มทำงาน' : 'Enter เพื่อส่ง · Shift+Enter ขึ้นบรรทัดใหม่'} · ข้อมูลลับประมวลผลบน AI ภายในบริษัท
      </p>
    </div>
  )
}

function StepChips({ steps }) {
  const icon = { completed: CircleCheck, processing: LoaderCircle, returned: Undo2, waiting: CircleDashed }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => {
        const Icon = icon[s.status] ?? CircleDashed
        return (
          <Fragment key={s.id}>
            {i > 0 && <ArrowRight className="size-3 text-slate-300" aria-hidden />}
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
              { completed: 'border-emerald-200 bg-emerald-50 text-emerald-700', processing: 'border-brand-200 bg-brand-50 text-brand-700', returned: 'border-amber-200 bg-amber-50 text-amber-700' }[s.status] ?? 'border-slate-200 bg-white text-slate-500',
            )}>
              <Icon className={cn('size-3', s.status === 'processing' && 'animate-spin')} aria-hidden />{s.name.replace(' Agent', '')}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}

function AssistantMessage({ run, onShowWorkflow }) {
  const { actions } = useStore()
  const chat = isChatRun(run)
  const current = run.steps[run.current]
  const final = run.status === 'completed' ? finalStep(run) : null
  const loops = run.steps.reduce((n, s) => n + (s.kind === 'condition' || s.kind === 'review' ? s.loops : 0), 0)

  return (
    <div className="flex gap-3">
      <img src={logo} alt="" className="size-8 shrink-0 rounded-full ring-1 ring-slate-200" />
      <div className="min-w-0 flex-1 space-y-3 pt-1">
        {run.sensitive && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-700"><ShieldCheck className="size-3.5" /> พบข้อมูลลับ — ประมวลผลบน AI ภายในบริษัท ข้อมูลไม่ออกนอกองค์กร</p>
        )}

        {run.status === 'planned' && (
          <>
            <p className="text-[15px] text-slate-700">งานนี้จะให้ทีมผู้ช่วย AI ทำ {run.steps.length} ขั้นตอน ตามลำดับนี้:</p>
            <StepChips steps={run.steps} />
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" icon={Play} onClick={() => actions.startRun(run.id)}>เริ่มเลย</Button>
              <Button variant="ghost" icon={Workflow} onClick={onShowWorkflow}>ดูหรือแก้แผน</Button>
            </div>
          </>
        )}

        {run.status === 'running' && (chat ? (
          <span className="inline-flex gap-1 py-2" aria-label="กำลังพิมพ์">
            {[0, 150, 300].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: `${d}ms` }} />)}
          </span>
        ) : (
          <>
            <StepChips steps={run.steps} />
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <LoaderCircle className="size-4 shrink-0 animate-spin text-brand-500" />
              <span><b className="font-medium text-slate-800">{current?.name}</b> กำลังทำ: {current?.task}…</span>
            </p>
            <button type="button" onClick={onShowWorkflow} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
              ดูแอนิเมชันการทำงานของผู้ช่วยแต่ละตัว <ArrowRight className="size-3" />
            </button>
          </>
        ))}

        {run.status === 'completed' && (chat ? (
          <ArtifactView artifact={run.steps[0].output} />
        ) : (
          <>
            <p className="text-[15px] text-slate-700">
              เสร็จแล้ว — ผู้ช่วย {run.steps.length} ตัวช่วยกันทำ{loops > 0 && ` (ระหว่างทางตรวจพบข้อมูลไม่ครบ จึงส่งกลับไปแก้ ${loops} ครั้ง)`}
            </p>
            {final && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500"><EntityIcon icon={final.kind} size="sm" className="!size-5" />{final.output.title}</p>
                <ArtifactView artifact={final.output} />
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="ghost" icon={Download} onClick={() => actions.toast('ดาวน์โหลดไฟล์เรียบร้อย (จำลอง)')}>ดาวน์โหลด</Button>
              <Button size="sm" variant="ghost" icon={Copy} onClick={() => actions.toast('คัดลอกแล้ว')}>คัดลอก</Button>
              <Button size="sm" variant="ghost" icon={Share2} onClick={() => actions.toast('คัดลอกลิงก์สำหรับแชร์แล้ว')}>แชร์</Button>
              <Button size="sm" variant="ghost" icon={Workflow} onClick={onShowWorkflow}>ดูขั้นตอนการทำงาน</Button>
            </div>
          </>
        ))}
      </div>
    </div>
  )
}

function ChatView({ thread, onShowWorkflow, onSuggest }) {
  const bottom = useRef(null)
  const last = thread.at(-1)
  const progressKey = last ? `${last.id}:${last.status}:${last.current}` : ''
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [progressKey, thread.length])

  if (!thread.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Sparkles className="size-6" /></span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">วันนี้ให้ช่วยอะไรดี?</h1>
        <p className="mt-1 text-sm text-slate-500">ถามคำถาม หรือสั่งงานใหญ่ก็ได้ ระบบจะเลือกผู้ช่วย AI ที่เหมาะให้เอง</p>
        <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => onSuggest(s)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 transition hover:border-brand-300 hover:text-slate-900">{s}</button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-1 py-6">
      {thread.map((run) => (
        <div key={run.id} className="space-y-5">
          <div className="flex flex-col items-end gap-1.5">
            <AttachmentList files={run.attachments} className="flex max-w-[85%] flex-wrap justify-end gap-1.5" />
            <p className="max-w-[85%] rounded-2xl rounded-br-md bg-slate-100 px-4 py-2.5 text-[15px] text-slate-800">{run.prompt}</p>
          </div>
          <AssistantMessage run={run} onShowWorkflow={() => onShowWorkflow(run.id)} />
        </div>
      ))}
      <div ref={bottom} />
    </div>
  )
}

const GUIDE = ['สั่งงาน', 'ตรวจแผน', 'ผู้ช่วยกำลังทำงาน', 'รับผลงาน']

function StepGuide({ status }) {
  const at = { planned: 1, running: 2, completed: 4 }[status] ?? 0
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      {GUIDE.map((g, i) => (
        <Fragment key={g}>
          {i > 0 && <span className="h-px w-5 bg-slate-300" aria-hidden />}
          <li className={cn('flex items-center gap-1.5', i < at ? 'text-emerald-700' : i === at ? 'font-semibold text-brand-700' : 'text-slate-400')}>
            <span className={cn('flex size-5 items-center justify-center rounded-full text-[10px] font-semibold', i < at ? 'bg-emerald-500 text-white' : i === at ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500')}>
              {i < at ? '✓' : i + 1}
            </span>{g}
          </li>
        </Fragment>
      ))}
    </ol>
  )
}

function LiveActivity({ run }) {
  const step = run.steps[run.current]
  if (run.status !== 'running' || !step) return null
  const items = ACTIVITIES[step.kind] ?? ACTIVITIES.skill
  const done = Math.floor((step.elapsed / step.duration) * items.length)
  return (
    <div className="rounded-lg border border-brand-100 bg-brand-50/40 p-3.5">
      <div className="flex items-center gap-2.5">
        <EntityIcon icon={step.kind} size="sm" />
        <div className="min-w-0"><div className="text-sm font-medium text-slate-800">{step.name} กำลังทำงาน</div><div className="text-xs text-slate-500">{step.task}</div></div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((t, i) => (
          <li key={t} className={cn('flex items-center gap-2 text-[13px]', i < done ? 'text-slate-600' : i === done ? 'text-slate-800' : 'text-slate-400')}>
            {i < done ? <CircleCheck className="size-3.5 text-emerald-500" /> : i === done ? <LoaderCircle className="size-3.5 animate-spin text-brand-500" /> : <CircleDashed className="size-3.5" />}{t}
          </li>
        ))}
      </ul>
    </div>
  )
}

const EVENT_DOT = { info: 'bg-brand-400', success: 'bg-emerald-400', warning: 'bg-amber-400' }

function WorkflowView({ run }) {
  const { actions } = useStore()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  if (!run) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <Card className="p-8">
          <h2 className="text-lg font-semibold text-slate-900">โหมด Workflow คืออะไร</h2>
          <p className="mt-1 text-sm text-slate-500">ดูเบื้องหลังว่าผู้ช่วย AI แต่ละตัวทำอะไร ส่งงานต่อให้ใคร และตรวจงานกันอย่างไร — แบบเรียลไทม์</p>
          <div className="mt-5"><StepGuide status="none" /></div>
          <p className="mt-5 text-sm text-slate-600">พิมพ์งานที่ช่องด้านล่าง ระบบจะเสนอแผนให้ตรวจก่อนเริ่ม</p>
        </Card>
      </div>
    )
  }

  const outputs = run.steps.filter((s) => s.output)
  const final = run.status === 'completed' ? finalStep(run) : null
  const shown = outputs.find((s) => s.id === selected) ?? final ?? outputs.at(-1)

  const saveAsWorkflow = () => {
    const work = run.steps.map((s, i) => ({ id: `n${i + 2}`, type: s.agentId ? 'agent' : s.skillId ? 'skill' : 'condition', ref: s.agentId ?? s.skillId, label: s.name, x: 290 + i * 250, y: 60 }))
    const nodes = [{ id: 'n1', type: 'trigger', label: 'ผู้ใช้ส่งคำขอ', x: 40, y: 60 }, ...work, { id: 'n-out', type: 'output', label: 'ส่งผลลัพธ์', x: 290 + work.length * 250, y: 60 }]
    const edges = nodes.slice(1).map((n, i) => ({ id: uid('e'), from: nodes[i].id, to: n.id }))
    const wf = { id: uid('wf'), name: `สายงาน: ${run.title.slice(0, 40)}`, dept: 'sales', owner: run.owner, uses: 0, rating: 0, version: '0.1', description: run.prompt, nodes, edges }
    actions.saveWorkflow(wf)
    actions.toast('บันทึกเป็นสายงานแล้ว — ปรับแต่งต่อได้ในหน้าสร้างสายงาน')
    navigate(`/workflows?id=${wf.id}`)
  }

  return (
    <div className="space-y-5 py-2">
      <Card className="p-5">
        <StepGuide status={run.status} />
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-slate-900">{run.title}</h1>
            <p className="mt-0.5 text-xs text-slate-500">{timeAgo(run.createdAt)} · {run.reason}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {run.status === 'planned' && (
              <>
                <Button variant="ghost" icon={Trash2} onClick={() => { actions.discardRun(run.id); navigate('/workspace') }}>ยกเลิก</Button>
                <Button variant="primary" icon={Play} onClick={() => actions.startRun(run.id)} disabled={!run.steps.length}>เริ่มทำงาน</Button>
              </>
            )}
            {run.status === 'completed' && !run.workflowId && !isChatRun(run) && <Button icon={Save} onClick={saveAsWorkflow}>บันทึกเป็นสายงาน</Button>}
          </div>
        </div>
        {run.status === 'planned' && <p className="mt-3 rounded-lg bg-slate-50 px-3.5 py-2.5 text-[13px] text-slate-600">ตรวจแผนด้านล่างก่อนเริ่ม — กด × เพื่อเอาขั้นตอนที่ไม่ต้องการออก</p>}
        {run.status === 'running' && (
          <div className="mt-4 flex items-center gap-3"><ProgressBar value={runProgress(run)} className="flex-1" /><span className="text-xs font-medium text-slate-500">{Math.round(runProgress(run) * 100)}%</span></div>
        )}
        <div className="mt-5">
          <Pipeline steps={run.steps} onRemove={run.status === 'planned' && run.steps.length > 1 ? (id) => actions.removeStep(run.id, id) : undefined} selectedId={shown?.id} onSelect={setSelected} />
        </div>
      </Card>

      {run.status !== 'planned' && (
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader title="ใครทำอะไรอยู่" subtitle="การส่งต่องานระหว่างผู้ช่วย" />
            <div className="space-y-4 px-5 pb-5">
              <LiveActivity run={run} />
              <ol className="relative space-y-3 border-l border-slate-200 pl-4">
                {[...run.events].reverse().map((e, i) => (
                  <li key={i} className="relative">
                    <span className={cn('absolute top-1.5 -left-[21px] size-2 rounded-full ring-4 ring-white', EVENT_DOT[e.tone])} />
                    <p className="text-[13px] leading-snug text-slate-700">{e.text}</p>
                    <p className="text-[11px] text-slate-400">{clockTime(e.at)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader title={final && shown?.id === final.id ? 'ผลงานสุดท้าย' : 'ผลงานแต่ละขั้น'} subtitle={outputs.length ? 'คลิกที่ผู้ช่วยด้านบนเพื่อดูผลงานของขั้นนั้น' : 'ผลงานจะแสดงที่นี่เมื่อผู้ช่วยทำเสร็จ'} />
            <div className="px-5 pb-5">
              {shown ? <div className="rise" key={shown.id}><ArtifactView artifact={shown.output} /></div> : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400"><LoaderCircle className="mr-2 size-4 animate-spin" /> กำลังเตรียมผลงานชิ้นแรก…</div>
              )}
              {run.status === 'completed' && (
                <div className="mt-4 flex gap-2"><Button variant="primary" icon={Download} onClick={() => actions.toast('ดาวน์โหลดไฟล์เรียบร้อย (จำลอง)')}>ดาวน์โหลด</Button><Button icon={Share2} onClick={() => actions.toast('คัดลอกลิงก์สำหรับแชร์แล้ว')}>แชร์</Button></div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function Workspace() {
  const { state, actions } = useStore()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [mode, setModeState] = useState(readMode)
  const setMode = (m) => { setModeState(m); writeMode(m) }
  const handled = useRef(null)
  const q = params.get('q')

  const run = state.runs.find((r) => r.id === params.get('run')) ?? null
  const thread = useMemo(() => (run ? state.runs.filter((r) => r.threadId === run.threadId).sort((a, b) => a.createdAt - b.createdAt) : []), [state.runs, run])
  const threads = useMemo(() => {
    const byId = new Map()
    ;[...state.runs].sort((a, b) => a.createdAt - b.createdAt).forEach((r) => {
      const t = byId.get(r.threadId) ?? { id: r.threadId, title: r.title }
      byId.set(r.threadId, { ...t, latest: r })
    })
    return [...byId.values()].sort((a, b) => b.latest.createdAt - a.latest.createdAt)
  }, [state.runs])

  // Chat answers straight away; Workflow mode stops at the plan so the user can review it.
  const send = (prompt, agentId, threadId, attachments) => {
    const id = actions.planRun(prompt, agentId ? { agentId } : {}, state, { threadId, autoStart: mode === 'chat', attachments })
    setParams({ run: id })
  }

  useEffect(() => {
    if (!q || handled.current === q) return
    handled.current = q
    send(q, undefined, undefined, location.state?.attachments) // files attached on the home page
  }) // runs after each render but acts only once per incoming prompt

  return (
    <div className="flex h-[calc(100dvh-7rem)] gap-6 lg:h-[calc(100dvh-8rem)]">
      <ThreadList threads={threads} activeThread={run?.threadId} onNew={() => setParams({})} />
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 pb-3">
          <Button size="sm" icon={Plus} onClick={() => setParams({})} className="lg:hidden">แชตใหม่</Button>
          <p className="hidden min-w-0 truncate text-sm font-medium text-slate-700 sm:block">{run ? thread[0]?.title : 'แชตใหม่'}</p>
          <div className="ml-auto" data-tour="ws-mode"><ModeToggle mode={mode} onChange={setMode} /></div>
        </div>
        <div key={mode} className="min-h-0 flex-1 overflow-y-auto">
          {mode === 'chat'
            ? <ChatView thread={thread} onSuggest={(s) => send(s)} onShowWorkflow={(id) => { setMode('workflow'); setParams({ run: id }) }} />
            : <WorkflowView run={run} />}
        </div>
        <div className="pt-3">
          <Composer mode={mode} initialAgentId={params.get('agent')} onSend={(p, agentId, files) => send(p, agentId, run?.threadId, files)} />
        </div>
      </section>
    </div>
  )
}
