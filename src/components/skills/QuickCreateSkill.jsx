import { useState } from 'react'
import { isAdminView, useStore } from '../../store/AppStore'
import { draftSkillForm, skillFromForm } from '../../lib/skillDraft'
import { Field, Input, ShareChoice, Textarea } from '../ui/Form'
import QuickCreate from '../ui/QuickCreate'
import EntityIcon from '../agents/EntityIcon'

/** Saves a Skill form as a new Skill owned by the current user, says so, and returns the Skill. */
export function useSaveSkill() {
  const { state, actions } = useStore()
  return (form) => {
    const skill = skillFromForm(form, { owner: state.userId })
    const saved = actions.addSkill(skill)
    actions.toast(`สร้าง Skill “${skill.name}” แล้ว — ${saved.share !== skill.share ? 'ส่งคำขอแชร์ทั้งบริษัทให้แอดมินแล้ว ระหว่างนี้แชร์ในแผนกก่อน' : 'นำไปใส่ใน Agent ได้เลย'}`)
    return skill
  }
}

/**
 * Default way to create a skill, the same as an agent: describe it in one box, the AI fills it in,
 * the user checks name, purpose and sharing, then creates. Every other field lives in the advanced form.
 * Without `title` it fits inside a dialog (the Agent form's Skill picker).
 */
export default function QuickCreateSkill({ initial = '', title, onCreate, onAdvanced }) {
  const { state } = useStore()
  const [form, setForm] = useState(() => (initial.trim() ? draftSkillForm(initial, state.skills) : null))
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  return (
    <QuickCreate
      title={title} subtitle={title && 'บอกว่าอยากให้ทักษะนี้ทำอะไร AI จะกรอกรายละเอียดให้ คุณแค่ตรวจแล้วกดสร้าง'}
      describeLabel="อยากได้ทักษะแบบไหน" placeholder="เช่น สรุปสัญญาเช่าให้เหลือ 1 หน้า พร้อมจุดที่ต้องระวัง"
      initial={initial} drafted={!!form} onFill={(text) => setForm(draftSkillForm(text, state.skills))}
      createLabel="สร้างทักษะ" canCreate={!!form?.name.trim() && !!form?.purpose.trim()}
      onCreate={() => onCreate(form)} onAdvanced={onAdvanced && (() => onAdvanced(form))}
    >
      {form && (
        <>
          <div className="flex items-start gap-3">
            <EntityIcon icon={form.icon} tone="skill" size="lg" />
            <div className="min-w-0 flex-1 space-y-3">
              <Field label="ชื่อ" htmlFor="q-name"><Input id="q-name" value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
              <Field label="ทำอะไร" htmlFor="q-purpose" hint={form.based && `เริ่มจาก ${form.based}${onAdvanced ? ' — ปรับขั้นตอนการทำงานได้ในตั้งค่าขั้นสูง' : ''}`}>
                <Textarea id="q-purpose" rows={2} value={form.purpose} onChange={(e) => set({ purpose: e.target.value })} />
              </Field>
            </div>
          </div>
          <ShareChoice value={form.share} onChange={(share) => set({ share })} companyNeedsApproval={!isAdminView(state)} />
        </>
      )}
    </QuickCreate>
  )
}
