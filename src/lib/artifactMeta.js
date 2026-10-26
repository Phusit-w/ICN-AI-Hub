// What a finished output is, in the words a User would use.
import { FileText, ListChecks, Network, Table2 } from 'lucide-react'
import { sheetsOf } from './sheets'

/** "N แถว" for one sheet; with several, the sheets are what you count. */
function tableCount(output) {
  const sheets = sheetsOf(output)
  return sheets.length > 1 ? `${sheets.length} แท็บ` : `${sheets[0].rows.length} แถว`
}

export function artifactMeta(output) {
  switch (output.type) {
    case 'doc': return { Icon: FileText, label: 'เอกสาร Word', count: `${output.sections.length} หัวข้อ` }
    case 'table': return { Icon: Table2, label: 'ตาราง Excel', count: tableCount(output) }
    case 'diagram': return { Icon: Network, label: 'แผนภาพ', count: `${output.nodes.length} ขั้นตอน` }
    case 'checklist': return { Icon: ListChecks, label: 'เช็กลิสต์', count: `${output.items.length} รายการ` }
    case 'bullets': return { Icon: FileText, label: 'สรุปข้อมูล', count: `${output.items.length} ประเด็น` }
    default: return { Icon: FileText, label: 'คำตอบ', count: '' }
  }
}
