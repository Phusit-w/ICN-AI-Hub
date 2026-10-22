// Steps (GLOSSARY: Step, ADR 0001): an Agent may hand its work, stage by stage, to other Agents.
// Invariant: an Agent used as a Step has no Steps of its own, so work never nests.

export const hasSteps = (agent) => agent.steps.length > 0

/** The Agents in `agent`'s Steps, in order; a Step whose Agent no longer exists is left out. */
export const stepAgents = (agent, agents) => agent.steps.map((id) => agents.find((a) => a.id === id)).filter(Boolean)

/** The Agents that use `agent` as one of their Steps. */
export const agentsUsingAsStep = (agent, agents) => agents.filter((a) => a.steps.includes(agent.id))

/** The badge an Agent with Steps carries, e.g. "3 ขั้นตอน"; undefined for an Agent without Steps. */
export const stepsLabel = (agent) => (hasSteps(agent) ? `${agent.steps.length} ขั้นตอน` : undefined)
