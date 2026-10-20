// Simulated orchestration engine: turns a request into a plan of agent steps
// and advances it over time. Pure functions — the store drives the clock.

import { modelById } from '../data/catalog'
import { TASKS, outputFor } from './mockOutputs'
import { uid } from './utils'

const DURATION = { research: 5200, sales: 4600, document: 5600, image: 4200, review: 3800, condition: 1800, skill: 3000, chat: 1600 }

const SENSITIVE = /(เงินเดือน|salary|บัตรประชาชน|confidential|ลับ|ปิดงบ|invoice|ใบแจ้งหนี้|resume|เรซูเม่|ประวัติพนักงาน)/i
export const isSensitive = (text) => SENSITIVE.test(text)

// Confidential work never leaves the company; otherwise "auto" picks the best-fit model.
export function resolveModel(agent, sensitive) {
  if (agent.kind === 'image') return 'icn-image'
  const preferred = modelById(agent.model)
  if (sensitive || agent.classification === 'confidential') return preferred.location === 'local' ? preferred.id : 'icn-llama'
  if (agent.model !== 'auto') return agent.model
  return { research: 'gemini', review: 'claude', sales: 'claude', document: 'claude' }[agent.kind] ?? 'icn-llama'
}

function makeStep({ agent, skill, label, kind, nodeId, sensitive }) {
  const k = kind ?? agent?.kind ?? 'skill'
  return {
    id: uid('step'), nodeId, kind: k,
    agentId: agent?.id ?? null, skillId: skill?.id ?? null,
    name: agent?.name ?? skill?.name ?? label,
    task: TASKS[k] ?? TASKS.skill,
    model: k === 'condition' ? null : resolveModel(agent ?? { model: 'auto', kind: k }, sensitive),
    status: 'waiting', elapsed: 0, duration: DURATION[k] ?? 4400,
    loopBackTo: null, loopsLeft: 0, loops: 0, output: null,
  }
}

// Kahn topological order over forward edges; ties broken left-to-right on the canvas.
function topoOrder(wf) {
  const forward = wf.edges.filter((e) => e.kind !== 'loop')
  const indeg = Object.fromEntries(wf.nodes.map((n) => [n.id, 0]))
  forward.forEach((e) => { indeg[e.to] += 1 })
  const byX = (a, b) => wf.nodes.find((n) => n.id === a).x - wf.nodes.find((n) => n.id === b).x
  const queue = Object.keys(indeg).filter((id) => indeg[id] === 0).sort(byX)
  const order = []
  while (queue.length) {
    const id = queue.shift()
    order.push(id)
    forward.filter((e) => e.from === id).forEach((e) => {
      indeg[e.to] -= 1
      if (indeg[e.to] === 0) { queue.push(e.to); queue.sort(byX) }
    })
  }
  return order
}

export function stepsFromWorkflow(wf, { agents, skills, sensitive }) {
  const steps = topoOrder(wf)
    .map((id) => wf.nodes.find((n) => n.id === id))
    .filter((n) => n.type === 'condition' || (n.type === 'agent' && agents.some((a) => a.id === n.ref)) || (n.type === 'skill' && skills.some((s) => s.id === n.ref)))
    .map((n) => makeStep({
      agent: n.type === 'agent' ? agents.find((a) => a.id === n.ref) : null,
      skill: n.type === 'skill' ? skills.find((s) => s.id === n.ref) : null,
      label: n.label, kind: n.type === 'agent' ? undefined : n.type, nodeId: n.id, sensitive,
    }))
  wf.edges.filter((e) => e.kind === 'loop').forEach((e) => {
    const from = steps.findIndex((s) => s.nodeId === e.from)
    const to = steps.findIndex((s) => s.nodeId === e.to)
    if (from > to && to >= 0) Object.assign(steps[from], { loopBackTo: to, loopsLeft: 1, loopReason: e.label })
  })
  return steps
}

const WORKFLOW_RULES = [
  [/proposal|ข้อเสนอ|เสนอราคา|\btor\b/i, 'wf-sales-proposal'],
  [/onboard|พนักงานใหม่/i, 'wf-hr-onboarding'],
  [/vpn|เข้าระบบไม่ได้|ticket|เครื่องพิมพ์|printer|อีเมลใช้ไม่ได้/i, 'wf-it-incident'],
  [/ปิดงบ|month.?end|กระทบยอด|reconcil/i, 'wf-month-end'],
]

const AGENT_RULES = [
  [/ค้น|หาข้อมูล|research|ตลาด|คู่แข่ง/i, 'agent-research'],
  [/วิเคราะห์|ยอดขาย|ตัวเลข|data|excel|กราฟ/i, 'agent-data'],
  [/นโยบาย|ระเบียบ|สวัสดิการ|วันลา/i, 'agent-hr-policy'],
  [/งบประมาณ|budget/i, 'agent-budget'],
  [/โค้ด|code|sql|script/i, 'agent-coding'],
  [/แปล|translate/i, 'agent-translate'],
  [/สรุป|รายงาน|เอกสาร|report|word/i, 'agent-document'],
  [/ภาพ|รูป|image|diagram|ไดอะแกรม|infographic/i, 'agent-image'],
]

/** Decide which agents should handle a free-text request. */
export function planRequest(prompt, { agents, skills, workflows, agentId, workflowId }) {
  const sensitive = isSensitive(prompt)
  const wfId = workflowId ?? (agentId ? null : WORKFLOW_RULES.find(([re]) => re.test(prompt))?.[1])
  const workflow = workflows.find((w) => w.id === wfId)
  if (workflow) {
    return { sensitive, workflowId: workflow.id, reason: `ตรงกับ Workflow "${workflow.name}" ที่ใช้กันในบริษัท`, steps: stepsFromWorkflow(workflow, { agents, skills, sensitive }) }
  }

  let ids = agentId ? [agentId] : AGENT_RULES.filter(([re]) => re.test(prompt)).map(([, id]) => id)
  // A short message with no task keywords is conversation, not work — answer it directly.
  if (!ids.length && prompt.length <= 40) {
    return { sensitive, workflowId: null, reason: 'คำถามทั่วไป ตอบได้ทันที', steps: [makeStep({ kind: 'chat', label: 'ICN Assistant', sensitive })] }
  }
  if (!ids.length) ids = ['agent-research', 'agent-document']
  if (!ids.includes('agent-review')) ids.push('agent-review')
  const steps = ids.map((id) => agents.find((a) => a.id === id)).filter(Boolean).map((agent) => makeStep({ agent, sensitive }))
  const research = steps.findIndex((s) => s.kind === 'research')
  const review = steps.findIndex((s) => s.kind === 'review')
  if (research >= 0 && review > research) Object.assign(steps[review], { loopBackTo: research, loopsLeft: 1, loopReason: 'ข้อมูลยังไม่ครบ' })
  return { sensitive, workflowId: null, reason: agentId ? 'ใช้ Agent ที่คุณเลือก และให้ Review Agent ตรวจก่อนส่ง' : 'ระบบเลือก Agent ตามคำสำคัญในคำขอของคุณ', steps }
}

/** `threadId` groups follow-up messages into one conversation; a new conversation uses the run's own id. */
export function createRun({ prompt, plan, owner, threadId, createdAt = Date.now() }) {
  const id = uid('run')
  return {
    id, threadId: threadId ?? id, title: prompt.length > 70 ? `${prompt.slice(0, 70)}…` : prompt, prompt, owner,
    workflowId: plan.workflowId, sensitive: plan.sensitive, reason: plan.reason, steps: plan.steps,
    status: 'planned', current: -1, createdAt, startedAt: null, finishedAt: null, events: [],
  }
}

export function startRun(run, now = Date.now()) {
  const steps = run.steps.map((s, i) => ({ ...s, status: i === 0 ? 'processing' : 'waiting', elapsed: 0 }))
  return {
    ...run, steps, current: 0, status: 'running', startedAt: now,
    events: [
      { at: now, tone: 'info', text: `เริ่มงาน — แบ่งให้ ${steps.length} ขั้นตอน` },
      ...(run.sensitive ? [{ at: now, tone: 'info', text: 'ตรวจพบข้อมูลลับ → ประมวลผลบน Local AI ภายในบริษัทเท่านั้น' }] : []),
    ],
  }
}

export function advanceRun(run, dt, now = Date.now()) {
  if (run.status !== 'running') return run
  const steps = [...run.steps]
  const i = run.current
  const step = { ...steps[i], elapsed: steps[i].elapsed + dt * (run.speed ?? 1) }
  steps[i] = step
  if (step.elapsed < step.duration) return { ...run, steps }

  const events = [...run.events]
  if (step.loopBackTo != null && step.loopsLeft > 0) {
    const target = step.loopBackTo
    events.push({ at: now, tone: 'warning', text: `${step.name}: ${step.loopReason ?? 'ข้อมูลยังไม่ครบ'} — ส่งงานกลับไปที่ ${steps[target].name}` })
    for (let j = target + 1; j < i; j += 1) steps[j] = { ...steps[j], status: 'waiting', elapsed: 0 }
    steps[i] = { ...step, status: 'returned', elapsed: 0, loopsLeft: step.loopsLeft - 1, loops: step.loops + 1, output: outputFor(step, run) }
    steps[target] = { ...steps[target], status: 'processing', elapsed: 0, loops: steps[target].loops + 1 }
    return { ...run, steps, current: target, events }
  }

  steps[i] = { ...step, status: 'completed', output: outputFor(step, run) }
  events.push({ at: now, tone: 'success', text: `${step.name} ทำงานเสร็จ` })
  const next = i + 1
  if (next >= steps.length) {
    events.push({ at: now, tone: 'success', text: 'งานเสร็จสมบูรณ์ — พร้อมส่งมอบ' })
    return { ...run, steps, current: next, status: 'completed', finishedAt: now, events }
  }
  steps[next] = { ...steps[next], status: 'processing', elapsed: 0 }
  events.push({ at: now, tone: 'info', text: `ส่งต่องานให้ ${steps[next].name}` })
  return { ...run, steps, current: next, events }
}

/** Seed helper: start a run in the past and replay it up to now. */
export function replayRun(run, agoMs, tick = 500) {
  const start = Date.now() - agoMs
  let r = startRun(run, start)
  for (let t = tick; t <= agoMs && r.status === 'running'; t += tick) r = advanceRun(r, tick, start + t)
  return r
}

export const runProgress = (run) => {
  if (run.status === 'completed') return 1
  if (run.status !== 'running') return 0
  const done = run.steps.filter((s) => s.status === 'completed').length
  const cur = run.steps[run.current]
  return (done + (cur ? Math.min(cur.elapsed / cur.duration, 1) : 0)) / run.steps.length
}
