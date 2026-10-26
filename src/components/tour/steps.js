// Guided tour: at most 6 steps (now 5) (spec: decision "Tour"). Each page should explain itself, so the tour
// only points at the few things a first-time user needs. `target` matches a data-tour="…" attribute on
// a real element; `route` is the page the step lives on; `sidebar` marks a target in the sidebar, which the
// shell then shows (expanded on desktop, the drawer on phones). Steps whose element isn't visible are skipped.

export const TOUR_STEPS = [
  { route: '/workspace', target: 'home-command', title: 'สั่งงาน AI', body: 'พิมพ์งานที่ต้องการเป็นภาษาปกติ เช่น "ทำ Proposal ให้ลูกค้า" แล้วกด Enter ระบบจะเลือก AI Agent ที่เหมาะให้เอง ถ้าต้องใช้ Agent หลายตัว จะเสนอแผนงานให้คุณกด "เริ่มทำงาน" ก่อน ได้ผลงานแล้วกด "บันทึกไว้ใช้ซ้ำ" เพื่อเก็บงานนี้เป็น Agent ของคุณ' },
  { route: '/workspace', target: 'search', sidebar: true, title: 'ค้นหาทั้งระบบ', body: 'ค้นหา Agent หรือทักษะที่เพื่อนร่วมงานสร้างไว้ได้จากที่นี่' },
  { route: '/agents', target: 'agents-create', title: 'AI Agent', body: 'เลือก Agent ที่เหมาะกับงาน หรือกด "＋ สร้าง Agent" แล้วคุยกับ AI ให้ช่วยสร้าง ทักษะ (คู่มือการทำงานที่ใช้ร่วมกันได้) เลือกได้ตอนสร้าง Agent' },
  { route: '/agent', target: 'personal-channels', title: 'Agent ของคุณ', body: 'ทุกคนมี Agent ส่วนตัวที่จำงานและความชอบของคุณ ดูและแก้สิ่งที่มันจำได้ที่หน้านี้ สั่งงานจาก LINE หรือแผง Office Add-in ได้จากส่วน “ช่องทาง” (ถ้า Admin เปิดใช้) และมันจะถามคุณก่อนทุกครั้งที่จะส่งอีเมลหรือเขียนลงไฟล์' },
  { route: '/workspace', target: 'new-task', sidebar: true, title: 'พร้อมแล้ว!', body: 'กด "แชตใหม่" เมื่อไหร่ก็ได้เพื่อเริ่มงานแรกของคุณ ลืมคำไหนกด "วิธีใช้" ด้านบนได้ตลอด' },
]
