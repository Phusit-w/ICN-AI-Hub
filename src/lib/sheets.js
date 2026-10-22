// Table Artifacts: one or more named sheets of columns and rows, with optional marks on rows and a note.
//   { type: 'table', title, columns, rows }                          one sheet (older outputs)
//   { type: 'table', title, sheets: [{ name, columns, rows, marks }], summary, note }   summary shows above, note below (preview only; the workbook holds just the sheets)
// `marks` maps a row's index to the text shown beside it, e.g. { 3: 'ตรวจสอบ · รูปเบลอ' }.

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const MARK_COLUMN = 'ตรวจสอบ'

export const sheetsOf = (artifact) => artifact.sheets ?? [{ name: 'ตาราง', columns: artifact.columns, rows: artifact.rows }]

export const hasMarks = (sheet) => Object.keys(sheet.marks ?? {}).length > 0

/** The workbook for `artifact`, mirroring what the preview shows. `ExcelJS` is passed in so the library loads only on download. */
export function buildWorkbook(ExcelJS, artifact) {
  const wb = new ExcelJS.Workbook()
  for (const sheet of sheetsOf(artifact)) {
    const ws = wb.addWorksheet(sheet.name)
    const marked = hasMarks(sheet)
    const header = ws.addRow(marked ? [...sheet.columns, MARK_COLUMN] : sheet.columns)
    header.font = { bold: true }
    sheet.rows.forEach((r, i) => ws.addRow(marked ? [...r, sheet.marks[i] ?? ''] : r))
    ws.eachRow((row) => row.eachCell((cell, n) => {
      const col = ws.getColumn(n)
      col.width = Math.min(Math.max(col.width ?? 10, String(cell.value ?? '').length + 2), 60)
    }))
  }
  return wb
}

/** Build the .xlsx and hand it to the browser as a download. The Excel library is fetched only now. */
export async function downloadExcel(artifact) {
  const mod = await import('exceljs')
  const wb = buildWorkbook(mod.default ?? mod, artifact)
  const buffer = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: XLSX_TYPE }))
  const link = Object.assign(document.createElement('a'), { href: url, download: /\.xlsx$/i.test(artifact.title) ? artifact.title : `${artifact.title}.xlsx` })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000) // revoking at once can cancel the download in some browsers
}
