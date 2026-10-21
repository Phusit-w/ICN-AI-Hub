import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, FileUp, FlaskConical, LoaderCircle, Rocket } from 'lucide-react'
import { isAdminView, useStore } from '../store/AppStore'
import { SKILL_CATEGORIES } from '../data/skills'
import { TOOLS } from '../data/catalog'
import { skillLink } from '../lib/routes'
import { BLANK_SKILL_FORM, draftSkillForm, skillFromForm } from '../lib/skillDraft'
import { Card, CardHeader, PageHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Field, Input, Select, ShareChoice, Textarea, Toggle } from '../components/ui/Form'
import QuickCreate from '../components/ui/QuickCreate'
import EntityIcon from '../components/agents/EntityIcon'

const ICONS = ['file', 'globe', 'chart', 'check', 'shield', 'target', 'calculator', 'book', 'image', 'ticket']

/**
 * Default way to create a skill, the same as an agent: describe it in one box, the AI fills it in,
 * the user checks name, purpose and sharing, then creates. Every other field lives in the advanced form.
 */
function QuickCreateSkill({ initial, onCreate, onAdvanced }) {
  const { state } = useStore()
  const [form, setForm] = useState(() => (initial.trim() ? draftSkillForm(initial, state.skills) : null))
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  return (
    <QuickCreate
      title="สร้างทักษะใหม่" subtitle="บอกว่าอยากให้ทักษะนี้ทำอะไร AI จะกรอกรายละเอียดให้ คุณแค่ตรวจแล้วกดสร้าง"
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

export default function CreateSkill() {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [quick, setQuick] = useState(params.get('advanced') !== '1')
  const [f, setF] = useState(BLANK_SKILL_FORM)
  const [test, setTest] = useState('idle')
  const set = (patch) => setF((x) => ({ ...x, ...patch }))
  const valid = f.name.trim() && f.purpose.trim() && f.instruction.trim()

  const runTest = () => {
    setTest('running')
    setTimeout(() => setTest('done'), 1600)
  }
  const create = (form = f) => {
    const skill = skillFromForm(form, { owner: state.userId })
    const saved = actions.addSkill(skill)
    actions.toast(`สร้าง Skill “${skill.name}” แล้ว — ${saved.share !== skill.share ? 'ส่งคำขอแชร์ทั้งบริษัทให้แอดมินแล้ว ระหว่างนี้แชร์ในแผนกก่อน' : 'นำไปใส่ใน Agent ได้เลย'}`)
    navigate(skillLink(skill.id))
  }

  // The full form is Admin-only; in the User view `?advanced=1` uses quick create, with no way into the full form.
  if (!isAdminView(state)) {
    return <QuickCreateSkill initial={params.get('q') ?? ''} onCreate={create} />
  }
  if (quick) {
    return <QuickCreateSkill initial={params.get('q') ?? ''} onCreate={create} onAdvanced={(form) => { setF(form); setQuick(false) }} />
  }

  return (
    <div>
      <PageHeader
        eyebrow="Create" title="สร้าง Skill ใหม่"
        subtitle="บันทึกวิธีทำงานที่ดีที่สุดของทีมเป็น Skill — Agent ทุกตัวที่ใช้ Skill นี้จะทำงานตามมาตรฐานเดียวกัน"
        actions={<><Button variant="ghost" onClick={() => navigate(-1)}>ยกเลิก</Button><Button variant="primary" icon={Rocket} onClick={() => create()} disabled={!valid}>สร้างทักษะ</Button></>}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="1. Skill นี้คืออะไร" />
            <div className="grid gap-5 px-5 pb-5 md:grid-cols-2">
              <Field label="ชื่อ Skill" required htmlFor="sn"><Input id="sn" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="เช่น Proposal Template Skill" /></Field>
              <Field label="หมวดหมู่"><Select value={f.category} onChange={(e) => set({ category: e.target.value })}>{SKILL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <div className="md:col-span-2">
                <Field label="Purpose — ช่วยแก้ปัญหาอะไร" required htmlFor="sp"><Textarea id="sp" rows={2} value={f.purpose} onChange={(e) => set({ purpose: e.target.value })} placeholder="เช่น ทำให้ทุก Proposal มีโครงสร้างเดียวกันตามมาตรฐานฝ่ายขาย" /></Field>
              </div>
              <div className="md:col-span-2">
                <Field label="ไอคอน">
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((i) => (
                      <button key={i} type="button" onClick={() => set({ icon: i })} aria-label={i} aria-pressed={f.icon === i} className={f.icon === i ? 'rounded-xl ring-2 ring-brand-500' : 'rounded-xl opacity-60 hover:opacity-100'}>
                        <EntityIcon icon={i} tone="skill" />
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="2. ทำงานอย่างไร" subtitle="อธิบายขั้นตอนให้ชัด เหมือนเขียนคู่มือการทำงาน" />
            <div className="space-y-5 px-5 pb-5">
              <Field label="Instruction" required htmlFor="si"><Textarea id="si" rows={6} className="font-mono text-[13px]" value={f.instruction} onChange={(e) => set({ instruction: e.target.value })} placeholder={'1. อ่าน Requirement ของลูกค้า\n2. จัดหัวข้อตาม Template: Understanding, Solution, Timeline, Pricing\n3. ...'} /></Field>
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
                <Field label="Input — Skill ต้องการอะไร"><Textarea rows={3} value={f.input} onChange={(e) => set({ input: e.target.value })} placeholder="เช่น Requirement ลูกค้า + Solution ที่เลือก" /></Field>
                <ArrowRight className="mx-auto mb-8 hidden size-5 text-slate-300 md:block" aria-hidden />
                <Field label="Expected output — ได้อะไรออกมา"><Textarea rows={3} value={f.output} onChange={(e) => set({ output: e.target.value })} placeholder="เช่น Proposal .docx 6 หัวข้อ" /></Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="3. Tools & Template" />
            <div className="space-y-5 px-5 pb-5">
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {TOOLS.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-sm text-slate-700">{t.name}</span>
                    <Toggle checked={f.tools.includes(t.id)} onChange={() => set({ tools: f.tools.includes(t.id) ? f.tools.filter((x) => x !== t.id) : [...f.tools, t.id] })} label={t.name} />
                  </div>
                ))}
              </div>
              <Field label="Template file" hint="ไฟล์ต้นแบบที่ Skill ใช้จัดรูปแบบผลลัพธ์">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 hover:border-brand-400">
                  <FileUp className="size-4" /> {f.template || 'เลือกไฟล์ .docx / .pptx / .xlsx'}
                  <input type="file" className="sr-only" onChange={(e) => set({ template: e.target.files[0]?.name ?? '' })} />
                </label>
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <ShareChoice label="4. ใครใช้ได้บ้าง" value={f.share} onChange={(share) => set({ share })} />
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <EntityIcon icon={f.icon} tone="skill" />
              <div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-900">{f.name || 'ชื่อ Skill'}</div><Badge>{f.category}</Badge></div>
            </div>
            <p className="mt-3 text-[13px] text-slate-600">{f.purpose || 'Purpose จะแสดงที่นี่'}</p>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-800"><FlaskConical className="size-4 text-brand-600" /> ทดลอง Skill</p>
            <p className="mt-1 text-xs text-slate-500">ลองรันกับข้อมูลตัวอย่างก่อนแชร์ (จำลอง)</p>
            <Button size="sm" className="mt-3 w-full justify-center" onClick={runTest} disabled={!valid || test === 'running'}>
              {test === 'running' ? <><LoaderCircle className="size-4 animate-spin" /> กำลังทดลอง…</> : 'Run test'}
            </Button>
            {test === 'done' && (
              <div className="rise mt-3 rounded-lg bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
                ✓ ผลลัพธ์ตรงกับ Expected output<br />✓ ใช้เวลา 3.2 วินาที · ICN Llama 70B (Local)<br />✓ ไม่พบข้อมูลส่วนบุคคล
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}
