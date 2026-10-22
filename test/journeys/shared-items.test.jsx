import { describe, expect, it } from 'vitest'
import { cleanup, screen, within } from '@testing-library/react'
import { actionFor, expectAgentPicked, startJourney } from '../journey'

// Ticket 07: no Community page. Shared items are found with filter chips and used with "ใช้งาน".
const POPULAR = 'ยอดนิยมในองค์กร'
const SHARED = 'แชร์ให้ฉัน'

const chips = () => screen.getByRole('group', { name: 'แสดงเฉพาะ' })
const chip = (name) => within(chips()).getByRole('button', { name })
const agentList = () => screen.getByRole('list', { name: 'รายการผู้ช่วย' })

describe('Shared items: filter chips and "ใช้งาน"', () => {
  it('the old community link lands on the Agents page with the "popular" filter on', () => {
    const app = startJourney('/community')
    expect(app.url()).toBe('/agents?filter=popular')
    expect(screen.getByRole('tab', { name: /ผู้ช่วย/ })).toHaveAttribute('aria-selected', 'true')
    expect(chip(POPULAR)).toHaveAttribute('aria-pressed', 'true')
    expect(chip(SHARED)).toHaveAttribute('aria-pressed', 'false')
  })

  it('the Agents page has one row of the two chips, and the active one shows and filters', async () => {
    const app = startJourney('/agents')
    expect(within(chips()).getAllByRole('button').map((b) => b.textContent)).toEqual([POPULAR, SHARED])
    expect(chip(POPULAR)).toHaveAttribute('aria-pressed', 'false')

    await app.click(chip(SHARED))
    expect(app.url()).toBe('/agents?filter=shared')
    expect(chip(SHARED)).toHaveAttribute('aria-pressed', 'true')
    // Made by someone else and shared with me: in. Made by me: out.
    expect(within(agentList()).getByText('IT Support Agent')).toBeInTheDocument()
    expect(within(agentList()).queryByText('Customer Insight Agent')).not.toBeInTheDocument()

    await app.click(chip(SHARED))
    expect(app.url()).toBe('/agents')
    expect(within(agentList()).getByText('Customer Insight Agent')).toBeInTheDocument()
  })

  it('"ใช้งาน" on a popular shared Agent picks it in the composer', async () => {
    const app = startJourney('/community')
    await app.click(actionFor('IT Support Agent', 'ใช้งาน'))
    expect(app.url()).toBe('/workspace?agent=agent-it-support')
  })

  it('"ใช้งาน" on a shared Agent with Steps picks it as-is in the composer', async () => {
    const app = startJourney('/agents?filter=shared')
    await app.click(actionFor('IT Incident Triage', 'ใช้งาน'))
    expect(app.url()).toBe('/workspace?agent=agent-it-incident')
    expectAgentPicked('IT Incident Triage')
  })

  it('copying a shared Agent stays a secondary action on its detail page', () => {
    startJourney('/agents/agent-it-support')
    expect(screen.getByRole('link', { name: /คัดลอกไปปรับใช้/ })).toBeInTheDocument()
  })

  it('no page links to the community page any more', () => {
    for (const route of ['/', '/workspace', '/agents', '/agents?tab=skills', '/agents/agent-it-support', '/agents/agent-it-incident', '/governance']) {
      startJourney(route, { view: route === '/governance' ? 'admin' : 'user' })
      const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
      expect(hrefs.filter((h) => h.includes('community')), route).toEqual([])
      cleanup()
    }
  })
})

describe('Governance: no contributor leaderboard', () => {
  // Ticket 04: the old people leaderboard became the most useful Agents, credited to their department.
  it('the governance tabs rank Agents by department, never people', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    expect(screen.queryByRole('tab', { name: 'ผู้มีส่วนร่วม' })).toBeNull()
    await app.click(screen.getByRole('tab', { name: 'Agent ที่มีประโยชน์ที่สุดเดือนนี้' }))
    const rows = within(screen.getByRole('tabpanel', { name: 'Agent ที่มีประโยชน์ที่สุดเดือนนี้' })).getAllByRole('listitem')
    expect(rows.length).toBe(5)
    expect(rows[0]).toHaveTextContent('SOC Check Agent')
    expect(rows[0]).not.toHaveTextContent('Ploy')
  })
})
