// Outward actions (ADR 0002): what a Personal agent does that leaves the app. It reads and drafts on its own; sending,
// posting and writing wait for the User's yes, unless the User has set that kind to automatic.
import { truncate } from './utils'

export const OUTWARD = {
  email: { label: 'ส่งอีเมล', autoLabel: 'ส่งอีเมล' },
  'line-group': { label: 'โพสต์ในกลุ่ม LINE', autoLabel: 'โพสต์ในกลุ่ม LINE' },
  excel: { label: 'เพิ่มแถวใน Excel', autoLabel: 'เพิ่มแถวใน Excel' },
}
export const OUTWARD_TYPES = Object.keys(OUTWARD)

/** The Excel file on Office365 that rows are added to (simulated). */
export const EXCEL_FILE = 'ตารางงานทีม.xlsx'
export const EXCEL_COLUMNS = ['วันที่', 'รายการ', 'ผู้บันทึก']

// What in a request counts as asking for an Outward action. "อีเมลใช้ไม่ได้" is a problem report, not a draft to send.
const RULES = [
  ['excel', /(เพิ่ม|ใส่|บันทึก)[^\n]{0,12}(แถว|ลง ?excel|ใน ?excel)/i],
  ['email', /(ร่าง|เขียน|ตอบ|ส่ง)[^\n]{0,12}(อีเมล|เมล|email)/i],
]

/** The Outward action a request asks for, with the draft the User will check, or null. */
export function outwardFor(prompt, userName, today = new Date()) {
  const type = RULES.find(([, test]) => test.test(prompt))?.[0]
  if (!type) return null
  const topic = truncate(prompt, 48)
  if (type === 'email') {
    return {
      type, status: 'asking',
      draft: { subject: `เรื่อง ${topic}`, body: `เรียน ผู้เกี่ยวข้อง\n\nตามที่ได้รับแจ้งเรื่อง “${topic}” ขอแจ้งความคืบหน้าและแนวทางดำเนินการดังนี้ ทีมงานจะติดต่อกลับภายในสองวันทำการ\n\nขอแสดงความนับถือ\n${userName}` },
    }
  }
  return { type, status: 'asking', draft: { file: EXCEL_FILE, columns: EXCEL_COLUMNS, row: [today.toISOString().slice(0, 10), topic, userName] } }
}
