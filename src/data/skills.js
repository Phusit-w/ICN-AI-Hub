export const SKILL_CATEGORIES = ['Research', 'Writing & Format', 'Analysis', 'Visual', 'Compliance', 'Department']

const skill = (s) => ({ share: 'company', tools: [], versions: [], ...s })

export const SKILLS = [
  skill({
    id: 'skill-web-research', name: 'Web Research', category: 'Research', icon: 'globe',
    purpose: 'ค้นข้อมูลจากเว็บที่เชื่อถือได้ คัดกรองแหล่งที่มา และสรุปสาระสำคัญ',
    instruction: 'Search at least 5 sources. Prefer government, academic and industry reports. Discard content older than 2 years unless historical.',
    input: 'หัวข้อหรือคำถามที่ต้องการค้น', output: 'สรุป 5–10 bullet พร้อม URL แหล่งที่มา',
    tools: ['web-search'], template: 'Research Brief v2', owner: 'u-ai-team', rating: 4.8, uses: 15400, version: '2.3',
    versions: [
      { v: '2.3', date: '2026-09-30', by: 'u-ai-team', note: 'กรองแหล่งข้อมูลที่ไม่น่าเชื่อถือออก' },
      { v: '2.0', date: '2026-06-12', by: 'u-ai-team', note: 'รองรับการค้นภาษาไทย' },
    ],
  }),
  skill({
    id: 'skill-citation', name: 'Source Citation', category: 'Research', icon: 'book',
    purpose: 'แนบแหล่งอ้างอิงทุกข้อเท็จจริงในรูปแบบมาตรฐานบริษัท',
    instruction: 'Attach [n] citation markers and a reference list at the end.',
    input: 'เนื้อหาที่มีข้อเท็จจริง', output: 'เนื้อหาพร้อมเลขอ้างอิงและรายการแหล่งที่มา',
    template: 'ICN Citation Style', owner: 'u-ai-team', rating: 4.6, uses: 9100, version: '1.4',
  }),
  skill({
    id: 'skill-report-format', name: 'Company Report Format', category: 'Writing & Format', icon: 'file',
    purpose: 'จัดรูปแบบรายงานตามมาตรฐาน ICN: ปก, Executive Summary, เนื้อหา, ภาคผนวก',
    instruction: 'Structure: Cover → Executive Summary (max 150 words) → Sections with numbered headings → Appendix. Use ICN fonts and colors.',
    input: 'เนื้อหาร่าง', output: 'เอกสาร Word ตาม Template ICN Corporate Report',
    tools: ['doc-gen'], template: 'ICN Corporate Report.dotx', owner: 'u-ai-team', rating: 4.9, uses: 13200, version: '3.1',
    versions: [
      { v: '3.1', date: '2026-10-01', by: 'u-ai-team', note: 'อัปเดตโลโก้และสีตาม Brand 2026' },
      { v: '3.0', date: '2026-04-01', by: 'u-pranee', note: 'เพิ่ม Executive Summary อัตโนมัติ' },
    ],
  }),
  skill({
    id: 'skill-proposal-template', name: 'Proposal Template', category: 'Writing & Format', icon: 'file',
    purpose: 'โครงสร้าง Proposal มาตรฐานฝ่ายขาย: Understanding, Solution, Timeline, Pricing, Why ICN',
    instruction: 'Always include: Customer Understanding, Proposed Solution, Implementation Timeline, Investment, Why ICN, Next Steps.',
    input: 'Requirement ลูกค้า + Solution ที่เลือก', output: 'Proposal ตาม Sales Proposal v3',
    tools: ['doc-gen'], template: 'Sales Proposal v3.docx', owner: 'u-thanawat', rating: 4.8, uses: 5300, version: '3.0',
  }),
  skill({
    id: 'skill-grammar-th', name: 'Thai Grammar & Tone Check', category: 'Writing & Format', icon: 'check',
    purpose: 'ตรวจคำผิด ไวยากรณ์ และระดับภาษาให้เหมาะกับเอกสารทางการ',
    instruction: 'Fix spelling per Royal Institute dictionary. Keep formal business tone. Do not change technical terms.',
    input: 'ข้อความภาษาไทย', output: 'ข้อความที่แก้แล้ว + รายการจุดที่แก้',
    owner: 'u-ai-team', rating: 4.7, uses: 11800, version: '1.8',
  }),
  skill({
    id: 'skill-data-analysis', name: 'Data Analysis', category: 'Analysis', icon: 'chart',
    purpose: 'วิเคราะห์ตารางข้อมูล หาแนวโน้ม ค่าผิดปกติ และสรุป Insight',
    instruction: 'Profile the data first. Report top 3 insights with numbers. Flag outliers above 2σ.',
    input: 'ไฟล์ Excel / CSV / ตารางจากฐานข้อมูล', output: 'Insight 3 ข้อ + ตารางสรุป + กราฟ',
    tools: ['code'], owner: 'u-pranee', rating: 4.7, uses: 8700, version: '2.2',
  }),
  skill({
    id: 'skill-chart-style', name: 'ICN Chart Style', category: 'Visual', icon: 'chart',
    purpose: 'สร้างกราฟตามสีและรูปแบบมาตรฐานบริษัท', instruction: 'Use ICN palette, no 3D charts, label axes in Thai.',
    input: 'ตารางข้อมูล', output: 'กราฟ PNG / Excel chart', tools: ['code'], owner: 'u-pranee', rating: 4.5, uses: 4100, version: '1.2',
  }),
  skill({
    id: 'skill-brand-visual', name: 'Brand Visual Guideline', category: 'Visual', icon: 'image',
    purpose: 'ควบคุมภาพให้ตรง Brand: สี ฟอนต์ สัดส่วนโลโก้', instruction: 'Apply ICN palette and spacing rules from the Brand Guideline.',
    input: 'คำอธิบายภาพ', output: 'ภาพ / ไดอะแกรม', tools: ['image-gen'], owner: 'u-ai-team', rating: 4.4, uses: 3900, version: '1.1',
  }),
  skill({
    id: 'skill-compliance', name: 'PDPA & Compliance Check', category: 'Compliance', icon: 'shield',
    purpose: 'ตรวจข้อมูลส่วนบุคคลและข้อความที่ขัดนโยบายก่อนเผยแพร่',
    instruction: 'Detect personal data (ID number, phone, salary). Mask or flag. Check against ICN disclosure policy.',
    input: 'เอกสารหรือข้อความ', output: 'รายการความเสี่ยง + เวอร์ชันที่ปิดบังข้อมูลแล้ว',
    owner: 'u-somchai', rating: 4.8, uses: 7600, version: '2.0',
  }),
  skill({
    id: 'skill-code-review', name: 'Secure Code Review', category: 'Compliance', icon: 'code',
    purpose: 'ตรวจโค้ดหาช่องโหว่และ Secret ที่หลุด', instruction: 'Check OWASP Top 10 and hard-coded secrets.',
    input: 'Source code', output: 'รายการ Finding พร้อมระดับความรุนแรง', owner: 'u-somchai', rating: 4.6, uses: 2100, version: '1.0',
  }),
  skill({
    id: 'skill-requirement', name: 'Requirement Analysis', category: 'Analysis', icon: 'target',
    purpose: 'แยก Requirement จาก TOR / อีเมล / บันทึกประชุม เป็นรายการที่ชัดเจน',
    instruction: 'Classify as Must / Should / Could. Flag ambiguous items as questions for the customer.',
    input: 'TOR หรือบันทึกการคุยกับลูกค้า', output: 'ตาราง Requirement (MoSCoW) + คำถามที่ต้องถามลูกค้า',
    owner: 'u-thanawat', rating: 4.8, uses: 4500, version: '1.6',
  }),
  skill({
    id: 'skill-pricing', name: 'Pricing Calculator', category: 'Department', icon: 'calculator', dept: 'sales', share: 'department',
    purpose: 'คำนวณราคาเบื้องต้นจาก Price List และนโยบายส่วนลด', instruction: 'Use the latest price list. Discounts above 15% require manager approval flag.',
    input: 'รายการ Solution + จำนวน', output: 'ตารางราคา + ส่วนลด + หมายเหตุอนุมัติ', owner: 'u-kanya', rating: 4.7, uses: 2600, version: '1.3',
  }),
  skill({
    id: 'skill-meeting-summary', name: 'Meeting Summary', category: 'Writing & Format', icon: 'file',
    purpose: 'สรุปประชุมเป็น Decision / Action Item / Owner / Due date', instruction: 'Output a table of action items with owner and due date.',
    input: 'Transcript หรือโน้ตประชุม', output: 'สรุป + ตาราง Action Items', owner: 'u-pranee', rating: 4.6, uses: 9800, version: '1.5',
  }),
  skill({
    id: 'skill-policy-lookup', name: 'HR Policy Lookup', category: 'Department', icon: 'book', dept: 'hr',
    purpose: 'ค้นหาข้อกำหนดในคู่มือพนักงานและอ้างอิงเลขหมวด', instruction: 'Return the exact clause with section number. Never guess.',
    input: 'คำถามเรื่องระเบียบ', output: 'คำตอบ + เลขหมวดอ้างอิง', owner: 'u-arisa', rating: 4.8, uses: 6200, version: '1.4',
  }),
  skill({
    id: 'skill-ticket', name: 'ServiceNow Ticket', category: 'Department', icon: 'ticket', dept: 'it',
    purpose: 'เปิด Ticket อัตโนมัติพร้อมจัดหมวดหมู่และความเร่งด่วน', instruction: 'Fill category, impact, urgency. Attach troubleshooting steps already tried.',
    input: 'คำอธิบายปัญหา', output: 'Ticket number + สถานะ', tools: ['servicenow'], owner: 'u-somchai', rating: 4.6, uses: 5400, version: '2.0',
  }),
  skill({
    id: 'skill-3way-match', name: '3-Way Match (PO/GR/Invoice)', category: 'Department', icon: 'calculator', dept: 'accounting', share: 'department',
    purpose: 'จับคู่ PO, Goods Receipt และ Invoice หาส่วนต่าง', instruction: 'Tolerance ±1% or ฿500. Report mismatches by vendor.',
    input: 'Export จาก SAP', output: 'ตารางรายการไม่ตรง + สาเหตุที่เป็นไปได้', tools: ['sap'], owner: 'u-nok', rating: 4.9, uses: 1900, version: '1.2',
  }),
  skill({
    id: 'skill-soc-check', name: 'SOC Reference Check', category: 'Department', icon: 'check', dept: 'bid',
    purpose: 'ตรวจว่าเลขหน้าอ้างอิงใน SOC ตรงกับ Datasheet และ Highlight ครอบคลุมเนื้อหาครบ', instruction: 'For every SOC row open the cited page, confirm the item label and highlight cover the requirement. Never judge Comply/Better.',
    input: 'Excel SOC + PDF Datasheet/Catalog', output: 'Excel ผลตรวจรายข้อ: หน้าถูก / เลขข้อครบ / Highlight ครบ', owner: 'u-ploy', rating: 4.9, uses: 640, version: '1.2',
  }),
  skill({
    id: 'skill-progress-report', name: 'Progress Report Format', category: 'Department', icon: 'file', dept: 'project',
    purpose: 'จัดรายงานความคืบหน้าตาม Template ส่งลูกค้า: งานที่ทำ, % ความคืบหน้า, ปัญหา, แผนสัปดาห์หน้า', instruction: 'Compute % complete against the contract milestones. Flag any milestone at risk.',
    input: 'ข้อความสั้นๆ ว่าสัปดาห์นี้ทำอะไร', output: 'รายงานความคืบหน้า (Word) ตาม Template โครงการ', tools: ['doc-gen'], owner: 'u-wichai', rating: 4.7, uses: 1250, version: '1.1',
  }),
  skill({
    id: 'skill-incident-report', name: 'Incident & SLA Report', category: 'Department', icon: 'ticket', dept: 'maintenance',
    purpose: 'เขียนรายงาน Incident และคำนวณเวลาตาม SLA ของสัญญา', instruction: 'Look up the SLA for the contract. Report response and restore time, and whether SLA was met.',
    input: 'เวลาเกิดเหตุ, สาขา, สาเหตุ, วิธีแก้', output: 'รายงาน Incident + ผล SLA', owner: 'u-malee', rating: 4.8, uses: 980, version: '1.0',
  }),
]
