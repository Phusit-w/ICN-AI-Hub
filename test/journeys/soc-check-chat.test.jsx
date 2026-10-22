import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { startJourney } from '../journey'
import { captureDownloads, lastWorkbook } from '../downloads'

// Real example chats, ticket 01: the SOC check Thread in chat history, its table Artifact, and the Excel download.

afterEach(() => vi.restoreAllMocks())

async function openSocChat() {
  const app = startJourney()
  await app.click(within(screen.getByRole('navigation', { name: 'ประวัติแชต' })).getByRole('link', { name: /ตรวจ SOC เทียบ datasheet/ }))
  await app.click(screen.getByRole('button', { name: 'เปิดผลงาน' }))
  return app
}

describe('Example chat: SOC check against a datasheet', () => {
  it('opens from chat history with its attached files and a table of pass, fail and "check by hand" results', async () => {
    await openSocChat()

    const files = within(screen.getByRole('list', { name: 'ไฟล์ที่แนบ' }))
    expect(files.getByText('SOC_Switch-48P.xlsx')).toBeVisible()
    expect(files.getByText('Datasheet_NetCore-SW48P.pdf')).toBeVisible()

    expect(screen.getByText(/ตรวจ 8 ข้อ: ผ่าน 5 · ไม่ผ่าน 2 · ไม่พบ ต้องตรวจเอง 1/)).toBeVisible()
    const table = screen.getByRole('table')
    const headers = within(table).getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(['ข้อ', 'ข้อกำหนดใน SOC', 'ค่าที่พบใน datasheet', 'หน้าที่อ้าง', 'ผล', 'หมายเหตุ'])
    const rows = within(table).getAllByRole('row').slice(1)
    expect(new Set(rows.map((r) => within(r).getAllByRole('cell')[4].textContent))).toEqual(new Set(['ผ่าน', 'ไม่ผ่าน', 'ไม่พบ ต้องตรวจเอง']))
    for (const row of rows) expect(within(row).getAllByRole('cell')[3].textContent).not.toBe('')
  })

  it('"ดาวน์โหลด Excel" gives an .xlsx whose header and rows match the table, Thai intact', async () => {
    const app = await openSocChat()
    const files = captureDownloads()

    await app.click(screen.getByRole('button', { name: 'ดาวน์โหลด Excel' }))
    const { workbook, name } = await lastWorkbook(files)

    expect(name).toBe('ผลตรวจ SOC เทียบ datasheet.xlsx')
    const sheet = workbook.worksheets[0]
    const shownRows = within(screen.getByRole('table')).getAllByRole('row').map((r) => [...r.children].map((c) => c.textContent))
    expect(sheet.name).toBe('ผลตรวจรายข้อ')
    expect(sheet.rowCount).toBe(shownRows.length)
    expect(shownRows.map((_, i) => sheet.getRow(i + 1).values.slice(1).map((v) => v ?? ''))).toEqual(shownRows)
  })

  it('the Agent behind it is in the library as a single Agent', async () => {
    startJourney('/agents')
    expect(screen.getAllByText('SOC Check Agent').length).toBeGreaterThan(0)
  })
})
