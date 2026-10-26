import { describe, expect, it } from 'vitest'
import { act, screen, within } from '@testing-library/react'
import { mainMenu, startJourney } from '../journey'

// Personal agent, ticket 06: the Admin switches the apps on and off for the whole company, can unlink one User's LINE or close an
// account, and the Office Add-in is simulated as a side panel.

const phone = () => within(screen.getByRole('region', { name: 'หน้าจอ LINE (จำลอง)' }))
async function say(app, text) {
  await app.type(phone().getByRole('textbox', { name: 'พิมพ์ใน LINE' }), text)
  await app.click(phone().getByRole('button', { name: 'ส่งใน LINE' }))
}
async function linkAccount(app) {
  await app.click(screen.getByRole('button', { name: 'รับรหัสผูกบัญชี' }))
  await say(app, screen.getByLabelText('รหัสผูกบัญชี').textContent)
}
const asAdmin = (app) => act(() => app.store.actions.setView('admin'))
const asUser = (app) => act(() => app.store.actions.setView('user'))
async function openConnections(app) {
  await app.click(within(mainMenu()).getByRole('link', { name: /ภาพรวมและการกำกับดูแล/ }))
  await app.click(screen.getByRole('tab', { name: 'การเชื่อมต่อ' }))
  return within(screen.getByRole('tabpanel', { name: 'การเชื่อมต่อ' }))
}
async function expectLogged(app, text) {
  await app.click(screen.getByRole('tab', { name: 'Audit log' }))
  expect(within(screen.getByRole('tabpanel', { name: 'Audit log' })).getAllByText(text)[0]).toBeVisible()
}
const openLine = async (app) => {
  await app.click(screen.getByRole('button', { name: /โปรไฟล์และมุมมอง/ }))
  await app.click(screen.getByRole('menuitem', { name: 'Agent ของคุณ' }))
  await app.click(screen.getByRole('link', { name: 'LINE' }))
}

describe('Admin switches', () => {
  it('every app starts off, so nothing answers until the Admin switches it on', async () => {
    startJourney('/agent/line')
    expect(phone().getByText(/Admin ปิด LINE ไว้/)).toBeVisible()
    expect(phone().getByRole('textbox', { name: 'พิมพ์ใน LINE' })).toBeDisabled()
  })

  it('switching LINE off stops the bot for everyone, switching it on brings it back, and both are logged', async () => {
    const app = startJourney('/agent/line', { apps: ['line'] })
    await linkAccount(app)
    await asAdmin(app)
    let panel = await openConnections(app)
    await app.click(panel.getByRole('switch', { name: 'เปิด LINE ทั้งบริษัท' }))
    await expectLogged(app, 'ปิด LINE ทั้งบริษัท')

    await asUser(app)
    await openLine(app)
    expect(phone().getByText(/Admin ปิด LINE ไว้/)).toBeVisible()
    expect(phone().getByRole('textbox', { name: 'พิมพ์ใน LINE' })).toBeDisabled()

    await asAdmin(app)
    panel = await openConnections(app)
    await app.click(panel.getByRole('switch', { name: 'เปิด LINE ทั้งบริษัท' }))
    await expectLogged(app, 'เปิด LINE ทั้งบริษัท')
    await asUser(app)
    await openLine(app)
    await say(app, 'สวัสดี')
    expect(within(phone().getByRole('log')).getByText(/รับงานแล้ว/)).toBeVisible()
  })

  it('unlinking one User makes only them link again', async () => {
    const app = startJourney('/agent/line', { apps: ['line'] })
    await linkAccount(app)
    await asAdmin(app)
    await linkAccount(app) // the Admin links their own LINE too

    const panel = await openConnections(app)
    expect(panel.getByText('ผูกบัญชีแล้ว 2 คน')).toBeVisible()
    await app.click(panel.getByRole('button', { name: 'ตัดการเชื่อม somchai.a' }))
    expect(panel.getByText('ผูกบัญชีแล้ว 1 คน')).toBeVisible()
    expect(app.store.state.line['u-kittipong'].linked).toBe(true)
    expect(app.store.state.line['u-kanya'].linked).toBe(false)

    await asUser(app)
    await openLine(app)
    expect(screen.getByRole('button', { name: /รับรหัสผูกบัญชี|ขอรหัสใหม่/ })).toBeVisible()
  })

  it('closing an account deletes that person’s Memory and Connections', async () => {
    const app = startJourney('/agent/line', { apps: ['line'] })
    await linkAccount(app)
    expect(app.store.state.personal['u-kanya'].memories.length).toBeGreaterThan(0)
    await asAdmin(app)
    const panel = await openConnections(app)
    await app.click(panel.getByRole('button', { name: 'ปิดบัญชี somchai.a' }))
    expect(panel.queryByRole('button', { name: 'ปิดบัญชี somchai.a' })).toBeNull()
    expect(app.store.state.personal['u-kanya']).toBeUndefined()
    expect(app.store.state.line['u-kanya']).toBeUndefined()
    await expectLogged(app, 'ปิดบัญชี somchai.a')
  })
})

describe('Office Add-in panel (simulated)', () => {
  it('summarises the selected cells of the open Excel file back into the file', async () => {
    const app = startJourney('/agent/addin', { apps: ['addin'] })
    expect(screen.getByRole('button', { name: 'สรุป' })).toBeDisabled() // nothing selected yet
    await app.click(screen.getByRole('checkbox', { name: 'เลือก: กรกฎาคม | 1.2 ล้านบาท' }))
    await app.click(screen.getByRole('checkbox', { name: 'เลือก: สิงหาคม | 1.4 ล้านบาท' }))
    await app.click(screen.getByRole('button', { name: 'สรุป' }))
    expect(screen.getByRole('region', { name: 'ผลที่ใส่ในเอกสาร' })).toHaveTextContent('สรุปช่วงข้อมูล 2 รายการ: กรกฎาคม · สิงหาคม')
  })

  it('cannot be used while the Admin has Office Add-in off', async () => {
    const app = startJourney('/agent/addin')
    expect(screen.getByText(/Admin ปิด Office Add-in ไว้/)).toBeVisible()
    await app.click(screen.getByRole('checkbox', { name: 'เลือก: กรกฎาคม | 1.2 ล้านบาท' }))
    expect(screen.getByRole('button', { name: 'สรุป' })).toBeDisabled()
  })
})
