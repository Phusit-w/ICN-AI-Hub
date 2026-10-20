// "Save for reuse" (บันทึกไว้ใช้ซ้ำ): turning a finished Run into an Agent or a Workflow.
// See GLOSSARY.md. Also builds linear Workflows from a list of agents (used by the Workflow drafter).

import { agentFromForm, formFromAgent } from './agentDraft'
import { uid } from './utils'

// Review Agent is added to every multi-step plan automatically, so it doesn't count as the user's choice.
const workers = (run) => run.steps.filter((s) => s.agentId && s.kind !== 'review')

/**
 * What a finished run can be saved as:
 * 'agent' when one agent did the work, 'workflow' when several did, null for plain chat answers.
 * Runs that already came from a Workflow, or were already saved, aren't offered again.
 */
export function reuseTarget(run) {
  if (run.status !== 'completed' || run.workflowId || run.savedAs) return null
  const n = workers(run).length
  return n === 0 ? null : n === 1 ? 'agent' : 'workflow'
}

const nameFrom = (text) => (text.length > 40 ? `${text.slice(0, 40)}…` : text)

/** A left-to-right chain: trigger → each step → output. `refs` are `{ type: 'agent'|'skill', ref, label }`. */
export function linearWorkflow({ name, description, dept, owner, refs }) {
  const work = refs.map((r, i) => ({ id: `n${i + 2}`, type: r.type, ref: r.ref, label: r.label, x: 290 + i * 250, y: 60 }))
  const nodes = [{ id: 'n1', type: 'trigger', label: 'ผู้ใช้ส่งคำขอ', x: 40, y: 60 }, ...work, { id: 'n-out', type: 'output', label: 'ส่งผลลัพธ์', x: 290 + work.length * 250, y: 60 }]
  const edges = nodes.slice(1).map((n, i) => ({ id: uid('e'), from: nodes[i].id, to: n.id }))
  return { id: uid('wf'), name, dept, owner, uses: 0, rating: 0, version: '0.1', description, nodes, edges }
}

export function defaultReuseName(run, kind) {
  return kind === 'agent' ? `ผู้ช่วย${nameFrom(run.title)}` : `สายงาน: ${nameFrom(run.title)}`
}

export function workflowFromRun(run, { name, owner, dept }) {
  const refs = run.steps.map((s) => ({ type: s.agentId ? 'agent' : s.skillId ? 'skill' : 'condition', ref: s.agentId ?? s.skillId, label: s.name }))
  return linearWorkflow({ name, description: run.prompt, dept, owner, refs })
}

/** Copies the agent that did the work, with the request as its main instruction and the run's files as knowledge. */
export function agentFromRun(run, { name, owner, agents }) {
  const base = agents.find((a) => a.id === workers(run)[0].agentId)
  const form = {
    ...formFromAgent(base),
    name,
    description: run.prompt,
    instruction: `${base.instruction}\n\nงานหลัก (จากแชตที่บันทึกไว้): ${run.prompt}`,
    uploads: (run.attachments ?? []).map((f) => f.name),
    share: 'private',
  }
  return agentFromForm(form, { owner, note: `บันทึกจากแชต โดยใช้ ${base.name} เป็นต้นแบบ`, forkedFrom: base.name })
}
