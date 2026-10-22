/** Helpers for journeys that press a download button and check the .xlsx it produced. */
import { expect, vi } from 'vitest'

const readBlob = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsArrayBuffer(blob)
})

/**
 * Capture the files the page hands to the browser as downloads, each { blob, name }.
 * Switches to real timers, which building a workbook needs. Undo with vi.restoreAllMocks().
 */
export function captureDownloads() {
  vi.useRealTimers()
  const files = []
  URL.createObjectURL ??= () => ''
  URL.revokeObjectURL ??= () => {}
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => { files.push({ blob }); return 'blob:test' })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click() { files.at(-1).name = this.download })
  return files
}

/** Wait until `count` downloads have arrived, then load the last one back with the same Excel library. */
export async function lastWorkbook(files, count = 1) {
  await vi.waitFor(() => expect(files.filter((f) => f.name)).toHaveLength(count), { timeout: 15000 })
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await readBlob(files[count - 1].blob))
  return { workbook, name: files[count - 1].name }
}
