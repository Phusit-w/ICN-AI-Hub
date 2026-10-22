import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { startJourney } from '../journey'

/** The brand-filled (primary) buttons and links in the page content, not the menu. */
const primaryButtons = () => {
  const main = screen.getByRole('main')
  return [...within(main).queryAllByRole('button'), ...within(main).queryAllByRole('link')]
    .filter((el) => el.className.includes('bg-brand-600'))
}

const expectOnePrimary = (name) => {
  const primaries = primaryButtons()
  expect(primaries.map((el) => el.textContent)).toHaveLength(1)
  if (name) expect(primaries[0]).toHaveAccessibleName(name)
}

describe('Create a Skill', () => {
  it('an Agent builder creates a Skill from the Skill picker; AI fills it, and it is added to the draft Agent', async () => {
    const app = startJourney('/agents/new')
    await app.type(app.box('ข้อความถึง AI'), 'ช่วยตรวจสัญญาเช่าสำนักงาน{Enter}')

    await app.click(screen.getByRole('button', { name: 'เพิ่มทักษะ' }))
    await app.click(screen.getByRole('menuitem', { name: /สร้างทักษะใหม่/ }))
    const dialog = screen.getByRole('dialog', { name: 'สร้างทักษะใหม่' })
    await app.type(within(dialog).getByRole('textbox', { name: 'อยากได้ทักษะแบบไหน' }), 'สรุปสัญญาเช่าให้เหลือ 1 หน้า พร้อมจุดที่ต้องระวัง')
    await app.click(within(dialog).getByRole('button', { name: 'ให้ AI กรอกให้' }))
    expect(within(dialog).getByRole('textbox', { name: 'ทำอะไร' })).toHaveValue('สรุปสัญญาเช่าให้เหลือ 1 หน้า พร้อมจุดที่ต้องระวัง')
    const skillName = within(dialog).getByRole('textbox', { name: 'ชื่อ' }).value
    await app.click(within(dialog).getByRole('button', { name: 'สร้างทักษะ' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText(/^สร้าง Skill .+ แล้ว/)).toBeVisible()
    expect(screen.getByRole('button', { name: `เอา ${skillName} ออก` })).toBeVisible()
    expect(app.box('ข้อความถึง AI')).toBeInTheDocument() // still in the builder, draft kept
    expect(app.box('คำอธิบาย')).toHaveValue('ช่วยตรวจสัญญาเช่าสำนักงาน')
  })

  it('extra Skill settings sit behind "ตั้งค่าขั้นสูง" and keep what AI filled in', async () => {
    const app = startJourney('/skills/new', { view: 'admin' })
    expect(screen.queryByRole('textbox', { name: /^Instruction/ })).toBeNull()

    await app.type(app.box('อยากได้ทักษะแบบไหน'), 'ตรวจคำผิดในเอกสาร')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าขั้นสูง' }))

    expect(app.box(/^Instruction/).value).toContain('ตรวจคำผิดในเอกสาร')
    expect(app.box(/^Purpose/)).toHaveValue('ตรวจคำผิดในเอกสาร')
  })

  it('each creation page has exactly one primary button', async () => {
    const app = startJourney('/skills/new', { view: 'admin' })
    expectOnePrimary('ให้ AI กรอกให้')
    await app.type(app.box('อยากได้ทักษะแบบไหน'), 'ตรวจคำผิดในเอกสาร')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    expectOnePrimary('สร้างทักษะ')
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าขั้นสูง' }))
    expectOnePrimary()
  })

  it('the Agent builder has exactly one primary button, "สร้าง Agent"', async () => {
    const app = startJourney('/agents/new', { view: 'admin' })
    expectOnePrimary('สร้าง Agent')
    await app.type(app.box('ข้อความถึง AI'), 'ร่างอีเมลตอบลูกค้า{Enter}')
    expectOnePrimary('สร้าง Agent')
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าแบบละเอียด' }))
    expectOnePrimary()
  })
})
