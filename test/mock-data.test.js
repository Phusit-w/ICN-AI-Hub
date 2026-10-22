import { describe, expect, it } from 'vitest'
import { AGENTS } from '../src/data/agents'
import { SKILLS } from '../src/data/skills'
import { KNOWLEDGE, MODELS, TOOLS, USERS } from '../src/data/catalog'
import { EXAMPLE_CHATS } from '../src/data/exampleChats'
import { sheetsOf } from '../src/lib/sheets'
import { AUDIT_LOG, DEPT_USAGE, KPIS, LAUNCH_DATE, MODEL_USAGE, MONTHLY_COST } from '../src/data/governance'

// Ticket 05, seam 2: the mock data tells one story, ICN about 3 months after launch with ~25 Users of ~60 staff.

const ITEMS = [...AGENTS, ...SKILLS]
const runsSinceLaunch = MONTHLY_COST.reduce((n, m) => n + m.runs, 0)
const sum = (xs, f) => xs.reduce((n, x) => n + f(x), 0)

describe('Mock data: ICN three months after launch', () => {
  it('counts Runs only for the months since launch, ending with this month', () => {
    expect(MONTHLY_COST.map((m) => m.month)).toEqual(['Aug', 'Sep', 'Oct'])
    expect(MONTHLY_COST.at(-1).runs).toBe(KPIS.tasks)
    expect(Math.round((MONTHLY_COST.at(-1).local + MONTHLY_COST.at(-1).cloud) * 1000)).toBe(KPIS.costMtd)
  })

  it("each Agent and Skill is used tens to low hundreds of times, within the Runs since launch", () => {
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
    const text = JSON.stringify({ AGENTS, SKILLS, TOOLS, KNOWLEDGE, AUDIT_LOG })
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

  it('every Skill, tool and knowledge source points at something that exists', () => {
    const has = (list) => list.map((x) => x.id)
    for (const a of AGENTS) {
      for (const s of a.skills) expect(has(SKILLS), a.id).toContain(s)
      for (const t of a.tools) expect(has(TOOLS), a.id).toContain(t)
      for (const k of a.knowledge) expect(has(KNOWLEDGE), a.id).toContain(k)
    }
    for (const s of SKILLS) for (const t of s.tools) expect(has(TOOLS), s.id).toContain(t)
  })

  it('has no Coding Agent or Security Review Agent', () => {
    const names = AGENTS.map((a) => a.name)
    expect(names).not.toContain('Coding Agent')
    expect(names).not.toContain('Security Review Agent')
  })
})

// Agents-only redesign, seam 2: Workflows are folded into Agents with Steps (ADR 0001).
describe('Mock data: Agents with Steps instead of Workflows', () => {
  const byId = (id) => AGENTS.find((a) => a.id === id)

  it('has no Workflow collection left', () => {
    const dataFiles = Object.keys(import.meta.glob('../src/data/*.js'))
    expect(dataFiles).not.toContain('../src/data/workflows.js')
  })

  it('keeps every former Workflow as an Agent with Steps under the same name', () => {
    for (const name of ['Sales Proposal Pipeline', 'New Hire Onboarding', 'IT Incident Triage', 'Month-end Close Report', 'Market Research Report']) {
      const agent = AGENTS.find((a) => a.name === name)
      expect(agent, name).toBeDefined()
      expect(agent.steps.length, name).toBeGreaterThan(0)
    }
  })

  it('every Step is an existing Agent that has no Steps of its own', () => {
    for (const a of AGENTS) {
      for (const id of a.steps) {
        expect(byId(id), `${a.id} → ${id}`).toBeDefined()
        expect(byId(id).steps, `${a.id} → ${id}`).toEqual([])
      }
    }
  })
})

// Real example chats, seam 2: each scripted Thread points at an existing Agent and carries well-formed tables.
const exampleRuns = EXAMPLE_CHATS.flatMap((chat) => chat.runs.map((run) => ({ ...run, chat })))

describe('Mock data: example chats from real work', () => {
  it('every example chat is by an existing Agent without Steps', () => {
    for (const chat of EXAMPLE_CHATS) {
      const agent = AGENTS.find((a) => a.id === chat.agentId)
      expect(agent, chat.title).toBeDefined()
      expect(agent.steps, chat.title).toHaveLength(0)
    }
  })

  it('every table Artifact has columns and rows, each row as wide as its columns', () => {
    for (const { output, chat } of exampleRuns) {
      for (const sheet of sheetsOf(output)) {
        const where = `${chat.title}: ${sheet.name}`
        expect(sheet.columns.length, where).toBeGreaterThan(0)
        expect(sheet.rows.length, where).toBeGreaterThan(0)
        for (const row of sheet.rows) expect(row, where).toHaveLength(sheet.columns.length)
        for (const i of Object.keys(sheet.marks ?? {})) expect(sheet.rows[i], where).toBeDefined()
      }
    }
  })

  it('a Schedule belongs to an existing Agent, and a Run started by one is of an Agent that has it', () => {
    for (const { chat, scheduleLabel, scheduleSet } of exampleRuns) {
      if (!scheduleLabel && !scheduleSet) continue
      const agent = AGENTS.find((a) => a.id === chat.agentId)
      expect(agent.schedule, chat.title).toBeDefined()
    }
  })
})
