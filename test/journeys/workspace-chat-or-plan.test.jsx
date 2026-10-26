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

    expect(screen.queryByRole('button', { name: 'เริ่มเลย' })).toBeNull()
    expect(screen.getByText(/ICN Assistant AI Agent ของบริษัท/)).toBeVisible()
    expectWithinBudget(app, 1)
  })

  it('a multi-Agent request with nothing picked stops at the Plan, and "เริ่มเลย" runs it to an Artifact', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ')
    await send(app)
    await app.letRunsFinish()

    // Nothing ran while the Plan waits for the user.
    expect(screen.queryByRole('button', { name: /ดาวน์โหลด/ })).toBeNull()
    await app.click(screen.getByRole('button', { name: 'เริ่มเลย' }))
    await app.letRunsFinish()

    expectArtifactShown()
    expectWithinBudget(app, 2)
  })

  it('a request matched to an Agent with Steps by keyword is still a system Plan, showing its Steps one by one', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Siam Logistics')
    await send(app)

    expect(screen.getByRole('button', { name: 'เริ่มเลย' })).toBeVisible()
    // "Sales Proposal Pipeline" is expanded into its Steps, so the Plan is one level deep.
    const stages = screen.getAllByRole('button', { name: /ออกจากแผน$/ }).map((b) => b.getAttribute('aria-label').replace(/^ลบ | ออกจากแผน$/g, ''))
    expect(stages).toEqual(['Research Agent', 'Sales Proposal Agent', 'Document Agent', 'Image Agent', 'Review Agent'])
  })

  it('a request with a picked Agent starts immediately, with no Plan to confirm', async () => {
    const app = startJourney('/workspace?agent=agent-sales-proposal')

    await app.type(app.box('ข้อความ'), 'ทำใบเสนอราคาระบบกล้องวงจรปิดให้ลูกค้า ABC พร้อมรายละเอียด')
    await send(app)

    expect(screen.queryByRole('button', { name: 'เริ่มเลย' })).toBeNull()
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

    expect(screen.queryByRole('button', { name: 'เริ่มเลย' })).toBeNull()
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
    await app.click(screen.getByRole('button', { name: 'เริ่มเลย' }))
    await app.letRunsFinish()
    expectArtifactShown()
  })

  it('"ดูขั้นตอน" opens the steps as a side panel next to the Thread, closed again in one click', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ')
    await send(app)
    await app.click(screen.getByRole('button', { name: 'เริ่มเลย' }))
    await app.advance(1000)

    // Step chips stay in the conversation while the Run works, and the panel is closed.
    expect(screen.getByText(/กำลังทำ:/)).toBeVisible()
    expect(screen.queryByRole('complementary', { name: 'ขั้นตอนการทำงาน' })).toBeNull()

    await app.click(screen.getByRole('button', { name: 'ดูขั้นตอน' }))
    const panel = screen.getByRole('complementary', { name: 'ขั้นตอนการทำงาน' })
    expect(within(panel).getByText('Review Agent')).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'ข้อความ' })).toBeVisible() // the Thread is still there

    await app.click(within(panel).getByRole('button', { name: 'ปิดขั้นตอน' }))
    expect(screen.queryByRole('complementary', { name: 'ขั้นตอนการทำงาน' })).toBeNull()
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

    await app.click(screen.getByRole('button', { name: 'ตัวเลือกเพิ่มเติม' }))
    await app.click(screen.getByRole('menuitem', { name: 'ดูขั้นตอน' }))
    const panel = screen.getByRole('complementary', { name: 'ขั้นตอนการทำงาน' })
    expect(within(panel).getAllByText(/ส่งงานกลับไปที่ Research Agent/)).toHaveLength(1)
  })
})
