import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectWithinBudget, startJourney } from '../journey'

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

describe('Create a Skill the same way as an Agent', () => {
  it('an Agent builder describes a Skill on the Skills tab, lets AI fill it, and creates it within 3 clicks', async () => {
    const app = startJourney('/agents?tab=skills')

    await app.click(screen.getByRole('link', { name: 'สร้างทักษะใหม่' }))
    await app.type(app.box('อยากได้ทักษะแบบไหน'), 'สรุปสัญญาเช่าให้เหลือ 1 หน้า พร้อมจุดที่ต้องระวัง')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    expect(app.box('ชื่อ')).not.toHaveValue('')
    expect(app.box('ทำอะไร')).toHaveValue('สรุปสัญญาเช่าให้เหลือ 1 หน้า พร้อมจุดที่ต้องระวัง')
    await app.click(screen.getByRole('button', { name: 'สร้างทักษะ' }))

    expect(app.url()).toMatch(/^\/agents\?tab=skills&open=skill-/)
    expect(screen.getByText(/^สร้าง Skill .+ แล้ว/)).toBeVisible()
    expectWithinBudget(app, 3)
  })

  it('extra Skill settings sit behind "ตั้งค่าขั้นสูง" and keep what AI filled in', async () => {
    const app = startJourney('/skills/new')
    expect(screen.queryByRole('textbox', { name: /^Instruction/ })).toBeNull()

    await app.type(app.box('อยากได้ทักษะแบบไหน'), 'ตรวจคำผิดในเอกสาร')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าขั้นสูง' }))

    expect(app.box(/^Instruction/).value).toContain('ตรวจคำผิดในเอกสาร')
    expect(app.box(/^Purpose/)).toHaveValue('ตรวจคำผิดในเอกสาร')
  })

  it('each creation page has exactly one primary button', async () => {
    const app = startJourney('/skills/new')
    expectOnePrimary('ให้ AI กรอกให้')
    await app.type(app.box('อยากได้ทักษะแบบไหน'), 'ตรวจคำผิดในเอกสาร')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    expectOnePrimary('สร้างทักษะ')
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าขั้นสูง' }))
    expectOnePrimary()
  })

  it('Create Agent also has exactly one primary button at each point', async () => {
    const app = startJourney('/agents/new')
    expectOnePrimary('ให้ AI กรอกให้')
    await app.type(app.box('อยากได้ผู้ช่วยแบบไหน'), 'ร่างอีเมลตอบลูกค้า')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    expectOnePrimary('สร้างผู้ช่วย')
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าขั้นสูง' }))
    expectOnePrimary()
  })
})
