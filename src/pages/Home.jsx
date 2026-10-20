import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUp, ShieldCheck } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { deptById, userById } from '../data/catalog'
import { timeAgo } from '../lib/utils'
import { StatusPill } from '../components/ui/Badge'
import EntityIcon from '../components/agents/EntityIcon'
import { WelcomeCard } from '../components/layout/Help'
import { AttachButton, AttachmentList } from '../components/ui/Attachments'

const QUICK_TASKS = [
  { icon: 'sales', dept: 'sales', label: 'ทำ Proposal ให้ลูกค้า', prompt: 'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Thai Retail Group' },
  { icon: 'research', dept: 'core', label: 'ค้นข้อมูล สรุปรายงาน พร้อมภาพ', prompt: 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ' },
  { icon: 'hr', dept: 'hr', label: 'ถามระเบียบ / สวัสดิการ', prompt: 'นโยบายวันลาพักร้อนสะสมได้กี่วัน' },
  { icon: 'it', dept: 'it', label: 'แจ้งปัญหา IT', prompt: 'VPN ต่อไม่ได้ตั้งแต่เช้า' },
  { icon: 'accounting', dept: 'accounting', label: 'ทำรายงานปิดงบประจำเดือน', prompt: 'ทำรายงานปิดงบเดือนตุลาคม พร้อมกระทบยอด Invoice' },
  { icon: 'data', dept: 'core', label: 'วิเคราะห์ยอดขายจาก Excel', prompt: 'วิเคราะห์ยอดขาย Q3 รายภาค และสรุปเป็นรายงาน' },
]

const EXAMPLES = QUICK_TASKS.map((t) => t.prompt)

// Grapheme split so Thai vowels and tone marks appear together with their consonant.
const graphemes = (s) => (typeof Intl.Segmenter === 'function'
  ? [...new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(s)].map((g) => g.segment)
  : Array.from(s))

/** Types each phrase out, pauses, erases it, then moves to the next. Paused while `active` is false. */
export function useTypewriter(phrases, active) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!active) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShown(phrases[0]); return undefined }
    const chars = phrases.map(graphemes)
    let i = 0, n = 0, erasing = false, timer
    const tick = () => {
      const c = chars[i]
      let delay = erasing ? 20 : 55
      if (!erasing && ++n === c.length) { erasing = true; delay = 1800 }
      else if (erasing && --n === 0) { erasing = false; i = (i + 1) % chars.length; delay = 400 }
      setShown(c.slice(0, n).join(''))
      timer = setTimeout(tick, delay)
    }
    timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
  }, [phrases, active])
  return shown
}

export default function Home() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const typed = useTypewriter(EXAMPLES, !text)
  const me = userById(state.userId)
  const go = (prompt) => prompt.trim() && navigate(`/workspace?q=${encodeURIComponent(prompt.trim())}`, { state: { attachments: files } })

  // Running first, then most recent — one list instead of separate dashboards.
  const myTasks = [...state.runs.filter((r) => r.status === 'running'), ...state.runs.filter((r) => r.status !== 'running')].slice(0, 5)
  const favorites = state.favorites.map((id) => state.agents.find((a) => a.id === id)).filter(Boolean)

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
            {!text && (
              <p aria-hidden className="pointer-events-none absolute inset-0 px-3 py-2 text-[15px] text-slate-400">
                เช่น {typed}<span className="ml-px inline-block h-[1.1em] w-px animate-pulse bg-slate-400 align-middle" />
              </p>
            )}
          </div>
          <AttachmentList files={files} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
          <div className="flex items-center justify-between px-1">
            <AttachButton onAdd={(added) => setFiles((fs) => [...fs, ...added])} />
            <button type="submit" disabled={!text.trim()} aria-label="ส่งงาน" className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400">
              <ArrowUp className="size-5" />
            </button>
          </div>
        </form>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="size-3.5 text-emerald-500" /> ข้อมูลลับประมวลผลบน AI ภายในบริษัทอัตโนมัติ</p>
      </section>

      <section data-tour="home-quick">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">หรือเลือกงานยอดนิยม</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_TASKS.map((t) => (
            <button key={t.label} type="button" onClick={() => go(t.prompt)} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-300 hover:shadow-sm">
              <EntityIcon icon={t.icon} size="sm" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800">{t.label}</span>
                <span className="block text-xs text-slate-500">{deptById(t.dept).th}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section data-tour="home-tasks">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">งานของฉัน</h2>
          <Link to="/workspace" className="text-xs font-medium text-brand-700 hover:underline">ดูทั้งหมด</Link>
        </div>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {myTasks.map((r) => (
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
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">ผู้ช่วยประจำของคุณ</h2>
          <Link to="/agents" className="text-xs font-medium text-brand-700 hover:underline">คลังผู้ช่วยทั้งหมด</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {favorites.map((a) => (
            <Link key={a.id} to={`/workspace?agent=${a.id}`} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3.5 pl-1 text-sm text-slate-700 hover:border-brand-300">
              <EntityIcon icon={a.kind} size="sm" className="!rounded-full" />{a.name}
            </Link>
          ))}
        </div>
        <Link to="/agents/new" className="mt-4 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">อยากมีผู้ช่วยเฉพาะของแผนก? สร้างเองได้ไม่ต้องเขียนโค้ด <ArrowRight className="size-3.5" /></Link>
      </section>
    </div>
  )
}
