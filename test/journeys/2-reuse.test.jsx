import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import {
  actionFor, expectAgentPicked, expectWithinBudget, expectWorkflowPicked, itOverBudget, mainMenu, startJourney,
} from '../journey'

// Journey 2: reuse a Favourite agent or a Workflow. Budget: 1 click, and the user stays on Home.
// "Sales Proposal Agent" is a default Favourite; "Market Research Report" is a Workflow the user ran recently.

/** Home's command box, where a reused Agent or Workflow should show up. */
const homeCommandBox = (app) => app.box('สั่งงาน AI').closest('form')

describe('Journey 2: reuse a Favourite agent or a Workflow', () => {
  // Today's path. Delete these two when ticket 04 moves reuse onto Home.
  it('today: clicking a Favourite agent on Home opens the Workspace with that Agent picked', async () => {
    const app = startJourney()

    await app.click(screen.getByRole('link', { name: 'Sales Proposal Agent' }))

    expect(app.url()).toMatch(/^\/workspace/)
    expectAgentPicked('Sales Proposal Agent')
    expect(app.clicks).toBe(1)
  })

  it('today: reusing a Workflow means going to the Workflows page and clicking "ใช้งาน" on it', async () => {
    const app = startJourney()

    await app.click(within(mainMenu()).getByRole('link', { name: /สายงาน/ }))
    await app.click(actionFor('Market Research Report', 'ใช้งาน'))

    expect(app.url()).toMatch(/^\/workspace/)
    expectWorkflowPicked('Market Research Report')
    expect(app.clicks).toBe(2)
  })

  itOverBudget('04', 'clicking a Favourite agent fills it into the command box in 1 click without leaving Home', async () => {
    const app = startJourney()

    await app.click(screen.getByRole('button', { name: /Sales Proposal Agent/ }))

    expect(app.url()).toBe('/')
    expect(within(homeCommandBox(app)).getByText(/Sales Proposal Agent/)).toBeVisible()
    expectWithinBudget(app, 1)
  })

  itOverBudget('04', 'clicking a Workflow fills it into the command box in 1 click without leaving Home', async () => {
    const app = startJourney()

    await app.click(screen.getByRole('button', { name: /Market Research Report/ }))

    expect(app.url()).toBe('/')
    expect(within(homeCommandBox(app)).getByText(/Market Research Report/)).toBeVisible()
    expectWithinBudget(app, 1)
  })
})
