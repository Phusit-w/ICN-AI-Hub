// "Save for reuse" (บันทึกไว้ใช้ซ้ำ): turning a finished Run into an Agent. See GLOSSARY.md.

import { BLANK_FORM, INSTRUCTION_STARTERS, agentFromForm, formFromAgent } from './agentDraft'
import { hasSteps } from './steps'
import { truncate } from './utils'

// Review Agent is added to every multi-step plan automatically, so it doesn't count as the user's choice.
const workers = (run) => run.steps.filter((s) => s.agentId && s.kind !== 'review')

/** The general assistant behind chat answers, as a starting point for an Agent saved from a chat. */
const CHAT_BASE = { form: { ...BLANK_FORM, dept: 'core', kind: 'document' }, instruction: INSTRUCTION_STARTERS.core }

/**
 * Whether a finished Run can be saved as an Agent. Any finished Run can (a chat answer counts: ICN Assistant
 * did it alone); one already saved isn't offered again.
 */
export function canSaveForReuse(run) {
  return run.status === 'completed' && !run.savedAs
}

/** `thread` is every run of the conversation, oldest first; the first request names it. */
export const defaultReuseName = (thread) => `Agent ${truncate(thread[0].title, 40)}`

/**
 * What the saved Agent is built on. Several Agents did the work: it hands the work to every Agent in the Plan, in
 * order, as Steps (Review too, so the reused Agent checks its work the same way; one level only, since a Plan's
 * Agents never have Steps of their own), and takes its type from the first Step. One Agent did it: a copy of that
 * Agent, its own rules underneath. A chat answer has no library Agent behind it, so it starts from ICN Assistant's rules.
 */
function reuseBase(run, agents) {
  const done = workers(run)
  if (done.length > 1) {
    return {
      form: { ...CHAT_BASE.form, kind: run.steps[0].kind, steps: run.steps.map((s) => s.agentId) },
      rules: ['ทำตามขั้นตอน:', ...run.steps.map((s, i) => `${i + 1}. ${s.name}`)],
      note: `บันทึกจากแชต ทำตาม ${run.steps.length} ขั้นตอนของแผนงาน`,
    }
  }
  const agent = agents.find((a) => a.id === done[0]?.agentId)
  const [baseName, form, rules] = agent
    ? [agent.name, formFromAgent(agent), agent.instruction]
    : [run.steps[0].name, CHAT_BASE.form, CHAT_BASE.instruction]
  return { form, rules: [`กฎการทำงาน (จาก ${baseName}):`, rules], note: `บันทึกจากแชต โดยใช้ ${baseName} เป็นต้นแบบ`, forkedFrom: agent?.name }
}

/**
 * Turns a finished Run into an Agent (see `reuseBase` for what it starts from). The conversation's first request
 * becomes its main job, later messages become refinements, and every file attached anywhere in the conversation
 * becomes its knowledge. Work on confidential data stays confidential.
 */
export function agentFromRun(run, thread, { name, owner, agents }) {
  const base = reuseBase(run, agents)
  const [first, ...followUps] = thread
  const instruction = [
    `งานหลัก: ${first.prompt}`,
    ...followUps.map((r) => `- ปรับเพิ่มเติม: ${r.prompt}`),
    '',
    ...base.rules,
  ].join('\n')
  const form = {
    ...base.form,
    name,
    description: first.prompt,
    instruction,
    uploads: [...new Set(thread.flatMap((r) => (r.attachments ?? []).map((f) => f.name)))],
    share: 'private',
    ...(thread.some((r) => r.sensitive) && { classification: 'confidential' }),
  }
  return agentFromForm(form, { owner, note: base.note, forkedFrom: base.forkedFrom })
}

/**
 * The new-chat screen's "ใช้ซ้ำ" row, as Agents: what the user saved for reuse (newest first), their Favourites,
 * the Agents they started Runs with (newest first), then the Agents with Steps they made themselves.
 */
export function reuseAgents({ runs, agents, favorites, userId }, max = 8) {
  const mine = runs.filter((r) => r.owner === userId).sort((a, b) => b.createdAt - a.createdAt)
  const ids = [
    ...mine.filter((r) => r.savedAs).map((r) => r.savedAs.id),
    ...favorites,
    ...mine.filter((r) => r.agentId).map((r) => r.agentId),
    ...agents.filter((a) => a.owner === userId && hasSteps(a)).map((a) => a.id),
  ]
  return [...new Set(ids)].map((id) => agents.find((a) => a.id === id)).filter(Boolean).slice(0, max)
}
