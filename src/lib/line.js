// The company's LINE bot, simulated in the app (ADR 0002): a Channel into the User's Personal agent. Pure rules and helpers; the store holds the state.
import { isSensitive } from './runs'
import { truncate, uid } from './utils'

export const BOT_NAME = 'ICN Assistant'
export const MENTION = `@${BOT_NAME}`
export const GROUP_NAME = 'ทีมขาย'
export const CODE_TTL_MS = 5 * 60 * 1000

// One record per User: whether their LINE is linked, the code on offer, and what each simulated chat shows.
const NONE = { linked: false, code: null, expiresAt: 0, notify: true, botInGroup: false, private: [], group: [] }

/** A User's LINE (not linked to begin with). */
export const lineOf = (state, userId = state.userId) => state.line?.[userId] ?? NONE

/** `state` with the User's LINE record changed by `update`. */
export const withLine = (state, userId, update) => ({ ...state, line: { ...state.line, [userId]: update(lineOf(state, userId)) } })

export const say = (from, text, link) => ({ id: uid('line'), from, text, link })
export const newCode = () => String(Math.floor(100000 + Math.random() * 900000))
export const runLink = (run) => `/workspace?run=${run.id}`

export const HOW_TO_LINK = `ยังไม่ได้ผูกบัญชี เปิดแอป ICN AI Hub ไปที่ “Agent ของคุณ” แล้วเลือก LINE เพื่อรับรหัส 6 หลัก จากนั้นพิมพ์รหัสมาที่นี่ในแชตส่วนตัว`
export const GROUP_INTRO = `สวัสดีครับ ผมคือ ${BOT_NAME} ผมอ่านเฉพาะข้อความที่เรียกผมด้วย ${MENTION} เท่านั้น ข้อความอื่นของกลุ่มผมไม่อ่านและไม่เก็บ`
const SENSITIVE_REPLY = 'ข้อความนี้มีข้อมูลที่ไม่ควรส่งผ่าน LINE ผมไม่ได้เริ่มงานให้ กรุณาสั่งงานนี้ในเว็บแอปแทน'

/** What the bot makes of a message: nothing (`silent`), a reply, a link of the account (`bind`), or a request to do as work. */
export function hear(line, chat, text, now) {
  const mentioned = text.includes(MENTION)
  // In a group the bot reads only what calls it.
  if (chat === 'group' && !(line.botInGroup && mentioned)) return { silent: true }
  const request = text.replace(MENTION, '').trim()
  if (!line.linked) {
    if (chat === 'private' && /^\d{6}$/.test(request)) {
      return request === line.code && now < line.expiresAt
        ? { bind: true, reply: 'ผูกบัญชีเรียบร้อยแล้ว ต่อไปพิมพ์สั่งงานมาที่นี่ได้เลย' }
        : { reply: 'รหัสนี้ใช้ไม่ได้หรือหมดอายุแล้ว กรุณารับรหัสใหม่ในแอป' }
    }
    return { reply: HOW_TO_LINK }
  }
  if (!request) return { reply: 'บอกได้เลยว่าจะให้ช่วยเรื่องอะไร' }
  if (isSensitive(request)) return { reply: SENSITIVE_REPLY }
  return { work: request }
}

/** The short summary the bot sends when a Run finishes: no files, only a link into the app. */
export const finishedMessage = (run) => say('bot', `งาน “${truncate(run.title, 40)}” เสร็จแล้ว (${run.steps.length} ขั้นตอน) ดูผลและดาวน์โหลดไฟล์ในแอป`, runLink(run))

/** What the bot would post in the group for a Run asked there: it says nothing about the work itself. */
export const groupSummary = (run) => `งานที่ขอเรียกผมไว้เสร็จแล้ว ดูผลในแอป ICN AI Hub (เปิดได้เฉพาะคนที่ผูกบัญชี): ${runLink(run)}`

/** `state` after `run` finished: a Run asked in a private chat is answered there, any other Run of a linked User with notices on is announced. */
export function noticeFinished(state, run) {
  const line = lineOf(state, run.owner)
  const asked = run.line?.chat
  if (!line.linked || asked === 'group' || (!asked && !line.notify)) return state
  return withLine(state, run.owner, (l) => ({ ...l, private: [...l.private, finishedMessage(run)] }))
}
