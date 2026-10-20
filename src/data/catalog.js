// Organization-level reference data: departments, people, models, tools, knowledge sources.

export const DEPARTMENTS = [
  { id: 'core', name: 'Core', th: 'ใช้ได้ทุกแผนก', dot: 'bg-brand-500' },
  { id: 'sales', name: 'Sales', th: 'ฝ่ายขาย', dot: 'bg-sky-500' },
  { id: 'hr', name: 'HR', th: 'ฝ่ายบุคคล', dot: 'bg-rose-400' },
  { id: 'it', name: 'IT', th: 'ฝ่ายไอที', dot: 'bg-teal-500' },
  { id: 'accounting', name: 'Accounting', th: 'ฝ่ายบัญชี', dot: 'bg-amber-500' },
]
export const deptById = (id) => DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0]

export const USERS = {
  'u-kanya': { id: 'u-kanya', name: 'Kanya S.', title: 'Sales Manager', dept: 'sales' },
  'u-thanawat': { id: 'u-thanawat', name: 'Thanawat P.', title: 'Presales Lead', dept: 'sales' },
  'u-arisa': { id: 'u-arisa', name: 'Arisa M.', title: 'HR Business Partner', dept: 'hr' },
  'u-somchai': { id: 'u-somchai', name: 'Somchai R.', title: 'IT Service Manager', dept: 'it' },
  'u-nok': { id: 'u-nok', name: 'Nok J.', title: 'Senior Accountant', dept: 'accounting' },
  'u-ai-team': { id: 'u-ai-team', name: 'AI CoE Team', title: 'AI Center of Excellence', dept: 'core' },
  'u-pranee': { id: 'u-pranee', name: 'Pranee T.', title: 'Data Analyst', dept: 'core' },
}
export const CURRENT_USER_ID = 'u-kanya'
export const userById = (id) => USERS[id] ?? { id, name: 'Unknown', title: '', dept: 'core' }

export const MODELS = [
  { id: 'auto', name: 'Auto Routing', provider: 'ICN AI Router', location: 'auto', note: 'แนะนำ — ระบบเลือก Model ให้เองตามความลับของข้อมูลและต้นทุน' },
  { id: 'icn-llama', name: 'ICN Llama 70B', provider: 'On-premise GPU', location: 'local', note: 'ข้อมูลไม่ออกนอกบริษัท เหมาะกับข้อมูลลับ' },
  { id: 'typhoon', name: 'Typhoon Thai', provider: 'On-premise GPU', location: 'local', note: 'เก่งภาษาไทย ทำงานบน Server ภายใน' },
  { id: 'claude', name: 'Claude', provider: 'Anthropic · Cloud', location: 'cloud', note: 'วิเคราะห์เชิงลึกและเขียนเอกสารยาว' },
  { id: 'gpt', name: 'GPT', provider: 'OpenAI · Cloud', location: 'cloud', note: 'งานทั่วไป ตอบเร็ว' },
  { id: 'gemini', name: 'Gemini', provider: 'Google · Cloud', location: 'cloud', note: 'ค้นคว้าข้อมูลหลายรูปแบบ' },
  { id: 'icn-image', name: 'ICN Image Gen', provider: 'On-premise GPU', location: 'local', note: 'สร้างภาพประกอบและไดอะแกรม' },
]
export const modelById = (id) => MODELS.find((m) => m.id === id) ?? MODELS[0]

export const TOOLS = [
  { id: 'web-search', name: 'Web Search', desc: 'ค้นข้อมูลจากอินเทอร์เน็ต' },
  { id: 'sharepoint', name: 'SharePoint / Drive', desc: 'อ่านไฟล์ในคลังเอกสารบริษัท' },
  { id: 'crm', name: 'Salesforce CRM', desc: 'อ่านข้อมูลลูกค้าและ Opportunity' },
  { id: 'sap', name: 'SAP ERP', desc: 'อ่าน PO / GR / Invoice' },
  { id: 'servicenow', name: 'ServiceNow', desc: 'เปิดและติดตาม IT Ticket' },
  { id: 'email', name: 'Email Draft', desc: 'ร่างอีเมล (ไม่ส่งอัตโนมัติ)' },
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
  { id: 'kb-it', name: 'IT Knowledge Base', type: 'Confluence', size: '1,320 pages', dept: 'it' },
  { id: 'kb-coa', name: 'Chart of Accounts', type: 'Excel', size: '640 KB', dept: 'accounting' },
  { id: 'kb-brand', name: 'ICN Brand Guideline', type: 'PDF', size: '18 MB', dept: 'core' },
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
