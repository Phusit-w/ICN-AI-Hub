// Guided tour: at most 6 steps (spec: decision "Tour"). Each page should explain itself, so the tour
// only points at the few things a first-time user needs. `target` matches a data-tour="…" attribute on
// a real element; `route` is the page the step lives on. Steps whose element isn't visible are skipped.

export const TOUR_STEPS = [
  { route: '/', target: 'home-command', title: 'สั่งงาน AI', body: 'พิมพ์งานที่ต้องการเป็นภาษาปกติ เช่น "ทำ Proposal ให้ลูกค้า" แล้วกด Enter ระบบจะเลือกผู้ช่วย AI ที่เหมาะให้เอง ถ้าต้องใช้ผู้ช่วยหลายตัว จะเสนอแผนงานให้คุณกด "เริ่มเลย" ก่อน' },
  { route: '/', target: 'home-reuse', title: 'ใช้ซ้ำ', body: 'ผู้ช่วยประจำและสายงานที่ใช้บ่อยอยู่ตรงนี้ กด 1 ครั้งเพื่อเลือกใส่ช่องสั่งงาน แล้วพิมพ์งานส่งได้เลย' },
  { route: '/', target: 'home-tasks', title: 'งานของฉัน', body: 'ติดตามงานที่ AI กำลังทำและงานที่เสร็จแล้ว กดเพื่อเปิดดูผลงานได้' },
  { route: '/', target: 'search', title: 'ค้นหาทั้งระบบ', body: 'ค้นหาผู้ช่วย ทักษะ หรือสายงานที่เพื่อนร่วมงานสร้างไว้ได้จากที่นี่' },
  { route: '/agents', target: 'agents-tabs', title: 'ผู้ช่วย AI', body: 'เลือกผู้ช่วยที่เหมาะกับงาน หรือสร้างเอง แท็บ "ทักษะ" คือคู่มือการทำงานที่ใส่ให้ผู้ช่วยหลายตัวใช้ร่วมกันได้' },
  { route: '/', target: 'new-task', title: 'พร้อมแล้ว!', body: 'กด "สั่งงานใหม่" เมื่อไหร่ก็ได้เพื่อเริ่มงานแรกของคุณ ลืมคำไหนกด "วิธีใช้" ด้านบนได้ตลอด' },
]
