// Organization-level reference data: departments, people, models, tools, knowledge sources.

// Mirrors the ICN organization chart effective 17 Aug 2026 (DataExam/), grouped by who shares the same kind of work.
export const DEPARTMENTS = [
  { id: 'core', name: 'Core', th: 'ใช้ได้ทุกแผนก', dot: 'bg-brand-500' },
  { id: 'sales', name: 'Sales & Marketing', th: 'ฝ่ายขายและการตลาด', dot: 'bg-sky-500' },
  { id: 'bid', name: 'Bid Prep', th: 'เตรียมเอกสารประกวดราคา', dot: 'bg-indigo-500' },
  { id: 'project', name: 'Project Implementation', th: 'บริหารโครงการ', dot: 'bg-orange-500' },
  { id: 'maintenance', name: 'Maintenance & Operations', th: 'บริการและบำรุงรักษา', dot: 'bg-lime-600' },
  { id: 'it', name: 'IT', th: 'นวัตกรรมและสารสนเทศ', dot: 'bg-teal-500' },
  { id: 'accounting', name: 'Finance & Accounting', th: 'การเงินและบัญชี', dot: 'bg-amber-500' },
  { id: 'hr', name: 'HR / Procurement / Admin', th: 'บุคคล จัดซื้อ และธุรการ', dot: 'bg-rose-400' },
  { id: 'exec', name: "CEO's Office & Audit", th: 'สำนักผู้บริหารและตรวจสอบภายใน', dot: 'bg-purple-500' },
]
export const deptById = (id) => DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0]

export const USERS = {
  'u-kanya': { id: 'u-kanya', name: 'somchai.a', title: 'Sales Manager', dept: 'sales' },
  'u-thanawat': { id: 'u-thanawat', name: 'Thanawat P.', title: 'Presales Lead', dept: 'sales' },
  'u-arisa': { id: 'u-arisa', name: 'Arisa M.', title: 'HR Business Partner', dept: 'hr' },
  'u-nok': { id: 'u-nok', name: 'Nok J.', title: 'Senior Accountant', dept: 'accounting' },
  'u-pranee': { id: 'u-pranee', name: 'Pranee T.', title: 'Data Analyst', dept: 'core' },
  'u-ploy': { id: 'u-ploy', name: 'Ploy K.', title: 'Bid Specialist', dept: 'bid' },
  'u-wichai': { id: 'u-wichai', name: 'Wichai N.', title: 'Project Manager', dept: 'project' },
  'u-malee': { id: 'u-malee', name: 'Malee P.', title: 'Maintenance Supervisor', dept: 'maintenance' },
  'u-sudarat': { id: 'u-sudarat', name: 'Sudarat K.', title: 'Executive Secretary', dept: 'exec' },
  'u-kittipong': { id: 'u-kittipong', name: 'somlaew.b', title: 'IT Administrator', dept: 'it' },
}
export const CURRENT_USER_ID = 'u-kanya'
/** Whose eyes each view looks through: the User view is the current user, the Admin view is the IT Admin. */
export const VIEW_PERSONAS = { user: CURRENT_USER_ID, admin: 'u-kittipong' }
export const userById = (id) => USERS[id] ?? { id, name: 'Unknown', title: '', dept: 'core' }

// Auto routing is all a User ever sees; it picks the internal model, or Claude when a job needs it.
// Image generation is a capability of the internal server (the Image Generator tool), not a model to pick.
export const MODELS = [
  { id: 'auto', name: 'Auto Routing', provider: 'ICN AI Router', location: 'auto', note: 'แนะนำ — ระบบเลือก Model ให้เองตามความลับของข้อมูลและต้นทุน' },
  { id: 'icn-local', name: 'ICN Local AI', provider: 'On-premise GPU', location: 'local', note: 'เก่งภาษาไทย ข้อมูลไม่ออกนอกบริษัท เหมาะกับข้อมูลลับ' },
  { id: 'claude', name: 'Claude', provider: 'Anthropic · Cloud', location: 'cloud', note: 'วิเคราะห์เชิงลึกและเขียนเอกสารยาว' },
]
/** The internal model on the on-premise GPU: where confidential work always runs. */
export const LOCAL_MODEL_ID = 'icn-local'
export const modelById = (id) => MODELS.find((m) => m.id === id) ?? MODELS[0]

export const TOOLS = [
  { id: 'web-search', name: 'Web Search', desc: 'ค้นข้อมูลจากอินเทอร์เน็ต' },
  { id: 'shared-folder', name: 'Company Shared Folder', desc: 'อ่านไฟล์ในโฟลเดอร์กลางของบริษัท' },
  { id: 'erp', name: 'Accounting System (ERP)', desc: 'อ่าน PO / GR / Invoice' },
  { id: 'email', name: 'Company Email Draft', desc: 'ร่างอีเมลบริษัท (ไม่ส่งอัตโนมัติ)' },
  { id: 'doc-gen', name: 'Document Generator', desc: 'สร้างไฟล์ Word / PowerPoint' },
  { id: 'image-gen', name: 'Image Generator', desc: 'สร้างภาพและไดอะแกรม' },
  { id: 'code', name: 'Python Sandbox', desc: 'รันโค้ดวิเคราะห์ข้อมูลอย่างปลอดภัย' },
]
export const toolById = (id) => TOOLS.find((t) => t.id === id) ?? { id, name: id, desc: '' }

export const KNOWLEDGE = [
  { id: 'kb-market', name: 'Market Reports 2026', type: 'Folder', size: '214 files', dept: 'core' },
  { id: 'kb-price', name: 'Price List & Discount Policy', type: 'Excel', size: '1.2 MB', dept: 'sales' },
  { id: 'kb-cases', name: 'Customer Case Studies', type: 'Folder', size: '48 files', dept: 'sales' },
  { id: 'kb-handbook', name: 'Employee Handbook 2026', type: 'PDF', size: '3.4 MB', dept: 'hr' },
  { id: 'kb-jd', name: 'Job Description Library', type: 'Folder', size: '92 files', dept: 'hr' },
  { id: 'kb-it', name: 'IT How-to Guides', type: 'Folder', size: '85 files', dept: 'it' },
  { id: 'kb-coa', name: 'Chart of Accounts', type: 'Excel', size: '640 KB', dept: 'accounting' },
  { id: 'kb-brand', name: 'ICN Brand Guideline', type: 'PDF', size: '18 MB', dept: 'core' },
  { id: 'kb-datasheets', name: 'Product Datasheets & Catalogs', type: 'Folder', size: '1,140 files', dept: 'bid' },
  { id: 'kb-project-templates', name: 'Project Report Templates', type: 'Folder', size: '26 files', dept: 'project' },
  { id: 'kb-contracts', name: 'Project Contracts & BOQ', type: 'Folder', size: '310 files', dept: 'project' },
  { id: 'kb-manuals', name: 'Equipment Manuals', type: 'Folder', size: '680 files', dept: 'maintenance' },
  { id: 'kb-sla', name: 'SLA by Contract', type: 'Excel', size: '420 KB', dept: 'maintenance' },
  { id: 'kb-policies', name: 'Company Policies & Board Charter', type: 'Folder', size: '64 files', dept: 'exec' },
]
export const knowledgeById = (id) => KNOWLEDGE.find((k) => k.id === id) ?? { id, name: id, type: 'File', size: '' }

export const SHARE_LEVELS = [
  { id: 'private', name: 'Private', th: 'เฉพาะฉัน' },
  { id: 'department', name: 'Department', th: 'ทุกคนในแผนก' },
  { id: 'company', name: 'Company', th: 'ทุกคนในบริษัท' },
]

export const DATA_CLASSES = [
  { id: 'public', name: 'Public', th: 'เปิดเผยได้' },
  { id: 'internal', name: 'Internal', th: 'ใช้ภายในบริษัท' },
  { id: 'confidential', name: 'Confidential', th: 'ข้อมูลลับ — บังคับใช้ Local AI' },
]

export const OUTPUT_FORMATS = ['Word document', 'PowerPoint', 'Excel table', 'Email draft', 'Short answer', 'Image / Diagram']
