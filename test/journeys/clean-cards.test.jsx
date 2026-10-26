import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { mainMenu, startJourney } from '../journey'

// Ticket 08: Agent cards show only an icon, name, one-line description and "ใช้งาน" (and "N ขั้นตอน" for an Agent with Steps).
// The rest of the card opens details. The Favourite star sits on the card (shown on hover and keyboard focus).
// Uses and version live on the detail pages.

const agentList = () => screen.getByRole('list', { name: 'รายการ Agent' })
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
    await app.type(screen.getByRole('textbox', { name: /ค้นหา Agent/ }), 'VPN')
    expect(primaries()).toHaveLength(1)
  })
})

describe('Agents with Steps', () => {
  it('have the same clean card, plus a badge with the number of Steps', () => {
    startJourney('/agents')
    const card = cardOf(agentList(), 'IT Incident Triage')
    expect(within(card).getByRole('link', { name: 'IT Incident Triage' })).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: 'ใช้งาน' })).toBeInTheDocument()
    expect(within(card).getByText('ทีม 1 ขั้นตอน')).toBeInTheDocument()
    expect(card.textContent).not.toMatch(NUMBERS)
  })

  it('open from the card on a detail page with uses, version and the Steps in order', async () => {
    const app = startJourney('/agents')
    await app.click(within(cardOf(agentList(), 'Market Research Report')).getByRole('link', { name: 'Market Research Report' }))
    expect(app.url()).toBe('/agents/agent-market-report')
    expect(screen.getByText(/72 ครั้งที่ใช้งาน/)).toBeInTheDocument()
    expect(screen.getByText('v1.0')).toBeInTheDocument()
    const steps = within(screen.getByRole('list', { name: 'ขั้นตอน' })).getAllByRole('listitem').map((li) => li.textContent.replace(/^\d+/, ''))
    expect(steps).toEqual(['Research Agent', 'Data Agent', 'Document Agent', 'Image Agent'])
  })

  it("a Step's Agent says which Agents use it as a Step", () => {
    startJourney('/agents/agent-image')
    expect(screen.getByRole('link', { name: 'Sales Proposal Pipeline' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Market Research Report' })).toBeInTheDocument()
  })
})
