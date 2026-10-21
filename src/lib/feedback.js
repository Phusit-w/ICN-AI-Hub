/**
 * An Agent's Feedback summary, the one place every page gets it from: its seeded verdicts plus the live
 * Feedback on Runs that used it. `{ helpful, total }` with `helpful` a whole percent, or null with no Feedback yet.
 */
export function feedbackSummary(agent, { runs, feedback }) {
  const seeded = agent.feedback ?? { up: 0, down: 0 }
  const live = runs.filter((r) => feedback[r.id] && r.steps.some((s) => s.agentId === agent.id)).map((r) => feedback[r.id].verdict)
  const up = seeded.up + live.filter((v) => v === 'up').length
  const total = seeded.up + seeded.down + live.length
  return total ? { helpful: Math.round((up / total) * 100), total } : null
}

/** The summary as people read it: "มีประโยชน์ 92% จาก 38 ครั้ง", or that there is no Feedback yet. */
export const feedbackLabel = (summary) => (summary ? `มีประโยชน์ ${summary.helpful}% จาก ${summary.total} ครั้ง` : 'ยังไม่มี Feedback')
