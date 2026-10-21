// Canned content the simulated agents "produce". Keyed by step kind.

export const TASKS = {
  research: 'ค้นข้อมูลและแหล่งอ้างอิงที่เกี่ยวข้อง',
  sales: 'วิเคราะห์ Requirement และเลือก Solution',
  document: 'จัดทำเอกสารตาม Template บริษัท',
  image: 'สร้างภาพและไดอะแกรมประกอบ',
  review: 'ตรวจความครบถ้วนและ Compliance',
  data: 'วิเคราะห์ข้อมูลและสรุป Insight',
  translate: 'แปลเอกสารโดยคงศัพท์เฉพาะ',
  hr: 'ตรวจนโยบายและข้อมูลฝ่ายบุคคล',
  it: 'วิเคราะห์และแก้ปัญหาเบื้องต้น',
  accounting: 'กระทบยอดและตรวจตัวเลข',
  skill: 'ทำงานตาม Skill ที่กำหนด',
  condition: 'ตรวจเงื่อนไขก่อนไปขั้นถัดไป',
  chat: 'ตอบคำถาม',
}

export const ACTIVITIES = {
  research: ['ค้นคลังความรู้บริษัท (Market Reports 2026)', 'ค้นเว็บ 12 แหล่ง คัดเหลือ 6 แหล่งที่น่าเชื่อถือ', 'สรุปประเด็นสำคัญพร้อมอ้างอิง'],
  sales: ['ดึงประวัติลูกค้าจากแฟ้มลูกค้า', 'จัดกลุ่ม Requirement แบบ Must / Should / Could', 'จับคู่กับ Solution และคำนวณราคาเบื้องต้น'],
  document: ['โหลด Template "Sales Proposal v3"', 'เขียน Executive Summary และเนื้อหา 6 หัวข้อ', 'ตรวจคำผิดด้วย Thai Grammar Skill'],
  image: ['ร่างโครงสร้างไดอะแกรม', 'ใส่สีตาม Brand Guideline', 'Export เป็น PNG ความละเอียดสูง'],
  review: ['ตรวจหัวข้อบังคับตาม Checklist', 'ตรวจข้อมูลส่วนบุคคล (PDPA)', 'ตรวจความสอดคล้องของตัวเลข'],
  data: ['โหลดข้อมูล 24,310 แถว', 'คำนวณแนวโน้มและค่าผิดปกติ', 'สร้างกราฟตาม ICN Chart Style'],
  translate: ['ตรวจศัพท์เฉพาะจาก Glossary', 'แปลทีละส่วน', 'จัดรูปแบบตามต้นฉบับ'],
  hr: ['ค้นคู่มือพนักงาน 2026', 'ตรวจสิทธิ์ตามตำแหน่ง', 'สรุปคำตอบพร้อมเลขหมวด'],
  it: ['ค้นใน IT How-to Guides', 'ทดสอบวิธีแก้ 3 ขั้นตอน', 'สรุปผล'],
  accounting: ['ดึงข้อมูล PO / GR / Invoice จากระบบบัญชี (ERP)', 'จับคู่ 3-Way Match', 'สรุปรายการไม่ตรง'],
  skill: ['เตรียม Input', 'ประมวลผลตาม Skill', 'ส่งต่อผลลัพธ์'],
  condition: ['อ่านผลตรวจจากขั้นก่อนหน้า', 'ประเมินเงื่อนไข'],
  chat: ['ทำความเข้าใจคำถาม', 'เรียบเรียงคำตอบ'],
}

const CHAT_REPLY = `สวัสดี ฉันคือ ICN Assistant ผู้ช่วย AI ของบริษัท

ช่วยได้ตั้งแต่คำถามสั้น ๆ ไปจนถึงงานใหญ่ที่ต้องใช้ผู้ช่วยหลายตัวทำงานร่วมกัน เช่น
• ทำ Proposal ให้ลูกค้า
• ค้นข้อมูลแล้วสรุปเป็นรายงานพร้อมภาพประกอบ
• ถามระเบียบ HR หรือแจ้งปัญหา IT

พิมพ์งานที่ต้องการได้เลย ระบบจะเลือกผู้ช่วยที่เหมาะให้เอง`

const isProposal = (run) => run.workflowId === 'wf-sales-proposal'

export function outputFor(step, run) {
  const subject = run.title
  switch (step.kind) {
    case 'chat':
      return { type: 'text', title: 'คำตอบ', text: CHAT_REPLY }
    case 'research':
      return {
        type: 'bullets', title: step.loops ? 'Research brief (ฉบับเพิ่มเติม)' : 'Research brief',
        items: [
          ...(step.loops ? [{ text: 'พบข้อมูลงบประมาณที่ลูกค้าเปิดเผยใน Annual Report: ~฿18–22 ล้านสำหรับ Digital Transformation', source: 'Annual Report 2025' }] : []),
          { text: 'ตลาดที่เกี่ยวข้องในไทยโตเฉลี่ย 14% ต่อปี (2023–2026)', source: 'Market Reports 2026' },
          { text: 'คู่แข่งหลัก 3 ราย เน้นราคา แต่ขาดบริการหลังการขายในต่างจังหวัด', source: 'Industry survey' },
          { text: 'ลูกค้ามีแผนขยายคลังสินค้าแห่งใหม่ที่ชลบุรีในปี 2027', source: 'ข่าวบริษัท' },
          { text: 'มี Case Study ใกล้เคียง 2 โครงการที่ ICN เคยทำสำเร็จ', source: 'Customer Case Studies' },
        ],
      }
    case 'sales':
      return {
        type: 'table', title: 'Requirement analysis',
        columns: ['Requirement', 'Priority', 'ICN Solution'],
        rows: [
          ['ติดตามสต็อกแบบ Real-time', 'Must', 'ICN Smart WMS'],
          ['เชื่อมต่อระบบ ERP เดิม', 'Must', 'ERP Connector'],
          ['Dashboard ผู้บริหาร', 'Should', 'ICN Insight'],
          ['แอปมือถือสำหรับพนักงานคลัง', 'Could', 'Mobile Scanner App'],
        ],
      }
    case 'document':
      return {
        type: 'doc', title: isProposal(run) ? 'Proposal (ร่าง).docx' : 'Report (ร่าง).docx',
        template: isProposal(run) ? 'Sales Proposal v3' : 'ICN Corporate Report',
        sections: [
          { heading: '1. Executive Summary', body: `เอกสารนี้นำเสนอแนวทางสำหรับ "${subject}" โดยเน้นผลลัพธ์ที่วัดได้ภายใน 6 เดือน และใช้ทรัพยากรเดิมของลูกค้าให้มากที่สุด` },
          { heading: '2. ความเข้าใจความต้องการ', body: 'สรุป Requirement 4 กลุ่มหลัก ได้แก่ การติดตามสต็อก การเชื่อมต่อระบบเดิม Dashboard และการใช้งานผ่านมือถือ' },
          { heading: '3. Solution ที่เสนอ', body: 'ICN Smart WMS + ERP Connector พร้อม Dashboard สำหรับผู้บริหาร ติดตั้งแบบ Hybrid Cloud' },
          { heading: '4. แผนดำเนินงาน', body: 'Phase 1 (เดือน 1–2) Discovery & Design · Phase 2 (เดือน 3–5) Implementation · Phase 3 (เดือน 6) Go-live & Hypercare' },
          { heading: '5. งบประมาณเบื้องต้น', body: '฿14.8 ล้าน (รวมค่า License 3 ปี) — ส่วนลด 8% อยู่ในเกณฑ์ที่ไม่ต้องขออนุมัติเพิ่ม' },
        ],
      }
    case 'image':
      return { type: 'diagram', title: 'Solution architecture.png', nodes: ['Warehouse Devices', 'ICN Smart WMS', 'ERP', 'Executive Dashboard'] }
    case 'review':
    case 'condition':
      return {
        type: 'checklist', title: step.kind === 'review' ? 'Review checklist' : 'ผลการตรวจเงื่อนไข',
        items: [
          { text: 'มีครบทุกหัวข้อตาม Template', ok: true },
          { text: 'ตัวเลขราคาสอดคล้องกับ Price List', ok: true },
          { text: 'ไม่มีข้อมูลส่วนบุคคลที่ไม่ควรเปิดเผย', ok: true },
          { text: 'มีข้อมูลงบประมาณของลูกค้า', ok: step.loops > 0 || !isProposal(run) },
        ],
      }
    case 'data':
    case 'accounting':
      return {
        type: 'table', title: step.kind === 'data' ? 'Insight summary' : 'Reconciliation result',
        columns: ['รายการ', 'ค่า', 'หมายเหตุ'],
        rows: [
          ['ยอดรวม', '฿42.6M', '+9.2% จากเดือนก่อน'],
          ['รายการผิดปกติ', '7', 'ต้องตรวจสอบ 3 รายการ'],
          ['สูงสุด', 'Northern region', 'โต 21%'],
        ],
      }
    default:
      return {
        type: 'bullets', title: `${step.name} — ผลลัพธ์`,
        items: [{ text: `ดำเนินการ "${subject}" เรียบร้อย` }, { text: 'ผลลัพธ์ถูกส่งต่อให้ขั้นตอนถัดไปแล้ว' }],
      }
  }
}
