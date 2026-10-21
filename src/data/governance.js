// Mock metrics for the Admin / Governance dashboard (October 2026, month-to-date).
// ICN opened the hub on LAUNCH_DATE: about 3 months in, ~25 Users of ~60 staff on one on-premise GPU server.
// Local cost is the electricity share; cloud cost is pay-per-use Claude for the few jobs that need it.

export const LAUNCH_DATE = '2026-08-01'

export const KPIS = {
  users: 25,
  tasks: 1480, tasksDelta: 12.1,
  costMtd: 4600, costBudget: 8000,
  localShare: 82,
  hoursSaved: 310,
  policyBlocks: 9,
}

// The two models that do the work; Auto routing picks between them.
export const MODEL_USAGE = [
  { model: 'ICN Local AI', location: 'local', requests: 1720, cost: 900 },
  { model: 'Claude', location: 'cloud', requests: 380, cost: 3700 },
]

// The months since launch: cost in thousand baht, `runs` the Runs that month (October is month-to-date).
export const MONTHLY_COST = [
  { month: 'Aug', local: 0.5, cloud: 1.9, runs: 860 },
  { month: 'Sep', local: 0.8, cloud: 3.0, runs: 1320 },
  { month: 'Oct', local: 0.9, cloud: 3.7, runs: 1480 },
]

// Departments using AI this month; `budget` is the monthly cost cap in baht. IT is a one-person team.
export const DEPT_USAGE = [
  { dept: 'project', users: 7, tasks: 440, cost: 1030, budget: 2000, topAgent: 'Progress Report Agent' },
  { dept: 'sales', users: 5, tasks: 330, cost: 1800, budget: 2000, topAgent: 'Sales Proposal Agent' },
  { dept: 'bid', users: 4, tasks: 260, cost: 560, budget: 1200, topAgent: 'SOC Check Agent' },
  { dept: 'maintenance', users: 4, tasks: 220, cost: 480, budget: 1000, topAgent: 'Equipment Manual Agent' },
  { dept: 'accounting', users: 2, tasks: 110, cost: 280, budget: 800, topAgent: 'Invoice Extraction Agent' },
  { dept: 'hr', users: 2, tasks: 80, cost: 330, budget: 1000, topAgent: 'Quotation Compare Agent' },
  { dept: 'it', users: 1, tasks: 40, cost: 120, budget: 500, topAgent: 'IT Support Agent' },
]

export const ROLES = ['User', 'Admin']
export const PERMISSIONS = [
  { name: 'ใช้ Agent ที่แชร์ให้', grants: [true, true] },
  { name: 'สร้าง Agent / Skill / Workflow ของตัวเอง', grants: [true, true] },
  { name: 'แชร์ระดับแผนก', grants: [true, true] },
  { name: 'ขอแชร์ระดับบริษัท', grants: [true, true] },
  { name: 'อนุมัติการแชร์ระดับบริษัท', grants: [false, true] },
  { name: 'สร้างแบบขั้นสูง (Workflow canvas, ฟอร์มทีละขั้น)', grants: [false, true] },
  { name: 'เชื่อมต่อระบบภายใน', grants: [false, true] },
  { name: 'ตั้งงบประมาณและนโยบายข้อมูล', grants: [false, true] },
]

export const POLICIES = [
  { id: 'p1', name: 'ข้อมูล Confidential ต้องประมวลผลบน Local AI เท่านั้น', scope: 'ทุกแผนก', enabled: true, hits: 58 },
  { id: 'p2', name: 'ปิดบังเลขบัตรประชาชน / เบอร์โทร ก่อนส่งไป Cloud', scope: 'ทุกแผนก', enabled: true, hits: 20 },
  { id: 'p3', name: 'ห้ามส่งข้อมูลเงินเดือนออกนอก HR', scope: 'HR', enabled: true, hits: 3 },
  { id: 'p4', name: 'ข้อมูลการเงินก่อนประกาศงบ ใช้ได้เฉพาะ Accounting', scope: 'Accounting', enabled: true, hits: 2 },
  { id: 'p5', name: 'แจ้งเตือนเมื่อค่าใช้จ่ายแผนกเกิน 80% ของงบ', scope: 'ทุกแผนก', enabled: false, hits: 0 },
]

export const AUDIT_LOG = [
  { time: '14:32', user: 'Nok J.', action: 'ส่งงานที่มีข้อมูล Confidential', result: 'Routed → ICN Local AI', tone: 'info' },
  { time: '14:05', user: 'Thanawat P.', action: 'ขอแชร์ Sales Proposal Agent v1.3 ระดับบริษัท', result: 'อนุมัติโดย Kittipong W.', tone: 'success' },
  { time: '13:48', user: 'Wichai N.', action: 'พยายามส่งไฟล์เงินเดือนไป Cloud Model', result: 'Blocked by policy p3', tone: 'danger' },
  { time: '11:20', user: 'Kittipong W.', action: 'เพิ่ม Company Email Draft ให้ IT Support Agent', result: 'บันทึกเวอร์ชัน 1.3', tone: 'neutral' },
  { time: '09:02', user: 'Kittipong W.', action: 'ได้รับแจ้ง: งบฝ่าย Sales ใช้ไปแล้ว 90% ของเดือน', result: 'แจ้งเตือนแอดมิน', tone: 'warning' },
]
