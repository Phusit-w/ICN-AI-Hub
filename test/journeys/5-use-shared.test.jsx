import { describe, expect, it } from 'vitest'
import { within } from '@testing-library/react'
import {
  actionFor, expectAgentPicked, expectWithinBudget, mainMenu, startJourney,
} from '../journey'

// Journey 5: find an Agent (with or without Steps) someone else shared, and use it. Budget: ≤ 2 clicks from Home.
// "IT Support Agent" and "IT Incident Triage" are shared by the IT department, not the current user.
describe('Journey 5: find something shared and use it', () => {
  it('an employee finds a shared Agent and uses it within 2 clicks', async () => {
    const app = startJourney()

    await app.click(within(mainMenu()).getByRole('link', { name: /AI Agent/ }))
    await app.click(actionFor('IT Support Agent', 'ใช้งาน'))

    expect(app.url()).toMatch(/^\/workspace/)
    expectAgentPicked('IT Support Agent')
    expectWithinBudget(app, 2)
  })

  it('an employee finds a shared Agent with Steps and uses it as-is within 2 clicks', async () => {
    const app = startJourney()

    await app.click(within(mainMenu()).getByRole('link', { name: /AI Agent/ }))
    await app.click(actionFor('IT Incident Triage', 'ใช้งาน'))

    expect(app.url()).toMatch(/^\/workspace/)
    expectAgentPicked('IT Incident Triage')
    expectWithinBudget(app, 2)
  })
})
