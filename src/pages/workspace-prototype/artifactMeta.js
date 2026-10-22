// PROTOTYPE (branch prototype/workspace-layout): what a finished output is, in the words a User would use.
import { FileText, ListChecks, Network, Table2 } from 'lucide-react'

export function artifactMeta(output) {
  switch (output.type) {
    case 'doc': return { Icon: FileText, label: 'เอกสาร Word', count: `${output.sections.length} หัวข้อ` }
    case 'table': return { Icon: Table2, label: 'ตาราง Excel', count: `${output.rows.length} แถว` }
    case 'diagram': return { Icon: Network, label: 'แผนภาพ', count: `${output.nodes.length} ขั้นตอน` }
    case 'checklist': return { Icon: ListChecks, label: 'เช็กลิสต์', count: `${output.items.length} รายการ` }
    case 'bullets': return { Icon: FileText, label: 'สรุปข้อมูล', count: `${output.items.length} ประเด็น` }
    default: return { Icon: FileText, label: 'คำตอบ', count: '' }
  }
}
