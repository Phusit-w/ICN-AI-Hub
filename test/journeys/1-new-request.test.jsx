import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectArtifactShown, expectWithinBudget, startJourney } from '../journey'

// Journey 1: a new request from Home ends with an Artifact.
// Budget: ≤ 2 clicks (the second only when the user has to confirm a Plan).
describe('Journey 1: new request to Artifact', () => {
  it('an employee types a request on Home, sends it, and gets an Artifact within 2 clicks', async () => {
    const app = startJourney()

    await app.type(app.box('สั่งงาน AI'), 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ')
    await app.click(screen.getByRole('button', { name: 'ส่งงาน' }))
    await app.letRunsFinish()

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expectArtifactShown()
    expectWithinBudget(app, 2)
  })
})
