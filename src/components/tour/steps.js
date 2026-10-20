// Guided tour, one feature per step. `target` matches a data-tour="…" attribute on a real element;
// `route` is the page the step lives on. Steps whose element isn't visible (e.g. sidebar on a phone) are skipped.

export const TOUR_STEPS = [
  { route: '/', target: 'nav', title: 'เมนูหลัก', body: 'ทุกหน้าของระบบอยู่ที่นี่ แบ่งเป็น งานของฉัน, คลังผู้ช่วยและทักษะ, และส่วนขององค์กร' },
  { route: '/', target: 'home-command', title: 'สั่งงาน AI', body: 'พิมพ์งานที่ต้องการเป็นภาษาปกติ เช่น "ทำ Proposal ให้ลูกค้า" แล้วกด Enter ระบบจะเลือกผู้ช่วย AI ที่เหมาะให้เอง' },
  { route: '/', target: 'home-quick', title: 'งานยอดนิยม', body: 'ไม่รู้จะพิมพ์อะไร? กดงานสำเร็จรูปตามแผนกได้ทันที 1 คลิก' },
  { route: '/', target: 'home-tasks', title: 'งานของฉัน', body: 'ติดตามงานที่ AI กำลังทำและงานที่เสร็จแล้ว กดเพื่อเปิดดูผลงานได้' },
  { route: '/', target: 'search', title: 'ค้นหาทั้งระบบ', body: 'ค้นหาผู้ช่วย ทักษะ หรือสายงานที่เพื่อนร่วมงานสร้างไว้ได้จากที่นี่' },
  { route: '/', target: 'help', title: 'วิธีใช้และคำศัพท์', body: 'ลืมว่าคำไหนหมายถึงอะไร กดที่นี่ได้ตลอด และเริ่มทัวร์นี้ใหม่ได้จากตรงนี้' },
  { route: '/workspace', target: 'ws-threads', title: 'ประวัติการสั่งงาน', body: 'บทสนทนาทั้งหมดของคุณ กด "แชตใหม่" เพื่อเริ่มงานใหม่' },
  { route: '/workspace', target: 'ws-mode', title: 'โหมด แชต / Workflow', body: 'แชต = คุยและรับผลงานแบบเรียบง่าย · Workflow = ดูแอนิเมชันว่าผู้ช่วยแต่ละตัวทำอะไร ส่งงานต่อให้ใคร' },
  { route: '/workspace', target: 'ws-composer', title: 'ช่องพิมพ์ข้อความ', body: 'พิมพ์คำถามหรืองาน แนบไฟล์ได้ และเลือกผู้ช่วยเองได้ถ้าต้องการ (ปกติปล่อยเป็น "อัตโนมัติ")' },
  { route: '/agents', target: 'agents-filters', title: 'คลังผู้ช่วย AI', body: 'ค้นหาและกรองผู้ช่วยตามแผนก, ประเภท AI (Local/Cloud) หรือดูเฉพาะรายการโปรด' },
  { route: '/agents', target: 'agent-card', title: 'การ์ดผู้ช่วย', body: '"ใช้งาน" เพื่อสั่งงานผู้ช่วยตัวนี้ · "รายละเอียด" ดูว่าทำอะไรได้ · ไอคอนคัดลอก เพื่อนำไปปรับเป็นของแผนกคุณ · ★ เก็บเป็นรายการโปรด' },
  { route: '/agents', target: 'agents-create', title: 'สร้างผู้ช่วยเอง', body: 'สร้างผู้ช่วยของแผนกได้ทีละขั้น ไม่ต้องเขียนโค้ด แล้วแชร์ให้ทีมใช้ต่อ' },
  { route: '/skills', target: 'skill-card', title: 'ทักษะ (Skill)', body: 'คู่มือการทำงานมาตรฐานที่ใช้ซ้ำได้ กด "เพิ่มให้ผู้ช่วย" เพื่อใส่ให้หลายผู้ช่วยพร้อมกัน แก้ที่เดียว ทุกตัวได้ผล' },
  { route: '/workflows', target: 'wf-palette', title: 'ชิ้นส่วนของสายงาน', body: 'ลากผู้ช่วย ทักษะ หรือเงื่อนไขจากตรงนี้ไปวางบน Canvas' },
  { route: '/workflows', target: 'wf-canvas', title: 'Canvas สร้างสายงาน', body: 'ลากเพื่อจัดตำแหน่ง คลิกจุดสีม่วงด้านขวาของกล่องเพื่อเชื่อมต่อ เส้นประสีส้มคือ "ถ้าไม่ผ่าน ให้ส่งกลับไปแก้"' },
  { route: '/workflows', target: 'wf-test', title: 'ทดลองรัน', body: 'ทดสอบสายงานได้ทันที แล้วดูสถานะของแต่ละกล่องเปลี่ยนแบบเรียลไทม์' },
  { route: '/governance', target: 'gov-local', title: 'ความปลอดภัยของข้อมูล', body: 'ดูสัดส่วนงานที่ประมวลผลภายในบริษัท ข้อมูลลับจะถูกส่งไป Local AI อัตโนมัติเสมอ' },
  { route: '/', target: 'new-task', title: 'พร้อมแล้ว!', body: 'กด "สั่งงานใหม่" เมื่อไหร่ก็ได้เพื่อเริ่มงานแรกของคุณ' },
]
