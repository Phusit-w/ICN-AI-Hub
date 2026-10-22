import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { mainMenu, startJourney } from '../journey'

// Ticket 02: sharing with the whole company goes through the Admin (spec stories 14, 15, 17–20).
describe('Company sharing request', () => {
  it('a User who shares an Agent with the whole company sees it waiting, shared with the department meanwhile', async () => {
    const app = startJourney('/agents/new')

    await app.type(app.box('ข้อความถึง AI'), 'ช่วยร่างอีเมลตอบลูกค้าที่ร้องเรียนเรื่องส่งของช้า{Enter}')
    await app.click(screen.getByRole('button', { name: /^Company/ }))
    await app.click(screen.getByRole('button', { name: 'สร้าง Agent' }))

    expect(screen.getByText('รออนุมัติ')).toBeVisible()
    expect(screen.getByText('ในแผนก')).toBeVisible()
    expect(screen.queryByText('ทั้งบริษัท')).toBeNull()
  })

  it('a User who shares a Skill with the whole company sees it waiting too', async () => {
    const app = startJourney('/skills/new')

    await app.type(app.box('อยากได้ทักษะแบบไหน'), 'สรุปสัญญาเช่าให้เหลือ 1 หน้า')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    await app.click(screen.getByRole('button', { name: /^Company/ }))
    await app.click(screen.getByRole('button', { name: 'สร้างทักษะ' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('รออนุมัติ')).toBeVisible()
    expect(within(dialog).getByText('ในแผนก')).toBeVisible()
  })

  it('the Admin sees each pending request with who asked, for what, and when', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    await app.click(screen.getByRole('tab', { name: /คำขอแชร์ทั้งบริษัท/ }))

    const rows = within(screen.getByRole('tabpanel', { name: /คำขอแชร์ทั้งบริษัท/ })).getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('SOC Check Agent')
    expect(rows[0]).toHaveTextContent('Ploy K.')
    expect(rows[0]).toHaveTextContent('3 ชม.ที่แล้ว')
  })

  it('the permissions table has just two roles, User and Admin, and only the Admin approves company sharing', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    await app.click(screen.getByRole('tab', { name: 'สิทธิ์การใช้งาน' }))
    const table = within(screen.getByRole('tabpanel', { name: 'สิทธิ์การใช้งาน' })).getByRole('table')
    expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['Capability', 'User', 'Admin'])
    const approve = within(table).getByText('อนุมัติการแชร์ระดับบริษัท').closest('tr')
    expect(within(approve).getByLabelText('ไม่อนุญาต')).toBeInTheDocument()
    expect(within(approve).getByLabelText('อนุญาต')).toBeInTheDocument()
  })

  it('approving shares the item with the whole company, takes it off the list and writes the audit log', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    await app.click(screen.getByRole('tab', { name: /คำขอแชร์ทั้งบริษัท/ }))
    const panel = screen.getByRole('tabpanel', { name: /คำขอแชร์ทั้งบริษัท/ })
    const row = within(panel).getByText('SOC Check Agent').closest('li')

    await app.click(within(row).getByRole('button', { name: 'อนุมัติ' }))

    expect(within(panel).queryByText('SOC Check Agent')).toBeNull()
    await app.click(screen.getByRole('tab', { name: 'Audit log' }))
    expect(within(screen.getByRole('tabpanel', { name: 'Audit log' })).getByText(/อนุมัติคำขอแชร์ทั้งบริษัท: SOC Check Agent/)).toBeInTheDocument()
    await app.click(within(mainMenu()).getByRole('link', { name: 'AI Agent' }))
    await app.click(screen.getAllByRole('link', { name: /SOC Check Agent/ })[0])
    expect(screen.getByText('ทั้งบริษัท')).toBeVisible()
  })

  it('sending a request back keeps the item in the department, takes it off the list and writes the audit log', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    await app.click(screen.getByRole('tab', { name: /คำขอแชร์ทั้งบริษัท/ }))
    const panel = screen.getByRole('tabpanel', { name: /คำขอแชร์ทั้งบริษัท/ })
    const row = within(panel).getByText('SOC Check Agent').closest('li')

    await app.click(within(row).getByRole('button', { name: 'ส่งกลับ' }))

    expect(within(panel).queryByText('SOC Check Agent')).toBeNull()
    await app.click(screen.getByRole('tab', { name: 'Audit log' }))
    expect(within(screen.getByRole('tabpanel', { name: 'Audit log' })).getByText(/ส่งกลับคำขอแชร์ทั้งบริษัท: SOC Check Agent/)).toBeInTheDocument()
    await app.click(within(mainMenu()).getByRole('link', { name: 'AI Agent' }))
    await app.click(screen.getAllByRole('link', { name: /SOC Check Agent/ })[0])
    expect(screen.getByText('ในแผนก')).toBeVisible()
    expect(screen.queryByText('รออนุมัติ')).toBeNull()
  })
})
