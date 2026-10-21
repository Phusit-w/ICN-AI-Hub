import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { startJourney } from '../journey'

// Ticket 06: a document Artifact shows the ICN letterhead; tables, images and chat answers don't (spec stories 45, 46).
const COMPANY = 'Information and Communication Networks Public Company Limited'

/** Send `prompt`; work for Agents shows its Plan first (`plan`), a chat answer starts straight away. */
async function finishedRun(prompt, { plan = true } = {}) {
  const app = startJourney('/workspace')
  await app.type(app.box('ข้อความ'), prompt)
  await app.click(screen.getByRole('button', { name: 'ส่ง' }))
  if (plan) await app.click(screen.getByRole('button', { name: 'เริ่มเลย' }))
  await app.letRunsFinish()
  return app
}

const letterhead = () => screen.queryByLabelText('หัวจดหมาย ICN')

describe('ICN letterhead on document Artifacts', () => {
  it('a finished document shows the ICN logo and company name above its content', async () => {
    await finishedRun('ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Siam Logistics')

    expect(letterhead()).toBeVisible()
    expect(within(letterhead()).getByRole('img', { name: 'ICN' })).toBeInTheDocument()
    expect(within(letterhead()).getByText(COMPANY)).toBeVisible()
    // "Above the content" is part of the ticket, so this journey also checks the band comes first on the page.
    const body = screen.getByText('1. Executive Summary')
    expect(letterhead().compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('a chat answer has no letterhead', async () => {
    await finishedRun('สวัสดี ช่วยอะไรได้บ้าง', { plan: false })
    expect(letterhead()).toBeNull()
    expect(screen.queryByText(COMPANY)).toBeNull()
  })

  it('a table has no letterhead', async () => {
    await finishedRun('วิเคราะห์ยอดขาย Q3 รายภาค เป็นตาราง')
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0)
    expect(letterhead()).toBeNull()
  })
})
