import { useState } from 'react'
import { Activity, Building2, Check, Cloud, Coins, Minus, Server, ShieldAlert, ShieldCheck, ThumbsDown, ThumbsUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DEPT_USAGE, KPIS, MODEL_USAGE, MONTHLY_COST, PERMISSIONS, POLICIES, ROLES } from '../data/governance'
import { deptById, userById } from '../data/catalog'
import { feedbackLabel, mostHelpfulAgents } from '../lib/feedback'
import { cn, fmt, fmtBaht, timeAgo } from '../lib/utils'
import Button from '../components/ui/Button'
import { Card, CardHeader, EmptyState, PageHeader, StatCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { Toggle } from '../components/ui/Form'
import Tabs from '../components/ui/Tabs'
import { shareRequestItem, useStore } from '../store/AppStore'

function Donut({ value }) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 140 140" className="size-36" role="img" aria-label={`Local ${value}%, Cloud ${100 - value}%`}>
      <circle cx="70" cy="70" r={r} fill="none" strokeWidth="16" className="stroke-slate-200" />
      <circle cx="70" cy="70" r={r} fill="none" strokeWidth="16" strokeLinecap="round" className="stroke-emerald-500" strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 70 70)" />
      <text x="70" y="68" textAnchor="middle" className="fill-slate-900" style={{ font: '600 22px Inter, sans-serif' }}>{value}%</text>
      <text x="70" y="86" textAnchor="middle" className="fill-slate-500" style={{ font: '500 11px Inter, sans-serif' }}>Local</text>
    </svg>
  )
}

const LOG_TONE = { info: 'brand', success: 'success', danger: 'danger', warning: 'warning', neutral: 'neutral' }

function UsageTab() {
  const maxCost = Math.max(...MODEL_USAGE.map((m) => m.cost))
  const maxMonth = Math.max(...MONTHLY_COST.map((m) => m.local + m.cloud))
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader title="Model usage & cost" subtitle="Knowledge และ Skill ไม่ผูกกับ Provider — สลับ Model ได้โดยไม่ต้องสร้าง Agent ใหม่" />
        <div className="space-y-3 px-5 pb-5">
          {MODEL_USAGE.map((m) => (
            <div key={m.model} className="grid grid-cols-[130px_1fr_90px] items-center gap-3 text-sm sm:grid-cols-[160px_1fr_160px]">
              <span className="flex items-center gap-1.5 truncate text-slate-700">
                {m.location === 'local' ? <Server className="size-3.5 shrink-0 text-emerald-600" /> : <Cloud className="size-3.5 shrink-0 text-slate-400" />}{m.model}
              </span>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full', m.location === 'local' ? 'bg-emerald-500' : 'bg-slate-400')} style={{ width: `${(m.cost / maxCost) * 100}%` }} />
              </div>
              <span className="text-right text-xs text-slate-500"><b className="text-slate-700">{fmtBaht(m.cost)}</b><span className="hidden sm:inline"> · {fmt(m.requests)} req</span></span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Local vs Cloud" subtitle="สัดส่วนงานตามที่ประมวลผล" />
        <div className="flex flex-col items-center gap-4 px-5 pb-5">
          <Donut value={KPIS.localShare} />
          <div className="flex gap-5 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-emerald-500" /> Local (On-premise)</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-slate-300" /> Cloud</span>
          </div>
          <p className="text-center text-xs leading-relaxed text-slate-500">งาน Confidential ทั้งหมด (412 งาน) ถูกส่งไป Local AI อัตโนมัติตามนโยบาย</p>
        </div>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader title="Monthly cost" subtitle="หน่วย: พันบาท" />
        <div className="flex h-48 items-end gap-3 px-5 pb-2">
          {MONTHLY_COST.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full max-w-8 flex-col justify-end overflow-hidden rounded-t-md" style={{ height: `${((m.local + m.cloud) / maxMonth) * 150}px` }} title={`Local ฿${m.local}k · Cloud ฿${m.cloud}k`}>
                <div className="bg-slate-400" style={{ flex: m.cloud }} />
                <div className="bg-emerald-500" style={{ flex: m.local }} />
              </div>
              <span className="text-[11px] text-slate-500">{m.month}</span>
            </div>
          ))}
        </div>
        <p className="px-5 pb-5 text-xs text-slate-500">Cloud cost โต 50% ใน 6 เดือน — แนะนำย้ายงานทั่วไปไป Local</p>
      </Card>
    </div>
  )
}

function DepartmentTab() {
  return (
    <Card>
      <CardHeader title="Department usage" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-y border-slate-100 bg-slate-50/60 text-left text-xs text-slate-500">
            <tr><th className="px-5 py-2 font-medium">Department</th><th className="py-2 font-medium">Users</th><th className="py-2 font-medium">งาน</th><th className="py-2 font-medium">Cost / budget</th><th className="px-5 py-2 font-medium">Top agent</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DEPT_USAGE.map((d) => {
              const pct = Math.min(100, Math.round((d.cost / d.budget) * 100))
              return (
                <tr key={d.dept}>
                  <td className="px-5 py-3"><span className="flex items-center gap-2 font-medium text-slate-800"><span className={cn('size-2 rounded-full', deptById(d.dept).dot)} />{deptById(d.dept).name}</span></td>
                  <td className="py-3 text-slate-600">{d.users}</td>
                  <td className="py-3 text-slate-600">{fmt(d.tasks)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><div className={cn('h-full', pct > 75 ? 'bg-amber-500' : 'bg-brand-500')} style={{ width: `${pct}%` }} /></div>
                      <span className="text-xs text-slate-500">{fmtBaht(d.cost)} / {fmtBaht(d.budget)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{d.topAgent}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function PolicyTab({ policies, onToggle }) {
  return (
    <Card>
      <CardHeader icon={ShieldCheck} title="Sensitive data policy" subtitle="กฎที่ระบบบังคับใช้อัตโนมัติก่อนส่งข้อมูลให้ Model" />
      <ul className="divide-y divide-slate-100 border-t border-slate-100">
        {policies.map((p) => (
          <li key={p.id} className="flex items-center gap-4 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-800">{p.name}</p>
              <p className="text-xs text-slate-500">{p.scope} · ทำงานแล้ว {fmt(p.hits)} ครั้งเดือนนี้</p>
            </div>
            <Toggle checked={p.enabled} label={p.name} onChange={(v) => onToggle(p, v)} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

function PermissionsTab() {
  return (
    <Card>
      <CardHeader title="Permissions" subtitle="สิทธิ์ตามบทบาท" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="border-y border-slate-100 bg-slate-50/60 text-xs text-slate-500">
            <tr><th className="px-5 py-2 text-left font-medium">Capability</th>{ROLES.map((r) => <th key={r} className="px-2 py-2 text-center font-medium">{r}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PERMISSIONS.map((p) => (
              <tr key={p.name}>
                <td className="px-5 py-2.5 text-slate-700">{p.name}</td>
                {p.grants.map((g, i) => (
                  <td key={i} className="px-2 py-2.5 text-center">
                    {g ? <Check className="mx-auto size-4 text-emerald-600" aria-label="อนุญาต" /> : <Minus className="mx-auto size-4 text-slate-300" aria-label="ไม่อนุญาต" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AuditTab() {
  const { state } = useStore()
  return (
    <Card>
      <CardHeader icon={Activity} title="Audit log" subtitle="บันทึกเหตุการณ์สำคัญวันนี้" />
      <ul className="divide-y divide-slate-100 border-t border-slate-100">
        {state.auditLog.map((l) => (
          <li key={l.id ?? l.time + l.action} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-12 font-mono text-xs text-slate-400">{l.time}</span>
            <span className="w-32 text-sm font-medium text-slate-700">{l.user}</span>
            <span className="flex-1 text-sm text-slate-600">{l.action}</span>
            <Badge tone={LOG_TONE[l.tone]}>{l.result}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}

const USEFUL_AGENTS = 'Agent ที่มีประโยชน์ที่สุดเดือนนี้'
const KIND_LABEL = { agent: 'ผู้ช่วย', skill: 'ทักษะ', workflow: 'สายงาน' }

/** Company sharing requests waiting for the Admin: approve to share with everyone, or send back to stay at department. */
function ShareRequestsTab() {
  const { state, actions } = useStore()
  if (!state.shareRequests.length) {
    return (
      <EmptyState icon={Building2} title="ไม่มีคำขอแชร์ทั้งบริษัทที่รออยู่">
        เมื่อมีคนขอแชร์ผู้ช่วย ทักษะ หรือสายงานให้ทั้งบริษัท คำขอจะแสดงที่นี่ให้อนุมัติ
      </EmptyState>
    )
  }
  return (
    <Card>
      <CardHeader icon={Building2} title="คำขอแชร์ทั้งบริษัท" subtitle="อนุมัติแล้วทุกคนในบริษัทใช้ได้ ส่งกลับแล้วยังแชร์ในแผนกเหมือนเดิม" />
      <ul className="divide-y divide-slate-100 border-t border-slate-100">
        {state.shareRequests.map((r) => {
          const item = shareRequestItem(state, r)
          const requester = userById(r.requester)
          return (
            <li key={r.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-800"><Badge>{KIND_LABEL[r.kind]}</Badge> <span className="font-medium">{item?.name ?? r.itemId}</span></p>
                <p className="mt-0.5 text-xs text-slate-500">ขอโดย {requester.name} · {deptById(requester.dept).name} · {timeAgo(r.at)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" onClick={() => actions.decideShareRequest(r.id, false)}>ส่งกลับ</Button>
                <Button size="sm" variant="primary" onClick={() => actions.decideShareRequest(r.id, true)}>อนุมัติ</Button>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

/** One Agent in the most-useful list: its department and Feedback, and the 👎 reasons the Admin can open. */
function UsefulAgentRow({ agent, summary, reasons }) {
  const [open, setOpen] = useState(false)
  const listId = `reasons-${agent.id}`
  const dept = deptById(agent.dept)
  return (
    <li className="px-5 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <Link to={`/agents/${agent.id}`} className="truncate text-sm font-medium text-slate-800 hover:text-brand-700">{agent.name}</Link>
          <p className="flex items-center gap-1.5 text-xs text-slate-500"><span className={cn('size-2 rounded-full', dept.dot)} />{dept.name}</p>
        </div>
        <span className="text-xs font-medium text-slate-700">{feedbackLabel(summary)}</span>
        <Button size="sm" variant="ghost" icon={ThumbsDown} aria-expanded={open} aria-controls={listId} onClick={() => setOpen(!open)}>
          เหตุผล 👎 ({reasons.length})
        </Button>
      </div>
      {open && (reasons.length ? (
        <ul id={listId} aria-label={`เหตุผล 👎 ของ ${agent.name}`} className="mt-2 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {reasons.map((r, i) => <li key={i}>“{r}”</li>)}
        </ul>
      ) : (
        <p id={listId} className="mt-2 text-xs text-slate-500">ยังไม่มีใครบอกเหตุผลที่กด 👎</p>
      ))}
    </li>
  )
}

/** The shared Agents people found most helpful, credited to their department: no person is ranked. */
function UsefulAgentsTab() {
  const { state } = useStore()
  const top = mostHelpfulAgents(state)
  if (!top.length) {
    return (
      <EmptyState icon={ThumbsUp} title="ยังไม่มี Feedback">
        เมื่อมีคนกด 👍/👎 ใต้ผลงานของ Agent ที่แชร์ Agent ที่มีประโยชน์ที่สุดจะแสดงที่นี่
      </EmptyState>
    )
  }
  return (
    <Card>
      <CardHeader icon={ThumbsUp} title={USEFUL_AGENTS} subtitle="จาก Feedback 👍/👎 ใต้ผลงาน พร้อมแผนกที่สร้าง เปิดดูเหตุผลที่คนกด 👎 ได้" />
      <ol aria-label={USEFUL_AGENTS} className="divide-y divide-slate-100 border-t border-slate-100">
        {top.map((x) => <UsefulAgentRow key={x.agent.id} {...x} />)}
      </ol>
    </Card>
  )
}

export default function Governance() {
  const { state, actions } = useStore()
  // Policy switches live here, not in the tab, so switching tabs doesn't reset them.
  const [policies, setPolicies] = useState(POLICIES)
  const togglePolicy = (p, v) => {
    setPolicies((ps) => ps.map((x) => (x.id === p.id ? { ...x, enabled: v } : x)))
    actions.toast(`${v ? 'เปิด' : 'ปิด'}นโยบาย: ${p.name}`, { tone: 'info' })
  }

  const pending = state.shareRequests.length
  const tabs = [
    { id: 'usage', label: 'ค่าใช้จ่ายและ Model', content: <UsageTab /> },
    { id: 'departments', label: 'แผนก', content: <DepartmentTab /> },
    { id: 'requests', label: pending ? `คำขอแชร์ทั้งบริษัท (${pending})` : 'คำขอแชร์ทั้งบริษัท', content: <ShareRequestsTab /> },
    { id: 'policies', label: 'นโยบายข้อมูล', content: <PolicyTab policies={policies} onToggle={togglePolicy} /> },
    { id: 'permissions', label: 'สิทธิ์การใช้งาน', content: <PermissionsTab /> },
    { id: 'audit', label: 'Audit log', content: <AuditTab /> },
    { id: 'useful-agents', label: USEFUL_AGENTS, content: <UsefulAgentsTab /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="องค์กร" title="ภาพรวมและการกำกับดูแล"
        subtitle="การใช้ AI ทั้งบริษัทในเดือนนี้ ดูรายละเอียดได้ในแท็บด้านล่าง"
        actions={<Badge tone="outline">ตุลาคม 2026 · Month to date</Badge>}
      />

      <section aria-label="ตัวเลขสำคัญ" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ค่าใช้จ่ายเดือนนี้" value={fmtBaht(KPIS.costMtd)} hint={`${Math.round((KPIS.costMtd / KPIS.costBudget) * 100)}% ของงบ ${fmtBaht(KPIS.costBudget)}`} icon={Coins} />
        <StatCard label="จำนวนงาน" value={fmt(KPIS.tasks)} trend={`+${KPIS.tasksDelta}%`} hint="จากเดือนที่แล้ว" icon={Zap} />
        <StatCard label="ประมวลผลบน Local AI" value={`${KPIS.localShare}%`} hint="ข้อมูลไม่ออกนอกบริษัท" icon={Server} data-tour="gov-local" />
        <StatCard label="แจ้งเตือนนโยบาย" value={KPIS.policyBlocks} hint="คำขอที่ถูกป้องกัน" icon={ShieldAlert} />
      </section>

      <Tabs label="รายละเอียด" tabs={tabs} />
    </div>
  )
}
