import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Copy, FileUp, Lock, Rocket, X } from 'lucide-react'
import { isAdminView, useStore } from '../store/AppStore'
import { DATA_CLASSES, DEPARTMENTS, KNOWLEDGE, MODELS, OUTPUT_FORMATS, TOOLS } from '../data/catalog'
import { cn } from '../lib/utils'
import { agentFromForm, BLANK_FORM, draftForm, formFromAgent, INSTRUCTION_STARTERS } from '../lib/agentDraft'
import { Card, PageHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { ModelBadge, ShareBadge, DeptBadge } from '../components/ui/Badge'
import { ChoiceCard, Field, Input, SearchInput, Select, ShareChoice, Textarea, Toggle } from '../components/ui/Form'
import EntityIcon from '../components/agents/EntityIcon'
import QuickCreate from '../components/ui/QuickCreate'

const STEPS = ['ข้อมูลพื้นฐาน', 'คำสั่งการทำงาน', 'Model & ข้อมูล', 'Knowledge & Skills', 'Tools & Output', 'การแชร์']
const KINDS = ['research', 'document', 'sales', 'hr', 'it', 'accounting', 'data', 'image', 'review', 'coding']

/**
 * Default way to create an agent: describe it in one box, the AI fills everything in,
 * the user checks name, description, skills and sharing, then creates. Everything else lives in the wizard.
 */
function QuickCreateAgent({ initial, initialForm, onCreate, onAdvanced }) {
  const { state } = useStore()
  const [form, setForm] = useState(() => initialForm ?? (initial.trim() ? draftForm(initial, state.agents) : null))
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  return (
    <QuickCreate
      title="สร้างผู้ช่วย AI ของคุณ" subtitle="บอกว่าอยากได้ผู้ช่วยแบบไหน AI จะกรอกรายละเอียดให้ คุณแค่ตรวจแล้วกดสร้าง"
      describeLabel="อยากได้ผู้ช่วยแบบไหน" placeholder="เช่น ช่วยร่างอีเมลตอบลูกค้าที่ร้องเรียนเรื่องส่งของช้า ให้สุภาพและเสนอทางแก้"
      initial={initial} drafted={!!form} onFill={(text) => setForm(draftForm(text, state.agents))}
      createLabel="สร้างผู้ช่วย" canCreate={!!form?.name.trim() && !!form?.description.trim()}
      onCreate={() => onCreate(form)} onAdvanced={onAdvanced && (() => onAdvanced(form))}
    >
      {form && (
        <>
          <div className="flex items-start gap-3">
            <EntityIcon icon={form.kind} size="lg" />
            <div className="min-w-0 flex-1 space-y-3">
              <Field label="ชื่อ" htmlFor="q-name"><Input id="q-name" value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
              <Field label="ทำอะไร" htmlFor="q-desc"><Textarea id="q-desc" rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} /></Field>
            </div>
          </div>
          <Field label={`ทักษะ (${form.skills.length})`} hint={`${form.based ? `เริ่มจาก ${form.based} — ` : ''}กด × เพื่อเอาทักษะที่ไม่ต้องการออก`}>
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map((id) => {
                const sk = state.skills.find((x) => x.id === id)
                return (
                  <span key={id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pr-1 pl-2.5 text-xs text-slate-700">
                    {sk?.name ?? id}
                    <button type="button" onClick={() => set({ skills: form.skills.filter((x) => x !== id) })} aria-label={`เอา ${sk?.name ?? id} ออก`} className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="size-3" /></button>
                  </span>
                )
              })}
              {form.skills.length === 0 && <span className="text-xs text-slate-400">{onAdvanced ? 'ไม่มี — เพิ่มได้ในตั้งค่าขั้นสูง' : 'ไม่มี'}</span>}
            </div>
          </Field>
          <ShareChoice value={form.share} onChange={(share) => set({ share })} companyNeedsApproval={!isAdminView(state)} />
        </>
      )}
    </QuickCreate>
  )
}

const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

export default function CreateAgent() {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const source = state.agents.find((a) => a.id === params.get('from'))
  const [form, setForm] = useState(() => (source ? { ...formFromAgent(source), name: `${source.name} (Copy)` } : BLANK_FORM))
  // Copying an agent goes straight to the full wizard; a new agent starts from the one-page flow.
  const [quick, setQuick] = useState(!source && params.get('advanced') !== '1')
  const [step, setStep] = useState(0)
  const [skillQuery, setSkillQuery] = useState('')
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const confidential = form.classification === 'confidential'
  const valid = [form.name.trim() && form.description.trim(), form.instruction.trim(), true, true, true, true]
  const canFinish = valid.every(Boolean)
  const skillList = useMemo(() => state.skills.filter((s) => s.name.toLowerCase().includes(skillQuery.toLowerCase())), [state.skills, skillQuery])

  const create = (f = form) => {
    const agent = agentFromForm(f, { owner: state.userId, note: source ? `Clone จาก ${source.name}` : 'สร้างใหม่', forkedFrom: source?.name })
    const saved = actions.addAgent(agent)
    actions.toast(`สร้าง ${agent.name} แล้ว${saved.share !== agent.share ? ' — ส่งคำขอแชร์ทั้งบริษัทให้แอดมินแล้ว ระหว่างนี้แชร์ในแผนกก่อน' : ''}`)
    navigate(`/agents/${agent.id}`)
  }

  // The step-by-step form is Admin-only; in the User view every way in (a copy, `?advanced=1`) uses quick create.
  if (!isAdminView(state)) {
    return <QuickCreateAgent initial={params.get('q') ?? ''} initialForm={source && form} onCreate={create} />
  }
  if (quick) {
    return <QuickCreateAgent initial={params.get('q') ?? ''} onCreate={create} onAdvanced={(f) => { setForm(f); setQuick(false) }} />
  }

  return (
    <div>
      <PageHeader
        eyebrow={source ? 'Clone agent' : 'Create'} title={source ? `คัดลอก “${source.name}”` : 'สร้างผู้ช่วย AI ใหม่'}
        subtitle="ทำทีละขั้น ไม่ต้องเขียนโค้ด — ทุกช่องมีคำอธิบาย และดูตัวอย่าง Agent ของคุณได้ทางขวา"
        actions={<Button variant="ghost" onClick={() => navigate(-1)}>ยกเลิก</Button>}
      />
      {source && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
          <Copy className="size-4" /> คัดลอกการตั้งค่าทั้งหมดจาก {source.name} แล้ว — ปรับเฉพาะส่วนที่ต้องการ แล้วกดสร้าง
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <nav aria-label="ขั้นตอน" className="xl:sticky xl:top-24 xl:self-start">
          <ol className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:gap-1">
            {STEPS.map((label, i) => (
              <li key={label} className="shrink-0">
                <button
                  type="button" onClick={() => setStep(i)} aria-current={step === i ? 'step' : undefined}
                  className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition', step === i ? 'bg-white font-medium text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800')}
                >
                  <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold', i < step && valid[i] ? 'bg-emerald-500 text-white' : step === i ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500')}>
                    {i < step && valid[i] ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900">{step + 1}. {STEPS[step]}</h2>
          <div className="mt-5 space-y-5">
            {step === 0 && (
              <>
                <Field label="ชื่อ Agent" required hint="ตั้งชื่อให้เพื่อนร่วมงานเข้าใจทันทีว่าใช้ทำอะไร" htmlFor="name">
                  <Input id="name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="เช่น Sales Proposal Agent" />
                </Field>
                <Field label="คำอธิบาย" required hint="1–2 ประโยค: Agent นี้ช่วยใคร ทำอะไร" htmlFor="desc">
                  <Textarea id="desc" rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="เช่น วิเคราะห์ Requirement ลูกค้าและร่าง Proposal ตาม Template ฝ่ายขาย" />
                </Field>
                <Field label="แผนก">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {DEPARTMENTS.map((d) => (
                      <button key={d.id} type="button" onClick={() => set({ dept: d.id })} className={cn('rounded-lg border px-3 py-2 text-sm transition', form.dept === d.id ? 'border-brand-500 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>{d.name}</button>
                    ))}
                  </div>
                </Field>
                <Field label="ไอคอน">
                  <div className="flex flex-wrap gap-2">
                    {KINDS.map((k) => (
                      <button key={k} type="button" onClick={() => set({ kind: k })} aria-label={k} aria-pressed={form.kind === k} className={cn('rounded-xl p-0.5 transition', form.kind === k ? 'ring-2 ring-brand-500' : 'opacity-60 hover:opacity-100')}>
                        <EntityIcon icon={k} />
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <div className="rounded-lg bg-slate-50 p-4 text-[13px] leading-relaxed text-slate-600">
                  <p className="font-medium text-slate-800">เขียนเหมือนกำลังสอนงานพนักงานใหม่</p>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                    <li>Agent นี้คือใคร ทำหน้าที่อะไร</li>
                    <li>ต้องทำอะไรเสมอ (เช่น อ้างอิงแหล่งที่มา)</li>
                    <li>ห้ามทำอะไร (เช่น ห้ามเปิดเผยข้อมูลลูกค้า)</li>
                  </ul>
                </div>
                <Field label="Instruction / System prompt" required htmlFor="ins">
                  <Textarea id="ins" rows={9} value={form.instruction} onChange={(e) => set({ instruction: e.target.value })} className="font-mono text-[13px]" placeholder="คุณคือ…" />
                </Field>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">เริ่มจากตัวอย่าง:</span>
                  {Object.keys(INSTRUCTION_STARTERS).map((k) => (
                    <Button key={k} size="sm" variant="subtle" onClick={() => set({ instruction: INSTRUCTION_STARTERS[k] })}>{DEPARTMENTS.find((d) => d.id === k).name}</Button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="ระดับความลับของข้อมูลที่ Agent จะเห็น" hint="ระบบจะเลือกที่ประมวลผลให้ปลอดภัยตามระดับนี้">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {DATA_CLASSES.map((c) => (
                      <ChoiceCard key={c.id} selected={form.classification === c.id} title={c.name} description={c.th}
                        onClick={() => set({ classification: c.id, model: c.id === 'confidential' && MODELS.find((m) => m.id === form.model).location === 'cloud' ? 'icn-llama' : form.model })} />
                    ))}
                  </div>
                </Field>
                <Field label="Model" hint="Knowledge, Skill และ Workflow ไม่ผูกกับ Model — เปลี่ยนภายหลังได้ทุกเมื่อ">
                  <div className="grid gap-2 md:grid-cols-2">
                    {MODELS.filter((m) => m.id !== 'icn-image' || form.kind === 'image').map((m) => {
                      const blocked = confidential && m.location === 'cloud'
                      return (
                        <div key={m.id} className={cn(blocked && 'pointer-events-none opacity-40')} title={blocked ? 'ข้อมูลลับใช้ Cloud ไม่ได้' : undefined}>
                          <ChoiceCard selected={form.model === m.id} onClick={() => set({ model: m.id })} title={m.name} aside={<ModelBadge modelId={m.id} showName={false} />} description={`${m.provider} — ${m.note}`} />
                        </div>
                      )
                    })}
                  </div>
                </Field>
                {confidential && <p className="flex items-center gap-2 text-xs text-emerald-700"><Lock className="size-3.5" /> ข้อมูลลับ: ปิดตัวเลือก Cloud AI ตามนโยบายบริษัทแล้ว</p>}
              </>
            )}

            {step === 3 && (
              <>
                <Field label="Knowledge — เอกสารที่ Agent ใช้อ้างอิง" hint="เลือกจากคลังความรู้ของบริษัท หรืออัปโหลดไฟล์ใหม่">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {KNOWLEDGE.map((k) => (
                      <ChoiceCard key={k.id} multi selected={form.knowledge.includes(k.id)} onClick={() => set({ knowledge: toggleIn(form.knowledge, k.id) })} title={k.name} description={`${k.type} · ${k.size}`} />
                    ))}
                  </div>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-700">
                    <FileUp className="size-4" /> อัปโหลดไฟล์ (PDF, Word, Excel)
                    <input type="file" multiple className="sr-only" onChange={(e) => set({ uploads: [...form.uploads, ...Array.from(e.target.files).map((f) => f.name)] })} />
                  </label>
                  {form.uploads.length > 0 && <div className="flex flex-wrap gap-1.5">{form.uploads.map((u) => <Badge key={u} tone="brand">{u}</Badge>)}</div>}
                </Field>
                <Field label={`Skills — ความสามารถย่อยที่ใช้ซ้ำได้ (${form.skills.length} เลือกแล้ว)`} hint="Skill ถูกสร้างและดูแลโดยเพื่อนร่วมงาน อัปเดตที่เดียว ทุก Agent ได้ประโยชน์">
                  <SearchInput placeholder="ค้นหา Skill…" value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} aria-label="ค้นหา Skill" />
                  <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {skillList.map((s) => (
                      <ChoiceCard key={s.id} multi selected={form.skills.includes(s.id)} onClick={() => set({ skills: toggleIn(form.skills, s.id) })} title={s.name} description={s.purpose} />
                    ))}
                  </div>
                </Field>
              </>
            )}

            {step === 4 && (
              <>
                <Field label="Tools — ระบบที่ Agent เข้าถึงได้" hint="เปิดเท่าที่จำเป็น การเชื่อมระบบภายในต้องได้รับอนุญาตจาก Department Admin">
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {TOOLS.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <div><div className="text-sm font-medium text-slate-800">{t.name}</div><div className="text-xs text-slate-500">{t.desc}</div></div>
                        <Toggle checked={form.tools.includes(t.id)} onChange={() => set({ tools: toggleIn(form.tools, t.id) })} label={t.name} />
                      </div>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="รูปแบบผลลัพธ์">
                    <Select value={form.format} onChange={(e) => set({ format: e.target.value })}>{OUTPUT_FORMATS.map((f) => <option key={f}>{f}</option>)}</Select>
                  </Field>
                  <Field label="ภาษา">
                    <Select value={form.language} onChange={(e) => set({ language: e.target.value })}><option value="TH">ไทย</option><option value="EN">English</option><option value="Multi">ตามต้นฉบับ</option></Select>
                  </Field>
                  <Field label="Template">
                    <Input value={form.template} onChange={(e) => set({ template: e.target.value })} placeholder="เช่น Sales Proposal v3" />
                  </Field>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <ShareChoice label="แชร์ให้ใครใช้ได้บ้าง" value={form.share} onChange={(share) => set({ share })} />
                <Field label="ใครแก้ไข Agent นี้ได้">
                  <Select value={form.editors} onChange={(e) => set({ editors: e.target.value })}>
                    <option value="me">เฉพาะฉัน</option><option value="admin">ฉัน + แอดมิน</option><option value="team">ทุกคนในแผนก</option>
                  </Select>
                </Field>
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)} disabled={step === 0}>ย้อนกลับ</Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!valid[step]}>ถัดไป <ArrowRight className="size-4" /></Button>
            ) : (
              <Button variant="primary" icon={Rocket} onClick={() => create()} disabled={!canFinish}>{source ? 'สร้างสำเนา' : 'สร้างผู้ช่วย'}</Button>
            )}
          </div>
        </Card>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Preview</p>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <EntityIcon icon={form.kind} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{form.name || 'ชื่อ Agent'}</div>
                <DeptBadge dept={form.dept} />
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{form.description || 'คำอธิบายจะแสดงที่นี่'}</p>
            <div className="mt-3 flex flex-wrap gap-1.5"><ModelBadge modelId={form.model} /><ShareBadge share={form.share} /></div>
            <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs">
              {[['Skills', form.skills.length], ['Knowledge', form.knowledge.length + form.uploads.length], ['Tools', form.tools.length], ['Output', `${form.format} · ${form.language}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-700">{v}</dd></div>
              ))}
            </dl>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-slate-700">ความพร้อม</p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {[['ตั้งชื่อและคำอธิบาย', valid[0]], ['เขียนคำสั่งการทำงาน', valid[1]], ['เลือก Skill อย่างน้อย 1 ตัว (แนะนำ)', form.skills.length > 0]].map(([t, ok]) => (
                <li key={t} className={cn('flex items-center gap-2', ok ? 'text-emerald-700' : 'text-slate-400')}><Check className="size-3.5" />{t}</li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  )
}
