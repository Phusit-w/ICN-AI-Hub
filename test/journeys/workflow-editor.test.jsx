import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectArtifactShown, startJourney } from '../journey'

// Ticket 09: editing a Workflow opens the simple editor (ordering Agents up and down) by default.
// The detailed builder sits behind a quiet "ขั้นสูง" link. "ลองรัน" starts the Run straight away.
// "Market Research Report" is a straight chain of Agents; "Sales Proposal Pipeline" has a condition and a loop back.

const AGENTS = ['Research Agent', 'Data Agent', 'Document Agent', 'Image Agent']

/** Which of the Market Research Report's Agents each step of the simple editor shows, in order. */
const stepNames = () => within(screen.getByRole('list', { name: 'ขั้นตอนของสายงาน' }))
  .getAllByRole('listitem').map((li) => AGENTS.find((name) => within(li).queryByText(name)))

describe('Editing a Workflow', () => {
  it('opens the simple editor first, with the detailed builder behind "ขั้นสูง"', async () => {
    const app = startJourney('/workflows')

    await app.click(screen.getByRole('link', { name: 'ดูหรือแก้ Market Research Report' }))

    expect(screen.getByRole('textbox', { name: 'ชื่อสายงาน' })).toHaveValue('Market Research Report')
    expect(stepNames()).toEqual(['Research Agent', 'Data Agent', 'Document Agent', 'Image Agent'])
    expect(screen.queryByRole('button', { name: 'ทดลองรัน' })).toBeNull()

    await app.click(screen.getByRole('button', { name: 'ขั้นสูง' }))

    expect(screen.getByRole('button', { name: 'ทดลองรัน' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'ชื่อ Workflow' })).toHaveValue('Market Research Report')
  })

  it('saves changes to the same Workflow instead of making a copy', async () => {
    const app = startJourney('/workflows?id=wf-market-report')

    await app.click(screen.getAllByRole('button', { name: 'เลื่อนลง' })[0])
    await app.click(screen.getByRole('button', { name: 'บันทึก' }))

    expect(app.url()).toBe('/workflows')
    expect(screen.getAllByText('Market Research Report')).toHaveLength(1)

    await app.click(screen.getByRole('link', { name: 'ดูหรือแก้ Market Research Report' }))
    expect(stepNames()).toEqual(['Data Agent', 'Research Agent', 'Document Agent', 'Image Agent'])
  })

  it('opens a Workflow with a condition or loop in the detailed builder, and says why', () => {
    startJourney('/workflows?id=wf-sales-proposal')

    expect(screen.getByText(/มีเงื่อนไขหรือการวนกลับ/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'ทดลองรัน' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'ข้อมูลครบถ้วน?' })).toBeVisible()
  })

  it('"ลองรัน" starts the Run immediately, because the user picked the Workflow', async () => {
    const app = startJourney('/workflows?id=wf-market-report')

    await app.click(screen.getByRole('button', { name: 'ลองรัน' }))

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expect(screen.queryByRole('button', { name: 'เริ่มเลย' })).toBeNull()
    await app.letRunsFinish()
    expectArtifactShown()
  })

  it('"ลองรัน" on a new AI draft starts the Run immediately too', async () => {
    const app = startJourney('/workflows')

    await app.type(app.box('อยากให้สายงานทำอะไร'), 'ค้นข้อมูลคู่แข่ง สรุปเป็นเอกสาร{Enter}')
    await app.click(screen.getByRole('button', { name: 'ลองรัน' }))

    expect(app.url()).toMatch(/^\/workspace\?run=/)
    expect(screen.queryByRole('button', { name: 'เริ่มเลย' })).toBeNull()
    await app.letRunsFinish()
    expectArtifactShown()
  })
})
