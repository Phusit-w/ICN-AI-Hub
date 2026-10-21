// Agent "forms" are the editable shape behind the Create Agent page; these helpers fill one in
// (from scratch, from an existing agent, or from a plain-language description) and turn it into an Agent.

import { rankByMatch, truncate, uid } from './utils'

export const INSTRUCTION_STARTERS = {
  sales: 'คุณคือที่ปรึกษาฝ่ายขายของ ICN\n- วิเคราะห์ความต้องการลูกค้าจากข้อมูลที่ได้รับ\n- เสนอ Solution ที่เหมาะสมพร้อมเหตุผล\n- ห้ามให้ส่วนลดเกิน 15% โดยไม่ระบุว่าต้องขออนุมัติ',
  hr: 'คุณคือผู้ช่วยฝ่ายบุคคลของ ICN\n- ตอบจากคู่มือพนักงานเท่านั้น และอ้างอิงเลขหมวด\n- ถ้าไม่แน่ใจ ให้แนะนำติดต่อ HR\n- ห้ามเปิดเผยข้อมูลส่วนบุคคลของพนักงานอื่น',
  it: 'คุณคือ IT Support ของ ICN\n- แนะนำวิธีแก้ทีละขั้นตอนแบบเข้าใจง่าย\n- ถ้าแก้ไม่ได้ใน 3 ขั้นตอน ให้เปิด Ticket\n- ห้ามขอรหัสผ่านจากผู้ใช้',
  accounting: 'คุณคือนักบัญชีของ ICN\n- ตรวจตัวเลขทุกครั้งก่อนสรุป\n- แสดงสูตรหรือที่มาของตัวเลข\n- ใช้ผังบัญชีของบริษัทเท่านั้น',
  core: 'คุณคือผู้ช่วยของ ICN\n- ทำงานตามที่ได้รับมอบหมายอย่างกระชับและถูกต้อง\n- ระบุแหล่งที่มาของข้อมูลเสมอ',
}

/** What an agent is searched and matched by. */
export const agentSearchText = (a) => `${a.name} ${a.description} ${a.examples.join(' ')}`

export const BLANK_FORM = { name: '', description: '', dept: 'sales', kind: 'sales', instruction: '', model: 'auto', classification: 'internal', knowledge: [], uploads: [], skills: [], tools: [], format: 'Word document', language: 'TH', template: '', share: 'private', editors: 'me' }

/** Every setting of `src`, ready to adjust. Sharing resets to private. */
export function formFromAgent(src) {
  return {
    ...BLANK_FORM, name: src.name, description: src.description, dept: src.dept, kind: src.kind, instruction: src.instruction,
    model: src.model, classification: src.classification, knowledge: src.knowledge, skills: src.skills, tools: src.tools,
    format: src.output.format, language: src.output.language, template: src.output.template,
  }
}

/**
 * Mock "AI fill": starts from the existing agent closest to the description (or a core agent),
 * and turns the description into the name, summary and main instruction.
 */
export function draftForm(text, agents) {
  const base = rankByMatch(agents, agentSearchText, text)[0] ?? agents.find((a) => a.id === 'agent-document') ?? agents[0]
  return {
    ...formFromAgent(base),
    name: `ผู้ช่วย${truncate(text.trim().replace(/\s+/g, ' '), 36)}`,
    description: text.trim(),
    instruction: `${INSTRUCTION_STARTERS[base.dept] ?? INSTRUCTION_STARTERS.core}\n- งานหลัก: ${text.trim()}`,
    based: base.name,
  }
}

export function agentFromForm(form, { owner, note, forkedFrom }) {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: uid('agent'), name: form.name.trim(), description: form.description.trim(), dept: form.dept, kind: form.kind,
    instruction: form.instruction, model: form.model, classification: form.classification,
    knowledge: form.knowledge, uploads: form.uploads, skills: form.skills, tools: form.tools,
    output: { format: form.format, language: form.language, template: form.template || 'Default' },
    share: form.share, owner, rating: 0, uses: 0, version: '1.0', updated: today,
    examples: [], versions: [{ v: '1.0', date: today, by: owner, note }],
    forkedFrom,
  }
}
