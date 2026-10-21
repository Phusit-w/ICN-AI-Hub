import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { startJourney } from '../journey'

// Actions under a finished Artifact (spec stories 20–22): "ดาวน์โหลด" is the one primary action,
// "บันทึกไว้ใช้ซ้ำ" is visible beside it, and copy, share and "ดูขั้นตอน" sit in a "⋯" menu.

const send = (app) => app.click(screen.getByRole('button', { name: 'ส่ง' }))

/** The row of actions under the last finished Artifact. */
const actionRow = () => screen.getAllByRole('group', { name: 'การทำงานกับผลงาน' }).at(-1)

/** Brand-coloured (primary) buttons the user can press. A disabled one turns grey, so it doesn't count. */
const primaries = (container = document.body) =>
  within(container).queryAllByRole('button').filter((b) => !b.disabled && b.className.split(/\s+/).includes('bg-brand-600'))

async function finishedMultiAgentRun() {
  const app = startJourney('/workspace?agent=agent-sales-proposal')
  await app.type(app.box('ข้อความ'), 'ทำใบเสนอราคาระบบกล้องวงจรปิดให้ลูกค้า ABC พร้อมรายละเอียด')
  await send(app)
  await app.letRunsFinish()
  return app
}

async function finishedChatRun() {
  const app = startJourney('/workspace')
  await app.type(app.box('ข้อความ'), 'สวัสดี ช่วยอะไรได้บ้าง')
  await send(app)
  await app.letRunsFinish()
  return app
}

describe.each([
  ['a multi-Agent Run', finishedMultiAgentRun],
  ['a chat Run', finishedChatRun],
])('Actions under the Artifact of %s', (_, finishRun) => {
  it('"ดาวน์โหลด" is the one primary button, and "บันทึกไว้ใช้ซ้ำ" is visible beside it', async () => {
    await finishRun()

    const row = actionRow()
    expect(primaries(row).map((b) => b.textContent)).toEqual(['ดาวน์โหลด'])
    expect(within(row).getByRole('button', { name: 'บันทึกไว้ใช้ซ้ำ' })).toBeVisible()
    for (const name of ['คัดลอก', 'แชร์', 'ดูขั้นตอน']) expect(within(row).queryByRole('button', { name })).toBeNull()
  })

  it('copy, share and "ดูขั้นตอน" are in the "⋯" menu, opened with one click', async () => {
    const app = await finishRun()

    await app.click(within(actionRow()).getByRole('button', { name: 'ตัวเลือกเพิ่มเติม' }))

    const menu = screen.getByRole('menu')
    expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['คัดลอก', 'แชร์', 'ดูขั้นตอน'])
  })

  it('"ดูขั้นตอน" from the menu opens the step side panel', async () => {
    const app = await finishRun()

    await app.click(within(actionRow()).getByRole('button', { name: 'ตัวเลือกเพิ่มเติม' }))
    await app.click(screen.getByRole('menuitem', { name: 'ดูขั้นตอน' }))

    expect(screen.queryByRole('menu')).toBeNull()
    expect(screen.getByRole('complementary', { name: 'ขั้นตอนการทำงาน' })).toBeVisible()
  })

  it('saving for reuse keeps one primary button on the page', async () => {
    const app = await finishRun()

    await app.click(within(actionRow()).getByRole('button', { name: 'บันทึกไว้ใช้ซ้ำ' }))

    expect(primaries().map((b) => b.textContent)).toEqual(['ดาวน์โหลด'])
    await app.click(screen.getByRole('button', { name: 'บันทึก' }))
    expect(screen.getByRole('link', { name: /บันทึกเป็นผู้ช่วยแล้ว/ })).toBeVisible()
  })
})

describe('A Thread with several finished Artifacts', () => {
  it('only the latest Artifact’s "ดาวน์โหลด" is primary, so the page keeps one primary button', async () => {
    const app = await finishedChatRun()
    await app.type(app.box('ข้อความ'), 'ขอบคุณมาก')
    await send(app)
    await app.letRunsFinish()

    const rows = screen.getAllByRole('group', { name: 'การทำงานกับผลงาน' })
    expect(rows).toHaveLength(2)
    expect(primaries(rows[0])).toEqual([])
    expect(primaries().map((b) => b.textContent)).toEqual(['ดาวน์โหลด'])
    expect(primaries(rows[1])).toHaveLength(1)
  })
})

describe('The "⋯" menu from the keyboard', () => {
  it('opens with Enter, moves with the arrow keys, runs an item with Enter, and closes with Escape', async () => {
    const app = await finishedMultiAgentRun()
    const more = within(actionRow()).getByRole('button', { name: 'ตัวเลือกเพิ่มเติม' })
    const clicksBefore = app.clicks

    await app.type(more, '{Enter}')
    expect(screen.getByRole('menuitem', { name: 'คัดลอก' })).toHaveFocus()
    await app.type(document.activeElement, '{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'แชร์' })).toHaveFocus()
    await app.type(document.activeElement, '{ArrowUp}{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'ดูขั้นตอน' })).toHaveFocus()

    await app.type(document.activeElement, '{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(more).toHaveFocus()

    await app.type(more, '{ArrowDown}')
    await app.type(document.activeElement, '{End}{Enter}')
    expect(screen.getByRole('complementary', { name: 'ขั้นตอนการทำงาน' })).toBeVisible()
    expect(app.clicks).toBe(clicksBefore)
  })
})
