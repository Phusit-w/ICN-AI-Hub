// "Save for reuse" (บันทึกไว้ใช้ซ้ำ): turning a finished Run into an Agent. See GLOSSARY.md.

import { BLANK_FORM, INSTRUCTION_STARTERS, agentFromForm, formFromAgent } from './agentDraft'
import { isChatRun } from './runs'
import { hasSteps } from './steps'
import { truncate } from './utils'

// Review Agent is added to every multi-step plan automatically, so it doesn't count as the user's choice.
const workers = (run) => run.steps.filter((s) => s.agentId && s.kind !== 'review')

/** The general assistant behind chat answers, as a starting point for an Agent saved from a chat. */
const CHAT_BASE = { form: { ...BLANK_FORM, dept: 'core', kind: 'document' }, instruction: INSTRUCTION_STARTERS.core }

/**
 * Whether a finished Run can be saved as an Agent: when one Agent did the work (a chat answer counts: ICN Assistant
 * did it alone). A Run several Agents did isn't offered yet, and one already saved isn't offered again.
 */
export function canSaveForReuse(run) {
  if (run.status !== 'completed' || run.savedAs) return false
  return isChatRun(run) || workers(run).length === 1
}

/** `thread` is every run of the conversation, oldest first; the first request names it. */
export const defaultReuseName = (thread) => `ผู้ช่วย${truncate(thread[0].title, 40)}`

/**
 * Copies the agent that did the work. The conversation's first request becomes its main job, later
 * messages become refinements, the base agent's own rules stay underneath, and every file attached
 * anywhere in the conversation becomes its knowledge. A chat answer has no library Agent behind it,
 * so its Agent starts from the general ICN Assistant's rules.
 */
export function agentFromRun(run, thread, { name, owner, agents }) {
  const agent = agents.find((a) => a.id === workers(run)[0]?.agentId)
  const base = agent
    ? { name: agent.name, form: formFromAgent(agent), instruction: agent.instruction }
    : { name: run.steps[0].name, ...CHAT_BASE }
  const [first, ...followUps] = thread
  const instruction = [
    `งานหลัก: ${first.prompt}`,
    ...followUps.map((r) => `- ปรับเพิ่มเติม: ${r.prompt}`),
    '',
    `กฎการทำงาน (จาก ${base.name}):`,
    base.instruction,
  ].join('\n')
  const form = {
    ...base.form,
    name,
    description: first.prompt,
    instruction,
    uploads: [...new Set(thread.flatMap((r) => (r.attachments ?? []).map((f) => f.name)))],
    share: 'private',
  }
  return agentFromForm(form, { owner, note: `บันทึกจากแชต โดยใช้ ${base.name} เป็นต้นแบบ`, forkedFrom: agent?.name })
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
