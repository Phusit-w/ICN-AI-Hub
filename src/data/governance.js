// Mock metrics for the Admin / Governance dashboard (October 2026, month-to-date).

export const KPIS = {
  tasks: 18420, tasksDelta: 12.4,
  costMtd: 182400, costBudget: 260000,
  localShare: 63,
  activeUsers: 1284, totalUsers: 1650,
  hoursSaved: 6120,
  policyBlocks: 37,
}

export const MODEL_USAGE = [
  { model: 'ICN Llama 70B', location: 'local', requests: 7120, cost: 21400 },
  { model: 'Typhoon Thai', location: 'local', requests: 3980, cost: 9800 },
  { model: 'ICN Image Gen', location: 'local', requests: 1210, cost: 6100 },
  { model: 'Claude', location: 'cloud', requests: 3420, cost: 78300 },
  { model: 'GPT', location: 'cloud', requests: 1960, cost: 41200 },
  { model: 'Gemini', location: 'cloud', requests: 730, cost: 25600 },
]

export const MONTHLY_COST = [
  { month: 'May', local: 28, cloud: 96 },
  { month: 'Jun', local: 31, cloud: 104 },
  { month: 'Jul', local: 34, cloud: 118 },
  { month: 'Aug', local: 36, cloud: 121 },
  { month: 'Sep', local: 38, cloud: 134 },
  { month: 'Oct', local: 37, cloud: 145 },
]

export const DEPT_USAGE = [
  { dept: 'sales', users: 312, tasks: 5480, cost: 61200, topAgent: 'Sales Proposal Agent' },
  { dept: 'it', users: 186, tasks: 4920, cost: 34800, topAgent: 'IT Support Agent' },
  { dept: 'hr', users: 94, tasks: 3110, cost: 18900, topAgent: 'HR Policy Agent' },
  { dept: 'accounting', users: 78, tasks: 1870, cost: 21500, topAgent: 'Invoice Reconciliation Agent' },
  { dept: 'core', users: 614, tasks: 3040, cost: 46000, topAgent: 'Research Agent' },
]

export const ROLES = ['Employee', 'Agent Creator', 'Department Admin', 'Platform Admin']
export const PERMISSIONS = [
  { name: 'ใช้ Agent ที่แชร์ให้', grants: [true, true, true, true] },
  { name: 'สร้าง Agent / Skill ส่วนตัว', grants: [false, true, true, true] },
  { name: 'แชร์ระดับแผนก', grants: [false, true, true, true] },
  { name: 'แชร์ระดับบริษัท (ต้องผ่านการรีวิว)', grants: [false, false, true, true] },
  { name: 'เลือกใช้ Cloud Model', grants: [false, true, true, true] },
  { name: 'เชื่อมต่อระบบภายใน (SAP, CRM)', grants: [false, false, true, true] },
  { name: 'ตั้งงบประมาณและนโยบายข้อมูล', grants: [false, false, false, true] },
]

export const POLICIES = [
  { id: 'p1', name: 'ข้อมูล Confidential ต้องประมวลผลบน Local AI เท่านั้น', scope: 'ทุกแผนก', enabled: true, hits: 412 },
  { id: 'p2', name: 'ปิดบังเลขบัตรประชาชน / เบอร์โทร ก่อนส่งไป Cloud', scope: 'ทุกแผนก', enabled: true, hits: 1260 },
  { id: 'p3', name: 'ห้ามส่งข้อมูลเงินเดือนออกนอก HR', scope: 'HR', enabled: true, hits: 23 },
  { id: 'p4', name: 'ข้อมูลการเงินก่อนประกาศงบ ใช้ได้เฉพาะ Accounting', scope: 'Accounting', enabled: true, hits: 14 },
  { id: 'p5', name: 'แจ้งเตือนเมื่อค่าใช้จ่ายแผนกเกิน 80% ของงบ', scope: 'ทุกแผนก', enabled: false, hits: 0 },
]

export const AUDIT_LOG = [
  { time: '14:32', user: 'Nok J.', action: 'ส่งงานที่มีข้อมูล Confidential', result: 'Routed → ICN Llama 70B (Local)', tone: 'info' },
  { time: '14:05', user: 'Thanawat P.', action: 'ขอแชร์ Sales Proposal Agent v3.0 ระดับบริษัท', result: 'อนุมัติโดย AI CoE', tone: 'success' },
  { time: '13:48', user: 'Unknown device', action: 'พยายามส่งไฟล์เงินเดือนไป Cloud Model', result: 'Blocked by policy p3', tone: 'danger' },
  { time: '11:20', user: 'Somchai R.', action: 'เพิ่ม ServiceNow Tool ให้ IT Support Agent', result: 'บันทึกเวอร์ชัน 2.6', tone: 'neutral' },
  { time: '09:02', user: 'System', action: 'Sales ใช้งบไป 78% ของเดือน', result: 'แจ้งเตือน Department Admin', tone: 'warning' },
]
