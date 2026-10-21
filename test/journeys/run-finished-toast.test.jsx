import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectArtifactShown, expectWithinBudget, mainMenu, startJourney } from '../journey'

// A long Run tells the user when it is done, unless they are already looking at it (spec stories 47–50).

const CHAT = 'สวัสดี ช่วยอะไรได้บ้าง'
const PROMPT = 'ทำใบเสนอราคาระบบกล้องวงจรปิดให้ลูกค้า ABC พร้อมรายละเอียด'

/** Open new chat with an Agent picked and send a request, so its multi-Agent Run starts straight away. */
async function startLongRun() {
  const app = startJourney('/workspace?agent=agent-sales-proposal')
  await app.type(app.box('ข้อความ'), PROMPT)
  await app.click(screen.getByRole('button', { name: 'ส่ง' }))
  return app
}

/** The toast saying the Run for `prompt` is done (other Runs, such as seeded ones, may finish too). */
const finishedToast = (prompt = PROMPT) => screen.queryByText((_, el) => el.tagName === 'P' && el.textContent.startsWith(`งานของคุณเสร็จแล้ว: “${prompt}”`))

describe('Run-finished toast', () => {
  it('a Run finishing while the user is on another page shows a toast that opens its Thread in one click', async () => {
    const app = await startLongRun()
    const threadUrl = app.url()

    await app.click(within(mainMenu()).getByRole('link', { name: 'ผู้ช่วย AI' }))
    await app.letRunsFinish()

    expect(finishedToast()).toBeInTheDocument()
    const clicksBefore = app.clicks
    await app.click(screen.getByRole('link', { name: 'เปิดดู' }))

    expect(app.url()).toBe(threadUrl)
    expectArtifactShown()
    expect(app.clicks - clicksBefore).toBe(1)
  })

  it('a Run finishing while the user is in another Thread shows the toast too', async () => {
    const app = await startLongRun()

    await app.click(within(screen.getByRole('navigation', { name: 'ประวัติแชต' })).getByRole('link', { name: /หาข้อมูลตลาด EV Charger/ }))
    await app.letRunsFinish()

    expect(finishedToast()).toBeInTheDocument()
    expectWithinBudget(app, 2)
  })

  it('no toast while the user is looking at the Thread', async () => {
    const app = await startLongRun()

    await app.letRunsFinish()

    expectArtifactShown()
    expect(finishedToast()).toBeNull()
  })

  it('no toast for a quick chat answer, even after leaving its Thread', async () => {
    const app = startJourney('/workspace')
    await app.type(app.box('ข้อความ'), CHAT)
    await app.click(screen.getByRole('button', { name: 'ส่ง' }))

    await app.click(within(mainMenu()).getByRole('link', { name: 'ผู้ช่วย AI' }))
    await app.letRunsFinish()

    expect(finishedToast(CHAT)).toBeNull()
  })
})
