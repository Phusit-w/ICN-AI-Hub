// Skill "forms" are the editable shape behind the Create Skill page; these helpers fill one in
// (from scratch or from a plain-language description) and turn it into a Skill.

import { rankByMatch, truncate, uid } from './utils'

export const BLANK_SKILL_FORM = { name: '', purpose: '', category: 'Writing & Format', icon: 'file', instruction: '', input: '', output: '', tools: [], template: '', share: 'department' }

/** What a skill is matched by. */
const skillSearchText = (s) => `${s.name} ${s.purpose} ${s.category}`

/**
 * Mock "AI fill": starts from the existing skill closest to the description (or the first one),
 * and turns the description into the name, purpose and working steps.
 */
export function draftSkillForm(text, skills) {
  const goal = text.trim().replace(/\s+/g, ' ')
  const base = rankByMatch(skills, skillSearchText, goal)[0] ?? skills[0]
  return {
    ...BLANK_SKILL_FORM,
    category: base?.category ?? BLANK_SKILL_FORM.category,
    icon: base?.icon ?? BLANK_SKILL_FORM.icon,
    tools: base?.tools ?? [],
    input: base?.input ?? '',
    output: base?.output ?? '',
    name: `ทักษะ${truncate(goal, 36)}`,
    purpose: goal,
    instruction: `1. อ่านข้อมูลที่ได้รับให้ครบ\n2. ${goal}\n3. ตรวจผลลัพธ์ก่อนส่ง และระบุแหล่งที่มาของข้อมูล`,
    based: base?.name,
  }
}

export function skillFromForm(form, { owner }) {
  const fields = { ...form }
  delete fields.based // only shown while drafting
  return {
    id: uid('skill'), ...fields, name: form.name.trim(), purpose: form.purpose.trim(), owner, rating: 0, uses: 0, version: '1.0',
    versions: [{ v: '1.0', date: new Date().toISOString().slice(0, 10), by: owner, note: 'สร้างใหม่' }],
  }
}
