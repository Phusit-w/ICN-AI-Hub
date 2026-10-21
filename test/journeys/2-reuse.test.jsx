import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectArtifactShown, expectWithinBudget, mainMenu, startJourney } from '../journey'

// Journey 2: reuse a Favourite agent or a Workflow. Budget: 1 click, and the user stays on Home.
// "Sales Proposal Agent" is a default Favourite; "Market Research Report" is a Workflow the user ran recently.

/** Home's command box, where a reused Agent or Workflow should show up. */
const homeCommandBox = (app) => app.box('สั่งงาน AI').closest('form')

/** The "ใช้ซ้ำ" row under Home's command box. */
const reuseRow = () => screen.getByRole('region', { name: 'ใช้ซ้ำ' })

describe('Journey 2: reuse a Favourite agent or a Workflow', () => {
  it('clicking a Favourite agent fills it into the command box in 1 click without leaving Home', async () => {
    const app = startJourney()

    await app.click(within(reuseRow()).getByRole('button', { name: /Sales Proposal Agent/ }))

    expect(app.url()).toBe('/')
    expect(within(homeCommandBox(app)).getByText(/Sales Proposal Agent/)).toBeVisible()
    expectWithinBudget(app, 1)
  })

  it('clicking a Workflow fills it into the command box in 1 click without leaving Home', async () => {
    const app = startJourney()

    await app.click(within(reuseRow()).getByRole('button', { name: /Market Research Report/ }))

    expect(app.url()).toBe('/')
    expect(within(homeCommandBox(app)).getByText(/Market Research Report/)).toBeVisible()
    expectWithinBudget(app, 1)
  })

  it('sending with a reused Workflow runs it straight away, with no Plan to confirm', async () => {
    const app = startJourney()

    await app.click(within(reuseRow()).getByRole('button', { name: /Market Research Report/ }))
    await app.type(app.box('สั่งงาน AI'), 'ตลาดหุ่นยนต์คลังสินค้าในไทย')
    await app.click(screen.getByRole('button', { name: 'ส่งงาน' }))

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expect(screen.queryByRole('button', { name: 'เริ่มเลย' })).not.toBeInTheDocument()
    await app.letRunsFinish()
    expectArtifactShown()
    // The pick (1 click, journey 2's budget) plus the send, the same click Journey 1 counts: no Plan click.
    expectWithinBudget(app, 2)
  })

  it('sending with a Favourite agent runs it straight away', async () => {
    const app = startJourney()

    await app.click(within(reuseRow()).getByRole('button', { name: /Sales Proposal Agent/ }))
    await app.type(app.box('สั่งงาน AI'), 'สรุปจุดขายของระบบ Smart Warehouse สำหรับลูกค้าค้าปลีกรายใหญ่{Enter}')

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expect(screen.queryByRole('button', { name: 'เริ่มเลย' })).not.toBeInTheDocument()
    expect(screen.getAllByText(/Sales Proposal Agent/).length).toBeGreaterThan(0)
  })

  it('the pick is cleared in one click, handing the choice back to the system', async () => {
    const app = startJourney()

    await app.click(within(reuseRow()).getByRole('button', { name: /Sales Proposal Agent/ }))
    await app.click(within(homeCommandBox(app)).getByRole('button', { name: 'กลับไปเลือกผู้ช่วยอัตโนมัติ' }))

    expect(within(homeCommandBox(app)).queryByText(/Sales Proposal Agent/)).not.toBeInTheDocument()
  })

  it('picking a Workflow replaces a picked Agent: one pick at a time', async () => {
    const app = startJourney()

    await app.click(within(reuseRow()).getByRole('button', { name: /Sales Proposal Agent/ }))
    await app.click(within(reuseRow()).getByRole('button', { name: /Market Research Report/ }))

    expect(within(homeCommandBox(app)).getByText(/Market Research Report/)).toBeVisible()
    expect(within(homeCommandBox(app)).queryByText(/Sales Proposal Agent/)).not.toBeInTheDocument()
  })

  it('something saved for reuse from a finished Run shows up in the reuse row', async () => {
    const app = startJourney()

    await app.click(within(reuseRow()).getByRole('button', { name: /Sales Proposal Agent/ }))
    await app.type(app.box('สั่งงาน AI'), 'สรุปจุดขายของระบบ Smart Warehouse สำหรับลูกค้าค้าปลีกรายใหญ่{Enter}')
    await app.letRunsFinish()
    await app.click(screen.getByRole('button', { name: /บันทึกไว้ใช้ซ้ำ/ }))
    await app.click(screen.getByRole('button', { name: 'บันทึก' }))
    await app.click(within(mainMenu()).getByRole('link', { name: /หน้าหลัก/ }))

    expect(within(reuseRow()).getByRole('button', { name: /ผู้ช่วยสรุปจุดขายของระบบ Smart Warehouse/ })).toBeVisible()
  })

  it('with no Favourites the reuse row says how to get some', async () => {
    const app = startJourney()

    await app.click(within(mainMenu()).getByRole('link', { name: /ผู้ช่วย AI/ }))
    // A starred Agent can show twice (recommended and in the list), so unstar until none is left.
    while (screen.queryAllByRole('button', { name: 'นำออกจาก Favorite' }).length) await app.click(screen.getAllByRole('button', { name: 'นำออกจาก Favorite' })[0])
    await app.click(within(mainMenu()).getByRole('link', { name: /หน้าหลัก/ }))

    expect(within(reuseRow()).queryByRole('button', { name: /Sales Proposal Agent/ })).not.toBeInTheDocument()
    expect(within(reuseRow()).getByText(/กดดาว/)).toBeVisible()
  })
})
