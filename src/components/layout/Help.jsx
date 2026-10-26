import { useState } from 'react'
import { CircleHelp, Compass } from 'lucide-react'
import { useTour } from '../tour/Tour'
import EntityIcon from '../agents/EntityIcon'
import Button from '../ui/Button'
import { Modal } from '../ui/Overlay'

// Every concept explained by analogy to ordinary office work — for people new to AI.
export const TERMS = [
  { icon: 'agent', tone: 'agent', term: 'AI Agent', like: 'เหมือนพนักงานผู้เชี่ยวชาญ', text: 'แต่ละตัวถนัดงานต่างกัน เช่น ค้นข้อมูล เขียนเอกสาร ทำภาพ ทำงานร่วมกันเป็นทีมได้' },
  { icon: 'agent', tone: 'agent', term: 'Agent ส่วนตัว', like: 'เหมือนเลขาส่วนตัว', text: 'ทุกคนมีหนึ่งตัว จำงานประจำและความชอบของคุณ (ดูและแก้ได้ที่ “Agent ของคุณ”) เลือก Agent ไหนก็ได้ในช่องสั่งงาน แต่ถ้าไม่เลือก มันตัดสินใจให้เอง' },
  { icon: 'steps', tone: 'agent', term: 'ช่องทาง (LINE, Office Add-in)', like: 'เหมือนช่องที่ฝากงานถึงเลขา', text: 'สั่งงาน Agent ส่วนตัวจาก LINE หรือจากแผงข้าง Word, Excel, PowerPoint ได้ Admin เป็นคนเปิดให้ใช้ ข้อมูลลับให้สั่งในเว็บเท่านั้น' },
  { icon: 'target', tone: 'agent', term: 'ถามก่อนลงมือ', like: 'เหมือนขอเซ็นก่อนส่งจดหมาย', text: 'อ่านและร่างงาน Agent ทำเองได้ แต่ส่งอีเมล โพสต์ในกลุ่ม LINE หรือเพิ่มแถวใน Excel จะถามคุณก่อน เปิด “ทำเองเลย” รายประเภทได้ในหน้า Agent ของคุณ' },
  { icon: 'skill', tone: 'skill', term: 'ทักษะ (Skill)', like: 'เหมือนคู่มือการทำงาน (SOP)', text: 'วิธีทำงานมาตรฐานของบริษัท เช่น รูปแบบรายงาน ใส่ให้ Agent หลายตัวใช้ร่วมกันได้' },
  { icon: 'book', tone: 'skill', term: 'ความรู้ (Knowledge)', like: 'เหมือนเอกสารอ้างอิงที่ให้พนักงานอ่าน', text: 'ไฟล์ของบริษัท เช่น ราคาสินค้า คู่มือพนักงาน ที่ Agent ใช้ตอบคำถาม' },
  { icon: 'target', tone: 'agent', term: 'แผนงาน (Plan)', like: 'เหมือนหัวหน้าแบ่งงานให้ทีม', text: 'เมื่องานต้องใช้ Agent หลายตัว ระบบเสนอลำดับ Agent ให้ดูก่อน กด "เริ่มทำงาน" แล้วจึงเริ่มทำ ได้ผลงานแล้วกด "บันทึกไว้ใช้ซ้ำ" จะได้ Agent ตัวใหม่ที่ทำงานนี้ตามขั้นตอนเดิม' },
  { icon: 'steps', tone: 'agent', term: 'ขั้นตอน (Step)', like: 'เหมือนการส่งต่องานระหว่างแผนก', text: 'Agent ตัวไหนก็มีขั้นตอนได้ แต่ละขั้นส่งงานให้ Agent อีกตัวทำต่อตามลำดับ เช่น สรุป TOR → คำนวณราคา → ร่างหนังสือ ใช้งานเหมือน Agent ทั่วไป' },
  { icon: 'research', tone: 'agent', term: 'Local / Cloud AI', like: 'ทำงานในบริษัท / ใช้บริการภายนอก', text: 'ข้อมูลลับประมวลผลบน Local AI ภายในบริษัทเสมอ ระบบเลือกให้อัตโนมัติ' },
]

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
