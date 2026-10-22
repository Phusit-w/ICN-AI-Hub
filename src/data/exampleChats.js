// Example chats from real work (spec .scratch/real-example-chats): scripted Threads in the demo User's chat history.
// Every name, number and file here is made up. Nothing calls an AI; the Agents are in agents.js.

const PASS = 'ผ่าน'
const FAIL = 'ไม่ผ่าน'
const UNSURE = 'ไม่พบ ต้องตรวจเอง'

const SOC_ROWS = [
  ['1', 'Switching capacity ไม่น้อยกว่า 176 Gbps', '176 Gbps', '3', PASS, ''],
  ['2', 'พอร์ต 10/100/1000 Base-T ไม่น้อยกว่า 48 พอร์ต', '48 พอร์ต', '2', PASS, ''],
  ['3', 'พอร์ต SFP+ 10G ไม่น้อยกว่า 4 พอร์ต', '2 พอร์ต SFP+', '2', FAIL, 'ได้ 2 พอร์ต ต้องการ 4 พอร์ต'],
  ['4', 'รองรับ PoE+ (IEEE 802.3at) รวมไม่น้อยกว่า 740 W', '740 W', '5', PASS, ''],
  ['5', 'MAC address table ไม่น้อยกว่า 16,000 รายการ', '16K entries', '3', PASS, ''],
  ['6', 'รองรับ Stacking ไม่น้อยกว่า 4 ชุด', '-', '-', UNSURE, 'ไม่พบคำว่า stacking ใน datasheet'],
  ['7', 'รองรับ IPv6 Routing แบบ Static', 'IPv6 static routing', '6', PASS, ''],
  ['8', 'รับประกัน 5 ปี', '3 ปี (Limited Lifetime สำหรับรุ่นอื่น)', '9', FAIL, 'ระบุรับประกัน 3 ปี'],
]

const countOf = (result) => SOC_ROWS.filter((r) => r[4] === result).length

export const SOC_CHECK_CHAT = {
  agentId: 'agent-soc-check',
  title: 'ตรวจ SOC เทียบ datasheet',
  prompt: 'ช่วยตรวจ SOC สวิตช์ 48 พอร์ตของโครงการ เทียบกับ datasheet ที่แนบ ว่าแต่ละข้อผ่านไหม และอ้างหน้าไหน',
  attachments: [
    { id: 'ex-soc-1', name: 'SOC_Switch-48P.xlsx', size: 46 * 1024 },
    { id: 'ex-soc-2', name: 'Datasheet_NetCore-SW48P.pdf', size: 2.4 * 1024 * 1024 },
  ],
  output: {
    type: 'table',
    title: 'ผลตรวจ SOC เทียบ datasheet.xlsx',
    summary: `ตรวจ ${SOC_ROWS.length} ข้อ: ผ่าน ${countOf(PASS)} · ไม่ผ่าน ${countOf(FAIL)} · ไม่พบ ต้องตรวจเอง ${countOf(UNSURE)}`,
    sheets: [{
      name: 'ผลตรวจรายข้อ',
      columns: ['ข้อ', 'ข้อกำหนดใน SOC', 'ค่าที่พบใน datasheet', 'หน้าที่อ้าง', 'ผล', 'หมายเหตุ'],
      rows: SOC_ROWS,
    }],
    note: 'ข้อที่ “ไม่พบ ต้องตรวจเอง” คือหาไม่เจอใน datasheet ที่แนบ ไม่ได้แปลว่าไม่ผ่าน กรุณาเปิดตรวจเอง',
  },
}

/** The example chats, in the order they are seeded. */
export const EXAMPLE_CHATS = [SOC_CHECK_CHAT]
