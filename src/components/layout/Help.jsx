import { useState } from 'react'
import { BookOpen, CircleHelp, Compass, Sparkles, X } from 'lucide-react'
import { useTour } from '../tour/Tour'
import EntityIcon from '../agents/EntityIcon'
import Button from '../ui/Button'
import { Modal } from '../ui/Overlay'

// Every concept explained by analogy to ordinary office work — for people new to AI.
export const TERMS = [
  { icon: 'agent', tone: 'agent', term: 'ผู้ช่วย AI (Agent)', like: 'เหมือนพนักงานผู้เชี่ยวชาญ', text: 'แต่ละตัวถนัดงานต่างกัน เช่น ค้นข้อมูล เขียนเอกสาร ทำภาพ ทำงานร่วมกันเป็นทีมได้' },
  { icon: 'skill', tone: 'skill', term: 'ทักษะ (Skill)', like: 'เหมือนคู่มือการทำงาน (SOP)', text: 'วิธีทำงานมาตรฐานของบริษัท เช่น รูปแบบรายงาน ใส่ให้ผู้ช่วยหลายตัวใช้ร่วมกันได้' },
  { icon: 'book', tone: 'skill', term: 'ความรู้ (Knowledge)', like: 'เหมือนเอกสารอ้างอิงที่ให้พนักงานอ่าน', text: 'ไฟล์ของบริษัท เช่น ราคาสินค้า คู่มือพนักงาน ที่ผู้ช่วยใช้ตอบคำถาม' },
  { icon: 'target', tone: 'agent', term: 'แผนงาน (Plan)', like: 'เหมือนหัวหน้าแบ่งงานให้ทีม', text: 'เมื่องานต้องใช้ผู้ช่วยหลายตัว ระบบเสนอลำดับผู้ช่วยให้ดูก่อน กด "เริ่มเลย" แล้วจึงเริ่มทำ บันทึกเป็นสายงานไว้ใช้ซ้ำได้' },
  { icon: 'condition', tone: 'skill', term: 'สายงาน (Workflow)', like: 'เหมือนการส่งต่องานระหว่างแผนก', text: 'ลำดับขั้นตอนที่ผู้ช่วยหลายตัวทำต่อกัน มีจุดตรวจและส่งกลับแก้ได้' },
  { icon: 'research', tone: 'agent', term: 'Local / Cloud AI', like: 'ทำงานในบริษัท / ใช้บริการภายนอก', text: 'ข้อมูลลับประมวลผลบน Local AI ภายในบริษัทเสมอ ระบบเลือกให้อัตโนมัติ' },
]

const SEEN_KEY = 'icn.welcome.dismissed'
const readSeen = () => { try { return localStorage.getItem(SEEN_KEY) === '1' } catch { return false } }
const writeSeen = () => { try { localStorage.setItem(SEEN_KEY, '1') } catch { /* storage unavailable — card simply reappears */ } }

function TermList() {
  return (
    <ul className="space-y-3">
      {TERMS.map((t) => (
        <li key={t.term} className="flex gap-3">
          <EntityIcon icon={t.icon} tone={t.tone} size="sm" />
          <div>
            <p className="text-sm font-medium text-slate-900">{t.term} <span className="font-normal text-brand-700">— {t.like}</span></p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{t.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function HelpButton() {
  const [open, setOpen] = useState(false)
  const { start } = useTour()
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="คำศัพท์และวิธีใช้">
        <CircleHelp className="size-[18px]" /><span className="hidden md:inline">วิธีใช้</span>
      </button>
      <Modal
        open={open} onClose={() => setOpen(false)} title="คำศัพท์ที่ควรรู้" subtitle="ICN AI Hub ทำงานเหมือนทีมในบริษัท"
        footer={<Button variant="primary" icon={Compass} onClick={() => { setOpen(false); start() }}>เริ่มทัวร์แนะนำการใช้งาน</Button>}
      >
        <TermList />
      </Modal>
    </>
  )
}

/** First-visit introduction on the new-chat screen; dismissal is remembered per browser. */
export function WelcomeCard() {
  const [hidden, setHidden] = useState(readSeen)
  const { start } = useTour()
  if (hidden) return null
  const close = () => { writeSeen(); setHidden(true) }
  const steps = ['พิมพ์งานที่ต้องการเป็นภาษาปกติ', 'ระบบเลือกผู้ช่วย AI ที่เหมาะให้เอง', 'รอรับผลงาน ดูความคืบหน้าได้ตลอด']
  return (
    <div className="rise relative rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
      <button type="button" onClick={close} className="absolute top-3 right-3 rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-600" aria-label="ปิดคำแนะนำ"><X className="size-4" /></button>
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Sparkles className="size-4 text-brand-600" /> ยินดีต้อนรับสู่ ICN AI Hub</p>
      <p className="mt-1 text-[13px] text-slate-600">ไม่ต้องรู้เรื่อง AI ก็ใช้ได้ — ใช้แค่ 3 ขั้นตอน</p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-[13px] text-slate-700 ring-1 ring-brand-100">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{i + 1}</span>{s}
          </li>
        ))}
      </ol>
      <details className="group mt-3">
        <summary className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-brand-700"><BookOpen className="size-3.5" /> คำศัพท์ที่จะเจอในระบบ</summary>
        <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-brand-100"><TermList /></div>
      </details>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" icon={Compass} onClick={() => { close(); start() }}>เริ่มทัวร์แนะนำ (1 นาที)</Button>
        <Button size="sm" variant="ghost" onClick={close}>เข้าใจแล้ว ไม่ต้องแสดงอีก</Button>
      </div>
    </div>
  )
}
