import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectArtifactShown, expectWithinBudget, startJourney } from '../journey'

// The Workspace decides by itself between answering as chat and proposing a Plan (spec stories 12–16).

const send = (app) => app.click(screen.getByRole('button', { name: 'ส่ง' }))

describe('Workspace: chat or Plan, decided by the system', () => {
  it('a short general question is answered with no extra click', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'สวัสดี ช่วยอะไรได้บ้าง')
    await send(app)
    await app.letRunsFinish()

    expect(screen.queryByRole('button', { name: 'เริ่มทำงาน' })).toBeNull()
    expect(screen.getByText(/ICN Assistant AI Agent ของบริษัท/)).toBeVisible()
    expectWithinBudget(app, 1)
  })

  it('a multi-Agent request with nothing picked stops at the Plan, and "เริ่มทำงาน" runs it to an Artifact', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ')
    await send(app)
    await app.letRunsFinish()

    // Nothing ran while the Plan waits for the user.
    expect(screen.queryByRole('button', { name: /ดาวน์โหลด/ })).toBeNull()
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.letRunsFinish()

    expectArtifactShown()
    expectWithinBudget(app, 2)
  })

  it('a request matched to an Agent with Steps by keyword is still a system Plan, showing its Steps one by one', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Siam Logistics')
    await send(app)

    expect(screen.getByRole('button', { name: 'เริ่มทำงาน' })).toBeVisible()
    // "Sales Proposal Pipeline" is expanded into its Steps, so the Plan is one level deep.
    // The Plan lists each Step with the Agent doing it (shown without the word "Agent").
    const stages = within(screen.getByRole('region', { name: 'แผนงาน' })).getAllByRole('listitem')
    expect(stages).toHaveLength(5)
    ;['Research', 'Sales Proposal', 'Document', 'Image', 'Review'].forEach((name, i) => expect(stages[i]).toHaveTextContent(name))
  })

  it('a request with a picked Agent starts immediately, with no Plan to confirm', async () => {
    const app = startJourney('/workspace?agent=agent-sales-proposal')

    await app.type(app.box('ข้อความ'), 'ทำใบเสนอราคาระบบกล้องวงจรปิดให้ลูกค้า ABC พร้อมรายละเอียด')
    await send(app)

    expect(screen.queryByRole('button', { name: 'เริ่มทำงาน' })).toBeNull()
    await app.letRunsFinish()
    expectArtifactShown()
    expectWithinBudget(app, 1)
  })

  it('"TOR" matches the Proposal Agent with Steps only as a word, not inside words like "inventory"', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'วิเคราะห์ข้อมูล inventory คลังสินค้า และสรุปเป็นรายงาน')
    await send(app)

    const stages = () => screen.getAllByRole('button', { name: /ออกจากแผน$/ }).map((b) => b.getAttribute('aria-label'))
    expect(stages().some((s) => s.includes('Sales Proposal Agent'))).toBe(false)

    await app.click(screen.getAllByRole('link', { name: 'แชตใหม่' })[0])
    await app.type(app.box('ข้อความ'), 'ตอบ TOR โครงการกล้องวงจรปิด')
    await send(app)
    expect(stages().some((s) => s.includes('Sales Proposal Agent'))).toBe(true)
  })

  it('a request with a picked Agent with Steps starts immediately, with no Plan to confirm', async () => {
    const app = startJourney('/workspace?agent=agent-market-report')

    await app.type(app.box('ข้อความ'), 'ตลาดเครื่องปรับอากาศอินเวอร์เตอร์ในไทย ปี 2026')
    await send(app)

    expect(screen.queryByRole('button', { name: 'เริ่มทำงาน' })).toBeNull()
    await app.letRunsFinish()
    expectArtifactShown()
    expectWithinBudget(app, 1)
  })

  it('the Plan can be edited (a step removed) before starting', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ')
    await send(app)
    const removeButtons = screen.getAllByRole('button', { name: /ออกจากแผน/ })
    const before = removeButtons.length
    await app.click(removeButtons[0])

    expect(screen.getAllByRole('button', { name: /ออกจากแผน/ })).toHaveLength(before - 1)
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.letRunsFinish()
    expectArtifactShown()
  })

  it('"ดูขั้นตอนที่ทำ" under a finished Artifact opens and closes the steps in the Desk', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ')
    await send(app)
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.advance(1000)

    // The conversation says which step is under way; there is no side panel and no "ดูขั้นตอน" button.
    expect(screen.getByText(/กำลังทำงาน ขั้นตอน/)).toBeVisible()
    expect(screen.queryByRole('complementary', { name: 'ขั้นตอนการทำงาน' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'ดูขั้นตอน' })).toBeNull()

    await app.letRunsFinish()
    expectArtifactShown()
    const steps = screen.getByText(/^ดูขั้นตอนที่ทำ/).closest('details')
    expect(steps).not.toHaveAttribute('open')

    await app.click(within(steps).getByText(/^ดูขั้นตอนที่ทำ/))
    expect(steps).toHaveAttribute('open')
    expect(steps).toHaveTextContent(/Research.*Review/s)
    expect(screen.getByRole('textbox', { name: 'ข้อความ' })).toBeVisible() // the Thread is still there

    await app.click(within(steps).getByText(/^ดูขั้นตอนที่ทำ/))
    expect(steps).not.toHaveAttribute('open')
  })

  it('chat history sits in the sidebar on every page, and one click opens a past Thread', async () => {
    const app = startJourney('/agents')
    const history = screen.getByRole('navigation', { name: 'ประวัติแชต' })

    await app.click(within(history).getByRole('link', { name: /หาข้อมูลตลาด EV Charger/ }))

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expect(within(screen.getByRole('navigation', { name: 'ประวัติแชต' })).getByRole('link', { current: 'page' })).toHaveTextContent(/หาข้อมูลตลาด EV Charger/)
    expectWithinBudget(app, 1)
  })

  it('collapsing the sidebar hides the chat history, and expanding brings it back', async () => {
    const app = startJourney('/workspace')

    await app.click(screen.getByRole('button', { name: 'ย่อแถบเมนู' }))
    expect(screen.queryByRole('navigation', { name: 'ประวัติแชต' })).toBeNull()

    await app.click(screen.getByRole('button', { name: 'ขยายแถบเมนู' }))
    expect(screen.getByRole('navigation', { name: 'ประวัติแชต' })).toBeInTheDocument()
  })

  it('the search button on the collapsed sidebar opens the search with the cursor in it', async () => {
    const app = startJourney('/workspace')

    await app.click(screen.getByRole('button', { name: 'ย่อแถบเมนู' }))
    await app.click(screen.getByRole('button', { name: 'ค้นหาทั้งระบบ' }))
    await app.advance(100) // the popup opens a moment after the press

    expect(screen.getByRole('combobox', { name: 'ค้นหาทั้งระบบ' })).toHaveFocus()
  })

  it('sensitive data still shows a short notice', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'สรุปเงินเดือนพนักงานฝ่ายขายเป็นรายงาน')
    await send(app)

    expect(screen.getByText(/พบข้อมูล/)).toBeVisible()
  })

  it('there is no chat/Workflow mode toggle', () => {
    startJourney('/workspace')

    expect(screen.queryByRole('tablist', { name: 'รูปแบบการแสดงผล' })).toBeNull()
    expect(screen.queryByRole('tab', { name: /Workflow/ })).toBeNull()
    expect(screen.queryByText(/โหมด/)).toBeNull()
  })

  it('in an Agent with Steps, a Review after a Research sends the work back once', async () => {
    const app = startJourney('/workspace?agent=agent-proposal-pipeline')

    await app.type(app.box('ข้อความ'), 'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Siam Logistics')
    await send(app)
    await app.letRunsFinish()
    expectArtifactShown()

    const steps = screen.getByText(/^ดูขั้นตอนที่ทำ/)
    expect(steps).toHaveTextContent('ส่งกลับไปแก้ 1 ครั้ง') // the Review sent the work back to the Research once
    await app.click(steps)
    expect(steps.closest('details')).toHaveTextContent(/Research.*Review/s)
  })
})
