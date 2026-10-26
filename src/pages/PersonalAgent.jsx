import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { personalOf } from '../lib/personal'
import { uid } from '../lib/utils'
import Button from '../components/ui/Button'
import { Toggle } from '../components/ui/Form'
import { OUTWARD, OUTWARD_TYPES } from '../lib/outward'

const inputClass = 'h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none'

/** One Memory: read, change or delete it. Only its owner sees this page. */
function MemoryRow({ memory, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(memory.text)
  const save = () => { if (text.trim()) onSave({ ...memory, text: text.trim() }); setEditing(false) }
  return (
    <li className="flex items-center gap-2 py-2.5">
      {editing ? (
        <>
          <input aria-label="แก้ความจำ" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} className={inputClass} />
          <Button size="sm" variant="primary" onClick={save}>บันทึก</Button>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1 text-sm text-slate-700">{memory.text}</span>
          <Button size="icon" variant="ghost" icon={Pencil} aria-label={`แก้ความจำ: ${memory.text}`} onClick={() => setEditing(true)} />
          <Button size="icon" variant="danger" icon={Trash2} aria-label={`ลบความจำ: ${memory.text}`} onClick={onDelete} />
        </>
      )}
    </li>
  )
}

/** "สิ่งที่ Agent รู้เกี่ยวกับคุณ": the Personal agent's name and Memory, which its owner can read, change and delete. */
export default function PersonalAgent() {
  const { state, actions } = useStore()
  const personal = personalOf(state)
  const [name, setName] = useState(personal.name)
  const [added, setAdded] = useState('')
  const setMemories = (memories) => actions.savePersonal({ memories })
  const add = () => {
    if (!added.trim()) return
    setMemories([...personal.memories, { id: uid('mem'), text: added.trim(), keys: [] }])
    setAdded('')
  }
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">สิ่งที่ Agent รู้เกี่ยวกับคุณ</h1>
        <p className="mt-2 text-sm text-slate-500">เห็นแค่คุณเท่านั้น ไม่ติดไปกับ Agent ที่คุณแชร์ และ Agent ใช้เฉพาะข้อที่เกี่ยวกับงานที่คุณสั่ง</p>
      </header>

      <section aria-label="ชื่อ Agent" className="space-y-2">
        <label htmlFor="agent-name" className="text-sm font-medium text-slate-800">ชื่อ Agent ของคุณ</label>
        <div className="flex gap-2">
          <input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          <Button variant="primary" disabled={!name.trim() || name.trim() === personal.name} onClick={() => actions.savePersonal({ name: name.trim() })}>บันทึกชื่อ</Button>
        </div>
      </section>

      <section aria-label="ความจำ" className="space-y-2">
        <h2 className="text-sm font-medium text-slate-800">ความจำ ({personal.memories.length})</h2>
        {personal.memories.length > 0 ? (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-4">
            {personal.memories.map((m) => (
              <MemoryRow
                key={m.id} memory={m}
                onSave={(next) => setMemories(personal.memories.map((x) => (x.id === m.id ? next : x)))}
                onDelete={() => setMemories(personal.memories.filter((x) => x.id !== m.id))}
              />
            ))}
          </ul>
        ) : <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-400">ยังไม่มีอะไรในความจำ</p>}
        <div className="flex gap-2 pt-1">
          <input aria-label="เพิ่มความจำ" value={added} placeholder="เช่น ส่งงานให้ลูกค้าเป็นภาษาไทยทางการ" onChange={(e) => setAdded(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} className={inputClass} />
          <Button icon={Plus} onClick={add}>เพิ่ม</Button>
        </div>
      </section>

      <section aria-label="ทำเองเลย" className="space-y-2">
        <h2 className="text-sm font-medium text-slate-800">ทำเองเลย</h2>
        <p className="text-sm text-slate-500">ปกติ Agent ถามก่อนทุกครั้งที่จะส่งหรือเขียนออกนอก เปิดข้อไหนแล้ว Agent จะทำข้อนั้นเองโดยไม่ถาม ปิดกลับได้ทุกเมื่อ</p>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-4">
          {OUTWARD_TYPES.map((type) => (
            <li key={type} className="flex items-center justify-between py-2.5 text-sm text-slate-700">
              {OUTWARD[type].label}
              <Toggle label={`ทำเองเลย: ${OUTWARD[type].label}`} checked={personal.auto[type]} onChange={(on) => actions.savePersonal({ auto: { ...personal.auto, [type]: on } })} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="ช่องทาง" className="space-y-2">
        <h2 className="text-sm font-medium text-slate-800">ช่องทาง</h2>
        <p className="text-sm text-slate-500">สั่งงาน Agent ของคุณจากนอกแอป <Link to="/agent/line" className="font-medium text-brand-700 hover:underline">LINE</Link> · <Link to="/agent/addin" className="font-medium text-brand-700 hover:underline">Office Add-in</Link></p>
      </section>

      {personal.schedules.length > 0 && (
        <section aria-label="ตั้งเวลา" className="space-y-2">
          <h2 className="text-sm font-medium text-slate-800">ตั้งเวลา ({personal.schedules.length})</h2>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-4">
            {personal.schedules.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm text-slate-700">
                <CalendarClock className="size-4 shrink-0 text-slate-400" aria-hidden />
                <span className="min-w-0">{state.agents.find((a) => a.id === s.agentId)?.name} · {s.when} · ครอบ{s.covers}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-slate-500">
        อยากให้ถามใหม่ตั้งแต่ต้น <Link to="/agent/setup" className="font-medium text-brand-700 hover:underline">ตั้งค่าใหม่</Link>
      </p>
    </div>
  )
}
