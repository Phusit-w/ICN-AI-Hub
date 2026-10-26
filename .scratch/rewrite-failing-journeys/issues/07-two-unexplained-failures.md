# 07: เทสต์สองข้อที่ยังไม่รู้สาเหตุ

**What to build:** หาสาเหตุของเทสต์สองข้อนี้ก่อน แล้วแก้ที่ถูกจุด (แอปหรือเทสต์) ผมยังไม่ได้ไล่

1. `4-create-agent`: "@ calls an existing Agent to help write; the AI uses it, and it does not become a Step" ล้มเพราะหา link ชื่อ `/สร้างเองได้/` ไม่เจอ ดูว่าข้อความ "สร้างเองได้" ในหน้าสร้าง Agent หายไปหรือเปลี่ยนคำ
2. `workspace-chat-or-plan`: `"TOR" matches the Proposal Agent with Steps only as a word, not inside words like "inventory"` ล้มด้วย `expected false to be true` (ไม่ใช่เรื่องหาปุ่ม) ดูว่าตัวจับคีย์เวิร์ดของ planner เปลี่ยน หรือเทสต์ตั้งสมมติฐานเรื่องปุ่ม/ข้อความที่เปลี่ยนไป

**Blocked by:** ไม่มี

**Status:** needs-triage

- [ ] จดสาเหตุของแต่ละข้อใต้ `## Comments`
- [ ] แก้ที่ถูกจุดและเทสต์ผ่าน ถ้าสาเหตุคือบั๊กในแอป ให้เปิดตั๋วแยกแทนการซ่อนในเทสต์
- [ ] `npx vitest run` ไม่มีข้อไหนล้มเพิ่ม
