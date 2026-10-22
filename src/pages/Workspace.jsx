import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, ArrowUp, CircleCheck, CircleDashed, Copy, Download, Eye, ListChecks, LoaderCircle,
  Plus, Share2, ShieldCheck, Undo2, X,
} from 'lucide-react'
import { useStore } from '../store/AppStore'
import { AttachButton, AttachmentList } from '../components/ui/Attachments'
import MicButton from '../components/ui/MicButton'
import TypewriterHint from '../components/ui/TypewriterHint'
import { ACTIVITIES } from '../lib/mockOutputs'
import { isChatRun, runProgress, runsOfThread } from '../lib/runs'
import { clockTime, cn } from '../lib/utils'
import { ProgressBar } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Menu from '../components/ui/Menu'
import EntityIcon from '../components/agents/EntityIcon'
import Pipeline from '../components/run/Pipeline'
import ArtifactView from '../components/run/ArtifactView'
import SaveForReuse from '../components/run/SaveForReuse'
import Feedback from '../components/run/Feedback'
import ComposerPick, { pickFromParams, usePick } from '../components/run/ComposerPick'
import { userById } from '../data/catalog'
import PlanCard from './workspace-prototype/PlanCard'
import { useCube, useVariant } from './workspace-prototype/PrototypeSwitcher'
import AgentCube from '../components/agents/AgentCube'
import { artifactMeta } from './workspace-prototype/artifactMeta'
import logo from '../assets/icn-logo.png'

// Variant B types these out over the empty new-chat composer, so a newcomer sees what to ask. A module constant: the hint restarts if it changes.
const HINTS = [
  'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า',
  'สรุปรายงานตลาด Solar Rooftop พร้อมภาพประกอบ',
  'วิเคราะห์ยอดขาย Q3 จากไฟล์ Excel',
  'นโยบายวันลาพักร้อนสะสมได้กี่วัน',
]

/** The deliverable to show first: the document if there is one, otherwise the last real output. */
function finalStep(run) {
  const outputs = run.steps.filter((s) => s.output)
  return outputs.find((s) => s.output.type === 'doc') ?? outputs.filter((s) => s.output.type !== 'checklist').at(-1) ?? outputs.at(-1)
}

function Composer({ onSend, pick, onPickChange, large, typing, ...props }) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  const send = () => {
    if (!text.trim()) return
    onSend(text.trim(), pick, files)
    setText('')
    setFiles([])
  }
  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Capsule (spec .scratch/agents-only-redesign stories 44–48): ＋ attach · text · Agent · microphone · send. The radius keeps one line fully round. */}
      <form {...props} onSubmit={(e) => { e.preventDefault(); send() }} className={cn('rounded-[28px] border border-slate-300 bg-white p-2 text-left shadow-xs focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100', large && 'p-3 shadow-md')}>
        <AttachmentList files={files} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
        <div className={cn('flex gap-1', large ? 'items-center' : 'items-end')}>
          <AttachButton onAdd={(added) => setFiles((fs) => [...fs, ...added])} />
          <div className="relative flex min-w-0 flex-1">
          <textarea
            ref={ref} value={text} onChange={(e) => setText(e.target.value)} rows={1} aria-label="ข้อความ"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={typing ? '' : 'พิมพ์งานหรือคำถามที่ต้องการ…'}
            className={cn('block max-h-40 min-h-10 min-w-0 flex-1 resize-none self-center bg-transparent px-1 py-2 text-[15px] placeholder:text-slate-400 focus:outline-none [field-sizing:content]', large && 'min-h-14 pt-4 pb-3 text-lg!')}
          />
          {typing && !text && <TypewriterHint phrases={HINTS} className="px-1 pt-4 pb-3 text-lg leading-7" />}
          </div>
          <span className={cn('flex shrink-0 items-center gap-1 py-1', !large && 'self-end')}><ComposerPick pick={pick} onChange={onPickChange} chooseAgent menuDir={large ? 'down' : undefined} /></span>
          <MicButton onText={(said) => setText((t) => (t.trim() ? `${t.trimEnd()} ${said}` : said))} />
          <button type="submit" disabled={!text.trim()} aria-label="ส่ง" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400">
            <ArrowUp className="size-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

/** One chip per step. With `onRemove` (a Plan not started yet) each chip gets a × to take that step out. */
function StepChips({ steps, onRemove }) {
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
              {onRemove && (
                <button type="button" onClick={() => onRemove(s.id)} aria-label={`ลบ ${s.name} ออกจากแผน`} title="เอาขั้นตอนนี้ออก" className="-mr-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500">
                  <X className="size-3" />
                </button>
              )}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}

/**
 * Under a finished Artifact, for chat and multi-Agent Runs alike: "ดาวน์โหลด" first, "บันทึกไว้ใช้ซ้ำ" beside it,
 * the rest in "⋯", then 👍/👎 Feedback. Only the latest Run's download is brand-coloured, so the page keeps one primary button.
 */
function ArtifactActions({ run, latest, onShowSteps }) {
  const { actions } = useStore()
  return (
    <div role="group" aria-label="การทำงานกับผลงาน" className="flex flex-wrap items-center gap-1.5">
      <Button size="sm" variant={latest ? 'primary' : 'secondary'} icon={Download} onClick={() => actions.toast('ดาวน์โหลดไฟล์เรียบร้อย (จำลอง)')}>ดาวน์โหลด</Button>
      <SaveForReuse run={run} />
      <Menu items={[
        { label: 'คัดลอก', icon: Copy, onSelect: () => actions.toast('คัดลอกแล้ว') },
        { label: 'แชร์', icon: Share2, onSelect: () => actions.toast('คัดลอกลิงก์สำหรับแชร์แล้ว') },
        ...(onShowSteps ? [{ label: 'ดูขั้นตอน', icon: ListChecks, onSelect: onShowSteps }] : []),
      ]} />
      <Feedback run={run} />
    </div>
  )
}

/** Icon, name and "type · count" of a finished output. */
function ArtifactHeader({ output }) {
  const m = artifactMeta(output)
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3.5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><m.Icon className="size-6" aria-hidden /></span>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-slate-900">{output.title}</p>
        <p className="text-xs text-slate-500">{m.label}{m.count && ` · ${m.count}`}</p>
      </div>
    </div>
  )
}

/**
 * Variant A: a summary card in the Thread. "เปิดผลงาน" is its one primary action; once the preview is open
 * the primary action becomes "ดาวน์โหลด" (inside ArtifactActions), so the two never compete.
 */
function ArtifactCard({ run, final, latest, onShowSteps }) {
  const [open, setOpen] = useState(false)
  const { actions } = useStore()
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-3 p-4">
        <ArtifactHeader output={final.output} />
        {!open && (
          <span className="flex shrink-0 items-center gap-1">
            <Button variant={latest ? 'primary' : 'secondary'} icon={Eye} onClick={() => setOpen(true)}>เปิดผลงาน</Button>
            <Menu items={[
              { label: 'ดาวน์โหลด', icon: Download, onSelect: () => actions.toast('ดาวน์โหลดไฟล์เรียบร้อย (จำลอง)') },
              { label: 'แชร์', icon: Share2, onSelect: () => actions.toast('คัดลอกลิงก์สำหรับแชร์แล้ว') },
              { label: 'ดูขั้นตอน', icon: ListChecks, onSelect: onShowSteps },
            ]} />
          </span>
        )}
      </div>
      {open && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          <ArtifactView artifact={final.output} />
          <ArtifactActions run={run} latest={latest} onShowSteps={onShowSteps} />
        </div>
      )}
    </div>
  )
}

function SensitiveNote() {
  return <p className="flex items-center gap-1.5 text-xs text-emerald-700"><ShieldCheck className="size-3.5" /> พบข้อมูล — ประมวลผลบน AI ภายในบริษัท ข้อมูลไม่ออกนอกองค์กร</p>
}

function Typing() {
  return (
    <span className="inline-flex gap-1 py-2" aria-label="กำลังพิมพ์">
      {[0, 150, 300].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: `${d}ms` }} />)}
    </span>
  )
}

/** Variant A: the whole Run in the Thread: Plan card, then progress in the same card, then the result card. */
function AssistantMessage({ run, latest, onShowSteps }) {
  const { actions } = useStore()
  const chat = isChatRun(run)
  const final = run.status === 'completed' ? finalStep(run) : null
  const loops = run.steps.reduce((n, s) => n + (s.kind === 'review' ? s.loops : 0), 0)

  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1 space-y-3 pt-1">
        {run.sensitive && <SensitiveNote />}

        {chat && run.status === 'running' && <Typing />}
        {chat && run.status === 'completed' && (
          <>
            <ArtifactView artifact={run.steps[0].output} />
            <ArtifactActions run={run} latest={latest} onShowSteps={onShowSteps} />
          </>
        )}

        {!chat && run.status !== 'completed' && (
          <PlanCard collapsible run={run} onRemove={(stepId) => actions.removeStep(run.id, stepId)} onStart={() => actions.startRun(run.id)} onShowSteps={onShowSteps} />
        )}
        {!chat && run.status === 'completed' && (
          <>
            <p className="text-[15px] text-slate-700">
              เสร็จแล้ว — ผู้ช่วย {run.steps.length} ตัวช่วยกันทำ{loops > 0 && ` (ระหว่างทางตรวจพบข้อมูลไม่ครบ จึงส่งกลับไปแก้ ${loops} ครั้ง)`}
            </p>
            {final && <ArtifactCard run={run} final={final} latest={latest} onShowSteps={onShowSteps} />}
          </>
        )}
      </div>
    </div>
  )
}

/** Variant B: the Thread only talks; the Plan, progress and result live in the work area (Desk) beside it. */
function DeskNote({ run, selected, onOpen }) {
  const { state } = useStore()
  const [cubeOn] = useCube()
  const chat = isChatRun(run)
  // the Agent speaking: the one the Run was started with, else the step now under way (a plain chat has none)
  const step = run.steps[Math.min(run.current, run.steps.length - 1)]
  const agent = state.agents.find((a) => a.id === (run.agentId ?? step?.agentId)) ?? { id: 'icn-assistant', kind: step?.kind }
  const final = run.status === 'completed' ? finalStep(run) : null
  return (
    <div className="flex gap-3">
      {cubeOn
        ? <span className="shrink-0"><AgentCube agent={agent} size={32} calm thinking={run.status === 'running'} /></span>
        : <img src={logo} alt="" className="size-8 shrink-0 rounded-full ring-1 ring-slate-200" />}
      <div className="min-w-0 flex-1 space-y-2.5 pt-1">
        {run.sensitive && <SensitiveNote />}
        {chat ? (
          run.status === 'completed' ? <ArtifactView artifact={run.steps[0].output} /> : <Typing />
        ) : (
          <>
            <p className="text-[15px] text-slate-700">
              {run.status === 'planned' && `ผมวางแผนไว้ ${run.steps.length} ขั้นตอน ดูแผนที่พื้นที่ทำงาน แล้วกด “เริ่มทำงาน” ได้เลย`}
              {run.status === 'running' && `กำลังทำงาน · ขั้นตอน ${Math.min(run.current + 1, run.steps.length)} จาก ${run.steps.length}`}
              {run.status === 'completed' && `เสร็จแล้ว — “${final?.output.title ?? 'ผลงาน'}” อยู่ที่พื้นที่ทำงาน`}
            </p>
            {!selected && <Button size="sm" variant="secondary" icon={Eye} onClick={onOpen}>{run.status === 'completed' ? 'เปิดดูผลงาน' : 'ดูแผนงาน'}</Button>}
          </>
        )}
      </div>
    </div>
  )
}

/** Variant B's work area: the strongest object on the page, whichever stage the Run is at. */
function Desk({ run }) {
  const { actions } = useStore()
  const final = run.status === 'completed' ? finalStep(run) : null
  const loops = run.steps.reduce((n, s) => n + (s.kind === 'review' ? s.loops : 0), 0)
  return (
    <section aria-label="พื้นที่ทำงาน" className="rise min-h-0 min-w-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:p-7">
      <header className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{run.title ?? run.prompt}</h2>
        <StepGuide status={run.status} />
      </header>
      <div className="mt-6 space-y-6">
        {run.status !== 'completed' && (
          <PlanCard bare run={run} onRemove={(stepId) => actions.removeStep(run.id, stepId)} onStart={() => actions.startRun(run.id)} />
        )}
        {run.status === 'running' && (
          <>
            <div className="flex items-center gap-3"><ProgressBar value={runProgress(run)} className="flex-1" /><span className="text-xs font-medium text-slate-500">{Math.round(runProgress(run) * 100)}%</span></div>
            <LiveActivity run={run} />
          </>
        )}
        {final && (
          <>
            <div className="flex items-center gap-3"><ArtifactHeader output={final.output} /></div>
            <ArtifactView artifact={final.output} />
            <ArtifactActions run={run} latest />
            <details className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
              <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-700">
                <ListChecks className="size-4 text-slate-500" aria-hidden />ดูขั้นตอนที่ทำ{loops > 0 && ` · ส่งกลับไปแก้ ${loops} ครั้ง`}
              </summary>
              <div className="mt-3"><PlanCard bare run={run} /></div>
            </details>
          </>
        )}
      </div>
    </section>
  )
}

function ChatView({ thread, onShowSteps, variant, deskRunId, onOpenDesk }) {
  const bottom = useRef(null)
  const last = thread.at(-1)
  const progressKey = last ? `${last.id}:${last.status}:${last.current}` : ''
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [progressKey, thread.length])

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-1 py-6">
      {thread.map((run) => (
        <div key={run.id} className="space-y-5">
          <div className="flex flex-col items-end gap-1.5">
            <AttachmentList files={run.attachments} className="flex max-w-[85%] flex-wrap justify-end gap-1.5" />
            <p className="max-w-[85%] rounded-2xl rounded-br-md bg-slate-100 px-4 py-2.5 text-[15px] text-slate-800">{run.prompt}</p>
          </div>
          {variant === 'B'
            ? <DeskNote run={run} selected={run.id === deskRunId} onOpen={() => onOpenDesk(run.id)} />
            : <AssistantMessage run={run} latest={run === last} onShowSteps={() => onShowSteps(run.id)} />}
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

/**
 * The step view, beside the Thread: which Agent did what and how work was handed on.
 * Starting or editing the Plan stays in the Thread, so this panel only shows. Full screen on a phone.
 */
function StepsPanel({ run, onClose }) {
  const [selected, setSelected] = useState(null)
  const shown = run.steps.find((s) => s.id === selected && s.output)

  return (
    <aside
      aria-label="ขั้นตอนการทำงาน"
      className="fixed inset-0 z-40 overflow-y-auto bg-white p-4 lg:static lg:z-auto lg:w-96 lg:shrink-0 lg:border-l lg:border-slate-200 lg:bg-transparent lg:p-0 lg:pl-6"
    >
      <div className="flex items-center justify-between gap-2 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">ขั้นตอนการทำงาน</h2>
        <Button variant="ghost" size="icon" icon={X} onClick={onClose} aria-label="ปิดขั้นตอน" title="ปิดขั้นตอน" />
      </div>
      <div className="space-y-6 pb-4">
        <div className="space-y-3">
          <StepGuide status={run.status} />
          <p className="text-xs text-slate-500">{run.reason}</p>
          {run.status === 'running' && (
            <div className="flex items-center gap-3"><ProgressBar value={runProgress(run)} className="flex-1" /><span className="text-xs font-medium text-slate-500">{Math.round(runProgress(run) * 100)}%</span></div>
          )}
        </div>
        <Pipeline vertical steps={run.steps} selectedId={shown?.id} onSelect={setSelected} />
        {shown && (
          <section key={shown.id} className="rise">
            <h3 className="mb-2 text-xs font-medium text-slate-500">ผลงานของ {shown.name}</h3>
            <ArtifactView artifact={shown.output} />
          </section>
        )}
        <LiveActivity run={run} />
        {run.events.length > 0 && (
          <section>
            <h3 className="mb-3 text-xs font-medium text-slate-500">การส่งต่องานระหว่างผู้ช่วย</h3>
            <ol className="relative space-y-3 border-l border-slate-200 pl-4">
              {[...run.events].reverse().map((e, i) => (
                <li key={i} className="relative">
                  <span className={cn('absolute top-1.5 -left-[21px] size-2 rounded-full ring-4 ring-white', EVENT_DOT[e.tone])} />
                  <p className="text-[13px] leading-snug text-slate-700">{e.text}</p>
                  <p className="text-[11px] text-slate-400">{clockTime(e.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </aside>
  )
}

/**
 * The screen the app opens on, as in Qwen or ChatGPT: a greeting and one large composer, centred. Nothing else.
 * Past chats are in the sidebar's chat history.
 */
function NewChat({ pick, onPickChange, onSend, variant }) {
  const { state } = useStore()
  const me = userById(state.userId)
  const given = me.name.split(/[ .]/)[0] // "somchai.a" → "Somchai", "Nok J." → "Nok"
  const greetingName = given.charAt(0).toUpperCase() + given.slice(1)
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 pb-16">
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">สวัสดี คุณ {greetingName}</h1>
      <Composer large typing={variant === 'B'} data-tour="home-command" pick={pick} onPickChange={onPickChange} onSend={onSend} />
    </div>
  )
}

export default function Workspace() {
  const { state, actions } = useStore()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [variant] = useVariant() // PROTOTYPE: A = one column, B = chat + work area
  const [stepsRunId, setStepsRunId] = useState(null) // the Run whose steps are open in the side panel
  const [deskPick, setDeskPick] = useState(null) // B: the Run the user chose to look at in the work area
  const handled = useRef(null)
  const q = params.get('q')

  const [pick, setPick] = usePick(params.get('agent'))
  const run = state.runs.find((r) => r.id === params.get('run')) ?? null
  const thread = useMemo(() => (run ? runsOfThread(state.runs, run.threadId) : []), [state.runs, run])

  // `pick` is { agentId } when the user chose an Agent, otherwise {} and the planner decides.
  const send = (prompt, pick, threadId, attachments) => {
    // One rule: a chat answer, or an Agent the user picked (with or without Steps), starts straight away.
    // Several Agents the system chose itself (even an Agent with Steps matched by keyword) wait at the Plan for "เริ่มเลย".
    const picked = Boolean(pick?.agentId)
    const id = actions.planRun(prompt, pick ?? {}, state, { threadId, attachments, autoStart: (plan) => picked || isChatRun(plan) })
    setParams({ run: id, variant })
  }
  const stepsRun = variant === 'A' ? thread.find((r) => r.id === stepsRunId) : null // closes by itself when the user leaves the Thread
  // B: the work area follows the newest multi-step Run unless the user picked an older one. A chat answer needs no work area.
  const deskRuns = thread.filter((r) => !isChatRun(r))
  const deskRun = deskRuns.find((r) => r.id === deskPick) ?? deskRuns.at(-1) ?? null
  const split = variant === 'B' && deskRun !== null
  useEffect(() => { setDeskPick(null) }, [deskRuns.length]) // a new Run takes over the work area

  useEffect(() => {
    if (!q || handled.current === q) return
    handled.current = q
    send(q, pickFromParams(params), undefined, location.state?.attachments) // pick and files from the home page
  }) // runs after each render but acts only once per incoming prompt

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] gap-6 lg:h-[calc(100dvh-6rem)]">
      <section className={cn('flex min-h-0 min-w-0 flex-1', split ? 'flex-col gap-4 lg:flex-row lg:gap-6' : 'flex-col')}>
        {run ? (
          <>
            {split && <div className="order-first max-h-[45%] min-h-0 overflow-y-auto lg:order-last lg:max-h-none lg:flex-1 lg:overflow-visible"><Desk key={deskRun.id} run={deskRun} /></div>}
            <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', split && 'lg:w-[26rem] lg:flex-none')}>
              <div className="flex items-center gap-3 pb-3">
                <Button size="sm" icon={Plus} onClick={() => setParams({ variant })} className="lg:hidden">แชตใหม่</Button>
                <p className="hidden min-w-0 truncate text-sm font-medium text-slate-700 sm:block">{thread[0]?.title}</p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ChatView thread={thread} onShowSteps={setStepsRunId} variant={variant} deskRunId={split ? deskRun.id : null} onOpenDesk={setDeskPick} />
              </div>
              <div className="pt-3">
                <Composer pick={pick} onPickChange={setPick} onSend={(p, pk, files) => send(p, pk, run.threadId, files)} />
              </div>
            </div>
          </>
        ) : (
          <NewChat variant={variant} pick={pick} onPickChange={setPick} onSend={(p, pk, files) => send(p, pk, undefined, files)} />
        )}
      </section>
      {stepsRun && <StepsPanel key={stepsRun.id} run={stepsRun} onClose={() => setStepsRunId(null)} />}
    </div>
  )
}
