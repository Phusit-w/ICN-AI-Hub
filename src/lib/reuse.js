// "Save for reuse" (บันทึกไว้ใช้ซ้ำ): turning a finished Run into an Agent or a Workflow.
// See GLOSSARY.md. Also builds linear Workflows from a list of agents (used by the Workflow drafter).

import { agentFromForm, formFromAgent } from './agentDraft'
import { truncate, uid } from './utils'

// Review Agent is added to every multi-step plan automatically, so it doesn't count as the user's choice.
const workers = (run) => run.steps.filter((s) => s.agentId && s.kind !== 'review')

/** A run step as a workflow node reference. */
export const stepRef = (s) => ({ type: s.agentId ? 'agent' : s.skillId ? 'skill' : 'condition', ref: s.agentId ?? s.skillId, label: s.name })

/**
 * What a finished run can be saved as:
 * 'agent' when one agent did the work, 'workflow' when several did, null for plain chat answers.
 * Runs that followed an existing Workflow (picked or matched), or were already saved, aren't offered again.
 */
export function reuseTarget(run) {
  if (run.status !== 'completed' || run.workflowId || run.savedAs) return null
  const n = workers(run).length
  return n === 0 ? null : n === 1 ? 'agent' : 'workflow'
}

/** `thread` is every run of the conversation, oldest first; the first request names it. */
export function defaultReuseName(thread, kind) {
  const title = truncate(thread[0].title, 40)
  return kind === 'agent' ? `ผู้ช่วย${title}` : `สายงาน: ${title}`
}

/** A left-to-right chain: trigger → each step → output. `refs` are `{ type: 'agent'|'skill', ref, label }`. */
export function linearWorkflow({ name, description, dept, owner, refs }) {
  const work = refs.map((r, i) => ({ id: `n${i + 2}`, type: r.type, ref: r.ref, label: r.label, x: 290 + i * 250, y: 60 }))
  const nodes = [{ id: 'n1', type: 'trigger', label: 'ผู้ใช้ส่งคำขอ', x: 40, y: 60 }, ...work, { id: 'n-out', type: 'output', label: 'ส่งผลลัพธ์', x: 290 + work.length * 250, y: 60 }]
  const edges = nodes.slice(1).map((n, i) => ({ id: uid('e'), from: nodes[i].id, to: n.id }))
  return { id: uid('wf'), name, dept, owner, uses: 0, rating: 0, version: '0.1', description, nodes, edges }
}

export function workflowFromRun(run, thread, { name, owner, dept }) {
  return linearWorkflow({ name, description: thread[0].prompt, dept, owner, refs: run.steps.map(stepRef) })
}

/**
 * Copies the agent that did the work. The conversation's first request becomes its main job, later
 * messages become refinements, the base agent's own rules stay underneath, and every file attached
 * anywhere in the conversation becomes its knowledge.
 */
export function agentFromRun(run, thread, { name, owner, agents }) {
  const base = agents.find((a) => a.id === workers(run)[0].agentId)
  const [first, ...followUps] = thread
  const instruction = [
    `งานหลัก: ${first.prompt}`,
    ...followUps.map((r) => `- ปรับเพิ่มเติม: ${r.prompt}`),
    '',
    `กฎการทำงาน (จาก ${base.name}):`,
    base.instruction,
  ].join('\n')
  const form = {
    ...formFromAgent(base),
    name,
    description: first.prompt,
    instruction,
    uploads: [...new Set(thread.flatMap((r) => (r.attachments ?? []).map((f) => f.name)))],
    share: 'private',
  }
  return agentFromForm(form, { owner, note: `บันทึกจากแชต โดยใช้ ${base.name} เป็นต้นแบบ`, forkedFrom: base.name })
}
