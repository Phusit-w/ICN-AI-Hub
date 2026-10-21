import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectWithinBudget, startJourney } from '../journey'

// Journey 4: create an Agent. Budget: ≤ 3 clicks from Home.
describe('Journey 4: create an Agent', () => {
  it('an employee describes the Agent they need, lets AI fill the form, and creates it within 3 clicks', async () => {
    const app = startJourney()

    await app.click(screen.getByRole('link', { name: /สร้างเองได้/ }))
    await app.type(app.box('อยากได้ผู้ช่วยแบบไหน'), 'ช่วยร่างอีเมลตอบลูกค้าที่ร้องเรียนเรื่องส่งของช้า')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    await app.click(screen.getByRole('button', { name: 'สร้างผู้ช่วย' }))

    expect(app.url()).toMatch(/^\/agents\/(?!new)/)
    expect(screen.getByText(/^สร้าง .+ แล้ว/)).toBeVisible()
    expectWithinBudget(app, 3)
  })
})
