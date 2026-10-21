import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { mainMenu, startJourney, newChatLink } from '../journey'

// Ticket 08: Agent and Workflow cards show only an icon, name, one-line description and "ใช้งาน".
// The rest of the card opens details. The Favourite star sits on the card (shown on hover and keyboard focus).
// Uses and version live on the detail pages.

const agentList = () => screen.getByRole('list', { name: 'รายการผู้ช่วย' })
const workflowList = (name) => screen.getByRole('list', { name })
const cardOf = (list, name) => within(list).getAllByRole('listitem').find((li) => within(li).queryByText(name))
const NUMBERS = /ครั้ง|v\d|★|\d\.\d/

/** Brand-filled (primary) buttons and links a user can press. */
const primaries = () => [...document.querySelectorAll('main a, main button')]
  .filter((el) => !el.disabled && el.className.split(/\s+/).includes('bg-brand-600'))

describe('Clean Agent cards', () => {
  it('show a name, one line of description and "ใช้งาน", and no numbers', () => {
    startJourney('/agents')
    const card = cardOf(agentList(), 'IT Support Agent')
    expect(within(card).getByRole('link', { name: 'IT Support Agent' })).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: 'ใช้งาน' })).toBeInTheDocument()
    expect(card.textContent).not.toMatch(NUMBERS)
  })

  it('open details from the card, and "ใช้งาน" goes to the composer instead', async () => {
    let app = startJourney('/agents')
    await app.click(within(cardOf(agentList(), 'IT Support Agent')).getByRole('link', { name: 'IT Support Agent' }))
    expect(app.url()).toBe('/agents/agent-it-support')

    app = startJourney('/agents')
    await app.click(within(cardOf(agentList(), 'IT Support Agent')).getByRole('link', { name: 'ใช้งาน' }))
    expect(app.url()).toBe('/workspace?agent=agent-it-support')
  })

  it('starring an Agent from its card adds it to the reuse row in new chat', async () => {
    const app = startJourney('/agents')
    await app.click(within(cardOf(agentList(), 'IT Support Agent')).getByRole('button', { name: 'เพิ่มใน Favorite' }))
    await app.click(newChatLink())
    expect(within(screen.getByRole('region', { name: 'ใช้ซ้ำ' })).getByRole('button', { name: /IT Support Agent/ })).toBeInTheDocument()
  })

  it('the detail page shows uses and version', () => {
    startJourney('/agents/agent-it-support')
    expect(screen.getByText(/ครั้งที่ใช้งาน/)).toBeInTheDocument()
    expect(screen.getByText(/^v\d/)).toBeInTheDocument()
  })

  it('advanced filters stay hidden until asked for', async () => {
    const app = startJourney('/agents')
    expect(screen.queryByRole('combobox', { name: 'เรียงตาม' })).toBeNull()
    await app.click(screen.getByRole('button', { name: /ตัวกรอง/ }))
    expect(screen.getByRole('combobox', { name: 'เรียงตาม' })).toBeInTheDocument()
  })

  it('the page has at most one primary button', async () => {
    const app = startJourney('/agents')
    expect(primaries().length).toBeLessThanOrEqual(1)
    await app.type(screen.getByRole('textbox', { name: /ค้นหาผู้ช่วย/ }), 'VPN')
    expect(primaries()).toHaveLength(1)
  })
})

describe('Clean Workflow cards', () => {
  it('have the same shape: name, description and "ใช้งาน", and no numbers', () => {
    startJourney('/workflows')
    const card = cardOf(workflowList('สายงานแนะนำจากเพื่อนร่วมงาน'), 'IT Incident Triage')
    expect(within(card).getByRole('link', { name: 'IT Incident Triage' })).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: 'ใช้งาน' })).toBeInTheDocument()
    expect(card.textContent).not.toMatch(NUMBERS)
  })

  it('open the Workflow from the card, which shows uses and version', async () => {
    const app = startJourney('/workflows')
    await app.click(screen.getByRole('link', { name: 'Market Research Report' }))
    expect(app.url()).toBe('/workflows?id=wf-market-report')
    expect(screen.getByText(/v1\.0/)).toBeInTheDocument()
    expect(screen.getByText(/ใช้ 72 ครั้ง/)).toBeInTheDocument()
  })

  it('a Workflow opened in the detailed builder also shows its numbers', () => {
    startJourney('/workflows?id=wf-sales-proposal', { view: 'admin' })
    expect(screen.getByText(/v1\.2/)).toBeInTheDocument()
    expect(screen.getByText(/ใช้ 112 ครั้ง/)).toBeInTheDocument()
  })

  it('the page has at most one primary button', () => {
    startJourney('/workflows')
    expect(primaries().length).toBeLessThanOrEqual(1)
  })
})
