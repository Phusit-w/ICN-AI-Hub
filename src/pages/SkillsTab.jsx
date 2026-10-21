import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Plus, Puzzle } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { SKILL_CATEGORIES } from '../data/skills'
import { toolById, userById } from '../data/catalog'
import { EmptyState } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { Rating, ShareBadge } from '../components/ui/Badge'
import { ChoiceCard, SearchInput, Segmented } from '../components/ui/Form'
import { Modal } from '../components/ui/Overlay'
import SkillCard from '../components/skills/SkillCard'
import EntityIcon from '../components/agents/EntityIcon'

function AttachModal({ skill, onClose }) {
  const { state, actions } = useStore()
  const already = state.agents.filter((a) => a.skills.includes(skill.id)).map((a) => a.id)
  const [picked, setPicked] = useState([])
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const save = () => {
    actions.attachSkill(skill.id, picked)
    actions.toast(`เพิ่ม ${skill.name} ให้ ${picked.length} Agents แล้ว`)
    onClose()
  }
  return (
    <Modal
      open onClose={onClose} title={`เพิ่ม “${skill.name}” ให้ Agent`} subtitle="Skill เดียวใช้ได้กับหลาย Agent — อัปเดต Skill ครั้งเดียว ทุก Agent ได้ผลทันที"
      footer={<><Button variant="ghost" onClick={onClose}>ยกเลิก</Button><Button variant="primary" onClick={save} disabled={!picked.length}>เพิ่มให้ {picked.length || ''} Agents</Button></>}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {state.agents.map((a) => {
          const has = already.includes(a.id)
          return (
            <div key={a.id} className={has ? 'pointer-events-none opacity-50' : undefined}>
              <ChoiceCard multi selected={has || picked.includes(a.id)} onClick={() => toggle(a.id)} title={a.name} description={has ? 'มี Skill นี้แล้ว' : a.description} />
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

function SkillDetail({ skill, onClose, onAttach }) {
  const { state } = useStore()
  const usedBy = state.agents.filter((a) => a.skills.includes(skill.id))
  return (
    <Modal open wide onClose={onClose} title={skill.name} subtitle={skill.purpose}
      footer={<><Button variant="ghost" onClick={onClose}>ปิด</Button><Button variant="primary" icon={Plus} onClick={onAttach}>เพิ่มให้ผู้ช่วย</Button></>}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Badge>{skill.category}</Badge><ShareBadge share={skill.share} /><Rating value={skill.rating} /><span>v{skill.version}</span><span>by {userById(skill.owner).name}</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-lg border border-slate-200 p-3"><p className="text-[11px] font-medium uppercase text-slate-400">Input</p><p className="mt-1 text-sm text-slate-700">{skill.input}</p></div>
        <ArrowRight className="mx-auto size-4 rotate-90 text-slate-400 sm:rotate-0" aria-hidden />
        <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-3"><p className="text-[11px] font-medium uppercase text-brand-500">Expected output</p><p className="mt-1 text-sm text-slate-700">{skill.output}</p></div>
      </div>
      <div className="mt-5">
        <p className="text-xs font-medium text-slate-500">Instruction</p>
        <p className="mt-1 rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-600">{skill.instruction}</p>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-slate-500">Tools & Template</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skill.tools.map((t) => <Badge key={t} tone="outline">{toolById(t).name}</Badge>)}
            {skill.template && <Badge tone="brand">{skill.template}</Badge>}
            {!skill.tools.length && !skill.template && <span className="text-sm text-slate-400">—</span>}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">ใช้อยู่ใน {usedBy.length} Agents</p>
          <ul className="mt-2 space-y-1.5">
            {usedBy.map((a) => (
              <li key={a.id}><Link to={`/agents/${a.id}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-700"><EntityIcon icon={a.kind} size="sm" />{a.name}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      {skill.versions.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500">Version history</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {skill.versions.map((v) => <li key={v.v} className="text-slate-600"><b className="text-slate-800">v{v.v}</b> · {v.date} — {v.note}</li>)}
          </ul>
        </div>
      )}
    </Modal>
  )
}

/** The "ทักษะ" tab of the Agents page. `?open=<skill id>` opens a Skill's detail, so it can be linked. */
export default function SkillsTab() {
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [attachId, setAttachId] = useState(null)
  const openId = params.get('open')
  const openSkill = (id) => setParams(id ? { tab: 'skills', open: id } : { tab: 'skills' })

  const term = q.trim().toLowerCase()
  const list = state.skills
    .filter((s) => cat === 'all' || s.category === cat)
    .filter((s) => !term || `${s.name} ${s.purpose}`.toLowerCase().includes(term))
  const usedBy = (id) => state.agents.filter((a) => a.skills.includes(id)).length
  const open = state.skills.find((s) => s.id === openId)
  const attach = state.skills.find((s) => s.id === attachId)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">คลังทักษะ</h1>
          <p className="mt-1 text-sm text-slate-500">Skill คือความสามารถย่อยที่ใช้ซ้ำได้ เช่น รูปแบบรายงานบริษัท หรือการคำนวณราคา ใส่ให้หลายผู้ช่วยได้ ทั้งบริษัทจึงทำงานมาตรฐานเดียวกัน</p>
        </div>
        <Button variant="primary" icon={Plus} to="/skills/new" className="shrink-0 self-start">สร้างทักษะใหม่</Button>
      </div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput placeholder="ค้นหา Skill…" value={q} onChange={(e) => setQ(e.target.value)} className="lg:w-80" aria-label="ค้นหา Skill" />
        <Segmented
          value={cat} onChange={setCat} className="lg:ml-auto"
          options={[{ value: 'all', label: 'ทั้งหมด', count: state.skills.length }, ...SKILL_CATEGORIES.map((c) => ({ value: c, label: c }))]}
        />
      </div>
      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => (
            <SkillCard key={s.id} skill={s} usedBy={usedBy(s.id)} onOpen={() => openSkill(s.id)} onAttach={() => setAttachId(s.id)} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Puzzle} title="ไม่พบ Skill" action={<Button to="/skills/new" icon={Plus}>สร้าง Skill</Button>}>ลองค้นด้วยคำอื่น หรือสร้าง Skill ใหม่ให้ทีม</EmptyState>
      )}
      {open && <SkillDetail skill={open} onClose={() => openSkill(null)} onAttach={() => { openSkill(null); setAttachId(open.id) }} />}
      {attach && <AttachModal skill={attach} onClose={() => setAttachId(null)} />}
    </div>
  )
}
