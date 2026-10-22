import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { Field } from '../ui/Form'
import Menu from '../ui/Menu'
import { Modal } from '../ui/Overlay'
import QuickCreateSkill, { useSaveSkill } from '../skills/QuickCreateSkill'

const NEW_SKILL = '＋ สร้างทักษะใหม่'

/**
 * The builder's "ทักษะ" section: Skills are picked while building an Agent, with no Skills page or tab (spec story 40).
 * "＋ เพิ่มทักษะ" lists the Skills not picked yet and ends with "สร้างทักษะใหม่", which creates one in a dialog
 * and adds it here, so the draft Agent is never left.
 */
export default function SkillsField({ skills, onChange }) {
  const { state } = useStore()
  const saveSkill = useSaveSkill()
  const [creating, setCreating] = useState(false)
  const offered = state.skills.filter((s) => !skills.includes(s.id))

  return (
    <Field label={`ทักษะ (${skills.length})`} hint="ความสามารถย่อยที่ใช้ซ้ำได้ เช่น รูปแบบรายงานบริษัท หรือการคำนวณราคา">
      <div className="flex flex-wrap items-center gap-1.5">
        {skills.map((id) => {
          const name = state.skills.find((s) => s.id === id)?.name ?? id
          return (
            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pr-1 pl-2.5 text-xs text-slate-700">
              {name}
              <button type="button" onClick={() => onChange(skills.filter((x) => x !== id))} aria-label={`เอา ${name} ออก`} className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="size-3" /></button>
            </span>
          )
        })}
        <Menu
          label="เพิ่มทักษะ"
          items={[...offered.map((s) => ({ label: s.name, onSelect: () => onChange([...skills, s.id]) })), { label: NEW_SKILL, onSelect: () => setCreating(true) }]}
          triggerClassName="flex h-7 items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 text-xs text-slate-500 hover:border-brand-400 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none"
        >
          <Plus className="size-3.5" /> เพิ่มทักษะ
        </Menu>
      </div>
      <Modal open={creating} onClose={() => setCreating(false)} title="สร้างทักษะใหม่" subtitle="บอกว่าอยากให้ทักษะนี้ทำอะไร AI จะกรอกให้ แล้วทักษะใหม่จะถูกใส่ให้ Agent ตัวนี้">
        <QuickCreateSkill onCreate={(form) => { onChange([...skills, saveSkill(form).id]); setCreating(false) }} />
      </Modal>
    </Field>
  )
}
