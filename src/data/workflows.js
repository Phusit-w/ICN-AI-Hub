// Node-graph workflows. Node types: trigger | agent | skill | condition | output.
// An edge with kind 'loop' sends work back to an earlier node when a condition fails.

const row = (items, y = 60) => items.map((n, i) => ({ x: 40 + i * 250, y, ...n }))
const chain = (ids) => ids.slice(1).map((to, i) => ({ id: `e-${ids[i]}-${to}`, from: ids[i], to }))

export const WORKFLOWS = [
  {
    id: 'wf-sales-proposal', name: 'Sales Proposal Pipeline', dept: 'sales', owner: 'u-thanawat', uses: 112, version: '1.2',
    description: 'จาก Requirement ลูกค้า → Proposal พร้อมภาพประกอบ ตรวจครบก่อนส่ง',
    nodes: row([
      { id: 'n1', type: 'trigger', label: 'ผู้ใช้ส่งคำขอ' },
      { id: 'n2', type: 'agent', ref: 'agent-research' },
      { id: 'n3', type: 'agent', ref: 'agent-sales-proposal' },
      { id: 'n4', type: 'agent', ref: 'agent-document' },
      { id: 'n5', type: 'agent', ref: 'agent-image' },
      { id: 'n6', type: 'agent', ref: 'agent-review' },
      { id: 'n7', type: 'condition', label: 'ข้อมูลครบถ้วน?' },
      { id: 'n8', type: 'output', label: 'ส่ง Proposal ให้ผู้ใช้' },
    ]),
    edges: [
      ...chain(['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7']),
      { id: 'e-n7-n8', from: 'n7', to: 'n8', label: 'ครบ' },
      { id: 'e-n7-n2', from: 'n7', to: 'n2', kind: 'loop', label: 'ไม่ครบ → ค้นข้อมูลเพิ่ม' },
    ],
  },
  {
    id: 'wf-hr-onboarding', name: 'New Hire Onboarding', dept: 'hr', owner: 'u-arisa', uses: 53, version: '1.2',
    description: 'สร้างแผน Onboarding, สรุปสวัสดิการ และอีเมลต้อนรับพนักงานใหม่',
    nodes: row([
      { id: 'n1', type: 'trigger', label: 'มีพนักงานใหม่' },
      { id: 'n2', type: 'agent', ref: 'agent-hr-policy' },
      { id: 'n3', type: 'agent', ref: 'agent-onboarding' },
      { id: 'n4', type: 'skill', ref: 'skill-report-format' },
      { id: 'n5', type: 'agent', ref: 'agent-review' },
      { id: 'n6', type: 'output', label: 'ส่งแผนให้หัวหน้างาน' },
    ]),
    edges: chain(['n1', 'n2', 'n3', 'n4', 'n5', 'n6']),
  },
  {
    id: 'wf-it-incident', name: 'IT Incident Triage', dept: 'it', owner: 'u-kittipong', uses: 70, version: '1.2',
    description: 'แก้ปัญหาเบื้องต้นอัตโนมัติ ถ้าแก้ไม่ได้ร่างอีเมลแจ้ง IT พร้อมข้อมูลครบ',
    nodes: row([
      { id: 'n1', type: 'trigger', label: 'พนักงานแจ้งปัญหา' },
      { id: 'n2', type: 'agent', ref: 'agent-it-support' },
      { id: 'n3', type: 'condition', label: 'แก้ปัญหาได้แล้ว?' },
      { id: 'n4', type: 'skill', ref: 'skill-it-request' },
      { id: 'n5', type: 'output', label: 'แจ้งผลให้ผู้ใช้' },
    ]),
    edges: [
      ...chain(['n1', 'n2', 'n3']),
      { id: 'e-n3-n4', from: 'n3', to: 'n4', label: 'ยังไม่ได้' },
      { id: 'e-n4-n5', from: 'n4', to: 'n5' },
    ],
  },
  {
    id: 'wf-month-end', name: 'Month-end Close Report', dept: 'accounting', owner: 'u-nok', share: 'department', uses: 25, version: '1.4',
    description: 'กระทบยอด → วิเคราะห์งบ → รายงานปิดงบประจำเดือน (ประมวลผลบน Local AI)',
    nodes: row([
      { id: 'n1', type: 'trigger', label: 'วันที่ 1 ของเดือน' },
      { id: 'n2', type: 'agent', ref: 'agent-invoice' },
      { id: 'n3', type: 'agent', ref: 'agent-budget' },
      { id: 'n4', type: 'agent', ref: 'agent-document' },
      { id: 'n5', type: 'agent', ref: 'agent-review' },
      { id: 'n6', type: 'output', label: 'ส่งรายงานให้ CFO' },
    ]),
    edges: chain(['n1', 'n2', 'n3', 'n4', 'n5', 'n6']),
  },
  {
    id: 'wf-market-report', name: 'Market Research Report', dept: 'core', owner: 'u-pranee', uses: 72, version: '1.0',
    description: 'ค้นคว้า วิเคราะห์ตัวเลข และทำรายงานพร้อม Infographic',
    nodes: row([
      { id: 'n1', type: 'trigger', label: 'ผู้ใช้ส่งหัวข้อ' },
      { id: 'n2', type: 'agent', ref: 'agent-research' },
      { id: 'n3', type: 'agent', ref: 'agent-data' },
      { id: 'n4', type: 'agent', ref: 'agent-document' },
      { id: 'n5', type: 'agent', ref: 'agent-image' },
      { id: 'n6', type: 'output', label: 'รายงานฉบับสมบูรณ์' },
    ]),
    edges: chain(['n1', 'n2', 'n3', 'n4', 'n5', 'n6']),
  },
]
