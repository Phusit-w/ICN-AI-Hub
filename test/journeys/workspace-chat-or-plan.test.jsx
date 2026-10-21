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
    expect(screen.getByText(/ICN Assistant ผู้ช่วย AI ของบริษัท/)).toBeVisible()
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

  it('a request matched to a Workflow by keyword is still a system Plan and waits for "เริ่มเลย"', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Siam Logistics')
    await send(app)

    expect(screen.getByRole('button', { name: 'เริ่มเลย' })).toBeVisible()
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

  it('a request with a picked Workflow starts immediately, with no Plan to confirm', async () => {
    const app = startJourney('/workspace?workflow=wf-market-report')

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

  it('the Thread history still collapses and expands', async () => {
    const app = startJourney('/workspace')

    await app.click(screen.getByRole('button', { name: 'ซ่อนประวัติการสั่งงาน' }))
    await app.click(screen.getByRole('button', { name: 'แสดงประวัติการสั่งงาน' }))
    expect(screen.getByRole('button', { name: 'ซ่อนประวัติการสั่งงาน' })).toBeVisible()
  })

  it('sensitive data still shows the internal-AI notice', async () => {
    const app = startJourney('/workspace')

    await app.type(app.box('ข้อความ'), 'สรุปเงินเดือนพนักงานฝ่ายขายเป็นรายงาน')
    await send(app)

    expect(screen.getByText(/ประมวลผลบน AI ภายในบริษัท ข้อมูลไม่ออกนอกองค์กร/)).toBeVisible()
  })

  it('there is no chat/Workflow mode toggle', () => {
    startJourney('/workspace')

    expect(screen.queryByRole('tablist', { name: 'รูปแบบการแสดงผล' })).toBeNull()
    expect(screen.queryByRole('tab', { name: /Workflow/ })).toBeNull()
    expect(screen.queryByText(/โหมด/)).toBeNull()
  })
})
