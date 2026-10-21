import { describe, expect, it } from 'vitest'
import { AGENTS } from '../src/data/agents'
import { SKILLS } from '../src/data/skills'
import { WORKFLOWS } from '../src/data/workflows'
import { KNOWLEDGE, MODELS, TOOLS, USERS } from '../src/data/catalog'
import { AUDIT_LOG, DEPT_USAGE, KPIS, LAUNCH_DATE, MODEL_USAGE, MONTHLY_COST } from '../src/data/governance'

// Ticket 05, seam 2: the mock data tells one story, ICN about 3 months after launch with ~25 Users of ~60 staff.

const ITEMS = [...AGENTS, ...SKILLS, ...WORKFLOWS]
const runsSinceLaunch = MONTHLY_COST.reduce((n, m) => n + m.runs, 0)
const sum = (xs, f) => xs.reduce((n, x) => n + f(x), 0)

describe('Mock data: ICN three months after launch', () => {
  it('counts Runs only for the months since launch, ending with this month', () => {
    expect(MONTHLY_COST.map((m) => m.month)).toEqual(['Aug', 'Sep', 'Oct'])
    expect(MONTHLY_COST.at(-1).runs).toBe(KPIS.tasks)
    expect(Math.round((MONTHLY_COST.at(-1).local + MONTHLY_COST.at(-1).cloud) * 1000)).toBe(KPIS.costMtd)
  })

  it("each Agent, Skill and Workflow is used tens to low hundreds of times, within the Runs since launch", () => {
    for (const x of ITEMS) {
      expect(x.uses, x.id).toBeGreaterThanOrEqual(10)
      expect(x.uses, x.id).toBeLessThan(400)
      expect(x.uses, x.id).toBeLessThanOrEqual(runsSinceLaunch)
    }
  })

  it('no Agent has more Feedback than uses', () => {
    for (const a of AGENTS.filter((a) => a.feedback)) {
      expect(a.feedback.up + a.feedback.down, a.id).toBeLessThanOrEqual(a.uses)
    }
  })

  it('versions are mostly 1.x with short histories dated after launch', () => {
    const versions = ITEMS.map((x) => x.version)
    expect(versions.filter((v) => v.startsWith('1.')).length / versions.length).toBeGreaterThanOrEqual(0.9)
    for (const x of ITEMS) {
      expect(x.versions?.length ?? 0, x.id).toBeLessThanOrEqual(3)
      for (const v of x.versions ?? []) expect(v.date >= LAUNCH_DATE, `${x.id} v${v.v}`).toBe(true)
      if (x.updated) expect(x.updated >= LAUNCH_DATE, x.id).toBe(true)
    }
  })

  it('department figures add up to the totals shown', () => {
    expect(sum(DEPT_USAGE, (d) => d.users)).toBe(KPIS.users)
    expect(sum(DEPT_USAGE, (d) => d.tasks)).toBe(KPIS.tasks)
    expect(sum(DEPT_USAGE, (d) => d.cost)).toBe(KPIS.costMtd)
    expect(sum(MODEL_USAGE, (m) => m.cost)).toBe(KPIS.costMtd)
  })

  it('IT is a one-person team', () => {
    expect(Object.values(USERS).filter((u) => u.dept === 'it')).toHaveLength(1)
    expect(DEPT_USAGE.find((d) => d.dept === 'it').users).toBe(1)
  })

  it('only the agreed models exist: Auto routing, one internal Thai model, and Claude', () => {
    expect(MODELS.map((m) => m.location)).toEqual(['auto', 'local', 'cloud'])
    expect(MODELS.find((m) => m.location === 'cloud').name).toBe('Claude')
    const models = MODELS.map((m) => m.id)
    for (const a of AGENTS) expect(models, a.id).toContain(a.model)
    expect(MODEL_USAGE.map((m) => m.model)).toEqual(MODELS.filter((m) => m.location !== 'auto').map((m) => m.name))
  })

  it('names no brand-name systems and has no ratings left', () => {
    const text = JSON.stringify({ AGENTS, SKILLS, WORKFLOWS, TOOLS, KNOWLEDGE, AUDIT_LOG })
    expect(text).not.toMatch(/Salesforce|\bSAP\b|ServiceNow|Confluence/)
    expect(text).not.toMatch(/"rating"/)
  })

  it('every owner and actor is a known fictional persona', () => {
    const ids = Object.keys(USERS)
    const names = Object.values(USERS).map((u) => u.name)
    for (const x of ITEMS) {
      expect(ids, x.id).toContain(x.owner)
      for (const v of x.versions ?? []) expect(ids, `${x.id} v${v.v}`).toContain(v.by)
    }
    for (const l of AUDIT_LOG) expect(names, l.action).toContain(l.user)
  })

  it('every Skill, tool, knowledge source and Workflow step points at something that exists', () => {
    const has = (list) => list.map((x) => x.id)
    for (const a of AGENTS) {
      for (const s of a.skills) expect(has(SKILLS), a.id).toContain(s)
      for (const t of a.tools) expect(has(TOOLS), a.id).toContain(t)
      for (const k of a.knowledge) expect(has(KNOWLEDGE), a.id).toContain(k)
    }
    for (const s of SKILLS) for (const t of s.tools) expect(has(TOOLS), s.id).toContain(t)
    for (const w of WORKFLOWS) {
      for (const n of w.nodes.filter((n) => n.ref)) expect(has(n.type === 'agent' ? AGENTS : SKILLS), w.id).toContain(n.ref)
    }
  })

  it('has no Coding Agent or Security Review Agent', () => {
    const names = AGENTS.map((a) => a.name)
    expect(names).not.toContain('Coding Agent')
    expect(names).not.toContain('Security Review Agent')
  })
})
