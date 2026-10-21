/**
 * Shared harness for whole-app journey tests (spec: .scratch/simpler-pages/spec.md, Testing Decisions).
 *
 * A journey renders the whole app in an in-memory router (Home by default), drives it like a user
 * with clicks and typing, and asserts what the user can see: roles, accessible names, text, the URL.
 * Clicks are counted so a test can assert the journey's click budget. Typing is not counted.
 *
 *   const app = startJourney()                 // whole app at Home, fake timers on
 *   await app.type(app.box('สั่งงาน AI'), '…')  // focus + type, not counted
 *   await app.click(screen.getByRole(...))     // counted
 *   await app.letRunsFinish()                  // advance fake time until Runs complete
 *   app.url()                                  // '/workspace?run=…'
 *   expectWithinBudget(app, 2)
 */
import { act, screen, within, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect, vi } from 'vitest'
import App from '../src/App'
import { AppStoreProvider } from '../src/store/AppStore'
import { TourProvider } from '../src/components/tour/Tour'

/** Long enough for any multi-Agent Run, including a review loop back, to complete. */
const RUN_TIMEOUT_MS = 3 * 60 * 1000

function Root() {
  return (
    <AppStoreProvider>
      <TourProvider>
        <App />
      </TourProvider>
    </AppStoreProvider>
  )
}

/** Render the whole app at `route` (Home by default) and return a click-counting driver. */
export function startJourney(route = '/') {
  vi.useFakeTimers()
  const router = createMemoryRouter([{ path: '*', element: <Root /> }], { initialEntries: [route] })
  render(<RouterProvider router={router} />)
  // No delay between keystrokes: user-event would otherwise wait on the (fake) clock.
  const user = userEvent.setup({ delay: null })
  let clicks = 0

  return {
    /** Number of clicks the user has made so far in this journey. */
    get clicks() { return clicks },
    /** A counted click, the way a user would click. */
    async click(element) {
      clicks += 1
      await user.click(element)
    },
    /** Type into a field without clicking it (typing is not part of a click budget). */
    async type(element, text) {
      act(() => element.focus())
      await user.keyboard(text)
    },
    /** Current path and query, e.g. '/workspace?run=run-1'. */
    url() {
      const { pathname, search } = router.state.location
      return pathname + search
    },
    /** Move fake time forward, letting Runs and timers progress. */
    async advance(ms) {
      await act(() => vi.advanceTimersByTimeAsync(ms))
    },
    /** Move fake time far enough for any Run that is running to complete. */
    async letRunsFinish() {
      await act(() => vi.advanceTimersByTimeAsync(RUN_TIMEOUT_MS))
    },
    /** A text box by its accessible name. */
    box(name) {
      return screen.getByRole('textbox', { name })
    },
  }
}

/** Assert the journey stayed within its click budget (spec: click budget table). */
export function expectWithinBudget(app, budget) {
  expect(app.clicks, `journey used ${app.clicks} clicks, budget is ${budget}`).toBeLessThanOrEqual(budget)
}


/** Links and buttons look the same to a user; find either by accessible name. */
export function getAllControls(name, container = document.body) {
  const q = within(container)
  return [...q.queryAllByRole('link', { name }), ...q.queryAllByRole('button', { name })]
}

/**
 * The `action` control (e.g. "ใช้งาน") that belongs to the item showing `itemName`:
 * the closest group around the item's name that has exactly one such control.
 */
export function actionFor(itemName, action) {
  for (const label of screen.getAllByText(itemName)) {
    for (let group = label.parentElement; group && group !== document.body; group = group.parentElement) {
      const controls = getAllControls(action, group)
      if (controls.length === 1) return controls[0]
      if (controls.length > 1) break
    }
  }
  throw new Error(`No "${action}" control next to "${itemName}"`)
}

/** The main menu (sidebar navigation). */
export function mainMenu() {
  return screen.getAllByRole('navigation', { name: 'Main' })[0]
}

/** A finished Artifact is on screen: its primary action "ดาวน์โหลด" is available. */
export function expectArtifactShown() {
  expect(screen.getAllByRole('button', { name: /ดาวน์โหลด/ }).length).toBeGreaterThan(0)
}

/** The Workspace composer shows `name` as the picked Agent. */
export function expectAgentPicked(name) {
  expect(screen.getByRole('combobox', { name: 'เลือกผู้ช่วย' })).toHaveDisplayValue(name)
}

/** The Workspace composer shows `name` as the picked Workflow. */
export function expectWorkflowPicked(name) {
  expect(screen.getByText(`สายงาน: ${name}`)).toBeVisible()
}
