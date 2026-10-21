import { describe, expect, it } from 'vitest'
import { cleanup, screen, within } from '@testing-library/react'
import { actionFor, expectWorkflowPicked, startJourney } from '../journey'

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

  it('the Workflows page has the same chips and the active one shows', async () => {
    const app = startJourney('/workflows')
    expect(within(chips()).getAllByRole('button').map((b) => b.textContent)).toEqual([POPULAR, SHARED])
    await app.click(chip(POPULAR))
    expect(app.url()).toBe('/workflows?filter=popular')
    expect(chip(POPULAR)).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('IT Incident Triage')).toBeInTheDocument()
  })

  it('"ใช้งาน" on a shared Workflow picks it as-is and never offers a copy', async () => {
    const app = startJourney('/workflows?filter=shared')
    expect(screen.queryAllByRole('button', { name: /คัดลอก|Fork|สำเนา/ })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: /คัดลอก|Fork|สำเนา/ })).toHaveLength(0)

    await app.click(actionFor('IT Incident Triage', 'ใช้งาน'))
    expect(app.url()).toBe('/workspace?workflow=wf-it-incident')
    expectWorkflowPicked('IT Incident Triage')
  })

  it('copying a shared Agent stays a secondary action on its detail page', () => {
    startJourney('/agents/agent-it-support')
    expect(screen.getByRole('link', { name: /คัดลอกไปปรับใช้/ })).toBeInTheDocument()
  })

  it('no page links to the community page any more', () => {
    for (const route of ['/', '/workspace', '/agents', '/agents?tab=skills', '/agents/agent-it-support', '/workflows', '/governance']) {
      startJourney(route, { view: route === '/governance' ? 'admin' : 'user' })
      const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
      expect(hrefs.filter((h) => h.includes('community')), route).toEqual([])
      cleanup()
    }
  })
})

describe('Governance: contributor leaderboard', () => {
  it('the contributors tab shows who made the most-used shared items', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    await app.click(screen.getByRole('tab', { name: 'ผู้มีส่วนร่วม' }))
    const rows = within(screen.getByRole('tabpanel', { name: 'ผู้มีส่วนร่วม' })).getAllByRole('listitem')
    expect(rows.length).toBe(5)
    expect(rows[0]).toHaveTextContent('Kittipong W.')
    expect(within(rows[1]).getByText('Somchai R.')).toBeInTheDocument()
  })
})
