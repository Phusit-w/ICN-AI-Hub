// The Personal agent: one per User, shown in the composer in place of "อัตโนมัติ". What it keeps about its User is its Memory
// (private to them, never copied onto an Agent they share). Pure data and helpers; the store holds the state.

export const DEFAULT_NAME = 'Agent ของคุณ'

const memory = (id, text, keys) => ({ id, text, keys })

/** The User persona has used their Personal agent for a while, so the demo opens with a real Memory to show. */
export const seedPersonal = () => ({
  'u-kanya': {
    name: DEFAULT_NAME, setup: 'done',
    memories: [
      memory('m-kanya-1', 'งานประจำ: ทำ Proposal และสรุปข้อมูลให้ลูกค้ากลุ่มค้าปลีกและโลจิสติกส์', ['proposal', 'ลูกค้า', 'เสนอ']),
      memory('m-kanya-2', 'ชอบรายงานสั้น ขึ้นต้นด้วยข้อสรุป ไม่เกินหนึ่งหน้า', ['รายงาน', 'สรุป']),
    ],
  },
  // The Admin persona has not met their Personal agent yet, so switching to the Admin view shows the first-use invitation.
  'u-kittipong': { name: DEFAULT_NAME, setup: 'pending', memories: [] },
})

const NONE = { name: DEFAULT_NAME, setup: 'pending', memories: [] }

/** The signed-in User's Personal agent (a brand-new User has one that is not set up yet). */
export const personalOf = (state) => state.personal?.[state.userId] ?? NONE

/** The Memories whose keywords appear in the request: only these are used for it, never the whole Memory. */
export function relevantMemories(memories, prompt) {
  const text = prompt.toLowerCase()
  return memories.filter((m) => m.keys.some((k) => text.includes(k.toLowerCase())))
}

// What the first chat guesses from the User's department, so most people only confirm.
const ROUTINE = {
  sales: ['ทำ Proposal และสรุปข้อมูลลูกค้า', ['proposal', 'ลูกค้า', 'เสนอ']],
  hr: ['ตอบคำถามสวัสดิการและวันลา', ['สวัสดิการ', 'วันลา', 'นโยบาย']],
  accounting: ['ปิดงบและกระทบยอด', ['ปิดงบ', 'กระทบยอด', 'invoice']],
  it: ['แก้ปัญหาไอทีให้พนักงาน', ['vpn', 'ระบบ', 'ticket']],
  bid: ['ตรวจ TOR และ SOC', ['tor', 'soc']],
}
const OTHER_ROUTINE = ['งานเอกสารและรายงานประจำ', ['รายงาน', 'เอกสาร']]

/** The setup chat's questions (at most five), each with a guess the User can accept in one click. */
export function setupQuestions(dept) {
  const [routine] = ROUTINE[dept] ?? OTHER_ROUTINE
  return [
    { id: 'routine', ask: 'งานประจำของคุณคืออะไร', guess: routine },
    { id: 'tools', ask: 'ใช้เครื่องมืออะไรเป็นประจำ', guess: 'LINE อีเมล และ Excel' },
    { id: 'style', ask: 'ชอบให้ผลออกมาแบบไหน', guess: 'สรุปสั้น ขึ้นต้นด้วยข้อสรุป' },
    { id: 'name', ask: 'อยากเรียก Agent ของคุณว่าอะไร', guess: DEFAULT_NAME },
  ]
}

/** The Memories and name that the setup chat's answers (by question id) become. */
export function personalFromSetup(dept, answers, userId) {
  const [, routineKeys] = ROUTINE[dept] ?? OTHER_ROUTINE
  return {
    name: answers.name?.trim() || DEFAULT_NAME,
    memories: [
      memory(`m-${userId}-routine`, `งานประจำ: ${answers.routine}`, routineKeys),
      memory(`m-${userId}-tools`, `เครื่องมือที่ใช้: ${answers.tools}`, ['อีเมล', 'excel', 'line']),
      memory(`m-${userId}-style`, `ผลที่ชอบ: ${answers.style}`, ['รายงาน', 'สรุป']),
    ],
  }
}
