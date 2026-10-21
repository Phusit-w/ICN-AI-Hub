import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectArtifactShown, expectWithinBudget, startJourney } from '../journey'

// Journey 3: open a past Run. Budget: 1 click.
describe('Journey 3: open a past Run', () => {
  it('an employee opens a finished Run from the sidebar chat history and sees its Artifact in 1 click', async () => {
    const app = startJourney()

    await app.click(within(screen.getByRole('navigation', { name: 'ประวัติแชต' })).getByRole('link', { name: /หาข้อมูลตลาด EV Charger/ }))

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expect(screen.getAllByText(/หาข้อมูลตลาด EV Charger/).length).toBeGreaterThan(0)
    expectArtifactShown()
    expectWithinBudget(app, 1)
  })
})
