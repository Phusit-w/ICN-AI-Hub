# 01: ปุ่มเริ่ม Plan เป็น "เริ่มทำงาน" แต่เทสต์หา "เริ่มเลย"

**What to build:** แอปแบบ B แสดงปุ่มเริ่ม Plan ในการ์ดแผนงาน (`src/components/run/PlanCard.jsx`) ว่า "เริ่มทำงาน" แต่เทสต์ 10 ข้อยังหาปุ่ม "เริ่มเลย" ให้แก้เทสต์ให้หา "เริ่มทำงาน" และตรวจข้อความอื่นที่อาจเปลี่ยนไปพร้อมกัน (หัวการ์ด "งานนี้มี N ขั้นตอน", ข้อความใน Thread "ผมวางแผนไว้ N ขั้นตอน ดูแผนที่พื้นที่ทำงาน แล้วกด “เริ่มทำงาน” ได้เลย") และให้แก้ `docs/DESIGN.md` กับ GLOSSARY ถ้ายังเขียน "เริ่มเลย" อยู่

ค่าเริ่มต้นที่เลือกไว้: คงคำในแอปคือ "เริ่มทำงาน" เพราะเป็นของที่ผู้ใช้เห็นและเลือกแบบ B ไปแล้ว ถ้าอยากให้กลับเป็น "เริ่มเลย" ให้แก้ที่ `PlanCard.jsx` และข้อความ `DeskNote` ใน `Workspace.jsx` แทน แล้วเทสต์จะผ่านโดยไม่ต้องแก้

**Blocked by:** ไม่มี

**Status:** done

เทสต์ในตั๋วนี้ (10 ข้อ):
- `1-new-request`: an employee types a request in new chat, sends it, and gets an Artifact within 2 clicks
- `letterhead`: a finished document shows the ICN logo and company name above its content; a table has no letterhead
- `save-agent-with-steps`: saves one new Agent whose Step count matches the Plan; the new Agent with Steps carries its Step badge; reusing the new Agent starts work straight away; offers no separate "save as Workflow" choice
- `workspace-chat-or-plan`: a multi-Agent request with nothing picked stops at the Plan; a request matched to an Agent with Steps by keyword is still a system Plan; the Plan can be edited (a step removed) before starting

- [x] เทสต์ทั้ง 10 ข้อหาปุ่มด้วยชื่อที่แอปใช้จริง และผ่าน
- [x] ข้อที่เปลี่ยนไปใช้ปุ่มแล้วล้มต่อที่ขั้นอื่น (เช่น ไปหาแถว "ใช้ซ้ำ" หรือแผงขั้นตอน) ให้โอนไปตั๋ว 02 หรือ 05 พร้อมจดไว้ในตั๋วนั้น
- [x] `docs/DESIGN.md` และ `GLOSSARY.md` ใช้คำเดียวกับแอป
- [x] `npx vitest run` ไม่มีข้อไหนล้มเพิ่ม

## Comments

2026-10-26: ทำแล้วโดยเปลี่ยนคำ "เริ่มเลย" เป็น "เริ่มทำงาน" ทุกที่ (25 จุดใน src, test, docs) เทสต์ในตั๋วนี้ผ่าน 8 ข้อ จาก 10 ข้อ:
- 7 ข้อผ่านเพราะเปลี่ยนชื่อปุ่มอย่างเดียว
- ข้อ "a request matched to an Agent with Steps by keyword" ต้องแก้อีกเรื่อง: ปุ่มลบขั้นตอนในการ์ดแผนงานตั้งชื่อตามงานของขั้น (`ลบขั้นตอน <งาน> ออกจากแผน`) ไม่ใช่ชื่อ Agent เทสต์จึงอ่านขั้นตอนจากรายการในการ์ดแผนงานแทน
- อีก 2 ข้อล้มต่อที่แถว "ใช้ซ้ำ" ไม่ใช่เรื่องปุ่ม จึงย้ายไปตั๋ว 02: `save-agent-with-steps` "saves one new Agent whose Step count matches the Plan, shown in the reuse row" และ "reusing the new Agent starts work straight away…"
