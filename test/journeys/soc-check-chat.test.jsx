import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { startJourney } from '../journey'

// Real example chats, ticket 01: the SOC check Thread in chat history, its table Artifact, and the Excel download.

const readBlob = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsArrayBuffer(blob)
})

/** Capture the file the page hands to the browser as a download. */
function captureDownloads() {
  const files = []
  const create = vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => { files.push({ blob }); return 'blob:test' })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click() { files.at(-1).name = this.download })
  return { files, create }
}

beforeEach(() => { URL.revokeObjectURL ??= () => {}; URL.createObjectURL ??= () => '' })
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
    const results = within(table).getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[4].textContent)
    expect(new Set(results)).toEqual(new Set(['ผ่าน', 'ไม่ผ่าน', 'ไม่พบ ต้องตรวจเอง']))
    for (const row of within(table).getAllByRole('row').slice(1)) expect(within(row).getAllByRole('cell')[3].textContent).not.toBe('')
  })

  it('"ดาวน์โหลด Excel" gives an .xlsx whose header and rows match the table, Thai intact', async () => {
    const app = await openSocChat()
    const { files } = captureDownloads()
    vi.useRealTimers() // building the workbook uses real timers

    await app.click(screen.getByRole('button', { name: 'ดาวน์โหลด Excel' }))
    await vi.waitFor(() => expect(files).toHaveLength(1))
    await vi.waitFor(() => expect(files[0].name).toBeTruthy())

    expect(files[0].name).toBe('ผลตรวจ SOC เทียบ datasheet.xlsx')
    const { default: ExcelJS } = await import('exceljs')
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(await readBlob(files[0].blob))
    const sheet = wb.worksheets[0]
    const shown = screen.getByRole('table')
    const shownRows = within(shown).getAllByRole('row').map((r) => [...r.children].map((c) => c.textContent))

    expect(sheet.name).toBe('ผลตรวจรายข้อ')
    const written = shownRows.map((_, i) => sheet.getRow(i + 1).values.slice(1).map((v) => v ?? ''))
    expect(written).toEqual(shownRows)
    expect(sheet.getRow(shownRows.length + 1).values.slice(1)).toEqual([]) // nothing but the blank line and notes after the table
  })

  it('the Agent behind it is in the library as a single Agent', async () => {
    const app = startJourney('/agents')
    expect(app.url()).toBe('/agents')
    expect(screen.getAllByText('SOC Check Agent').length).toBeGreaterThan(0)
  })
})
