// Example chats from real work (spec .scratch/real-example-chats): scripted Threads in the demo User's chat history.
// Every name, number and file here is made up. Nothing calls an AI; the Agents are in agents.js.
//
// A chat is { agentId, title, runs }. Each Run is { prompt, attachments, output, ago } with `ago` in ms before now, plus
//   scheduleLabel   the Run was started by the Agent's Schedule, not by the User (it shows as a label, with no User message)
//   scheduleSet     { prompt }: the User then asked for the Schedule in this Thread, so a Schedule card follows

const MIN = 60000
const DAY = 24 * 60 * MIN

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
  runs: [{
    ago: 3 * DAY,
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
  }],
}

// Step log: the totals the Agent read from each member's step-counter picture. A number it could not read is left empty.
const WEEK_1 = '5-11 ต.ค.'
const WEEK_2 = '12-18 ต.ค.'
const MEMBERS = [['แก้ว', 'SLS'], ['ต้น', 'PRJ'], ['ฟ้า', 'ACC'], ['บุญ', 'MNT'], ['มิ้ว', 'IT']]
const STEPS_1 = [52310, 61845, 38902, 47120, 29466]
const STEPS_2 = [55008, 58310, null, 44931, 18724] // ฟ้า's picture was too blurry to read
const BLURRY = { 2: 'ตรวจสอบ · รูปเบลอ อ่านยอดรวมไม่ครบ (เห็นแค่ 4_,_7_) จึงเว้นว่างไว้' }

const th = (n) => (n == null ? '' : n.toLocaleString('en-US'))
const stepSheet = (week, steps, marks) => ({
  name: week,
  columns: ['ชื่อ', 'รหัสฝ่าย', 'ก้าวรวม'],
  rows: MEMBERS.map(([name, code], i) => [name, code, th(steps[i])]),
  ...(marks && { marks }),
})
const weekSummary = (week, steps) => {
  const read = steps.filter((n) => n != null)
  const total = read.reduce((a, b) => a + b, 0)
  return [week, String(read.length), th(total), th(Math.round(total / read.length))]
}

export const STEP_LOG_CHAT = {
  agentId: 'agent-step-log',
  title: 'บันทึกก้าวเดิน',
  runs: [
    {
      ago: 10 * DAY,
      prompt: `สรุปก้าวเดินกลุ่มเดินสัปดาห์ ${WEEK_1} ลงตารางให้หน่อย\n${MEMBERS.map(([name, code]) => `${name} (${code}) [รูปตัวนับก้าว]`).join('\n')}`,
      attachments: MEMBERS.map(([name], i) => ({ id: `ex-step-${i}`, name: `ก้าวเดิน_${name}.jpg`, size: (180 + i * 23) * 1024 })),
      output: {
        type: 'table',
        title: `ก้าวเดิน ${WEEK_1} 2026`,
        summary: `อ่านยอดจากรูปได้ ${MEMBERS.length} คน จาก ${MEMBERS.length} คน`,
        sheets: [stepSheet(WEEK_1, STEPS_1)],
      },
      scheduleSet: { prompt: 'บันทึกให้ทุกวันจันทร์ 20:00 เลย' },
    },
    {
      ago: 2.5 * DAY,
      scheduleLabel: 'ตั้งเวลา · จันทร์ 19 ต.ค. 20:00',
      prompt: `บันทึกก้าวเดินสัปดาห์ ${WEEK_2}`,
      output: {
        type: 'table',
        title: `ก้าวเดิน ${WEEK_2} 2026`,
        summary: `อ่านยอดจากรูปได้ ${STEPS_2.filter((n) => n != null).length} คน จาก ${MEMBERS.length} คน · 1 แถวรอตรวจสอบ`,
        sheets: [
          stepSheet(WEEK_2, STEPS_2, BLURRY),
          stepSheet(WEEK_1, STEPS_1),
          {
            name: 'สรุปรายสัปดาห์',
            columns: ['สัปดาห์', 'จำนวนคนที่อ่านได้', 'ก้าวรวมทั้งกลุ่ม', 'เฉลี่ยต่อคน'],
            rows: [weekSummary(WEEK_2, STEPS_2), weekSummary(WEEK_1, STEPS_1)],
          },
        ],
        note: 'ยอดรวมของสัปดาห์ล่าสุดยังไม่รวมแถวที่ติด “ตรวจสอบ” แก้เลขแล้วค่อยบันทึกซ้ำ',
      },
    },
  ],
}

/** The example chats, in the order they are seeded. */
export const EXAMPLE_CHATS = [SOC_CHECK_CHAT, STEP_LOG_CHAT]
