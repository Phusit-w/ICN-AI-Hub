import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import {
  expectAgentPicked, expectArtifactShown, expectWithinBudget, newChatLink, pickAgentFromMenu, startJourney,
} from '../journey'

// Journey 2: use an Agent you already have. The new-chat screen has no "ใช้ซ้ำ" row (design B), so the user picks the Agent
// from the menu in the composer. Budget: 2 clicks (open the menu, choose the Agent), and the user stays on the new-chat screen.
// "Sales Proposal Agent" is an Agent; "Market Research Report" is an Agent with Steps the user ran recently.

/** The new-chat composer, where a reused Agent should show up. */
const homeCommandBox = (app) => app.box('ข้อความ').closest('form')

describe('Journey 2: use an Agent you already have', () => {
  it('choosing an Agent from the composer menu fills it into the command box in 2 clicks without leaving new chat', async () => {
    const app = startJourney()

    await pickAgentFromMenu(app, 'Sales Proposal Agent')

    expect(app.url()).toBe('/workspace')
    expectAgentPicked('Sales Proposal Agent')
    expectWithinBudget(app, 2)
  })

  it('an Agent with Steps is chosen the same way, in 2 clicks', async () => {
    const app = startJourney()

    await pickAgentFromMenu(app, 'Market Research Report')

    expect(app.url()).toBe('/workspace')
    expectAgentPicked('Market Research Report')
    expectWithinBudget(app, 2)
  })

  it('sending with a chosen Agent with Steps runs its Steps in order straight away, with no Plan to confirm', async () => {
    const app = startJourney()

    await pickAgentFromMenu(app, 'Market Research Report')
    await app.type(app.box('ข้อความ'), 'ตลาดหุ่นยนต์คลังสินค้าในไทย')
    await app.click(screen.getByRole('button', { name: 'ส่ง' }))

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expect(screen.queryByRole('button', { name: 'เริ่มทำงาน' })).not.toBeInTheDocument()
    await app.letRunsFinish()
    expectArtifactShown()
    // The pick (2 clicks, journey 2's budget) plus the send, the same click Journey 1 counts: no Plan click.
    expectWithinBudget(app, 3)

    // Each Step did its part, in the Agent's order.
    const steps = screen.getByText(/^ดูขั้นตอนที่ทำ/)
    await app.click(steps)
    expect(steps.closest('details')).toHaveTextContent(/Research.*Data.*Document.*Image/s)
  })

  it('sending with a chosen Agent runs it straight away', async () => {
    const app = startJourney()

    await pickAgentFromMenu(app, 'Sales Proposal Agent')
    await app.type(app.box('ข้อความ'), 'สรุปจุดขายของระบบ Smart Warehouse สำหรับลูกค้าค้าปลีกรายใหญ่{Enter}')

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expect(screen.queryByRole('button', { name: 'เริ่มทำงาน' })).not.toBeInTheDocument()
    expect(screen.getAllByText(/Sales Proposal Agent/).length).toBeGreaterThan(0)
  })

  it('the pick is cleared in one click, handing the choice back to the system', async () => {
    const app = startJourney()

    await pickAgentFromMenu(app, 'Sales Proposal Agent')
    await app.click(within(homeCommandBox(app)).getByRole('button', { name: 'กลับไปใช้ Agent ของคุณ' }))

    expect(screen.getByRole('button', { name: 'เลือก Agent' })).toHaveTextContent('Agent ของคุณ')
  })

  it('choosing another Agent replaces the picked one: one pick at a time', async () => {
    const app = startJourney()

    await pickAgentFromMenu(app, 'Sales Proposal Agent')
    await pickAgentFromMenu(app, 'Market Research Report')

    expectAgentPicked('Market Research Report')
  })

  it('something saved for reuse from a finished Run is in the composer menu', async () => {
    const app = startJourney()

    await pickAgentFromMenu(app, 'Sales Proposal Agent')
    await app.type(app.box('ข้อความ'), 'สรุปจุดขายของระบบ Smart Warehouse สำหรับลูกค้าค้าปลีกรายใหญ่{Enter}')
    await app.letRunsFinish()
    await app.click(screen.getByRole('button', { name: /บันทึกไว้ใช้ซ้ำ/ }))
    await app.click(screen.getByRole('button', { name: 'บันทึก' }))
    await app.click(newChatLink())

    await app.click(screen.getByRole('button', { name: 'เลือก Agent' }))
    await app.advance(100)
    expect(screen.getByRole('option', { name: /Agent สรุปจุดขายของระบบ Smart Warehouse/ })).toBeVisible()
  })
})
