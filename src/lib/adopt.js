// Taking another User's Agent as your own. The copy remembers which Agent and version it came from; the owner's later
// edits change nothing for the borrower until the borrower presses "อัปเดต" (ADR 0002).
import { agentFromForm, formFromAgent } from './agentDraft'

/** A private copy of `original` for `owner`, linked back to it. */
export function adoptedAgent(original, owner) {
  return {
    ...agentFromForm(formFromAgent(original), { owner, note: `รับมาจาก ${original.name} v${original.version}`, forkedFrom: original.name }),
    forkedFromId: original.id,
    forkedAtVersion: original.version,
  }
}

/** The Agent a copy came from, if it still exists. */
export const originalOf = (copy, agents) => (copy.forkedFromId ? agents.find((a) => a.id === copy.forkedFromId) : undefined)

/** The original has moved on since the copy was taken. */
export const hasNewVersion = (copy, agents) => {
  const original = originalOf(copy, agents)
  return Boolean(original) && original.version !== copy.forkedAtVersion
}

const bump = (version) => {
  const [major, minor = '0'] = version.split('.')
  return `${major}.${Number(minor) + 1}`
}

/** What changes on the copy when its owner takes the original's current version. */
export function updateFromOriginal(copy, original, by) {
  const today = new Date().toISOString().slice(0, 10)
  const version = bump(copy.version)
  return {
    description: original.description, instruction: original.instruction, model: original.model, classification: original.classification,
    knowledge: original.knowledge, skills: original.skills, tools: original.tools, output: original.output, steps: original.steps,
    forkedAtVersion: original.version, version, updated: today,
    versions: [{ v: version, date: today, by, note: `อัปเดตจาก ${original.name} v${original.version}` }, ...copy.versions],
  }
}
