import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  ArrowUp, CalendarClock, ChevronDown, ChevronUp, CircleCheck, CircleDashed, Copy, Download, Eye, ListChecks, LoaderCircle,
  Plus, Share2, ShieldCheck, X,
} from 'lucide-react'
import { useStore } from '../store/AppStore'
import { AttachButton, AttachmentList } from '../components/ui/Attachments'
import MicButton from '../components/ui/MicButton'
import TypewriterHint from '../components/ui/TypewriterHint'
import { ACTIVITIES } from '../lib/mockOutputs'
import { isChatRun, runProgress, runsOfThread } from '../lib/runs'
import { cn, truncate } from '../lib/utils'
import { ProgressBar } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Menu from '../components/ui/Menu'
import EntityIcon from '../components/agents/EntityIcon'
import ArtifactView from '../components/run/ArtifactView'
import SaveForReuse from '../components/run/SaveForReuse'
import Feedback from '../components/run/Feedback'
import ComposerPick, { pickFromParams, usePick } from '../components/run/ComposerPick'
import { userById } from '../data/catalog'
import { personalOf, timesAskedBefore } from '../lib/personal'
import { canSaveForReuse } from '../lib/reuse'
import { OUTWARD } from '../lib/outward'
import PlanCard from '../components/run/PlanCard'
import { useCube } from '../lib/useCube'
import AgentCube from '../components/agents/AgentCube'
import { artifactMeta } from '../lib/artifactMeta'
import { downloadExcel } from '../lib/sheets'
import logo from '../assets/icn-logo.png'

// These are typed out over the empty new-chat composer, so a newcomer sees what to ask. A module constant: the hint restarts if it changes.
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

/** The Steps whose Artifacts a Run hands over: those marked as delivered (a team's, one per Step), else just the final one. */
function deliverables(run) {
  const delivered = run.steps.filter((s) => s.output?.deliverable)
  return delivered.length ? delivered : [finalStep(run)].filter(Boolean)
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

/** A table Artifact downloads as a real .xlsx; any other kind is still a simulated download. */
function useDownload(output) {
  const { actions } = useStore()
  const table = output?.type === 'table'
  return {
    label: table ? 'ดาวน์โหลด Excel' : 'ดาวน์โหลด',
    run: table
      ? () => downloadExcel(output).catch(() => actions.toast('ดาวน์โหลดไม่สำเร็จ ลองอีกครั้ง', { tone: 'warning' }))
      : () => actions.toast('ดาวน์โหลดไฟล์เรียบร้อย (จำลอง)'),
  }
}

/**
 * Under a finished Artifact, for chat and multi-Agent Runs alike: "ดาวน์โหลด" first, "บันทึกไว้ใช้ซ้ำ" beside it,
 * the rest in "⋯", then 👍/👎 Feedback. Only the latest Run's download is brand-coloured, so the page keeps one primary button.
 */
function ArtifactActions({ run, step = finalStep(run), latest }) {
  const { actions } = useStore()
  const download = useDownload(step?.output)
  return (
    <div role="group" aria-label="การทำงานกับผลงาน" className="flex flex-wrap items-center gap-1.5">
      <Button size="sm" variant={latest ? 'primary' : 'secondary'} icon={Download} onClick={download.run}>{download.label}</Button>
      <SaveForReuse run={run} />
      <Menu items={[
        { label: 'คัดลอก', icon: Copy, onSelect: () => actions.toast('คัดลอกแล้ว') },
        { label: 'แชร์', icon: Share2, onSelect: () => actions.toast('คัดลอกลิงก์สำหรับแชร์แล้ว') },
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

function SensitiveNote({ run }) {
  return <p className="flex items-center gap-1.5 text-xs text-emerald-700"><ShieldCheck className="size-3.5" /> พบข้อมูล{run.status === 'running' && ' · กำลังประมวลผล'}</p>
}

/** Under a finished Run: the Memories the Personal agent used for it (only those that bear on the request). */
function MemoryUsed({ run }) {
  if (run.status !== 'completed' || !run.memoryUsed?.length) return null
  return <p className="text-xs text-slate-500">ใช้ความจำ: {run.memoryUsed.join(' · ')}</p>
}

/** The Personal agent notices a request made again and offers to keep it; pressing "บันทึกไว้ใช้ซ้ำ" accepts, doing nothing creates nothing. */
function RepeatHint({ run }) {
  const { state } = useStore()
  const times = timesAskedBefore(state.runs, run)
  if (run.status !== 'completed' || !canSaveForReuse(run) || times === 0) return null
  return <p className="text-xs text-slate-500">{personalOf(state).name}เห็นว่าคุณขอเรื่องนี้มาแล้ว {times} ครั้ง ถ้าจะใช้อีก กด “บันทึกไว้ใช้ซ้ำ” เพื่อเก็บเป็น Agent</p>
}

/**
 * An Outward action the Personal agent drafted: sending or writing outside the app waits for the User's yes ("ถามก่อนลงมือ").
 * If the User has set that kind to automatic, it is done on the spot and the card only reports it.
 */
function OutwardCard({ run }) {
  const { state, actions } = useStore()
  const { type, status, draft, via, rowNo } = run.outward
  const auto = personalOf(state).auto[type]
  useEffect(() => { if (status === 'asking' && auto) actions.resolveOutward(run.id, 'done', 'auto') }, [status, auto, run.id, actions])
  if (status === 'asking' && auto) return null
  const asking = status === 'asking'
  const { yes } = OUTWARD[type]
  const excel = state.office365.excel
  return (
    <section aria-label={asking ? 'ถามก่อนลงมือ' : 'ผลการลงมือ'} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-sm font-semibold text-slate-900">
        {asking ? `${personalOf(state).name}ร่างไว้แล้ว ${OUTWARD[type].label}ไหม` : OUTWARD[type].label}
      </p>
      {type === 'email' ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
          <p className="font-medium text-slate-900">{draft.subject}</p>
          <p className="mt-2 whitespace-pre-line">{draft.body}</p>
        </div>
      ) : type === 'line-group' ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
          <p className="font-medium text-slate-900">กลุ่ม {draft.group}</p>
          <p className="mt-2 break-words">{draft.text}</p>
        </div>
      ) : (
        <p className="text-sm text-slate-700">
          ต่อท้ายไฟล์ {draft.file} บน Office365: {draft.columns.map((c, i) => `${c} ${draft.row[i]}`).join(' · ')}
        </p>
      )}
      {asking ? (
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={() => actions.resolveOutward(run.id, 'done')}>{yes}</Button>
          <Button size="sm" onClick={() => actions.resolveOutward(run.id, 'declined')}>ไม่ทำ</Button>
        </div>
      ) : status === 'done' ? (
        <>
          <p className="text-sm text-emerald-700">
            {type === 'email' ? 'ส่งอีเมลแล้ว (จำลอง)' : type === 'line-group' ? 'โพสต์ในกลุ่มแล้ว (จำลอง)' : `เพิ่มแถวที่ ${rowNo} ในไฟล์แล้ว`}{via === 'auto' && ' · ทำเองตามที่ตั้งไว้'}
          </p>
          {type === 'excel' && (
            <div className="overflow-x-auto">
              <table aria-label={excel.file} className="w-full text-left text-xs text-slate-600">
                <thead><tr>{excel.columns.map((c) => <th key={c} scope="col" className="pr-4 pb-1 font-medium text-slate-500">{c}</th>)}</tr></thead>
                <tbody>{excel.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j} className="pr-4 py-0.5">{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
        </>
      ) : <p className="text-sm text-slate-500">ไม่ได้ทำ ไม่มีอะไรถูก{yes}</p>}
    </section>
  )
}

function Typing() {
  return (
    <span className="inline-flex gap-1 py-2" aria-label="กำลังพิมพ์">
      {[0, 150, 300].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: `${d}ms` }} />)}
    </span>
  )
}

/** The Thread only talks; the Plan, progress and result live in the work area (Desk) beside it. */
function DeskNote({ run, latest, selected, onOpen, onClose }) {
  const { state } = useStore()
  const [cubeOn] = useCube()
  const chat = isChatRun(run)
  // the Agent speaking: the one the Run was started with, else the step now under way (a plain chat has none)
  const step = run.steps[Math.min(run.current, run.steps.length - 1)]
  const agent = state.agents.find((a) => a.id === (run.agentId ?? step?.agentId)) ?? { id: 'icn-assistant', kind: step?.kind }
  const finals = run.status === 'completed' ? deliverables(run) : []
  return (
    <div className="flex gap-3">
      {cubeOn
        ? <span className="shrink-0"><AgentCube agent={agent} size={32} calm thinking={run.status === 'running'} /></span>
        : <img src={logo} alt="" className="size-8 shrink-0 rounded-full ring-1 ring-slate-200" />}
      <div className="min-w-0 flex-1 space-y-2.5 pt-1">
        {run.sensitive && <SensitiveNote run={run} />}
        {chat ? (
          run.status === 'completed' ? (
            <>
              <ArtifactView artifact={run.steps[0].output} />
              <ArtifactActions run={run} latest={latest} />
              <MemoryUsed run={run} />
              <RepeatHint run={run} />
              {run.outward && <OutwardCard run={run} />}
            </>
          ) : <Typing />
        ) : (
          <>
            <p className="text-[15px] text-slate-700">
              {run.status === 'planned' && `${personalOf(state).name}วางแผนไว้ ${run.steps.length} ขั้นตอน ดูแผนที่พื้นที่ทำงาน แล้วกด “เริ่มทำงาน” ได้เลย`}
              {run.status === 'running' && `กำลังทำงาน ขั้นตอน ${Math.min(run.current + 1, run.steps.length)} จาก ${run.steps.length} · ${truncate(step.task, 26)}`}
              {run.status === 'completed' && `เสร็จแล้ว — ${finals.length > 1 ? `ได้ ${finals.length} ผลงาน` : `“${finals[0]?.output.title ?? 'ผลงาน'}”`} อยู่ที่พื้นที่ทำงาน`}
            </p>
            {run.status === 'running' ? (
              <button type="button" onClick={selected ? onClose : onOpen} aria-expanded={selected} className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">
                {selected ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}{selected ? 'ย่อ' : 'ดูขั้นตอนทั้งหมด'}
              </button>
            ) : !selected && <Button size="sm" variant="secondary" icon={Eye} onClick={onOpen}>{run.status === 'completed' ? 'เปิดดูผลงาน' : 'ดูแผนงาน'}</Button>}
            <MemoryUsed run={run} />
            <RepeatHint run={run} />
            {run.status === 'completed' && run.outward && <OutwardCard run={run} />}
          </>
        )}
      </div>
    </div>
  )
}

/** The work area: the strongest object on the page, whichever stage the Run is at. */
function Desk({ run, onClose }) {
  const { actions } = useStore()
  const finals = run.status === 'completed' ? deliverables(run) : []
  const several = finals.length > 1
  const final = several ? null : finals[0] // with several Artifacts the header is the Run's, and each Artifact carries its own actions
  const loops = run.steps.reduce((n, s) => n + (s.kind === 'review' ? s.loops : 0), 0)
  return (
    <section aria-label="พื้นที่ทำงาน" className="rise flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* a finished file fills the area: its header and actions stay put and only the body below scrolls */}
      {final ? (
        <header className="shrink-0 space-y-2.5 border-b border-slate-100 px-5 py-3 lg:px-7">
          <div className="flex items-center gap-3">
            <ArtifactHeader output={final.output} />
            <Button variant="ghost" size="icon" icon={X} onClick={onClose} aria-label="ปิดพื้นที่ทำงาน" title="ปิด" />
          </div>
          <ArtifactActions run={run} latest />
        </header>
      ) : (
        <header className="shrink-0 space-y-3 border-b border-slate-100 px-5 py-4 lg:px-7">
          <div className="flex items-start gap-3">
            <h2 className="min-w-0 flex-1 text-lg font-semibold tracking-tight text-slate-900">{run.title ?? run.prompt}</h2>
            <Button variant="ghost" size="icon" icon={X} onClick={onClose} aria-label="ปิดพื้นที่ทำงาน" title="ปิด" />
          </div>
          <StepGuide status={run.status} />
        </header>
      )}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 lg:p-7">
        {run.status !== 'completed' && (
          <PlanCard bare run={run} onRemove={(stepId) => actions.removeStep(run.id, stepId)} onStart={() => actions.startRun(run.id)} />
        )}
        {run.status === 'running' && (
          <>
            <div className="flex items-center gap-3"><ProgressBar value={runProgress(run)} className="flex-1" /><span className="text-xs font-medium text-slate-500">{Math.round(runProgress(run) * 100)}%</span></div>
            <LiveActivity run={run} />
          </>
        )}
        {several && finals.map((f) => (
          <section key={f.id} aria-label={f.output.title} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3"><ArtifactHeader output={f.output} /><ArtifactActions run={run} step={f} latest /></div>
            <ArtifactView artifact={f.output} />
          </section>
        ))}
        {finals.length > 0 && (
          <>
            {final && <ArtifactView artifact={final.output} />}
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

function UserMessage({ prompt, attachments }) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <AttachmentList files={attachments} className="flex max-w-[85%] flex-wrap justify-end gap-1.5" />
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-slate-100 px-4 py-2.5 text-[15px] whitespace-pre-line text-slate-800">{prompt}</p>
    </div>
  )
}

/** Confirms a Schedule the User asked for in the chat. The rule lives on the Personal agent; the card only reads it. */
function ScheduleCard({ agentId }) {
  const { state } = useStore()
  const personal = personalOf(state)
  const schedule = personal.schedules.find((s) => s.agentId === agentId)
  const job = state.agents.find((a) => a.id === agentId)
  if (!schedule) return null
  return (
    <section aria-label="ตั้งเวลา" className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
      <CalendarClock className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
      <div className="min-w-0 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">ตั้งเวลาแล้ว · {schedule.when}</p>
        <p className="mt-0.5">แต่ละรอบครอบ{schedule.covers} และเพิ่มเป็น Run ใหม่ในแชตนี้</p>
        <p className="mt-1 text-xs text-slate-500">ตั้งไว้ที่ <Link to="/agent" className="font-medium text-brand-700 hover:underline">{personal.name}</Link> สำหรับงาน {job?.name} · ในเดโมนี้ยังไม่ทำงานเอง</p>
      </div>
    </section>
  )
}

function ChatView({ thread, deskRunId, onOpenDesk, onCloseDesk }) {
  const bottom = useRef(null)
  const last = thread.at(-1)
  const progressKey = last ? `${last.id}:${last.status}:${last.current}` : ''
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [progressKey, thread.length])

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-1 py-6">
      {thread.map((run) => (
        <div key={run.id} className="space-y-5">
          {run.scheduleLabel
            ? <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500"><CalendarClock className="size-4" aria-hidden />{run.scheduleLabel}</p>
            : <UserMessage prompt={run.prompt} attachments={run.attachments} />}
          <DeskNote run={run} latest={run === last} selected={run.id === deskRunId} onOpen={() => onOpenDesk(run.id)} onClose={onCloseDesk} />
          {run.scheduleSet && (
            <>
              <UserMessage prompt={run.scheduleSet.prompt} />
              <ScheduleCard agentId={run.agentId} />
            </>
          )}
        </div>
      ))}
      <div ref={bottom} />
    </div>
  )
}

const GUIDE = ['สั่งงาน', 'ตรวจแผน', 'Agent กำลังทำงาน', 'รับผลงาน']

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

/**
 * The screen the app opens on, as in Qwen or ChatGPT: a greeting and one large composer, centred. Nothing else.
 * Past chats are in the sidebar's chat history.
 */
function NewChat({ pick, onPickChange, onSend }) {
  const { state } = useStore()
  const me = userById(state.userId)
  const given = me.name.split(/[ .]/)[0] // "somchai.a" → "Somchai", "Nok J." → "Nok"
  const greetingName = given.charAt(0).toUpperCase() + given.slice(1)
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 pb-16">
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">สวัสดี คุณ {greetingName}</h1>
      <Composer large typing data-tour="home-command" pick={pick} onPickChange={onPickChange} onSend={onSend} />
      {personalOf(state).setup === 'pending' && (
        <p className="mt-4 text-center text-sm text-slate-500">
          ให้ {personalOf(state).name} รู้จักงานของคุณก่อนไหม ใช้เวลาไม่ถึงนาที{' '}
          <Link to="/agent/setup" className="font-medium text-brand-700 hover:underline">เริ่มตั้งค่า</Link>
        </p>
      )}
    </div>
  )
}

export default function Workspace() {
  const { state, actions } = useStore()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [deskOpen, setDeskOpen] = useState(false) // a running Run's work area is shown only once the user expands it
  const [deskClosed, setDeskClosed] = useState(false) // the user closed the work area
  const [deskPick, setDeskPick] = useState(null) // the Run the user chose to look at in the work area
  const handled = useRef(null)
  const q = params.get('q')

  const [pick, setPick] = usePick(params.get('agent'))
  const run = state.runs.find((r) => r.id === params.get('run')) ?? null
  const thread = useMemo(() => (run ? runsOfThread(state.runs, run.threadId) : []), [state.runs, run])

  // `pick` is { agentId } when the user chose an Agent, otherwise {} and the planner decides.
  const send = (prompt, pick, threadId, attachments) => {
    // One rule: a chat answer, or an Agent the user picked (with or without Steps), starts straight away.
    // Several Agents the system chose itself (even an Agent with Steps matched by keyword) wait at the Plan for "เริ่มทำงาน".
    const picked = Boolean(pick?.agentId)
    const id = actions.planRun(prompt, pick ?? {}, state, { threadId, attachments, autoStart: (plan) => picked || isChatRun(plan) })
    setParams({ run: id })
  }
  // The work area follows the newest multi-step Run unless the user picked an older one. A chat answer needs no work area.
  const deskRuns = thread.filter((r) => !isChatRun(r))
  const deskRun = deskRuns.find((r) => r.id === deskPick) ?? deskRuns.at(-1) ?? null
  const split = deskRun !== null && !deskClosed && (deskRun.status !== 'running' || deskOpen)
  const closeDesk = () => { setDeskOpen(false); setDeskClosed(true) }
  useEffect(() => {
    setDeskClosed(false) // a Run changing stage brings the work area back...
    if (deskRun?.status === 'running') setDeskOpen(false) // ...except that starting one folds it away until asked for
  }, [deskRun?.id, deskRun?.status])
  useEffect(() => { setDeskPick(null); setDeskOpen(false) }, [deskRuns.length]) // a new Run takes over the work area, closed

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
            {split && <div className="order-first flex max-h-[45%] min-h-0 min-w-0 flex-col lg:order-last lg:max-h-none lg:flex-1"><Desk key={deskRun.id} run={deskRun} onClose={closeDesk} /></div>}
            <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', split && 'lg:w-[26rem] lg:flex-none')}>
              <div className="flex items-center gap-3 pb-3">
                <Button size="sm" icon={Plus} onClick={() => setParams({})} className="lg:hidden">แชตใหม่</Button>
                <p className="hidden min-w-0 truncate text-sm font-medium text-slate-700 sm:block">{thread[0]?.title}</p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ChatView thread={thread} deskRunId={split ? deskRun.id : null} onOpenDesk={(id) => { setDeskPick(id); setDeskOpen(true); setDeskClosed(false) }} onCloseDesk={closeDesk} />
              </div>
              <div className="pt-3">
                <Composer pick={pick} onPickChange={setPick} onSend={(p, pk, files) => send(p, pk, run.threadId, files)} />
              </div>
            </div>
          </>
        ) : (
          <NewChat pick={pick} onPickChange={setPick} onSend={(p, pk, files) => send(p, pk, undefined, files)} />
        )}
      </section>
    </div>
  )
}
