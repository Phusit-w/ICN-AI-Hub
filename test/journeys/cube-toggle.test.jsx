import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { startJourney } from '../journey'

// The Cube mascot can be switched off from the foot of the sidebar, on every page, and the choice is remembered.

const toggle = () => screen.getByRole('button', { name: 'เปิดหรือปิดตัว Cube' })

describe('Cube on/off button', () => {
  it('is on by default, switches off and on again in one click each, and remembers the choice', async () => {
    const app = startJourney('/agents')
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')

    await app.click(toggle())
    expect(toggle()).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem('icn-cube')).toBe('off')

    await app.click(toggle())
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('icn-cube')).toBe('on')
  })

  it('is on every page, not only the Agents page', () => {
    startJourney('/workspace')
    expect(toggle()).toBeVisible()
  })
})
