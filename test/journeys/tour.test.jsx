import { describe, expect, it } from 'vitest'
import { startJourney } from '../journey'
import { TOUR_STEPS } from '../../src/components/tour/steps'

// jsdom has no layout (every rect is 0×0), so the tour itself would skip each step as "not visible".
// Instead, open each step's page and check its target element is there.
describe('Tour: short, and never points at something that is gone', () => {
  it('has at most 6 steps: command box, search, Agents, ready', () => {
    expect(TOUR_STEPS.length).toBeLessThanOrEqual(6)
    expect(TOUR_STEPS.map((s) => s.title)).toEqual(['สั่งงาน AI', 'ค้นหาทั้งระบบ', 'AI Agent', 'พร้อมแล้ว!'])
  })

  it.each(TOUR_STEPS.map((s, i) => [i + 1, s.title, s]))('step %i "%s": its target exists on its page', (_, __, step) => {
    const app = startJourney(step.route)
    expect(app.url()).toBe(step.route)
    expect(document.querySelector(`[data-tour="${step.target}"]`), `[data-tour="${step.target}"] on ${step.route}`).not.toBeNull()
  })

  it('steps marked `sidebar` are exactly the ones whose target sits in the sidebar, so the tour can show it first', () => {
    for (const step of TOUR_STEPS) {
      startJourney(step.route)
      const inSidebar = Boolean(document.querySelector(`aside [data-tour="${step.target}"]`))
      expect(Boolean(step.sidebar), step.target).toBe(inSidebar)
    }
  })

  it('no step mentions the mode toggle, the community page or the old Skills page', () => {
    for (const s of TOUR_STEPS) {
      expect(s.route).not.toMatch(/community|^\/skills/)
      expect(s.target).not.toMatch(/mode|community|skill/)
      expect(`${s.title} ${s.body}`).not.toMatch(/ชุมชน|โหมด|Community|mode/i)
    }
  })
})
