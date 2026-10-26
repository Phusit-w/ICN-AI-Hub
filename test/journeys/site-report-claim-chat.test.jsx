import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { startJourney } from '../journey'
import { captureDownloads, lastWorkbook } from '../downloads'

// Real example chats, ticket 03: a team of two Steps, one Run, two Artifacts that download separately.

afterEach(() => vi.restoreAllMocks())

async function openSiteReportChat() {
  const app = startJourney()
  await app.click(within(screen.getByRole('navigation', { name: 'ประวัติแชต' })).getByRole('link', { name: 'รายงานหน้างาน + ใบเบิก' }))
  return app
}

// With several Artifacts the work area shows each in a section of its own, named for the Artifact.
const REPORT = 'รายงานหน้างาน 14 ต.ค. 2026'
const CLAIM = 'ใบเบิกค่าเดินทาง 14 ต.ค. 2026'
const section = (title) => within(screen.getByRole('region', { name: title }))

describe('Example chat: site report and travel claim, by a team', () => {
  it('one Run shows two Artifacts, named for the report and for the claim', async () => {
    await openSiteReportChat()

    expect(screen.getAllByRole('button', { name: 'ดาวน์โหลด Excel' })).toHaveLength(2)
    expect(section(REPORT).getByText(REPORT)).toBeVisible()
    expect(section(CLAIM).getByText(CLAIM)).toBeVisible()
  })

  it('the report has the site-report columns', async () => {
    await openSiteReportChat()

    const headers = within(section(REPORT).getByRole('table')).getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(['ไซต์', 'วันที่', 'งานที่ทำ', 'ผลที่ได้', 'ปัญหา', 'งานค้าง'])
  })

  it('the claim states its rate in the note, and every amount is the distance × that rate or a receipt', async () => {
    await openSiteReportChat()

    expect(section(CLAIM).getByText(/× 4 บาท\/กม\. \(อัตราสมมติ\)/)).toBeVisible()
    const table = section(CLAIM).getByRole('table')
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['วันที่', 'จาก-ถึง', 'พาหนะ', 'ระยะทาง', 'จำนวนเงิน (บาท)', 'ใบเสร็จ'])
    const rows = within(table).getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell').map((c) => c.textContent))
    const num = (t) => Number(t.replace(/,/g, ''))
    for (const [, , , distance, amount, receipt] of rows) {
      if (distance !== '-') expect(num(amount)).toBe(parseFloat(distance) * 4) // "38 กม." → 38
      else expect(receipt).not.toBe('ไม่ต้องใช้')
    }
    const total = rows.reduce((n, r) => n + num(r[4]), 0)
    expect(section(CLAIM).getByText(`รวมที่เบิก ${total.toFixed(2)} บาท`)).toBeVisible()
  })

  it('each Artifact downloads as its own .xlsx', async () => {
    const app = await openSiteReportChat()
    const files = captureDownloads()

    await app.click(section(REPORT).getByRole('button', { name: 'ดาวน์โหลด Excel' }))
    const report = await lastWorkbook(files, 1)
    expect(report.name).toBe(`${REPORT}.xlsx`)
    expect(report.workbook.worksheets.map((s) => s.name)).toEqual(['รายงานหน้างาน'])
    expect(report.workbook.worksheets[0].rowCount).toBe(4)

    await app.click(section(CLAIM).getByRole('button', { name: 'ดาวน์โหลด Excel' }))
    const claim = await lastWorkbook(files, 2)
    expect(claim.name).toBe(`${CLAIM}.xlsx`)
    expect(claim.workbook.worksheets.map((s) => s.name)).toEqual(['ใบเบิกค่าเดินทาง'])
    expect(claim.workbook.worksheets[0].rowCount).toBe(5)
  })

  it('the library shows the team with its two Steps, which are Agents of their own', async () => {
    startJourney('/agents/agent-site-report-claim')

    const steps = within(screen.getByRole('list', { name: 'ขั้นตอน' })).getAllByRole('link').map((l) => l.textContent)
    expect(steps).toEqual(['Site Report Agent', 'Travel Claim Agent'])
  })
})
