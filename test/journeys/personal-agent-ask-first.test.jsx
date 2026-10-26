import { describe, expect, it } from 'vitest'
import { act, screen, within } from '@testing-library/react'
import { mainMenu, newChatLink, startJourney } from '../journey'

// Personal agent, ticket 03: sending or writing outside the app waits for the User's yes ("ถามก่อนลงมือ"), unless the
// User has set that kind to automatic. Email and Excel on Office365 are simulated.

const EMAIL = 'ร่างอีเมลตอบลูกค้าเรื่องส่งของล่าช้า'
const EXCEL = 'เพิ่มแถวสรุปประชุมทีมขายลงใน Excel'

const send = (app) => app.click(screen.getByRole('button', { name: 'ส่ง' }))
async function ask(app, text) {
  await app.type(app.box('ข้อความ'), text)
  await send(app)
  if (screen.queryByRole('button', { name: 'เริ่มทำงาน' })) await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
  await app.letRunsFinish()
}
const card = () => within(screen.getByRole('region', { name: 'ถามก่อนลงมือ' }))

describe('Asking before acting', () => {
  it('an email is drafted for checking; "ส่ง" sends it (simulated) and "ไม่ทำ" sends nothing', async () => {
    const app = startJourney('/', { apps: ['email', 'office365'] })
    await ask(app, EMAIL)
    expect(card().getByText(/^เรื่อง ร่างอีเมลตอบลูกค้า/)).toBeVisible()
    expect(card().getByText(/เรียน ผู้เกี่ยวข้อง/)).toBeVisible()
    await app.click(card().getByRole('button', { name: 'ส่ง' }))
    expect(screen.getByRole('region', { name: 'ผลการลงมือ' })).toHaveTextContent('ส่งอีเมลแล้ว (จำลอง)')

    await app.click(newChatLink())
    await ask(app, EMAIL)
    await app.click(card().getByRole('button', { name: 'ไม่ทำ' }))
    expect(screen.getByRole('region', { name: 'ผลการลงมือ' })).toHaveTextContent('ไม่มีอะไรถูกส่ง')
    expect(app.store.state.runs.filter((r) => r.outward?.status === 'done')).toHaveLength(1)
  })

  it('"เพิ่ม" adds the row at the end of the Office365 file, and nothing in the file can be deleted or overwritten', async () => {
    const app = startJourney('/', { apps: ['email', 'office365'] })
    const before = app.store.state.office365.excel.rows
    await ask(app, EXCEL)
    expect(card().getByText(/ต่อท้ายไฟล์ ตารางงานทีม.xlsx บน Office365/)).toBeVisible()
    expect(card().queryByRole('button', { name: /ลบ|แก้|เขียนทับ/ })).toBeNull()
    expect(app.store.state.office365.excel.rows).toEqual(before) // asking changes nothing

    await app.click(card().getByRole('button', { name: 'เพิ่ม' }))
    const result = within(screen.getByRole('region', { name: 'ผลการลงมือ' }))
    expect(result.getByText(`เพิ่มแถวที่ ${before.length + 1} ในไฟล์แล้ว`)).toBeVisible()
    const after = app.store.state.office365.excel.rows
    expect(after.slice(0, before.length)).toEqual(before)
    expect(after).toHaveLength(before.length + 1)
    expect(within(result.getByRole('table', { name: 'ตารางงานทีม.xlsx' })).getAllByRole('row')).toHaveLength(after.length + 1)
    expect(result.queryByRole('button')).toBeNull()
  })

  it('"ทำเองเลย" for Excel skips the question; switching it off asks again; the other kinds still ask', async () => {
    const app = startJourney('/agent', { apps: ['email', 'office365'] })
    await app.click(screen.getByRole('switch', { name: 'ทำเองเลย: เพิ่มแถวใน Excel' }))
    await app.click(newChatLink())
    await ask(app, EXCEL)
    expect(screen.queryByRole('region', { name: 'ถามก่อนลงมือ' })).toBeNull()
    expect(screen.getByRole('region', { name: 'ผลการลงมือ' })).toHaveTextContent('ทำเองตามที่ตั้งไว้')

    await app.click(newChatLink())
    await ask(app, EMAIL) // email was not switched on
    expect(screen.getByRole('region', { name: 'ถามก่อนลงมือ' })).toBeVisible()

    await app.click(screen.getByRole('button', { name: /โปรไฟล์และมุมมอง/ }))
    await app.click(screen.getByRole('menuitem', { name: 'Agent ของคุณ' }))
    await app.click(screen.getByRole('switch', { name: 'ทำเองเลย: เพิ่มแถวใน Excel' }))
    await app.click(newChatLink())
    await ask(app, EXCEL)
    expect(screen.getByRole('region', { name: 'ถามก่อนลงมือ' })).toBeVisible()
  })

  it('reading and drafting need no yes: an ordinary request shows no card', async () => {
    const app = startJourney('/', { apps: ['email', 'office365'] })
    await ask(app, 'สรุปข้อมูลตลาดลูกค้าค้าปลีกในไทย และทำรายงาน')
    expect(screen.queryByRole('region', { name: /ถามก่อนลงมือ|ผลการลงมือ/ })).toBeNull()
  })

  it('every outward action, asked or automatic, and a refusal, is written to the audit log', async () => {
    const app = startJourney('/', { apps: ['email', 'office365'] })
    await ask(app, EMAIL)
    await app.click(card().getByRole('button', { name: 'ส่ง' }))
    await app.click(newChatLink())
    await ask(app, EXCEL)
    await app.click(card().getByRole('button', { name: 'ไม่ทำ' }))

    act(() => app.store.actions.setView('admin'))
    await app.click(within(mainMenu()).getByRole('link', { name: /ภาพรวมและการกำกับดูแล/ }))
    await app.click(screen.getByRole('tab', { name: 'Audit log' }))
    const log = within(screen.getByRole('tabpanel', { name: 'Audit log' }))
    expect(log.getByText(/ส่งอีเมล \(จำลอง\): เรื่อง ร่างอีเมลตอบลูกค้า/)).toBeVisible()
    expect(log.getByText('ผู้ใช้ยืนยัน')).toBeVisible()
    expect(log.getByText(/ไม่เพิ่มแถวใน Excel: ผู้ใช้เลือกไม่ทำ/)).toBeVisible()
  })

  describe('a Run started by a Schedule', () => {
    const openStepLog = async (app) => app.click(within(screen.getByRole('navigation', { name: 'ประวัติแชต' })).getByRole('link', { name: 'บันทึกก้าวเดิน' }))

    it('waits for the User’s yes before adding its week to the Excel file', async () => {
      const app = startJourney('/', { apps: ['email', 'office365'] })
      const before = app.store.state.office365.excel.rows
      await openStepLog(app)

      expect(card().getByText(/ต่อท้ายไฟล์ ตารางงานทีม.xlsx/)).toBeVisible()
      expect(app.store.state.office365.excel.rows).toEqual(before)
      await app.click(card().getByRole('button', { name: 'เพิ่ม' }))
      expect(app.store.state.office365.excel.rows).toHaveLength(before.length + 1)
    })

    it('goes ahead by itself once the User has set Excel to automatic', async () => {
      const app = startJourney('/agent', { apps: ['email', 'office365'] })
      await app.click(screen.getByRole('switch', { name: 'ทำเองเลย: เพิ่มแถวใน Excel' }))
      const before = app.store.state.office365.excel.rows.length
      await app.click(newChatLink())
      await openStepLog(app)

      expect(screen.queryByRole('region', { name: 'ถามก่อนลงมือ' })).toBeNull()
      expect(screen.getByRole('region', { name: 'ผลการลงมือ' })).toHaveTextContent('ทำเองตามที่ตั้งไว้')
      expect(app.store.state.office365.excel.rows).toHaveLength(before + 1)
    })
  })
})
