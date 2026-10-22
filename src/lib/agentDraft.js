// Agent "forms" are the editable shape behind the Create Agent page; these helpers fill one in
// (from scratch, from an existing agent, or from a plain-language description) and turn it into an Agent.

import { KNOWLEDGE } from '../data/catalog'
import { cubeOf } from './cube'
import { rankByMatch, truncate, uid } from './utils'

export const INSTRUCTION_STARTERS = {
  sales: 'คุณคือที่ปรึกษาฝ่ายขายของ ICN\n- วิเคราะห์ความต้องการลูกค้าจากข้อมูลที่ได้รับ\n- เสนอ Solution ที่เหมาะสมพร้อมเหตุผล\n- ห้ามให้ส่วนลดเกิน 15% โดยไม่ระบุว่าต้องขออนุมัติ',
  hr: 'คุณคือผู้ช่วยฝ่ายบุคคลของ ICN\n- ตอบจากคู่มือพนักงานเท่านั้น และอ้างอิงเลขหมวด\n- ถ้าไม่แน่ใจ ให้แนะนำติดต่อ HR\n- ห้ามเปิดเผยข้อมูลส่วนบุคคลของพนักงานอื่น',
  it: 'คุณคือ IT Support ของ ICN\n- แนะนำวิธีแก้ทีละขั้นตอนแบบเข้าใจง่าย\n- ถ้าแก้ไม่ได้ใน 3 ขั้นตอน ให้ร่างอีเมลแจ้ง IT\n- ห้ามขอรหัสผ่านจากผู้ใช้',
  accounting: 'คุณคือนักบัญชีของ ICN\n- ตรวจตัวเลขทุกครั้งก่อนสรุป\n- แสดงสูตรหรือที่มาของตัวเลข\n- ใช้ผังบัญชีของบริษัทเท่านั้น',
  core: 'คุณคือผู้ช่วยของ ICN\n- ทำงานตามที่ได้รับมอบหมายอย่างกระชับและถูกต้อง\n- ระบุแหล่งที่มาของข้อมูลเสมอ',
}

/** What an agent is searched and matched by. */
export const agentSearchText = (a) => `${a.name} ${a.description} ${a.examples.join(' ')}`

export const BLANK_FORM = { name: '', description: '', dept: 'sales', kind: 'sales', instruction: '', model: 'auto', classification: 'internal', knowledge: [], uploads: [], skills: [], tools: [], format: 'Word document', language: 'TH', template: '', cube: null, share: 'private', editors: 'me', steps: [] }

/** Every setting of `src`, its Steps included, ready to adjust. Sharing resets to private. */
export function formFromAgent(src) {
  return {
    ...BLANK_FORM, name: src.name, description: src.description, dept: src.dept, kind: src.kind, instruction: src.instruction,
    model: src.model, classification: src.classification, knowledge: src.knowledge, skills: src.skills, tools: src.tools,
    format: src.output.format, language: src.output.language, template: src.output.template, steps: src.steps, cube: src.cube ?? null,
  }
}

/**
 * Mock "AI fill": starts from the existing agent closest to the description (or a core agent),
 * and turns the description into the name, summary and main instruction. Steps start empty: the user adds them.
 */
export function draftForm(text, agents) {
  const base = rankByMatch(agents, agentSearchText, text)[0] ?? agents.find((a) => a.id === 'agent-document') ?? agents[0]
  return {
    ...formFromAgent(base),
    name: `ผู้ช่วย${truncate(text.trim().replace(/\s+/g, ' '), 36)}`,
    description: text.trim(),
    instruction: `${INSTRUCTION_STARTERS[base.dept] ?? INSTRUCTION_STARTERS.core}\n- งานหลัก: ${text.trim()}`,
    steps: [],
    based: base.name,
  }
}

export function agentFromForm(form, { owner, note, forkedFrom }) {
  const today = new Date().toISOString().slice(0, 10)
  const id = uid('agent')
  return {
    id, cube: form.cube ?? cubeOf({ id, kind: form.kind }), name: form.name.trim(), description: form.description.trim(), dept: form.dept, kind: form.kind,
    instruction: form.instruction, model: form.model, classification: form.classification,
    knowledge: form.knowledge, uploads: form.uploads, skills: form.skills, tools: form.tools,
    output: { format: form.format, language: form.language, template: form.template || 'Default' },
    share: form.share, owner, uses: 0, version: '1.0', updated: today,
    examples: [], versions: [{ v: '1.0', date: today, by: owner, note }], steps: form.steps,
    forkedFrom,
  }
}

/** The Agents written as `@Name` in a builder chat message. */
const mentionedIn = (text, agents) => agents.filter((a) => text.includes(`@${a.name}`))

const knowledgeNames = (ids) => ids.map((id) => KNOWLEDGE.find((k) => k.id === id)?.name ?? id).join(', ')

/**
 * Mock builder AI: takes one chat message and returns the next form and the AI's reply.
 * The first message drafts the Agent, keeping whatever the user already set (name, instruction, Skills, sharing,
 * Steps); later ones add to its instruction. An @-mentioned Agent lends its instruction and the knowledge it cites,
 * written into the instruction where the user can see and edit them, and is never added as a Step.
 */
export function builderTurn(form, text, agents) {
  const mentioned = mentionedIn(text, agents)
  const said = mentioned.reduce((t, a) => t.replaceAll(`@${a.name}`, a.name), text).replace(/\s+/g, ' ').trim()
  const first = !form.description.trim()
  const draft = first && draftForm(said, agents)
  let next = first
    ? {
      ...draft, share: form.share, steps: form.steps,
      name: form.name.trim() ? form.name : draft.name,
      instruction: form.instruction.trim() ? `${form.instruction.trimEnd()}\n- งานหลัก: ${said}` : draft.instruction,
      skills: [...new Set([...form.skills, ...draft.skills])],
    }
    : { ...form, instruction: `${form.instruction.trimEnd()}\n- ${said}`.trim() }
  for (const a of mentioned) {
    const cites = a.knowledge.length > 0 ? ` (อ้างอิง ${knowledgeNames(a.knowledge)})` : ''
    next = { ...next, instruction: `${next.instruction}\n- ตามแนวทางของ ${a.name}: ${a.instruction}${cites}` }
  }
  const reply = first
    ? `ร่าง “${next.name}” ให้แล้ว${draft.based ? ` โดยเริ่มจาก ${draft.based}` : ''} ดูและแก้ได้ทางขวา อยากให้ทำอะไรเพิ่ม หรือมีอะไรที่ห้ามทำไหม`
    : `เพิ่มในคำสั่งแล้ว: “${said}” มีอะไรอีกไหม หรือกด “สร้างผู้ช่วย” ได้เลย`
  const helpedBy = mentioned.length > 0 ? ` — ใช้คำสั่งและความรู้ของ ${mentioned.map((a) => a.name).join(', ')} มาช่วยเขียนแล้ว (ไม่ได้ใส่เป็นขั้นตอน)` : ''
  return { form: next, reply: reply + helpedBy }
}

const ANSWER_RULES = ['- ตอบเป็นภาษาไทยที่สุภาพและกระชับ', '- ถ้าข้อมูลไม่พอ ให้ถามกลับก่อนตอบ']
/** Lines `writeInstruction` writes itself, so rewriting again doesn't repeat them as rules. */
const OWN_LINE = /^(คุณคือ|หน้าที่:|สิ่งที่ต้องทำ:|รูปแบบคำตอบ:)/

/**
 * Mock "✨ ให้ AI ช่วยเขียน": rewrites the instruction into a clear role, duties and answer format.
 * Every line the user already had is kept as a rule; only the role line is rewritten.
 */
export function writeInstruction(form) {
  const starter = INSTRUCTION_STARTERS[form.dept] ?? INSTRUCTION_STARTERS.core
  const rules = [...new Set([...starter.split('\n'), ...form.instruction.split('\n')]
    .map((l) => l.trim())
    .filter((l) => l && !OWN_LINE.test(l) && !ANSWER_RULES.includes(l))
    .map((l) => (l.startsWith('-') ? l : `- ${l}`)))]
  return [
    `คุณคือ “${form.name.trim() || 'ผู้ช่วย'}” ของ ICN`,
    ...(form.description.trim() ? [`หน้าที่: ${form.description.trim()}`] : []),
    '', 'สิ่งที่ต้องทำ:', ...rules,
    '', 'รูปแบบคำตอบ:', ...ANSWER_RULES,
  ].join('\n')
}
