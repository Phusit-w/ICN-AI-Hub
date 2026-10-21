import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUp, ShieldCheck, Workflow } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { userById } from '../data/catalog'
import { cn, timeAgo } from '../lib/utils'
import { reuseItems } from '../lib/reuse'
import { StatusPill } from '../components/ui/Badge'
import EntityIcon from '../components/agents/EntityIcon'
import { WelcomeCard } from '../components/layout/Help'
import { AttachButton, AttachmentList } from '../components/ui/Attachments'
import TypewriterHint from '../components/ui/TypewriterHint'
import ComposerPick, { pickQuery } from '../components/workflow/ComposerPick'

const EXAMPLES = [
  { label: 'ทำ Proposal ให้ลูกค้า', prompt: 'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Thai Retail Group' },
  { label: 'ค้นข้อมูล สรุปรายงาน พร้อมภาพ', prompt: 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ' },
  { label: 'ถามระเบียบ / สวัสดิการ', prompt: 'นโยบายวันลาพักร้อนสะสมได้กี่วัน' },
  { label: 'แจ้งปัญหา IT', prompt: 'VPN ต่อไม่ได้ตั้งแต่เช้า' },
  { label: 'ทำรายงานปิดงบประจำเดือน', prompt: 'ทำรายงานปิดงบเดือนตุลาคม พร้อมกระทบยอด Invoice' },
  { label: 'วิเคราะห์ยอดขายจาก Excel', prompt: 'วิเคราะห์ยอดขาย Q3 รายภาค และสรุปเป็นรายงาน' },
]

const sectionTitle = 'text-sm font-semibold text-slate-900'
const quietLink = 'text-xs font-medium text-brand-700 hover:underline'
const chip = 'flex items-center gap-2 rounded-full border bg-white py-1 pr-3.5 pl-1 text-sm transition'

/** "ใช้ซ้ำ": Favourite agents and the Workflows the user uses, one click fills one into the command box. */
function ReuseRow({ items, pick, onPick, hasFavorites }) {
  const isPicked = ({ kind, item }) => (kind === 'agent' ? pick.agentId : pick.workflowId) === item.id
  return (
    <section data-tour="home-reuse" aria-labelledby="home-reuse-title">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="home-reuse-title" className={sectionTitle}>ใช้ซ้ำ</h2>
        <Link to="/agents" className={quietLink}>ผู้ช่วยทั้งหมด</Link>
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => {
          const picked = isPicked(it)
          return (
            <li key={`${it.kind}:${it.item.id}`}>
              <button
                type="button" aria-pressed={picked} onClick={() => onPick(picked ? {} : it.pick)}
                className={cn(chip, picked ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-700 hover:border-brand-300')}
              >
                {it.kind === 'agent'
                  ? <EntityIcon icon={it.item.kind} size="sm" className="!rounded-full" />
                  : <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Workflow className="size-3.5" aria-hidden /></span>}
                <span className="sr-only">{it.kind === 'agent' ? 'ผู้ช่วย' : 'สายงาน'} </span>{it.item.name}
              </button>
            </li>
          )
        })}
      </ul>
      {!hasFavorites && (
        <p className="mt-2 text-[13px] text-slate-500">
          ยังไม่มีผู้ช่วยประจำ — กดดาวที่ผู้ช่วยใน<Link to="/agents" className="text-brand-700 hover:underline">คลังผู้ช่วย</Link> แล้วจะมาอยู่ตรงนี้ให้กดใช้ได้ทันที
        </p>
      )}
      <Link to="/agents/new" className="mt-3 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">อยากมีผู้ช่วยเฉพาะของแผนก? สร้างเองได้ไม่ต้องเขียนโค้ด <ArrowRight className="size-3.5" /></Link>
    </section>
  )
}

export default function Home() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [pick, setPick] = useState({})
  const me = userById(state.userId)
  // A picked Agent or Workflow goes along, so the Workspace starts the Run straight away.
  const go = (prompt) => prompt.trim() && navigate(`/workspace?q=${encodeURIComponent(prompt.trim())}${pickQuery(pick)}`, { state: { attachments: files } })

  // Running first, then most recent.
  const mine = state.runs.filter((r) => r.owner === state.userId).sort((a, b) => b.createdAt - a.createdAt)
  const myRuns = [...mine.filter((r) => r.status === 'running'), ...mine.filter((r) => r.status !== 'running')].slice(0, 5)
  const reuse = reuseItems(state)

  return (
    <div className="mx-auto max-w-3xl space-y-8 pt-2 lg:pt-6">
      <WelcomeCard />

      <section className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">สวัสดี คุณ{me.name.split(' ')[0]} วันนี้ให้ช่วยอะไรดี?</h1>
        <p className="mt-2 text-sm text-slate-500">พิมพ์งานที่ต้องการเป็นภาษาปกติ ระบบจะเลือกผู้ช่วย AI ที่เหมาะให้เอง</p>
        <form data-tour="home-command" onSubmit={(e) => { e.preventDefault(); go(text) }} className="mt-6 rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
          <div className="relative">
            <textarea
              value={text} onChange={(e) => setText(e.target.value)} rows={2} aria-label="สั่งงาน AI"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(text) } }}
              className="block w-full resize-none bg-transparent px-3 py-2 text-[15px] focus:outline-none"
            />
            {!text && <TypewriterHint phrases={EXAMPLES.map((x) => x.prompt)} className="px-3 py-2 text-[15px]" />}
          </div>
          <AttachmentList files={files} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
          <div className="flex items-center gap-1 px-1">
            <AttachButton onAdd={(added) => setFiles((fs) => [...fs, ...added])} />
            <ComposerPick pick={pick} onChange={setPick} />
            <button type="submit" disabled={!text.trim()} aria-label="ส่งงาน" className="ml-auto flex size-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400">
              <ArrowUp className="size-5" />
            </button>
          </div>
        </form>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="size-3.5 text-emerald-500" /> ข้อมูลลับประมวลผลบน AI ภายในบริษัทอัตโนมัติ</p>
        {mine.length === 0 && (
          // Examples help a newcomer see what to ask; once they have Runs they only add clutter.
          <ul aria-label="ตัวอย่างงาน" className="mt-4 flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((x) => (
              <li key={x.label}>
                <button type="button" onClick={() => setText(x.prompt)} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200 hover:text-slate-900">{x.label}</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReuseRow items={reuse} pick={pick} onPick={setPick} hasFavorites={state.favorites.length > 0} />

      <section data-tour="home-tasks" aria-labelledby="home-tasks-title">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="home-tasks-title" className={sectionTitle}>งานของฉัน</h2>
          {myRuns.length > 0 && <Link to="/workspace" className={quietLink}>ดูทั้งหมด</Link>}
        </div>
        {myRuns.length === 0 ? (
          <p className="text-[13px] text-slate-500">ยังไม่มีงาน — พิมพ์งานแรกในช่องด้านบน หรือกดตัวอย่างงานเพื่อเริ่ม แล้วงานจะมาอยู่ตรงนี้</p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {myRuns.map((r) => (
              <li key={r.id}>
                <Link to={`/workspace?run=${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                  <EntityIcon icon={r.steps[0]?.kind} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">{r.title}</div>
                    <div className="truncate text-xs text-slate-500">
                      {r.status === 'running' ? `${r.steps[r.current]?.name} กำลังทำ: ${r.steps[r.current]?.task}` : `${r.steps.length} ผู้ช่วย · ${timeAgo(r.createdAt)}`}
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
