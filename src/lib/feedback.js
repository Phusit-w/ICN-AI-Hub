/**
 * The Agents a Run's Feedback counts for: the one the user picked (an Agent with Steps counts as a whole, not per Step),
 * or, when the system planned the work, every Agent that did it.
 */
const creditedAgents = (run) => (run.agentId ? [run.agentId] : run.steps.map((s) => s.agentId))

/** Live Feedback given on Runs that count for the Agent. */
const liveFeedback = (agent, { runs, feedback }) =>
  runs.filter((r) => feedback[r.id] && creditedAgents(r).includes(agent.id)).map((r) => feedback[r.id])

/**
 * An Agent's Feedback summary, the one place every page gets it from: its seeded verdicts plus the live
 * Feedback on Runs that used it. `{ helpful, total }` with `helpful` a whole percent, or null with no Feedback yet.
 */
export function feedbackSummary(agent, state) {
  const seeded = agent.feedback ?? { up: 0, down: 0 }
  const live = liveFeedback(agent, state).map((f) => f.verdict)
  const up = seeded.up + live.filter((v) => v === 'up').length
  const total = seeded.up + seeded.down + live.length
  return total ? { helpful: Math.round((up / total) * 100), total } : null
}

/** The reasons people gave with 👎 for an Agent, newest first: live ones, then the seeded ones. */
function feedbackReasons(agent, state) {
  const live = liveFeedback(agent, state).filter((f) => f.verdict === 'down' && f.reason).map((f) => f.reason)
  return [...live, ...(agent.feedback?.reasons ?? [])]
}

/** The 5 shared Agents people found most helpful, best first (ties go to the one with more Feedback), with their summary and 👎 reasons. */
export function mostHelpfulAgents(state) {
  return state.agents
    .filter((a) => a.share !== 'private')
    .map((agent) => ({ agent, summary: feedbackSummary(agent, state) }))
    .filter((x) => x.summary)
    .sort((a, b) => b.summary.helpful - a.summary.helpful || b.summary.total - a.summary.total)
    .slice(0, 5)
    .map((x) => ({ ...x, reasons: feedbackReasons(x.agent, state) }))
}

/** The summary as people read it: "มีประโยชน์ 92% จาก 38 ครั้ง", or that there is no Feedback yet. */
export const feedbackLabel = (summary) => (summary ? `มีประโยชน์ ${summary.helpful}% จาก ${summary.total} ครั้ง` : 'ยังไม่มี Feedback')
