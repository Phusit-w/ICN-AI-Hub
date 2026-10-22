// Guided tour: at most 6 steps (now 5) (spec: decision "Tour"). Each page should explain itself, so the tour
// only points at the few things a first-time user needs. `target` matches a data-tour="…" attribute on
// a real element; `route` is the page the step lives on; `sidebar` marks a target in the sidebar, which the
// shell then shows (expanded on desktop, the drawer on phones). Steps whose element isn't visible are skipped.

export const TOUR_STEPS = [
  { route: '/workspace', target: 'home-command', title: 'สั่งงาน AI', body: 'พิมพ์งานที่ต้องการเป็นภาษาปกติ เช่น "ทำ Proposal ให้ลูกค้า" แล้วกด Enter ระบบจะเลือกผู้ช่วย AI ที่เหมาะให้เอง ถ้าต้องใช้ผู้ช่วยหลายตัว จะเสนอแผนงานให้คุณกด "เริ่มเลย" ก่อน' },
  { route: '/workspace', target: 'home-reuse', title: 'ใช้ซ้ำ', body: 'ผู้ช่วยประจำและสายงานที่ใช้บ่อยอยู่ตรงนี้ กด 1 ครั้งเพื่อเลือกใส่ช่องสั่งงาน แล้วพิมพ์งานส่งได้เลย งานที่เคยสั่งอยู่ใน "ประวัติแชต" ด้านซ้าย' },
  { route: '/workspace', target: 'search', sidebar: true, title: 'ค้นหาทั้งระบบ', body: 'ค้นหาผู้ช่วย ทักษะ หรือสายงานที่เพื่อนร่วมงานสร้างไว้ได้จากที่นี่' },
  { route: '/agents', target: 'agents-create', title: 'ผู้ช่วย AI', body: 'เลือกผู้ช่วยที่เหมาะกับงาน หรือกด "＋ สร้างผู้ช่วย" แล้วคุยกับ AI ให้ช่วยสร้าง ทักษะ (คู่มือการทำงานที่ใช้ร่วมกันได้) เลือกได้ตอนสร้างผู้ช่วย' },
  { route: '/workspace', target: 'new-task', sidebar: true, title: 'พร้อมแล้ว!', body: 'กด "แชตใหม่" เมื่อไหร่ก็ได้เพื่อเริ่มงานแรกของคุณ ลืมคำไหนกด "วิธีใช้" ด้านบนได้ตลอด' },
]
