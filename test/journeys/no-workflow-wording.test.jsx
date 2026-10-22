import { describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import { startJourney } from '../journey'
import { TOUR_STEPS } from '../../src/components/tour/steps'

// Ticket 06 (spec .scratch/agents-only-redesign, Wording): Workflows became Agents with Steps (ADR 0001), so
// "สายงาน" and "Workflow" appear nowhere a user or presenter reads. Everything says ผู้ช่วย AI and ขั้นตอน.
const OLD_WORDS = /สายงาน|workflow/i

const ROUTES = ['/workspace', '/agents', '/agents/new', '/agents/agent-proposal-pipeline', '/agents?skill=skill-pricing']

describe('No "สายงาน" or "Workflow" left on screen', () => {
  it.each(ROUTES)('%s', (route) => {
    startJourney(route)
    expect(document.body.textContent).not.toMatch(OLD_WORDS)
  })

  it('in Help, explained with ผู้ช่วย AI and ขั้นตอน instead', async () => {
    const app = startJourney()
    await app.click(screen.getByRole('button', { name: 'คำศัพท์และวิธีใช้' }))
    const help = screen.getByRole('dialog', { name: 'คำศัพท์ที่ควรรู้' })
    expect(help.textContent).not.toMatch(OLD_WORDS)
    expect(help.textContent).toMatch(/ขั้นตอน \(Step\)/)
  })

  it('in the Admin’s detailed Agent form and permissions', async () => {
    let app = startJourney('/agents/new', { view: 'admin' })
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าแบบละเอียด' }))
    for (const page of ['Model & ข้อมูล', 'Knowledge & Skills', 'Tools & Output', 'การแชร์ & ขั้นตอน']) {
      await app.click(screen.getByRole('button', { name: new RegExp(page) }))
      expect(document.body.textContent, page).not.toMatch(OLD_WORDS)
    }
    cleanup()

    app = startJourney('/governance', { view: 'admin' })
    await app.click(screen.getByRole('tab', { name: 'สิทธิ์การใช้งาน' }))
    expect(document.body.textContent).not.toMatch(OLD_WORDS)
  })

  it('in the tour, which tells the new story: chat → Artifact → save for reuse as an Agent → build one by chatting', () => {
    const text = TOUR_STEPS.map((s) => `${s.title} ${s.body}`).join(' ')
    expect(text).not.toMatch(OLD_WORDS)
    expect(text).toMatch(/บันทึกไว้ใช้ซ้ำ/)
    expect(TOUR_STEPS.find((s) => s.title === 'ผู้ช่วย AI').body).toMatch(/คุยกับ AI/)
  })
})
