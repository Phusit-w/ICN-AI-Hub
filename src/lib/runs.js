// Simulated orchestration engine: turns a request into a plan of agent steps
// and advances it over time. Pure functions — the store drives the clock.

import { LOCAL_MODEL_ID, modelById } from '../data/catalog'
import { TASKS, outputFor } from './mockOutputs'
import { uid } from './utils'
import { hasSteps, stepAgents, stepsLabel } from './steps'

const DURATION = { research: 5200, sales: 4600, document: 5600, image: 4200, review: 3800, chat: 1600 }

const SENSITIVE = /(เงินเดือน|salary|บัตรประชาชน|confidential|ลับ|ปิดงบ|invoice|ใบแจ้งหนี้|resume|เรซูเม่|ประวัติพนักงาน)/i
export const isSensitive = (text) => SENSITIVE.test(text)

// Kinds of work Auto routing sends to Claude when the data may leave the company.
const CLOUD_KINDS = ['research', 'review', 'sales', 'document']

// Confidential work never leaves the company; otherwise "auto" picks the best-fit model.
export function resolveModel(agent, sensitive) {
  const preferred = modelById(agent.model)
  if (sensitive || agent.classification === 'confidential') return preferred.location === 'local' ? preferred.id : LOCAL_MODEL_ID
  if (agent.model !== 'auto') return agent.model
  return CLOUD_KINDS.includes(agent.kind) ? 'claude' : LOCAL_MODEL_ID
}

function makeStep({ agent, label, kind, sensitive }) {
  const k = kind ?? agent.kind
  return {
    id: uid('step'), kind: k,
    agentId: agent?.id ?? null,
    name: agent?.name ?? label,
    task: TASKS[k] ?? TASKS.skill,
    model: resolveModel(agent ?? { model: 'auto', kind: k }, sensitive),
    status: 'waiting', elapsed: 0, duration: DURATION[k] ?? 4400,
    loopBackTo: null, loopsLeft: 0, loops: 0, output: null,
  }
}

// Requests that match a company Agent with Steps. The system chose it, so its Plan still waits for "เริ่มเลย".
const STEPS_RULES = [
  [/proposal|ข้อเสนอ|เสนอราคา|\btor\b/i, 'agent-proposal-pipeline'],
  [/onboard|พนักงานใหม่/i, 'agent-new-hire-onboarding'],
  [/vpn|เข้าระบบไม่ได้|ticket|เครื่องพิมพ์|printer|อีเมลใช้ไม่ได้/i, 'agent-it-incident'],
  [/ปิดงบ|month.?end|กระทบยอด|reconcil/i, 'agent-month-end'],
]

/** One step per Agent, in order. A Review after a Research sends the work back once when information is missing. */
function stepsFor(agents, sensitive) {
  const steps = agents.map((agent) => makeStep({ agent, sensitive }))
  const research = steps.findIndex((s) => s.kind === 'research')
  const review = steps.findIndex((s) => s.kind === 'review')
  if (research >= 0 && review > research) Object.assign(steps[review], { loopBackTo: research, loopsLeft: 1, loopReason: 'ข้อมูลยังไม่ครบ' })
  return steps
}

const AGENT_RULES = [
  [/ค้น|หาข้อมูล|research|ตลาด|คู่แข่ง/i, 'agent-research'],
  [/วิเคราะห์|ยอดขาย|ตัวเลข|data|excel|กราฟ/i, 'agent-data'],
  [/นโยบาย|ระเบียบ|สวัสดิการ|วันลา/i, 'agent-hr-policy'],
  [/งบประมาณ|budget/i, 'agent-budget'],
  [/แปล|translate/i, 'agent-translate'],
  [/สรุป|รายงาน|เอกสาร|report|word/i, 'agent-document'],
  [/ภาพ|รูป|image|diagram|ไดอะแกรม|infographic/i, 'agent-image'],
]

/** A Run, or the Plan for one, that is a single chat answer from ICN Assistant rather than work for Agents. */
export const isChatRun = (run) => run.steps.length === 1 && run.steps[0].kind === 'chat'

/** The Runs of one Thread, oldest first. */
export const runsOfThread = (runs, threadId) => runs.filter((r) => r.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt)

/** Threads, newest first: each is { id, title (its first Run's), latest Run }. */
export function threadsOf(runs) {
  const byId = new Map()
  ;[...runs].sort((a, b) => a.createdAt - b.createdAt).forEach((r) => {
    const t = byId.get(r.threadId) ?? { id: r.threadId, title: r.title }
    byId.set(r.threadId, { ...t, latest: r })
  })
  return [...byId.values()].sort((a, b) => b.latest.createdAt - a.latest.createdAt)
}

/**
 * Decide which agents should handle a free-text request. `agentId` is the Agent the user picked, if any.
 * An Agent with Steps (picked, or matched by keyword) runs its Steps, so a Plan is always one level deep.
 * `plan.agentId` is the Agent the Run is started with: the one Feedback counts for.
 */
export function planRequest(prompt, { agents, agentId }) {
  const sensitive = isSensitive(prompt)
  const withSteps = agents.find((a) => a.id === (agentId ?? STEPS_RULES.find(([re]) => re.test(prompt))?.[1]))
  if (withSteps && hasSteps(withSteps)) {
    const reason = agentId ? `ใช้ Agent "${withSteps.name}" ที่คุณเลือก ทำตาม ${stepsLabel(withSteps)}` : `ตรงกับ Agent "${withSteps.name}" ที่ใช้กันในบริษัท`
    return { sensitive, agentId: withSteps.id, reason, steps: stepsFor(stepAgents(withSteps, agents), sensitive) }
  }

  let ids = agentId ? [agentId] : AGENT_RULES.filter(([re]) => re.test(prompt)).map(([, id]) => id)
  // A short message with no task keywords is conversation, not work — answer it directly.
  if (!ids.length && prompt.length <= 40) {
    return { sensitive, agentId: null, reason: 'คำถามทั่วไป ตอบได้ทันที', steps: [makeStep({ kind: 'chat', label: 'ICN Assistant', sensitive })] }
  }
  if (!ids.length) ids = ['agent-research', 'agent-document']
  if (!ids.includes('agent-review')) ids.push('agent-review')
  const steps = stepsFor(ids.map((id) => agents.find((a) => a.id === id)).filter(Boolean), sensitive)
  return { sensitive, agentId: agentId ?? null, reason: agentId ? 'ใช้ Agent ที่คุณเลือก และให้ Review Agent ตรวจก่อนส่ง' : 'ระบบเลือก Agent ตามคำสำคัญในคำขอของคุณ', steps }
}

/** `threadId` groups follow-up messages into one conversation; a new conversation uses the run's own id. */
export function createRun({ prompt, plan, owner, threadId, createdAt = Date.now() }) {
  const id = uid('run')
  return {
    id, threadId: threadId ?? id, title: prompt.length > 70 ? `${prompt.slice(0, 70)}…` : prompt, prompt, owner,
    agentId: plan.agentId, sensitive: plan.sensitive, reason: plan.reason, steps: plan.steps,
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
