import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { isAwaitingCompanyShare, useStore } from '../../store/AppStore'
import { toolById, userById } from '../../data/catalog'
import Button from '../ui/Button'
import Badge, { ShareBadge } from '../ui/Badge'
import { ChoiceCard } from '../ui/Form'
import { Modal } from '../ui/Overlay'
import EntityIcon from '../agents/EntityIcon'

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
        <Badge>{skill.category}</Badge><ShareBadge share={skill.share} awaiting={isAwaitingCompanyShare(state, 'skill', skill.id)} /><span>v{skill.version}</span><span>by {userById(skill.owner).name}</span>
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

/**
 * A Skill's detail, opened over the Agents page by `?skill=<id>` so it can be linked (search results, Agent detail,
 * old Skills links). "เพิ่มให้ผู้ช่วย" moves on to adding the Skill to several Agents. Closing drops the parameter.
 */
export default function SkillDialog() {
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const [attachId, setAttachId] = useState(null)
  const open = state.skills.find((s) => s.id === params.get('skill'))
  const attach = state.skills.find((s) => s.id === attachId)
  const close = () => setParams((p) => { p.delete('skill'); return p })

  return (
    <>
      {open && <SkillDetail skill={open} onClose={close} onAttach={() => { close(); setAttachId(open.id) }} />}
      {attach && <AttachModal skill={attach} onClose={() => setAttachId(null)} />}
    </>
  )
}
