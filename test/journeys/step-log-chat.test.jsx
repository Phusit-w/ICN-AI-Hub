import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, screen, within } from '@testing-library/react'
import { startJourney } from '../journey'
import { captureDownloads, lastWorkbook } from '../downloads'

// Real example chats, ticket 02: the step-log Thread with a Schedule, a flagged row, and a workbook that grows.

afterEach(() => vi.restoreAllMocks())

async function openStepLog() {
  const app = startJourney()
  await app.click(within(screen.getByRole('navigation', { name: 'ประวัติแชต' })).getByRole('link', { name: 'บันทึกก้าวเดิน' }))
  return app
}

describe('Example chat: step log with a Schedule', () => {
  it('has two Runs; the second says the Schedule started it', async () => {
    await openStepLog()

    expect(screen.getAllByText(/^เสร็จแล้ว — /)).toHaveLength(2)
    expect(screen.getByText('ตั้งเวลา · จันทร์ 19 ต.ค. 20:00')).toBeVisible()
    expect(screen.getByText(/สรุปก้าวเดินกลุ่มเดินสัปดาห์ 5-11 ต.ค./)).toBeVisible()
  })

  it('a Schedule card follows the User asking for it, saying when and which period each Run covers', async () => {
    await openStepLog()

    expect(screen.getByText('บันทึกให้ทุกวันจันทร์ 20:00 เลย')).toBeVisible()
    const card = within(screen.getByRole('region', { name: 'ตั้งเวลา' }))
    expect(card.getByText(/ทุกวันจันทร์ 20:00/)).toBeVisible()
    expect(card.getByText(/สัปดาห์ก่อนหน้า \(จันทร์–อาทิตย์\)/)).toBeVisible()
    // The rule is the Personal agent's, so the card points there, not at the library Agent that does the job.
    expect(card.getByRole('link', { name: 'Agent ของคุณ' })).toHaveAttribute('href', '/agent')
    expect(card.getByText(/สำหรับงาน บันทึกก้าวเดิน Agent/)).toBeVisible()
  })

  it('the second Run flags the blurry row with its reason and leaves the unreadable total empty', async () => {
    const app = await openStepLog() // the work area opens on the latest Run

    expect(screen.getAllByText('ก้าวเดิน 12-18 ต.ค. 2026').length).toBeGreaterThan(0)
    const row = within(screen.getByRole('table')).getByRole('row', { name: /ฟ้า/ })
    const cells = within(row).getAllByRole('cell').map((c) => c.textContent)
    expect(cells.slice(0, 3)).toEqual(['ฟ้า', 'ACC', ''])
    expect(cells[3]).toMatch(/^ตรวจสอบ · รูปเบลอ/)
    expect(screen.getByText('18,724')).toBeVisible()
  })

  it('its Excel holds both weeks and a summary per week, and carries the flag and the empty cell', async () => {
    const app = await openStepLog() // the work area opens on the latest Run
    const files = captureDownloads()

    await app.click(screen.getByRole('button', { name: 'ดาวน์โหลด Excel' }))
    const { workbook, name } = await lastWorkbook(files)

    expect(name).toBe('ก้าวเดิน 12-18 ต.ค. 2026.xlsx')
    expect(workbook.worksheets.map((s) => s.name)).toEqual(['12-18 ต.ค.', '5-11 ต.ค.', 'สรุปรายสัปดาห์'])
    const [latest, previous, summary] = workbook.worksheets
    expect(previous.rowCount).toBe(6)
    expect(latest.getRow(1).values.slice(1)).toEqual(['ชื่อ', 'รหัสฝ่าย', 'ก้าวรวม', 'ตรวจสอบ'])
    const blurry = latest.getRow(4).values.slice(1)
    expect(blurry.slice(0, 2)).toEqual(['ฟ้า', 'ACC'])
    expect(blurry[2] ?? '').toBe('')
    expect(blurry[3]).toMatch(/^ตรวจสอบ · รูปเบลอ/)
    expect(summary.getRow(2).values.slice(1)[0]).toBe('12-18 ต.ค.')
    expect(summary.getRow(3).values.slice(1)[0]).toBe('5-11 ต.ค.')
    expect(summary.getRow(3).values.slice(1)[2]).toBe('229,643')
  })

  it('the Schedule is listed on the Personal agent’s page, and the library Agent has none', () => {
    startJourney('/agent')
    const list = within(screen.getByRole('region', { name: 'ตั้งเวลา' }))
    expect(list.getByText(/บันทึกก้าวเดิน Agent · ทุกวันจันทร์ 20:00 · ครอบสัปดาห์ก่อนหน้า/)).toBeVisible()

    cleanup()
    startJourney('/agents/agent-step-log')
    expect(screen.queryByText(/ตั้งเวลา ·/)).toBeNull()
  })
})
