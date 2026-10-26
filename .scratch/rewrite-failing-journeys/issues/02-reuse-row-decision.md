# 02: แถว "ใช้ซ้ำ" บนหน้าแรก จะกลับมาหรือเลิกถาวร

**What to build:** หน้าแรกแบบ B มีแค่คำทักทายกับช่องสั่งงานใหญ่ช่องเดียว แถว "ใช้ซ้ำ" (Agent ประจำและ Agent ที่บันทึกไว้ใช้ซ้ำ) ถูกเอาออกพร้อมโค้ด `ReuseRow` เทสต์ 14 ข้อยังคาดหวังแถวนี้ ต้องตัดสินก่อนว่าจะ:

- **เลิกถาวร:** ลบหรือเขียนเทสต์ใหม่ให้ผู้ใช้ไปเจอ Agent ที่ใช้ซ้ำผ่านหน้า AI Agent (ดาว ★ Agent ประจำ และตัวเลือก Agent ในช่องสั่งงาน) แก้ `docs/DESIGN.md` (แถวใช้ซ้ำ, Welcome card, ขั้น "ใช้ซ้ำ" ของทัวร์ใน `components/tour/steps.js`) และ GLOSSARY ("Favourite agent ไม่ได้อยู่บนหน้าแรกแล้ว")
- **กลับมา:** ออกแบบแถวให้เข้ากับหน้าแรกแบบ B (ต้องสั่ง prototype หรือ grill ก่อน) แล้วค่อยปรับเทสต์ตามรูปแบบนั้น

ผู้ตัดสินใจ: เจ้าของโปรเจกต์ ยังไม่ได้ตอบ คำแนะนำของผม: เลิกถาวรก่อน เพราะหน้าแรกที่ว่างตั้งใจทำให้โล่ง และ Agent ประจำยังเลือกได้จากช่อง Agent ในช่องสั่งงาน

**Blocked by:** ไม่มี (เจ้าของตัดสินแล้ว)

**Status:** done

เทสต์ในตั๋วนี้ (14 ข้อ ล้มเพราะหา region "ใช้ซ้ำ" ไม่เจอ):
- `2-reuse` ทั้งไฟล์ 8 ข้อ (กด Favourite เติมช่อง, Agent with Steps เติมช่อง, ส่งแล้วเริ่มทันที ×2, เคลียร์ตัวเลือก, เลือกอันใหม่แทนอันเก่า, บันทึกแล้วขึ้นในแถว, ยังไม่มี Favourite)
- `clean-cards`: starring an Agent from its card adds it to the reuse row
- `nav-and-skills-tab`: the app opens on new chat with the reuse row; an Agent in "ใช้ซ้ำ" is not shown again under "Agent ของแผนกคุณ"
- `save-agent-with-steps`: still saves an Agent without Steps; saves one new Agent whose Step count matches the Plan, shown in the reuse row; reusing the new Agent starts work straight away (สองข้อหลังย้ายมาจากตั๋ว 01 หลังแก้ปุ่มเริ่มแล้วล้มต่อที่แถวนี้)

- [x] ได้คำตอบจากเจ้าของโปรเจกต์ (เลิกถาวร หรือกลับมาแบบไหน) และจดไว้ใต้หัวข้อ `## Comments`
- [x] ถ้าเลิกถาวร: เทสต์ 14 ข้อถูกเขียนใหม่ให้ตรวจเส้นทางที่ใช้จริง หรือลบเมื่อไม่มีที่ใหม่ พร้อมเหตุผลใน commit
- [x] `docs/DESIGN.md`, `GLOSSARY.md` และขั้นของทัวร์ไม่พูดถึงแถวที่ไม่มีแล้ว
- [x] `npx vitest run` ไม่มีข้อไหนล้มเพิ่ม

## Comments

- ตัดสินแล้ว: **เลิกแถว "ใช้ซ้ำ" ถาวร** (เจ้าของโปรเจกต์ตอบ "เลิกแถว ใช้ซ้ำ" หลังผมแนะนำ)
- เส้นทางใหม่ที่เทสต์ตรวจ: เปิดเมนู Agent ในช่องสั่งงานแล้วเลือก Agent (helper `pickAgentFromMenu` ใน `test/journey.jsx`) Agent ที่บันทึกไว้ใช้ซ้ำก็อยู่ในเมนูเดียวกัน
- งบคลิกเปลี่ยนจาก 1 เป็น **2 คลิก** (เปิดเมนู + เลือก) ตามที่ตั๋ว 03 บอกให้จด ไม่ได้ขยับเงียบๆ: แก้ทั้งในเทสต์ `2-reuse` และ `docs/DESIGN.md`
- เทสต์ที่ลบเพราะไม่มีที่ใหม่: "with no Favourites the reuse row says how to get some" (แถวหายไป), "starring an Agent from its card adds it to the reuse row" (`clean-cards`; ดาวยังอยู่ที่หน้า AI Agent), "an Agent in ใช้ซ้ำ is not shown again under Agent ของแผนกคุณ" (`nav-and-skills-tab`) ส่วน "แสดงจำนวนขั้นตอนบนปุ่มในแถว" เหลือตรวจที่การ์ดในหน้า AI Agent ซึ่งมีเทสต์อยู่แล้ว (ป้าย 4 ขั้นตอน)
- ลบโค้ดที่ไม่มีใครเรียกแล้ว: `reuseAgents` ใน `src/lib/reuse.js` (ของแถวใช้ซ้ำ) ขั้นของทัวร์ไม่มีขั้น "ใช้ซ้ำ" แล้วตั้งแต่ก่อนหน้า
- แก้ `docs/DESIGN.md` และ GLOSSARY ("Favourite agent" ไม่อยู่บนหน้าแรกแล้ว)
- เหลือล้ม 4 ข้อ ทั้งหมดอยู่ในตั๋ว 06 และ 07
