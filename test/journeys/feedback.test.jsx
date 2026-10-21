import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { mainMenu, startJourney } from '../journey'

// Ticket 03: Feedback 👍/👎 under each Artifact replaces star ratings (spec stories 27–33).

const send = (app) => app.click(screen.getByRole('button', { name: 'ส่ง' }))
const actionRow = () => screen.getAllByRole('group', { name: 'การทำงานกับผลงาน' }).at(-1)
const helpful = () => within(actionRow()).getByRole('button', { name: 'มีประโยชน์' })
/** A star rating as it used to show, e.g. "4.8". */
const RATING = /^\d\.\d$/

const notHelpful = () => within(actionRow()).getByRole('button', { name: 'ไม่มีประโยชน์' })

async function finishedChatRun() {
  const app = startJourney('/workspace')
  await app.type(app.box('ข้อความ'), 'สวัสดี ช่วยอะไรได้บ้าง')
  await send(app)
  await app.letRunsFinish()
  return app
}

describe('Feedback under an Artifact', () => {
  it('👍 marks the Artifact as helpful in one click', async () => {
    const app = await finishedChatRun()
    expect(helpful()).toHaveAttribute('aria-pressed', 'false')

    await app.click(helpful())

    expect(helpful()).toHaveAttribute('aria-pressed', 'true')
    expect(notHelpful()).toHaveAttribute('aria-pressed', 'false')
  })

  it('👎 offers an optional short reason', async () => {
    const app = await finishedChatRun()

    await app.click(notHelpful())
    expect(notHelpful()).toHaveAttribute('aria-pressed', 'true')
    await app.type(app.box('เหตุผล (ไม่บังคับ)'), 'ข้อมูลไม่ครบ')
    await app.click(screen.getByRole('button', { name: 'ส่งเหตุผล' }))

    expect(screen.queryByRole('textbox', { name: 'เหตุผล (ไม่บังคับ)' })).toBeNull()
    expect(screen.getByText('ขอบคุณสำหรับ Feedback')).toBeVisible()
  })

  it('pressing 👎 again keeps the reason already given', async () => {
    const app = await finishedChatRun()

    await app.click(notHelpful())
    await app.type(app.box('เหตุผล (ไม่บังคับ)'), 'ข้อมูลไม่ครบ')
    await app.click(screen.getByRole('button', { name: 'ส่งเหตุผล' }))
    await app.click(notHelpful())

    expect(app.box('เหตุผล (ไม่บังคับ)')).toHaveValue('ข้อมูลไม่ครบ')
  })

  it('the verdict can be changed after a mis-click', async () => {
    const app = await finishedChatRun()

    await app.click(notHelpful())
    await app.click(helpful())

    expect(helpful()).toHaveAttribute('aria-pressed', 'true')
    expect(notHelpful()).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('textbox', { name: 'เหตุผล (ไม่บังคับ)' })).toBeNull()
  })
})

describe("An Agent's Feedback summary", () => {
  it('the Agent page says how helpful colleagues found it, instead of stars', () => {
    startJourney('/agents/agent-sales-proposal')
    expect(screen.getByText('มีประโยชน์ 92% จาก 37 ครั้ง')).toBeVisible()
    expect(screen.queryByText(RATING)).toBeNull()
  })

  it('an Agent nobody has given Feedback yet says so, instead of 0%', () => {
    startJourney('/agents/agent-policy-audit')
    expect(screen.getByText('ยังไม่มี Feedback')).toBeVisible()
    expect(screen.queryByText(/0%/)).toBeNull()
  })

  it("my Feedback counts in the Agent's summary right away", async () => {
    const app = startJourney('/workspace?agent=agent-sales-proposal')
    await app.type(app.box('ข้อความ'), 'ทำใบเสนอราคาระบบกล้องวงจรปิดให้ลูกค้า ABC พร้อมรายละเอียด')
    await send(app)
    await app.letRunsFinish()

    await app.click(notHelpful())
    await app.click(within(mainMenu()).getByRole('link', { name: 'ผู้ช่วย AI' }))
    await app.click(screen.getAllByRole('link', { name: 'Sales Proposal Agent' })[0])

    expect(screen.getByText('มีประโยชน์ 89% จาก 38 ครั้ง')).toBeVisible()
  })
})

describe('No star ratings left', () => {
  it('the Agents library has no ratings and no "คะแนนสูงสุด" sort', async () => {
    const app = startJourney('/agents')
    await app.click(screen.getByRole('button', { name: /ตัวกรอง/ }))
    const sort = screen.getByRole('combobox', { name: 'เรียงตาม' })
    expect(within(sort).getAllByRole('option').map((o) => o.textContent)).not.toContain('คะแนนสูงสุด')
    expect(screen.queryAllByText(RATING)).toEqual([])
  })

  it('Skill cards and details have no ratings', async () => {
    const app = startJourney('/agents?tab=skills')
    expect(screen.queryAllByText(RATING)).toEqual([])
    await app.click(screen.getAllByRole('button', { name: 'รายละเอียด' })[0])
    expect(within(screen.getByRole('dialog')).queryAllByText(RATING)).toEqual([])
  })

  it('an opened Workflow has no rating', () => {
    startJourney('/workflows?id=wf-sales-proposal')
    expect(screen.queryAllByText(RATING)).toEqual([])
  })
})
