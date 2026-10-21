import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, ArrowUp, CircleCheck, CircleDashed, Copy, Download, ListChecks, LoaderCircle,
  Play, Plus, Share2, ShieldCheck, Sparkles, Undo2, X,
} from 'lucide-react'
import { useStore } from '../store/AppStore'
import { AttachButton, AttachmentList } from '../components/ui/Attachments'
import { ACTIVITIES } from '../lib/mockOutputs'
import { isChatRun, runProgress, runsOfThread } from '../lib/runs'
import { clockTime, cn } from '../lib/utils'
import { ProgressBar } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Menu from '../components/ui/Menu'
import EntityIcon from '../components/agents/EntityIcon'
import Pipeline from '../components/workflow/Pipeline'
import ArtifactView from '../components/workflow/ArtifactView'
import SaveForReuse from '../components/workflow/SaveForReuse'
import Feedback from '../components/workflow/Feedback'
import ComposerPick, { pickFromParams, usePick } from '../components/workflow/ComposerPick'
import ReuseRow from '../components/workflow/ReuseRow'
import DepartmentAgents from '../components/agents/DepartmentAgents'
import { WelcomeCard } from '../components/layout/Help'
import { userById } from '../data/catalog'
import { reuseItems } from '../lib/reuse'
import logo from '../assets/icn-logo.png'

// One-tap examples for a newcomer who doesn't know what to ask yet.
const EXAMPLES = [
  { label: 'ทำ Proposal ให้ลูกค้า', prompt: 'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Thai Retail Group' },
  { label: 'ค้นข้อมูล สรุปรายงาน พร้อมภาพ', prompt: 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ' },
  { label: 'ถามระเบียบ / สวัสดิการ', prompt: 'นโยบายวันลาพักร้อนสะสมได้กี่วัน' },
  { label: 'แจ้งปัญหา IT', prompt: 'VPN ต่อไม่ได้ตั้งแต่เช้า' },
  { label: 'ทำรายงานปิดงบประจำเดือน', prompt: 'ทำรายงานปิดงบเดือนตุลาคม พร้อมกระทบยอด Invoice' },
  { label: 'วิเคราะห์ยอดขายจาก Excel', prompt: 'วิเคราะห์ยอดขาย Q3 รายภาค และสรุปเป็นรายงาน' },
]

/** The deliverable to show first: the document if there is one, otherwise the last real output. */
function finalStep(run) {
  const outputs = run.steps.filter((s) => s.output)
  return outputs.find((s) => s.output.type === 'doc') ?? outputs.filter((s) => s.output.type !== 'checklist').at(-1) ?? outputs.at(-1)
}

function Composer({ onSend, pick, onPickChange, ...props }) {
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
      <form {...props} onSubmit={(e) => { e.preventDefault(); send() }} className="rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        <textarea
          ref={ref} value={text} onChange={(e) => setText(e.target.value)} rows={1} aria-label="ข้อความ"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={pick.workflowId ? `พิมพ์ข้อมูลสำหรับสายงานนี้ เช่น ชื่อลูกค้า หรือรายละเอียดงาน…` : 'พิมพ์งานหรือคำถามที่ต้องการ…'}
          className="block max-h-40 min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-[15px] placeholder:text-slate-400 focus:outline-none [field-sizing:content]"
        />
        <AttachmentList files={files} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
        <div className="flex items-center gap-1 px-1">
          <AttachButton onAdd={(added) => setFiles((fs) => [...fs, ...added])} />
          <ComposerPick pick={pick} onChange={onPickChange} chooseAgent />
          <button type="submit" disabled={!text.trim()} aria-label="ส่ง" className="ml-auto flex size-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400">
            <ArrowUp className="size-5" />
          </button>
        </div>
      </form>
      <p className="mt-1.5 text-center text-[11px] text-slate-400">
        Enter เพื่อส่ง · Shift+Enter ขึ้นบรรทัดใหม่ · ข้อมูลลับประมวลผลบน AI ภายในบริษัท
      </p>
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
        { label: 'ดูขั้นตอน', icon: ListChecks, onSelect: onShowSteps },
      ]} />
      <Feedback run={run} />
    </div>
  )
}

function AssistantMessage({ run, latest, onShowSteps }) {
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
            <p className="text-[15px] text-slate-700">แผนงาน: ให้ผู้ช่วย AI ทำ {run.steps.length} ขั้นตอน ตามลำดับนี้</p>
            <StepChips steps={run.steps} onRemove={run.steps.length > 1 ? (stepId) => actions.removeStep(run.id, stepId) : undefined} />
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" icon={Play} onClick={() => actions.startRun(run.id)}>เริ่มเลย</Button>
              <Button variant="ghost" icon={ListChecks} onClick={onShowSteps}>ดูขั้นตอน</Button>
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
            <button type="button" onClick={onShowSteps} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
              ดูขั้นตอน <ArrowRight className="size-3" aria-hidden />
            </button>
          </>
        ))}

        {run.status === 'completed' && (chat ? (
          <>
            <ArtifactView artifact={run.steps[0].output} />
            <ArtifactActions run={run} latest={latest} onShowSteps={onShowSteps} />
          </>
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
            <ArtifactActions run={run} latest={latest} onShowSteps={onShowSteps} />
          </>
        ))}
      </div>
    </div>
  )
}

function ChatView({ thread, onShowSteps }) {
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
          <AssistantMessage run={run} latest={run === last} onShowSteps={() => onShowSteps(run.id)} />
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
 * The screen the app opens on, as in ChatGPT, Claude or Gemini: a greeting, the composer, and the "ใช้ซ้ำ" row.
 * Past chats are in the sidebar's chat history. Examples show only until the user has a Run of their own.
 */
function NewChat({ pick, onPickChange, onSend }) {
  const { state } = useStore()
  const me = userById(state.userId)
  const hasRuns = state.runs.some((r) => r.owner === state.userId)
  const reuse = reuseItems(state)
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-8 px-1 pt-2 pb-6 lg:pt-6">
        <WelcomeCard />
        <section className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">สวัสดี คุณ{me.name.split(' ')[0]} วันนี้ให้ช่วยอะไรดี?</h1>
          <p className="mt-2 mb-6 text-sm text-slate-500">พิมพ์งานที่ต้องการเป็นภาษาปกติ ระบบจะเลือกผู้ช่วย AI ที่เหมาะให้เอง</p>
          <Composer data-tour="home-command" pick={pick} onPickChange={onPickChange} onSend={onSend} />
          {!hasRuns && (
            <ul aria-label="ตัวอย่างงาน" className="mt-4 flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((x) => (
                <li key={x.label}>
                  <button type="button" onClick={() => onSend(x.prompt, pick, [])} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200 hover:text-slate-900">{x.label}</button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <DepartmentAgents pick={pick} onPick={onPickChange} exclude={reuse.filter((it) => it.kind === 'agent').map((it) => it.item.id)} />
        <ReuseRow items={reuse} pick={pick} onPick={onPickChange} hasFavorites={state.favorites.length > 0} />
      </div>
    </div>
  )
}

export default function Workspace() {
  const { state, actions } = useStore()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [stepsRunId, setStepsRunId] = useState(null) // the Run whose steps are open in the side panel
  const handled = useRef(null)
  const q = params.get('q')

  const [pick, setPick] = usePick(params.get('agent'), params.get('workflow'))
  const run = state.runs.find((r) => r.id === params.get('run')) ?? null
  const thread = useMemo(() => (run ? runsOfThread(state.runs, run.threadId) : []), [state.runs, run])

  // `pick` is { agentId } or { workflowId } when the user chose one, otherwise {} and the planner decides.
  const send = (prompt, pick, threadId, attachments) => {
    // One rule: a chat answer, or an Agent or Workflow the user picked, starts straight away.
    // Several Agents the system chose itself (even a Workflow matched by keyword) wait at the Plan for "เริ่มเลย".
    const picked = Boolean(pick?.agentId || pick?.workflowId)
    const id = actions.planRun(prompt, pick ?? {}, state, { threadId, attachments, autoStart: (plan) => picked || isChatRun(plan) })
    setParams({ run: id })
  }
  const stepsRun = thread.find((r) => r.id === stepsRunId) // closes by itself when the user leaves the Thread

  useEffect(() => {
    if (!q || handled.current === q) return
    handled.current = q
    send(q, pickFromParams(params), undefined, location.state?.attachments) // pick and files from the home page
  }) // runs after each render but acts only once per incoming prompt

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] gap-6 lg:h-[calc(100dvh-6rem)]">
      <section className="flex min-w-0 flex-1 flex-col">
        {run ? (
          <>
            <div className="flex items-center gap-3 pb-3">
              <Button size="sm" icon={Plus} onClick={() => setParams({})} className="lg:hidden">แชตใหม่</Button>
              <p className="hidden min-w-0 truncate text-sm font-medium text-slate-700 sm:block">{thread[0]?.title}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ChatView thread={thread} onShowSteps={setStepsRunId} />
            </div>
            <div className="pt-3">
              <Composer pick={pick} onPickChange={setPick} onSend={(p, pk, files) => send(p, pk, run.threadId, files)} />
            </div>
          </>
        ) : (
          <NewChat pick={pick} onPickChange={setPick} onSend={(p, pk, files) => send(p, pk, undefined, files)} />
        )}
      </section>
      {stepsRun && <StepsPanel key={stepsRun.id} run={stepsRun} onClose={() => setStepsRunId(null)} />}
    </div>
  )
}
