// Mock metrics for the Admin / Governance dashboard (October 2026, month-to-date).
// Sized for ~25 active users of ~60 staff on one on-premise GPU server: local cost is the electricity share,
// cloud cost is pay-per-use API for the few jobs that need it.

export const KPIS = {
  tasks: 1480, tasksDelta: 12.4,
  costMtd: 4600, costBudget: 8000,
  localShare: 82,
  hoursSaved: 310,
  policyBlocks: 9,
}

export const MODEL_USAGE = [
  { model: 'ICN Llama 70B', location: 'local', requests: 1450, cost: 620 },
  { model: 'Typhoon Thai', location: 'local', requests: 520, cost: 210 },
  { model: 'ICN Image Gen', location: 'local', requests: 140, cost: 90 },
  { model: 'Claude', location: 'cloud', requests: 180, cost: 1650 },
  { model: 'GPT', location: 'cloud', requests: 120, cost: 1050 },
  { model: 'Gemini', location: 'cloud', requests: 90, cost: 980 },
]

export const MONTHLY_COST = [
  { month: 'May', local: 0.8, cloud: 2.4 },
  { month: 'Jun', local: 0.9, cloud: 2.7 },
  { month: 'Jul', local: 1.0, cloud: 3.0 },
  { month: 'Aug', local: 1.0, cloud: 3.1 },
  { month: 'Sep', local: 1.1, cloud: 3.3 },
  { month: 'Oct', local: 1.0, cloud: 3.6 },
]

// Only the departments that use AI day to day; `budget` is the monthly cost cap in baht.
export const DEPT_USAGE = [
  { dept: 'project', users: 8, tasks: 480, cost: 1150, budget: 2000, topAgent: 'Progress Report Agent' },
  { dept: 'sales', users: 5, tasks: 330, cost: 1800, budget: 2000, topAgent: 'Sales Proposal Agent' },
  { dept: 'bid', users: 4, tasks: 260, cost: 560, budget: 1200, topAgent: 'SOC Check Agent' },
  { dept: 'maintenance', users: 4, tasks: 220, cost: 480, budget: 1000, topAgent: 'Equipment Manual Agent' },
  { dept: 'accounting', users: 2, tasks: 110, cost: 280, budget: 800, topAgent: 'Invoice Extraction Agent' },
  { dept: 'hr', users: 2, tasks: 80, cost: 330, budget: 1000, topAgent: 'Quotation Compare Agent' },
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
  { time: '14:32', user: 'Nok J.', action: 'ส่งงานที่มีข้อมูล Confidential', result: 'Routed → ICN Llama 70B (Local)', tone: 'info' },
  { time: '14:05', user: 'Thanawat P.', action: 'ขอแชร์ Sales Proposal Agent v3.0 ระดับบริษัท', result: 'อนุมัติโดย Kittipong W.', tone: 'success' },
  { time: '13:48', user: 'Unknown device', action: 'พยายามส่งไฟล์เงินเดือนไป Cloud Model', result: 'Blocked by policy p3', tone: 'danger' },
  { time: '11:20', user: 'Somchai R.', action: 'เพิ่ม ServiceNow Tool ให้ IT Support Agent', result: 'บันทึกเวอร์ชัน 2.6', tone: 'neutral' },
  { time: '09:02', user: 'System', action: 'Sales ใช้งบไป 90% ของเดือน', result: 'แจ้งเตือนแอดมิน', tone: 'warning' },
]
