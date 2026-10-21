import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { startJourney } from '../journey'

// Ticket 06: governance shows 4 headline numbers, with details in tabs below.
describe('Governance: headline numbers and detail tabs', () => {
  it('shows cost, number of Runs, local AI share and policy alerts at the top', () => {
    startJourney('/governance')
    const headline = screen.getByRole('region', { name: 'ตัวเลขสำคัญ' })
    expect(within(headline).getByText('ค่าใช้จ่ายเดือนนี้')).toBeInTheDocument()
    expect(within(headline).getByText('จำนวนงาน')).toBeInTheDocument()
    expect(within(headline).getByText('ประมวลผลบน Local AI')).toBeInTheDocument()
    expect(within(headline).getByText('แจ้งเตือนนโยบาย')).toBeInTheDocument()
    expect(within(headline).getByText('63%')).toBeInTheDocument()
    expect(within(headline).queryByText(/active users/i)).not.toBeInTheDocument()
  })

  it('puts each detail section in a tab, one shown at a time', async () => {
    const app = startJourney('/governance')
    const tabs = within(screen.getByRole('tablist', { name: 'รายละเอียด' })).getAllByRole('tab')
    expect(tabs.map((t) => t.textContent)).toEqual([
      'ค่าใช้จ่ายและ Model', 'แผนก', 'นโยบายข้อมูล', 'สิทธิ์การใช้งาน', 'Audit log', 'ผู้มีส่วนร่วม',
    ])
    expect(screen.getByRole('tabpanel', { name: 'ค่าใช้จ่ายและ Model' })).toBeInTheDocument()
    expect(screen.queryByText('บันทึกเหตุการณ์สำคัญวันนี้')).not.toBeInTheDocument()

    await app.click(screen.getByRole('tab', { name: 'Audit log' }))
    expect(screen.getByRole('tab', { name: 'Audit log' })).toHaveAttribute('aria-selected', 'true')
    const panel = screen.getByRole('tabpanel', { name: 'Audit log' })
    expect(within(panel).getByText('พยายามส่งไฟล์เงินเดือนไป Cloud Model')).toBeInTheDocument()
    expect(screen.queryByRole('tabpanel', { name: 'ค่าใช้จ่ายและ Model' })).not.toBeInTheDocument()
  })

  it('has a contributors tab that is empty for now', async () => {
    const app = startJourney('/governance')
    await app.click(screen.getByRole('tab', { name: 'ผู้มีส่วนร่วม' }))
    expect(within(screen.getByRole('tabpanel', { name: 'ผู้มีส่วนร่วม' })).getByText('ยังไม่มีข้อมูลผู้มีส่วนร่วม')).toBeInTheDocument()
  })

  it('moves between tabs with the arrow, Home and End keys', async () => {
    const app = startJourney('/governance')
    const first = screen.getByRole('tab', { name: 'ค่าใช้จ่ายและ Model' })
    expect(first).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'แผนก' })).toHaveAttribute('tabindex', '-1')

    await app.type(first, '{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'แผนก' })).toHaveFocus()
    expect(screen.getByRole('tabpanel', { name: 'แผนก' })).toBeInTheDocument()

    await app.type(screen.getByRole('tab', { name: 'แผนก' }), '{End}')
    expect(screen.getByRole('tab', { name: 'ผู้มีส่วนร่วม' })).toHaveAttribute('aria-selected', 'true')

    await app.type(screen.getByRole('tab', { name: 'ผู้มีส่วนร่วม' }), '{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'ค่าใช้จ่ายและ Model' })).toHaveFocus()

    await app.type(screen.getByRole('tab', { name: 'ค่าใช้จ่ายและ Model' }), '{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'ผู้มีส่วนร่วม' })).toHaveFocus()

    await app.type(screen.getByRole('tab', { name: 'ผู้มีส่วนร่วม' }), '{Home}')
    expect(screen.getByRole('tab', { name: 'ค่าใช้จ่ายและ Model' })).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps a policy switched off after visiting another tab', async () => {
    const app = startJourney('/governance')
    await app.click(screen.getByRole('tab', { name: 'นโยบายข้อมูล' }))
    const policy = screen.getByRole('switch', { name: 'ห้ามส่งข้อมูลเงินเดือนออกนอก HR' })
    expect(policy).toBeChecked()
    await app.click(policy)
    await app.click(screen.getByRole('tab', { name: 'Audit log' }))
    await app.click(screen.getByRole('tab', { name: 'นโยบายข้อมูล' }))
    expect(screen.getByRole('switch', { name: 'ห้ามส่งข้อมูลเงินเดือนออกนอก HR' })).not.toBeChecked()
  })

  it('keeps the tour target for local AI visible by default', () => {
    startJourney('/governance')
    const target = document.querySelector('[data-tour="gov-local"]')
    expect(target).not.toBeNull()
    expect(target.closest('[hidden]')).toBeNull()
  })
})
