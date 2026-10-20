import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, FileText, History, Lock, Play, Workflow, Wrench, BookOpen, Puzzle } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { DATA_CLASSES, deptById, knowledgeById, modelById, toolById, userById } from '../data/catalog'
import { fmt } from '../lib/utils'
import { Card, CardHeader, EmptyState } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { DeptBadge, ModelBadge, Rating, ShareBadge } from '../components/ui/Badge'
import EntityIcon from '../components/agents/EntityIcon'
import { FavoriteButton } from '../components/agents/AgentCard'
import { Avatar } from '../components/ui/Overlay'

function Section({ title, icon, children, action }) {
  return (
    <Card>
      <CardHeader title={title} icon={icon} action={action} />
      <div className="px-5 pb-5">{children}</div>
    </Card>
  )
}

export default function AgentDetail() {
  const { id } = useParams()
  const { state } = useStore()
  const agent = state.agents.find((a) => a.id === id)
  if (!agent) {
    return <EmptyState title="ไม่พบผู้ช่วยนี้" action={<Button to="/agents">กลับไป Agent Library</Button>} />
  }
  const model = modelById(agent.model)
  const owner = userById(agent.owner)
  const skills = agent.skills.map((s) => state.skills.find((x) => x.id === s)).filter(Boolean)
  const workflows = state.workflows.filter((w) => w.nodes.some((n) => n.ref === agent.id))
  const runs = state.runs.filter((r) => r.steps.some((s) => s.agentId === agent.id)).slice(0, 4)
  const classification = DATA_CLASSES.find((c) => c.id === agent.classification)

  return (
    <div className="space-y-6">
      <Link to="/agents" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="size-4" /> คลังผู้ช่วย AI</Link>

      <Card className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <EntityIcon icon={agent.kind} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{agent.name}</h1>
              <Badge tone="outline">v{agent.version}</Badge>
              {agent.forkedFrom && <Badge tone="brand" icon={Copy}>Cloned from {agent.forkedFrom}</Badge>}
            </div>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600">{agent.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <DeptBadge dept={agent.dept} />
              <ShareBadge share={agent.share} />
              <Rating value={agent.rating || 0} />
              <span>{fmt(agent.uses)} ครั้งที่ใช้งาน</span>
              <span className="flex items-center gap-1.5"><Avatar name={owner.name} size="sm" /> {owner.name}</span>
              <span>อัปเดต {agent.updated}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <FavoriteButton id={agent.id} className="border border-slate-200 p-2" />
            <Button icon={Copy} to={`/agents/new?from=${agent.id}`}>คัดลอกไปปรับใช้</Button>
            <Button variant="primary" icon={Play} to={`/workspace?agent=${agent.id}`}>ใช้งาน</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="ผู้ช่วยนี้ทำอะไร" icon={FileText}>
            <p className="text-sm leading-relaxed text-slate-600">{agent.description}</p>
            {agent.examples.length > 0 && (
              <>
                <p className="mt-4 text-xs font-medium text-slate-500">ตัวอย่างคำสั่ง — คลิกเพื่อลองใช้</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {agent.examples.map((ex) => (
                    <Link key={ex} to={`/workspace?q=${encodeURIComponent(ex)}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700">“{ex}”</Link>
                  ))}
                </div>
              </>
            )}
            <details className="group mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <summary className="cursor-pointer text-xs font-medium text-slate-600">Instruction (System prompt)</summary>
              <p className="mt-2 font-mono text-xs leading-relaxed text-slate-600">{agent.instruction}</p>
            </details>
          </Section>

          <Section title="ทักษะที่ใช้" icon={Puzzle} action={<Button size="sm" variant="ghost" to="/skills">คลังทักษะ</Button>}>
            {skills.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {skills.map((s) => (
                  <Link key={s.id} to={`/skills?open=${s.id}`} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 hover:border-slate-300">
                    <EntityIcon icon={s.icon} size="sm" tone="skill" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800">{s.name}</div>
                      <div className="line-clamp-2 text-xs text-slate-500">{s.purpose}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">ยังไม่มี Skill</p>}
          </Section>

          <Section title="สายงานที่ใช้ผู้ช่วยนี้" icon={Workflow}>
            {workflows.length ? (
              <ul className="divide-y divide-slate-100">
                {workflows.map((w) => (
                  <li key={w.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <Link to={`/workflows?id=${w.id}`} className="text-sm font-medium text-slate-800 hover:text-brand-700">{w.name}</Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                        {w.nodes.filter((n) => n.type === 'agent').map((n, i) => {
                          const a = state.agents.find((x) => x.id === n.ref)
                          return <span key={n.id} className={n.ref === agent.id ? 'font-semibold text-brand-700' : ''}>{i > 0 && '→ '}{a?.name.replace(' Agent', '')}</span>
                        })}
                      </div>
                    </div>
                    <DeptBadge dept={w.dept} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">ยังไม่ถูกใช้ใน Workflow ใด</p>}
          </Section>

          {agent.versions.length > 0 && (
            <Section title="ประวัติเวอร์ชัน" icon={History}>
              <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                {agent.versions.map((v) => (
                  <li key={v.v} className="relative">
                    <span className="absolute top-1 -left-[25px] size-2.5 rounded-full border-2 border-white bg-brand-500 ring-1 ring-brand-200" />
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">v{v.v} <span className="text-xs font-normal text-slate-400">{v.date} · {userById(v.by).name}</span></div>
                    <p className="text-sm text-slate-600">{v.note}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section title="Model" icon={Wrench}>
            <ModelBadge modelId={agent.model} />
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{model.provider} — {model.note}</p>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              <span>ระดับข้อมูล: <b>{classification?.name}</b> — {classification?.th}</span>
            </div>
          </Section>

          <Section title="รูปแบบผลลัพธ์" icon={FileText}>
            <dl className="space-y-2 text-sm">
              {[['รูปแบบ', agent.output.format], ['ภาษา', agent.output.language], ['Template', agent.output.template]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="text-right font-medium text-slate-800">{v}</dd></div>
              ))}
            </dl>
          </Section>

          <Section title="เอกสารอ้างอิง" icon={BookOpen}>
            {agent.knowledge.length ? (
              <ul className="space-y-2">
                {agent.knowledge.map((k) => {
                  const kb = knowledgeById(k)
                  return <li key={k} className="flex items-center justify-between gap-2 text-sm"><span className="truncate text-slate-700">{kb.name}</span><Badge>{kb.type}</Badge></li>
                })}
              </ul>
            ) : <p className="text-sm text-slate-500">ไม่มีเอกสารอ้างอิง</p>}
          </Section>

          <Section title="ระบบที่เชื่อมต่อ" icon={Wrench}>
            {agent.tools.length ? (
              <div className="flex flex-wrap gap-1.5">{agent.tools.map((t) => <Badge key={t} tone="outline">{toolById(t).name}</Badge>)}</div>
            ) : <p className="text-sm text-slate-500">ไม่ได้เชื่อมต่อระบบภายนอก</p>}
          </Section>

          {runs.length > 0 && (
            <Section title="งานล่าสุดที่ใช้ผู้ช่วยนี้">
              <ul className="space-y-2">
                {runs.map((r) => <li key={r.id}><Link to={`/workspace?run=${r.id}`} className="block truncate text-sm text-slate-700 hover:text-brand-700">{r.title}</Link></li>)}
              </ul>
            </Section>
          )}
          <p className="px-1 text-xs text-slate-400">แผนก: {deptById(agent.dept).th}</p>
        </div>
      </div>
    </div>
  )
}
